import React from 'react'

export default function AlertList({alerts=[]}){
  if(alerts.length === 0) return <div style={{color:'rgba(255,255,255,0.7)'}}>No alerts</div>

  return (
    <div style={{maxHeight: '300px', overflowY: 'auto'}}>
      {alerts.slice(0, 20).map((a, idx) => (
        <div key={a.id || idx} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
          <div style={{fontWeight:700, fontSize: '13px', wordBreak: 'break-all'}}>
            {a.url || a.request || a.title || 'Unknown URL'}
          </div>
          <div style={{color:'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '4px'}}>
            {a.desc || (
              <>
                {a.is_anomaly !== undefined && <span>Anomaly: {a.is_anomaly} </span>}
                {a.is_sqli_flag !== undefined && <span>• SQLi: {a.is_sqli_flag} </span>}
                {a.final_alert !== undefined && <span>• Alert: {a.final_alert}</span>}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
