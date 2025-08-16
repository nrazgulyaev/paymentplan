// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE (С ЛИЗХОЛДОМ И ИНДЕКСАЦИЕЙ) - ИСПРАВЛЕННАЯ ВЕРСИЯ =====

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
  
  // ОБНОВЛЕНО: Правильная структура каталога с проектами и виллами + ЛИЗХОЛД
  const [catalog, setCatalog] = useState([
    {
      projectId: 'ahao',
      projectName: 'AHAO Gardens',
      villas: [
        {
          villaId: 'ahao-2br', 
          name: '2BR Garden Villa', 
          area: 100, 
          ppsm: 2500, 
          baseUSD: 250000,
          // НОВЫЕ ПОЛЯ ДЛЯ ЛИЗХОЛДА И АРЕНДЫ:
          leaseholdEndDate: new Date(2030, 11, 31), // 31 декабря 2030
          dailyRateUSD: 150,
          rentalPriceIndexPct: 5 // 5% в год
        },
        {
          villaId: 'ahao-3br', 
          name: '3BR Garden Villa', 
          area: 130, 
          ppsm: 2450, 
          baseUSD: 318500,
          leaseholdEndDate: new Date(2030, 11, 31),
          dailyRateUSD: 180,
          rentalPriceIndexPct: 5
        }
      ]
    },
    {
      projectId: 'enso',
      projectName: 'Enso Villas',
      villas: [
        {
          villaId: 'enso-2br', 
          name: 'Enso 2BR', 
          area: 100, 
          ppsm: 2500, 
          baseUSD: 250000,
          leaseholdEndDate: new Date(2030, 11, 31),
          dailyRateUSD: 150,
          rentalPriceIndexPct: 5
        },
        {
          villaId: 'enso-3br', 
          name: 'Enso 3BR', 
          area: 120, 
          ppsm: 2700, 
          baseUSD: 324000,
          leaseholdEndDate: new Date(2030, 11, 31),
          dailyRateUSD: 170,
          rentalPriceIndexPct: 5
        }
      ]
    }
  ]);
  
  // Правильная структура этапов рассрочки
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
      // ОБНОВЛЕНО: Новые поля для аренды с индексацией
      dailyRateUSD: 150, // Стоимость проживания в сутки (USD)
      occupancyPct: 75,  // Средняя заполняемость за месяц (%)
      rentalPriceIndexPct: 5, // Индексация цены аренды в год (%)
      snapshot: {
        name: 'Enso 2BR', 
        area: 100, 
        ppsm: 2500, 
        baseUSD: 250000,
        leaseholdEndDate: new Date(2030, 11, 31) // Дата окончания лизхолда
      }
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
    baseUSD: 250000,
    // НОВЫЕ ПОЛЯ ДЛЯ ЛИЗХОЛДА И АРЕНДЫ:
    leaseholdEndDate: new Date(2030, 11, 31),
    dailyRateUSD: 150,
    rentalPriceIndexPct: 5
  });

  // ОБНОВЛЕНО: Переводы с новыми полями
  const T = {
    ru: {
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
      projectName: 'Название проекта',
      villaName: 'Название виллы',
      villaArea: 'Площадь (м²)',
      villaPpsm: 'Цена за м² ($)',
      villaBasePrice: 'Базовая цена ($)',
      projectNameRequired: 'Введите название проекта',
      villaNameRequired: 'Введите название виллы',
      // Дополнительные переводы
      toggleToEditor: 'Переключиться в редактор',
      toggleToClient: 'Переключиться в клиент',
      enterPin: 'Введите PIN для входа в редакторский режим:',
      editorActivated: 'Режим редактора активирован',
      wrongPin: 'Неверный PIN',
      switchedToClient: 'Переключено в клиентский режим',
      stagesSum: 'Сумма этапов:',
      notEnough: '— не хватает',
      exceeds: '— превышает',
      projectExists: 'Проект с таким ID уже существует',
      villaExists: 'Вилла с таким ID уже существует в этом проекте',
      fillProjectId: 'Заполните ID и название проекта',
      fillVillaId: 'Заполните ID и название виллы',
      deleteProjectConfirm: 'Удалить проект и все его виллы?',
      deleteVillaConfirm: 'Удалить виллу?',
      catalogImported: 'Каталог успешно импортирован',
      wrongFileFormat: 'Неверный формат файла',
      importError: 'Ошибка при импорте файла',
      xlsxNotLoaded: 'Библиотека XLSX не загружена',
      html2pdfNotLoaded: 'Библиотека html2pdf не загружена',
      reportTitle: 'Arconique - Отчет по рассрочке',
      reportCreated: 'Отчет создан:',
      projectSummary: 'Сводка проекта',
      totalAmount: 'Общая сумма:',
      finalPrice: 'Итоговая цена:',
      interest: 'Проценты:',
      monthlyCashflow: 'Денежный поток по месяцам',
      month: 'Месяц',
      description: 'Описание',
      amountDue: 'Сумма к оплате',
      remainingBalance: 'Остаток долга',
      after: 'После ключей',
      firstPayment: 'Первый платёж',
      // ОБНОВЛЕНО: Новые переводы для лизхолда и индексации
      dailyRate: 'Стоимость проживания в сутки (USD)',
      occupancyRate: 'Средняя заполняемость за месяц (%)',
      rentalIncome: 'Прогнозируемый доход от аренды в месяц',
      netPayment: 'Чистый платеж/доход в месяц',
      leaseholdEndDate: 'Дата окончания лизхолда',
      rentalPriceIndex: 'Индексация цены аренды в год (%)',
      cleanLeaseholdTerm: 'Чистый срок лизхолда',
      years: 'лет',
      months: 'месяцев',
      rentalIncomeChart: 'График общей доходности от сдачи в аренду',
      totalIncome: 'Общий доход за год',
      cumulativeIncome: 'Накопительный доход'
    },
    en: {
      title: 'Arconique / Installments Calculator',
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
      lineTotal: 'Final price',
      addFromCatalog: 'Add from catalog',
      cashflowTitle: 'Monthly consolidated cashflow',
      exportCSV: 'Export CSV',
      exportXLSX: 'Export Excel',
      exportPDF: 'Save to PDF',
      lines: 'Selected villas',
      keys: 'Keys in',
      client: 'Client',
      editor: 'Editor',
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
      save: 'Save',
      edit: 'Edit',
      remove: 'Remove',
      projectName: 'Project Name',
      villaName: 'Villa Name',
      villaArea: 'Area (sqm)',
      villaPpsm: 'Price per sqm ($)',
      villaBasePrice: 'Base Price ($)',
      projectNameRequired: 'Enter project name',
      villaNameRequired: 'Enter villa name',
      // Additional translations
      toggleToEditor: 'Switch to Editor',
      toggleToClient: 'Switch to Client',
      enterPin: 'Enter PIN to access editor mode:',
      editorActivated: 'Editor mode activated',
      wrongPin: 'Wrong PIN',
      switchedToClient: 'Switched to client mode',
      stagesSum: 'Stages sum:',
      notEnough: '— not enough',
      exceeds: '— exceeds',
      projectExists: 'Project with this ID already exists',
      villaExists: 'Villa with this ID already exists in this project',
      fillProjectId: 'Fill in project ID and name',
      fillVillaId: 'Fill in villa ID and name',
      deleteProjectConfirm: 'Delete project and all its villas?',
      deleteVillaConfirm: 'Delete villa?',
      catalogImported: 'Catalog successfully imported',
      wrongFileFormat: 'Wrong file format',
      importError: 'Error importing file',
      xlsxNotLoaded: 'XLSX library not loaded',
      html2pdfNotLoaded: 'html2pdf library not loaded',
      reportTitle: 'Arconique - Installment Report',
      reportCreated: 'Report created:',
      projectSummary: 'Project Summary',
      totalAmount: 'Total amount:',
      finalPrice: 'Final price:',
      interest: 'Interest:',
      monthlyCashflow: 'Monthly cashflow',
      month: 'Month',
      description: 'Description',
      amountDue: 'Amount due',
      remainingBalance: 'Remaining balance',
      after: 'After keys',
      firstPayment: 'First payment',
      // ОБНОВЛЕНО: Новые переводы для лизхолда и индексации
      dailyRate: 'Daily accommodation rate (USD)',
      occupancyRate: 'Average monthly occupancy (%)',
      rentalIncome: 'Projected monthly rental income',
      netPayment: 'Net payment/income per month',
      leaseholdEndDate: 'Leasehold end date',
      rentalPriceIndex: 'Rental price indexation per year (%)',
      cleanLeaseholdTerm: 'Clean leasehold term',
      years: 'years',
      months: 'months',
      rentalIncomeChart: 'Chart of total rental income',
      totalIncome: 'Total income per year',
      cumulativeIncome: 'Cumulative income'
    }
  };

// ... existing code ...
// ... existing code ...

  // Получаем переводы для текущего языка
  const t = T[lang] || T.ru; // fallback на русский

  // Обновление заголовка страницы
  useEffect(() => {
    // Проверяем, существует ли элемент перед изменением
    const appTitleElement = document.getElementById('app-title');
    if (appTitleElement) {
      appTitleElement.textContent = t.title;
    }
    document.title = t.title;
  }, [t.title]);

  // ИСПРАВЛЕНИЕ: Добавить недостающие функции и переменные
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const fmtMoney = (n, c = 'USD') => new Intl.NumberFormat('en-US', {style: 'currency', currency: c, maximumFractionDigits: 2}).format(n || 0);
  const stagesSumPct = stages.reduce((s, x) => s + (+x.pct || 0), 0);

  // Форматирование месяца для кэшфлоу (ВОССТАНОВЛЕНО СТАРОЕ)
  const formatMonth = (monthOffset) => {
    const date = new Date(startMonth);
    date.setMonth(date.getMonth() + monthOffset);
    return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // НОВАЯ ФУНКЦИЯ: Расчет количества дней в месяце для аренды
  const getDaysInMonth = (monthOffset) => {
    const date = new Date(startMonth);
    date.setMonth(date.getMonth() + monthOffset);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // НОВАЯ ФУНКЦИЯ: Расчет чистого срока лизхолда
  const getCleanLeaseholdTerm = (leaseholdEndDate) => {
    if (!leaseholdEndDate) return { years: 0, months: 0 };
    
    const handoverDate = new Date(startMonth);
    handoverDate.setMonth(handoverDate.getMonth() + handoverMonth);
    
    const diffTime = leaseholdEndDate.getTime() - handoverDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { years: 0, months: 0 };
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    return { years, months };
  };

  // НОВАЯ ФУНКЦИЯ: Расчет индексированной цены аренды для конкретного года
  const getIndexedRentalPrice = (basePrice, indexPct, yearOffset) => {
    if (yearOffset <= 0) return basePrice;
    return basePrice * Math.pow(1 + indexPct / 100, yearOffset);
  };

  // НОВАЯ ФУНКЦИЯ: Расчет годового дохода от аренды с индексацией
  const getYearlyRentalIncome = (line, yearOffset) => {
    if (yearOffset <= 0) return 0;
    
    const indexedPrice = getIndexedRentalPrice(line.dailyRateUSD, line.rentalPriceIndexPct, yearOffset);
    const daysInYear = 365;
    const occupancyDays = daysInYear * (line.occupancyPct / 100);
    
    return indexedPrice * 0.55 * occupancyDays * line.qty;
  };

  // НОВАЯ ФУНКЦИЯ: Расчет накопительного дохода по годам
  const getCumulativeRentalIncome = (lines) => {
    const maxYears = Math.max(...lines.map(line => {
      if (!line.snapshot?.leaseholdEndDate) return 0;
      const term = getCleanLeaseholdTerm(line.snapshot.leaseholdEndDate);
      return term.years;
    }));
    
    const yearlyIncome = [];
    let cumulative = 0;
    
    for (let year = 0; year <= maxYears; year++) {
      const yearIncome = lines.reduce((total, line) => {
        return total + getYearlyRentalIncome(line, year);
      }, 0);
      
      cumulative += yearIncome;
      yearlyIncome.push({
        year: year,
        yearIncome: yearIncome,
        cumulativeIncome: cumulative
      });
    }
    
    return yearlyIncome;
  };

  // Функции для работы с проектами (ВОССТАНОВЛЕНЫ СТАРЫЕ)
  const addProject = () => {
    setNewProjectForm({
      projectId: '',
      projectName: '',
      villas: []
    });
    setShowAddProjectModal(true);
  };

  const saveProject = () => {
    if (!newProjectForm.projectName) {
      alert(t.projectNameRequired);
      return;
    }
    
    // Auto-generate projectId
    const newProjectId = newProjectForm.projectName.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '');
    const projectExists = catalog.find(p => p.projectId === newProjectId);
    if (projectExists) {
      alert(t.projectExists);
      return;
    }

    const newProject = {
      projectId: newProjectId, // Auto-generated
      projectName: newProjectForm.projectName,
      villas: newProjectForm.villas
    };

    setCatalog(prev => [...prev, newProject]);
    setShowAddProjectModal(false);
    setNewProjectForm({ projectId: '', projectName: '', villas: [] });
  };

  // Функции для работы с виллами (ОБНОВЛЕНЫ С НОВЫМИ ПОЛЯМИ)
  const addVilla = (projectId) => {
    setNewVillaForm({
      villaId: '',
      name: '',
      area: 100,
      ppsm: 2500,
      baseUSD: 250000,
      // НОВЫЕ ПОЛЯ ДЛЯ ЛИЗХОЛДА И АРЕНДЫ:
      leaseholdEndDate: new Date(2030, 11, 31),
      dailyRateUSD: 150,
      rentalPriceIndexPct: 5
    });
    setEditingProject(projectId);
    setShowAddVillaModal(true);
  };

  const saveVilla = () => {
    if (!newVillaForm.name) {
      alert(t.villaNameRequired);
      return;
    }

    const project = catalog.find(p => p.projectId === editingProject);
    if (!project) return;

    // Auto-generate villaId
    const newVillaId = `${editingProject}-${newVillaForm.name.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    const villaExists = project.villas.find(v => v.villaId === newVillaId);
    if (villaExists) {
      alert(t.villaExists);
      return;
    }

    const newVilla = {
      villaId: newVillaId, // Auto-generated
      name: newVillaForm.name,
      area: newVillaForm.area,
      ppsm: newVillaForm.ppsm,
      baseUSD: newVillaForm.baseUSD,
      // НОВЫЕ ПОЛЯ ДЛЯ ЛИЗХОЛДА И АРЕНДЫ:
      leaseholdEndDate: newVillaForm.leaseholdEndDate,
      dailyRateUSD: newVillaForm.dailyRateUSD,
      rentalPriceIndexPct: newVillaForm.rentalPriceIndexPct
    };

    setCatalog(prev => prev.map(p => 
      p.projectId === editingProject 
        ? { ...p, villas: [...p.villas, newVilla] }
        : p
    ));

    setShowAddVillaModal(false);
    setEditingProject(null);
    setNewVillaForm({ 
      villaId: '', 
      name: '', 
      area: 100, 
      ppsm: 2500, 
      baseUSD: 250000,
      leaseholdEndDate: new Date(2030, 11, 31),
      dailyRateUSD: 150,
      rentalPriceIndexPct: 5
    });
  };

  // Расчет данных по строкам (ОБНОВЛЕН С НОВОЙ ЛОГИКОЙ АРЕНДЫ)
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
        label: `${t.month} ${i}`,
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
  }), [lines, stages, stagesSumPct, handoverMonth, months, monthlyRatePct, t.month]);

  // Расчет проекта (ОБНОВЛЕН С НОВОЙ ЛОГИКОЙ АРЕНДЫ С ИНДЕКСАЦИЕЙ)
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
      if (ld.firstPostUSD > 0) push(handoverMonth + 1, ld.firstPostUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${t.firstPayment}`);
      ld.postRows.forEach(r => push(r.month, r.paymentUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${r.label}`));
    });

    // ОБНОВЛЕНО: Расчет арендного дохода с индексацией по годам
    const rentalIncomeMap = new Map();
    linesData.forEach(ld => {
      // Арендный доход начинается через 3 месяца после получения ключей
      const startRentalMonth = handoverMonth + 3;
      
      for (let month = startRentalMonth; month <= handoverMonth + months; month++) {
        const yearOffset = Math.floor((month - handoverMonth) / 12);
        const indexedPrice = getIndexedRentalPrice(ld.line.dailyRateUSD, ld.line.rentalPriceIndexPct, yearOffset);
        const daysInMonth = getDaysInMonth(month);
        const rentalIncome = indexedPrice * 0.55 * ld.line.occupancyPct / 100 * daysInMonth * ld.qty;
        
        if (rentalIncome > 0) {
          const prev = rentalIncomeMap.get(month) || 0;
          rentalIncomeMap.set(month, prev + rentalIncome);
        }
      }
    });

    // Объединяем платежи и арендный доход
    const raw = [...m.values()].sort((a, b) => a.month - b.month);
    let cumulative = 0;
    const cashflow = raw.map(row => {
      cumulative += row.amountUSD;
      const balanceUSD = Math.max(0, totals.finalUSD - cumulative);
      
      // Добавляем арендный доход для этого месяца
      const rentalIncome = rentalIncomeMap.get(row.month) || 0;
      const netPayment = row.amountUSD - rentalIncome;
      
      return {
        ...row, 
        cumulativeUSD: cumulative, 
        balanceUSD,
        rentalIncome, // НОВОЕ ПОЛЕ
        netPayment    // НОВОЕ ПОЛЕ
      };
    });

    return {totals, cashflow};
  }, [linesData, handoverMonth, months, t.firstPayment, startMonth]);

  // НОВЫЙ РАСЧЕТ: Годовая доходность от аренды
  const yearlyRentalData = useMemo(() => {
    return getCumulativeRentalIncome(lines);
  }, [lines, startMonth, handoverMonth]);

  // НОВЫЙ РАСЧЕТ: Общий чистый срок лизхолда
  const totalLeaseholdTerm = useMemo(() => {
    const allTerms = lines.map(line => {
      if (!line.snapshot?.leaseholdEndDate) return { years: 0, months: 0 };
      return getCleanLeaseholdTerm(line.snapshot.leaseholdEndDate);
    });
    
    const maxYears = Math.max(...allTerms.map(t => t.years));
    const maxMonths = Math.max(...allTerms.map(t => t.months));
    
    return { years: maxYears, months: maxMonths };
  }, [lines, startMonth, handoverMonth]);

// ... existing code ...

  // ... existing code ...

  // Функции для работы с линиями (ВОССТАНОВЛЕНЫ СТАРЫЕ)
  const updLine = (id, patch) => setLines(prev => prev.map(l => l.id === id ? {...l, ...patch} : l));
  const delLine = (id) => setLines(prev => prev.filter(l => l.id !== id));

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
      // ОБНОВЛЕНО: Новые поля для аренды с индексацией
      dailyRateUSD: villa.dailyRateUSD || 150,
      occupancyPct: 75,
      rentalPriceIndexPct: villa.rentalPriceIndexPct || 5,
      snapshot: {
        name: villa.name, 
        area: villa.area, 
        ppsm: villa.ppsm, 
        baseUSD: villa.baseUSD,
        leaseholdEndDate: villa.leaseholdEndDate
      }
    };
    setLines(prev => [...prev, newLine]);
    setModalOpen(false);
  };

  // Функции экспорта (ОБНОВЛЕНЫ С НОВЫМИ ПОЛЯМИ)
  const exportCSV = () => {
    const rows = [
      [t.month, t.description, t.amountDue, t.rentalIncome, t.netPayment, t.remainingBalance],
      ...project.cashflow.map(c => [
        formatMonth(c.month),
        (c.items || []).join(' + '),
        fmtMoney(c.amountUSD, currency),
        fmtMoney(c.rentalIncome || 0, currency),
        fmtMoney(c.netPayment || 0, currency),
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
      alert(t.xlsxNotLoaded);
      return;
    }
    
    const ws1 = XLSX.utils.json_to_sheet(project.cashflow.map(c => ({
      [t.month]: formatMonth(c.month),
      [t.description]: (c.items || []).join(' + '),
      [t.amountDue]: c.amountUSD,
      [t.rentalIncome]: c.rentalIncome || 0,
      [t.netPayment]: c.netPayment || 0,
      [t.remainingBalance]: c.balanceUSD
    })));
    
    const ws2 = XLSX.utils.json_to_sheet(linesData.map(ld => ({
      [t.project]: catalog.find(p => p.projectId === ld.line.projectId)?.projectName || ld.line.projectId,
      [t.villa]: ld.line.snapshot?.name,
      [t.qty]: ld.qty,
      [t.area]: ld.line.snapshot?.area,
      [t.ppsm]: ld.line.snapshot?.ppsm,
      [t.price]: ld.base,
      [t.discount]: (ld.discountPct || 0) + '%',
      [t.prePct]: ld.prePct,
      [t.months]: ld.vMonths,
      [t.lineTotal]: ld.lineTotal,
      [t.dailyRate]: ld.line.dailyRateUSD || 0,
      [t.occupancyRate]: ld.line.occupancyPct || 0,
      [t.rentalPriceIndex]: ld.line.rentalPriceIndexPct || 0,
      [t.leaseholdEndDate]: ld.line.snapshot?.leaseholdEndDate ? ld.line.snapshot.leaseholdEndDate.toLocaleDateString() : ''
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Cashflow');
    XLSX.utils.book_append_sheet(wb, ws2, 'Lines');
    XLSX.writeFile(wb, `arconique_installments_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportPDF = () => {
    if (typeof html2pdf === 'undefined') {
      alert(t.html2pdfNotLoaded);
      return;
    }
    
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${t.reportTitle}</title>
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
          .positive { color: #dc3545; font-weight: bold; }
          .negative { color: #28a745; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${t.reportTitle}</h1>
          <div class="date">${t.reportCreated} ${new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}</div>
        </div>
        
        <div class="summary">
          <h3>${t.projectSummary}</h3>
          <p><strong>${t.totalAmount}</strong> <span class="amount">${fmtMoney(project.totals.baseUSD, 'USD')}</span></p>
          <p><strong>${t.finalPrice}</strong> <span class="amount">${fmtMoney(project.totals.finalUSD, 'USD')}</span></p>
          <p><strong>${t.interest}</strong> <span class="amount">${fmtMoney(project.totals.interestUSD, 'USD')}</span></p>
          <p><strong>${t.cleanLeaseholdTerm}</strong> <span class="amount">${totalLeaseholdTerm.years} ${t.years} ${totalLeaseholdTerm.months} ${t.months}</span></p>
        </div>
        
        <h3>${t.monthlyCashflow}</h3>
        <table>
          <thead>
            <tr>
              <th>${t.month}</th>
              <th>${t.description}</th>
              <th>${t.amountDue}</th>
              <th>${t.rentalIncome}</th>
              <th>${t.netPayment}</th>
              <th>${t.remainingBalance}</th>
            </tr>
          </thead>
          <tbody>
            ${project.cashflow.map(c => `
              <tr>
                <td>${formatMonth(c.month)}</td>
                <td>${(c.items || []).join(' + ')}</td>
                <td class="amount">${fmtMoney(c.amountUSD, 'USD')}</td>
                <td class="amount">${fmtMoney(c.rentalIncome || 0, 'USD')}</td>
                <td class="amount ${c.netPayment >= 0 ? 'positive' : 'negative'}">${fmtMoney(c.netPayment || 0, 'USD')}</td>
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

  // Функция переключения режима (ВОССТАНОВЛЕНА СТАРАЯ)
  const toggleMode = () => {
    if (isClient) {
      const pin = prompt(t.enterPin);
      if (pin === PIN_CODE) {
        setIsClient(false);
        alert(t.editorActivated);
      } else if (pin !== null) {
        alert(t.wrongPin);
      }
    } else {
      setIsClient(true);
      alert(t.switchedToClient);
    }
  };

  // Функции для работы с этапами (ВОССТАНОВЛЕНЫ СТАРЫЕ)
  const addStage = () => {
    const newId = stages.length + 1;
    setStages(prev => [...prev, {id: newId, label: lang === 'ru' ? 'Новый этап' : 'New stage', pct: 5, month: 0}]);
  };

  const delStage = (id) => setStages(prev => prev.filter(s => s.id !== id));

  const updStage = (id, patch) => setStages(prev => prev.map(s => s.id === id ? {...s, ...patch} : s));

  return (
    <>
      {/* Внизу по порядку: */}
      
      {/* 1. Настройки (ВОССТАНОВЛЕН СТАРЫЙ ДИЗАЙН) */}
      <div className="card">
        {/* Ряд 1: Все настройки в один ряд */}
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

          {/* Курсы валют (только для редактора) - ВОССТАНОВЛЕНО СТАРОЕ ПОВЕДЕНИЕ */}
          {!isClient && (
            <>
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
            </>
          )}

          <div className="field compact">
            <label>{t.startMonth}</label>
            <div className="info-display">
              {startMonth.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>

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

        {/* Ряд 2: Кнопка переключения режима */}
        <div className="row">
          <button className="btn" onClick={toggleMode}>
            {isClient ? t.toggleToEditor : t.toggleToClient}
          </button>
        </div>
      </div>

      {/* 2. Расчёт (позиции) - ОБНОВЛЕН С НОВЫМИ ПОЛЯМИ ДЛЯ АРЕНДЫ */}
      <div className="card">
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
                {!isClient && <th className="col-disc">{t.discount}</th>}
                <th className="col-pre">{t.prePct}</th>
                {!isClient && <th className="col-months">{t.months}</th>}
                {!isClient && <th className="col-rate">{t.rate}</th>}
                {/* ОБНОВЛЕНО: Новые колонки для аренды с индексацией */}
                <th className="col-dailyRate">{t.dailyRate}</th>
                <th className="col-occupancyRate">{t.occupancyRate}</th>
                <th className="col-rentalIndex">{t.rentalPriceIndex}</th>
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
                  {!isClient && (
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
                  )}
                  <td className="col-pre">
                    {/* ВОССТАНОВЛЕН СТАРЫЙ ПОЛЗУНОК "До ключей, %" */}
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
                  {!isClient && (
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
                  )}
                  {!isClient && (
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
                  )}
                  
                  {/* ОБНОВЛЕНО: Новые поля для аренды с индексацией */}
                  <td className="col-dailyRate">
                    <input 
                      type="number" 
                      min="0" 
                      step="1" 
                      value={ld.line.dailyRateUSD || 150} 
                      onChange={e => updLine(ld.line.id, {dailyRateUSD: clamp(parseFloat(e.target.value || 0), 0, 10000)})}
                      style={{width: '100%', minWidth: '60px'}}
                    />
                  </td>
                  <td className="col-occupancyRate">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="1" 
                      value={ld.line.occupancyPct || 75} 
                      onChange={e => updLine(ld.line.id, {occupancyPct: clamp(parseFloat(e.target.value || 0), 0, 100)})}
                      style={{width: '100%', minWidth: '50px'}}
                    />
                  </td>
                  <td className="col-rentalIndex">
                    <input 
                      type="number" 
                      min="0" 
                      max="50" 
                      step="0.1" 
                      value={ld.line.rentalPriceIndexPct || 5} 
                      onChange={e => updLine(ld.line.id, {rentalPriceIndexPct: clamp(parseFloat(e.target.value || 0), 0, 50)})}
                      style={{width: '100%', minWidth: '50px'}}
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

      {/* 3. KPI показатели - ОБНОВЛЕН С НОВЫМ ПАРАМЕТРОМ ЛИЗХОЛДА */}
      <div className="card">
        <div className="row" style={{justifyContent: 'space-between', alignItems: 'baseline'}}>
          <div className="row">
            <span className="badge">{t.lines}: {lines.length}</span>
            <span className="badge">{t.keys} {handoverMonth} {lang === 'ru' ? 'мес.' : 'mo.'}</span>
            <span className="badge">{lang === 'ru' ? 'Срок:' : 'Term:'} {months} {lang === 'ru' ? 'мес.' : 'mo.'}</span>
          </div>
          <div className="muted">{isClient ? t.client : t.editor}</div>
        </div>

        {/* KPI блок - ОБНОВЛЕН С НОВЫМ ПАРАМЕТРОМ */}
        <div className="kpis">
          {!isClient && (
            <div className="kpi">
              <div className="muted">{t.totalAmount}</div>
              <div className="v">{fmtMoney(project.totals.baseUSD, currency)}</div>
            </div>
          )}
          <div className="kpi">
            <div className="muted">{t.amountDue}</div>
            <div className="v">{fmtMoney(project.totals.preUSD, currency)}</div>
          </div>
          <div className="kpi">
            <div className="muted">{t.after}</div>
            <div className="v">{fmtMoney(project.totals.afterUSD, currency)}</div>
          </div>
          {!isClient && (
            <div className="kpi">
              <div className="muted">{t.interest}</div>
              <div className="v">{fmtMoney(project.totals.interestUSD, currency)}</div>
            </div>
          )}
          <div className="kpi">
            <div className="muted">{t.finalPrice}</div>
            <div className="v">{fmtMoney(project.totals.finalUSD, currency)}</div>
          </div>
          {/* НОВЫЙ ПАРАМЕТР: Чистый срок лизхолда */}
          <div className="kpi">
            <div className="muted">{t.cleanLeaseholdTerm}</div>
            <div className="v">{totalLeaseholdTerm.years} {t.years} {totalLeaseholdTerm.months} {t.months}</div>
          </div>
        </div>
      </div>

      {/* 4. Базовая рассрочка - ВОССТАНОВЛЕН СТАРЫЙ ДИЗАЙН (БЕЗ БЕЛЫХ ПРЯМОУГОЛЬНИКОВ) */}
      <div className="card">
        <div className="stages-section">
          <h3>{t.stagesTitle}</h3>
          
          {/* ПРОСТАЯ ТАБЛИЦА БЕЗ БЕЛЫХ ПРЯМОУГОЛЬНИКОВ - ВОССТАНОВЛЕНО СТАРОЕ */}
          <table className="stages-table">
            <thead>
              <tr>
                <th>{t.stage}</th>
                <th>{t.percent}</th>
                <th>{t.month}</th>
                <th>{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {stages.map(stage => (
                <tr key={stage.id}>
                  <td>
                    <input 
                      type="text" 
                      value={stage.label} 
                      onChange={e => updStage(stage.id, {label: e.target.value})}
                      placeholder="Название этапа"
                      className="stage-input"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={stage.pct} 
                      onChange={e => updStage(stage.id, {pct: +e.target.value})}
                      placeholder="%"
                      className="stage-input-small"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={stage.month} 
                      onChange={e => updStage(stage.id, {month: +e.target.value})}
                      placeholder="Месяц"
                      className="stage-input-small"
                    />
                  </td>
                  <td>
                    <button onClick={() => delStage(stage.id)} className="btn danger small">
                      {t.delete}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="row" style={{marginTop: 8, alignItems: 'center', justifyContent: 'space-between'}}>
            <button className="btn primary" onClick={addStage}>{t.addStage}</button>
            <div className="pill">
              {t.stagesSum} {Math.round(stagesSumPct * 100) / 100}%
              {stagesSumPct !== 100 && (
                <span className="warning">
                  {stagesSumPct < 100 ? t.notEnough : t.exceeds} 100%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Сводный кэшфлоу по месяцам - ОБНОВЛЕН С НОВЫМИ КОЛОНКАМИ */}
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
                  <th>{t.month}</th>
                  <th style={{textAlign: 'left'}}>{t.description}</th>
                  <th>{t.amountDue}</th>
                  {/* НОВЫЕ КОЛОНКИ ДЛЯ АРЕНДЫ (ДОБАВЛЕНО) */}
                  <th>{t.rentalIncome}</th>
                  <th>{t.netPayment}</th>
                  {/* ОСТАТОК ДОЛГА ПЕРЕМЕЩЕН В ПОСЛЕДНЮЮ КОЛОНКУ */}
                  <th>{t.remainingBalance}</th>
                </tr>
              </thead>
              <tbody>
                {project.cashflow.map(c => (
                  <tr key={c.month}>
                    <td>{formatMonth(c.month)}</td>
                    <td style={{textAlign: 'left'}}>{(c.items || []).join(' + ')}</td>
                    <td>{fmtMoney(c.amountUSD, currency)}</td>
                    {/* НОВЫЕ КОЛОНКИ ДЛЯ АРЕНДЫ (ДОБАВЛЕНО) */}
                    <td>{fmtMoney(c.rentalIncome || 0, currency)}</td>
                    {/* ИСПРАВЛЕНО: Красный для положительных, зеленый для отрицательных */}
                    <td className={c.netPayment >= 0 ? 'positive' : 'negative'}>
                      {fmtMoney(c.netPayment || 0, currency)}
                    </td>
                    {/* ОСТАТОК ДОЛГА ПЕРЕМЕЩЕН В ПОСЛЕДНЮЮ КОЛОНКУ */}
                    <td>{fmtMoney(c.balanceUSD, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. НОВЫЙ БЛОК: График общей доходности от сдачи в аренду */}
      <div className="card">
        <h3>{t.rentalIncomeChart}</h3>
        <div className="rental-chart">
          <div className="chart-container">
            {yearlyRentalData.map((yearData, index) => (
              <div key={index} className="chart-bar">
                <div className="bar-label">{yearData.year === 0 ? t.keys : `${yearData.year} ${t.years}`}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{
                      height: `${Math.max(10, (yearData.yearIncome / Math.max(...yearlyRentalData.map(y => y.yearIncome))) * 200)}px`,
                      backgroundColor: yearData.year === 0 ? '#e2e8f0' : '#3b82f6'
                    }}
                  ></div>
                </div>
                <div className="bar-values">
                  <div className="year-income">{fmtMoney(yearData.yearIncome, currency)}</div>
                  <div className="cumulative-income">{fmtMoney(yearData.cumulativeIncome, currency)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: '#3b82f6'}}></div>
              <span>{t.totalIncome}</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{backgroundColor: '#e2e8f0'}}></div>
              <span>{t.cumulativeIncome}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Каталог проектов и вилл (только для редактора) - ОБНОВЛЕН С НОВЫМИ ПОЛЯМИ */}
      {!isClient && (
        <div className="editor-mode">
          <h2>{t.catalogTitle}</h2>
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

      {/* Модальные окна - ОБНОВЛЕНЫ С НОВЫМИ ПОЛЯМИ */}
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
                        <span>{t.dailyRate}: ${villa.dailyRateUSD} | {t.rentalPriceIndex}: {villa.rentalPriceIndexPct}%</span>
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
            {/* НОВЫЕ ПОЛЯ ДЛЯ ЛИЗХОЛДА И АРЕНДЫ */}
            <div className="form-group">
              <label>{t.leaseholdEndDate}:</label>
              <input 
                type="date" 
                value={newVillaForm.leaseholdEndDate ? newVillaForm.leaseholdEndDate.toISOString().split('T')[0] : ''} 
                onChange={e => setNewVillaForm(prev => ({...prev, leaseholdEndDate: new Date(e.target.value)}))}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>{t.dailyRate}:</label>
              <input 
                type="number" 
                value={newVillaForm.dailyRateUSD} 
                onChange={e => setNewVillaForm(prev => ({...prev, dailyRateUSD: +e.target.value}))}
                placeholder="Стоимость ночи"
                className="input"
              />
            </div>
            <div className="form-group">
              <label>{t.rentalPriceIndex}:</label>
              <input 
                type="number" 
                value={newVillaForm.rentalPriceIndexPct} 
                onChange={e => setNewVillaForm(prev => ({...prev, rentalPriceIndexPct: +e.target.value}))}
                placeholder="Индексация в год (%)"
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

// ===== КОМПОНЕНТ КАТАЛОГА - ОБНОВЛЕН С НОВЫМИ ПОЛЯМИ =====
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
    
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.villas.some(villa => 
          villa.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
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
    if (confirm(t.deleteProjectConfirm)) {
      setCatalog(prev => prev.filter(p => p.projectId !== projectId));
    }
  };

  const deleteVilla = (projectId, villaId) => {
    if (confirm(t.deleteVillaConfirm)) {
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
            alert(t.catalogImported);
          } else {
            alert(t.wrongFileFormat);
          }
        } catch (error) {
          alert(t.importError);
        }
      };
      reader.readAsText(file);
    }
  };

  // ... existing code ...

  return (
    <div className="catalog-section">
      {/* Панель управления */}
      <div className="catalog-controls">
        <div className="search-filters">
          <input 
            type="text" 
            placeholder={t.searchPlaceholder} 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
            <option value="name">{t.sortByName}</option>
            <option value="price">{t.sortByPrice}</option>
            <option value="area">{t.sortByArea}</option>
          </select>
          
          <div className="filter-group">
            <input 
              type="number" 
              placeholder={t.areaFrom} 
              value={areaFilter.from} 
              onChange={e => setAreaFilter(prev => ({...prev, from: e.target.value}))}
              className="filter-input"
            />
            <span>-</span>
            <input 
              type="number" 
              placeholder={t.areaTo} 
              value={areaFilter.to} 
              onChange={e => setAreaFilter(prev => ({...prev, to: e.target.value}))}
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <input 
              type="number" 
              placeholder={t.priceFrom} 
              value={priceFilter.from} 
              onChange={e => setPriceFilter(prev => ({...prev, from: e.target.value}))}
              className="filter-input"
            />
            <span>-</span>
            <input 
              type="number" 
              placeholder={t.priceTo} 
              value={priceFilter.to} 
              onChange={e => setPriceFilter(prev => ({...prev, to: e.target.value}))}
              className="filter-input"
            />
          </div>
        </div>
        
        <div className="catalog-actions">
          <button onClick={() => setShowAddProjectModal(true)} className="btn primary">
            {t.addProject}
          </button>
          <button onClick={() => setShowAddVillaModal(true)} className="btn success">
            {t.addVilla}
          </button>
          <button onClick={exportCatalog} className="btn">
            {t.exportCatalog}
          </button>
          <label className="btn import-btn">
            {t.importCatalog}
            <input 
              type="file" 
              accept=".json" 
              onChange={importCatalog} 
              style={{display: 'none'}}
            />
          </label>
        </div>
      </div>

      {/* Список проектов и вилл */}
      <div className="catalog-list">
        {filteredCatalog.map(project => (
          <div key={project.projectId} className="project-card">
            <div className="project-header">
              <h3>{project.projectName}</h3>
              <div className="project-actions">
                <button 
                  onClick={() => setEditingProject(project)} 
                  className="btn small"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => deleteProject(project.projectId)} 
                  className="btn danger small"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="villas-grid">
              {project.villas.map(villa => (
                <div key={villa.villaId} className="villa-card">
                  <div className="villa-header">
                    <h4>{villa.name}</h4>
                    <div className="villa-actions">
                      <button 
                        onClick={() => setNewVillaForm(villa)} 
                        className="btn small"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => deleteVilla(project.projectId, villa.villaId)} 
                        className="btn danger small"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="villa-details">
                    <div className="detail-row">
                      <span className="label">{t.villaArea}:</span>
                      <span className="value">{villa.area} м²</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">{t.villaPpsm}:</span>
                      <span className="value">${villa.ppsm}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">{t.villaBasePrice}:</span>
                      <span className="value">{fmtMoney(villa.baseUSD, 'USD')}</span>
                    </div>
                    {/* НОВЫЕ ПОЛЯ ДЛЯ ЛИЗХОЛДА И АРЕНДЫ */}
                    <div className="detail-row">
                      <span className="label">{t.leaseholdEndDate}:</span>
                      <span className="value">
                        {villa.leaseholdEndDate ? 
                          villa.leaseholdEndDate.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US') : 
                          t.notSet
                        }
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">{t.dailyRate}:</span>
                      <span className="value">${villa.dailyRateUSD || 150}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">{t.rentalPriceIndex}:</span>
                      <span className="value">{villa.rentalPriceIndexPct || 5}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно редактирования проекта */}
      {editingProject && (
        <div className="modal-overlay" onClick={() => setEditingProject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t.editProject}</h3>
            <div className="form-group">
              <label>{t.projectName}:</label>
              <input 
                type="text" 
                value={editingProject.projectName} 
                onChange={e => setEditingProject(prev => ({...prev, projectName: e.target.value}))}
                className="input"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => {
                setCatalog(prev => prev.map(p => 
                  p.projectId === editingProject.projectId ? editingProject : p
                ));
                setEditingProject(null);
              }} className="btn primary">
                {t.save}
              </button>
              <button onClick={() => setEditingProject(null)} className="btn">
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== РЕНДЕРИНГ ПРИЛОЖЕНИЯ =====
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
