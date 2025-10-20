import React from 'react'
import { load } from '../utils'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts'

export default function Trends(){
  const spendHistory = load('finance.history', []) // [{month, total}]
  const savingsHistory = load('savings.history', []) // [{date,balance}]
  const healthHistory = load('health.history', []) // [{date, weight, sleep}]
  const dietDays = load('diet.days', {}) // {date: {calories, protein}}

  const spendData = spendHistory.map(h => ({ name: h.month, value: h.total }))
  const savingsData = savingsHistory.map(h => ({ name: h.date, value: h.balance }))
  const weightData = healthHistory.map(h => ({ name: h.date, value: h.weight || 0 }))
  const sleepData = healthHistory.map(h => ({ name: h.date, value: h.sleep || 0 }))
  const caloriesData = Object.entries(dietDays).map(([date, v]) => ({ name: date, value: v.calories||0 }))

  const ChartBox = ({title, data, area}) => (
    <div className="card">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          {area ? (
            <AreaChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Area type="monotone" dataKey="value" fillOpacity={0.4} />
            </AreaChart>
          ) : (
            <LineChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" />
              <Line type="monotone" dataKey="value" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <ChartBox title="Spend per month" data={spendData} area />
      <ChartBox title="Savings growth" data={savingsData} area />
      <ChartBox title="Weight trend" data={weightData} />
      <ChartBox title="Sleep trend" data={sleepData} />
      <ChartBox title="Daily calories" data={caloriesData} area />
    </div>
  )
}
