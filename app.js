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
          totalInvestorCapital: finalPrice + rentalIncome, // ДОБАВЛЕНО недостающее поле
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

  // ДОБАВЛЕННЫЕ ФУНКЦИИ: Обновление и удаление линий
  const updateLineQty = (id, qty) => {
    setLines(prev => prev.map(l => l.id === id ? {...l, qty} : l));
  };

  const updateLineDiscount = (id, discountPct) => {
    setLines(prev => prev.map(l => l.id === id ? {...l, discountPct} : l));
  };

  const removeLine = (id) => {
    setLines(prev => prev.filter(l => l.id !== id));
  };

  // Функции для работы с каталогом
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
          }
        } catch (error) {
          alert('Ошибка при импорте файла');
        }
      };
      reader.readAsText(file);
    }
  };

  // Данные для графика
  const chartData = useMemo(() => {
    if (lines.length === 0) return { 
      finalPricePoints: '', 
      rentalIncomePoints: '', 
      globalMin: 0, 
      globalRange: 1 
    };
    
    const selectedVilla = catalog
      .flatMap(p => p.villas)
      .find(v => v.villaId === lines[0]?.villaId);
    
    if (!selectedVilla) return { 
      finalPricePoints: '', 
      rentalIncomePoints: '', 
      globalMin: 0, 
      globalRange: 1 
    };
    
    const pricingData = generatePricingData(selectedVilla);
    
    // Точки для Final Price
    const finalPricePoints = pricingData.map((data, index) => {
      const x = 50 + index * 140;
      const y = 250 - (data.finalPrice / 1000000) * 200; // Масштаб для миллионов
      return `${x},${y}`;
    }).join(' ');
    
    // Точки для доходности от аренды
    const rentalIncomePoints = pricingData.map((data, index) => {
      const x = 50 + index * 140;
      const y = 250 - (data.rentalIncome / 1000000) * 200; // Масштаб для миллионов
      return `${x},${y}`;
    }).join(' ');
    
    // Общий диапазон для масштабирования
    const allValues = [
      ...pricingData.map(d => d.finalPrice), 
      ...pricingData.map(d => d.rentalIncome)
    ];
    const globalMin = Math.min(...allValues);
    const globalMax = Math.max(...allValues);
    const globalRange = globalMax - globalMin;
    
    return { finalPricePoints, rentalIncomePoints, globalMin, globalRange };
  }, [lines, catalog, startMonth, months, handoverMonth, pricingConfig]);

  const { finalPricePoints, rentalIncomePoints, globalMin, globalRange } = chartData;

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

  // ДОБАВЛЕННАЯ ФУНКЦИЯ: calculateLinesData для использования в project
  const calculateLinesData = () => {
    return lines.map(line => {
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
    });
  };

  // ДОБАВЛЕННАЯ ФУНКЦИЯ: totalLeaseholdTerm
  const totalLeaseholdTerm = useMemo(() => {
    if (lines.length === 0) return { years: 0, months: 0 };
    
    const selectedVilla = catalog
      .flatMap(p => p.villas)
      .find(v => v.villaId === lines[0]?.villaId);
    
    if (!selectedVilla || !selectedVilla.leaseholdEndDate) return { years: 0, months: 0 };
    
    return getCleanLeaseholdTerm(selectedVilla.leaseholdEndDate);
  }, [lines, catalog, startMonth, handoverMonth]);

  // ДОБАВЛЕННАЯ ФУНКЦИЯ: generateCashflow
  const generateCashflow = (linesData, handoverMonth, months, startMonth, lines, catalog) => {
    const cashflow = [];
    
    // Генерируем кэшфлоу по месяцам
    for (let month = 0; month <= handoverMonth + months; month++) {
      const monthData = {
        month,
        items: [],
        amountUSD: 0,
        rentalIncome: 0,
        netPayment: 0,
        balanceUSD: 0
      };
      
      // Добавляем платежи по этапам
      linesData.forEach(ld => {
        if (month <= handoverMonth) {
          const stagePayment = ld.preSchedule.find(s => s.month === month);
          if (stagePayment) {
            monthData.items.push(stagePayment.label);
            monthData.amountUSD += stagePayment.amountUSD;
          }
        } else {
          const postMonth = month - handoverMonth;
          const postPayment = ld.postRows.find(r => r.month === postMonth);
          if (postPayment) {
            monthData.items.push(postPayment.label);
            monthData.amountUSD += postPayment.paymentUSD;
          }
        }
      });
      
      // Добавляем доход от аренды
      if (month >= handoverMonth + 3) {
        lines.forEach(line => {
          const villa = catalog
            .flatMap(p => p.villas)
            .find(v => v.villaId === line.villaId);
          
          if (villa) {
            const yearOffset = (month - handoverMonth) / 12;
            const indexedPrice = getIndexedRentalPrice(villa.dailyRateUSD, villa.rentalPriceIndexPct, yearOffset);
            const daysInMonth = getDaysInMonth(month);
            const monthlyRental = indexedPrice * 0.55 * (daysInMonth / 30.44) * line.qty;
            monthData.rentalIncome += monthlyRental;
          }
        });
      }
      
      // Рассчитываем чистый платеж
      monthData.netPayment = monthData.rentalIncome - monthData.amountUSD;
      
      // Рассчитываем остаток долга
      if (month === 0) {
        monthData.balanceUSD = linesData.reduce((sum, ld) => sum + ld.base, 0);
      } else {
        monthData.balanceUSD = cashflow[month - 1].balanceUSD - monthData.amountUSD;
      }
      
      cashflow.push(monthData);
    }
    
    return cashflow;
  };

  // Расчет проекта (ОБНОВЛЕН С НОВОЙ ЛОГИКОЙ АРЕНДЫ С ИНДЕКСАЦИЕЙ)
  const project = useMemo(() => {
    if (lines.length === 0) return null;
    
    const linesData = calculateLinesData();
    if (!linesData || linesData.length === 0) return null;
    
    // Базовые расчеты
    const base = linesData.reduce((sum, ld) => sum + ld.base, 0);
    const preTotal = linesData.reduce((sum, ld) => sum + ld.preTotal, 0);
    const firstPostUSD = linesData.reduce((sum, ld) => sum + ld.firstPostUSD, 0);
    const postTotal = linesData.reduce((sum, ld) => 
      sum + ld.postRows.reduce((postSum, pr) => postSum + pr.paymentUSD, 0), 0);
    
    // НОВАЯ ЛОГИКА: Расчет итоговой цены с учетом всех факторов
    const finalUSD = linesData.reduce((total, ld) => {
      const villa = catalog
        .flatMap(p => p.villas)
        .find(v => v.villaId === ld.line.villaId);
      
      if (!villa) return total;
      
      // Рыночная цена на ключах
      const marketPriceAtHandover = calculateMarketPriceAtHandover(villa, ld.line);
      
      // Итоговая цена с учетом всех факторов
      const finalPrice = marketPriceAtHandover * 
        Math.pow(1 + pricingConfig.inflationRatePct / 100, months / 12) *
        leaseFactor(months / 12, (villa.leaseholdEndDate.getFullYear() - startMonth.getFullYear() - months / 12), pricingConfig.leaseAlpha) *
        ageFactor(months / 12, pricingConfig.agingBeta) *
        brandFactor(months / 12, pricingConfig);
      
      return total + (finalPrice * ld.qty);
    }, 0);
    
    // НОВАЯ ЛОГИКА: Расчет доходности от аренды с индексацией
    const rentalIncome = linesData.reduce((total, ld) => {
      const villa = catalog
        .flatMap(p => p.villas)
        .find(v => v.villaId === ld.line.villaId);
      
      if (!villa) return total;
      
      let totalRentalIncome = 0;
      
      // Расчет аренды по месяцам после получения ключей
      for (let month = handoverMonth + 3; month <= handoverMonth + months; month++) {
        const yearOffset = (month - handoverMonth) / 12;
        const indexedPrice = getIndexedRentalPrice(villa.dailyRateUSD, villa.rentalPriceIndexPct, yearOffset);
        const daysInMonth = getDaysInMonth(month);
        const monthlyRental = indexedPrice * 0.55 * (daysInMonth / 30.44) * ld.qty;
        totalRentalIncome += monthlyRental;
      }
      
      return total + totalRentalIncome;
    }, 0);
    
    // НОВАЯ ЛОГИКА: Расчет ROI и IRR
    const totalInvestment = preTotal + firstPostUSD + postTotal;
    const totalReturn = finalUSD + rentalIncome;
    const totalRoi = totalInvestment > 0 ? ((totalReturn - totalInvestment) / totalInvestment) * 100 : 0;
    
    // IRR расчет (упрощенный)
    const irr = calculateIRR([-totalInvestment, rentalIncome, finalUSD]);
    
    return {
      lines: linesData,
      totals: {
        base, preTotal, firstPostUSD, postTotal, finalUSD, rentalIncome, totalInvestment, totalReturn, totalRoi, irr,
        preUSD: preTotal,
        afterUSD: firstPostUSD + postTotal,
        interestUSD: postTotal - (base - preTotal - firstPostUSD)
      },
      cashflow: generateCashflow(linesData, handoverMonth, months, startMonth, lines, catalog)
    };
  }, [lines, stages, stagesSumPct, handoverMonth, months, monthlyRatePct, catalog, pricingConfig, startMonth]);

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
      // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
      monthlyPriceGrowthPct: 2,
      // НОВЫЕ ПОЛЯ ДЛЯ ЛИЗХОЛДА И АРЕНДЫ:
      leaseholdEndDate: new Date(2030, 11, 31),
      dailyRateUSD: 150,
      rentalPriceIndexPct: 5
    });
    setEditingProject(projectId);
    setShowAddVillaModal(true);
  };

  // ИСПРАВЛЕНО: Добавлена проверка на editingProject
  const saveVilla = () => {
    if (!editingProject) {
      alert('Ошибка: не выбран проект для добавления виллы');
      return;
    }
    
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
      // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
      monthlyPriceGrowthPct: newVillaForm.monthlyPriceGrowthPct,
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
      // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
      monthlyPriceGrowthPct: 2,
      leaseholdEndDate: new Date(2030, 11, 31),
      dailyRateUSD: 150,
      rentalPriceIndexPct: 5
    });
  };

  // НОВАЯ ФУНКЦИЯ: Редактирование виллы
  const editVilla = (villa, projectId) => {
    setNewVillaForm({
      villaId: villa.villaId,
      name: villa.name,
      area: villa.area,
      ppsm: villa.ppsm,
      baseUSD: villa.baseUSD,
      // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
      monthlyPriceGrowthPct: villa.monthlyPriceGrowthPct || 2,
      leaseholdEndDate: villa.leaseholdEndDate,
      dailyRateUSD: villa.dailyRateUSD,
      rentalPriceIndexPct: villa.rentalPriceIndexPct
    });
    setEditingProject(projectId);
    setShowAddVillaModal(true);
  };

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
      // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
      monthlyPriceGrowthPct: villa.monthlyPriceGrowthPct || 2,
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

  // Функции экспорта (ОБНОВЛЕНЫ С НОВЫМИ ПОЛЯМИ И ПРОВЕРКАМИ)
  const exportCSV = () => {
    if (!project || !project.cashflow) return;
    
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
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cashflow.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ИСПРАВЛЕНО: Добавлена проверка на XLSX
  const exportXLSX = () => {
    if (typeof XLSX === 'undefined') {
      alert(t.xlsxNotLoaded);
      return;
    }
    
    if (!project || !project.cashflow) return;
    
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
      [t.monthlyPriceGrowth]: ld.line.monthlyPriceGrowthPct || 0,
      [t.leaseholdEndDate]: ld.line.snapshot?.leaseholdEndDate ? ld.line.snapshot.leaseholdEndDate.toLocaleDateString() : ''
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Cashflow');
    XLSX.utils.book_append_sheet(wb, ws2, 'Lines');
    XLSX.writeFile(wb, `arconique_installments_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ИСПРАВЛЕНО: Добавлена проверка на html2pdf
  const exportPDF = () => {
    if (typeof html2pdf === 'undefined') {
      alert(t.html2pdfNotLoaded);
      return;
    }
    
    if (!project || !project.cashflow) return;
    
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
                {/* НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей (только для редактора) */}
                {!isClient && <th className="col-monthlyGrowth">{t.monthlyPriceGrowth}</th>}
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
                  <td className="col-project">
                    <div className="project-info">
                      <div className="project-name">{ld.line.projectName}</div>
                      <div className="villa-name">{ld.line.villaName}</div>
                    </div>
                  </td>
                  <td className="col-qty">
                    <input 
                      type="number" 
                      value={ld.qty} 
                      onChange={(e) => updateLineQty(ld.line.id, parseInt(e.target.value) || 0)}
                      min="0"
                      className="qty-input"
                    />
                  </td>
                  <td className="col-base">{fmtMoney(ld.baseOne, currency)}</td>
                  <td className="col-total">{fmtMoney(ld.base, currency)}</td>
                  <td className="col-discount">
                    <input 
                      type="number" 
                      value={ld.discountPct} 
                      onChange={(e) => updateLineDiscount(ld.line.id, parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                      className="discount-input"
                    />
                  </td>
                  <td className="col-pre">{ld.prePct.toFixed(1)}%</td>
                  <td className="col-keys">{fmtMoney(ld.preTotal, currency)}</td>
                  <td className="col-post">{fmtMoney(ld.firstPostUSD, currency)}</td>
                  <td className="col-months">{ld.vMonths}</td>
                  <td className="col-rate">{ld.rate.toFixed(2)}%</td>
                  <td className="col-total-final">{fmtMoney(ld.lineTotal, currency)}</td>
                  <td className="col-actions">
                    <button 
                      className="btn-icon danger" 
                      onClick={() => removeLine(ld.line.id)}
                      title={t.remove}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Таблица факторов - ОБНОВЛЕНА С НОВЫМИ СТОЛБЦАМИ ROI */}
      <div className="factors-block">
        <div className="card">
          <div className="card-header">
            <h2>Таблица факторов</h2>
          </div>
          
          <div className="factors-table-container">
            <div className="factors-table-scroll">
              <table className="factors-table">
                <thead>
                  <tr>
                    <th>Год</th>
                    <th>Lease Factor</th>
                    <th>Age Factor</th>
                    <th>Brand Factor</th>
                    <th>Коэффициент инфляции</th>
                    <th>Final Price</th>
                    <th>Доходность от аренды</th>
                    <th>ROI за год (%)</th>
                    <th>Итоговый ROI (%)</th>
                    <th>IRR (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.length > 0 && generateFactorsData(lines[0]).map((data, index) => (
                    <tr key={index}>
                      <td>{data.year}</td>
                      <td>{data.leaseFactor.toFixed(4)}</td>
                      <td>{data.ageFactor.toFixed(4)}</td>
                      <td>{data.brandFactor.toFixed(4)}</td>
                      <td>{data.inflationFactor.toFixed(4)}</td>
                      <td>{fmtMoney(data.finalPrice, currency)}</td>
                      <td>{fmtMoney(data.rentalIncome, currency)}</td>
                      <td>{data.annualRoi.toFixed(2)}%</td>
                      <td>{data.cumulativeRoi.toFixed(2)}%</td>
                      <td>{data.irr.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Таблица факторов 2 - месячная детализация - НОВАЯ */}
      <div className="factors-block">
        <div className="card">
          <div className="card-header">
            <h2>Таблица факторов 2 (месячная детализация)</h2>
          </div>
          
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
                  {lines.length > 0 && generateMonthlyPricingData(lines[0]).map((data, index) => (
                    <tr key={index}>
                      <td>{data.month}</td>
                      <td>{data.year}</td>
                      <td>{data.leaseFactor.toFixed(4)}</td>
                      <td>{data.ageFactor.toFixed(4)}</td>
                      <td>{data.brandFactor.toFixed(4)}</td>
                      <td>{data.inflationFactor.toFixed(4)}</td>
                      <td>{fmtMoney(data.finalPrice, currency)}</td>
                      <td>{fmtMoney(data.rentalIncome, currency)}</td>
                      <td>{fmtMoney(data.totalInvestorCapital, currency)}</td>
                      <td>{fmtMoney(data.paymentAmount, currency)}</td>
                      <td>{data.monthlyRoi.toFixed(2)}%</td>
                      <td>{data.cumulativeRoi.toFixed(2)}%</td>
                      <td>{data.irr.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 5. График ценообразования - ОБНОВЛЕН С ОБЩИМ МАСШТАБОМ */}
      <div className="chart-block">
        <div className="card">
          <div className="card-header">
            <h2>График ценообразования</h2>
          </div>
          
          <div className="chart-container">
            <svg width="800" height="300" className="pricing-chart">
              <defs>
                <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2"/>
                </linearGradient>
                <linearGradient id="rentalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.2"/>
                </linearGradient>
              </defs>
              
              {/* Оси */}
              <line x1="50" y1="50" x2="50" y2="250" stroke="#666" strokeWidth="2"/>
              <line x1="50" y1="250" x2="750" y2="250" stroke="#666" strokeWidth="2"/>
              
              {/* ПОДПИСИ ПО ОСИ X */}
              <g className="x-labels">
                {[0, 1, 2, 3, 4, 5].map(year => {
                  const x = 50 + year * 140;
                  const realYear = startMonth.getFullYear() + handoverMonth / 12 + year;
                  
                  return (
                    <g key={year}>
                      <line x1={x} y1="250" x2={x} y2="255" stroke="#666" strokeWidth="1"/>
                      <text x={x} y="270" textAnchor="middle" fontSize="12" fill="#666">
                        {Math.floor(realYear)}
                      </text>
                    </g>
                  );
                })}
              </g>
              
              {/* ПОДПИСИ ПО ОСИ Y - ОБЩИЙ диапазон */}
              <g className="y-labels">
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  // ОБЩИЙ диапазон для обеих линий
                  const value = globalMin + ratio * globalRange;
                  const y = 250 - ratio * 200;
                  
                  return (
                    <g key={i}>
                      <line x1="45" y1={y} x2="50" y2={y} stroke="#666" strokeWidth="1"/>
                      <text x="40" y={y + 4} textAnchor="end" fontSize="10" fill="#666">
                        {fmtMoney(value, currency)}
                      </text>
                    </g>
                  );
                })}
              </g>
              
              {/* Линия Final Price */}
              <polyline 
                points={finalPricePoints} 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Линия доходности от аренды */}
              <polyline 
                points={rentalIncomePoints} 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Легенда */}
              <g className="legend">
                <rect x="600" y="20" width="15" height="15" fill="#3b82f6"/>
                <text x="620" y="32" fontSize="12" fill="#666">Final Price</text>
                <rect x="600" y="40" width="15" height="15" fill="#10b981"/>
                <text x="620" y="52" fontSize="12" fill="#666">Доходность от аренды</text>
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* 6. Сводный кэшфлоу по месяцам - ОБНОВЛЕН В СТИЛЕ ТАБЛИЦЫ ФАКТОРОВ */}
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
          
          {/* НОВЫЙ СТИЛЬ: Таблица в стиле таблицы факторов */}
          <div className="factors-table-container">
            <div className="factors-table-scroll">
              <table className="factors-table">
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
                  {project?.cashflow?.map((row, index) => (
                    <tr key={index}>
                      <td>{row.month}</td>
                      <td style={{textAlign: 'left'}}>{row.description}</td>
                      <td>{fmtMoney(row.amountDue, currency)}</td>
                      {/* НОВЫЕ КОЛОНКИ ДЛЯ АРЕНДЫ */}
                      <td>{fmtMoney(row.rentalIncome || 0, currency)}</td>
                      <td>{fmtMoney(row.netPayment || 0, currency)}</td>
                      <td>{fmtMoney(row.remainingBalance, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Редакторский режим */}
      {!isClient && (
        <div className="editor-block">
          <div className="card">
            <div className="card-header">
              <h2>Редакторский режим</h2>
            </div>
            
            <div className="editor-controls">
              <div className="control-group">
                <label>Каталог проектов:</label>
                <div className="button-group">
                  <button className="btn" onClick={exportCatalog}>Экспорт</button>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={importCatalog} 
                    style={{display: 'none'}} 
                    id="import-catalog"
                  />
                  <label htmlFor="import-catalog" className="btn">Импорт</label>
                </div>
              </div>
              
              <div className="control-group">
                <label>Параметры ценообразования:</label>
                <div className="pricing-controls">
                  <div className="control-item">
                    <label>Инфляция (% в год):</label>
                    <input 
                      type="number" 
                      value={pricingConfig.inflationRatePct} 
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev, 
                        inflationRatePct: parseFloat(e.target.value) || 0
                      }))}
                      step="0.1"
                      className="control-input"
                    />
                  </div>
                  
                  <div className="control-item">
                    <label>Lease Alpha:</label>
                    <input 
                      type="number" 
                      value={pricingConfig.leaseAlpha} 
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev, 
                        leaseAlpha: parseFloat(e.target.value) || 0
                      }))}
                      step="0.1"
                      className="control-input"
                    />
                  </div>
                  
                  <div className="control-item">
                    <label>Aging Beta:</label>
                    <input 
                      type="number" 
                      value={pricingConfig.agingBeta} 
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev, 
                        agingBeta: parseFloat(e.target.value) || 0
                      }))}
                      step="0.1"
                      className="control-input"
                    />
                  </div>
                  
                  <div className="control-item">
                    <label>Brand Peak:</label>
                    <input 
                      type="number" 
                      value={pricingConfig.brandPeak} 
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev, 
                        brandPeak: parseFloat(e.target.value) || 0
                      }))}
                      step="0.1"
                      className="control-input"
                    />
                  </div>
                  
                  <div className="control-item">
                    <label>Brand Ramp Years:</label>
                    <input 
                      type="number" 
                      value={pricingConfig.brandRampYears} 
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev, 
                        brandRampYears: parseInt(e.target.value) || 0
                      }))}
                      className="control-input"
                    />
                  </div>
                  
                  <div className="control-item">
                    <label>Brand Plateau Years:</label>
                    <input 
                      type="number" 
                      value={pricingConfig.brandPlateauYears} 
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev, 
                        brandPlateauYears: parseInt(e.target.value) || 0
                      }))}
                      className="control-input"
                    />
                  </div>
                  
                  <div className="control-item">
                    <label>Brand Decay Years:</label>
                    <input 
                      type="number" 
                      value={pricingConfig.brandDecayYears} 
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev, 
                        brandDecayYears: parseInt(e.target.value) || 0
                      }))}
                      className="control-input"
                    />
                  </div>
                  
                  <div className="control-item">
                    <label>Brand Tail:</label>
                    <input 
                      type="number" 
                      value={pricingConfig.brandTail} 
                      onChange={(e) => setPricingConfig(prev => ({
                        ...prev, 
                        brandTail: parseFloat(e.target.value) || 0
                      }))}
                      step="0.1"
                      className="control-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

// Функция форматирования денег
function fmtMoney(amount, currency = 'USD') {
  if (typeof amount !== 'number' || isNaN(amount)) return '0';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount);
}

// Функция форматирования месяцев
function fmtMo(month) {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  return months[month] || month;
}

// Функция получения количества дней в месяце
function getDaysInMonth(month) {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysInMonth[month] || 30;
}

// ===== ЗАПУСК ПРИЛОЖЕНИЯ =====

// Создание корневого элемента
const root = createRoot(document.getElementById('root'));
root.render(<App />);
