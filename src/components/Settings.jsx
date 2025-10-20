import React, { useMemo } from 'react'
import { load } from '../utils'

function toCSV(rows){
  if(!rows.length) return ''
  const headers = Object.keys(rows[0])
  const esc = v => String(v).replaceAll('"','""')
  const lines = [headers.join(',')]
  rows.forEach(r => lines.push(headers.map(h=>`"${esc(r[h])}"`).join(',')))
  return lines.join('\n')
}

function makeDataURICSV(filename, rows){
  const csv = toCSV(rows)
  const blob = new Blob([csv], {type:'text/csv'})
  return URL.createObjectURL(blob)
}

export default function Settings(){
  const financeHistory = load('finance.history', []) // [{month,total}]
  const spend = load('finance.spend', {})
  const savingsHistory = load('savings.history', []) // [{date,balance}]
  const healthHistory = load('health.history', []) // [{date,weight,sleep}]
  const dietDays = load('diet.days', {}) // {date: {entries, calories, protein}}

  const financeRows = useMemo(()=> financeHistory.map(h=>({month:h.month, total:h.total})), [financeHistory])
  const savingsRows = useMemo(()=> savingsHistory.map(h=>({date:h.date, balance:h.balance})), [savingsHistory])
  const healthRows = useMemo(()=> healthHistory.map(h=>({date:h.date, weight:h.weight, sleep:h.sleep})), [healthHistory])
  const dietRows = useMemo(()=> {
    const rows=[]
    Object.entries(dietDays).forEach(([date, d])=>{
      rows.push({date, calories:d.calories, protein:d.protein})
      d.entries.forEach((e,idx)=> rows.push({date, item:e.name, qty:e.qty||'', calories:e.cal, protein:e.pro}))
    })
    return rows
  }, [dietDays])

  const financeURL = useMemo(()=> makeDataURICSV('finance.csv', financeRows), [financeRows])
  const savingsURL = useMemo(()=> makeDataURICSV('savings.csv', savingsRows), [savingsRows])
  const healthURL = useMemo(()=> makeDataURICSV('health.csv', healthRows), [healthRows])
  const dietURL = useMemo(()=> makeDataURICSV('diet.csv', dietRows), [dietRows])

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-2xl font-semibold mb-3">Export data (CSV)</h2>
        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <span>Finance — monthly totals</span>
            <a className="btn" href={financeURL} download="finance.csv">Download</a>
          </li>
          <li className="flex items-center justify-between">
            <span>Savings — emergency fund snapshots</span>
            <a className="btn" href={savingsURL} download="savings.csv">Download</a>
          </li>
          <li className="flex items-center justify-between">
            <span>Health — weight & sleep</span>
            <a className="btn" href={healthURL} download="health.csv">Download</a>
          </li>
          <li className="flex items-center justify-between">
            <span>Diet — daily totals & entries</span>
            <a className="btn" href={dietURL} download="diet.csv">Download</a>
          </li>
        </ul>
        <p className="mt-4 text-sm text-slate-400">Tip: open CSV in Excel/Google Sheets for deeper analysis.</p>
      </div>
      <div className="card">
        <h3 className="text-xl font-semibold mb-2">About exports</h3>
        <ul className="list-disc ml-5 text-slate-300 space-y-1">
          <li>All data is pulled from localStorage.</li>
          <li>Download links are generated on the fly in your browser.</li>
          <li>No data leaves your machine.</li>
        </ul>
      </div>
    </div>
  )
}
