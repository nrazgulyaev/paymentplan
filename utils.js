// ===== ОСНОВНЫЕ УТИЛИТЫ =====

// Ограничение значения в диапазоне
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Форматирование денег
const fmtMoney = (n, c = 'USD') => {
  if (typeof n !== 'number' || isNaN(n)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: c,
    maximumFractionDigits: 2
  }).format(n);
};

// Форматирование месяца для кэшфлоу
const formatMonth = (monthOffset, startMonth, lang = 'ru') => {
  const date = new Date(startMonth);
  date.setMonth(date.getMonth() + monthOffset);
  return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { 
    month: 'long', 
    year: 'numeric' 
  });
};

// ===== PIN / БЕЗОПАСНОСТЬ =====

const PIN_CODE = '334346';
const PIN_SALT = 'enso-v7.7-salt-1';
const PIN_HASH_HEX = 'c0b37fd5b1ebc835af06c260b9ceb435285f79ecffd7f0a68be695db347d2aa6';

async function sha256Hex(str) {
  try {
    if (!crypto.subtle) {
      console.warn('crypto.subtle not available, using fallback');
      return '';
    }
    const buf = new TextEncoder().encode(str);
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
  } catch(e) { 
    console.warn('SHA-256 failed:', e);
    return ''; 
  }
}

async function verifyPinFlow() {
  const pin = prompt('Enter PIN');
  if (pin == null) return false;
  const hex = await sha256Hex(`${pin}|${PIN_SALT}`);
  if (hex && hex === PIN_HASH_HEX) return true;
  return pin === PIN_CODE;
}

// ===== МЕЖДУНАРОДИЗАЦИЯ =====

const T = {
  ru: {
    title: 'Arconique / Калькулятор рассрочки для любимых клиентов',
    editor: 'Редактор', 
    client: 'Клиент',
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
    cashMonth: 'Месяц', 
    cashDesc: 'Описание',
    cashTotal: 'Сумма к оплате', 
    cashBalance: 'Остаток долга',
    totals: 'Итоги', 
    base: 'Базовая стоимость', 
    prepay: 'Оплата до ключей',
    after: 'Остаток после ключей', 
    interestTotal: 'Проценты (post)',
    final: 'Итоговая цена',
    lines: 'Выбрано вилл', 
    keys: 'Ключи через',
    chartTitle: 'Платежи по месяцам',
    sumStages: 'Сумма этапов', 
    targetPrepay: 'Целевой % до ключей',
    mismatch: '— отличается от целевого', 
    mixedTargets: 'разные цели у строк',
    shareCopied: 'Ссылка скопирована',
    exportCSV: 'Экспорт CSV', 
    exportXLSX: 'Экспорт Excel', 
    exportPDF: 'Сохранить в PDF',
    tabCalc: 'Расчёт', 
    tabCatalog: 'Каталог',
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
    qtyShort: 'Кол-во', 
    baseUSD: 'Базовая стоимость (USD)',
    projectId: 'ID проекта', 
    projectName: 'Название проекта',
    villaId: 'ID виллы', 
    villaName: 'Название виллы',
    villaArea: 'Площадь (м²)', 
    villaPpsm: 'Цена за м² ($)',
    villaBasePrice: 'Базовая цена ($)', 
    save: 'Сохранить',
    edit: 'Редактировать', 
    remove: 'Удалить',
    projectNameRequired: 'Введите название проекта',
    villaNameRequired: 'Введите название виллы'
  },
  en: {
    title: 'Arconique / Installments Calculator',
    editor: 'Editor', 
    client: 'Client',
    lang: 'Language', 
    currencyDisplay: 'Display currency',
    idrRate: 'IDR per 1 USD', 
    eurRate: 'EUR per 1 USD',
    handoverMonth: 'Handover month',
    globalTerm: 'Global post‑handover term (6–24 mo)',
    globalRate: 'Global rate, %/month',
    clientTerm: 'Post‑handover term (months)',
    startMonth: 'Start month',
    stagesTitle: 'Basic installments',
    stage: 'Stage', 
    percent: '%', 
    month: 'Month',
    addStage: 'Add stage', 
    delete: 'Delete',
    villasTitle: 'Calculation (lines)',
    project: 'Project', 
    villa: 'Villa', 
    qty: 'Qty',
    area: 'sqm', 
    ppsm: '$ / sqm', 
    price: 'Base Price (USD)',
    discount: 'Discount, %', 
    prePct: 'Pre‑handover, %',
    months: 'Installment term, mo', 
    rate: 'Rate, %/mo',
    firstPost: 'First payment', 
    lineTotal: 'Final price',
    addFromCatalog: 'Add from catalog',
    cashflowTitle: 'Monthly consolidated cashflow',
    cashMonth: 'Month', 
    cashDesc: 'Description',
    cashTotal: 'Amount due', 
    cashBalance: 'Remaining balance',
    totals: 'Totals', 
    base: 'Base price', 
    prepay: 'Paid before keys',
    after: 'Balance after keys', 
    interestTotal: 'Interest (post)',
    final: 'Final price',
    lines: 'Selected villas', 
    keys: 'Keys in',
    chartTitle: 'Payments by month',
    sumStages: 'Stages sum', 
    targetPrepay: 'Target pre‑handover %',
    mismatch: '— differs from target', 
    mixedTargets: 'different line targets',
    shareCopied: 'Link copied',
    exportCSV: 'Export CSV', 
    exportXLSX: 'Export Excel', 
    exportPDF: 'Save to PDF',
    tabCalc: 'Calculation', 
    tabCatalog: 'Catalog',
    catalogTitle: 'Projects & Villas Catalog (editor)',
    addProject: 'Add project', 
    addVilla: 'Add villa',
    importJSON: 'Import JSON', 
    exportJSON: 'Export JSON',
    selectFromCatalog: 'Select from catalog',
    search: 'Search', 
    areaFrom: 'sqm from', 
    areaTo: 'sqm to',
    priceFrom: 'Price from', 
    priceTo: 'Price to',
    sort: 'Sort', 
    byPrice: 'by price', 
    byArea: 'by area', 
    byName: 'by name',
    addSelected: 'Add selected', 
    cancel: 'Cancel',
    qtyShort: 'Qty', 
    baseUSD: 'Base Price (USD)',
    projectId: 'Project ID', 
    projectName: 'Project Name',
    villaId: 'Villa ID', 
    villaName: 'Villa Name',
    villaArea: 'Area (sqm)', 
    villaPpsm: 'Price per sqm ($)',
    villaBasePrice: 'Base Price ($)', 
    save: 'Save',
    edit: 'Edit', 
    remove: 'Remove',
    projectNameRequired: 'Enter project name',
    villaNameRequired: 'Enter villa name'
  }
};

// ===== URL STATE (СЖАТЫЙ HASH) =====

const readHash = () => {
  const h = location.hash.startsWith('#') ? location.hash.slice(1) : location.hash;
  const sp = new URLSearchParams(h);
  return { s: sp.get('s'), view: sp.get('view') };
};

const encodeState = (state, { view } = {}) => {
  try {
    const s = LZString.compressToEncodedURIComponent(JSON.stringify(state));
    const u = new URL(location.href);
    const sp = new URLSearchParams();
    sp.set('s', s);
    if (view) sp.set('view', view);
    u.hash = sp.toString();
    return u.toString();
  } catch {
    return '';
  }
};

const decodeState = () => {
  try {
    const { s, view } = readHash();
    if (!s) return null;
    const json = LZString.decompressFromEncodedURIComponent(s);
    return { state: JSON.parse(json), view };
  } catch {
    return null;
  }
};

// ===== ДЕМО КАТАЛОГ =====

const DEFAULT_CATALOG = [
  {
    projectId: 'ahao',
    projectName: 'AHAO Gardens',
    villas: [
      { villaId: 'ahao-2br', name: '2BR Garden Villa', area: 100, ppsm: 2500, baseUSD: 250000 },
      { villaId: 'ahao-3br', name: '3BR Garden Villa', area: 130, ppsm: 2450, baseUSD: 318500 }
    ]
  },
  {
    projectId: 'enso',
    projectName: 'Enso Villas',
    villas: [
      { villaId: 'enso-2br', name: 'Enso 2BR', area: 100, ppsm: 2500, baseUSD: 250000 },
      { villaId: 'enso-3br', name: 'Enso 3BR', area: 120, ppsm: 2700, baseUSD: 324000 }
    ]
  },
  {
    projectId: 'eternal',
    projectName: 'Eternal Villas',
    villas: [
      { villaId: 'eternal-1br', name: 'Eternal 1BR Loft', area: 80, ppsm: 2600, baseUSD: 208000 },
      { villaId: 'eternal-2br', name: 'Eternal 2BR', area: 110, ppsm: 2550, baseUSD: 280500 }
    ]
  }
];

// ===== ФУНКЦИИ РАСЧЕТОВ =====

// Расчет данных по строкам
const calculateLinesData = (lines, stages, stagesSumPct, handoverMonth, months, monthlyRatePct, lang) => {
  return lines.map(line => {
    const base0 = line.snapshot?.baseUSD ?? ((line.snapshot?.area || 0) * (line.snapshot?.ppsm || 0));
    const disc = clamp(+line.discountPct || 0, 0, 20);
    const base = base0 * (1 - disc / 100);

    // Ограничение "До ключей" от 50% до 100%
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
        label: (lang === 'ru' ? 'Месяц ' : 'Month ') + i,
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
  });
};

// Расчет проекта
const calculateProject = (linesData, handoverMonth, lang) => {
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
    const prev = m.get(month) || { month, items: [], amountUSD: 0 };
    prev.items.push(desc);
    prev.amountUSD += amt;
    m.set(month, prev);
  };

  linesData.forEach(ld => {
    ld.preSchedule.forEach(r => push(r.month, r.amountUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${r.label}`));
    if (ld.firstPostUSD > 0) push(handoverMonth + 1, ld.firstPostUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${lang === 'ru' ? 'Первый платёж' : 'First payment'}`);
    ld.postRows.forEach(r => push(r.month, r.paymentUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${r.label}`));
  });

  const raw = [...m.values()].sort((a, b) => a.month - b.month);
  let cumulative = 0;
  const cashflow = raw.map(row => {
    cumulative += row.amountUSD;
    const balanceUSD = Math.max(0, totals.finalUSD - cumulative);
    return {...row, cumulativeUSD: cumulative, balanceUSD};
  });

  return { totals, cashflow, handoverMonth };
};

// ===== ФУНКЦИИ ЭКСПОРТА =====

// Экспорт в CSV
const exportCSV = (project, t, currency, toCurrency) => {
  const rows = [
    [t.cashMonth, t.cashDesc, t.cashTotal, t.cashBalance],
    ...project.cashflow.map(c => [
      formatMonth(c.month),
      (c.items || []).join(' + '),
      toCurrency(c.amountUSD).toFixed(2),
      toCurrency(c.balanceUSD).toFixed(2)
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

// Экспорт в Excel
const exportXLSX = (project, linesData, t, currency, toCurrency) => {
  const ws1 = XLSX.utils.json_to_sheet(project.cashflow.map(c => ({
    [t.cashMonth]: formatMonth(c.month),
    [t.cashDesc]: (c.items || []).join(' + '),
    [t.cashTotal]: toCurrency(c.amountUSD),
    [t.cashBalance]: toCurrency(c.balanceUSD)
  })));
  
  const ws2 = XLSX.utils.json_to_sheet(linesData.map(ld => ({
    [t.project]: findProject(ld.line.projectId)?.projectName || ld.line.projectId,
    [t.villa]: ld.line.snapshot?.name,
    [t.qty]: ld.qty,
    [t.area]: ld.line.snapshot?.area,
    [t.ppsm]: ld.line.snapshot?.ppsm,
    [t.price]: ld.base,
    [t.discount]: (ld.discountPct || 0) + '%',
    [t.prePct]: ld.prePct,
    [t.months]: ld.vMonths,
    [t.lineTotal]: ld.lineTotal
  })));
  
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Cashflow');
  XLSX.utils.book_append_sheet(wb, ws2, 'Lines');
  XLSX.writeFile(wb, `arconique_installments_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// Экспорт в PDF
const exportPDF = (project, linesData, t, currency, toCurrency) => {
  if (!project) return;
  
  const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${findProject(linesData[0]?.line.projectId)?.projectName || 'Project'} - Cashflow Report</title>
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
        <h1>${findProject(linesData[0]?.line.projectId)?.projectName || 'Project'}</h1>
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
    .save(`${findProject(linesData[0]?.line.projectId)?.projectName || 'Project'}-cashflow-${new Date().toISOString().slice(0, 10)}.pdf`)
    .then(() => {
      document.body.removeChild(element);
    });
};

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

// Поиск проекта по ID
const findProject = (pid) => DEFAULT_CATALOG.find(p => p.projectId === pid);

// Валидация данных
const validateInput = (value, type, options = {}) => {
  switch (type) {
    case 'number':
      const num = parseFloat(value);
      if (isNaN(num)) return { valid: false, error: 'Должно быть числом' };
      if (options.min !== undefined && num < options.min) return { valid: false, error: `Минимум: ${options.min}` };
      if (options.max !== undefined && num > options.max) return { valid: false, error: `Максимум: ${options.max}` };
      return { valid: true, value: num };
    
    case 'text':
      if (!value || value.trim().length === 0) return { valid: false, error: 'Поле обязательно для заполнения' };
      if (options.minLength && value.length < options.minLength) return { valid: false, error: `Минимум символов: ${options.minLength}` };
      if (options.maxLength && value.length > options.maxLength) return { valid: false, error: `Максимум символов: ${options.maxLength}` };
      return { valid: true, value: value.trim() };
    
    default:
      return { valid: true, value };
  }
};

// Локальное хранилище с версионированием
const storage = {
  set: (key, value, version = 'v77') => {
    try {
      const data = { value, version, timestamp: Date.now() };
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Storage set failed:', e);
      return false;
    }
  },
  
  get: (key, version = 'v77') => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || 'null');
      if (!data) return null;
      if (data.version !== version) return null;
      return data.value;
    } catch (e) {
      console.warn('Storage get failed:', e);
      return null;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('Storage remove failed:', e);
      return false;
    }
  }
};

// ===== ЭКСПОРТ УТИЛИТ =====

// Экспортируем все утилиты для использования
window.clamp = clamp;
window.fmtMoney = fmtMoney;
window.formatMonth = formatMonth;
window.verifyPinFlow = verifyPinFlow;
window.T = T;
window.readHash = readHash;
window.encodeState = encodeState;
window.decodeState = decodeState;
window.DEFAULT_CATALOG = DEFAULT_CATALOG;
window.calculateLinesData = calculateLinesData;
window.calculateProject = calculateProject;
window.exportCSV = exportCSV;
window.exportXLSX = exportXLSX;
window.exportPDF = exportPDF;
window.findProject = findProject;
window.validateInput = validateInput;
window.storage = storage;
