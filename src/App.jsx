import React, { useState } from 'react'
import Finance from './components/Finance.jsx'
import EmergencyFund from './components/EmergencyFund.jsx'
import Trends from './components/Trends.jsx'
import Diet from './components/Diet.jsx'
import Health from './components/Health.jsx'
import Settings from './components/Settings.jsx'

const TABS = ['Home','Finance','Trends','Diet','Health','Settings']

export default function App(){
  const [tab, setTab] = useState('Finance')
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-gradient-to-r from-brand-700 via-fuchsia-700 to-indigo-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 grid place-items-center">🌟</div>
            <div>
              <div className="text-xl font-bold">LifeHub — Javeed</div>
              <div className="text-xs text-white/70">v2.7 · Budgets + Trends + Diet</div>
            </div>
          </div>
          <button className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20">Light mode</button>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-3">
          <nav className="flex flex-wrap gap-2">
            {TABS.map(t => (
              <button key={t} className={'tab ' + (tab===t?'tab-active':'')} onClick={()=>setTab(t)}>{t}</button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {tab==='Finance' && <Finance />}
        {tab==='Trends' && <Trends />}
        {tab==='Diet' && <Diet />}
        {tab==='Health' && <Health />}
        {tab==='Settings' && <Settings />}
        <EmergencyFund />
      </main>
    </div>
  )
}
