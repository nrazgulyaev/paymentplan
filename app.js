// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE (С ЛИЗХОЛДОМ, ИНДЕКСАЦИЕЙ И ЦЕНООБРАЗОВАНИЕМ) =====

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
  
  // НОВЫЕ ПАРАМЕТРЫ ЦЕНООБРАЗОВАНИЯ
  const [pricingConfig, setPricingConfig] = useState({
    inflationRatePct: 10,      // 10% годовой рост
    leaseAlpha: 1,             // линейное убывание
    agingBeta: 0.025,          // 2.5% в год
    brandPeak: 1.2,            // пик бренда 120%
    brandRampYears: 3,         // рост за 3 года
    brandPlateauYears: 4,      // плато 4 года
    brandDecayYears: 8,        // спад за 8 лет
    brandTail: 1.0             // финальное значение 100%
  });
  
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
      occupancyRate: 70, // Средняя заполняемость за месяц (%)
      rentalPriceIndexPct: 5 // Годовая индексация арендных цен (%)
    }
  ]);
  
  // Состояние для модальных окон
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = useState(false);
  const [showPricingConfigModal, setShowPricingConfigModal] = useState(false);
  const [showVillaPricingModal, setShowVillaPricingModal] = useState(false);
  
  // Формы для добавления
  const [newProjectForm, setNewProjectForm] = useState({
    projectId: '',
    projectName: '',
    villas: []
  });
  
  const [newVillaForm, setNewVillaForm] = useState({
    villaId: '',
    name: '',
    area: 0,
    ppsm: 0,
    baseUSD: 0,
    leaseholdEndDate: new Date(2030, 11, 31),
    dailyRateUSD: 150,
    rentalPriceIndexPct: 5
  });
  
  // Состояние для выбора проекта и виллы
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedVillaId, setSelectedVillaId] = useState('');
  // ОБНОВЛЕНО: Переводы с новыми полями для ценообразования
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
      addLine: 'Добавить позицию',
      project: 'Проект',
      villa: 'Вилла',
      qty: 'Кол-во',
      prePct: 'Предоплата %',
      ownTerms: 'Свои условия',
      months: 'Месяцев',
      monthlyRatePct: 'Ставка %/мес',
      firstPostUSD: 'Первый пост-платеж USD',
      discountPct: 'Скидка %',
      // НОВЫЕ ПОЛЯ ДЛЯ ЛИЗХОЛДА И ИНДЕКСАЦИИ:
      dailyRate: 'Стоимость проживания в сутки (USD)',
      occupancyRate: 'Средняя заполняемость за месяц (%)',
      rentalIncome: 'Прогнозируемый доход от аренды в месяц',
      netPayment: 'Чистый платеж/доход в месяц',
      leaseholdEndDate: 'Дата окончания лизхолда',
      rentalPriceIndexPct: 'Годовая индексация арендных цен (%)',
      // НОВЫЕ ПОЛЯ ДЛЯ ЦЕНООБРАЗОВАНИЯ:
      pricingConfigTitle: 'Параметры ценообразования',
      inflationRate: 'Инфляция рынка вилл (%/год)',
      leaseAlpha: 'Степень убывания lease (α)',
      agingBeta: 'Коэффициент старения (β)',
      brandPeak: 'Пик бренда',
      brandRampYears: 'Годы роста',
      brandPlateauYears: 'Годы плато',
      brandDecayYears: 'Годы спада',
      brandTail: 'Финальное значение',
      calculationParams: 'Параметры расчёта',
      inflation: 'Инфляция',
      aging: 'Старение',
      leaseDecay: 'Убывание lease',
      brandFactor: 'Бренд-фактор',
      years: 'Годы',
      leaseFactor: 'Lease Factor',
      ageFactor: 'Age Factor',
      brandFactorValue: 'Brand Factor',
      marketPrice: 'Рыночная цена',
      finalPrice: 'Итоговая цена',
      // ПОЛЯ ДЛЯ КАТАЛОГА:
      catalogTitle: 'Каталог проектов и вилл',
      addProject: 'Добавить проект',
      addVilla: 'Добавить виллу',
      editVilla: 'Редактировать виллу',
      projectName: 'Название проекта',
      villaName: 'Название виллы',
      area: 'Площадь (м²)',
      ppsm: 'Цена за м²',
      basePrice: 'Базовая цена (USD)',
      // ПОЛЯ ДЛЯ РАСЧЁТА:
      base: 'База',
      preTotal: 'Предоплата',
      postTotal: 'Пост-платежи',
      lineTotal: 'Итого по позиции',
      interestTotal: 'Проценты',
      grandTotal: 'Общий итог',
      // ПОЛЯ ДЛЯ КЭШФЛОУ:
      cashflowTitle: 'Кэшфлоу по месяцам',
      month: 'Месяц',
      description: 'Описание',
      amount: 'Сумма',
      // ПОЛЯ ДЛЯ ЭКСПОРТА:
      exportTitle: 'Экспорт',
      exportCSV: 'CSV',
      exportExcel: 'Excel',
      exportPDF: 'PDF',
      reportTitle: 'Отчёт по рассрочке',
      // ПОЛЯ ДЛЯ РЕДАКТОРА:
      editorMode: 'Редакторский режим',
      clientMode: 'Клиентский режим',
      enterPin: 'Введите PIN-код',
      pinIncorrect: 'Неверный PIN-код',
      // ПОЛЯ ДЛЯ УВЕДОМЛЕНИЙ:
      projectNameRequired: 'Название проекта обязательно',
      projectExists: 'Проект с таким ID уже существует',
      villaNameRequired: 'Название виллы обязательно',
      // ПОЛЯ ДЛЯ ГРАФИКА:
      chartTitle: 'График ценообразования',
      chartSubtitle: 'Динамика цены виллы по годам',
      // ПОЛЯ ДЛЯ ТАБЛИЦЫ:
      tableTitle: 'Таблица факторов по годам',
      year: 'Год',
      price: 'Цена (USD)',
      // ПОЛЯ ДЛЯ МОДАЛЬНЫХ ОКОН:
      save: 'Сохранить',
      cancel: 'Отмена',
      close: 'Закрыть',
      // ПОЛЯ ДЛЯ ВАЛИДАЦИИ:
      invalidValue: 'Некорректное значение',
      // ПОЛЯ ДЛЯ ЗАГРУЗКИ:
      html2pdfNotLoaded: 'html2pdf не загружен',
      // ПОЛЯ ДЛЯ АРЕНДЫ:
      rentalIncomeTitle: 'Прогноз доходности от аренды',
      monthlyRental: 'Месячный доход от аренды',
      annualRental: 'Годовой доход от аренды',
      cumulativeRental: 'Накопительный доход',
      roi: 'ROI (%)',
      paybackYears: 'Срок окупаемости (лет)'
    },
    en: {
      title: 'Arconique / Installment Calculator for Beloved Clients',
      lang: 'Interface Language',
      currencyDisplay: 'Display Currency',
      idrRate: 'IDR per 1 USD',
      eurRate: 'EUR per 1 USD',
      handoverMonth: 'Handover Month',
      globalTerm: 'Global post-handover term (6-24 months)',
      globalRate: 'Global rate, %/month',
      clientTerm: 'Post-handover term (months)',
      startMonth: 'Start month',
      stagesTitle: 'Base Installment',
      stage: 'Stage',
      percent: '%',
      month: 'Month',
      addStage: 'Add Stage',
      delete: 'Delete',
      addLine: 'Add Line',
      project: 'Project',
      villa: 'Villa',
      qty: 'Qty',
      prePct: 'Pre-payment %',
      ownTerms: 'Own Terms',
      months: 'Months',
      monthlyRatePct: 'Rate %/month',
      firstPostUSD: 'First post-payment USD',
      discountPct: 'Discount %',
      // NEW FIELDS FOR LEASEHOLD AND INDEXATION:
      dailyRate: 'Daily accommodation rate (USD)',
      occupancyRate: 'Average monthly occupancy (%)',
      rentalIncome: 'Projected monthly rental income',
      netPayment: 'Net monthly payment/income',
      leaseholdEndDate: 'Leasehold end date',
      rentalPriceIndexPct: 'Annual rental price indexation (%)',
      // NEW FIELDS FOR PRICING:
      pricingConfigTitle: 'Pricing Parameters',
      inflationRate: 'Villa market inflation (%/year)',
      leaseAlpha: 'Lease decay degree (α)',
      agingBeta: 'Aging coefficient (β)',
      brandPeak: 'Brand peak',
      brandRampYears: 'Growth years',
      brandPlateauYears: 'Plateau years',
      brandDecayYears: 'Decay years',
      brandTail: 'Final value',
      calculationParams: 'Calculation Parameters',
      inflation: 'Inflation',
      aging: 'Aging',
      leaseDecay: 'Lease Decay',
      brandFactor: 'Brand Factor',
      years: 'Years',
      leaseFactor: 'Lease Factor',
      ageFactor: 'Age Factor',
      brandFactorValue: 'Brand Factor',
      marketPrice: 'Market Price',
      finalPrice: 'Final Price',
      // CATALOG FIELDS:
      catalogTitle: 'Projects and Villas Catalog',
      addProject: 'Add Project',
      addVilla: 'Add Villa',
      editVilla: 'Edit Villa',
      projectName: 'Project Name',
      villaName: 'Villa Name',
      area: 'Area (m²)',
      ppsm: 'Price per m²',
      basePrice: 'Base Price (USD)',
      // CALCULATION FIELDS:
      base: 'Base',
      preTotal: 'Pre-payment',
      postTotal: 'Post-payments',
      lineTotal: 'Line Total',
      interestTotal: 'Interest',
      grandTotal: 'Grand Total',
      // CASHFLOW FIELDS:
      cashflowTitle: 'Monthly Cashflow',
      month: 'Month',
      description: 'Description',
      amount: 'Amount',
      // EXPORT FIELDS:
      exportTitle: 'Export',
      exportCSV: 'CSV',
      exportExcel: 'Excel',
      exportPDF: 'PDF',
      reportTitle: 'Installment Report',
      // EDITOR FIELDS:
      editorMode: 'Editor Mode',
      clientMode: 'Client Mode',
      enterPin: 'Enter PIN code',
      pinIncorrect: 'Incorrect PIN code',
      // NOTIFICATION FIELDS:
      projectNameRequired: 'Project name is required',
      projectExists: 'Project with this ID already exists',
      villaNameRequired: 'Villa name is required',
      // CHART FIELDS:
      chartTitle: 'Pricing Chart',
      chartSubtitle: 'Villa price dynamics by years',
      // TABLE FIELDS:
      tableTitle: 'Factors table by years',
      year: 'Year',
      price: 'Price (USD)',
      // MODAL FIELDS:
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      // VALIDATION FIELDS:
      invalidValue: 'Invalid value',
      // LOADING FIELDS:
      html2pdfNotLoaded: 'html2pdf not loaded',
      // RENTAL FIELDS:
      rentalIncomeTitle: 'Rental Income Forecast',
      monthlyRental: 'Monthly rental income',
      annualRental: 'Annual rental income',
      cumulativeRental: 'Cumulative income',
      roi: 'ROI (%)',
      paybackYears: 'Payback period (years)'
    }
  };
  
  const t = T[lang];
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
    
    const now = new Date();
    const end = new Date(leaseholdEndDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return { years: 0, months: 0 };
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    return { years, months };
  };

  // НОВЫЕ ФУНКЦИИ ДЛЯ ЦЕНООБРАЗОВАНИЯ:
  
  // Функция расчета lease factor
  const leaseFactor = (year, totalYears, alpha = 1) => {
    if (year >= totalYears) return 0;
    return Math.pow((totalYears - year) / totalYears, alpha);
  };

  // Функция расчета age factor
  const ageFactor = (year, beta = 0.025) => {
    return Math.exp(-beta * year);
  };

  // Функция расчета brand factor
  const brandFactor = (year, config) => {
    const { brandPeak, brandRampYears, brandPlateauYears, brandDecayYears, brandTail } = config;
    
    if (year <= brandRampYears) {
      // Рост
      return 1.0 + (brandPeak - 1.0) * (year / brandRampYears);
    } else if (year <= brandRampYears + brandPlateauYears) {
      // Плато
      return brandPeak;
    } else if (year <= brandRampYears + brandPlateauYears + brandDecayYears) {
      // Спад
      const decayYear = year - brandRampYears - brandPlateauYears;
      const decayProgress = decayYear / brandDecayYears;
      return brandPeak - (brandPeak - brandTail) * decayProgress;
    } else {
      // После спада
      return brandTail;
    }
  };

  // Функция расчета цены виллы в определенном году
  const calculateVillaPrice = (villa, yearOffset) => {
    if (!villa || !villa.leaseholdEndDate) return 0;
    
    const P0 = villa.baseUSD;
    const T = getCleanLeaseholdTerm(villa.leaseholdEndDate).years;
    const g = pricingConfig.inflationRatePct / 100;
    const alpha = pricingConfig.leaseAlpha;
    const beta = pricingConfig.agingBeta;
    
    if (yearOffset >= T) return 0;
    
    const inflationFactor = Math.pow(1 + g, yearOffset);
    const leaseFactorValue = leaseFactor(yearOffset, T, alpha);
    const ageFactorValue = ageFactor(yearOffset, beta);
    const brandFactorValue = brandFactor(yearOffset, pricingConfig);
    
    return P0 * inflationFactor * leaseFactorValue * ageFactorValue * brandFactorValue;
  };

  // Функция генерации данных для графика ценообразования
  const generatePricingData = (villa) => {
    if (!villa || !villa.leaseholdEndDate) return [];
    
    const T = getCleanLeaseholdTerm(villa.leaseholdEndDate).years;
    const data = [];
    
    for (let year = 0; year <= T; year++) {
      const marketPrice = villa.baseUSD * Math.pow(1 + pricingConfig.inflationRatePct / 100, year);
      const finalPrice = calculateVillaPrice(villa, year);
      
      data.push({
        year,
        marketPrice,
        finalPrice,
        leaseFactor: leaseFactor(year, T, pricingConfig.leaseAlpha),
        ageFactor: ageFactor(year, pricingConfig.agingBeta),
        brandFactor: brandFactor(year, pricingConfig)
      });
    }
    
    return data;
  };

  // Функция расчета арендного дохода с индексацией
  const calculateRentalIncome = (villa, monthOffset) => {
    if (!villa) return 0;
    
    const daysInMonth = getDaysInMonth(monthOffset);
    const baseDailyRate = villa.dailyRateUSD;
    const occupancyRate = villa.occupancyRate / 100;
    const annualIndexation = villa.rentalPriceIndexPct / 100;
    
    // Индексация по месяцам (годовая ставка делится на 12)
    const monthlyIndexation = Math.pow(1 + annualIndexation, monthOffset / 12);
    const adjustedDailyRate = baseDailyRate * monthlyIndexation;
    
    return adjustedDailyRate * daysInMonth * occupancyRate;
  };

  // Функция расчета накопительного арендного дохода
  const calculateCumulativeRentalIncome = (villa, months) => {
    let total = 0;
    for (let month = 0; month < months; month++) {
      total += calculateRentalIncome(villa, month);
    }
    return total;
  };

  // Функция расчета ROI от аренды
  const calculateRentalROI = (villa, months) => {
    const cumulativeIncome = calculateCumulativeRentalIncome(villa, months);
    const investment = villa.baseUSD;
    return (cumulativeIncome / investment) * 100;
  };

  // Функция расчета срока окупаемости
  const calculatePaybackPeriod = (villa) => {
    const monthlyIncome = calculateRentalIncome(villa, 0);
    if (monthlyIncome <= 0) return Infinity;
    
    const investment = villa.baseUSD;
    return investment / monthlyIncome / 12; // в годах
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
      projectId: newProjectId,
      projectName: newProjectForm.projectName,
      villas: []
    };

    setCatalog(prev => [...prev, newProject]);
    setShowAddProjectModal(false);
    setNewProjectForm({ projectId: '', projectName: '', villas: [] });
  };

  const deleteProject = (projectId) => {
    if (confirm('Удалить проект?')) {
      setCatalog(prev => prev.filter(p => p.projectId !== projectId));
      setLines(prev => prev.filter(l => l.projectId !== projectId));
    }
  };

  // Функции для работы с виллами
  const addVilla = (projectId) => {
    setNewVillaForm({
      villaId: '',
      name: '',
      area: 0,
      ppsm: 0,
      baseUSD: 0,
      leaseholdEndDate: new Date(2030, 11, 31),
      dailyRateUSD: 150,
      rentalPriceIndexPct: 5
    });
    setSelectedProjectId(projectId);
    setShowAddVillaModal(true);
  };

  const saveVilla = () => {
    if (!newVillaForm.name) {
      alert(t.villaNameRequired);
      return;
    }

    const newVillaId = `${selectedProjectId}-${newVillaForm.name.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    
    const newVilla = {
      villaId: newVillaId,
      name: newVillaForm.name,
      area: newVillaForm.area,
      ppsm: newVillaForm.ppsm,
      baseUSD: newVillaForm.baseUSD,
      leaseholdEndDate: newVillaForm.leaseholdEndDate,
      dailyRateUSD: newVillaForm.dailyRateUSD,
      rentalPriceIndexPct: newVillaForm.rentalPriceIndexPct
    };

    setCatalog(prev => prev.map(p => 
      p.projectId === selectedProjectId 
        ? { ...p, villas: [...p.villas, newVilla] }
        : p
    ));

    setShowAddVillaModal(false);
    setNewVillaForm({
      villaId: '',
      name: '',
      area: 0,
      ppsm: 0,
      baseUSD: 0,
      leaseholdEndDate: new Date(2030, 11, 31),
      dailyRateUSD: 150,
      rentalPriceIndexPct: 5
    });
  };

  const editVilla = (projectId, villaId) => {
    const project = catalog.find(p => p.projectId === projectId);
    const villa = project?.villas.find(v => v.villaId === villaId);
    
    if (villa) {
      setNewVillaForm({
        villaId: villa.villaId,
        name: villa.name,
        area: villa.area,
        ppsm: villa.ppsm,
        baseUSD: villa.baseUSD,
        leaseholdEndDate: villa.leaseholdEndDate,
        dailyRateUSD: villa.dailyRateUSD,
        rentalPriceIndexPct: villa.rentalPriceIndexPct
      });
      setSelectedProjectId(projectId);
      setShowAddVillaModal(true);
    }
  };

  const deleteVilla = (projectId, villaId) => {
    if (confirm('Удалить виллу?')) {
      setCatalog(prev => prev.map(p => 
        p.projectId === projectId 
          ? { ...p, villas: p.villas.filter(v => v.villaId !== villaId) }
          : p
      ));
      setLines(prev => prev.filter(l => !(l.projectId === projectId && l.villaId === villaId)));
    }
  };

  // Функции для работы с этапами
  const addStage = () => {
    const newId = Math.max(...stages.map(s => s.id), 0) + 1;
    setStages(prev => [...prev, { id: newId, label: '', pct: 0, month: 0 }]);
  };

  const updateStage = (id, field, value) => {
    setStages(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const deleteStage = (id) => {
    setStages(prev => prev.filter(s => s.id !== id));
  };

  // Функции для работы с линиями
  const addLine = () => {
    const newId = Math.max(...lines.map(l => l.id), 0) + 1;
    setLines(prev => [...prev, {
      id: newId,
      projectId: '',
      villaId: '',
      qty: 1,
      prePct: 70,
      ownTerms: false,
      months: null,
      monthlyRatePct: null,
      firstPostUSD: 0,
      discountPct: 0,
      dailyRateUSD: 150,
      occupancyRate: 70,
      rentalPriceIndexPct: 5
    }]);
  };

  const updateLine = (id, field, value) => {
    setLines(prev => prev.map(l => 
      l.id === id ? { ...l, [field]: value } : l
    ));
  };

  const deleteLine = (id) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  // Функция переключения режимов
  const toggleMode = () => {
    if (isClient) {
      const pin = prompt(t.enterPin);
      if (pin === PIN_CODE) {
        setIsClient(false);
      } else {
        alert(t.pinIncorrect);
      }
    } else {
      setIsClient(true);
    }
  };

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

    // Этапы рассрочки
    stages.forEach(stage => {
      if (stage.pct > 0) {
        const amount = (totals.baseUSD * stage.pct / 100);
        push(stage.month, amount, `${stage.label} (${stage.pct}%)`);
      }
    });

    // Post-handover платежи
    linesData.forEach(line => {
      if (line.postTotal > 0) {
        const monthlyPayment = line.postTotal / line.months;
        for (let i = 0; i < line.months; i++) {
          const month = handoverMonth + i;
          push(month, monthlyPayment, `${line.villaName} (месяц ${i + 1})`);
        }
      }
    });

    // НОВАЯ ЛОГИКА: Арендный доход с индексацией
    linesData.forEach(line => {
      if (line.dailyRateUSD > 0) {
        // Расчет арендного дохода по месяцам
        for (let month = handoverMonth; month < handoverMonth + 60; month++) { // 5 лет прогноза
          const monthOffset = month - handoverMonth;
          const rentalIncome = calculateRentalIncome(line, monthOffset);
          
          if (rentalIncome > 0) {
            push(month, -rentalIncome, `${line.villaName} - аренда (месяц ${monthOffset + 1})`);
          }
        }
      }
    });

    return {
      totals,
      cashflow: Array.from(m.values()).sort((a, b) => a.month - b.month)
    };
  }, [linesData, stages, handoverMonth]);

  // Данные линий с расчетами
  const linesData = useMemo(() => {
    return lines.map(line => {
      const villa = catalog
        .flatMap(p => p.villas)
        .find(v => v.villaId === line.villaId);
      
      if (!villa) return { ...line, base: 0, preTotal: 0, postTotal: 0, lineTotal: 0 };

      const base = villa.baseUSD * line.qty;
      const preTotal = base * line.prePct / 100;
      const afterTotal = base - preTotal;
      
      let postTotal = 0;
      let months = line.months || months;
      let rate = line.monthlyRatePct || monthlyRatePct;

      if (line.ownTerms && line.months && line.monthlyRatePct) {
        months = line.months;
        rate = line.monthlyRatePct;
      }

      if (months > 0 && rate > 0) {
        const monthlyPayment = (afterTotal * (1 + rate / 100)) / months;
        postTotal = monthlyPayment * months;
      }

      const lineTotal = preTotal + postTotal;
      const discount = lineTotal * line.discountPct / 100;
      const finalTotal = lineTotal - discount;

      return {
        ...line,
        villaName: villa.name,
        projectName: catalog.find(p => p.projectId === line.projectId)?.projectName || '',
        base,
        preTotal,
        postTotal: finalTotal - preTotal,
        lineTotal: finalTotal,
        // НОВЫЕ ПОЛЯ ДЛЯ АРЕНДЫ:
        dailyRateUSD: line.dailyRateUSD || villa.dailyRateUSD || 0,
        occupancyRate: line.occupancyRate || 70,
        rentalPriceIndexPct: line.rentalPriceIndexPct || villa.rentalPriceIndexPct || 5,
        // НОВЫЕ ПОЛЯ ДЛЯ ЦЕНООБРАЗОВАНИЯ:
        leaseholdEndDate: villa.leaseholdEndDate,
        area: villa.area,
        ppsm: villa.ppsm
      };
    });
  }, [lines, catalog, months, monthlyRatePct]);

  // Функции экспорта
  const exportCSV = () => {
    const csvContent = [
      ['Месяц', 'Описание', 'Сумма USD'],
      ...project.cashflow.map(row => [
        formatMonth(row.month),
        row.items.join('; '),
        row.amountUSD.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cashflow.csv';
    link.click();
  };

  const exportExcel = () => {
    // Простой экспорт в Excel через CSV
    exportCSV();
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
          th { background: #f5f5f5; font-weight: bold; }
          .totals { margin-top: 30px; padding: 20px; background: #f9f9f9; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${t.reportTitle}</h1>
          <div class="date">${new Date().toLocaleDateString()}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>${t.month}</th>
              <th>${t.description}</th>
              <th>${t.amount}</th>
            </tr>
          </thead>
          <tbody>
            ${project.cashflow.map(row => `
              <tr>
                <td>${formatMonth(row.month)}</td>
                <td>${row.items.join('; ')}</td>
                <td>${row.amountUSD.toFixed(2)} USD</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <h3>Итого:</h3>
          <p><strong>Базовая стоимость:</strong> ${project.totals.baseUSD.toFixed(2)} USD</p>
          <p><strong>Предоплата:</strong> ${project.totals.preUSD.toFixed(2)} USD</p>
          <p><strong>Итоговая стоимость:</strong> ${project.totals.finalUSD.toFixed(2)} USD</p>
          <p><strong>Проценты:</strong> ${project.totals.interestUSD.toFixed(2)} USD</p>
        </div>
      </body>
      </html>
    `;
    
    html2pdf().from(pdfContent).save('cashflow-report.pdf');
  };

    // Функция переключения языка
  const toggleLang = () => {
    setLang(prev => prev === 'ru' ? 'en' : 'ru');
  };

  // Функция форматирования валюты
  const formatCurrency = (amount, curr = currency) => {
    if (curr === 'USD') return `$${amount.toFixed(2)}`;
    if (curr === 'IDR') return `Rp${(amount * idrPerUsd).toFixed(0)}`;
    if (curr === 'EUR') return `€${(amount * eurPerUsd).toFixed(2)}`;
    return amount.toFixed(2);
  };

  // Основной рендеринг
  return (
    <div className="wrap">
      <h1>{t.title}</h1>
      
      {/* Панель настроек */}
      <div className="card">
        <div className="card-header">
          <h3>⚙️ {t.lang}</h3>
          <div className="card-actions">
            <button className="btn" onClick={toggleLang}>
              {lang === 'ru' ? '🇺🇸 EN' : '��🇺 RU'}
            </button>
            <button className="btn" onClick={toggleMode}>
              {isClient ? '🔓' : '🔒'}
            </button>
          </div>
        </div>
        
        <div className="row">
          <div className="field">
            <label>{t.currencyDisplay}</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="IDR">IDR</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          
          <div className="field">
            <label>{t.idrRate}</label>
            <input 
              type="number" 
              value={idrPerUsd} 
              onChange={e => setIdrPerUsd(+e.target.value)}
              placeholder="IDR per USD"
            />
          </div>
          
          <div className="field">
            <label>{t.eurRate}</label>
            <input 
              type="number" 
              value={eurPerUsd} 
              onChange={e => setEurPerUsd(+e.target.value)}
              placeholder="EUR per USD"
            />
          </div>
        </div>
        
        <div className="row">
          <div className="field">
            <label>{t.handoverMonth}</label>
            <input 
              type="number" 
              min="0" 
              max="60" 
              value={handoverMonth} 
              onChange={e => setHandoverMonth(+e.target.value)}
              placeholder="Месяц получения ключей"
            />
          </div>
          
          <div className="field">
            <label>{t.globalTerm}</label>
            <input 
              type="number" 
              min="6" 
              max="24" 
              value={months} 
              onChange={e => setMonths(+e.target.value)}
              placeholder="Срок post-handover"
            />
          </div>
          
          <div className="field">
            <label>{t.globalRate}</label>
            <input 
              type="number" 
              min="0" 
              max="100" 
              step="0.01" 
              value={monthlyRatePct} 
              onChange={e => setMonthlyRatePct(+e.target.value)}
              placeholder="Ставка %/мес"
            />
          </div>
          
          <div className="field">
            <label>{t.startMonth}</label>
            <input 
              type="date" 
              value={startMonth.toISOString().split('T')[0]} 
              onChange={e => setStartMonth(new Date(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* НОВЫЙ БЛОК: Параметры ценообразования (только для редактора) */}
      {!isClient && (
        <div className="card">
          <div className="card-header">
            <h3>📊 {t.pricingConfigTitle}</h3>
            <div className="card-actions">
              <button className="btn primary" onClick={() => setShowPricingConfigModal(true)}>
                ⚙️ Настроить
              </button>
            </div>
          </div>
          
          <div className="pricing-grid-compact">
            {/* Инфляция */}
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.inflationRate}</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                step="0.1" 
                value={pricingConfig.inflationRatePct} 
                onChange={e => setPricingConfig(prev => ({
                  ...prev, 
                  inflationRatePct: parseFloat(e.target.value)
                }))}
                className="pricing-input"
              />
            </div>
            
            {/* Lease Alpha */}
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.leaseAlpha}</label>
              <input 
                type="number" 
                min="0.1" 
                max="5" 
                step="0.1" 
                value={pricingConfig.leaseAlpha} 
                onChange={e => setPricingConfig(prev => ({
                  ...prev, 
                  leaseAlpha: parseFloat(e.target.value)
                }))}
                className="pricing-input"
              />
            </div>
            
            {/* Aging Beta */}
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.agingBeta}</label>
              <input 
                type="number" 
                min="0" 
                max="0.1" 
                step="0.001" 
                value={pricingConfig.agingBeta} 
                onChange={e => setPricingConfig(prev => ({
                  ...prev, 
                  agingBeta: parseFloat(e.target.value)
                }))}
                className="pricing-input"
              />
            </div>
            
            {/* Brand Peak */}
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.brandPeak}</label>
              <input 
                type="number" 
                min="0.5" 
                max="3" 
                step="0.1" 
                value={pricingConfig.brandPeak} 
                onChange={e => setPricingConfig(prev => ({
                  ...prev, 
                  brandPeak: parseFloat(e.target.value)
                }))}
                className="pricing-input"
              />
            </div>
            
            {/* Brand Ramp Years */}
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.brandRampYears}</label>
              <input 
                type="number" 
                min="0" 
                max="20" 
                step="1" 
                value={pricingConfig.brandRampYears} 
                onChange={e => setPricingConfig(prev => ({
                  ...prev, 
                  brandRampYears: parseInt(e.target.value)
                }))}
                className="pricing-input"
              />
            </div>
            
            {/* Brand Plateau Years */}
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.brandPlateauYears}</label>
              <input 
                type="number" 
                min="0" 
                max="20" 
                step="1" 
                value={pricingConfig.brandPlateauYears} 
                onChange={e => setPricingConfig(prev => ({
                  ...prev, 
                  brandPlateauYears: parseInt(e.target.value)
                }))}
                className="pricing-input"
              />
            </div>
            
            {/* Brand Decay Years */}
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.brandDecayYears}</label>
              <input 
                type="number" 
                min="0" 
                max="30" 
                step="1" 
                value={pricingConfig.brandDecayYears} 
                onChange={e => setPricingConfig(prev => ({
                  ...prev, 
                  brandDecayYears: parseInt(e.target.value)
                }))}
                className="pricing-input"
              />
            </div>
            
            {/* Brand Tail */}
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.brandTail}</label>
              <input 
                type="number" 
                min="0.1" 
                max="2" 
                step="0.1" 
                value={pricingConfig.brandTail} 
                onChange={e => setPricingConfig(prev => ({
                  ...prev, 
                  brandTail: parseFloat(e.target.value)
                }))}
                className="pricing-input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Основная сетка */}
      <div className="grid">
        {/* Левая колонка - Настройки */}
        <div>
          {/* Блок этапов рассрочки */}
          <div className="card">
            <div className="card-header">
              <h3>�� {t.stagesTitle}</h3>
              <div className="card-actions">
                <button className="btn success" onClick={addStage}>
                  ➕ {t.addStage}
                </button>
              </div>
            </div>
            
            <div className="stages-scroll">
              {stages.map(stage => (
                <div key={stage.id} className="stage-row">
                  <input
                    type="text"
                    value={stage.label}
                    onChange={e => updateStage(stage.id, 'label', e.target.value)}
                    placeholder="Название этапа"
                    className="stage-input"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stage.pct}
                    onChange={e => updateStage(stage.id, 'pct', +e.target.value)}
                    placeholder="%"
                    className="stage-input-small"
                  />
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={stage.month}
                    onChange={e => updateStage(stage.id, 'month', +e.target.value)}
                    placeholder="Месяц"
                    className="stage-input-small"
                  />
                  <div className="stage-actions">
                    <button 
                      className="delete-stage-btn" 
                      onClick={() => deleteStage(stage.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Блок добавления позиций */}
          <div className="card">
            <div className="card-header">
              <h3>📋 Позиции</h3>
              <div className="card-actions">
                <button className="btn success" onClick={addLine}>
                  ➕ {t.addLine}
                </button>
              </div>
            </div>
            
            {lines.map(line => (
              <div key={line.id} className="line-row">
                <div className="row">
                  <div className="field">
                    <label>{t.project}</label>
                    <select 
                      value={line.projectId} 
                      onChange={e => updateLine(line.id, 'projectId', e.target.value)}
                    >
                      <option value="">Выберите проект</option>
                      {catalog.map(p => (
                        <option key={p.projectId} value={p.projectId}>
                          {p.projectName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="field">
                    <label>{t.villa}</label>
                    <select 
                      value={line.villaId} 
                      onChange={e => updateLine(line.id, 'villaId', e.target.value)}
                      disabled={!line.projectId}
                    >
                      <option value="">Выберите виллу</option>
                      {catalog
                        .find(p => p.projectId === line.projectId)
                        ?.villas.map(v => (
                          <option key={v.villaId} value={v.villaId}>
                            {v.name} - {v.area}м² - ${v.baseUSD.toLocaleString()}
                          </option>
                        )) || []}
                    </select>
                  </div>
                  
                  <div className="field">
                    <label>{t.qty}</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={line.qty} 
                      onChange={e => updateLine(line.id, 'qty', +e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="row">
                  <div className="field">
                    <label>{t.prePct}</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={line.prePct} 
                      onChange={e => updateLine(line.id, 'prePct', +e.target.value)}
                    />
                  </div>
                  
                  <div className="field">
                    <label>{t.ownTerms}</label>
                    <input 
                      type="checkbox" 
                      checked={line.ownTerms} 
                      onChange={e => updateLine(line.id, 'ownTerms', e.target.checked)}
                    />
                  </div>
                  
                  {line.ownTerms && (
                    <>
                      <div className="field">
                        <label>{t.months}</label>
                        <input 
                          type="number" 
                          min="1" 
                          max="60" 
                          value={line.months || ''} 
                          onChange={e => updateLine(line.id, 'months', +e.target.value)}
                        />
                      </div>
                      
                      <div className="field">
                        <label>{t.monthlyRatePct}</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          step="0.01" 
                          value={line.monthlyRatePct || ''} 
                          onChange={e => updateLine(line.id, 'monthlyRatePct', +e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="field">
                    <label>{t.discountPct}</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={line.discountPct} 
                      onChange={e => updateLine(line.id, 'discountPct', +e.target.value)}
                    />
                  </div>
                </div>
                
                {/* НОВЫЕ ПОЛЯ ДЛЯ АРЕНДЫ */}
                <div className="row">
                  <div className="field">
                    <label>{t.dailyRate}</label>
                    <input 
                      type="number" 
                      min="0" 
                      value={line.dailyRateUSD || 0} 
                      onChange={e => updateLine(line.id, 'dailyRateUSD', +e.target.value)}
                    />
                  </div>
                  
                  <div className="field">
                    <label>{t.occupancyRate}</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={line.occupancyRate || 70} 
                      onChange={e => updateLine(line.id, 'occupancyRate', +e.target.value)}
                    />
                  </div>
                  
                  <div className="field">
                    <label>{t.rentalPriceIndexPct}</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="50" 
                      step="0.1" 
                      value={line.rentalPriceIndexPct || 5} 
                      onChange={e => updateLine(line.id, 'rentalPriceIndexPct', +e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="line-actions">
                  <button className="btn danger" onClick={() => deleteLine(line.id)}>
                    🗑️ {t.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Правая колонка - Расчеты */}
        <div>
          {/* KPI блоки */}
          <div className="kpis">
            <div className="kpi">
              <span className="muted">{t.base}</span>
              <span className="v">{formatCurrency(project.totals.baseUSD)}</span>
            </div>
            <div className="kpi">
              <span className="muted">{t.preTotal}</span>
              <span className="v">{formatCurrency(project.totals.preUSD)}</span>
            </div>
            <div className="kpi">
              <span className="muted">{t.interestTotal}</span>
              <span className="v">{formatCurrency(project.totals.interestUSD)}</span>
            </div>
            <div className="kpi">
              <span className="muted">{t.grandTotal}</span>
              <span className="v">{formatCurrency(project.totals.finalUSD)}</span>
            </div>
          </div>

          {/* Таблица расчетов */}
          <div className="card">
            <h3>📊 {t.calculationParams}</h3>
            <div className="calc-scroll">
              <table className="calc-table">
                <thead>
                  <tr>
                    <th>{t.project}</th>
                    <th>{t.villa}</th>
                    <th>{t.qty}</th>
                    <th>{t.base}</th>
                    <th>{t.preTotal}</th>
                    <th>{t.postTotal}</th>
                    <th>{t.lineTotal}</th>
                    <th>Lease (лет)</th>
                    <th>Ценообразование</th>
                  </tr>
                </thead>
                <tbody>
                  {linesData.map(line => (
                    <tr key={line.id}>
                      <td>{line.projectName}</td>
                      <td>{line.villaName}</td>
                      <td>{line.qty}</td>
                      <td className="base-strong">{formatCurrency(line.base)}</td>
                      <td>{formatCurrency(line.preTotal)}</td>
                      <td>{formatCurrency(line.postTotal)}</td>
                      <td className="line-total">{formatCurrency(line.lineTotal)}</td>
                      <td className="col-leaseYears">
                        <div className="lease-years-display">
                          {getCleanLeaseholdTerm(line.leaseholdEndDate).years}
                        </div>
                      </td>
                      <td className="col-pricing">
                        <button 
                          className="btn pricing-btn"
                          onClick={() => {
                            setSelectedVillaId(line.villaId);
                            setShowVillaPricingModal(true);
                          }}
                        >
                          📈 График
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* НОВЫЙ БЛОК: Параметры расчёта и график ценообразования */}
          {lines.length > 0 && (
            <div className="card">
              <h3>📊 {t.calculationParams}</h3>
              
              {/* Параметры расчёта (read-only) */}
              <div className="calculation-params-compact">
                <div className="param-item-compact">
                  <span className="param-label-compact">{t.inflation}:</span>
                  <span className="param-value-compact">g = {pricingConfig.inflationRatePct}%</span>
                </div>
                <div className="param-item-compact">
                  <span className="param-label-compact">{t.aging}:</span>
                  <span className="param-value-compact">β = {pricingConfig.agingBeta}</span>
                </div>
                <div className="param-item-compact">
                  <span className="param-label-compact">{t.leaseDecay}:</span>
                  <span className="param-value-compact">α = {pricingConfig.leaseAlpha}</span>
                </div>
                <div className="param-item-compact">
                  <span className="param-label-compact">{t.brandFactor}:</span>
                  <span className="param-value-compact">Peak = {pricingConfig.brandPeak}</span>
                </div>
              </div>
              
              {/* График ценообразования */}
              {lines[0] && (
                <div className="pricing-chart-container">
                  <h4>�� {t.chartTitle}</h4>
                  <p className="chart-subtitle">{t.chartSubtitle}</p>
                  
                  <svg width="600" height="300" className="pricing-chart-svg">
                    {/* Здесь будет SVG график */}
                    <text x="300" y="150" textAnchor="middle" fill="var(--muted)">
                      График ценообразования для выбранной виллы
                    </text>
                  </svg>
                  
                  <div className="chart-legend-compact">
                    <div className="legend-item-compact">
                      <div className="legend-color-compact market"></div>
                      <span>{t.marketPrice}</span>
                    </div>
                    <div className="legend-item-compact">
                      <div className="legend-color-compact final"></div>
                      <span>{t.finalPrice}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Таблица факторов */}
              {lines[0] && (
                <div className="factors-table-container">
                  <h4>�� {t.tableTitle}</h4>
                  <div className="factors-table-scroll">
                    <table className="factors-table">
                      <thead>
                        <tr>
                          <th>{t.year}</th>
                          <th>{t.leaseFactor}</th>
                          <th>{t.ageFactor}</th>
                          <th>{t.brandFactorValue}</th>
                          <th>{t.price}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generatePricingData(lines[0]).slice(0, 10).map((data, index) => (
                          <tr key={index}>
                            <td>{data.year}</td>
                            <td>{data.leaseFactor.toFixed(3)}</td>
                            <td>{data.ageFactor.toFixed(3)}</td>
                            <td>{data.brandFactor.toFixed(3)}</td>
                            <td className="price-cell">${data.finalPrice.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Блок кэшфлоу */}
          <div className="card cashflow-block">
            <h3>💰 {t.cashflowTitle}</h3>
            <div className="calc-scroll">
              <table className="cashflow-table">
                <thead>
                  <tr>
                    <th>{t.month}</th>
                    <th>{t.description}</th>
                    <th>{t.amount}</th>
                  </tr>
                </thead>
                <tbody>
                  {project.cashflow.map((row, index) => (
                    <tr key={index}>
                      <td>{formatMonth(row.month)}</td>
                      <td>{row.items.join('; ')}</td>
                      <td className="amount">{formatCurrency(row.amountUSD)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Редакторский режим */}
      {!isClient && (
        <div className="editor-mode">
          <h2>�� {t.editorMode}</h2>
          
          {/* Каталог проектов и вилл */}
          <div className="card catalog-section">
            <div className="card-header">
              <h3>🏗️ {t.catalogTitle}</h3>
              <div className="card-actions">
                <button className="btn success" onClick={addProject}>
                  ➕ {t.addProject}
                </button>
              </div>
            </div>
            
            {catalog.map(project => (
              <div key={project.projectId} className="project-card">
                <div className="project-header">
                  <h3>{project.projectName}</h3>
                  <div className="project-actions">
                    <button className="btn success" onClick={() => addVilla(project.projectId)}>
                      ➕ {t.addVilla}
                    </button>
                    <button className="btn danger" onClick={() => deleteProject(project.projectId)}>
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
                          <button className="btn" onClick={() => editVilla(project.projectId, villa.villaId)}>
                            ✏️ {t.editVilla}
                          </button>
                          <button className="btn danger" onClick={() => deleteVilla(project.projectId, villa.villaId)}>
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <div className="villa-details">
                        <div className="detail-item">
                          <span className="detail-label">{t.area}:</span>
                          <span className="detail-value">{villa.area} м²</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">{t.ppsm}:</span>
                          <span className="detail-value">${villa.ppsm}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">{t.basePrice}:</span>
                          <span className="detail-value">${villa.baseUSD.toLocaleString()}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">{t.leaseholdEndDate}:</span>
                          <span className="detail-value">{villa.leaseholdEndDate.toLocaleDateString()}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">{t.dailyRate}:</span>
                          <span className="detail-value">${villa.dailyRateUSD}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">{t.rentalPriceIndexPct}:</span>
                          <span className="detail-value">{villa.rentalPriceIndexPct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Кнопки экспорта */}
      <div className="card">
        <h3>�� {t.exportTitle}</h3>
        <div className="export-buttons">
          <button className="btn" onClick={exportCSV}>
            📊 {t.exportCSV}
          </button>
          <button className="btn" onClick={exportExcel}>
            📈 {t.exportExcel}
          </button>
          <button className="btn" onClick={exportPDF}>
            📄 {t.exportPDF}
          </button>
        </div>
      </div>

      {/* Модальные окна */}
      
      {/* Модальное окно добавления проекта */}
      {showAddProjectModal && (
        <div className="modal-overlay" onClick={() => setShowAddProjectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ {t.addProject}</h3>
              <button className="btn" onClick={() => setShowAddProjectModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{t.projectName}</label>
                <input 
                  type="text" 
                  value={newProjectForm.projectName} 
                  onChange={e => setNewProjectForm(prev => ({...prev, projectName: e.target.value}))}
                  placeholder="Название проекта"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowAddProjectModal(false)}>
                {t.cancel}
              </button>
              <button className="btn primary" onClick={saveProject}>
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления/редактирования виллы */}
      {showAddVillaModal && (
        <div className="modal-overlay" onClick={() => setShowAddVillaModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏠 {newVillaForm.villaId ? t.editVilla : t.addVilla}</h3>
              <button className="btn" onClick={() => setShowAddVillaModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>{t.villaName}</label>
                  <input 
                    type="text" 
                    value={newVillaForm.name} 
                    onChange={e => setNewVillaForm(prev => ({...prev, name: e.target.value}))}
                    placeholder="Название виллы"
                  />
                </div>
                
                <div className="form-group">
                  <label>{t.area}</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={newVillaForm.area} 
                    onChange={e => setNewVillaForm(prev => ({...prev, area: +e.target.value}))}
                    placeholder="Площадь (м²)"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>{t.ppsm}</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={newVillaForm.ppsm} 
                    onChange={e => setNewVillaForm(prev => ({...prev, ppsm: +e.target.value}))}
                    placeholder="Цена за м²"
                  />
                </div>
                
                <div className="form-group">
                  <label>{t.basePrice}</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={newVillaForm.baseUSD} 
                    onChange={e => setNewVillaForm(prev => ({...prev, baseUSD: +e.target.value}))}
                    placeholder="Базовая цена"
                  />
                </div>
              </div>
              
              {/* НОВЫЕ ПОЛЯ ДЛЯ ЛИЗХОЛДА И АРЕНДЫ */}
              <div className="form-row">
                <div className="form-group">
                  <label>{t.leaseholdEndDate}:</label>
                  <input 
                    type="date" 
                    value={newVillaForm.leaseholdEndDate ? newVillaForm.leaseholdEndDate.toISOString().split('T')[0] : ''} 
                    onChange={e => setNewVillaForm(prev => ({...prev, leaseholdEndDate: new Date(e.target.value)}))}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t.dailyRate}:</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={newVillaForm.dailyRateUSD} 
                    onChange={e => setNewVillaForm(prev => ({...prev, dailyRateUSD: +e.target.value}))}
                    placeholder="Стоимость в сутки (USD)"
                  />
                </div>
                
                <div className="form-group">
                  <label>{t.rentalPriceIndexPct}:</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="50" 
                    step="0.1" 
                    value={newVillaForm.rentalPriceIndexPct} 
                    onChange={e => setNewVillaForm(prev => ({...prev, rentalPriceIndexPct: +e.target.value}))}
                    placeholder="Индексация аренды (%)"
                  />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowAddVillaModal(false)}>
                {t.cancel}
              </button>
              <button className="btn primary" onClick={saveVilla}>
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно конфигурации ценообразования */}
      {showPricingConfigModal && (
        <div className="modal-overlay" onClick={() => setShowPricingConfigModal(false)}>
          <div className="modal-content pricing-config-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚙️ {t.pricingConfigTitle}</h3>
              <button className="btn" onClick={() => setShowPricingConfigModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="pricing-sections">
                {/* Инфляция и старение */}
                <div className="pricing-section">
                  <h4>�� Основные параметры</h4>
                  <div className="form-row">


                                      <div className="form-group">
                      <label>{t.inflationRate}</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.1" 
                        value={pricingConfig.inflationRatePct} 
                        onChange={e => setPricingConfig(prev => ({
                          ...prev, 
                          inflationRatePct: parseFloat(e.target.value)
                        }))}
                      />
                      <span className="unit">%/год</span>
                    </div>
                    
                    <div className="form-group">
                      <label>{t.leaseAlpha}</label>
                      <input 
                        type="number" 
                        min="0.1" 
                        max="5" 
                        step="0.1" 
                        value={pricingConfig.leaseAlpha} 
                        onChange={e => setPricingConfig(prev => ({
                          ...prev, 
                          leaseAlpha: parseFloat(e.target.value)
                        }))}
                      />
                      <span className="unit">степень</span>
                      <div className="hint">1 = линейно, &gt;1 = ускоренно, &lt;1 = замедленно</div>
                    </div>
                    
                    <div className="form-group">
                      <label>{t.agingBeta}</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="0.1" 
                        step="0.001" 
                        value={pricingConfig.agingBeta} 
                        onChange={e => setPricingConfig(prev => ({
                          ...prev, 
                          agingBeta: parseFloat(e.target.value)
                        }))}
                      />
                      <span className="unit">в год</span>
                      <div className="hint">0.025 = 2.5% в год</div>
                    </div>
                  </div>
                </div>
                
                {/* Бренд-фактор */}
                <div className="pricing-section">
                  <h4>🏷️ Бренд-фактор</h4>
                  <div className="brand-params">
                    <div className="form-group">
                      <label>{t.brandPeak}</label>
                      <input 
                        type="number" 
                        min="0.5" 
                        max="3" 
                        step="0.1" 
                        value={pricingConfig.brandPeak} 
                        onChange={e => setPricingConfig(prev => ({
                          ...prev, 
                          brandPeak: parseFloat(e.target.value)
                        }))}
                      />
                      <div className="hint">Пиковое значение бренда</div>
                    </div>
                    
                    <div className="form-group">
                      <label>{t.brandRampYears}</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="20" 
                        step="1" 
                        value={pricingConfig.brandRampYears} 
                        onChange={e => setPricingConfig(prev => ({
                          ...prev, 
                          brandRampYears: parseInt(e.target.value)
                        }))}
                      />
                      <div className="hint">Годы роста бренда</div>
                    </div>
                    
                    <div className="form-group">
                      <label>{t.brandPlateauYears}</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="20" 
                        step="1" 
                        value={pricingConfig.brandPlateauYears} 
                        onChange={e => setPricingConfig(prev => ({
                          ...prev, 
                          brandPlateauYears: parseInt(e.target.value)
                        }))}
                      />
                      <div className="hint">Годы плато бренда</div>
                    </div>
                    
                    <div className="form-group">
                      <label>{t.brandDecayYears}</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="30" 
                        step="1" 
                        value={pricingConfig.brandDecayYears} 
                        onChange={e => setPricingConfig(prev => ({
                          ...prev, 
                          brandDecayYears: parseInt(e.target.value)
                        }))}
                      />
                      <div className="hint">Годы спада бренда</div>
                    </div>
                    
                    <div className="form-group">
                      <label>{t.brandTail}</label>
                      <input 
                        type="number" 
                        min="0.1" 
                        max="2" 
                        step="0.1" 
                        value={pricingConfig.brandTail} 
                        onChange={e => setPricingConfig(prev => ({
                          ...prev, 
                          brandTail: parseFloat(e.target.value)
                        }))}
                      />
                      <div className="hint">Финальное значение бренда</div>
                    </div>
                  </div>
                  
                  {/* Предварительный просмотр бренд-фактора */}
                  <div className="brand-factor-preview">
                    <h5>📊 Предварительный просмотр бренд-фактора</h5>
                    <div className="brand-factor-info">
                      <div>Рост: 1.0 → {pricingConfig.brandPeak} за {pricingConfig.brandRampYears} лет</div>
                      <div>Плато: {pricingConfig.brandPeak} в течение {pricingConfig.brandPlateauYears} лет</div>
                      <div>Спад: {pricingConfig.brandPeak} → {pricingConfig.brandTail} за {pricingConfig.brandDecayYears} лет</div>
                      <div>Финальное значение: {pricingConfig.brandTail}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowPricingConfigModal(false)}>
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно графика ценообразования для виллы */}
      {showVillaPricingModal && (
        <div className="modal-overlay" onClick={() => setShowVillaPricingModal(false)}>
          <div className="modal-content villa-pricing-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>�� {t.chartTitle}</h3>
              <button className="btn" onClick={() => setShowVillaPricingModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              {/* Параметры расчёта */}
              <div className="pricing-params-display">
                <h4>⚙️ Параметры расчёта</h4>
                <div className="params-grid">
                  <div className="param-item">
                    <span className="param-label">{t.inflation}</span>
                    <span className="param-value">g = {pricingConfig.inflationRatePct}%</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">{t.aging}</span>
                    <span className="param-value">β = {pricingConfig.agingBeta}</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">{t.leaseDecay}</span>
                    <span className="param-value">α = {pricingConfig.leaseAlpha}</span>
                  </div>
                  <div className="param-item">
                    <span className="param-label">{t.brandFactor}</span>
                    <span className="param-value">Peak = {pricingConfig.brandPeak}</span>
                  </div>
                </div>
              </div>
              
              {/* График ценообразования */}
              <div className="pricing-chart-section">
                <h4>�� {t.chartTitle}</h4>
                <div className="pricing-chart">
                  <div className="chart-lines">
                    <div className="chart-line">
                      <div className="line-points">
                        {/* Здесь будет SVG график с точками */}
                      </div>
                    </div>
                  </div>
                  
                  <div className="chart-axes">
                    <div className="y-axis">
                      <span>${(linesData.find(l => l.villaId === selectedVillaId)?.base || 0).toLocaleString()}</span>
                      <span>${((linesData.find(l => l.villaId === selectedVillaId)?.base || 0) * 0.5).toLocaleString()}</span>
                      <span>$0</span>
                    </div>
                    <div className="x-axis">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                      <span>15</span>
                      <span>20</span>
                    </div>
                  </div>
                </div>
                
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color market-color"></div>
                    <span>{t.marketPrice}</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color final-color"></div>
                    <span>{t.finalPrice}</span>
                  </div>
                </div>
              </div>
              
              {/* Таблица факторов */}
              <div className="pricing-table-section">
                <h4>�� {t.tableTitle}</h4>
                <div className="pricing-table-scroll">
                  <table className="pricing-table">
                    <thead>
                      <tr>
                        <th>{t.year}</th>
                        <th>{t.leaseFactor}</th>
                        <th>{t.ageFactor}</th>
                        <th>{t.brandFactorValue}</th>
                        <th>{t.marketPrice}</th>
                        <th>{t.finalPrice}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linesData.find(l => l.villaId === selectedVillaId) && 
                       generatePricingData(linesData.find(l => l.villaId === selectedVillaId)).map((data, index) => (
                        <tr key={index} className={index === 0 ? 'selected-row' : ''}>
                          <td>{data.year}</td>
                          <td>{data.leaseFactor.toFixed(3)}</td>
                          <td>{data.ageFactor.toFixed(3)}</td>
                          <td>{data.brandFactor.toFixed(3)}</td>
                          <td className="price-cell">${data.marketPrice.toLocaleString()}</td>
                          <td className="price-cell">${data.finalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowVillaPricingModal(false)}>
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Рендеринг приложения
ReactDOM.render(<App />, document.getElementById('root'));

