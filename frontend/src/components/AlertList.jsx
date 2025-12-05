import React from 'react'

export default function AlertList({alerts=[]}){
  if(alerts.length === 0) return <div style={{color:'rgba(255,255,255,0.7)'}}>No alerts</div>

  return (
    <div>
      {alerts.map(a => (
        <div key={a.id} style={{padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.03)'}}>
          <div style={{fontWeight:700}}>{a.title}</div>
          <div style={{color:'rgba(255,255,255,0.7)'}}>{a.desc}</div>
        </div>
      ))}
    </div>
  )
}
