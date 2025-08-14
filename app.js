// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE (ИСПРАВЛЕННАЯ ВЕРСИЯ) =====

const { useState, useEffect, useMemo, useRef } = React;

// PIN для редакторского режима
const PIN_CODE = '334346';

// Основной компонент приложения
function App() {
  const [lang, setLang] = useState('ru');
  const [isClient, setIsClient] = useState(true); // По умолчанию клиентский режим
  const [currency, setCurrency] = useState('USD');
  const [idrPerUsd, setIdrPerUsd] = useState(16500);
  const [eurPerUsd, setEurPerUsd] = useState(0.92);
  const [handoverMonth, setHandoverMonth] = useState(12);
  const [months, setMonths] = useState(12);
  const [monthlyRatePct, setMonthlyRatePct] = useState(8.33);
  const [startMonth, setStartMonth] = useState(new Date());
  
  // ИСПРАВЛЕНИЕ: Правильная структура каталога с проектами и виллами
  const [catalog, setCatalog] = useState([
    {
      projectId: 'ahao',
      projectName: 'AHAO Gardens',
      villas: [
        {villaId: 'ahao-2br', name: '2BR Garden Villa', area: 100, ppsm: 2500, baseUSD: 250000},
        {villaId: 'ahao-3br', name: '3BR Garden Villa', area: 130, ppsm: 2450, baseUSD: 318500}
      ]
    },
    {
      projectId: 'enso',
      projectName: 'Enso Villas',
      villas: [
        {villaId: 'enso-2br', name: 'Enso 2BR', area: 100, ppsm: 2500, baseUSD: 250000},
        {villaId: 'enso-3br', name: 'Enso 3BR', area: 120, ppsm: 2700, baseUSD: 324000}
      ]
    }
  ]);
  
  // ИСПРАВЛЕНИЕ: Правильная структура этапов рассрочки
  const [stages, setStages] = useState([
    {id: 1, label: 'Договор', pct: 30, month: 0},
    {id: 2, label: '50% готовности', pct: 30, month: 6},
    {id: 3, label: '70% готовности', pct: 20, month: 9},
    {id: 4, label: '90% готовности', pct: 15, month: 11},
    {id: 5, label: 'Ключи', pct: 5, month: 12},
  ]);
  
  const [lines, setLines] = useState([
    {
      id: 1,
      projectId: 'enso',
      villaId: 'enso-2br',
      qty: 1,
      prePct: 70,
      ownTerms: false,
      months: null,
      monthlyRatePct: null,
      firstPostUSD: 0,
      discountPct: 0,
      snapshot: {name: 'Enso 2BR', area: 100, ppsm: 2500, baseUSD: 250000}
    }
  ]);

  // Состояния для модальных окон
  const [modalOpen, setModalOpen] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProjectForm, setNewProjectForm] = useState({
    projectId: '',
    projectName: '',
    villas: []
  });
  const [newVillaForm, setNewVillaForm] = useState({
    villaId: '',
    name: '',
    area: 100,
    ppsm: 2500,
    baseUSD: 250000
  });

  // Переводы
  const t = {
    title: 'Arconique / Калькулятор рассрочки для любимых клиентов',
    lang: 'Язык интерфейса',
    currencyDisplay: 'Валюта отображения',
    idrRate: 'IDR за 1 USD',
    eurRate: 'EUR за 1 USD',
    handoverMonth: 'Месяц получения ключей',
    globalTerm: 'Глобальный срок post‑handover (6–24 мес)',
    globalRate: 'Глобальная ставка, %/мес',
    clientTerm: 'Срок post‑handover (мес)',
    startMonth: 'Начальный месяц',
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
    exportPDF: 'Сохранить в PDF',
    lines: 'Выбрано вилл',
    keys: 'Ключи через',
    client: 'Клиент',
    editor: 'Редактор',
    catalogTitle: 'Каталог проектов и вилл (редактор)',
    addProject: 'Добавить проект',
    addVilla: 'Добавить виллу',
    importJSON: 'Импорт JSON',
    exportJSON: 'Экспорт JSON',
    selectFromCatalog: 'Выбор из каталога',
    search: 'Поиск',
    areaFrom: 'м² от',
    areaTo: 'м² до',
    priceFrom: 'Цена от',
    priceTo: 'Цена до',
    sort: 'Сортировать',
    byPrice: 'по цене',
    byArea: 'по площади',
    byName: 'по названию',
    addSelected: 'Добавить выбранные',
    cancel: 'Отмена',
    save: 'Сохранить',
    edit: 'Редактировать',
    remove: 'Удалить',
    projectId: 'ID проекта',
    projectName: 'Название проекта',
    villaId: 'ID виллы',
    villaName: 'Название виллы',
    villaArea: 'Площадь (м²)',
    villaPpsm: 'Цена за м² ($)',
    villaBasePrice: 'Базовая цена ($)',
    projectNameRequired: 'Введите название проекта',
    villaNameRequired: 'Введите название виллы'
  };

  // Утилиты
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const fmtMoney = (n, c = 'USD') => new Intl.NumberFormat('en-US', {style: 'currency', currency: c, maximumFractionDigits: 2}).format(n || 0);
  const stagesSumPct = stages.reduce((s, x) => s + (+x.pct || 0), 0);

  // Форматирование месяца для кэшфлоу
  const formatMonth = (monthOffset) => {
    const date = new Date(startMonth);
    date.setMonth(date.getMonth() + monthOffset);
    return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Функции для работы с проектами
  const addProject = () => {
    setNewProjectForm({
      projectId: '',
      projectName: '',
      villas: []
    });
    setShowAddProjectModal(true);
  };

  const saveProject = () => {
    if (!newProjectForm.projectId || !newProjectForm.projectName) {
      alert('Заполните ID и название проекта');
      return;
    }
    
    const projectExists = catalog.find(p => p.projectId === newProjectForm.projectId);
    if (projectExists) {
      alert('Проект с таким ID уже существует');
      return;
    }

    const newProject = {
      projectId: newProjectForm.projectId,
      projectName: newProjectForm.projectName,
      villas: newProjectForm.villas
    };

    setCatalog(prev => [...prev, newProject]);
    setShowAddProjectModal(false);
    setNewProjectForm({ projectId: '', projectName: '', villas: [] });
  };

  // Функции для работы с виллами
  const addVilla = (projectId) => {
    setNewVillaForm({
      villaId: '',
      name: '',
      area: 100,
      ppsm: 2500,
      baseUSD: 250000
    });
    setEditingProject(projectId);
    setShowAddVillaModal(true);
  };

  const saveVilla = () => {
    if (!newVillaForm.villaId || !newVillaForm.name) {
      alert('Заполните ID и название виллы');
      return;
    }

    const project = catalog.find(p => p.projectId === editingProject);
    if (!project) return;

    const villaExists = project.villas.find(v => v.villaId === newVillaForm.villaId);
    if (villaExists) {
      alert('Вилла с таким ID уже существует в этом проекте');
      return;
    }

    const newVilla = {
      villaId: newVillaForm.villaId,
      name: newVillaForm.name,
      area: newVillaForm.area,
      ppsm: newVillaForm.ppsm,
      baseUSD: newVillaForm.baseUSD
    };

    setCatalog(prev => prev.map(p => 
      p.projectId === editingProject 
        ? { ...p, villas: [...p.villas, newVilla] }
        : p
    ));

    setShowAddVillaModal(false);
    setEditingProject(null);
    setNewVillaForm({ villaId: '', name: '', area: 100, ppsm: 2500, baseUSD: 250000 });
  };

  // Расчет данных по строкам
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

  // Расчет проекта
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

  // Функции для работы с линиями
  const updLine = (id, patch) => setLines(prev => prev.map(l => l.id === id ? {...l, ...patch} : l));
  const delLine = (id) => setLines(prev => prev.filter(l => l.id !== id));
  const dupLine = (id) => setLines(prev => {
    const src = prev.find(x => x.id === id);
    if (!src) return prev;
    const nid = (prev[prev.length - 1]?.id || 0) + 1;
    return [...prev, {...src, id: nid, qty: 1}];
  });

  const addFromCatalog = () => setModalOpen(true);
  const addFromCatalogLine = (villa, projectId) => {
    const nid = (lines[lines.length - 1]?.id || 0) + 1;
    const newLine = {
      id: nid,
      projectId: projectId,
      villaId: villa.villaId,
      qty: 1,
      prePct: 70,
      ownTerms: false,
      months: null,
      monthlyRatePct: null,
      firstPostUSD: 0,
      discountPct: 0,
      snapshot: {name: villa.name, area: villa.area, ppsm: villa.ppsm, baseUSD: villa.baseUSD}
    };
    setLines(prev => [...prev, newLine]);
    setModalOpen(false);
  };

  // Функции экспорта
  const exportCSV = () => {
    const rows = [
      ['Месяц', 'Описание', 'Сумма к оплате', 'Остаток долга'],
      ...project.cashflow.map(c => [
        formatMonth(c.month),
        (c.items || []).join(' + '),
        fmtMoney(c.amountUSD, currency),
        fmtMoney(c.balanceUSD, currency)
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `arconique_cashflow_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportXLSX = () => {
    if (typeof XLSX === 'undefined') {
      alert('Библиотека XLSX не загружена');
      return;
    }
    
    const ws1 = XLSX.utils.json_to_sheet(project.cashflow.map(c => ({
      'Месяц': formatMonth(c.month),
      'Описание': (c.items || []).join(' + '),
      'Сумма к оплате': c.amountUSD,
      'Остаток долга': c.balanceUSD
    })));
    
    const ws2 = XLSX.utils.json_to_sheet(linesData.map(ld => ({
      'Проект': catalog.find(p => p.projectId === ld.line.projectId)?.projectName || ld.line.projectId,
      'Вилла': ld.line.snapshot?.name,
      'Кол-во': ld.qty,
      'Площадь': ld.line.snapshot?.area,
      'Цена за м²': ld.line.snapshot?.ppsm,
      'Базовая стоимость': ld.base,
      'Скидка': (ld.discountPct || 0) + '%',
      'До ключей': ld.prePct,
      'Срок': ld.vMonths,
      'Итоговая стоимость': ld.lineTotal
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Cashflow');
    XLSX.utils.book_append_sheet(wb, ws2, 'Lines');
    XLSX.writeFile(wb, `arconique_installments_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPDF = () => {
    if (typeof html2pdf === 'undefined') {
      alert('Библиотека html2pdf не загружена');
      return;
    }
    
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Arconique - Отчет</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #333; margin: 0; }
          .header .date { color: #666; margin-top: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .summary { margin: 20px 0; padding: 20px; background: #f9f9f9; }
          .summary h3 { margin-top: 0; }
          .amount { font-weight: bold; color: #2c5aa0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Arconique - Отчет по рассрочке</h1>
          <div class="date">Отчет создан: ${new Date().toLocaleDateString('ru-RU')}</div>
        </div>
        
        <div class="summary">
          <h3>Сводка проекта</h3>
          <p><strong>Общая сумма:</strong> <span class="amount">${fmtMoney(project.totals.baseUSD, 'USD')}</span></p>
          <p><strong>Итоговая цена:</strong> <span class="amount">${fmtMoney(project.totals.finalUSD, 'USD')}</span></p>
          <p><strong>Проценты:</strong> <span class="amount">${fmtMoney(project.totals.interestUSD, 'USD')}</span></p>
        </div>
        
        <h3>Денежный поток по месяцам</h3>
        <table>
          <thead>
            <tr>
              <th>Месяц</th>
              <th>Описание</th>
              <th>Сумма к оплате</th>
              <th>Остаток долга</th>
            </tr>
          </thead>
          <tbody>
            ${project.cashflow.map(c => `
              <tr>
                <td>${formatMonth(c.month)}</td>
                <td>${(c.items || []).join(' + ')}</td>
                <td class="amount">${fmtMoney(c.amountUSD, 'USD')}</td>
                <td class="amount">${fmtMoney(c.balanceUSD, 'USD')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const element = document.createElement('div');
    element.innerHTML = pdfContent;
    document.body.appendChild(element);
    
    html2pdf()
      .from(element)
      .save(`arconique-cashflow-${new Date().toISOString().slice(0, 10)}.pdf`)
      .then(() => {
        document.body.removeChild(element);
      });
  };

  // Функция переключения режима
  const toggleMode = () => {
    if (isClient) {
      const pin = prompt('Введите PIN для входа в редакторский режим:');
      if (pin === PIN_CODE) {
        setIsClient(false);
        alert('Режим редактора активирован');
      } else if (pin !== null) {
        alert('Неверный PIN');
      }
    } else {
      setIsClient(true);
      alert('Переключено в клиентский режим');
    }
  };

  // Функции для работы с этапами
  const addStage = () => {
    const newId = stages.length + 1;
    setStages(prev => [...prev, {id: newId, label: 'Новый этап', pct: 5, month: 0}]);
  };

  const delStage = (id) => setStages(prev => prev.filter(s => s.id !== id));

  const updStage = (id, patch) => setStages(prev => prev.map(s => s.id === id ? {...s, ...patch} : s));

  return (
    <>
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

          {/* Курсы валют (только для редактора) */}
          {!isClient && (
            <div className="row">
              <div className="field compact">
                <label>{t.idrRate}</label>
                <input 
                  type="number" 
                  min="1" 
                  step="1" 
                  value={idrPerUsd} 
                  onChange={e => setIdrPerUsd(clamp(parseFloat(e.target.value || 0), 1, 1e9))}
                />
              </div>
              <div className="field compact">
                <label>{t.eurRate}</label>
                <input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  value={eurPerUsd} 
                  onChange={e => setEurPerUsd(clamp(parseFloat(e.target.value || 0), 0.01, 100))}
                />
              </div>
            </div>
          )}

          {/* Начальный месяц */}
          <div className="row">
            <div className="field compact">
              <label>{t.startMonth}</label>
              <div className="info-display">
                {startMonth.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
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
            {!isClient ? (
              <>
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
              </>
            ) : (
              <div className="field compact">
                <label>{t.clientTerm}</label>
                <input 
                  type="number" 
                  min="6" 
                  step="1" 
                  value={months} 
                  onChange={e => setMonths(clamp(parseInt(e.target.value || 0, 10), 6, 120))}
                />
              </div>
            )}
          </div>

          {/* ИСПРАВЛЕНИЕ: Правильный блок этапов рассрочки */}
          <div className="stages-section">
            <h3>{t.stagesTitle}</h3>
            {stages.map(stage => (
              <div key={stage.id} className="stage-row">
                <input 
                  type="text" 
                  value={stage.label} 
                  onChange={e => updStage(stage.id, {label: e.target.value})}
                  placeholder="Название этапа"
                  className="stage-input"
                />
                <input 
                  type="number" 
                  value={stage.pct} 
                  onChange={e => updStage(stage.id, {pct: +e.target.value})}
                  placeholder="%"
                  className="stage-input-small"
                />
                <input 
                  type="number" 
                  value={stage.month} 
                  onChange={e => updStage(stage.id, {month: +e.target.value})}
                  placeholder="Месяц"
                  className="stage-input-small"
                />
                <button onClick={() => delStage(stage.id)} className="btn danger small">
                  {t.delete}
                </button>
              </div>
            ))}
            
            <div className="row" style={{marginTop: 8, alignItems: 'center', justifyContent: 'space-between'}}>
              <button className="btn primary" onClick={addStage}>{t.addStage}</button>
              <div className="pill">
                Сумма этапов: {Math.round(stagesSumPct * 100) / 100}%
                {stagesSumPct !== 100 && (
                  <span className="warning">
                    — {stagesSumPct < 100 ? 'не хватает' : 'превышает'} 100%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hr"></div>

          {/* Кнопка переключения режима */}
          <div className="row">
            <button className="btn" onClick={toggleMode}>
              {isClient ? 'Переключиться в редактор' : 'Переключиться в клиент'}
            </button>
          </div>
        </div>

        {/* Правая панель - расчеты */}
        <div className="card">
          <div className="row" style={{justifyContent: 'space-between', alignItems: 'baseline'}}>
            <div className="row">
              <span className="badge">{t.lines}: {lines.length}</span>
              <span className="badge">{t.keys} {handoverMonth} мес.</span>
              <span className="badge">Срок: {months} мес.</span>
            </div>
            <div className="muted">{isClient ? t.client : t.editor}</div>
          </div>

          {/* KPI блок */}
<div className="kpis">
  {!isClient && (
    <div className="kpi">
      <div className="muted">Базовая стоимость</div>
      <div className="v">{fmtMoney(project.totals.baseUSD, currency)}</div>
    </div>
  )}
  <div className="kpi">
    <div className="muted">Оплата до ключей</div>
    <div className="v">{fmtMoney(project.totals.preUSD, currency)}</div>
  </div>
  <div className="kpi">
    <div className="muted">Остаток после ключей</div>
    <div className="v">{fmtMoney(project.totals.afterUSD, currency)}</div>
  </div>
  {!isClient && (
    <div className="kpi">
      <div className="muted">Проценты</div>
      <div className="v">{fmtMoney(project.totals.interestUSD, currency)}</div>
    </div>
  )}
  <div className="kpi">
    <div className="muted">Итоговая цена</div>
    <div className="v">{fmtMoney(project.totals.finalUSD, currency)}</div>
  </div>
</div>

          <div className="hr"></div>

          <div className="calculation-header">
            <h3 style={{margin: '6px 0'}}>{t.villasTitle}</h3>
            <button className="btn success" onClick={addFromCatalog}>
              {t.addFromCatalog}
            </button>
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
                      <div className="project-name-display">
                        {catalog.find(p => p.projectId === ld.line.projectId)?.projectName || ld.line.projectId}
                      </div>
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
    <button className="btn danger icon" onClick={() => delLine(ld.line.id)}>🗑️</button>
  </div>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* РЕДАКТОРСКИЙ РЕЖИМ - ОТДЕЛЬНЫЙ БЛОК */}
      {!isClient && (
        <div className="editor-mode">
          <h2>{t.catalogTitle}</h2>
          {/* Каталог проектов и вилл */}
          <CatalogManager 
            catalog={catalog} 
            setCatalog={setCatalog} 
            t={t} 
            lang={lang} 
            fmtMoney={fmtMoney}
            showAddProjectModal={showAddProjectModal}
            setShowAddProjectModal={setShowAddProjectModal}
            showAddVillaModal={showAddVillaModal}
            setShowAddVillaModal={setShowAddVillaModal}
            editingProject={editingProject}
            setEditingProject={setEditingProject}
            newProjectForm={newProjectForm}
            setNewProjectForm={setNewProjectForm}
            newVillaForm={newVillaForm}
            setNewVillaForm={setNewVillaForm}
            addProject={addProject}
            saveProject={saveProject}
            addVilla={addVilla}
            saveVilla={saveVilla}
          />
        </div>
      )}

      {/* ИСПРАВЛЕНИЕ: Сводный кэшфлоу по месяцам - отдельный блок внизу */}
      <div className="cashflow-block">
        <div className="card">
          <div className="card-header">
            <h2>{t.cashflowTitle}</h2>
            <div className="export-buttons">
              <button className="btn" onClick={exportCSV}>{t.exportCSV}</button>
              <button className="btn" onClick={exportXLSX}>{t.exportXLSX}</button>
              <button className="btn" onClick={exportPDF}>{t.exportPDF}</button>
            </div>
          </div>
          
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
                    <td>{formatMonth(c.month)}</td>
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

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ИЗ КАТАЛОГА */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t.selectFromCatalog}</h3>
            <div className="catalog-grid">
              {catalog.map(project => (
                <div key={project.projectId} className="project-group">
                  <h4>{project.projectName}</h4>
                  {project.villas.map(villa => (
                    <div key={villa.villaId} className="villa-item" onClick={() => addFromCatalogLine(villa, project.projectId)}>
                      <div className="villa-info">
                        <strong>{villa.name}</strong>
                        <span>{villa.area} м² × ${villa.ppsm} = {fmtMoney(villa.baseUSD, 'USD')}</span>
                      </div>
                      <button className="btn primary small">{t.addSelected}</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button onClick={() => setModalOpen(false)} className="btn">{t.cancel}</button>
          </div>
        </div>
      )}

    {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ПРОЕКТА */}
{showAddProjectModal && (
  <div className="modal-overlay" onClick={() => setShowAddProjectModal(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h3>{t.addProject}</h3>
      <div className="form-group">
        <label>{t.projectName}:</label>
        <input 
          type="text" 
          value={newProjectForm.projectName} 
          onChange={e => setNewProjectForm(prev => ({...prev, projectName: e.target.value}))}
          placeholder="Название проекта"
          className="input"
        />
      </div>
      <div className="modal-actions">
        <button onClick={saveProject} className="btn primary">{t.save}</button>
        <button onClick={() => setShowAddProjectModal(false)} className="btn">{t.cancel}</button>
      </div>
    </div>
  </div>
)}

     {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ВИЛЛЫ */}
{showAddVillaModal && (
  <div className="modal-overlay" onClick={() => setShowAddVillaModal(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h3>{t.addVilla}</h3>
      <div className="form-group">
        <label>{t.villaName}:</label>
        <input 
          type="text" 
          value={newVillaForm.name} 
          onChange={e => setNewVillaForm(prev => ({...prev, name: e.target.value}))}
          placeholder="Название виллы"
          className="input"
        />
      </div>
      <div className="form-group">
        <label>{t.villaArea}:</label>
        <input 
          type="number" 
          value={newVillaForm.area} 
          onChange={e => setNewVillaForm(prev => ({...prev, area: +e.target.value}))}
          placeholder="Площадь"
          className="input"
        />
      </div>
      <div className="form-group">
        <label>{t.villaPpsm}:</label>
        <input 
          type="number" 
          value={newVillaForm.ppsm} 
          onChange={e => setNewVillaForm(prev => ({...prev, ppsm: +e.target.value}))}
          placeholder="Цена за м²"
          className="input"
        />
      </div>
      <div className="form-group">
        <label>{t.villaBasePrice}:</label>
        <input 
          type="number" 
          value={newVillaForm.baseUSD} 
          onChange={e => setNewVillaForm(prev => ({...prev, baseUSD: +e.target.value}))}
          placeholder="Базовая цена"
          className="input"
        />
      </div>
      <div className="modal-actions">
        <button onClick={saveVilla} className="btn primary">{t.save}</button>
        <button onClick={() => setShowAddVillaModal(false)} className="btn">{t.cancel}</button>
      </div>
    </div>
  </div>
)}
    </>
  );
}

// ===== КОМПОНЕНТ КАТАЛОГА (ИСПРАВЛЕННАЯ ВЕРСИЯ) =====
function CatalogManager({ 
  catalog, 
  setCatalog, 
  t, 
  lang, 
  fmtMoney,
  showAddProjectModal,
  setShowAddProjectModal,
  showAddVillaModal,
  setShowAddVillaModal,
  editingProject,
  setEditingProject,
  newProjectForm,
  setNewProjectForm,
  newVillaForm,
  setNewVillaForm,
  addProject,
  saveProject,
  addVilla,
  saveVilla
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [areaFilter, setAreaFilter] = useState({ from: '', to: '' });
  const [priceFilter, setPriceFilter] = useState({ from: '', to: '' });

  const filteredCatalog = useMemo(() => {
    let filtered = [...catalog];
    
    // Фильтрация по поиску
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.villas.some(villa => 
          villa.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Фильтрация по площади
    if (areaFilter.from || areaFilter.to) {
      filtered = filtered.map(project => ({
        ...project,
        villas: project.villas.filter(villa => {
          const area = villa.area;
          const from = areaFilter.from ? +areaFilter.from : 0;
          const to = areaFilter.to ? +areaFilter.to : Infinity;
          return area >= from && area <= to;
        })
      })).filter(project => project.villas.length > 0);
    }
    
    // Фильтрация по цене
    if (priceFilter.from || priceFilter.to) {
      filtered = filtered.map(project => ({
        ...project,
        villas: project.villas.filter(villa => {
          const price = villa.baseUSD;
          const from = priceFilter.from ? +priceFilter.from : 0;
          const to = priceFilter.to ? +priceFilter.to : Infinity;
          return price >= from && price <= to;
        })
      })).filter(project => project.villas.length > 0);
    }
    
    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const aPrice = Math.min(...a.villas.map(v => v.baseUSD));
          const bPrice = Math.min(...b.villas.map(v => v.baseUSD));
          return aPrice - bPrice;
        case 'area':
          const aArea = Math.min(...a.villas.map(v => v.area));
          const bArea = Math.min(...b.villas.map(v => v.area));
          return aArea - bArea;
        case 'name':
        default:
          return a.projectName.localeCompare(b.projectName);
      }
    });
    
    return filtered;
  }, [catalog, searchTerm, sortBy, areaFilter, priceFilter]);

  const deleteProject = (projectId) => {
    if (confirm('Удалить проект и все его виллы?')) {
      setCatalog(prev => prev.filter(p => p.projectId !== projectId));
    }
  };

  const deleteVilla = (projectId, villaId) => {
    if (confirm('Удалить виллу?')) {
      setCatalog(prev => prev.map(p => 
        p.projectId === projectId 
          ? { ...p, villas: p.villas.filter(v => v.villaId !== villaId) }
          : p
      ));
    }
  };

  const exportCatalog = () => {
    const dataStr = JSON.stringify(catalog, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'arconique_catalog.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCatalog = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            setCatalog(imported);
            alert('Каталог успешно импортирован');
          } else {
            alert('Неверный формат файла');
          }
        } catch (error) {
          alert('Ошибка при импорте файла');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="catalog-section">
      <div className="catalog-header">
        <div className="catalog-controls">
          <button onClick={addProject} className="btn primary">{t.addProject}</button>
          <button onClick={() => setShowAddVillaModal(true)} className="btn primary">{t.addVilla}</button>
          <button onClick={exportCatalog} className="btn">{t.exportJSON}</button>
          <label className="btn">
            {t.importJSON}
            <input type="file" accept=".json" onChange={importCatalog} style={{ display: 'none' }} />
          </label>
        </div>
        
        <div className="catalog-filters">
          <input 
            type="text" 
            placeholder={t.search} 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="input"
          />
          
          <div className="filter-group">
            <input 
              type="number" 
              placeholder={t.areaFrom} 
              value={areaFilter.from} 
              onChange={e => setAreaFilter(prev => ({...prev, from: e.target.value}))}
              className="input small"
            />
            <input 
              type="number" 
              placeholder={t.areaTo} 
              value={areaFilter.to} 
              onChange={e => setAreaFilter(prev => ({...prev, to: e.target.value}))}
              className="input small"
            />
          </div>
          
          <div className="filter-group">
            <input 
              type="number" 
              placeholder={t.priceFrom} 
              value={priceFilter.from} 
              onChange={e => setPriceFilter(prev => ({...prev, from: e.target.value}))}
              className="input small"
            />
            <input 
              type="number" 
              placeholder={t.priceTo} 
              value={priceFilter.to} 
              onChange={e => setPriceFilter(prev => ({...prev, to: e.target.value}))}
              className="input small"
            />
          </div>
          
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="select">
            <option value="name">{t.sort} {t.byName}</option>
            <option value="price">{t.sort} {t.byPrice}</option>
            <option value="area">{t.sort} {t.byArea}</option>
          </select>
        </div>
      </div>

      <div className="catalog-content">
        {filteredCatalog.map(project => (
          <div key={project.projectId} className="project-card">
            <div className="project-header">
              <h3>{project.projectName}</h3>
              <div className="project-actions">
                <button onClick={() => addVilla(project.projectId)} className="btn small">{t.addVilla}</button>
                <button onClick={() => deleteProject(project.projectId)} className="btn danger small">{t.remove}</button>
              </div>
            </div>
            
            <div className="villas-grid">
              {project.villas.map(villa => (
                <div key={villa.villaId} className="villa-card">
                  <div className="villa-header">
                    <h4>{villa.name}</h4>
                    <div className="villa-actions">
                      <button onClick={() => deleteVilla(project.projectId, villa.villaId)} className="btn danger small">{t.remove}</button>
                    </div>
                  </div>
                  
                  <div className="villa-details">
                    <div className="detail-item">
                      <span className="detail-label">{t.villaArea}:</span>
                      <span className="detail-value">{villa.area} м²</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">{t.villaPpsm}:</span>
                      <span className="detail-value">${villa.ppsm}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">{t.villaBasePrice}:</span>
                      <span className="detail-value">{fmtMoney(villa.baseUSD, 'USD')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== ЗАПУСК ПРИЛОЖЕНИЯ (ИСПРАВЛЕННЫЙ React 18) =====
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
            
