import React, { useMemo, useState, useEffect } from 'react'
import { load, save, currency, monthKey } from '../utils'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const DEFAULT_CATS = [
  { key:'rent', name:'Rent', budget: 800 },
  { key:'food', name:'Food/Grocery', budget: 250 },
  { key:'phone', name:'Phone Bill', budget: 73.79 },
  { key:'transport', name:'Transport', budget: 80 },
  { key:'gym', name:'Gym', budget: 39 },
  { key:'restaurants', name:'Restaurants', budget: 60 },
  { key:'other', name:'Other', budget: 100 },
]

const DEFAULT_RECUR = [
  { key:'rent', name:'Rent', amount: 380 },
  { key:'phone', name:'Vodafone Phone', amount: 73.79 },
  { key:'gym', name:'Gym', amount: 39 },
]

export default function Finance(){
  const [cats, setCats] = useState(load('finance.cats', DEFAULT_CATS))
  const [spend, setSpend] = useState(load('finance.spend', {}))
  const [recurring, setRecurring] = useState(load('finance.recurring', DEFAULT_RECUR))
  const [history, setHistory] = useState(load('finance.history', []))
  const [appliedMonth, setAppliedMonth] = useState(load('finance.appliedMonth', ''))
  const [editing, setEditing] = useState(false)
  const [newRec, setNewRec] = useState({ key:'', name:'', amount:'' })

  const thisMonth = monthKey()

  useEffect(()=> save('finance.cats', cats), [cats])
  useEffect(()=> save('finance.spend', spend), [spend])
  useEffect(()=> save('finance.recurring', recurring), [recurring])
  useEffect(()=> save('finance.history', history), [history])
  useEffect(()=> save('finance.appliedMonth', appliedMonth), [appliedMonth])

  const addAmount = (key, amt) => {
    const value = Number(amt) || 0
    if (!value) return
    setSpend(s => ({...s, [key]: Number(s[key]||0) + value}))
  }
  const clearMonth = () => setSpend({})

  const totalSpend = useMemo(()=> Object.values(spend).reduce((a,b)=>a+Number(b||0),0), [spend])
  const totalBudget = useMemo(()=> cats.reduce((a,c)=>a+c.budget,0), [cats])

  const needsApply = appliedMonth !== thisMonth
  const applyRecurring = () => {
    const updates = {...spend}
    recurring.forEach(r => { updates[r.key] = Number(updates[r.key]||0) + Number(r.amount||0) })
    setSpend(updates)
    setAppliedMonth(thisMonth)
  }

  const closeMonth = () => {
    setHistory(h => [...h, { month: thisMonth, total: totalSpend }])
    setSpend({})
    setAppliedMonth('')
  }

  const spark = useMemo(()=>{
    const arr = []
    let acc = 0
    for(let i=1;i<=10;i++){
      acc += Math.max(0, (totalSpend/10) + (Math.sin(i)*15))
      arr.push({name: i, value: Math.round(acc/10)})
    }
    return arr
  }, [totalSpend])

  const removeRec = (idx) => setRecurring(recurring.filter((_,i)=>i!==idx))
  const addRec = () => {
    if(!newRec.key) newRec.key = newRec.name.toLowerCase().replace(/\s+/g,'-').slice(0,12)
    const amt = Number(newRec.amount||0)
    if(!newRec.name || !amt) return
    setRecurring(r => [...r, { key:newRec.key, name:newRec.name, amount:amt }])
    setNewRec({ key:'', name:'', amount:'' })
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        {needsApply && (
          <div className="card border-2 border-amber-500/40">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>Recurring bills for <strong>{thisMonth}</strong> haven’t been added.</div>
              <button className="btn" onClick={applyRecurring}>Apply recurring</button>
            </div>
          </div>
        )}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Quick add — {thisMonth}</h2>
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600" onClick={closeMonth}>Close month</button>
              <button className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600" onClick={clearMonth}>Clear month</button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map(c => {
              const used = Number(spend[c.key]||0)
              const pct = Math.min(100, Math.round((used/c.budget)*100))
              return (
                <div key={c.key} className="rounded-2xl p-4 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{c.name}</h3>
                    <span className="text-xs badge">{currency(used)} / {currency(c.budget)}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input type="number" min="0" step="1" placeholder="£"
                      className="w-full rounded-xl px-3 py-2 border border-slate-700"
                      onKeyDown={(e)=>{ if(e.key==='Enter') addAmount(c.key, e.currentTarget.value); }}
                    />
                    <button className="btn" onClick={(e)=>{
                      const input = e.currentTarget.previousSibling
                      addAmount(c.key, input.value)
                      input.value = ''
                    }}>Add</button>
                  </div>
                  <div className="progress mt-3"><span style={{width: pct+'%', backgroundColor: pct>100?'#ef4444':'#10b981'}}/></div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-2">Totals</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl p-4 bg-slate-800 border border-slate-700">
              <div className="text-slate-400 text-sm">Total spend</div>
              <div className="text-2xl font-semibold">{currency(totalSpend)}</div>
            </div>
            <div className="rounded-xl p-4 bg-slate-800 border border-slate-700">
              <div className="text-slate-400 text-sm">Total budget</div>
              <div className="text-2xl font-semibold">{currency(totalBudget)}</div>
            </div>
            <div className="rounded-xl p-4 bg-slate-800 border border-slate-700">
              <div className="text-slate-400 text-sm">Remaining</div>
              <div className="text-2xl font-semibold">{currency(totalBudget - totalSpend)}</div>
            </div>
          </div>

          <div className="mt-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="value" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="card">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Recurring bills</h3>
            <button className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600" onClick={()=>setEditing(!editing)}>{editing?'Done':'Edit'}</button>
          </div>
          {!editing ? (
            <ul className="mt-2 space-y-2">
              {recurring.map((r,i)=>(
                <li key={i} className="flex items-center justify-between">
                  <span>{r.name}</span>
                  <span className="badge">{currency(r.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 space-y-3">
              {recurring.map((r,i)=>(
                <div key={i} className="grid grid-cols-5 gap-2 items-center">
                  <input className="col-span-2 rounded-xl px-3 py-2 border border-slate-700" value={r.name} onChange={e=>{
                    const copy=[...recurring]; copy[i]={...copy[i], name:e.target.value}; setRecurring(copy)
                  }}/>
                  <input type="text" className="rounded-xl px-3 py-2 border border-slate-700" value={r.key} onChange={e=>{
                    const copy=[...recurring]; copy[i]={...copy[i], key:e.target.value}; setRecurring(copy)
                  }}/>
                  <input type="number" className="rounded-xl px-3 py-2 border border-slate-700" value={r.amount} onChange={e=>{
                    const copy=[...recurring]; copy[i]={...copy[i], amount:Number(e.target.value||0)}; setRecurring(copy)
                  }}/>
                  <button className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700" onClick={()=>removeRec(i)}>Delete</button>
                </div>
              ))}
              <div className="grid grid-cols-5 gap-2 items-center">
                <input className="col-span-2 rounded-xl px-3 py-2 border border-slate-700" placeholder="Name" value={newRec.name} onChange={e=>setNewRec({...newRec, name:e.target.value})}/>
                <input className="rounded-xl px-3 py-2 border border-slate-700" placeholder="Key" value={newRec.key} onChange={e=>setNewRec({...newRec, key:e.target.value})}/>
                <input type="number" className="rounded-xl px-3 py-2 border border-slate-700" placeholder="Amount" value={newRec.amount} onChange={e=>setNewRec({...newRec, amount:e.target.value})}/>
                <button className="btn" onClick={addRec}>Add</button>
              </div>
            </div>
          )}
        </div>
        <div className="card">
          <h3 className="text-xl font-semibold">Budget health</h3>
          <p className="text-slate-300 mt-2">You're using <strong>{Math.round((totalSpend/totalBudget)*100 || 0)}%</strong> of the monthly budget.</p>
        </div>
      </div>
    </div>
  )
}
