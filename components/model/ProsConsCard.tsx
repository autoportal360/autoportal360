'use client'

import { useState } from 'react'

const SHOW = 3

export default function ProsConsCard({
  pros,
  cons,
}: {
  pros: string[]
  cons: string[]
}) {
  const [showAllPros, setShowAllPros] = useState(false)
  const [showAllCons, setShowAllCons] = useState(false)

  return (
    <div className="ap-proscons">
      <div className="ap-proscons-card">
        <div className="ap-proscons-title ap-proscons-pro-title">
          <span>✓</span> Pros
        </div>
        <ul className="ap-proscons-list">
          {(showAllPros ? pros : pros.slice(0, SHOW)).map((p, i) => (
            <li key={i} className="ap-proscons-item">
              <span className="ap-proscons-icon-pro">✓</span>
              {p}
            </li>
          ))}
        </ul>
        {pros.length > SHOW && (
          <button
            onClick={() => setShowAllPros(v => !v)}
            style={{ color: '#00D4FF', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0 2px', marginTop: '2px' }}
          >
            {showAllPros ? '− Show less' : `+ ${pros.length - SHOW} more`}
          </button>
        )}
      </div>

      <div className="ap-proscons-card">
        <div className="ap-proscons-title ap-proscons-con-title">
          <span>✗</span> Cons
        </div>
        <ul className="ap-proscons-list">
          {(showAllCons ? cons : cons.slice(0, SHOW)).map((c, i) => (
            <li key={i} className="ap-proscons-item">
              <span className="ap-proscons-icon-con">✗</span>
              {c}
            </li>
          ))}
        </ul>
        {cons.length > SHOW && (
          <button
            onClick={() => setShowAllCons(v => !v)}
            style={{ color: '#00D4FF', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0 2px', marginTop: '2px' }}
          >
            {showAllCons ? '− Show less' : `+ ${cons.length - SHOW} more`}
          </button>
        )}
      </div>
    </div>
  )
}
