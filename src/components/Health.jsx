import React, { useState, useEffect } from 'react'
import { load, save, todayKey } from '../utils'

export default function Health(){
  const [history, setHistory] = useState(load('health.history', []))
  const [entry, setEntry] = useState({ date: todayKey(), weight: '', sleep: '' })

  useEffect(()=> save('health.history', history), [history])

  const add = () => {
    setHistory(h => [...h, { ...entry, weight: Number(entry.weight||0), sleep: Number(entry.sleep||0) }])
    setEntry({ date: todayKey(), weight: '', sleep: '' })
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-2xl font-semibold">Health log</h2>
      <div className="grid sm:grid-cols-3 gap-3">
        <label className="block">
          <span className="text-sm text-slate-400">Date</span>
          <input type="date" className="mt-1 w-full rounded-xl px-3 py-2 border border-slate-700"
            value={entry.date} onChange={e=>setEntry({...entry, date:e.target.value})} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Weight (kg)</span>
          <input type="number" className="mt-1 w-full rounded-xl px-3 py-2 border border-slate-700"
            value={entry.weight} onChange={e=>setEntry({...entry, weight:e.target.value})} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-400">Sleep (hrs)</span>
          <input type="number" className="mt-1 w-full rounded-xl px-3 py-2 border border-slate-700"
            value={entry.sleep} onChange={e=>setEntry({...entry, sleep:e.target.value})} />
        </label>
      </div>
      <div className="space-x-2">
        <button className="btn" onClick={add}>Add</button>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        {history.slice().reverse().map((h,i)=>(
          <li key={i}>{h.date} — {h.weight} kg, {h.sleep} hrs</li>
        ))}
      </ul>
    </div>
  )
}
