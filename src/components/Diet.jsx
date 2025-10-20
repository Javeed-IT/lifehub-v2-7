import React, { useEffect, useMemo, useState } from 'react'
import { load, save, todayKey } from '../utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

// Expanded nutrition dictionary (approximate, per 100g unless noted)
const DB = {
  "chicken breast": { cal:165, pro:31, unit:"100g" },
  "rice cooked": { cal:130, pro:2.7, unit:"100g" },
  "brown rice cooked": { cal:123, pro:2.6, unit:"100g" },
  "egg": { cal:78, pro:6, unit:"1" },
  "banana": { cal:105, pro:1.3, unit:"1" },
  "apple": { cal:95, pro:0.5, unit:"1" },
  "oats": { cal:389, pro:17, unit:"100g" },
  "milk": { cal:42, pro:3.4, unit:"100ml" },
  "yogurt": { cal:59, pro:10, unit:"100g" },
  "greek yogurt": { cal:97, pro:9, unit:"100g" },
  "salmon": { cal:208, pro:20, unit:"100g" },
  "broccoli": { cal:55, pro:3.7, unit:"100g" },
  "bread slice": { cal:79, pro:3.5, unit:"1" },
  "butter": { cal:717, pro:0.9, unit:"100g" },
  "peanut butter": { cal:588, pro:25, unit:"100g" },
  "protein shake": { cal:120, pro:24, unit:"1" },
  "pasta cooked": { cal:157, pro:5.8, unit:"100g" },
  "potato boiled": { cal:87, pro:1.9, unit:"100g" },
  "chickpeas cooked": { cal:164, pro:8.9, unit:"100g" },
  "lentils cooked": { cal:116, pro:9, unit:"100g" },
  "tofu firm": { cal:144, pro:17, unit:"100g" },
  "paneer": { cal:296, pro:18, unit:"100g" },
  "curd": { cal:98, pro:11, unit:"100g" },
  "spinach": { cal:23, pro:2.9, unit:"100g" },
  "beef lean": { cal:250, pro:26, unit:"100g" },
  "mutton": { cal:294, pro:25, unit:"100g" },
  "turkey breast": { cal:135, pro:29, unit:"100g" },
  "prawns": { cal:99, pro:24, unit:"100g" }
}

// Simple fuzzy similarity score
function score(a, b){
  a=a.toLowerCase(); b=b.toLowerCase()
  if(a===b) return 100
  if(b.includes(a) || a.includes(b)) return 90
  const at = a.split(/\s+/), bt=b.split(/\s+/)
  const overlap = at.filter(t=>bt.includes(t)).length
  return overlap*20 - Math.abs(a.length-b.length)*0.5
}

function bestMatch(item){
  let bestKey=null, best=-1
  for(const k of Object.keys(DB)){
    const s=score(k, item)
    if(s>best){best=s; bestKey=k}
  }
  return bestKey
}

function estimate(item, qty){
  const key = bestMatch(item)
  if(!key){ return { cal: 0, pro: 0, note: 'Unknown item' } }
  const base = DB[key]
  let factor = 1
  if(base.unit === '1'){
    factor = qty || 1
  } else if(base.unit === '100g' || base.unit==='100ml'){
    factor = (qty || 100)/100
  }
  return { cal: Math.round(base.cal * factor), pro: +(base.pro * factor).toFixed(1), note: key }
}

export default function Diet(){
  const [date, setDate] = useState(todayKey())
  const [item, setItem] = useState('')
  const [qty, setQty] = useState('')
  const [days, setDays] = useState(load('diet.days', {}))

  useEffect(()=> save('diet.days', days), [days])

  const add = () => {
    const q = Number(qty || 0)
    const est = estimate(item, q)
    const entry = { name: item, qty: q || null, cal: est.cal, pro: est.pro, match: est.note }
    const d = days[date] || { entries: [], calories: 0, protein: 0 }
    d.entries.push(entry)
    d.calories += entry.cal
    d.protein = +(d.protein + entry.pro).toFixed(1)
    setDays({ ...days, [date]: d })
    setItem(''); setQty('')
  }

  const list = (days[date]?.entries || []).slice().reverse()

  const chartData = useMemo(()=> {
    const dates = Array.from({length: 14}).map((_,i)=>{
      const d = new Date(); d.setDate(d.getDate() - (13 - i))
      const key = d.toISOString().slice(0,10)
      return { name: key.slice(5), value: days[key]?.calories || 0 }
    })
    return dates
  }, [days])

  const totals = days[date] || { calories:0, protein:0 }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card space-y-4">
        <h2 className="text-2xl font-semibold">Diet — calorie & protein estimator</h2>
        <div className="grid sm:grid-cols-4 gap-3">
          <label className="block sm:col-span-2">
            <span className="text-sm text-slate-400">Food item</span>
            <input className="mt-1 w-full rounded-xl px-3 py-2 border border-slate-700"
              placeholder="e.g., chicken breast 200g"
              value={item} onChange={e=>setItem(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-slate-400">Qty (g/ml or pcs)</span>
            <input type="number" className="mt-1 w-full rounded-xl px-3 py-2 border border-slate-700"
              value={qty} onChange={e=>setQty(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-slate-400">Date</span>
            <input type="date" className="mt-1 w-full rounded-xl px-3 py-2 border border-slate-700"
              value={date} onChange={e=>setDate(e.target.value)} />
          </label>
        </div>
        <div className="space-x-2">
          <button className="btn" onClick={add}>Add meal</button>
        </div>
        <div className="rounded-xl p-4 bg-slate-800 border border-slate-700">
          <div className="text-slate-400 text-sm">Today's total</div>
          <div className="text-xl font-semibold">{totals.calories} kcal · {totals.protein} g protein</div>
        </div>
        <ul className="text-sm text-slate-300 space-y-2">
          {list.map((e,i)=>(
            <li key={i}>• {e.name} {e.qty? `(${e.qty})` : ''} — {e.cal} kcal, {e.pro} g protein {e.match? `(~${e.match})`:''}</li>
          ))}
          {list.length===0 && <li>No entries yet for this date.</li>}
        </ul>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold mb-3">Calories (last 14 days)</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="value" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
