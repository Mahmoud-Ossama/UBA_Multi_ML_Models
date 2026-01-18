import React from 'react'

function RiskBadge({risk}){
  if(risk === 'high') return <span className="badge red">High</span>
  if(risk === 'medium') return <span className="badge yellow">Medium</span>
  return <span className="badge green">Low</span>
}

export default function UserList({users=[]}){
  if(users.length === 0) return <div style={{padding:12,color:'rgba(255,255,255,0.7)'}}>No users found</div>

  return (
    <div style={{marginTop:8}}>
      {users.map(u => (
        <div className="user-row" key={u.username}>
          <div style={{display:'flex',flexDirection:'column'}}>
            <div style={{fontWeight:700}}>{u.username}</div>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:13}}>Last activity: {new Date(u.last).toLocaleString()}</div>
          </div>
          <RiskBadge risk={u.risk} />
        </div>
      ))}
    </div>
  )
}
