import React, { useRef, useState, useEffect } from 'react'

export default function MultiSelect({ options = [], selected = [], onChange, placeholder = 'Select…', maxVisible = 3 }){
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function onDoc(e){
      if(!ref.current) return
      if(!ref.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('click', onDoc)
    return ()=> window.removeEventListener('click', onDoc)
  }, [])

  function toggleOption(id){
    const exists = selected.includes(id)
    const next = exists ? selected.filter(s=>s!==id) : [...selected, id]
    onChange && onChange(next)
  }

  return (
    <div className="multi-select" ref={ref}>
      <button type="button" className="multi-select-toggle" onClick={(e)=>{e.stopPropagation(); setOpen(o=>!o)}}>
        <div className="multi-select-value">
          {selected.length === 0 ? (
            <span className="multi-select-placeholder">{placeholder}</span>
          ) : (
            <div className="multi-select-chips">
              {options.filter(o=>selected.includes(o.id)).slice(0,maxVisible).map(o=> (
                <span className="multi-select-chip" key={o.id}>{o.name}</span>
              ))}
              {selected.length > maxVisible && (
                <span className="multi-select-chip">+{selected.length - maxVisible}</span>
              )}
            </div>
          )}
        </div>
        <div className="multi-select-arrow">▾</div>
      </button>

      {open && (
        <div className="multi-select-dropdown">
          {options.map(opt => (
            <label className="multi-select-item" key={opt.id}>
              <input type="checkbox" checked={selected.includes(opt.id)} onChange={()=>toggleOption(opt.id)} />
              <span className="multi-select-item-label">{opt.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
