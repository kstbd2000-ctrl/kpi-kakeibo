import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import './App.css'

const CATEGORIES = ['食費', '住居費', '交通費', '光熱費', '医療費', '娯楽費', '衣類', 'その他']
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f97316', '#6b7280']
const STORAGE_KEY = 'kpi-kakeibo-data'

function formatYen(amount) {
  return `¥${amount.toLocaleString('ja-JP')}`
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { entries: [], budget: {} }
  } catch {
    return { entries: [], budget: {} }
  }
}

export default function App() {
  const [data, setData] = useState(loadData)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [form, setForm] = useState({
    type: 'expense', amount: '', category: CATEGORIES[0], memo: '',
    date: new Date().toISOString().slice(0, 10)
  })
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()))
  const [budgetInput, setBudgetInput] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const monthEntries = data.entries.filter(e => e.date.startsWith(selectedMonth))
  const totalIncome = monthEntries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
  const totalExpense = monthEntries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
  const balance = totalIncome - totalExpense
  const budget = data.budget[selectedMonth] || 0
  const budgetUsed = budget > 0 ? Math.round((totalExpense / budget) * 100) : null

  const categoryData = CATEGORIES.map((cat, i) => ({
    name: cat,
    value: monthEntries.filter(e => e.type === 'expense' && e.category === cat).reduce((s, e) => s + e.amount, 0),
    color: COLORS[i]
  })).filter(c => c.value > 0)

  const months = [...new Set(data.entries.map(e => e.date.slice(0, 7)))].sort().slice(-6)
  const trendData = months.map(m => ({
    month: m.slice(5) + '月',
    収入: data.entries.filter(e => e.date.startsWith(m) && e.type === 'income').reduce((s, e) => s + e.amount, 0),
    支出: data.entries.filter(e => e.date.startsWith(m) && e.type === 'expense').reduce((s, e) => s + e.amount, 0),
  }))

  function addEntry() {
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) return
    const entry = { ...form, amount: Number(form.amount), id: Date.now() }
    setData(d => ({ ...d, entries: [entry, ...d.entries] }))
    setForm(f => ({ ...f, amount: '', memo: '' }))
    setShowForm(false)
  }

  function deleteEntry(id) {
    setData(d => ({ ...d, entries: d.entries.filter(e => e.id !== id) }))
  }

  function setBudget() {
    const val = Number(budgetInput)
    if (!budgetInput || isNaN(val) || val <= 0) return
    setData(d => ({ ...d, budget: { ...d.budget, [selectedMonth]: val } }))
    setBudgetInput('')
  }

  const availableMonths = [...new Set([selectedMonth, ...data.entries.map(e => e.date.slice(0, 7))])].sort().reverse()

  return (
    <div className="app">
      <header className="app-header">
        <h1>KPI 家計簿</h1>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="month-select">
          {availableMonths.map(m => (
            <option key={m} value={m}>{m.replace('-', '年')}月</option>
          ))}
        </select>
      </header>

      <nav className="tab-nav">
        {[['dashboard', 'ダッシュボード'], ['entries', '明細'], ['charts', 'グラフ']].map(([id, label]) => (
          <button key={id} className={`tab-btn${activeTab === id ? ' active' : ''}`} onClick={() => setActiveTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="kpi-grid">
              <div className="kpi-card income">
                <span className="kpi-label">収入</span>
                <span className="kpi-value">{formatYen(totalIncome)}</span>
              </div>
              <div className="kpi-card expense">
                <span className="kpi-label">支出</span>
                <span className="kpi-value">{formatYen(totalExpense)}</span>
              </div>
              <div className={`kpi-card balance ${balance >= 0 ? 'positive' : 'negative'}`}>
                <span className="kpi-label">収支</span>
                <span className="kpi-value">{formatYen(balance)}</span>
              </div>
            </div>

            {budget > 0 && budgetUsed !== null && (
              <div className="budget-section">
                <div className="budget-header">
                  <span>予算: {formatYen(budget)}</span>
                  <span className={budgetUsed > 100 ? 'over' : ''}>{budgetUsed}%使用</span>
                </div>
                <div className="budget-bar">
                  <div
                    className={`budget-fill${budgetUsed > 100 ? ' over' : budgetUsed > 80 ? ' warn' : ''}`}
                    style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="budget-input-row">
              <input
                type="number" placeholder="今月の予算を設定" value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)} className="budget-input"
              />
              <button onClick={setBudget} className="btn-secondary">設定</button>
            </div>

            {categoryData.length > 0 && (
              <div className="category-list">
                <h3>カテゴリ別支出</h3>
                {categoryData.sort((a, b) => b.value - a.value).map(c => (
                  <div key={c.name} className="category-row">
                    <span className="cat-dot" style={{ background: c.color }} />
                    <span className="cat-name">{c.name}</span>
                    <span className="cat-bar-wrap">
                      <span className="cat-bar" style={{ width: `${(c.value / totalExpense) * 100}%`, background: c.color }} />
                    </span>
                    <span className="cat-amount">{formatYen(c.value)}</span>
                  </div>
                ))}
              </div>
            )}

            {categoryData.length === 0 && (
              <p className="empty">＋ボタンから明細を追加してください</p>
            )}
          </div>
        )}

        {activeTab === 'entries' && (
          <div className="entries">
            <div className="entries-list">
              {monthEntries.length === 0 && <p className="empty">明細がありません</p>}
              {monthEntries.map(e => (
                <div key={e.id} className={`entry-row ${e.type}`}>
                  <div className="entry-info">
                    <span className="entry-category">{e.category}</span>
                    <span className="entry-memo">{e.memo || '—'}</span>
                    <span className="entry-date">{e.date}</span>
                  </div>
                  <span className="entry-amount">
                    {e.type === 'income' ? '+' : '-'}{formatYen(e.amount)}
                  </span>
                  <button className="delete-btn" onClick={() => deleteEntry(e.id)}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="charts">
            {trendData.length > 0 ? (
              <>
                <div className="chart-card">
                  <h3>収支トレンド（棒グラフ）</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#aaa" fontSize={12} />
                      <YAxis stroke="#aaa" fontSize={11} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} />
                      <Tooltip formatter={v => formatYen(v)} contentStyle={{ background: '#1e1e2e', border: '1px solid #444', borderRadius: 8 }} />
                      <Legend />
                      <Bar dataKey="収入" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="支出" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h3>収支推移（折れ線グラフ）</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="month" stroke="#aaa" fontSize={12} />
                      <YAxis stroke="#aaa" fontSize={11} tickFormatter={v => `${(v / 10000).toFixed(0)}万`} />
                      <Tooltip formatter={v => formatYen(v)} contentStyle={{ background: '#1e1e2e', border: '1px solid #444', borderRadius: 8 }} />
                      <Legend />
                      <Line type="monotone" dataKey="収入" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                      <Line type="monotone" dataKey="支出" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <p className="empty">データがありません。明細を追加してください。</p>
            )}

            {categoryData.length > 0 && (
              <div className="chart-card">
                <h3>カテゴリ別支出（円グラフ）</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categoryData} dataKey="value" nameKey="name"
                      cx="50%" cy="50%" outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      {categoryData.map((c, i) => <Cell key={i} fill={c.color} />)}
                    </Pie>
                    <Tooltip formatter={v => formatYen(v)} contentStyle={{ background: '#1e1e2e', border: '1px solid #444', borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </main>

      <button className="fab" onClick={() => setShowForm(true)}>＋</button>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>明細を追加</h2>
            <div className="type-toggle">
              <button
                className={form.type === 'expense' ? 'active' : ''}
                onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
              >支出</button>
              <button
                className={form.type === 'income' ? 'active' : ''}
                onClick={() => setForm(f => ({ ...f, type: 'income' }))}
              >収入</button>
            </div>
            <input
              type="number" placeholder="金額（円）" value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="form-input" autoFocus
            />
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="form-input"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              type="text" placeholder="メモ（任意）" value={form.memo}
              onChange={e => setForm(f => ({ ...f, memo: e.target.value }))}
              className="form-input"
            />
            <input
              type="date" value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="form-input"
            />
            <div className="form-actions">
              <button onClick={() => setShowForm(false)} className="btn-secondary">キャンセル</button>
              <button onClick={addEntry} className="btn-primary">追加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
