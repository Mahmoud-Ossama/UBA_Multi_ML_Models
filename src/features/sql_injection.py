"""SQL Injection Feature Engineering Module

This module contains feature extraction logic for SQL injection detection.
Used by both training notebooks and the inference pipeline.
"""

import re
import pandas as pd
from urllib.parse import urlparse, unquote_plus


# SQL Injection Detection Patterns
SQL_KEYWORDS = [
    r"\bselect\b", r"\binsert\b", r"\bupdate\b", r"\bdelete\b",
    r"\bdrop\b", r"\bunion\b", r"\bbenchmark\b", r"\bsleep\b",
    r"\bshutdown\b", r"\bconcat\b", r"\bload_file\b", r"\bexec\b", r"\bxp_cmdshell\b"
]

SQL_META_CHARS = ["--", ";", "/*", "*/", "'", '"', "%27", "%22", "|", "\\"]

SQL_SUSPICIOUS_PATTERNS = [
    r"or\s+1\s*=\s*1",
    r"or\s+'1'\s*=\s*'1'",
    r"union\s+select",
    r"sleep\s*\(",
    r"benchmark\s*\(",
    r"0x[0-9a-fA-F]+",
    r"load_file\s*\(",
]

# Compile regex patterns
SQL_KEYWORDS_RE = re.compile("|".join(SQL_KEYWORDS), flags=re.IGNORECASE)
SQL_META_RE = re.compile("|".join(re.escape(s) for s in SQL_META_CHARS))
SQL_SUSPICIOUS_RE = re.compile("|".join(SQL_SUSPICIOUS_PATTERNS), flags=re.IGNORECASE)


def detect_sql_in_url(url: str) -> dict:
    """
    Extract SQL injection features from a URL.
    
    Args:
        url: URL string to analyze
        
    Returns:
        Dictionary with extracted features
    """
    features = {
        "has_sql_keyword": 0,
        "sql_keyword_count": 0,
        "has_sql_meta": 0,
        "suspicious_param_pattern": 0,
        "sql_payload_length": 0
    }
    
    if not isinstance(url, str) or url.strip() == "":
        return features
    
    try:
        u = unquote_plus(url)
    except Exception:
        u = url
    
    try:
        parsed = urlparse(u)
        path_query = (parsed.path or "") + ("?" + parsed.query if parsed.query else "")
    except Exception:
        path_query = u
    
    # Check for SQL keywords
    kw = SQL_KEYWORDS_RE.findall(path_query)
    if kw:
        features["has_sql_keyword"] = 1
        features["sql_keyword_count"] = len(kw)
    
    # Check for SQL meta characters
    if SQL_META_RE.search(path_query):
        features["has_sql_meta"] = 1
    
    # Check for suspicious patterns
    if SQL_SUSPICIOUS_RE.search(path_query):
        features["suspicious_param_pattern"] = 1
    
    # Calculate payload length
    qlen = len(parsed.query) if 'parsed' in locals() and getattr(parsed, "query", None) else len(path_query)
    features["sql_payload_length"] = qlen
    
    return features


def prepare_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare DataFrame with standard columns for SQL injection detection.
    Auto-detects and renames common column names.
    
    Args:
        df: Input DataFrame
        
    Returns:
        DataFrame with standardized columns
    """
    df = df.copy()
    
    # Auto-detect URL column
    if 'url' not in df.columns:
        for c in ['request', 'uri', 'request_url', 'raw_request', 'http_request', 'URL', 'Request']:
            if c in df.columns:
                df['url'] = df[c].astype(str)
                break
    
    # Auto-detect timestamp column
    if 'timestamp' not in df.columns:
        for c in ['time', 'datetime', 'date', 'ts']:
            if c in df.columns:
                df['timestamp'] = pd.to_datetime(df[c], errors='coerce')
                break
    
    # Auto-detect user/IP column
    if 'user' not in df.columns:
        for c in ['src_ip', 'client_ip', 'ip', 'host', 'username', 'User-Agent']:
            if c in df.columns:
                df['user'] = df[c].astype(str)
                break
    
    # Clean and decode URL
    df['url'] = df.get('url', '').fillna('').astype(str).apply(lambda x: unquote_plus(x))
    df['timestamp'] = pd.to_datetime(df.get('timestamp', pd.NaT), errors='coerce')
    
    return df


def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extract all SQL injection features from DataFrame.
    
    Args:
        df: Input DataFrame with 'url' column
        
    Returns:
        DataFrame with extracted features
    """
    # Prepare dataframe
    df = prepare_dataframe(df)
    
    # Extract SQL injection features
    feats = df['url'].fillna('').apply(detect_sql_in_url).apply(pd.Series)
    df = pd.concat([df.reset_index(drop=True), feats.reset_index(drop=True)], axis=1)
    
    # Create rule-based flag
    df['is_sqli_flag'] = ((df['has_sql_keyword'] == 1) |
                          (df['suspicious_param_pattern'] == 1) |
                          (df['has_sql_meta'] == 1)).astype(int)
    
    # Calculate temporal features (60-minute rolling window per user)
    try:
        df = df.sort_values('timestamp').reset_index(drop=True)
        df_idx = df.set_index('timestamp')
        df_idx['sqli_count_60min_user'] = df_idx.groupby('user')['is_sqli_flag'].rolling('60min').sum().reset_index(0, drop=True)
        df = df_idx.reset_index()
    except Exception:
        df['sqli_count_60min_user'] = 0
    
    return df
