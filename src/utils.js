export const load = (k, v) => { try { return JSON.parse(localStorage.getItem(k)) ?? v } catch { return v } }
export const save = (k, v) => localStorage.setItem(k, JSON.stringify(v))
export const currency = (n=0) => `£${Number(n).toFixed(2)}`
export const todayKey = () => new Date().toISOString().slice(0,10)
export const monthKey = (d=new Date()) => d.toISOString().slice(0,7)
