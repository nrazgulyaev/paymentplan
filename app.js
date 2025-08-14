// ===== УПРОЩЕННАЯ ВЕРСИЯ ПРИЛОЖЕНИЯ =====

// Ждем загрузки React
function waitForReact() {
  return new Promise((resolve) => {
    if (window.React && window.ReactDOM) {
      resolve();
    } else {
      const checkReact = setInterval(() => {
        if (window.React && window.ReactDOM) {
          clearInterval(checkReact);
          resolve();
        }
      }, 100);
    }
  });
}

// Основная функция запуска
async function startApp() {
  try {
    await waitForReact();
    
    const { useState, useEffect, useMemo, useRef } = React;
    
    // Простая версия компонента App
    function App() {
      const [lang, setLang] = useState('ru');
      const [currency, setCurrency] = useState('USD');
      const [handoverMonth, setHandoverMonth] = useState(12);
      const [months, setMonths] = useState(12);
      const [monthlyRatePct, setMonthlyRatePct] = useState(8.33);
      
      const [stages, setStages] = useState([
        {id:1,label:'Договор',pct:30,month:0},
        {id:2,label:'50% готовности',pct:30,month:6},
        {id:3,label:'70% готовности',pct:20,month:9},
        {id:4,label:'90% готовности',pct:15,month:11},
        {id:5,label:'Ключи',pct:5,month:12},
      ]);
      
      const [lines, setLines] = useState([
        {id:1,projectId:'demo',villaId:'demo-villa',qty:1,prePct:70,ownTerms:false,months:null,monthlyRatePct:null,firstPostUSD:0,discountPct:0,
         snapshot:{name:'Демо вилла',area:100,ppsm:2500,baseUSD:250000}}
      ]);

      const t = {
        title: 'Arconique / Калькулятор рассрочки для любимых клиентов',
        lang: 'Язык интерфейса',
        currencyDisplay: 'Валюта отображения',
        handoverMonth: 'Месяц получения ключей',
        globalTerm: 'Глобальный срок post‑handover (6–24 мес)',
        globalRate: 'Глобальная ставка, %/мес',
        stagesTitle: 'Базовая рассрочка',
        stage: 'Этап',
        percent: '%',
        month: 'Месяц',
        addStage: 'Добавить этап',
        delete: 'Удалить',
        villasTitle: 'Расчёт (позиции)',
        project: 'Проект',
        villa: 'Вилла',
        qty: 'Кол-во',
        area: 'м²',
        ppsm: '$ / м²',
        price: 'Базовая стоимость (USD)',
        discount: 'Скидка, %',
        prePct: 'До ключей, %',
        months: 'Срок рассрочки, мес',
        rate: 'Ставка, %/мес',
        firstPost: 'Первый платёж',
        lineTotal: 'Итоговая стоимость',
        addFromCatalog: 'Добавить из каталога',
        cashflowTitle: 'Сводный кэшфлоу по месяцам',
        exportCSV: 'Экспорт CSV',
        exportXLSX: 'Экспорт Excel',
        exportPDF: 'Сохранить в PDF'
      };

      const stagesSumPct = stages.reduce((s, x) => s + (+x.pct || 0), 0);

      const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
      const fmtMoney = (n, c = 'USD') => new Intl.NumberFormat('en-US', {style: 'currency', currency: c, maximumFractionDigits: 2}).format(n || 0);

      const linesData = useMemo(() => lines.map(line => {
        const base0 = line.snapshot?.baseUSD ?? ((line.snapshot?.area || 0) * (line.snapshot?.ppsm || 0));
        const disc = clamp(+line.discountPct || 0, 0, 20);
        const base = base0 * (1 - disc / 100);
        const prePct = clamp(line.prePct ?? 0, 50, 100);
        const k = stagesSumPct === 0 ? 0 : prePct / stagesSumPct;
        const preSchedule = stages.map(s => ({
          month: Math.max(0, Math.min(handoverMonth, Math.round(+s.month || 0))),
          label: s.label,
          amountUSD: base * (((+s.pct || 0) * k) / 100),
        })).filter(r => r.amountUSD > 0).sort((a, b) => a.month - b.month);
        const preTotalOne = preSchedule.reduce((s, r) => s + r.amountUSD, 0);

        const vMonths = line.ownTerms && line.months ? line.months : months;
        const rate = (line.ownTerms && line.monthlyRatePct != null) ? (line.monthlyRatePct / 100) : (monthlyRatePct / 100);
        const firstPostUSD = Math.max(0, +line.firstPostUSD || 0);
        const principalBase = Math.max(0, base - preTotalOne - firstPostUSD);

        let bal = principalBase, totalInterest = 0;
        const principalShare = vMonths > 0 ? principalBase / vMonths : 0;
        const postRows = [];
        for (let i = 1; i <= vMonths; i++) {
          const interest = bal * rate;
          totalInterest += interest;
          const payment = principalShare + interest;
          postRows.push({
            month: handoverMonth + i,
            label: 'Месяц ' + i,
            principalUSD: principalShare,
            interestUSD: interest,
            paymentUSD: payment,
            balanceAfterUSD: Math.max(0, bal - principalShare)
          });
          bal -= principalShare;
        }
        const lineTotalOne = base + totalInterest;

        const qty = Math.max(1, parseInt(line.qty || 1, 10));
        const preScheduleQ = preSchedule.map(r => ({...r, amountUSD: r.amountUSD * qty}));
        const postRowsQ = postRows.map(r => ({
          ...r,
          principalUSD: r.principalUSD * qty,
          interestUSD: r.interestUSD * qty,
          paymentUSD: r.paymentUSD * qty
        }));
        const preTotal = preTotalOne * qty;
        const firstPostQ = firstPostUSD * qty;
        const baseQ = base * qty;
        const lineTotal = lineTotalOne * qty;

        return {
          line, qty, baseOne: base, base: baseQ, preSchedule: preScheduleQ, preTotal,
          firstPostUSD: firstPostQ, postRows: postRowsQ, lineTotal, vMonths, rate,
          discountPct: disc, prePct: prePct
        };
      }), [lines, stages, stagesSumPct, handoverMonth, months, monthlyRatePct]);

      const project = useMemo(() => {
        const totals = {
          baseUSD: linesData.reduce((s, x) => s + x.base, 0),
          preUSD: linesData.reduce((s, x) => s + x.preTotal, 0),
          finalUSD: linesData.reduce((s, x) => s + x.lineTotal, 0),
        };
        totals.interestUSD = totals.finalUSD - totals.baseUSD;
        totals.afterUSD = totals.finalUSD - totals.preUSD;

        const m = new Map();
        const push = (month, amt, desc) => {
          if (amt <= 0) return;
          const prev = m.get(month) || {month, items: [], amountUSD: 0};
          prev.items.push(desc);
          prev.amountUSD += amt;
          m.set(month, prev);
        };

        linesData.forEach(ld => {
          ld.preSchedule.forEach(r => push(r.month, r.amountUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${r.label}`));
          if (ld.firstPostUSD > 0) push(handoverMonth + 1, ld.firstPostUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: Первый платёж`);
          ld.postRows.forEach(r => push(r.month, r.paymentUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${r.label}`));
        });

        const raw = [...m.values()].sort((a, b) => a.month - b.month);
        let cumulative = 0;
        const cashflow = raw.map(row => {
          cumulative += row.amountUSD;
          const balanceUSD = Math.max(0, totals.finalUSD - cumulative);
          return {...row, cumulativeUSD: cumulative, balanceUSD};
        });

        return {totals, cashflow};
      }, [linesData, handoverMonth]);

      const updLine = (id, patch) => setLines(prev => prev.map(l => l.id === id ? {...l, ...patch} : l));
      const delLine = (id) => setLines(prev => prev.filter(l => l.id !== id));
      const dupLine = (id) => setLines(prev => {
        const src = prev.find(x => x.id === id);
        if (!src) return prev;
        const nid = (prev[prev.length - 1]?.id || 0) + 1;
        return [...prev, {...src, id: nid, qty: 1}];
      });

      return (
        <div className="grid">
          {/* Левая панель - настройки */}
          <div className="card">
            <div className="row">
              <div className="field compact">
                <label>{t.lang}</label>
                <select value={lang} onChange={e => setLang(e.target.value)}>
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div className="field compact">
                <label>{t.currencyDisplay}</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option>USD</option>
                  <option>IDR</option>
                  <option>EUR</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="field compact">
                <label>{t.handoverMonth}</label>
                <input 
                  type="number" 
                  min="1" 
                  step="1" 
                  value={handoverMonth} 
                  onChange={e => setHandoverMonth(clamp(parseInt(e.target.value || 0, 10), 1, 120))}
                />
              </div>
              <div className="field compact">
                <label>{t.globalRate}</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={monthlyRatePct} 
                  onChange={e => setMonthlyRatePct(clamp(parseFloat(e.target.value || 0), 0, 1000))}
                />
              </div>
              <div className="field compact">
                <label>{t.globalTerm}</label>
                <input 
                  type="range" 
                  min="6" 
                  max="24" 
                  step="1" 
                  value={months} 
                  onChange={e => setMonths(parseInt(e.target.value, 10))}
                />
                <div className="pill">{t.months}: {months}</div>
              </div>
            </div>

            <div className="hr"></div>

            <h3 style={{margin: '6px 0'}}>{t.stagesTitle}</h3>
            
            <div className="stages-scroll">
              <table className="stages-table">
                <thead>
                  <tr>
                    <th className="col-stage">{t.stage}</th>
                    <th className="col-percent">{t.percent}</th>
                    <th className="col-month">{t.month}</th>
                    <th className="col-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {stages.map(s => (
                    <tr key={s.id}>
                      <td className="col-stage">
                        <input 
                          type="text" 
                          className="stage-input"
                          value={s.label} 
                          onChange={e => setStages(prev => prev.map(x => x.id === s.id ? {...x, label: e.target.value} : x))}
                        />
                      </td>
                      <td className="col-percent">
                        <input 
                          type="number" 
                          className="stage-number-input"
                          min="0" 
                          max="100"
                          step="0.01" 
                          value={s.pct} 
                          onChange={e => setStages(prev => prev.map(x => x.id === s.id ? {...x, pct: clamp(parseFloat(e.target.value || 0), 0, 100)} : x))}
                        />
                      </td>
                      <td className="col-month">
                        <input 
                          type="number" 
                          className="stage-number-input"
                          min="0" 
                          step="1" 
                          value={s.month} 
                          onChange={e => setStages(prev => prev.map(x => x.id === s.id ? {...x, month: clamp(parseInt(e.target.value || 0, 10), 0, handoverMonth)} : x))}
                        />
                      </td>
                      <td className="col-actions">
                        <div className="stage-actions">
                          <button className="delete-stage-btn" onClick={() => setStages(prev => prev.filter(x => x.id !== s.id))}>
                            {t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="row" style={{marginTop: 8, alignItems: 'center', justifyContent: 'space-between'}}>
              <button className="btn primary" onClick={() => setStages(prev => {
                const last = prev[prev.length - 1];
                const id = (last?.id || 0) + 1;
                const nextMonth = Math.min(handoverMonth, (last?.month ?? 0) + 1);
                return [...prev, {id, label: 'Этап', pct: 5, month: nextMonth}];
              })}>{t.addStage}</button>
              <div className="pill">
                {t.sumStages}: {Math.round(stagesSumPct * 100) / 100}%
              </div>
            </div>
          </div>

          {/* Правая панель - расчеты */}
          <div className="card">
            <div className="row" style={{justifyContent: 'space-between', alignItems: 'baseline'}}>
              <div className="row">
                <span className="badge">{t.lines}: {lines.length}</span>
                <span className="badge">Ключи через {handoverMonth} мес.</span>
                <span className="badge">{t.months}: {months}</span>
              </div>
              <div className="muted">Редактор</div>
            </div>

            {/* KPI блок */}
            <div className="kpis">
              <div className="kpi">
                <div className="muted">Базовая стоимость</div>
                <div className="v">{fmtMoney(project.totals.baseUSD, currency)}</div>
              </div>
              <div className="kpi">
                <div className="muted">Оплата до ключей</div>
                <div className="v">{fmtMoney(project.totals.preUSD, currency)}</div>
              </div>
              <div className="kpi">
                <div className="muted">Остаток после ключей</div>
                <div className="v">{fmtMoney(project.totals.afterUSD, currency)}</div>
              </div>
              <div className="kpi">
                <div className="muted">Проценты</div>
                <div className="v">{fmtMoney(project.totals.interestUSD, currency)}</div>
              </div>
              <div className="kpi">
                <div className="muted">Итоговая цена</div>
                <div className="v">{fmtMoney(project.totals.finalUSD, currency)}</div>
              </div>
            </div>

            <div className="hr"></div>

            <div className="calculation-header">
              <h3 style={{margin: '6px 0'}}>{t.villasTitle}</h3>
            </div>

            <div className="calc-scroll">
              <table className="calc-table">
                <thead>
                  <tr>
                    <th className="col-project">{t.project}</th>
                    <th className="col-villa">{t.villa}</th>
                    <th className="col-qty">{t.qty}</th>
                    <th className="col-area">{t.area}</th>
                    <th className="col-ppsm">{t.ppsm}</th>
                    <th className="col-base">{t.price}</th>
                    <th className="col-disc">{t.discount}</th>
                    <th className="col-pre">{t.prePct}</th>
                    <th className="col-months">{t.months}</th>
                    <th className="col-rate">{t.rate}</th>
                    <th className="col-first">{t.firstPost}</th>
                    <th className="col-lineTotal">{t.lineTotal}</th>
                    <th className="col-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {linesData.map(ld => (
                    <tr key={ld.line.id}>
                      <td className="col-project" style={{textAlign: 'left'}}>
                        <div className="project-name-display">Демо проект</div>
                      </td>
                      <td className="col-villa" style={{textAlign: 'left'}}>
                        <div className="villa-name-display">{ld.line.snapshot?.name}</div>
                      </td>
                      <td className="col-qty">
                        <input 
                          type="number" 
                          min="1" 
                          step="1" 
                          value={ld.line.qty} 
                          onChange={e => updLine(ld.line.id, {qty: clamp(parseInt(e.target.value || 0, 10), 1, 9999)})}
                          style={{width: '100%', minWidth: '50px'}}
                        />
                      </td>
                      <td className="col-area">
                        <div className="area-display">{ld.line.snapshot?.area || 0}</div>
                      </td>
                      <td className="col-ppsm">
                        <div className="ppsm-display">{ld.line.snapshot?.ppsm || 0}</div>
                      </td>
                      <td className="col-base base-strong">
                        {fmtMoney(ld.base, currency)}
                      </td>
                      <td className="col-disc">
                        <input 
                          type="number" 
                          min="0" 
                          max="20" 
                          step="0.1" 
                          value={ld.line.discountPct || 0} 
                          onChange={e => updLine(ld.line.id, {discountPct: clamp(parseFloat(e.target.value || 0), 0, 20)})}
                          style={{width: '100%', minWidth: '50px'}}
                        />
                      </td>
                      <td className="col-pre">
                        <input 
                          type="range" 
                          min="50" 
                          max="100" 
                          step="1" 
                          value={Math.max(50, Math.min(100, ld.prePct || 0))} 
                          onChange={e => {
                            const value = parseInt(e.target.value, 10);
                            const clampedValue = Math.max(50, Math.min(100, value));
                            updLine(ld.line.id, { prePct: clampedValue });
                          }}
                          style={{width: '100%', minWidth: '80px'}}
                        />
                        <div className="pill">{Math.max(50, Math.min(100, ld.prePct || 0))}%</div>
                      </td>
                      <td className="col-months">
                        <input 
                          type="checkbox" 
                          checked={ld.line.ownTerms || false} 
                          onChange={e => updLine(ld.line.id, {ownTerms: e.target.checked})}
                        />
                        <input 
                          type="number" 
                          min="6" 
                          step="1" 
                          value={ld.line.months || months} 
                          onChange={e => updLine(ld.line.id, {months: clamp(parseInt(e.target.value || 0, 10), 6, 120)})}
                          disabled={!ld.line.ownTerms}
                          style={{width: '100%', minWidth: '50px'}}
                        />
                      </td>
                      <td className="col-rate">
                        <input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          value={ld.line.monthlyRatePct || monthlyRatePct} 
                          onChange={e => updLine(ld.line.id, {monthlyRatePct: clamp(parseFloat(e.target.value || 0), 0, 1000)})}
                          disabled={!ld.line.ownTerms}
                          style={{width: '100%', minWidth: '60px'}}
                        />
                      </td>
                      <td className="col-first">
                        <input 
                          type="number" 
                          min="0" 
                          step="1" 
                          value={ld.line.firstPostUSD || 0} 
                          onChange={e => updLine(ld.line.id, {firstPostUSD: clamp(parseFloat(e.target.value || 0), 0, ld.base)})}
                          style={{width: '100%', minWidth: '80px'}}
                        />
                      </td>
                      <td className="col-lineTotal line-total">
                        {fmtMoney(ld.lineTotal, currency)}
                      </td>
                      <td className="col-actions">
                        <div className="row" style={{gap: 4}}>
                          <button className="btn icon" onClick={() => dupLine(ld.line.id)}>📋</button>
                          <button className="btn danger icon" onClick={() => delLine(ld.line.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="hr"></div>

            <h3 style={{margin: '6px 0'}}>{t.cashflowTitle}</h3>
            
            <div className="cashflow-scroll">
              <table className="cashflow-table">
                <thead>
                  <tr>
                    <th>Месяц</th>
                    <th style={{textAlign: 'left'}}>Описание</th>
                    <th>Сумма к оплате</th>
                    <th>Остаток долга</th>
                  </tr>
                </thead>
                <tbody>
                  {project.cashflow.map(c => (
                    <tr key={c.month}>
                      <td>Месяц {c.month}</td>
                      <td style={{textAlign: 'left'}}>{(c.items || []).join(' + ')}</td>
                      <td>{fmtMoney(c.amountUSD, currency)}</td>
                      <td>{fmtMoney(c.balanceUSD, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // Рендерим приложение
    ReactDOM.render(React.createElement(App), document.getElementById('root'));
    console.log('Приложение успешно запущено!');
    
  } catch (error) {
    console.error('Ошибка запуска приложения:', error);
    document.getElementById('root').innerHTML = `
      <div style="color: white; text-align: center; padding: 50px;">
        <h2>Ошибка запуска приложения</h2>
        <p>${error.message}</p>
        <button onclick="location.reload()" style="padding: 10px 20px; margin: 20px; background: #3b82f6; border: none; border-radius: 8px; color: white; cursor: pointer;">
          Перезагрузить страницу
        </button>
      </div>
    `;
  }
}

// Запускаем приложение
startApp();
