// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE (С ЛИЗХОЛДОМ, ИНДЕКСАЦИЕЙ И ЦЕНООБРАЗОВАНИЕМ) - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ =====

const { useState, useEffect, useMemo, useRef } = React;
const { createRoot } = ReactDOM;

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
          rentalPriceIndexPct: 5, // 5% в год
          // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
          monthlyPriceGrowthPct: 2 // 2% в месяц
        },
        {
          villaId: 'ahao-3br', 
          name: '3BR Garden Villa', 
          area: 130, 
          ppsm: 2450, 
          baseUSD: 318500,
          leaseholdEndDate: new Date(2030, 11, 31),
          dailyRateUSD: 180,
          rentalPriceIndexPct: 5,
          // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
          monthlyPriceGrowthPct: 2
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
          rentalPriceIndexPct: 5,
          // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
          monthlyPriceGrowthPct: 2
        },
        {
          villaId: 'enso-3br', 
          name: 'Enso 3BR', 
          area: 120, 
          ppsm: 2700, 
          baseUSD: 324000,
          leaseholdEndDate: new Date(2030, 11, 31),
          dailyRateUSD: 170,
          rentalPriceIndexPct: 5,
          // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
          monthlyPriceGrowthPct: 2
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
      // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
      monthlyPriceGrowthPct: 2, // 2% в месяц
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
    // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
    monthlyPriceGrowthPct: 2,
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
      cumulativeIncome: 'Накопительный доход',
      actions: 'Действия',
      // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
      monthlyPriceGrowth: 'Месячный рост цены до ключей (%)'
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
      cumulativeIncome: 'Cumulative income',
      actions: 'Actions',
      // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
      monthlyPriceGrowth: 'Monthly price growth until keys (%)'
    }
  };

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

  // НОВЫЕ ФУНКЦИИ ЦЕНООБРАЗОВАНИЯ - ИСПРАВЛЕНЫ
  const leaseFactor = (year, totalYears, alpha) => {
    try {
      if (totalYears <= 0 || year < 0) return 1;
      return Math.pow((totalYears - year) / totalYears, alpha);
    } catch (error) {
      console.error('Ошибка в leaseFactor:', error);
      return 1;
    }
  };

  const ageFactor = (year, beta) => {
    try {
      if (year < 0 || beta < 0) return 1;
      return Math.exp(-beta * year);
    } catch (error) {
      console.error('Ошибка в ageFactor:', error);
      return 1;
    }
  };

  const brandFactor = (year, config) => {
    try {
      const { brandPeak, brandRampYears, brandPlateauYears, brandDecayYears, brandTail } = config;
      
      if (year <= brandRampYears) {
        // Рост до пика
        return 1 + (brandPeak - 1) * (year / brandRampYears);
      } else if (year <= brandRampYears + brandPlateauYears) {
        // Плато
        return brandPeak;
      } else if (year <= brandRampYears + brandPlateauYears + brandDecayYears) {
        // Спад
        const decayProgress = (year - brandRampYears - brandPlateauYears) / brandDecayYears;
        return brandPeak - (brandPeak - brandTail) * decayProgress;
      } else {
        // Хвост
        return brandTail;
      }
    } catch (error) {
      console.error('Ошибка в brandFactor:', error);
      return 1;
    }
  };

  // НОВАЯ ФУНКЦИЯ: Расчет рыночной цены виллы на ключах
  const calculateMarketPriceAtHandover = (villa, line) => {
    try {
      if (!villa || !line) return 0;
      
      // Базовая цена виллы
      const basePrice = villa.baseUSD;
      
      // Месячный рост цены до ключей (в долях)
      const monthlyGrowthRate = (line.monthlyPriceGrowthPct || 2) / 100;
      
      // Количество месяцев от начала до получения ключей
      const monthsToHandover = handoverMonth;
      
      // Рыночная цена на ключах = базовая цена × (1 + месячный рост)^количество месяцев
      const marketPriceAtHandover = basePrice * Math.pow(1 + monthlyGrowthRate, monthsToHandover);
      
      return marketPriceAtHandover;
    } catch (error) {
      console.error('Ошибка расчета рыночной цены на ключах:', error);
      return 0;
    }
  };

  // ИСПРАВЛЕНО: Используем startMonth вместо new Date()
  const calculateVillaPrice = (villa, yearOffset) => {
    try {
      if (!villa || !villa.leaseholdEndDate) return 0;
      
      const totalYears = Math.ceil((villa.leaseholdEndDate - startMonth) / (365 * 24 * 60 * 60 * 1000));
      const basePrice = villa.baseUSD;
      
      const leaseF = leaseFactor(yearOffset, totalYears, pricingConfig.leaseAlpha);
      const ageF = ageFactor(yearOffset, pricingConfig.agingBeta);
      const brandF = brandFactor(yearOffset, pricingConfig);
      const inflationF = Math.pow(1 + pricingConfig.inflationRatePct / 100, yearOffset);
      
      return basePrice * inflationF * leaseF * ageF * brandF;
    } catch (error) {
      console.error('Ошибка в calculateVillaPrice:', error);
      return 0;
    }
  };

  // ИСПРАВЛЕНО: Функция generatePricingData - убрано ограничение по годам
  const generatePricingData = (villa) => {
    try {
      if (!villa || !villa.leaseholdEndDate) return [];
      
      const totalYears = Math.ceil((villa.leaseholdEndDate - startMonth) / (365 * 24 * 60 * 60 * 1000));
      const data = [];
      
      // УБРАНО ОГРАНИЧЕНИЕ: было Math.min(totalYears, 20), теперь все годы
      for (let year = 0; year <= totalYears; year++) {
        
        // Получаем линию для расчета месячного роста
        const selectedLine = lines.find(l => l.villaId === villa.villaId);

        // Рыночная цена на ключах
        const marketPriceAtHandover = calculateMarketPriceAtHandover(villa, selectedLine);

        // Final Price = рыночная цена на ключах × коэффициенты × инфляция
        const finalPrice = marketPriceAtHandover * 
          Math.pow(1 + pricingConfig.inflationRatePct / 100, year) * 
          leaseFactor(year, totalYears, pricingConfig.leaseAlpha) * 
          ageFactor(year, pricingConfig.agingBeta) * 
          brandFactor(year, pricingConfig);
        
        data.push({
          year,
          finalPrice,
          leaseFactor: leaseFactor(year, totalYears, pricingConfig.leaseAlpha),
          ageFactor: ageFactor(year, pricingConfig.agingBeta),
          brandFactor: brandFactor(year, pricingConfig)
        });
      }
      
      return data;
    } catch (error) {
      console.error('Ошибка в generatePricingData:', error);
      return [];
    }
  };

  // НОВАЯ ФУНКЦИЯ: Расчет доходности от аренды для конкретного года
  const calculateRentalIncomeForYear = (lines, year, handoverMonth, startMonth) => {
    return lines.reduce((total, line) => {
      if (year < 0) return total;
      
      const villa = catalog
        .flatMap(p => p.villas)
        .find(v => v.villaId === line.villaId);
      
      if (!villa) return total;
      
      let yearRentalIncome = 0;
      
      if (year === 0) {
        // ГОД ПОЛУЧЕНИЯ КЛЮЧЕЙ: считаем месяцы с ноября по декабрь
        const yearStartMonth = handoverMonth + 3; // ноябрь
        const yearEndMonth = 12; // декабрь
        
        for (let month = yearStartMonth; month <= yearEndMonth; month++) {
          const indexedPrice = getIndexedRentalPrice(villa.dailyRateUSD, villa.rentalPriceIndexPct, 0);
          const daysInMonth = getDaysInMonth(month);
          const monthlyRental = indexedPrice * 0.55 * (daysInMonth / 30.44) * line.qty;
          yearRentalIncome += monthlyRental;
        }
      } else {
        // ПОСЛЕДУЮЩИЕ ГОДЫ: полный год аренды
        const yearStartMonth = handoverMonth + 3 + (year - 1) * 12;
        const yearEndMonth = yearStartMonth + 11;
        
        for (let month = yearStartMonth; month <= yearEndMonth; month++) {
          const yearOffset = (month - handoverMonth) / 12;
          const indexedPrice = getIndexedRentalPrice(villa.dailyRateUSD, villa.rentalPriceIndexPct, yearOffset);
          const daysInMonth = getDaysInMonth(month);
          const monthlyRental = indexedPrice * 0.55 * (daysInMonth / 30.44) * line.qty;
          yearRentalIncome += monthlyRental;
        }
      }
      
      return total + yearRentalIncome;
    }, 0);
  };

  // НОВАЯ ФУНКЦИЯ: Генерация данных для таблицы факторов
  const generateFactorsData = (villa) => {
    try {
      if (!villa || !villa.leaseholdEndDate) return [];
      
      const selectedLine = lines.find(l => l.villaId === villa.villaId);
      if (!selectedLine) return [];
      
      const totalYears = Math.ceil((villa.leaseholdEndDate.getFullYear() - startMonth.getFullYear() - months / 12));
      const data = [];
      
      for (let year = -1; year <= totalYears; year++) {
        const yearOffset = year < 0 ? 0 : year;
        const totalLeaseholdYears = (villa.leaseholdEndDate.getFullYear() - startMonth.getFullYear() - months / 12);
        
        let finalPrice = 0;
        let leaseFactorValue = 1;
        let ageFactorValue = 1;
        let brandFactorValue = 1;
        let inflationFactorValue = 1;
        
        if (year >= 0) {
          // Рыночная цена на ключах
          const marketPriceAtHandover = calculateMarketPriceAtHandover(villa, selectedLine);
          
          // Факторы ценообразования
          leaseFactorValue = leaseFactor(yearOffset, totalLeaseholdYears, pricingConfig.leaseAlpha);
          ageFactorValue = ageFactor(yearOffset, pricingConfig.agingBeta);
          brandFactorValue = brandFactor(yearOffset, pricingConfig);
          inflationFactorValue = Math.pow(1 + pricingConfig.inflationRatePct / 100, yearOffset);
          
          // Итоговая цена
          finalPrice = marketPriceAtHandover * leaseFactorValue * ageFactorValue * brandFactorValue * inflationFactorValue;
        } else {
          // До получения ключей: базовая цена с ростом
          const monthsToHandover = handoverMonth + year + 1;
          const monthlyGrowth = (selectedLine.monthlyPriceGrowthPct || 2) / 100;
          finalPrice = villa.baseUSD * Math.pow(1 + monthlyGrowth, monthsToHandover);
        }
        
        // Доходность от аренды
        const rentalIncome = calculateRentalIncomeForYear(lines, year, handoverMonth, startMonth);
        
        // ROI расчеты
        let annualRoi = 0;
        let cumulativeRoi = 0;
        let irr = 0;
        
        if (year >= 0) {
          // ROI за год
          const previousFinalPrice = year === 0 ? 
            calculateMarketPriceAtHandover(villa, selectedLine) :
            generateFactorsData(villa)[year]?.finalPrice || 0;
          
          if (previousFinalPrice > 0) {
            annualRoi = ((rentalIncome + (finalPrice - previousFinalPrice)) / previousFinalPrice) * 100;
          }
          
          // Итоговый ROI
          const totalInvestment = project?.totals?.finalUSD || 0;
          if (totalInvestment > 0) {
            cumulativeRoi = ((rentalIncome + finalPrice - totalInvestment) / totalInvestment) * 100;
          }
          
          // IRR (упрощенный)
          irr = calculateIRR([-totalInvestment, rentalIncome, finalPrice]);
        }
        
        data.push({
          year,
          finalPrice,
          leaseFactor: leaseFactorValue,
          ageFactor: ageFactorValue,
          brandFactor: brandFactorValue,
          inflationFactor: inflationFactorValue,
          rentalIncome,
          annualRoi,
          cumulativeRoi,
          irr
        });
      }
      
      return data;
    } catch (error) {
      console.error('Ошибка в generateFactorsData:', error);
      return [];
    }
  };

  // НОВАЯ ФУНКЦИЯ: Расчет точки выхода с максимальным IRR
  const calculateOptimalExitPoint = useMemo(() => {
    if (lines.length === 0) return { year: 0, totalValue: 0, irr: 0, cumulativeRoi: 0 };
    
    const selectedVilla = catalog
      .flatMap(p => p.villas)
      .find(v => v.villaId === lines[0]?.villaId);
    
    if (!selectedVilla || !selectedVilla.leaseholdEndDate) return { year: 0, totalValue: 0, irr: 0, cumulativeRoi: 0 };
    
    const factorsData = generateFactorsData(selectedVilla);
    let maxIrr = -Infinity;
    let optimalYear = 0;
    let optimalTotalValue = 0;
    let optimalCumulativeRoi = 0;
    
    factorsData.forEach((data, index) => {
      if (data.irr > maxIrr) {
        maxIrr = data.irr;
        optimalYear = data.year;
        optimalTotalValue = data.finalPrice;
        optimalCumulativeRoi = data.cumulativeRoi;
      }
    });
    
    return {
      year: optimalYear,
      totalValue: optimalTotalValue,
      irr: maxIrr,
      cumulativeRoi: optimalCumulativeRoi
    };
  }, [lines, catalog, startMonth, months, handoverMonth, pricingConfig]);

  // ОБНОВЛЕННАЯ ФУНКЦИЯ: Генерация месячных данных для таблицы факторов 2
  const generateMonthlyPricingData = (villa) => {
    try {
      if (!villa || !villa.leaseholdEndDate) return [];
      
      const selectedLine = lines.find(l => l.villaId === villa.villaId);
      if (!selectedLine) return [];
      
      // Общее количество месяцев от подписания до окончания рассрочки
      const totalMonths = months + handoverMonth;
      
      // РАСШИРЯЕМ ПЕРИОД: добавляем месяцы до конца года окончания рассрочки
      const endYear = Math.floor((startMonth.getMonth() + totalMonths) / 12);
      const endMonthInYear = (startMonth.getMonth() + totalMonths) % 12;
      const monthsToYearEnd = 12 - endMonthInYear;
      const totalDisplayMonths = totalMonths + monthsToYearEnd;
      
      // Общий период лизхолда в месяцах
      const totalLeaseholdMonths = (villa.leaseholdEndDate.getFullYear() - startMonth.getFullYear()) * 12 + 
        (villa.leaseholdEndDate.getMonth() - startMonth.getMonth());
      
      const data = [];
      
      for (let month = 0; month <= totalDisplayMonths; month++) {
        // РАСЧЕТ РЕАЛЬНЫХ МЕСЯЦА И ГОДА
        const currentDate = new Date(startMonth);
        currentDate.setMonth(currentDate.getMonth() + month);
        const displayMonth = currentDate.getMonth() + 1;
        const displayYear = currentDate.getFullYear();
        
        let finalPrice = 0;
        let leaseFactorValue = 1;
        let ageFactorValue = 1;
        let brandFactorValue = 1;
        let inflationFactorValue = 1;
        let rentalIncome = 0;
        let paymentAmount = 0;
        
        if (month <= handoverMonth) {
          // ДО ПОЛУЧЕНИЯ КЛЮЧЕЙ: только рост цены
          const monthlyGrowth = (selectedLine.monthlyPriceGrowthPct || 2) / 100;
          finalPrice = villa.baseUSD * Math.pow(1 + monthlyGrowth, month);
        } else {
          // ПОСЛЕ ПОЛУЧЕНИЯ КЛЮЧЕЙ: все факторы + аренда
          const yearOffset = (month - handoverMonth) / 12;
          
          // Рыночная цена на ключах
          const marketPriceAtHandover = calculateMarketPriceAtHandover(villa, selectedLine);
          
          // ИСПРАВЛЕНО: Факторы рассчитываются на весь период лизхолда
          leaseFactorValue = leaseFactor(yearOffset, totalLeaseholdMonths / 12, pricingConfig.leaseAlpha);
          ageFactorValue = ageFactor(yearOffset, pricingConfig.agingBeta);
          brandFactorValue = brandFactor(yearOffset, pricingConfig);
          inflationFactorValue = Math.pow(1 + pricingConfig.inflationRatePct / 100, yearOffset);
          
          // Итоговая цена
          finalPrice = marketPriceAtHandover * leaseFactorValue * ageFactorValue * brandFactorValue * inflationFactorValue;
          
          // Доходность от аренды (начиная с 3-го месяца после получения ключей)
          if (month >= handoverMonth + 3) {
            const rentalYearOffset = (month - handoverMonth) / 12;
            const indexedPrice = getIndexedRentalPrice(selectedLine.dailyRateUSD, selectedLine.rentalPriceIndexPct, rentalYearOffset);
            const daysInMonth = getDaysInMonth(month);
            rentalIncome = indexedPrice * 0.55 * (selectedLine.occupancyPct / 100) * daysInMonth * selectedLine.qty;
          }
        }
        
        // РАСЧЕТ ПЛАТЕЖЕЙ ПО РАССРОЧКЕ
        if (month <= totalMonths) {
          const lineData = linesData.find(ld => ld.line.id === selectedLine.id);
          if (lineData) {
            if (month <= handoverMonth) {
              // Платежи по этапам рассрочки
              const stagePayment = lineData.preSchedule.find(s => s.month === month);
              if (stagePayment) {
                paymentAmount = stagePayment.amountUSD;
              }
            } else {
              // Ежемесячные платежи по рассрочке
              const postMonth = month - handoverMonth;
              const postPayment = lineData.postRows.find(r => r.month === postMonth);
              if (postPayment) {
                paymentAmount = postPayment.paymentUSD;
              }
            }
          }
        }
        
        // РАСЧЕТ ТЕКУЩЕГО ИНВЕСТИРОВАННОГО КАПИТАЛА
        let currentInvestedCapital = 0;
        for (let m = 0; m <= month; m++) {
          let monthPayment = 0;
          
          if (m <= handoverMonth) {
            const lineData = linesData.find(ld => ld.line.id === selectedLine.id);
            if (lineData) {
              const stagePayment = lineData.preSchedule.find(s => s.month === m);
              if (stagePayment) {
                monthPayment = stagePayment.amountUSD;
              }
            }
          } else {
            const postMonth = m - handoverMonth;
            const lineData = linesData.find(ld => ld.line.id === selectedLine.id);
            if (lineData) {
              const postPayment = lineData.postRows.find(r => r.month === postMonth);
              if (postPayment) {
                monthPayment = postPayment.paymentUSD;
              }
            }
          }
          currentInvestedCapital += monthPayment;
        }
        
        // НОВЫЕ РАСЧЕТЫ: ROI и IRR по месяцам
        let monthlyRoi = 0;
        let cumulativeRoi = 0;
        let irr = 0;
        
        if (month > 0) {
          // ROI за месяц = (аренда за месяц + ΔЦена) / сумма платежей с начала до данного месяца × 100%
          let previousFinalPrice = 0;
          if (month <= handoverMonth) {
            const monthlyGrowth = (selectedLine.monthlyPriceGrowthPct || 2) / 100;
            previousFinalPrice = villa.baseUSD * Math.pow(1 + monthlyGrowth, month - 1);
          } else {
            const yearOffset = (month - 1 - handoverMonth) / 12;
            const marketPriceAtHandover = calculateMarketPriceAtHandover(villa, selectedLine);
            previousFinalPrice = marketPriceAtHandover * 
              Math.pow(1 + pricingConfig.inflationRatePct / 100, yearOffset) *
              leaseFactor(yearOffset, totalLeaseholdMonths / 12, pricingConfig.leaseAlpha) *
              ageFactor(yearOffset, pricingConfig.agingBeta) *
              brandFactor(yearOffset, pricingConfig);
          }
          
          if (previousFinalPrice > 0 && currentInvestedCapital > 0) {
                        const priceChange = finalPrice - previousFinalPrice;
            monthlyRoi = ((rentalIncome + priceChange) / currentInvestedCapital) * 100;
          }
          
          // Итоговый ROI = (сумма аренды + (текущая цена - итоговая цена из KPI)) / текущий инвестированный капитал × 100%
          const finalPriceFromKPI = project?.totals?.finalUSD || 0;
          if (currentInvestedCapital > 0) {
            // Сумма аренды с начала до текущего месяца
            let cumulativeRentalIncome = 0;
            for (let m = 0; m <= month; m++) {
              if (m >= handoverMonth + 3) {
                const rentalYearOffset = (m - handoverMonth) / 12;
                const indexedPrice = getIndexedRentalPrice(selectedLine.dailyRateUSD, selectedLine.rentalPriceIndexPct, rentalYearOffset);
                const daysInMonth = getDaysInMonth(m);
                cumulativeRentalIncome += indexedPrice * 0.55 * (daysInMonth / 30.44) * selectedLine.qty;
              }
            }
            cumulativeRoi = ((cumulativeRentalIncome + (finalPrice - finalPriceFromKPI)) / currentInvestedCapital) * 100;
          }
          
          // IRR - внутренняя норма доходности
          if (currentInvestedCapital > 0) {
            // Собираем все денежные потоки
            const cashFlows = [];
            cashFlows.push(-currentInvestedCapital); // CF₀ - текущие инвестиции (отрицательный поток)
            
            for (let i = 0; i <= month; i++) {
              let monthRentalIncome = 0;
              if (i >= handoverMonth + 3) {
                const iYearOffset = (i - handoverMonth) / 12;
                const iIndexedPrice = getIndexedRentalPrice(selectedLine.dailyRateUSD, selectedLine.rentalPriceIndexPct, iYearOffset);
                const iDaysInMonth = getDaysInMonth(i);
                monthRentalIncome = iIndexedPrice * 0.55 * (iDaysInMonth / 30.44) * selectedLine.qty;
              }
              cashFlows.push(monthRentalIncome);
            }
            
            // В последнем месяце добавляем Final Price
            cashFlows[cashFlows.length - 1] += finalPrice;
            
            // Упрощенный расчет IRR
            irr = calculateMonthlyIRR(cashFlows);
          }
        }
        
        data.push({
          month: displayMonth,
          year: displayYear,
          finalPrice,
          leaseFactor: leaseFactorValue,
          ageFactor: ageFactorValue,
          brandFactor: brandFactorValue,
          inflationFactor: inflationFactorValue,
          rentalIncome,
          paymentAmount,
          currentInvestedCapital,
          totalInvestorCapital: finalPrice + rentalIncome,
          // ДОБАВЛЕНО недостающее поле
          monthlyRoi,
          cumulativeRoi,
          irr
        });
      }
      
      return data;
    } catch (error) {
      console.error('Ошибка в generateMonthlyPricingData:', error);
      return [];
    }
  };

  // НОВАЯ ФУНКЦИЯ: Расчет месячного IRR
  const calculateMonthlyIRR = (cashFlows) => {
    if (cashFlows.length < 2) return 0;
    
    // Упрощенный расчет IRR на основе ROI
    const investment = Math.abs(cashFlows[0]);
    const totalReturn = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0);
    
    if (investment <= 0) return 0;
    
    const totalRoi = ((totalReturn - investment) / investment) * 100;
    const months = cashFlows.length - 1;
    
    // Примерная IRR на основе ROI и времени
    return totalRoi / (months / 12);
  };

  // НОВАЯ ФУНКЦИЯ: Расчет IRR (упрощенная версия)
  const calculateIRR = (cashFlows) => {
    if (cashFlows.length < 2) return 0;
    
    // Упрощенный расчет IRR на основе ROI
    const investment = Math.abs(cashFlows[0]);
    const totalReturn = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0);
    
    if (investment <= 0) return 0;
    
    const totalRoi = ((totalReturn - investment) / investment) * 100;
    const months = cashFlows.length - 1;
    
    // Примерная IRR на основе ROI и времени
    return totalRoi / (months / 12);
  };

  // НОВАЯ ФУНКЦИЯ: Расчет данных для линий
  const calculateLinesData = (lines) => {
    return lines.map(line => {
      const villa = catalog
        .flatMap(p => p.villas)
        .find(v => v.villaId === line.villaId);
      
      if (!villa) return null;
      
      const basePrice = villa.baseUSD * (1 - line.discountPct / 100);
      const prePayment = basePrice * (line.prePct / 100);
      const postPayment = basePrice - prePayment;
      
      const preSchedule = stages.map(stage => ({
        month: stage.month,
        amountUSD: prePayment * (stage.pct / 100)
      }));
      
      const postRows = [];
      if (line.ownTerms) {
        const monthlyPayment = postPayment / line.months;
        for (let month = 1; month <= line.months; month++) {
          postRows.push({
            month,
            paymentUSD: monthlyPayment,
            interestUSD: monthlyPayment * (line.monthlyRatePct / 100)
          });
        }
      } else {
        const monthlyPayment = postPayment / months;
        for (let month = 1; month <= months; month++) {
          postRows.push({
            month,
            paymentUSD: monthlyPayment,
            interestUSD: monthlyPayment * (monthlyRatePct / 100)
          });
        }
      }
      
      const totalInterest = postRows.reduce((sum, row) => sum + row.interestUSD, 0);
      
      return {
        line,
        villa,
        basePrice,
        prePayment,
        postPayment,
        preSchedule,
        postRows,
        totalInterest
      };
    }).filter(Boolean);
  };

  // НОВАЯ ФУНКЦИЯ: Генерация кэшфлоу
  const generateCashflow = (linesData) => {
    const cashflow = [];
    const maxMonths = Math.max(...linesData.map(ld => 
      Math.max(ld.preSchedule.length, ld.postRows.length)
    ));
    
    for (let month = 0; month <= maxMonths; month++) {
      let totalPayment = 0;
      let totalRentalIncome = 0;
      
      linesData.forEach(ld => {
        // Платежи по этапам
        const stagePayment = ld.preSchedule.find(s => s.month === month);
        if (stagePayment) {
          totalPayment += stagePayment.amountUSD;
        }
        
        // Ежемесячные платежи
        if (month > handoverMonth) {
          const postMonth = month - handoverMonth;
          const postPayment = ld.postRows.find(r => r.month === postMonth);
          if (postPayment) {
            totalPayment += postPayment.paymentUSD;
          }
        }
        
        // Доход от аренды
        if (month >= handoverMonth + 3) {
          const rentalYearOffset = (month - handoverMonth) / 12;
          const indexedPrice = getIndexedRentalPrice(ld.villa.dailyRateUSD, ld.villa.rentalPriceIndexPct, rentalYearOffset);
          const daysInMonth = getDaysInMonth(month);
          const monthlyRental = indexedPrice * 0.55 * (daysInMonth / 30.44) * ld.line.qty;
          totalRentalIncome += monthlyRental;
        }
      });
      
      const netPayment = totalPayment - totalRentalIncome;
      const remainingBalance = month === 0 ? 0 : cashflow[month - 1]?.remainingBalance || 0;
      
      cashflow.push({
        month,
        description: formatMonth(month),
        amountDue: totalPayment,
        rentalIncome: totalRentalIncome,
        netPayment,
        remainingBalance: remainingBalance + netPayment
      });
    }
    
    return cashflow;
  };

  // Расчет чистого срока лизхолда
  const totalLeaseholdTerm = useMemo(() => {
    if (lines.length === 0) return { years: 0, months: 0 };
    
    const selectedVilla = catalog
      .flatMap(p => p.villas)
      .find(v => v.villaId === lines[0]?.villaId);
    
    if (!selectedVilla || !selectedVilla.leaseholdEndDate) return { years: 0, months: 0 };
    
    return getCleanLeaseholdTerm(selectedVilla.leaseholdEndDate);
  }, [lines, catalog, startMonth, handoverMonth]);

  // Расчет данных для линий
  const linesData = useMemo(() => calculateLinesData(lines), [lines, catalog, stages, months, monthlyRatePct]);

  // Расчет кэшфлоу
  const cashflow = useMemo(() => generateCashflow(linesData), [linesData, handoverMonth, startMonth]);

  // Основной объект проекта
  const project = useMemo(() => {
    if (lines.length === 0) return null;
    
    const totals = linesData.reduce((acc, ld) => {
      acc.baseUSD += ld.basePrice * ld.line.qty;
      acc.preUSD += ld.prePayment * ld.line.qty;
      acc.postUSD += ld.postPayment * ld.line.qty;
      acc.interestUSD += ld.totalInterest * ld.line.qty;
      return acc;
    }, { baseUSD: 0, preUSD: 0, postUSD: 0, interestUSD: 0 });
    
    totals.finalUSD = totals.baseUSD + totals.interestUSD;
    
    // Расчет общего дохода от аренды
    const totalRentalIncome = getCumulativeRentalIncome(lines);
    
    return {
      totals,
      rentalIncome: totalRentalIncome,
      cashflow
    };
  }, [linesData, cashflow, lines]);

  // Данные для графиков
  const chartData = useMemo(() => {
    if (!project) return { finalPricePoints: [], rentalIncomePoints: [], globalMin: 0, globalRange: 1 };
    
    const selectedVilla = catalog
      .flatMap(p => p.villas)
      .find(v => v.villaId === lines[0]?.villaId);
    
    if (!selectedVilla) return { finalPricePoints: [], rentalIncomePoints: [], globalMin: 0, globalRange: 1 };
    
    const pricingData = generatePricingData(selectedVilla);
    const finalPricePoints = pricingData.map((data, index) => ({
      x: index,
      y: data.finalPrice
    }));
    
    const rentalIncomePoints = project.rentalIncome.map((data, index) => ({
      x: index,
      y: data.cumulativeIncome
    }));
    
    const allValues = [...finalPricePoints.map(p => p.y), ...rentalIncomePoints.map(p => p.y)];
    const globalMin = Math.min(...allValues);
    const globalMax = Math.max(...allValues);
    const globalRange = globalMax - globalMin;
    
    return {
      finalPricePoints,
      rentalIncomePoints,
      globalMin,
      globalRange
    };
  }, [project, catalog, lines, startMonth, months, handoverMonth, pricingConfig]);

  // Функции для обновления линий
  const updateLineQty = (id, qty) => {
    setLines(prev => prev.map(line => 
      line.id === id ? { ...line, qty: Math.max(1, qty) } : line
    ));
  };

  const updateLineDiscount = (id, discount) => {
    setLines(prev => prev.map(line => 
      line.id === id ? { ...line, discountPct: Math.max(0, Math.min(100, discount)) } : line
    ));
  };

  const removeLine = (id) => {
    setLines(prev => prev.filter(line => line.id !== id));
  };

  // Функции для работы с каталогом
  const exportCatalog = () => {
    const dataStr = JSON.stringify(catalog, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'arconique-catalog.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCatalog = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedCatalog = JSON.parse(e.target.result);
        setCatalog(importedCatalog);
        alert(t.catalogImported);
      } catch (error) {
        alert(t.importError);
      }
    };
    reader.readAsText(file);
  };

  // Функции для добавления проектов и вилл
  const addProject = () => {
    if (!newProjectForm.projectId || !newProjectForm.projectName) {
      alert(t.fillProjectId);
      return;
    }
    
    if (catalog.some(p => p.projectId === newProjectForm.projectId)) {
      alert(t.projectExists);
      return;
    }
    
    setCatalog(prev => [...prev, { ...newProjectForm, villas: [] }]);
    setNewProjectForm({ projectId: '', projectName: '', villas: [] });
    setShowAddProjectModal(false);
  };

  const saveProject = (projectId, updatedProject) => {
    setCatalog(prev => prev.map(p => 
      p.projectId === projectId ? { ...p, ...updatedProject } : p
    ));
    setEditingProject(null);
  };

  const addVilla = () => {
    if (!newVillaForm.villaId || !newVillaForm.name) {
      alert(t.fillVillaId);
      return;
    }
    
    const project = catalog.find(p => p.projectId === newVillaForm.projectId);
    if (project && project.villas.some(v => v.villaId === newVillaForm.villaId)) {
      alert(t.villaExists);
      return;
    }
    
    setCatalog(prev => prev.map(p => 
      p.projectId === newVillaForm.projectId 
        ? { ...p, villas: [...p.villas, { ...newVillaForm }] }
        : p
    ));
    setNewVillaForm({
      villaId: '',
      name: '',
      area: 100,
      ppsm: 2500,
      baseUSD: 250000,
      monthlyPriceGrowthPct: 2,
      leaseholdEndDate: new Date(2030, 11, 31),
      dailyRateUSD: 150,
      rentalPriceIndexPct: 5
    });
    setShowAddVillaModal(false);
  };

  const saveVilla = (projectId, villaId, updatedVilla) => {
    setCatalog(prev => prev.map(p => 
      p.projectId === projectId 
        ? { ...p, villas: p.villas.map(v => v.villaId === villaId ? { ...v, ...updatedVilla } : v) }
        : p
    ));
  };

  const editVilla = (projectId, villa) => {
    setNewVillaForm({
      ...villa,
      projectId
    });
    setShowAddVillaModal(true);
  };

  // Функции экспорта
  const exportCSV = () => {
    if (!project) return;
    
    const headers = ['Month', 'Description', 'Amount Due', 'Rental Income', 'Net Payment', 'Remaining Balance'];
    const csvContent = [
      headers.join(','),
      ...project.cashflow.map(row => [
        row.month,
        `"${row.description}"`,
        row.amountDue,
        row.rentalIncome,
        row.netPayment,
        row.remainingBalance
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'arconique-cashflow.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportXLSX = () => {
    if (!project || typeof XLSX === 'undefined') {
      alert(t.xlsxNotLoaded);
      return;
    }
    
    const worksheet = XLSX.utils.json_to_sheet(project.cashflow);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cashflow');
    XLSX.writeFile(workbook, 'arconique-cashflow.xlsx');
  };

  const exportPDF = () => {
    if (!project || typeof html2pdf === 'undefined') {
      alert(t.html2pdfNotLoaded);
      return;
    }
    
    const element = document.getElementById('cashflow-table');
    if (!element) return;
    
    const opt = {
      margin: 1,
      filename: 'arconique-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  // Функция переключения режимов
  const toggleMode = () => {
    if (isClient) {
      const pin = prompt(t.enterPin);
      if (pin === PIN_CODE) {
        setIsClient(false);
        alert(t.editorActivated);
      } else {
        alert(t.wrongPin);
      }
    } else {
      setIsClient(true);
      alert(t.switchedToClient);
    }
  };

  // Функции для управления этапами
  const addStage = () => {
    const newStage = {
      id: Math.max(...stages.map(s => s.id)) + 1,
      label: `Этап ${stages.length + 1}`,
      pct: 0,
      month: Math.max(...stages.map(s => s.month)) + 1
    };
    setStages(prev => [...prev, newStage]);
  };

  const delStage = (id) => {
    setStages(prev => prev.filter(s => s.id !== id));
  };

  const updStage = (id, field, value) => {
    setStages(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  // Рендер компонента
  return (
    <div className="app">
      {/* Заголовок */}
      <header className="app-header">
        <h1 id="app-title">{t.title}</h1>
        <div className="header-controls">
          <button onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')} className="lang-toggle">
            {t.lang}
          </button>
          <button onClick={toggleMode} className="mode-toggle">
            {isClient ? t.toggleToEditor : t.toggleToClient}
          </button>
        </div>
      </header>

      {/* Основной контент */}
      <main className="app-main">
        {/* Блок KPI */}
        {!isClient && (
          <div className="kpi-block">
            <h3>Точка выхода с макс. IRR</h3>
            <div className="kpi-grid">
              <div className="kpi-item">
                <span className="kpi-label">Оптимальный год:</span>
                <span className="kpi-value">{calculateOptimalExitPoint.year}</span>
              </div>
              <div className="kpi-item">
                <span className="kpi-label">IRR:</span>
                <span className="kpi-value">{calculateOptimalExitPoint.irr.toFixed(1)}%</span>
              </div>
              <div className="kpi-item">
                <span className="kpi-label">Итоговый ROI:</span>
                <span className="kpi-value">{calculateOptimalExitPoint.cumulativeRoi.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Настройки */}
        <div className="settings-section">
          <div className="settings-grid">
            <div className="setting-group">
              <label>{t.currencyDisplay}</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="IDR">IDR</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            
            <div className="setting-group">
              <label>{t.idrRate}</label>
              <input 
                type="number" 
                value={idrPerUsd} 
                onChange={(e) => setIdrPerUsd(+e.target.value)}
                min="1000" 
                max="50000" 
                step="100"
              />
            </div>
            
            <div className="setting-group">
              <label>{t.eurRate}</label>
              <input 
                type="number" 
                value={eurPerUsd} 
                onChange={(e) => setEurPerUsd(+e.target.value)}
                min="0.5" 
                max="2" 
                step="0.01"
              />
            </div>
            
            <div className="setting-group">
              <label>{t.handoverMonth}</label>
              <input 
                type="number" 
                value={handoverMonth} 
                onChange={(e) => setHandoverMonth(+e.target.value)}
                min="0" 
                max="24" 
                step="1"
              />
            </div>
            
            <div className="setting-group">
              <label>{t.globalTerm}</label>
              <input 
                type="number" 
                value={months} 
                onChange={(e) => setMonths(+e.target.value)}
                min="6" 
                max="24" 
                step="1"
              />
            </div>
            
            <div className="setting-group">
              <label>{t.globalRate}</label>
              <input 
                type="number" 
                value={monthlyRatePct} 
                onChange={(e) => setMonthlyRatePct(+e.target.value)}
                min="0" 
                max="20" 
                step="0.1"
              />
            </div>
            
            <div className="setting-group">
              <label>{t.startMonth}</label>
              <input 
                type="date" 
                value={startMonth.toISOString().split('T')[0]} 
                onChange={(e) => setStartMonth(new Date(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Этапы рассрочки */}
        <div className="stages-section">
          <h3>{t.stagesTitle}</h3>
          <div className="stages-summary">
            {t.stagesSum} {stagesSumPct.toFixed(1)}%
            {stagesSumPct < 100 && <span className="warning">{t.notEnough} {100 - stagesSumPct.toFixed(1)}%</span>}
            {stagesSumPct > 100 && <span className="warning">{t.exceeds} {stagesSumPct - 100}%</span>}
          </div>
          
          <div className="stages-grid">
            {stages.map(stage => (
              <div key={stage.id} className="stage-item">
                <input 
                  type="text" 
                  value={stage.label} 
                  onChange={(e) => updStage(stage.id, 'label', e.target.value)}
                  className="stage-label"
                />
                <input 
                  type="number" 
                  value={stage.pct} 
                  onChange={(e) => updStage(stage.id, 'pct', +e.target.value)}
                  className="stage-pct"
                  min="0" 
                  max="100" 
                  step="0.1"
                />
                <input 
                  type="number" 
                  value={stage.month} 
                  onChange={(e) => updStage(stage.id, 'month', +e.target.value)}
                  className="stage-month"
                  min="0" 
                  max="24" 
                  step="1"
                />
                <button onClick={() => delStage(stage.id)} className="delete-btn">
                  {t.delete}
                </button>
              </div>
            ))}
          </div>
          
          <button onClick={addStage} className="add-stage-btn">
            {t.addStage}
          </button>
        </div>

        {/* Позиции */}
        <div className="villas-section">
          <h3>{t.villasTitle}</h3>
          
          {!isClient && (
            <div className="catalog-controls">
              <button onClick={() => setModalOpen(true)} className="catalog-btn">
                {t.selectFromCatalog}
              </button>
              <button onClick={() => setShowAddProjectModal(true)} className="add-project-btn">
                {t.addProject}
              </button>
              <button onClick={() => setShowAddVillaModal(true)} className="add-villa-btn">
                {t.addVilla}
              </button>
              <button onClick={exportCatalog} className="export-btn">
                {t.exportJSON}
              </button>
              <input 
                type="file" 
                accept=".json" 
                onChange={importCatalog} 
                style={{ display: 'none' }}
                id="import-catalog"
              />
              <label htmlFor="import-catalog" className="import-btn">
                {t.importJSON}
              </label>
            </div>
          )}
          
          <div className="lines-table">
            <table>
              <thead>
                <tr>
                  <th>{t.project}</th>
                  <th>{t.villa}</th>
                  <th>{t.qty}</th>
                  <th>{t.area}</th>
                  <th>{t.ppsm}</th>
                  <th>{t.price}</th>
                  <th>{t.discount}</th>
                  <th>{t.prePct}</th>
                  <th>{t.months}</th>
                  <th>{t.rate}</th>
                  <th>{t.lineTotal}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map(line => {
                  const villa = catalog
                    .flatMap(p => p.villas)
                    .find(v => v.villaId === line.villaId);
                  
                  if (!villa) return null;
                  
                  const lineData = linesData.find(ld => ld.line.id === line.id);
                  const totalPrice = lineData ? lineData.basePrice + lineData.totalInterest : 0;
                  
                  return (
                    <tr key={line.id}>
                      <td>{catalog.find(p => p.villas.some(v => v.villaId === line.villaId))?.projectName}</td>
                      <td>{villa.name}</td>
                      <td>
                        <input 
                          type="number" 
                          value={line.qty} 
                          onChange={(e) => updateLineQty(line.id, +e.target.value)}
                          min="1" 
                          max="10"
                        />
                      </td>
                      <td>{villa.area}</td>
                      <td>{villa.ppsm}</td>
                      <td>{fmtMoney(villa.baseUSD)}</td>
                      <td>
                        <input 
                          type="number" 
                          value={line.discountPct} 
                          onChange={(e) => updateLineDiscount(line.id, +e.target.value)}
                          min="0" 
                          max="100" 
                          step="0.1"
                        />
                      </td>
                      <td>{line.prePct}%</td>
                      <td>
                        {line.ownTerms ? (
                          <input 
                            type="number" 
                            value={line.months || ''} 
                            onChange={(e) => setLines(prev => prev.map(l => 
                              l.id === line.id ? { ...l, months: +e.target.value } : l
                            ))}
                            min="6" 
                            max="24" 
                            step="1"
                          />
                        ) : (
                          months
                        )}
                      </td>
                      <td>
                        {line.ownTerms ? (
                          <input 
                            type="number" 
                            value={line.monthlyRatePct || ''} 
                            onChange={(e) => setLines(prev => prev.map(l => 
                              l.id === line.id ? { ...l, monthlyRatePct: +e.target.value } : l
                            ))}
                            min="0" 
                            max="20" 
                            step="0.1"
                          />
                        ) : (
                          monthlyRatePct
                        )}
                      </td>
                      <td>{fmtMoney(totalPrice * line.qty)}</td>
                      <td>
                        <button onClick={() => removeLine(line.id)} className="delete-btn">
                          {t.remove}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Таблица факторов */}
        {lines.length > 0 && (
          <div className="factors-section">
            <h3>Таблица факторов</h3>
            <div className="factors-table-container">
              <div className="factors-table-scroll">
                <table className="factors-table">
                  <thead>
                    <tr>
                      <th>Год</th>
                      <th>Final Price</th>
                      <th>Lease Factor</th>
                      <th>Age Factor</th>
                      <th>Brand Factor</th>
                      <th>Коэффициент инфляции</th>
                      <th>Доходность от аренды</th>
                      <th>ROI за год (%)</th>
                      <th>Итоговый ROI (%)</th>
                      <th>IRR (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const selectedVilla = catalog
                        .flatMap(p => p.villas)
                        .find(v => v.villaId === lines[0]?.villaId);
                      
                      if (!selectedVilla) return null;
                      
                      return generateFactorsData(selectedVilla).map((data, index) => (
                        <tr key={index}>
                          <td>{data.year}</td>
                          <td>{fmtMoney(data.finalPrice)}</td>
                          <td>{data.leaseFactor.toFixed(4)}</td>
                          <td>{data.ageFactor.toFixed(4)}</td>
                          <td>{data.brandFactor.toFixed(4)}</td>
                          <td>{data.inflationFactor.toFixed(4)}</td>
                          <td>{fmtMoney(data.rentalIncome)}</td>
                          <td>{data.annualRoi.toFixed(2)}%</td>
                          <td>{data.cumulativeRoi.toFixed(2)}%</td>
                          <td>{data.irr.toFixed(2)}%</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Таблица факторов 2 (месячная детализация) */}
        {lines.length > 0 && (
          <div className="factors-section">
            <h3>Таблица факторов 2 (месячная детализация)</h3>
            <div className="factors-table-container">
              <div className="factors-table-scroll">
                <table className="factors-table">
                  <thead>
                    <tr>
                      <th>Месяц</th>
                      <th>Год</th>
                      <th>Lease Factor</th>
                      <th>Age Factor</th>
                      <th>Brand Factor</th>
                      <th>Коэффициент инфляции</th>
                      <th>Final Price</th>
                      <th>Доходность от аренды</th>
                      <th>Общий капитал инвестора</th>
                      <th>Сумма к оплате</th>
                      <th>ROI за месяц (%)</th>
                      <th>Итоговый ROI (%)</th>
                      <th>IRR (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const selectedVilla = catalog
                        .flatMap(p => p.villas)
                        .find(v => v.villaId === lines[0]?.villaId);
                      
                      if (!selectedVilla) return null;
                      
                      return generateMonthlyPricingData(selectedVilla).map((data, index) => (
                        <tr key={index}>
                          <td>{data.month}</td>
                          <td>{data.year}</td>
                          <td>{data.leaseFactor.toFixed(4)}</td>
                          <td>{data.ageFactor.toFixed(4)}</td>
                          <td>{data.brandFactor.toFixed(4)}</td>
                          <td>{data.inflationFactor.toFixed(4)}</td>
                          <td>{fmtMoney(data.finalPrice)}</td>
                          <td>{fmtMoney(data.rentalIncome)}</td>
                          <td>{fmtMoney(data.totalInvestorCapital)}</td>
                          <td>{fmtMoney(data.paymentAmount)}</td>
                          <td>{data.monthlyRoi.toFixed(2)}%</td>
                          <td>{data.cumulativeRoi.toFixed(2)}%</td>
                          <td>{data.irr.toFixed(2)}%</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Кэшфлоу */}
        {project && (
          <div className="cashflow-section">
            <h3>{t.cashflowTitle}</h3>
            <div className="export-controls">
              <button onClick={exportCSV} className="export-btn">{t.exportCSV}</button>
              <button onClick={exportXLSX} className="export-btn">{t.exportXLSX}</button>
              <button onClick={exportPDF} className="export-btn">{t.exportPDF}</button>
            </div>
            
            <div className="cashflow-container">
              <div className="cashflow-scroll">
                <table id="cashflow-table" className="cashflow-table">
                  <thead>
                    <tr>
                      <th>{t.month}</th>
                      <th>{t.description}</th>
                      <th>{t.amountDue}</th>
                      <th>{t.rentalIncome}</th>
                      <th>{t.netPayment}</th>
                      <th>{t.remainingBalance}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.cashflow.map((row, index) => (
                      <tr key={index}>
                        <td>{row.month}</td>
                        <td>{row.description}</td>
                        <td>{fmtMoney(row.amountDue)}</td>
                        <td>{fmtMoney(row.rentalIncome)}</td>
                        <td>{fmtMoney(row.netPayment)}</td>
                        <td>{fmtMoney(row.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Графики */}
        {chartData.finalPricePoints.length > 0 && (
          <div className="charts-section">
            <h3>Графики ценообразования</h3>
            <div className="chart-container">
              <svg width="800" height="400" className="price-chart">
                {/* График цены */}
                <path
                  d={chartData.finalPricePoints.map((point, index) => 
                    `${index === 0 ? 'M' : 'L'} ${point.x * 40 + 50} ${400 - (point.y - chartData.globalMin) / chartData.globalRange * 300 + 50}`
                  ).join(' ')}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                />
                
                {/* График дохода от аренды */}
                <path
                  d={chartData.rentalIncomePoints.map((point, index) => 
                    `${index === 0 ? 'M' : 'L'} ${point.x * 40 + 50} ${400 - (point.y - chartData.globalMin) / chartData.globalRange * 300 + 50}`
                  ).join(' ')}
                  stroke="#10b981"
                  strokeWidth="2"
                  fill="none"
                />
                
                {/* Подписи осей */}
                <text x="400" y="390" textAnchor="middle" fill="white">Годы</text>
                <text x="20" y="200" textAnchor="middle" fill="white" transform="rotate(-90, 20, 200)">Стоимость (USD)</text>
              </svg>
            </div>
          </div>
        )}
      </main>

      {/* Модальные окна */}
      
      {/* Модальное окно выбора из каталога */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t.selectFromCatalog}</h3>
            <div className="catalog-search">
              <input 
                type="text" 
                placeholder={t.search} 
                className="search-input"
              />
            </div>
            
            <div className="catalog-filters">
              <input 
                type="number" 
                placeholder={t.areaFrom} 
                className="filter-input"
              />
              <input 
                type="number" 
                placeholder={t.areaTo} 
                className="filter-input"
              />
              <input 
                type="number" 
                placeholder={t.priceFrom} 
                className="filter-input"
              />
              <input 
                type="number" 
                placeholder={t.priceTo} 
                className="filter-input"
              />
              <select className="sort-select">
                <option value="price">{t.byPrice}</option>
                <option value="area">{t.byArea}</option>
                <option value="name">{t.byName}</option>
              </select>
            </div>
            
            <div className="catalog-list">
              {catalog.map(project => (
                <div key={project.projectId} className="project-group">
                  <h4>{project.projectName}</h4>
                  {project.villas.map(villa => (
                    <div key={villa.villaId} className="villa-item">
                      <input 
                        type="checkbox" 
                        id={villa.villaId}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLines(prev => [...prev, {
                              id: Math.max(...prev.map(l => l.id)) + 1,
                              projectId: project.projectId,
                              villaId: villa.villaId,
                              qty: 1,
                              prePct: 70,
                              ownTerms: false,
                              months: null,
                              monthlyRatePct: null,
                              firstPostUSD: 0,
                              discountPct: 0,
                              monthlyPriceGrowthPct: villa.monthlyPriceGrowthPct || 2,
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
                            }]);
                          } else {
                            setLines(prev => prev.filter(l => l.villaId !== villa.villaId));
                          }
                        }}
                      />
                      <label htmlFor={villa.villaId}>
                        {villa.name} - {villa.area}м² - {fmtMoney(villa.baseUSD)}
                      </label>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setModalOpen(false)} className="cancel-btn">
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления проекта */}
      {showAddProjectModal && (
        <div className="modal-overlay" onClick={() => setShowAddProjectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t.addProject}</h3>
            <div className="form-group">
              <label>{t.projectName}</label>
              <input 
                type="text" 
                value={newProjectForm.projectId} 
                onChange={(e) => setNewProjectForm(prev => ({ ...prev, projectId: e.target.value }))}
                placeholder="ID проекта"
              />
            </div>
            <div className="form-group">
              <label>{t.projectName}</label>
              <input 
                type="text" 
                value={newProjectForm.projectName} 
                onChange={(e) => setNewProjectForm(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="Название проекта"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddProjectModal(false)} className="cancel-btn">
                {t.cancel}
              </button>
              <button onClick={addProject} className="save-btn">
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления виллы */}
      {showAddVillaModal && (
        <div className="modal-overlay" onClick={() => setShowAddVillaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t.addVilla}</h3>
            <div className="form-group">
              <label>Проект</label>
              <select 
                value={newVillaForm.projectId} 
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, projectId: e.target.value }))}
              >
                <option value="">Выберите проект</option>
                {catalog.map(project => (
                  <option key={project.projectId} value={project.projectId}>
                    {project.projectName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>{t.villaName}</label>
              <input 
                type="text" 
                value={newVillaForm.villaId} 
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, villaId: e.target.value }))}
                placeholder="ID виллы"
              />
            </div>
            <div className="form-group">
              <label>{t.villaName}</label>
              <input 
                type="text" 
                value={newVillaForm.name} 
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Название виллы"
              />
            </div>
            <div className="form-group">
              <label>{t.villaArea}</label>
              <input 
                type="number" 
                value={newVillaForm.area} 
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, area: +e.target.value }))}
                min="50" 
                max="500"
              />
            </div>
            <div className="form-group">
              <label>{t.villaPpsm}</label>
              <input 
                type="number" 
                value={newVillaForm.ppsm} 
                                onChange={(e) => setNewVillaForm(prev => ({ ...prev, ppsm: +e.target.value }))}
                min="1000" 
                max="10000"
              />
            </div>
            <div className="form-group">
              <label>{t.villaBasePrice}</label>
              <input 
                type="number" 
                value={newVillaForm.baseUSD} 
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, baseUSD: +e.target.value }))}
                min="50000" 
                max="1000000"
              />
            </div>
            <div className="form-group">
              <label>{t.monthlyPriceGrowth}</label>
              <input 
                type="number" 
                value={newVillaForm.monthlyPriceGrowthPct} 
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, monthlyPriceGrowthPct: +e.target.value }))}
                min="0" 
                max="10" 
                step="0.1"
              />
            </div>
            <div className="form-group">
              <label>{t.leaseholdEndDate}</label>
              <input 
                type="date" 
                value={newVillaForm.leaseholdEndDate.toISOString().split('T')[0]} 
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, leaseholdEndDate: new Date(e.target.value) }))}
              />
            </div>
            <div className="form-group">
              <label>{t.dailyRate}</label>
              <input 
                type="number" 
                value={newVillaForm.dailyRateUSD} 
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, dailyRateUSD: +e.target.value }))}
                min="50" 
                max="500"
              />
            </div>
            <div className="form-group">
              <label>{t.rentalPriceIndex}</label>
              <input 
                type="number" 
                value={newVillaForm.rentalPriceIndexPct} 
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, rentalPriceIndexPct: +e.target.value }))}
                min="0" 
                max="20" 
                step="0.1"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowAddVillaModal(false)} className="cancel-btn">
                {t.cancel}
              </button>
              <button onClick={addVilla} className="save-btn">
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Рендер приложения
const root = createRoot(document.getElementById('root'));
root.render(<App />);
