import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";

const EXP_CATS = ["食費","交通費","住居費","光熱費","娯楽","医療","衣服","通信費","教育","その他"];
const INC_CATS = ["給与","副業","ボーナス","投資","その他"];
const PIE_COLS = ["#7aab8a","#c9a55a","#9b8ec4","#e8956b","#d4829a","#70b5c8","#c5a87a","#8bbfa8","#b8a070","#a8b0c0"];
const DAYS = ["日","月","火","水","木","金","土"];

const fmt = (n) => `¥${Math.round(n).toLocaleString()}`;
const uid = () => Math.random().toString(36).slice(2, 9);
const todayStr = () => new Date().toISOString().slice(0, 10);

const sGet = async (k) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
};
const sSet = async (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};

const BG       = "#faf8f5";
const CARD     = "#ffffff";
const BORDER   = "#ede8e0";
const BORDER_L = "#f4f0ea";
const TEXT     = "#2a201a";
const SUB      = "#8a7060";
const MUTED    = "#b5a898";
const GOLD     = "#c9a55a";
const GOLD_L   = "#fdf6e8";
const GOLD_G   = "linear-gradient(135deg,#d4b06a,#c9a55a,#b8903e)";
const SAGE     = "#7aab8a";
const SAGE_L   = "#eef5f1";
const ROSE     = "#c97080";
const ROSE_L   = "#fceef0";
const SHADOW_SM = "0 1px 6px rgba(160,120,80,0.07)";

function GoldHeader({ year, month, onPrev, onNext }) {
  const btnStyle = {
    background: "rgba(255,255,255,0.22)", border: "none", borderRadius: 8,
    color: "white", width: 34, height: 34, cursor: "pointer", fontSize: 20,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
  return (
    <div style={{ background: GOLD_G, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 12px rgba(160,120,60,0.2)" }}>
      <button onClick={onPrev} style={btnStyle}>‹</button>
      <div style={{ fontSize: 17, fontWeight: 600, color: "white", letterSpacing: 1, fontFamily: "Georgia,serif" }}>
        {year}年{String(month + 1).padStart(2, "0")}月
      </div>
      <button onClick={onNext} style={btnStyle}>›</button>
    </div>
  );
}

function Card({ children, style }) {
  const base = {
    background: CARD, borderRadius: 18, padding: 0, marginBottom: 10,
    boxShadow: SHADOW_SM, border: `1px solid ${BORDER_L}`, overflow: "hidden",
  };
  return <div style={{ ...base, ...style }}>{children}</div>;
}

function ListRow({ label, children, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: last ? "none" : `1px solid ${BORDER_L}`, minHeight: 50 }}>
      <span style={{ fontSize: 15, color: TEXT, flex: "0 0 90px" }}>{label}</span>
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center" }}>{children}</div>
    </div>
  );
}

function Splash() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100svh", background: BG, fontFamily: "Georgia,serif" }}>
      <div style={{ fontSize: 11, letterSpacing: 5, color: GOLD, fontWeight: 600 }}>KPI 家 計 簿</div>
      <div style={{ width: 32, height: 1, background: GOLD, margin: "10px auto", opacity: 0.5 }} />
    </div>
  );
}

function Setup({ onSave }) {
  const [annualIncome, setAnnualIncome] = useState("");
  const [monthlyTakeHome, setMonthlyTakeHome] = useState("");
  const submit = () => {
    if (!annualIncome || !monthlyTakeHome) return alert("年収と手取り月収を入力してください");
    onSave({ annualIncome: +annualIncome, monthlyTakeHome: +monthlyTakeHome });
  };
  const inputStyle = { border: "none", outline: "none", background: "transparent", color: SUB, fontSize: 15, textAlign: "right", fontFamily: "inherit", width: "100%" };
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100svh", background: BG, color: TEXT, padding: "60px 20px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 20, fontFamily: "-apple-system,sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 5, color: GOLD, fontWeight: 600, marginBottom: 10 }}>PERSONAL FINANCE</div>
        <div style={{ fontSize: 28, fontWeight: 300, fontFamily: "Georgia,serif" }}>KPI 家計簿</div>
        <div style={{ width: 32, height: 1, background: GOLD, margin: "12px auto", opacity: 0.7 }} />
        <div style={{ color: SUB, fontSize: 13, lineHeight: 1.8 }}>5年後の目標から逆算して<br />今日を設計しよう</div>
      </div>
      <Card>
        <ListRow label="年収（円）">
          <input type="number" placeholder="例：5,000,000" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} style={inputStyle} />
        </ListRow>
        <ListRow label="手取り月収" last>
          <input type="number" placeholder="例：280,000" value={monthlyTakeHome} onChange={(e) => setMonthlyTakeHome(e.target.value)} style={inputStyle} />
        </ListRow>
      </Card>
      <button onClick={submit} style={{ padding: "15px", background: GOLD_G, border: "none", borderRadius: 14, color: "white", fontSize: 15, fontWeight: 600, cursor: "pointer", letterSpacing: 2, boxShadow: "0 4px 16px rgba(180,140,60,0.3)" }}>
        は　じ　め　る
      </button>
    </div>
  );
}

function InputTab({ txns, onSave }) {
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState(EXP_CATS[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayStr());
  const [memo, setMemo] = useState("");

  const cats = type === "expense" ? EXP_CATS : INC_CATS;
  const toggleType = (t) => { setType(t); setCategory((t === "expense" ? EXP_CATS : INC_CATS)[0]); };

  const add = async () => {
    if (!amount) return alert("金額を入力してください");
    const entry = { id: uid(), type, category, amount: +amount, date, memo };
    await onSave([entry, ...txns]);
    setAmount(""); setMemo(""); setDate(todayStr());
  };

  const rowInputStyle = { border: "none", outline: "none", background: "transparent", color: SUB, fontSize: 15, textAlign: "right", fontFamily: "inherit", width: "100%" };

  return (
    <div style={{ background: BG, minHeight: "100%" }}>
      <div style={{ background: GOLD_G, padding: "14px 16px 16px", boxShadow: "0 2px 12px rgba(160,120,60,0.2)" }}>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.18)", borderRadius: 12, padding: 3, gap: 3 }}>
          {["expense", "income"].map((t) => (
            <button key={t} onClick={() => toggleType(t)} style={{
              flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 16,
              background: type === t ? "rgba(255,255,255,0.92)" : "transparent",
              color: type === t ? GOLD : "rgba(255,255,255,0.85)",
              transition: "all 0.2s",
            }}>
              {t === "expense" ? "支出" : "収入"}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 14px" }}>
        <Card>
          <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${BORDER_L}` }}>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, marginBottom: 6, fontWeight: 500 }}>金額</div>
            <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)}
              style={{ width: "100%", border: "none", outline: "none", fontSize: 36, fontWeight: 700, color: TEXT, background: "transparent", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
          <ListRow label="カテゴリー">
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", color: SUB, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </ListRow>
          <ListRow label="メモ">
            <input type="text" placeholder="品目やお店" value={memo} onChange={(e) => setMemo(e.target.value)} style={rowInputStyle} />
          </ListRow>
          <ListRow label="日付" last>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              style={{ border: "none", outline: "none", background: "transparent", color: SUB, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }} />
          </ListRow>
        </Card>
        <button onClick={add} style={{ width: "100%", padding: "16px", background: GOLD_G, border: "none", borderRadius: 14, color: "white", fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: 2, boxShadow: "0 4px 14px rgba(180,140,60,0.28)" }}>
          保　存
        </button>
      </div>
    </div>
  );
}

function CalendarTab({ txns }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sel, setSel] = useState(null);

  const ym = `${year}-${String(month + 1).padStart(2, "0")}`;
  const mTxns = txns.filter((t) => t.date.startsWith(ym));

  const dayMap = {};
  mTxns.forEach((t) => {
    const d = parseInt(t.date.split("-")[2], 10);
    if (!dayMap[d]) dayMap[d] = { exp: 0, inc: 0, txns: [] };
    if (t.type === "expense") dayMap[d].exp += t.amount;
    else dayMap[d].inc += t.amount;
    dayMap[d].txns.push(t);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prev = () => { if (month === 0) { setYear((y) => y - 1); setMonth(11); } else setMonth((m) => m - 1); setSel(null); };
  const next = () => { if (month === 11) { setYear((y) => y + 1); setMonth(0); } else setMonth((m) => m + 1); setSel(null); };

  const selTxns = sel ? (dayMap[sel] ? dayMap[sel].txns : []) : [];
  const totalExp = mTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const totalInc = mTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <GoldHeader year={year} month={month} onPrev={prev} onNext={next} />
      <div style={{ padding: "14px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 500, padding: "3px 0", color: i === 0 ? "#e07070" : i === 6 ? "#7080e0" : MUTED }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 14 }}>
          {blanks.map((i) => <div key={"b" + i} />)}
          {days.map((d) => {
            const data = dayMap[d];
            const isToday = year === now.getFullYear() && month === now.getMonth() && d === now.getDate();
            const isSel = sel === d;
            const dow = (firstDay + d - 1) % 7;
            const numColor = dow === 0 ? "#e07070" : dow === 6 ? "#7080e0" : TEXT;
            const cellBg = isSel ? GOLD_L : isToday ? "rgba(201,165,90,0.08)" : "transparent";
            const cellBorder = isSel ? `1.5px solid ${GOLD}` : isToday ? "1.5px solid rgba(201,165,90,0.3)" : "1.5px solid transparent";
            const expLabel = data && data.exp > 0 ? (data.exp >= 10000 ? `${Math.round(data.exp / 1000)}k` : `${+(data.exp / 1000).toFixed(1)}k`) : null;
            return (
              <div key={d} onClick={() => setSel(isSel ? null : d)}
                style={{ minHeight: 52, padding: "5px 2px", borderRadius: 10, cursor: "pointer", background: cellBg, border: cellBorder, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: numColor }}>{d}</span>
                {data && (
                  <div style={{ display: "flex", gap: 2, marginTop: 1 }}>
                    {data.exp > 0 && <div style={{ width: 4, height: 4, borderRadius: 2, background: ROSE }} />}
                    {data.inc > 0 && <div style={{ width: 4, height: 4, borderRadius: 2, background: SAGE }} />}
                  </div>
                )}
                {expLabel && <span style={{ fontSize: 8, color: ROSE, fontWeight: 600, lineHeight: 1.2 }}>{expLabel}</span>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <div style={{ background: CARD, borderRadius: 14, padding: "12px 14px", boxShadow: SHADOW_SM }}>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 4 }}>支出合計</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: ROSE }}>{fmt(totalExp)}</div>
          </div>
          <div style={{ background: CARD, borderRadius: 14, padding: "12px 14px", boxShadow: SHADOW_SM }}>
            <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 4 }}>収入合計</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: SAGE }}>{fmt(totalInc)}</div>
          </div>
        </div>
        {sel && (
          <div>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, marginBottom: 8, fontWeight: 500 }}>{month + 1}月{sel}日の記録</div>
            {selTxns.length === 0
              ? <div style={{ textAlign: "center", color: MUTED, padding: "16px 0", fontSize: 13 }}>記録なし</div>
              : selTxns.map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", background: CARD, borderRadius: 12, padding: "12px 14px", marginBottom: 8, boxShadow: SHADOW_SM }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{t.category}</div>
                    {t.memo && <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{t.memo}</div>}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: t.type === "income" ? SAGE : ROSE }}>
                    {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

function GraphTab({ txns, fixedExpenses }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [view, setView] = useState("variable");

  const ym = `${year}-${String(month + 1).padStart(2, "0")}`;
  const mExp = txns.filter((t) => t.date.startsWith(ym) && t.type === "expense");

  const catMap = {};
  mExp.forEach((t) => { catMap[t.category] = (catMap[t.category] || 0) + t.amount; });
  const varData = Object.entries(catMap)
    .map(([name, value], i) => ({ name, value, fill: PIE_COLS[i % PIE_COLS.length] }))
    .sort((a, b) => b.value - a.value);
  const fixData = fixedExpenses.map((f, i) => ({ name: f.name, value: f.amount, fill: PIE_COLS[(i + 3) % PIE_COLS.length] }));

  const data = view === "variable" ? varData : fixData;
  const total = data.reduce((s, d) => s + d.value, 0);

  const prev = () => { if (month === 0) { setYear((y) => y - 1); setMonth(11); } else setMonth((m) => m - 1); };
  const next = () => { if (month === 11) { setYear((y) => y + 1); setMonth(0); } else setMonth((m) => m + 1); };

  return (
    <div>
      <GoldHeader year={year} month={month} onPrev={prev} onNext={next} />
      <div style={{ padding: "14px 12px" }}>
        <div style={{ display: "flex", background: BG, border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: 3, gap: 3, marginBottom: 12 }}>
          {[["variable", "💸 流動費"], ["fixed", "🏠 固定費"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{
              flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 14,
              background: view === v ? GOLD_G : "transparent",
              color: view === v ? "white" : MUTED,
              transition: "all 0.2s",
              boxShadow: view === v ? "0 2px 8px rgba(180,140,60,0.2)" : "none",
            }}>{l}</button>
          ))}
        </div>
        {data.length === 0 ? (
          <div style={{ background: CARD, borderRadius: 18, padding: "40px 20px", textAlign: "center", boxShadow: SHADOW_SM }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{view === "variable" ? "💸" : "🏠"}</div>
            <div style={{ color: MUTED, fontSize: 13 }}>{view === "variable" ? "この月の支出記録がありません" : "設定から固定費を追加してください"}</div>
          </div>
        ) : (
          <div>
            <div style={{ background: CARD, borderRadius: 18, boxShadow: SHADOW_SM, marginBottom: 10, position: "relative", padding: "4px 0" }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={62} outerRadius={88} dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                    {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [fmt(v), n]} contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, fontWeight: 500 }}>{view === "variable" ? "流動費" : "固定費"}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginTop: 2 }}>{fmt(total)}</div>
              </div>
            </div>
            <div style={{ background: CARD, borderRadius: 18, overflow: "hidden", boxShadow: SHADOW_SM }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 16px", borderBottom: `1px solid ${BORDER_L}` }}>
                <span style={{ fontSize: 13, color: SUB, fontWeight: 500 }}>合計</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{fmt(total)}</span>
              </div>
              {data.map((d, i) => {
                const pct = total > 0 ? Math.round(d.value / total * 100) : 0;
                return (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", padding: "13px 16px", borderBottom: i < data.length - 1 ? `1px solid ${BORDER_L}` : "none" }}>
                    <div style={{ width: 10, height: 10, borderRadius: 5, background: d.fill, marginRight: 12, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 14, color: TEXT }}>{d.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginRight: 8 }}>{fmt(d.value)}</div>
                    <div style={{ fontSize: 12, color: MUTED, minWidth: 32, textAlign: "right" }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KPITab({ goals, profile, fixedExpenses, txns, onSave }) {
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formYears, setFormYears] = useState("5");
  const [sim, setSim] = useState(0);

  const fixedTotal = fixedExpenses.reduce((s, f) => s + f.amount, 0);
  const monthlyBase = profile.monthlyTakeHome - fixedTotal;
  const totalSavings = txns.reduce((s, t) => t.type === "income" ? s + t.amount : s - t.amount, 0);

  const scenarios = [
    { label: "現状", monthly: monthlyBase },
    { label: "+10%", monthly: monthlyBase + profile.monthlyTakeHome * 0.1 },
    { label: "+20%", monthly: monthlyBase + profile.monthlyTakeHome * 0.2 },
  ];

  const addGoal = async () => {
    if (!formName || !formTarget) return alert("目標名と金額を入力してください");
    await onSave([...goals, { id: uid(), name: formName, targetAmount: +formTarget, years: +formYears }]);
    setFormName(""); setFormTarget(""); setFormYears("5"); setShowForm(false);
  };
  const delGoal = async (id) => { if (!confirm("削除しますか?")) return; await onSave(goals.filter((g) => g.id !== id)); };

  const now = new Date();
  const primaryGoal = goals[0] || null;
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now); d.setMonth(d.getMonth() - (5 - i));
    const label = `${d.getMonth() + 1}月`;
    const cutoff = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-31`;
    const cum = txns.filter((t) => t.date <= cutoff).reduce((s, t) => t.type === "income" ? s + t.amount : s - t.amount, 0);
    const target = primaryGoal ? primaryGoal.targetAmount / (primaryGoal.years * 12) * (i + 1) : 0;
    return { label, actual: Math.max(0, cum), target };
  });

  const inputStyle = { width: "100%", padding: "11px", background: BG, border: `1.5px solid ${BORDER}`, borderRadius: 10, color: TEXT, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit" };

  return (
    <div style={{ padding: "20px 14px 8px" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD, fontWeight: 600, marginBottom: 4 }}>KPI TRACKER</div>
        <div style={{ fontSize: 20, fontWeight: 300, color: TEXT, fontFamily: "Georgia,serif" }}>目標進捗</div>
      </div>
      <div style={{ background: GOLD_G, borderRadius: 22, padding: "20px 22px", marginBottom: 12, boxShadow: "0 6px 20px rgba(180,140,60,0.22)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: 2, marginBottom: 4 }}>TOTAL SAVINGS</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: "white", letterSpacing: -1 }}>{fmt(totalSavings)}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>月間可処分額 {fmt(monthlyBase)}　|　固定費 {fmt(fixedTotal)}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>目標一覧</div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: showForm ? BG : GOLD_G, border: `1.5px solid ${showForm ? BORDER : "transparent"}`, borderRadius: 10, color: showForm ? SUB : "white", fontSize: 12, fontWeight: 700, padding: "7px 13px", cursor: "pointer" }}>
          {showForm ? "× 閉じる" : "＋ 追加"}
        </button>
      </div>
      {showForm && (
        <div style={{ background: CARD, borderRadius: 18, padding: "16px", boxShadow: SHADOW_SM, marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 4, fontWeight: 500 }}>目標名</div>
          <input type="text" placeholder="例：マンション頭金" value={formName} onChange={(e) => setFormName(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 4, fontWeight: 500 }}>目標金額（円）</div>
          <input type="number" placeholder="例：5,000,000" value={formTarget} onChange={(e) => setFormTarget(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
          <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, marginBottom: 4, fontWeight: 500 }}>期間（年）</div>
          <input type="number" placeholder="例：5" value={formYears} onChange={(e) => setFormYears(e.target.value)} style={{ ...inputStyle, marginBottom: 14 }} />
          <button onClick={addGoal} style={{ width: "100%", padding: "12px", background: GOLD_G, border: "none", borderRadius: 11, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>目標を追加</button>
        </div>
      )}
      {goals.map((g) => {
        const pct = Math.min(100, totalSavings / g.targetAmount * 100);
        const needed = g.targetAmount / (g.years * 12);
        const remaining = Math.max(0, g.targetAmount - totalSavings);
        const monthsLeft = Math.ceil(remaining / Math.max(1, monthlyBase));
        return (
          <div key={g.id} style={{ background: CARD, borderRadius: 18, padding: "16px", boxShadow: SHADOW_SM, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: TEXT }}>{g.name}</div>
              <button onClick={() => delGoal(g.id)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 18, padding: 0, opacity: 0.6 }}>×</button>
            </div>
            <div style={{ background: BG, borderRadius: 99, height: 8, overflow: "hidden", border: `1px solid ${BORDER_L}`, marginBottom: 6 }}>
              <div style={{ width: `${pct}%`, background: GOLD_G, height: "100%", borderRadius: 99, transition: "width 0.6s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: MUTED, marginBottom: 12 }}>
              <span>{pct.toFixed(1)}% 達成</span>
              <span>{fmt(totalSavings)} / {fmt(g.targetAmount)}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[["目標期間", `${g.years}年`], ["月次必要額", fmt(needed)], ["残り必要額", fmt(remaining)], ["現ペース到達", `${monthsLeft}ヶ月後`]].map(([l, v]) => (
                <div key={l} style={{ background: BG, borderRadius: 10, padding: "8px 10px", border: `1px solid ${BORDER_L}` }}>
                  <div style={{ fontSize: 9, color: MUTED, letterSpacing: 0.3, fontWeight: 500 }}>{l}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2, color: TEXT }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {goals.length === 0 && !showForm && (
        <div style={{ background: CARD, borderRadius: 18, padding: "28px", textAlign: "center", boxShadow: SHADOW_SM, marginBottom: 10 }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
          <div style={{ color: SUB, fontSize: 13 }}>「＋ 追加」から目標を設定しよう</div>
        </div>
      )}
      {primaryGoal && (
        <div style={{ background: CARD, borderRadius: 18, padding: "16px", boxShadow: SHADOW_SM, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 12 }}>累計貯蓄 vs 目標ペース</div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="kpiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v, n) => [fmt(v), n === "actual" ? "実績" : "目標"]} contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 11 }} />
              <Area type="monotone" dataKey="target" stroke={BORDER} strokeWidth={1.5} fill="none" strokeDasharray="4 3" dot={false} name="target" />
              <Area type="monotone" dataKey="actual" stroke={GOLD} strokeWidth={2} fill="url(#kpiGrad)" dot={false} name="actual" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div style={{ background: CARD, borderRadius: 18, padding: "16px", boxShadow: SHADOW_SM, marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: TEXT, marginBottom: 12 }}>年収シミュレーション</div>
        <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
          {scenarios.map((sc, i) => (
            <button key={i} onClick={() => setSim(i)} style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: `1.5px solid ${sim === i ? GOLD : BORDER}`, cursor: "pointer", fontSize: 13, fontWeight: 700, background: sim === i ? GOLD_L : CARD, color: sim === i ? GOLD : MUTED, transition: "all 0.2s" }}>
              {sc.label}
            </button>
          ))}
        </div>
        <div style={{ background: BG, borderRadius: 12, padding: "12px", marginBottom: 10, border: `1px solid ${BORDER_L}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["月間貯蓄", fmt(Math.max(0, scenarios[sim].monthly))], ["年間貯蓄", fmt(Math.max(0, scenarios[sim].monthly) * 12)], ["5年後累計", fmt(totalSavings + Math.max(0, scenarios[sim].monthly) * 60)], ["10年後累計", fmt(totalSavings + Math.max(0, scenarios[sim].monthly) * 120)]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 9, color: MUTED, fontWeight: 500 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: GOLD, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        {goals.map((g) => {
          const needed = g.targetAmount / (g.years * 12);
          const ok = scenarios[sim].monthly >= needed;
          const shortfall = fmt(needed - Math.max(0, scenarios[sim].monthly));
          return (
            <div key={g.id} style={{ padding: "10px 12px", background: ok ? SAGE_L : ROSE_L, borderRadius: 11, border: `1px solid ${ok ? "#c8e6d0" : "#f5c6cc"}`, marginBottom: 6 }}>
              <div style={{ fontSize: 9, color: MUTED, marginBottom: 2 }}>「{g.name}」</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: ok ? SAGE : ROSE }}>
                {ok ? `✨ ${g.years}年で達成可能（月 ${fmt(needed)} 必要）` : `⚡ 月 ${shortfall} 不足`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsTab({ profile, fixedExpenses, onSaveProfile, onSaveFixed }) {
  const [annualIncome, setAnnualIncome] = useState(String(profile.annualIncome));
  const [monthlyTakeHome, setMonthlyTakeHome] = useState(String(profile.monthlyTakeHome));
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [saved, setSaved] = useState(false);

  const saveProfile = async () => {
    await onSaveProfile({ annualIncome: +annualIncome, monthlyTakeHome: +monthlyTakeHome });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };
  const addFixed = async () => {
    if (!newName || !newAmount) return;
    await onSaveFixed([...fixedExpenses, { id: uid(), name: newName, amount: +newAmount }]);
    setNewName(""); setNewAmount("");
  };
  const delFixed = async (id) => await onSaveFixed(fixedExpenses.filter((f) => f.id !== id));

  const fixedTotal = fixedExpenses.reduce((s, f) => s + f.amount, 0);
  const available = +monthlyTakeHome - fixedTotal;
  const rowInputStyle = { border: "none", outline: "none", background: "transparent", color: SUB, fontSize: 15, textAlign: "right", fontFamily: "inherit", width: 160 };

  return (
    <div style={{ padding: "20px 14px 8px" }}>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD, fontWeight: 600, marginBottom: 4 }}>SETTINGS</div>
        <div style={{ fontSize: 20, fontWeight: 300, color: TEXT, fontFamily: "Georgia,serif" }}>設定</div>
      </div>
      <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, fontWeight: 500, paddingLeft: 4, marginBottom: 6 }}>収入設定</div>
      <Card>
        <ListRow label="年収（円）">
          <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} style={rowInputStyle} />
        </ListRow>
        <ListRow label="手取り月収" last>
          <input type="number" value={monthlyTakeHome} onChange={(e) => setMonthlyTakeHome(e.target.value)} style={rowInputStyle} />
        </ListRow>
      </Card>
      <button onClick={saveProfile} style={{ width: "100%", padding: "13px", background: saved ? "linear-gradient(135deg,#7aab8a,#6b9a7a)" : GOLD_G, border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 0.3s", letterSpacing: 1, marginBottom: 18, boxShadow: "0 4px 12px rgba(180,140,60,0.2)" }}>
        {saved ? "✨ 保存しました" : "収入設定を保存"}
      </button>
      <div style={{ fontSize: 11, color: MUTED, letterSpacing: 1, fontWeight: 500, paddingLeft: 4, marginBottom: 6 }}>固定費</div>
      <Card>
        {fixedExpenses.length === 0 && (
          <div style={{ padding: "16px", textAlign: "center", color: MUTED, fontSize: 13 }}>固定費を追加してください</div>
        )}
        {fixedExpenses.map((f, i) => (
          <div key={f.id} style={{ display: "flex", alignItems: "center", padding: "13px 16px", borderBottom: i < fixedExpenses.length - 1 ? `1px solid ${BORDER_L}` : "none" }}>
            <div style={{ flex: 1, fontSize: 14, color: TEXT }}>{f.name}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: SUB, marginRight: 10 }}>{fmt(f.amount)}</div>
            <button onClick={() => delFixed(f.id)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 18, padding: 0, opacity: 0.6 }}>×</button>
          </div>
        ))}
        <div style={{ borderTop: fixedExpenses.length > 0 ? `1px solid ${BORDER_L}` : "none", padding: "12px 14px", display: "flex", gap: 8, alignItems: "center" }}>
          <input type="text" placeholder="項目名（例：家賃）" value={newName} onChange={(e) => setNewName(e.target.value)}
            style={{ flex: 1, padding: "9px 12px", background: BG, border: `1.5px solid ${BORDER}`, borderRadius: 9, color: TEXT, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          <input type="number" placeholder="金額" value={newAmount} onChange={(e) => setNewAmount(e.target.value)}
            style={{ width: 80, padding: "9px 10px", background: BG, border: `1.5px solid ${BORDER}`, borderRadius: 9, color: TEXT, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
          <button onClick={addFixed} style={{ padding: "9px 13px", background: GOLD_G, border: "none", borderRadius: 9, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>追加</button>
        </div>
      </Card>
      <div style={{ background: GOLD_L, border: "1px solid rgba(201,165,90,0.3)", borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: SUB }}>固定費合計</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{fmt(fixedTotal)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: SUB }}>推定月間可処分額</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: available >= 0 ? GOLD : ROSE }}>{fmt(available)}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("input");
  const [profile, setProfile] = useState(null);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [txns, setTxns] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await sGet("kpi-profile");
      const f = await sGet("kpi-fixed");
      const g = await sGet("kpi-goals");
      const t = await sGet("kpi-txns");
      if (p) setProfile(p);
      if (f) setFixedExpenses(f);
      if (g) setGoals(g);
      if (t) setTxns(t);
      setReady(true);
    })();
  }, []);

  if (!ready) return <Splash />;
  if (!profile) return <Setup onSave={async (p) => { setProfile(p); await sSet("kpi-profile", p); }} />;

  const updFixed   = async (f) => { setFixedExpenses(f); await sSet("kpi-fixed", f); };
  const updGoals   = async (g) => { setGoals(g);         await sSet("kpi-goals", g); };
  const updTxns    = async (t) => { setTxns(t);          await sSet("kpi-txns", t); };
  const updProfile = async (p) => { setProfile(p);       await sSet("kpi-profile", p); };

  const NAV = [
    { id: "input",    icon: "✏️", label: "入力" },
    { id: "calendar", icon: "📅", label: "カレンダー" },
    { id: "graph",    icon: "🥧", label: "グラフ" },
    { id: "kpi",      icon: "📈", label: "KPI" },
    { id: "settings", icon: "⚙️", label: "設定" },
  ];

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", height: "100svh", display: "flex", flexDirection: "column", background: BG, color: TEXT, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 70 }}>
        {tab === "input"    && <InputTab    txns={txns} onSave={updTxns} />}
        {tab === "calendar" && <CalendarTab txns={txns} />}
        {tab === "graph"    && <GraphTab    txns={txns} fixedExpenses={fixedExpenses} />}
        {tab === "kpi"      && <KPITab      goals={goals} profile={profile} fixedExpenses={fixedExpenses} txns={txns} onSave={updGoals} />}
        {tab === "settings" && <SettingsTab profile={profile} fixedExpenses={fixedExpenses} onSaveProfile={updProfile} onSaveFixed={updFixed} />}
      </div>
      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: CARD, borderTop: `1px solid ${BORDER}`, display: "flex", zIndex: 100, boxShadow: "0 -4px 20px rgba(160,120,80,0.08)" }}>
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, padding: "9px 0 11px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, color: tab === n.id ? GOLD : MUTED, fontSize: 9, fontWeight: tab === n.id ? 700 : 400, transition: "color 0.2s" }}>
            <span style={{ fontSize: tab === n.id ? 21 : 19, transition: "font-size 0.2s" }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
