import React, { useRef, useEffect } from 'react'

// For safety we avoid embedding real malicious content. The homepage below
// presents cybersecurity-themed visuals and defensive content only.

export default function Hero({ onStart }){
  const containerRef = useRef(null)
  const threatVideoRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // scroll-in animations using IntersectionObserver
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) ent.target.classList.add('in-view')
      })
    }, {threshold: 0.12})

    el.querySelectorAll('.reveal').forEach(n => obs.observe(n))

    // parallax for floating shapes
    function onMove(e){
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      el.querySelectorAll('.floating').forEach((s, i) => {
        const depth = (i + 1) * 6
        s.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`
      })
    }

    el.addEventListener('mousemove', onMove)
    // ensure any video elements in the hero/sections loop reliably
    const videos = Array.from(el.querySelectorAll('video'))
    const endedHandlers = new Map()
    videos.forEach((vid) => {
      try {
        vid.loop = true
        const h = () => {
          try { vid.currentTime = 0; vid.play().catch(()=>{}); } catch(e){}
        }
        endedHandlers.set(vid, h)
        vid.addEventListener('ended', h)
      } catch(e){}
    })

    return () => {
      el.removeEventListener('mousemove', onMove)
      obs.disconnect()
      // cleanup video ended handlers
      endedHandlers.forEach((h, vid) => {
        try { vid.removeEventListener('ended', h) } catch(e){}
      })
    }
  }, [])

  return (
    <>
      <section className="hero-animated" ref={containerRef}>
    {/* hero background video: using the uploaded local file for immediate preview.
      It's large (UHD). For best results re-encode locally (see instructions below). */}
  <video ref={threatVideoRef} className="hero-video-bg" src="/assets/cyber-loop.mp4" autoPlay muted loop playsInline aria-hidden />
        <div className="code-bg">
          <div className="code-rows" aria-hidden>
            {/* repeated spans create the moving binary/code effect */}
            {Array.from({length:18}).map((_,i)=> (
              <span key={i} className={`code-line line-${i}`}>{Array.from({length:40}).map(()=> Math.random() > 0.6 ? '1' : '0').join('')}</span>
            ))}
          </div>
        </div>

        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-left reveal">
            <div className="kicker">CYBER THREATS · MALWARE · RANSOMWARE</div>
            <h1 className="hero-title">Protect against malicious attacks and dangerous viruses</h1>
            <p className="hero-sub">Cognitive UBA detects anomalous behavior and prioritizes incidents so security teams can respond faster. This demo focuses on defensive detection and remediation, not on exploit methods.</p>

            <div className="cta">
              <button className="btn primary" onClick={onStart}>Open Dashboard</button>
              <button className="btn" onClick={() => document.getElementById('threats')?.scrollIntoView({behavior:'smooth'})}>Learn more</button>
            </div>

            <div className="card-grid hero-cards" style={{marginTop:28}}>
              <div className="card animate-card">
                <h4>Threat Detection</h4>
                <p style={{color:'rgba(255,255,255,0.8)'}}>Identify suspicious patterns and unusual data movement.</p>
              </div>
              <div className="card animate-card">
                <h4>Risk Scoring</h4>
                <p style={{color:'rgba(255,255,255,0.8)'}}>Prioritize alerts using AI-driven risk scores for faster response.</p>
              </div>
              <div className="card animate-card">
                <h4>Investigation</h4>
                <p style={{color:'rgba(255,255,255,0.8)'}}>Contextual event timelines to speed up root-cause analysis.</p>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="floating floating-1" />
            <div className="floating floating-2" />
            <div className="floating floating-3" />
          </div>
        </div>
      </section>

      {/* Security Advice Cards */}
      <section className="security-advice-section">
        <div className="advice-scroll-container">
          <div className="advice-track">
            <div className="advice-card">
              <h4>🔒 Use Strong Passwords</h4>
              <p>Create unique passwords with 12+ characters including numbers, symbols, and mixed case.</p>
            </div>
            <div className="advice-card">
              <h4>🔐 Enable 2FA</h4>
              <p>Two-factor authentication adds an extra security layer to your accounts.</p>
            </div>
            <div className="advice-card">
              <h4>🔄 Update Regularly</h4>
              <p>Keep software and systems updated to patch security vulnerabilities.</p>
            </div>
            <div className="advice-card">
              <h4>📧 Verify Emails</h4>
              <p>Be cautious of phishing attempts. Verify sender addresses before clicking links.</p>
            </div>
            <div className="advice-card">
              <h4>🛡️ Use VPN</h4>
              <p>Secure your internet connection, especially on public Wi-Fi networks.</p>
            </div>
            <div className="advice-card">
              <h4>💾 Backup Data</h4>
              <p>Regular backups protect against ransomware and data loss incidents.</p>
            </div>
            <div className="advice-card">
              <h4>🚫 Limit Access</h4>
              <p>Apply principle of least privilege - grant minimum necessary permissions.</p>
            </div>
            <div className="advice-card">
              <h4>👁️ Monitor Activity</h4>
              <p>Regularly review account activity and logs for suspicious behavior.</p>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="advice-card">
              <h4>🔒 Use Strong Passwords</h4>
              <p>Create unique passwords with 12+ characters including numbers, symbols, and mixed case.</p>
            </div>
            <div className="advice-card">
              <h4>🔐 Enable 2FA</h4>
              <p>Two-factor authentication adds an extra security layer to your accounts.</p>
            </div>
            <div className="advice-card">
              <h4>🔄 Update Regularly</h4>
              <p>Keep software and systems updated to patch security vulnerabilities.</p>
            </div>
            <div className="advice-card">
              <h4>📧 Verify Emails</h4>
              <p>Be cautious of phishing attempts. Verify sender addresses before clicking links.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

