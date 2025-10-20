import React, { useEffect, useMemo, useState } from 'react'
import { load, save, currency, todayKey } from '../utils'

function monthFromDateStr(s){
  return (s||'').slice(0,7)
}

export default function EmergencyFund(){
  const [state, setState] = useState(load('emergencyFund', {
    balance: 0,
    baseline: 2000,
    monthsTarget: 6,
    monthlyExpenses: 5100
  }))
  const [history, setHistory] = useState(load('savings.history', []))

  useEffect(()=> save('emergencyFund', state), [state])
  useEffect(()=> save('savings.history', history), [history])

  // Auto log monthly snapshot once per month
  useEffect(()=>{
    const nowM = monthFromDateStr(todayKey())
    const lastM = history.length ? monthFromDateStr(history[history.length-1].date) : ""
    if(nowM !== lastM){
      setHistory(h => [...h, { date: todayKey(), balance: Number(state.balance)||0 }])
    }
  }, []) // run once on mount

  const target = useMemo(()=> Math.max(state.baseline, state.monthlyExpenses * state.monthsTarget), [state])
  const pct = Math.min(100, Math.round((state.balance/target)*100 || 0))

  const applyNumber = (k, v) => setState(s => ({...s, [k]: Number(v) || 0}))
  const clear = () => setState(s => ({...s, balance: 0}))
  const logSnapshot = () => setHistory(h => [...h, { date: todayKey(), balance: Number(state.balance)||0 }])

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-semibold">Emergency Fund</h2>
        <div className="flex items-center gap-3">
          <span className="badge">Six months target: <strong>{currency(target)}</strong></span>
          <button className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600" onClick={logSnapshot}>Log snapshot</button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-slate-400">Current Balance</span>
          <input className="mt-1 w-full rounded-xl px-3 py-2 border border-slate-700"
            value={state.balance}
            onChange={(e)=>applyNumber('balance', e.target.value)}
            type="number" min="0" step="50" />
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">Baseline (minimum)</span>
          <input className="mt-1 w-full rounded-xl px-3 py-2 border border-slate-700"
            value={state.baseline}
            onChange={(e)=>applyNumber('baseline', e.target.value)}
            type="number" min="0" step="50" />
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">Avg Monthly Expenses</span>
          <input className="mt-1 w-full rounded-xl px-3 py-2 border border-slate-700"
            value={state.monthlyExpenses}
            onChange={(e)=>applyNumber('monthlyExpenses', e.target.value)}
            type="number" min="0" step="50" />
        </label>

        <label className="block">
          <span className="text-sm text-slate-400">Target Months</span>
          <input className="mt-1 w-full rounded-xl px-3 py-2 border border-slate-700"
            value={state.monthsTarget}
            onChange={(e)=>applyNumber('monthsTarget', e.target.value)}
            type="number" min="1" max="12" step="1" />
        </label>
      </div>

      <div className="space-x-3">
        <button className="btn" onClick={()=>save('emergencyFund', state)}>Apply</button>
        <button className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600" onClick={clear}>Clear</button>
      </div>

      <div className="progress"><span style={{width: pct + '%'}}></span></div>
      <p className="text-slate-300">{currency(state.balance)} / {currency(target)} ({pct}%)</p>
    </div>
  )
}
