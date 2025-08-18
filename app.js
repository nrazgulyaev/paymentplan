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
  const [idrPerUsd, setIdrPerUsd] = useState(16300);
  const [eurPerUsd, setEurPerUsd] = useState(0.88);
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
    projectId: 'eternal-villas',
    projectName: 'Eternal Villas by Arconique',
    villas: [
      {
        villaId: 'eternal-premium-3br', 
        name: 'Premium 3 bedroom', 
        area: 218, 
        ppsm: 2197, // $479000 / 218 м²
        baseUSD: 479000,
        monthlyPriceGrowthPct: 1.5,
        leaseholdEndDate: new Date(2055, 0, 1), // 01.01.2055
        dailyRateUSD: 550,
        rentalPriceIndexPct: 5
      },
      {
        villaId: 'eternal-master-2br', 
        name: 'Master 2 bedroom', 
        area: 141.7, 
        ppsm: 2451, // $347307 / 141.7 м²
        baseUSD: 347307,
        monthlyPriceGrowthPct: 1.5,
        leaseholdEndDate: new Date(2052, 0, 1), // 01.01.2052
        dailyRateUSD: 400,
        rentalPriceIndexPct: 5
      }
    ]
  },
  {
    projectId: 'enso-villas',
    projectName: 'Enso Villas by Arconique',
    villas: [
      {
        villaId: 'enso-l-type-2br', 
        name: 'L type 2 bedroom', 
        area: 104.1, 
        ppsm: 2610, // $271701 / 104.1 м²
        baseUSD: 271701,
        monthlyPriceGrowthPct: 1.5,
        leaseholdEndDate: new Date(2054, 11, 1), // 01.12.2054
        dailyRateUSD: 220,
        rentalPriceIndexPct: 5
      },
      {
        villaId: 'enso-v-type-2br', 
        name: 'V type 2 bedroom', 
        area: 114.1, 
        ppsm: 2548, // $290840 / 114.1 м²
        baseUSD: 290840,
        monthlyPriceGrowthPct: 1.5,
        leaseholdEndDate: new Date(2054, 11, 1), // 01.12.2054
        dailyRateUSD: 220,
        rentalPriceIndexPct: 5
      },
      {
        villaId: 'enso-q-type-2br', 
        name: 'Q type 2 bedroom', 
        area: 95.7, 
        ppsm: 2549, // Указано в данных
        baseUSD: 243939, // 95.7 м² × $2549
        monthlyPriceGrowthPct: 1.5,
        leaseholdEndDate: new Date(2054, 11, 1), // 01.12.2054
        dailyRateUSD: 220,
        rentalPriceIndexPct: 5
      },
      {
        villaId: 'enso-r-type-3br', 
        name: 'R type 3 bedroom', 
        area: 134.2, 
        ppsm: 2554, // $342720 / 134.2 м²
        baseUSD: 342720,
        monthlyPriceGrowthPct: 1.5,
        leaseholdEndDate: new Date(2054, 11, 1), // 01.12.2054
        dailyRateUSD: 270,
        rentalPriceIndexPct: 5
      }
    ]
  },
  {
    projectId: 'ahau-gardens',
    projectName: 'Ahau Gardens by Arconique',
    villas: [
      {
        villaId: 'ahau-type-a-2br', 
        name: 'Type A 2 bedroom', 
        area: 142.7, 
        ppsm: 2200, // $313940 / 142.7 м²
        baseUSD: 313940,
        monthlyPriceGrowthPct: 1.5,
        leaseholdEndDate: new Date(2055, 0, 1), // 01.01.2055
        dailyRateUSD: 220,
        rentalPriceIndexPct: 5
      },
      {
        villaId: 'ahau-type-b-2br', 
        name: 'Type B 2 bedroom', 
        area: 192, 
        ppsm: 2250, // Указано в данных
        baseUSD: 432000, // 192 м² × $2250
        monthlyPriceGrowthPct: 1.5,
        leaseholdEndDate: new Date(2055, 0, 1), // 01.01.2055
        dailyRateUSD: 280,
        rentalPriceIndexPct: 5
      },
      {
        villaId: 'ahau-type-bq-2br', 
        name: 'Type BQ 2 bedroom', 
        area: 201, 
        ppsm: 2041, // $410290 / 201 м²
        baseUSD: 410290,
        monthlyPriceGrowthPct: 1.5,
        leaseholdEndDate: new Date(2055, 0, 1), // 01.01.2055
        dailyRateUSD: 280,
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
  
  const [lines, setLines] = useState([]);

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
      title: 'Arconique / Калькулятор рассрочки и финмодель',
      lang: 'Язык интерфейса',
      currencyDisplay: 'Валюта отображения',
      idrRate: 'IDR за 1 USD',
      eurRate: 'EUR за 1 USD',
      handoverMonth: 'Срок строительства',
      globalTerm: 'Глобальный срок post‑handover (6–24 мес)',
      globalRate: 'Глобальная ставка, %/мес',
      clientTerm: 'Post‑handover рассрочка (мес)',
      startMonth: 'Заключение договора',
      stagesTitle: 'Рассрочка до получения ключей (установите комфортный план оплаты)',
      stage: 'Этап',
      percent: '%',
      month: 'Месяц',
      addStage: 'Добавить этап',
      delete: 'Удалить',
      villasTitle: 'Объект недвижимости',
      project: 'Проект',
      villa: 'Вилла',
      qty: 'Кол-во',
      area: 'м²',
      ppsm: '$ / м²',
      price: 'Текущая стоимость (USD)',
      discount: 'Скидка, %',
      prePct: 'До ключей, %',
      months: 'Срок рассрочки, мес',
      rate: 'Ставка, %/мес',
      lineTotal: 'Итоговая стоимость (с учетом выбранного плана рассрочки)',
      addFromCatalog: 'Добавить из каталога',
      cashflowTitle: 'Полный график платежей',
      exportCSV: 'Экспорт CSV',
      exportXLSX: 'Экспорт Excel',
      exportPDF: 'Сохранить в PDF',
      lines: 'Выбрано вилл',
      keys: 'Ключи через',
      client: 'Клиент',
      editor: 'Редактор',
      catalogTitle: 'Каталог проектов (редактор)',
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
      finalPrice: 'Итоговая стоимость:',
      interest: 'Проценты:',
      monthlyCashflow: 'Денежный поток по месяцам',
      month: 'Месяц',
      description: 'Описание',
      amountDue: 'Платеж',
      remainingBalance: 'Остаток по договору',
      after: 'Оплата после ключей',
      firstPayment: 'Первый платёж',
      // ОБНОВЛЕНО: Новые переводы для лизхолда и индексации
      dailyRate: 'Стоимость проживания в сутки (USD)',
      occupancyRate: 'Средняя заполняемость за месяц (%)',
      rentalIncome: 'Прогнозируемый доход от аренды',
      netPayment: 'Чистый платеж/доход в месяц',
      leaseholdEndDate: 'Дата окончания лизхолда',
      rentalPriceIndex: 'Рост цены аренды в год (%)',
      cleanLeaseholdTerm: 'Чистый срок лизхолда (с момента получения ключей)',
      years: 'лет',
      months: 'месяцев',
      rentalIncomeChart: 'График общей доходности от сдачи в аренду',
      totalIncome: 'Общий доход за год',
      cumulativeIncome: 'Накопительный доход',
      actions: 'Действия',
      // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
      monthlyPriceGrowth: 'Месячный рост цены до ключей (%)',
      // НОВЫЕ ПЕРЕВОДЫ ДЛЯ ПОЛНОГО МНОГОЯЗЫЧИЯ
      paymentBeforeKeys: 'Оплата до ключей',
      paymentAfterKeys: 'Оплата после ключей',
      finalCost: 'Итоговая стоимость',
      roiBeforeKeys: 'ROI при продаже перед ключами',
      netIncome: 'Чистый доход',
      exitPointMaxIrr: 'Точка выхода с макс. IRR',
      irrValue: 'IRR',
      cumulativeRoi: 'Итоговый ROI (накопительный)',
      financialModelTitle: 'Финмодель доходности инвестиций',
      inflation: 'Инфляция',
      aging: 'Старение',
      leaseDecay: 'Lease Decay',
      brandFactor: 'Brand Factor',
      peak: 'Пик',
      perYear: '/год',
      villaPriceDynamics: 'Динамика стоимости виллы и арендного дохода',
      factorInfluence: 'Влияние факторов на цену и доходность от аренды',
      marketValue: 'Рыночная стоимость',
      rentalIncome: 'Арендный доход',
      calculationIndicators: 'Расчет показателей (годовой)',
      year: 'Год',
      leaseFactor: 'Lease Factor',
      ageFactor: 'Age Factor',
      inflationCoefficient: 'Коэффициент инфляции',
      marketCost: 'Рыночная стоимость',
      totalCapitalization: 'Совокупная капитализация',
      roiPerYear: 'ROI за год (%)',
      finalRoi: 'Итоговый ROI (%)',
      calculationIndicatorsPeriod: 'Расчет показателей (на период рассрочки)',
      period: 'Период',
      installmentPayment: 'Платеж по рассрочке',
      roiPerMonth: 'ROI за месяц (%)',
      finalRoiCumulative: 'Итоговый ROI (накопительный) (%)',
      installmentTermAfterKeys: 'Срок рассрочки после получения ключей:',
      monthsShort: 'мес.',
      yearsShort: 'лет'
    },
    en: {
      title: 'Arconique / Installments Calculator & Financial Model',
      lang: 'Language',
      currencyDisplay: 'Display currency',
      idrRate: 'IDR per 1 USD',
      eurRate: 'EUR per 1 USD',
      handoverMonth: 'Construction period',
      globalTerm: 'Global post‑handover term (6–24 mo)',
      globalRate: 'Global rate, %/month',
      clientTerm: 'Post‑handover installments (months)',
      startMonth: 'Contract signing',
      stagesTitle: 'Pre-handover installments (set comfortable payment plan)',
      stage: 'Stage',
      percent: '%',
      month: 'Month',
      addStage: 'Add stage',
      delete: 'Delete',
      villasTitle: 'Real estate object',
      project: 'Project',
      villa: 'Villa',
      qty: 'Qty',
      area: 'sqm',
      ppsm: '$ / sqm',
      price: 'Current value (USD)',
      discount: 'Discount, %',
      prePct: 'Pre‑handover, %',
      months: 'Installment term, mo',
      rate: 'Rate, %/mo',
      lineTotal: 'Final value (considering selected installment plan)',
      addFromCatalog: 'Add from catalog',
      cashflowTitle: 'Complete payment schedule',
      exportCSV: 'Export CSV',
      exportXLSX: 'Export Excel',
      exportPDF: 'Save to PDF',
      lines: 'Selected villas',
      keys: 'Keys in',
      client: 'Client',
      editor: 'Editor',
      catalogTitle: 'Projects Catalog (editor)',
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
      finalPrice: 'Final value:',
      interest: 'Interest:',
      monthlyCashflow: 'Monthly cashflow',
      month: 'Month',
      description: 'Description',
      amountDue: 'Payment',
      remainingBalance: 'Contract balance',
      after: 'Payment after keys',
      firstPayment: 'First payment',
      // ОБНОВЛЕНО: Новые переводы для лизхолда и индексации
      dailyRate: 'Daily accommodation rate (USD)',
      occupancyRate: 'Average monthly occupancy (%)',
      rentalIncome: 'Projected rental income',
      netPayment: 'Net payment/income per month',
      leaseholdEndDate: 'Leasehold end date',
      rentalPriceIndex: 'Rental price growth per year (%)',
      cleanLeaseholdTerm: 'Clean leasehold term (from key handover)',
      years: 'years',
      months: 'months',
      rentalIncomeChart: 'Chart of total rental income',
      totalIncome: 'Total income per year',
      cumulativeIncome: 'Cumulative income',
      actions: 'Actions',
      // НОВОЕ ПОЛЕ: Месячный рост цены до получения ключей
      monthlyPriceGrowth: 'Monthly price growth until keys (%)',
      // НОВЫЕ ПЕРЕВОДЫ ДЛЯ ПОЛНОГО МНОГОЯЗЫЧИЯ
      paymentBeforeKeys: 'Payment before keys',
      paymentAfterKeys: 'Payment after keys',
      finalCost: 'Final cost',
      roiBeforeKeys: 'ROI when selling before keys',
      netIncome: 'Net income',
      exitPointMaxIrr: 'Exit point with max IRR',
      irrValue: 'IRR',
      cumulativeRoi: 'Cumulative ROI',
      financialModelTitle: 'Financial model of investment returns',
      inflation: 'Inflation',
      aging: 'Aging',
      leaseDecay: 'Lease Decay',
      brandFactor: 'Brand Factor',
      peak: 'Peak',
      perYear: '/year',
      villaPriceDynamics: 'Villa price and rental income dynamics',
      factorInfluence: 'Influence of factors on price and rental returns',
      marketValue: 'Market value',
      rentalIncome: 'Rental income',
      calculationIndicators: 'Calculation of indicators (annual)',
      year: 'Year',
      leaseFactor: 'Lease Factor',
      ageFactor: 'Age Factor',
      inflationCoefficient: 'Inflation coefficient',
      marketCost: 'Market cost',
      totalCapitalization: 'Total capitalization',
      roiPerYear: 'ROI per year (%)',
      finalRoi: 'Final ROI (%)',
      calculationIndicatorsPeriod: 'Calculation of indicators (for installment period)',
      period: 'Period',
      installmentPayment: 'Installment payment',
      roiPerMonth: 'ROI per month (%)',
      finalRoiCumulative: 'Final ROI (cumulative) (%)',
      installmentTermAfterKeys: 'Installment term after receiving keys:',
      monthsShort: 'mo.',
      yearsShort: 'years'
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
  // Сумма этапов (как было)
const stagesSumPct = stages.reduce((s, x) => s + (+x.pct || 0), 0);

// Целевой процент до ключей из выбранных вилл
const targetPrePct = lines.length > 0 ? 
  lines.reduce((sum, line) => sum + (line.prePct || 0), 0) / lines.length : 
  0;

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

  // НОВАЯ ФУНКЦИЯ: Расчет IRR (внутренняя норма доходности)
  const calculateIRR = (cashFlows, maxIterations = 100, tolerance = 0.0001) => {
    try {
      if (cashFlows.length < 2) return 0;
      
      let guess = 0.1; // Начальное предположение 10%
      
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        let npv = 0;
        let derivative = 0;
        
        for (let i = 0; i < cashFlows.length; i++) {
          const discountFactor = Math.pow(1 + guess, i);
          npv += cashFlows[i] / discountFactor;
          
          if (i > 0) {
            derivative -= i * cashFlows[i] / (discountFactor * (1 + guess));
          }
        }
        
        if (Math.abs(npv) < tolerance) {
          return guess * 100; // Возвращаем в процентах
        }
        
        if (Math.abs(derivative) < tolerance) {
          break; // Избегаем деления на ноль
        }
        
        guess = guess - npv / derivative;
        
        // Ограничиваем разумными пределами
        if (guess < -0.99 || guess > 10) {
          break;
        }
      }
      
      return guess * 100; // Возвращаем в процентах
    } catch (error) {
      console.error('Ошибка расчета IRR:', error);
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

  // ИСПРАВЛЕНО: Используем startMonth вместо new Date()
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
          ageFactor: ageFactor(year, totalYears, pricingConfig.agingBeta),
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

// ИСПРАВЛЕНИЕ: Правильный расчет общего срока лизхолда в годах
const totalLeaseholdYears = Math.ceil((villa.leaseholdEndDate - startMonth) / (365 * 24 * 60 * 60 * 1000));
    
    // Рыночная цена на ключах
    const marketPriceAtHandover = calculateMarketPriceAtHandover(villa, selectedLine);
    
    // Получаем данные по линии для расчета платежей
    const lineData = linesData.find(ld => ld.line.id === selectedLine.id);
    if (!lineData) return [];
    
    const monthlyData = [];
    
    for (let month = 0; month <= totalMonths; month++) {
      let leaseFactorValue = 1;
      let ageFactorValue = 1;
      let brandFactorValue = 1;
      let inflationFactor = 1;
      let finalPrice = 0;
      let rentalIncome = 0;
      let paymentAmount = 0;
      
      if (month <= handoverMonth) {
        // ДО получения ключей: только месячный рост цены
        const monthlyGrowthRate = (selectedLine.monthlyPriceGrowthPct || 2) / 100;
        finalPrice = villa.baseUSD * Math.pow(1 + monthlyGrowthRate, month);
        
        // Платежи по этапам рассрочки
        const stagePayment = lineData.preSchedule.find(s => s.month === month);
        if (stagePayment) {
          paymentAmount = stagePayment.amountUSD;
        }
      } else {
        // ПОСЛЕ получения ключей: все факторы работают
        const yearOffset = (month - handoverMonth) / 12;
        
        // Месячные коэффициенты (делим годовые на 12)
       leaseFactorValue = leaseFactor(yearOffset, totalLeaseholdYears, pricingConfig.leaseAlpha);
        ageFactorValue = ageFactor(yearOffset, totalLeaseholdYears, pricingConfig.agingBeta);
        brandFactorValue = brandFactor(yearOffset, pricingConfig);
        inflationFactor = Math.pow(1 + pricingConfig.inflationRatePct / 100, yearOffset);
        
        // Final Price с учетом всех факторов
        finalPrice = marketPriceAtHandover * inflationFactor * leaseFactorValue * ageFactorValue * brandFactorValue;
        
        // Доходность от аренды (начинается через 3 месяца после ключей)
        if (month >= handoverMonth + 3) {
          const indexedPrice = getIndexedRentalPrice(selectedLine.dailyRateUSD, selectedLine.rentalPriceIndexPct, yearOffset);
          const daysInMonth = getDaysInMonth(month);
          rentalIncome = indexedPrice * 0.55 * (selectedLine.occupancyPct / 100) * daysInMonth * selectedLine.qty;
        }
        
        // Платежи по рассрочке после ключей
        if (month <= handoverMonth + lineData.vMonths) {
          const postMonth = month - handoverMonth;
          const postPayment = lineData.postRows.find(r => r.month === month);
          if (postPayment) {
            paymentAmount = postPayment.paymentUSD;
          }
        }
        // Если рассрочка закончилась, но месяц еще в пределах года - платеж = 0
        else if (month <= totalMonths) {
          paymentAmount = 0;
        }
      }
      
      // Накопительный доход от аренды
      let cumulativeRentalIncome = 0;
      if (month >= handoverMonth + 3) {
        for (let m = handoverMonth + 3; m <= month; m++) {
          const mYearOffset = (m - handoverMonth) / 12;
          const mIndexedPrice = getIndexedRentalPrice(selectedLine.dailyRateUSD, selectedLine.rentalPriceIndexPct, mYearOffset);
          const mDaysInMonth = getDaysInMonth(m);
          const mRentalIncome = mIndexedPrice * 0.55 * (selectedLine.occupancyPct / 100) * mDaysInMonth * selectedLine.qty;
          cumulativeRentalIncome += mRentalIncome;
        }
      }
      
      // Общий капитал инвестора
const totalInvestorCapital = finalPrice + cumulativeRentalIncome;

// НОВЫЕ РАСЧЕТЫ для каждой строки:

// 1. Сумма всех Сумм к оплате от начала до данного месяца
let totalPaymentsToDate = 0;
for (let m = 0; m <= month; m++) {
  const monthData = monthlyData[m];
  if (monthData && monthData.paymentAmount > 0) {
    totalPaymentsToDate += monthData.paymentAmount;
  }
}

// 2. ROI за месяц (переводим в годовой показатель)
let monthlyRoi = 0;
if (month > 0 && totalPaymentsToDate > 0) {
  const previousMonthData = monthlyData[month - 1];
  if (previousMonthData) {
    const priceChange = finalPrice - previousMonthData.finalPrice;
    const monthlyRoiRaw = ((rentalIncome + priceChange) / totalPaymentsToDate) * 100;
    // Переводим в годовой показатель: месячный ROI × 12
    monthlyRoi = monthlyRoiRaw * 12;
  }
}

// 3. Итоговый ROI (переводим в годовой показатель)
let cumulativeRoi = 0;
if (totalPaymentsToDate > 0) {
  const cumulativeRoiRaw = ((finalPrice - project.totals.finalUSD) / totalPaymentsToDate) * 100;
  const monthsElapsed = month + 1;
  cumulativeRoi = cumulativeRoiRaw * (12 / monthsElapsed);
}

// 4. IRR (переводим в годовой показатель)
let irr = 0;
if (month > 0) {
  const cashFlows = [];
  cashFlows.push(-totalPaymentsToDate); // CF₀
  
  for (let m = 0; m <= month; m++) {
    const monthData = monthlyData[m];
    if (monthData) {
      if (m === month) {
        // Последний месяц: аренда + Final Price
        cashFlows.push(monthData.rentalIncome + monthData.finalPrice);
            } else {
        // Обычные месяцы: только аренда
        cashFlows.push(monthData.rentalIncome);
      }
    }
  }
  
  // Рассчитываем IRR
  return calculateIRR(cashFlows);
};

// Функция расчета IRR (упрощенная версия)
const calculateIRR = (cashFlows) => {
  if (cashFlows.length < 2) return 0;
  
  // Простая аппроксимация IRR
  let rate = 0.1; // Начинаем с 10%
  let npv = 0;
  
  for (let i = 0; i < cashFlows.length; i++) {
    npv += cashFlows[i] / Math.pow(1 + rate, i);
  }
  
  // Если NPV положительный, увеличиваем ставку
  if (npv > 0) {
    rate = 0.2; // 20%
  } else {
    rate = 0.05; // 5%
  }
  
  return rate * 100; // Возвращаем в процентах
};

// Функция форматирования валюты
const formatCurrency = (amount, curr = currency) => {
  if (curr === 'USD') {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } else if (curr === 'EUR') {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } else if (curr === 'IDR') {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  return amount.toFixed(2);
};

// Функция форматирования процентов
const formatPercent = (value) => {
  return `${value.toFixed(1)}%`;
};

// Функция получения названия месяца
const getMonthName = (monthIndex) => {
  const months = lang === 'ru' ? 
    ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'] :
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

// Функция получения названия года
const getYearName = (year) => {
  return lang === 'ru' ? year : year;
};

// Функция переключения языка
const toggleLang = () => {
  setLang(prev => prev === 'ru' ? 'en' : 'ru');
};

// Функция переключения режима клиент/редактор
const toggleMode = () => {
  setIsClient(prev => !prev);
};

// Функция добавления строки в каталог
const addLine = () => {
  const newLine = {
    id: Date.now(),
    projectId: '',
    villaId: '',
    qty: 1,
    prePct: 70,
    ownTerms: false,
    months: null,
    monthlyRatePct: null,
    firstPostUSD: 0,
    discountPct: 0,
    monthlyPriceGrowthPct: 2,
    dailyRateUSD: 150,
    rentalPriceIndexPct: 5
  };
  setLines(prev => [...prev, newLine]);
};

// Функция удаления строки из каталога
const delLine = (id) => {
  setLines(prev => prev.filter(l => l.id !== id));
};

// Функция обновления строки в каталоге
const updLine = (id, patch) => {
  setLines(prev => prev.map(l => l.id === id ? {...l, ...patch} : l));
};

// Функция добавления этапа рассрочки
const addStage = () => {
  const newStage = {
    id: Date.now(),
    label: '',
    pct: 0.00,
    month: stages.length
  };
  setStages(prev => [...prev, newStage]);
};

// Функция удаления этапа рассрочки
const delStage = (id) => {
  setStages(prev => prev.filter(s => s.id !== id));
};

// ИСПРАВЛЕНО: Функция обновления этапа с валидацией
const updStage = (id, patch) => {
  // Если обновляется процент, проверяем валидность
  if (patch.pct !== undefined) {
    const pct = parseFloat(patch.pct);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return; // Не обновляем, если значение невалидно
    }
    patch.pct = pct; // Сохраняем как число
  }
  
  setStages(prev => prev.map(s => s.id === id ? {...s, ...patch} : s));
};

// Функция получения проекта по ID
const getProject = (projectId) => {
  return catalog.find(p => p.projectId === projectId);
};

// Функция получения виллы по ID
const getVilla = (projectId, villaId) => {
  const project = getProject(projectId);
  if (!project) return null;
  return project.villas.find(v => v.villaId === villaId);
};

// Функция получения всех вилл из проекта
const getProjectVillas = (projectId) => {
  const project = getProject(projectId);
  return project ? project.villas : [];
};

// Функция расчета общей стоимости
const totalCost = useMemo(() => {
  return lines.reduce((sum, line) => {
    const villa = getVilla(line.projectId, line.villaId);
    if (!villa) return sum;
    
    const basePrice = villa.baseUSD * (1 - line.discountPct / 100);
    return sum + (basePrice * line.qty);
  }, 0);
}, [lines, catalog]);

// Функция расчета платежа до ключей
const preKeysPayment = useMemo(() => {
  return lines.reduce((sum, line) => {
    const villa = getVilla(line.projectId, line.villaId);
    if (!villa) return sum;
    
    const basePrice = villa.baseUSD * (1 - line.discountPct / 100);
    const preAmount = basePrice * (line.prePct / 100);
    return sum + (preAmount * line.qty);
  }, 0);
}, [lines, catalog]);

// Функция расчета платежа после ключей
const postKeysPayment = useMemo(() => {
  return totalCost - preKeysPayment;
}, [totalCost, preKeysPayment]);

// Функция расчета ежемесячного платежа
const monthlyPayment = useMemo(() => {
  if (postKeysPayment <= 0) return 0;
  
  const totalMonths = lines.reduce((sum, line) => {
    if (line.ownTerms) {
      return sum + (line.months || 0);
    }
    return sum + months;
  }, 0);
  
  if (totalMonths === 0) return 0;
  
  return postKeysPayment / totalMonths;
}, [postKeysPayment, lines, months]);

// Функция расчета общей переплаты
const totalOverpayment = useMemo(() => {
  let overpayment = 0;
  
  lines.forEach(line => {
    if (line.ownTerms && line.months && line.monthlyRatePct) {
      const villa = getVilla(line.projectId, line.villaId);
      if (!villa) return;
      
      const basePrice = villa.baseUSD * (1 - line.discountPct / 100);
      const postAmount = basePrice * (1 - line.prePct / 100);
      const monthlyRate = line.monthlyRatePct / 100;
      
      // Расчет переплаты по формуле сложных процентов
      const totalWithInterest = postAmount * Math.pow(1 + monthlyRate, line.months);
      overpayment += (totalWithInterest - postAmount) * line.qty;
    }
  });
  
  return overpayment;
}, [lines, catalog, months]);

// Функция расчета итоговой стоимости
const finalCost = useMemo(() => {
  return totalCost + totalOverpayment;
}, [totalCost, totalOverpayment]);

// ИСПРАВЛЕНО: Сумма этапов и целевой процент
const stagesSumPct = useMemo(() => {
  return stages.reduce((s, x) => s + (+x.pct || 0), 0);
}, [stages]);

// Целевой процент до ключей из выбранных вилл
const targetPrePct = useMemo(() => {
  return lines.length > 0 ? 
    lines.reduce((sum, line) => sum + (line.prePct || 0), 0) / lines.length : 
    0;
}, [lines]);

// Функция расчета месячных данных для финансовой модели
const monthlyData = useMemo(() => {
  const data = [];
  const totalYears = 30; // 30 лет для долгосрочного планирования
  
  for (let year = 0; year < totalYears; year++) {
    for (let month = 0; month < 12; month++) {
      const monthIndex = year * 12 + month;
      const currentDate = new Date(startMonth);
      currentDate.setMonth(currentDate.getMonth() + monthIndex);
      
      // Расчет факторов влияния на цену
      const leaseFactor = calculateLeaseFactor(currentDate);
      const ageFactor = calculateAgeFactor(year);
      const brandFactor = calculateBrandFactor(year);
      const inflationFactor = Math.pow(1 + pricingConfig.inflationRatePct / 100, year);
      
      // Расчет рыночной стоимости
      const marketValue = totalCost * leaseFactor * ageFactor * brandFactor * inflationFactor;
      
      // Расчет арендного дохода
      const rentalIncome = calculateRentalIncome(monthIndex, marketValue);
      
      data.push({
        month: monthIndex,
        year: year,
        date: currentDate,
        leaseFactor,
        ageFactor,
        brandFactor,
        inflationFactor,
        marketValue,
        rentalIncome,
        finalPrice: marketValue
      });
    }
  }
  
  return data;
}, [totalCost, startMonth, pricingConfig]);

// Функция расчета фактора лизинга
const calculateLeaseFactor = (date) => {
  const yearsToLeaseEnd = (new Date(2055, 0, 1) - date) / (1000 * 60 * 60 * 24 * 365);
  if (yearsToLeaseEnd <= 0) return 0.1; // Минимальная стоимость после окончания лизинга
  
  const alpha = pricingConfig.leaseAlpha;
  return Math.pow(yearsToLeaseEnd / 30, alpha); // 30 лет - максимальный срок лизинга
};

// Функция расчета фактора старения
const calculateAgeFactor = (year) => {
  const beta = pricingConfig.agingBeta;
  return Math.exp(-beta * year);
};

// Функция расчета фактора бренда
const calculateBrandFactor = (year) => {
  const { brandPeak, brandRampYears, brandPlateauYears, brandDecayYears, brandTail } = pricingConfig;
  
  if (year < brandRampYears) {
    // Фаза роста
    return 1 + (brandPeak - 1) * (year / brandRampYears);
  } else if (year < brandRampYears + brandPlateauYears) {
    // Фаза плато
    return brandPeak;
  } else if (year < brandRampYears + brandPlateauYears + brandDecayYears) {
    // Фаза спада
    const decayProgress = (year - brandRampYears - brandPlateauYears) / brandDecayYears;
    return brandPeak - (brandPeak - brandTail) * decayProgress;
  } else {
    // Финальная фаза
    return brandTail;
  }
};

// Функция расчета арендного дохода
const calculateRentalIncome = (monthIndex, marketValue) => {
  if (monthIndex < handoverMonth) return 0; // До получения ключей аренды нет
  
  // Базовый арендный доход (1% от рыночной стоимости в месяц)
  const baseRental = marketValue * 0.01;
  
  // Индексация арендной платы
  const rentalIndex = Math.pow(1 + 0.05 / 12, monthIndex - handoverMonth); // 5% годовых
  
  return baseRental * rentalIndex;
};

// Функция расчета годовых показателей
const yearlyData = useMemo(() => {
  const data = [];
  const totalYears = 30;
  
  for (let year = 0; year < totalYears; year++) {
    const yearStartMonth = year * 12;
    const yearEndMonth = yearStartMonth + 11;
    
    let yearRentalIncome = 0;
    let yearMarketValue = 0;
    
    for (let month = yearStartMonth; month <= yearEndMonth; month++) {
      if (monthlyData[month]) {
        yearRentalIncome += monthlyData[month].rentalIncome;
        yearMarketValue = monthlyData[month].marketValue;
      }
    }
    
    const yearData = monthlyData[yearStartMonth];
    if (yearData) {
      data.push({
        year,
        leaseFactor: yearData.leaseFactor,
        ageFactor: yearData.ageFactor,
        brandFactor: yearData.brandFactor,
        inflationFactor: yearData.inflationFactor,
        marketValue: yearMarketValue,
        rentalIncome: yearRentalIncome,
        totalCapitalization: yearMarketValue + yearRentalIncome,
        yearlyRoi: year > 0 ? ((yearMarketValue - totalCost) / totalCost) * 100 : 0,
        cumulativeRoi: ((yearMarketValue - totalCost) / totalCost) * 100,
        irr: calculateIRRForYear(year)
      });
    }
  }
  
  return data;
}, [monthlyData, totalCost, handoverMonth]);

// Функция расчета IRR для конкретного года
const calculateIRRForYear = (year) => {
  const cashFlows = [-totalCost]; // Начальная инвестиция
  
  // Добавляем арендные доходы и финальную стоимость
  for (let m = 0; m <= year * 12; m++) {
    const monthData = monthlyData[m];
    if (monthData) {
      if (m === year * 12) {
        // Последний месяц года: аренда + рыночная стоимость
        cashFlows.push(monthData.rentalIncome + monthData.marketValue);
      } else {
        // Обычные месяцы: только аренда
        cashFlows.push(monthData.rentalIncome);
      }
    }
  }
  
  return calculateIRR(cashFlows);
};

// Функция расчета месячных показателей за период рассрочки
const installmentPeriodData = useMemo(() => {
  const data = [];
  const maxMonths = Math.max(...lines.map(l => l.ownTerms ? (l.months || 0) : months));
  
  for (let month = 0; month < maxMonths; month++) {
    const monthData = monthlyData[month];
    if (monthData) {
      data.push({
        month: month + 1,
        leaseFactor: monthData.leaseFactor,
        ageFactor: monthData.ageFactor,
        brandFactor: monthData.brandFactor,
        inflationFactor: monthData.inflationFactor,
        marketValue: monthData.marketValue,
        rentalIncome: monthData.rentalIncome,
        totalCapitalization: monthData.marketValue + monthData.rentalIncome,
        installmentPayment: monthlyPayment,
        monthlyRoi: month > 0 ? ((monthData.marketValue - totalCost) / totalCost) * 100 : 0,
        cumulativeRoi: ((monthData.marketValue - totalCost) / totalCost) * 100,
        irr: calculateIRRForMonth(month)
      });
    }
  }
  
  return data;
}, [monthlyData, lines, months, monthlyPayment, totalCost]);

// Функция расчета IRR для конкретного месяца
const calculateIRRForMonth = (month) => {
  const cashFlows = [-totalCost]; // Начальная инвестиция
  
  // Добавляем арендные доходы и финальную стоимость
  for (let m = 0; m <= month; m++) {
    const monthData = monthlyData[m];
    if (monthData) {
      if (m === month) {
        // Последний месяц: аренда + рыночная стоимость
        cashFlows.push(monthData.rentalIncome + monthData.marketValue);
      } else {
        // Обычные месяцы: только аренда
        cashFlows.push(monthData.rentalIncome);
      }
    }
  }
  
  return calculateIRR(cashFlows);
};

// Функция поиска точки выхода с максимальным IRR
const exitPointMaxIRR = useMemo(() => {
  let maxIRR = 0;
  let exitYear = 0;
  
  yearlyData.forEach((yearData, index) => {
    if (yearData.irr > maxIRR) {
      maxIRR = yearData.irr;
      exitYear = 2026 + index;
    }
  });
  
  return { year: exitYear, irr: maxIRR };
}, [yearlyData]);

// Функция расчета чистого дохода
const netIncome = useMemo(() => {
  if (yearlyData.length === 0) return 0;
  
  const lastYear = yearlyData[yearlyData.length - 1];
  return lastYear.marketValue - totalCost;
}, [yearlyData, totalCost]);

// Функция расчета ROI при продаже перед ключами
const roiBeforeKeys = useMemo(() => {
  if (monthlyData.length === 0) return 0;
  
  const preKeysData = monthlyData[handoverMonth - 1];
  if (!preKeysData) return 0;
  
  return ((preKeysData.marketValue - totalCost) / totalCost) * 100;
}, [monthlyData, handoverMonth, totalCost]);

// Рендер компонента
return (
  <div className="app">
    {/* Заголовок */}
    <header className="header">
      <div className="header-content">
        <h1>Arconique</h1>
        <div className="header-controls">
          <button onClick={toggleLang} className="btn lang-btn">
            {lang === 'ru' ? 'EN' : 'RU'}
          </button>
          <button onClick={toggleMode} className="btn mode-btn">
            {isClient ? (lang === 'ru' ? 'Редактор' : 'Editor') : (lang === 'ru' ? 'Клиент' : 'Client')}
          </button>
        </div>
      </div>
    </header>

    {/* Основной контент */}
    <main className="main">
      {/* Блок выбора валюты и курсов */}
      <section className="currency-section">
        <h2>{lang === 'ru' ? 'Валюты и курсы' : 'Currencies and rates'}</h2>
        <div className="currency-grid">
          <div className="currency-item">
            <label>{lang === 'ru' ? 'Валюта отображения:' : 'Display currency:'}</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="IDR">IDR</option>
            </select>
          </div>
          <div className="currency-item">
            <label>IDR/USD:</label>
            <input 
              type="number" 
              value={idrPerUsd} 
              onChange={e => setIdrPerUsd(parseFloat(e.target.value))}
              step="100"
            />
          </div>
          <div className="currency-item">
            <label>EUR/USD:</label>
            <input 
              type="number" 
              value={eurPerUsd} 
              onChange={e => setEurPerUsd(parseFloat(e.target.value))}
              step="0.01"
            />
          </div>
        </div>
      </section>

      {/* Блок объекта недвижимости */}
      <section className="property-section">
        <h2>{lang === 'ru' ? 'Объект недвижимости' : 'Property'}</h2>
        
        {/* Таблица каталога */}
        <div className="catalog-table">
          <div className="table-header">
            <h3>{lang === 'ru' ? 'Каталог проектов' : 'Project catalog'}</h3>
            <button onClick={addLine} className="btn primary">
              {lang === 'ru' ? 'Добавить' : 'Add'}
            </button>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>{lang === 'ru' ? 'Проект' : 'Project'}</th>
                <th>{lang === 'ru' ? 'Вилла' : 'Villa'}</th>
                <th>{lang === 'ru' ? 'Кол-во' : 'Qty'}</th>
                <th>{lang === 'ru' ? 'До ключей, %' : 'Before keys, %'}</th>
                <th>{lang === 'ru' ? 'Собств. условия' : 'Own terms'}</th>
                <th>{lang === 'ru' ? 'Месяцев' : 'Months'}</th>
                <th>{lang === 'ru' ? 'Ставка, %/мес' : 'Rate, %/month'}</th>
                    <th>{lang === 'ru' ? 'Первый платеж' : 'First payment'}</th>
                <th>{lang === 'ru' ? 'Скидка, %' : 'Discount, %'}</th>
                <th>{lang === 'ru' ? 'Рост цены, %/мес' : 'Price growth, %/month'}</th>
                <th>{lang === 'ru' ? 'Аренда, $/день' : 'Rent, $/day'}</th>
                <th>{lang === 'ru' ? 'Индексация аренды, %' : 'Rent indexation, %'}</th>
                <th>{lang === 'ru' ? 'Действия' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(line => {
                const project = getProject(line.projectId);
                const villa = getVilla(line.projectId, line.villaId);
                
                return (
                  <tr key={line.id}>
                    <td>
                      <select 
                        value={line.projectId} 
                        onChange={e => updLine(line.id, {projectId: e.target.value, villaId: ''})}
                      >
                        <option value="">{lang === 'ru' ? 'Выберите проект' : 'Select project'}</option>
                        {catalog.map(p => (
                          <option key={p.projectId} value={p.projectId}>
                            {p.projectName}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select 
                        value={line.villaId} 
                        onChange={e => updLine(line.id, {villaId: e.target.value})}
                        disabled={!line.projectId}
                      >
                        <option value="">{lang === 'ru' ? 'Выберите виллу' : 'Select villa'}</option>
                        {getProjectVillas(line.projectId).map(v => (
                          <option key={v.villaId} value={v.villaId}>
                            {v.name} - {formatCurrency(v.baseUSD)} ({v.area}м²)
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={line.qty} 
                        onChange={e => updLine(line.id, {qty: parseInt(e.target.value) || 1})}
                        min="1"
                        className="input-small"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={line.prePct} 
                        onChange={e => updLine(line.id, {prePct: parseFloat(e.target.value) || 0})}
                        min="0"
                        max="100"
                        step="0.01"
                        className="input-small"
                      />
                    </td>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={line.ownTerms} 
                        onChange={e => updLine(line.id, {ownTerms: e.target.checked})}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={line.months || months} 
                        onChange={e => updLine(line.id, {months: parseInt(e.target.value) || months})}
                        disabled={!line.ownTerms}
                        min="1"
                        className="input-small"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={line.monthlyRatePct || monthlyRatePct} 
                        onChange={e => updLine(line.id, {monthlyRatePct: parseFloat(e.target.value) || monthlyRatePct})}
                        disabled={!line.ownTerms}
                        min="0"
                        step="0.01"
                        className="input-small"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={line.firstPostUSD} 
                        onChange={e => updLine(line.id, {firstPostUSD: parseFloat(e.target.value) || 0})}
                        min="0"
                        step="100"
                        className="input-small"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={line.discountPct} 
                        onChange={e => updLine(line.id, {discountPct: parseFloat(e.target.value) || 0})}
                        min="0"
                        max="100"
                        step="0.01"
                        className="input-small"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={line.monthlyPriceGrowthPct} 
                        onChange={e => updLine(line.id, {monthlyPriceGrowthPct: parseFloat(e.target.value) || 0})}
                        min="0"
                        step="0.01"
                        className="input-small"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={line.dailyRateUSD} 
                        onChange={e => updLine(line.id, {dailyRateUSD: parseFloat(e.target.value) || 0})}
                        min="0"
                        step="10"
                        className="input-small"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={line.rentalPriceIndexPct} 
                        onChange={e => updLine(line.id, {rentalPriceIndexPct: parseFloat(e.target.value) || 0})}
                        min="0"
                        step="0.1"
                        className="input-small"
                      />
                    </td>
                    <td>
                      <button onClick={() => delLine(line.id)} className="btn danger small">
                        {lang === 'ru' ? 'Удалить' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Сводка по объекту недвижимости */}
        <div className="property-summary">
          <h3>{lang === 'ru' ? 'Сводка' : 'Summary'}</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <label>{lang === 'ru' ? 'Общая стоимость:' : 'Total cost:'}</label>
              <span>{formatCurrency(totalCost)}</span>
            </div>
            <div className="summary-item">
              <label>{lang === 'ru' ? 'Плата до ключей:' : 'Payment before keys:'}</label>
              <span>{formatCurrency(preKeysPayment)}</span>
            </div>
            <div className="summary-item">
              <label>{lang === 'ru' ? 'Оплата после ключей:' : 'Payment after keys:'}</label>
              <span>{formatCurrency(postKeysPayment)}</span>
            </div>
            <div className="summary-item">
              <label>{lang === 'ru' ? 'Ежемесячный платеж:' : 'Monthly payment:'}</label>
              <span>{formatCurrency(monthlyPayment)}</span>
            </div>
            <div className="summary-item">
              <label>{lang === 'ru' ? 'Общая переплата:' : 'Total overpayment:'}</label>
              <span>{formatCurrency(totalOverpayment)}</span>
            </div>
            <div className="summary-item">
              <label>{lang === 'ru' ? 'Итоговая стоимость:' : 'Final cost:'}</label>
              <span>{formatCurrency(finalCost)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Блок рассрочки до получения ключей */}
      <section className="stages-section">
        <h2>{lang === 'ru' ? 'Рассрочка до получения ключей (установите комфортный план оплаты)' : 'Installment before keys (set comfortable payment plan)'}</h2>
        
        {/* Таблица этапов */}
        <div className="stages-table">
          <table>
            <thead>
              <tr>
                <th>{lang === 'ru' ? 'Этап' : 'Stage'}</th>
                <th>{lang === 'ru' ? 'Процент' : 'Percent'}</th>
                <th>{lang === 'ru' ? 'Месяц' : 'Month'}</th>
                <th>{lang === 'ru' ? 'Действия' : 'Actions'}</th>
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
                      placeholder={lang === 'ru' ? 'Название этапа' : 'Stage name'}
                      className="stage-input"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={stage.pct} 
                      onChange={e => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0 && value <= 100) {
                          updStage(stage.id, {pct: value});
                        }
                      }}
                      placeholder="%"
                      className="stage-input-small"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={stage.month} 
                      onChange={e => updStage(stage.id, {month: parseInt(e.target.value) || 0})}
                      min="0"
                      className="stage-input-small"
                    />
                  </td>
                  <td>
                    <button onClick={() => delStage(stage.id)} className="btn danger small">
                      {lang === 'ru' ? 'Удалить' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="stages-controls">
            <button onClick={addStage} className="btn primary">
              {lang === 'ru' ? 'Добавить этап' : 'Add stage'}
            </button>
          </div>
        </div>

        {/* Сводка по этапам */}
        <div className="stages-summary">
          <div className="pill">
            {lang === 'ru' ? 'Сумма этапов:' : 'Stages sum:'} {stagesSumPct.toFixed(2)}%
            {stagesSumPct !== targetPrePct && (
              <span className="warning">
                {lang === 'ru' ? ` — не хватает до ${targetPrePct.toFixed(2)}%` : ` — missing to ${targetPrePct.toFixed(2)}%`}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Блок глобальных настроек */}
      <section className="global-settings-section">
        <h2>{lang === 'ru' ? 'Глобальные настройки' : 'Global settings'}</h2>
        <div className="settings-grid">
          <div className="setting-item">
            <label>{lang === 'ru' ? 'Месяц получения ключей:' : 'Keys handover month:'}</label>
            <input 
              type="number" 
              value={handoverMonth} 
              onChange={e => setHandoverMonth(parseInt(e.target.value) || 12)}
              min="1"
              max="60"
            />
          </div>
          <div className="setting-item">
            <label>{lang === 'ru' ? 'Срок рассрочки (месяцев):' : 'Installment period (months):'}</label>
            <input 
              type="number" 
              value={months} 
              onChange={e => setMonths(parseInt(e.target.value) || 12)}
              min="1"
              max="60"
            />
          </div>
          <div className="setting-item">
            <label>{lang === 'ru' ? 'Глобальная ставка, %/мес:' : 'Global rate, %/month:'}</label>
            <input 
              type="number" 
              value={monthlyRatePct} 
              onChange={e => setMonthlyRatePct(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>
          <div className="setting-item">
            <label>{lang === 'ru' ? 'Месяц начала:' : 'Start month:'}</label>
            <input 
              type="month" 
              value={`${startMonth.getFullYear()}-${String(startMonth.getMonth() + 1).padStart(2, '0')}`}
              onChange={e => {
                const [year, month] = e.target.value.split('-');
                setStartMonth(new Date(parseInt(year), parseInt(month) - 1, 1));
              }}
            />
          </div>
        </div>
      </section>

      {/* Блок финансовой модели */}
      <section className="financial-model-section">
        <h2>{lang === 'ru' ? 'Финмодель доходности инвестиций' : 'Financial model of investment returns'}</h2>
        
        {/* Параметры ценообразования */}
        <div className="pricing-params">
          <h3>{lang === 'ru' ? 'Параметры ценообразования' : 'Pricing parameters'}</h3>
          <div className="params-grid">
            <div className="param-item">
              <label>{lang === 'ru' ? 'Инфляция:' : 'Inflation:'}</label>
              <span>g = {pricingConfig.inflationRatePct}%/{lang === 'ru' ? 'год' : 'year'}</span>
            </div>
            <div className="param-item">
              <label>{lang === 'ru' ? 'Старение:' : 'Aging:'}</label>
              <span>β = {pricingConfig.agingBeta}/{lang === 'ru' ? 'год' : 'year'}</span>
            </div>
            <div className="param-item">
              <label>{lang === 'ru' ? 'LEASE DECAY:' : 'LEASE DECAY:'}</label>
              <span>α = {pricingConfig.leaseAlpha}</span>
            </div>
            <div className="param-item">
              <label>{lang === 'ru' ? 'Бренд:' : 'Brand:'}</label>
              <span>{lang === 'ru' ? 'Пик:' : 'Peak:'} {pricingConfig.brandPeak}</span>
            </div>
          </div>
        </div>

        {/* График динамики стоимости */}
        <div className="chart-section">
          <h3>{lang === 'ru' ? 'Динамика стоимости виллы и арендного дохода' : 'Villa value and rental income dynamics'}</h3>
          <div className="chart-container">
            <canvas ref={chartRef} width="800" height="400"></canvas>
          </div>
        </div>

        {/* Сводка показателей */}
        <div className="metrics-summary">
          <h3>{lang === 'ru' ? 'Ключевые показатели' : 'Key metrics'}</h3>
          <div className="metrics-grid">
            <div className="metric-item">
              <label>{lang === 'ru' ? 'ROI при продаже перед ключами:' : 'ROI when selling before keys:'}</label>
              <span>{formatPercent(roiBeforeKeys)}</span>
            </div>
            <div className="metric-item">
              <label>{lang === 'ru' ? 'Чистый доход:' : 'Net income:'}</label>
              <span>{formatCurrency(netIncome)}</span>
            </div>
            <div className="metric-item">
              <label>{lang === 'ru' ? 'Точка выхода с макс. IRR:' : 'Exit point with max IRR:'}</label>
              <span>{exitPointMaxIRR.year}</span>
            </div>
            <div className="metric-item">
              <label>{lang === 'ru' ? 'IRR:' : 'IRR:'}</label>
              <span>{formatPercent(exitPointMaxIRR.irr)}</span>
            </div>
            <div className="metric-item">
              <label>{lang === 'ru' ? 'Итоговый ROI (накопительный):' : 'Cumulative ROI:'}</label>
              <span>{formatPercent(yearlyData.length > 0 ? yearlyData[yearlyData.length - 1].cumulativeRoi : 0)}</span>
            </div>
          </div>
        </div>

        {/* Таблица годовых показателей */}
        <div className="yearly-table">
          <h3>{lang === 'ru' ? 'Расчет показателей (годовой)' : 'Annual calculation'}</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{lang === 'ru' ? 'Год' : 'Year'}</th>
                  <th>{lang === 'ru' ? 'Lease Factor' : 'Lease Factor'}</th>
                  <th>{lang === 'ru' ? 'Age Factor' : 'Age Factor'}</th>
                  <th>{lang === 'ru' ? 'Brand Factor' : 'Brand Factor'}</th>
                  <th>{lang === 'ru' ? 'Коэффициент инфляции' : 'Inflation factor'}</th>
                  <th>{lang === 'ru' ? 'Рыночная стоимость' : 'Market value'}</th>
                  <th>{lang === 'ru' ? 'Арендный доход' : 'Rental income'}</th>
                  <th>{lang === 'ru' ? 'Совокупная капитализация' : 'Total capitalization'}</th>
                  <th>{lang === 'ru' ? 'ROI за год (%)' : 'Yearly ROI (%)'}</th>
                  <th>{lang === 'ru' ? 'Итоговый ROI (%)' : 'Cumulative ROI (%)'}</th>
                  <th>{lang === 'ru' ? 'IRR (%)' : 'IRR (%)'}</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.map((yearData, index) => (
                  <tr key={index}>
                    <td>{yearData.year}</td>
                    <td>{yearData.leaseFactor.toFixed(3)}</td>
                    <td>{yearData.ageFactor.toFixed(3)}</td>
                    <td>{yearData.brandFactor.toFixed(3)}</td>
                    <td>{yearData.inflationFactor.toFixed(3)}</td>
                    <td>{formatCurrency(yearData.marketValue)}</td>
                    <td>{formatCurrency(yearData.rentalIncome)}</td>
                    <td>{formatCurrency(yearData.totalCapitalization)}</td>
                    <td>{formatPercent(yearData.yearlyRoi)}</td>
                    <td>{formatPercent(yearData.cumulativeRoi)}</td>
                    <td>{formatPercent(yearData.irr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Таблица месячных показателей за период рассрочки */}
        <div className="installment-table">
          <h3>{lang === 'ru' ? 'Расчет показателей (на период рассрочки)' : 'Installment period calculation'}</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>{lang === 'ru' ? 'Период' : 'Period'}</th>
                  <th>{lang === 'ru' ? 'Lease Factor' : 'Lease Factor'}</th>
                  <th>{lang === 'ru' ? 'Age Factor' : 'Age Factor'}</th>
                  <th>{lang === 'ru' ? 'Brand Factor' : 'Brand Factor'}</th>
                  <th>{lang === 'ru' ? 'Коэффициент инфляции' : 'Inflation factor'}</th>
                  <th>{lang === 'ru' ? 'Рыночная стоимость' : 'Market value'}</th>
                  <th>{lang === 'ru' ? 'Арендный доход' : 'Rental income'}</th>
                  <th>{lang === 'ru' ? 'Совокупная капитализация' : 'Total capitalization'}</th>
                  <th>{lang === 'ru' ? 'Платеж по рассрочке' : 'Installment payment'}</th>
                  <th>{lang === 'ru' ? 'ROI за месяц (%)' : 'Monthly ROI (%)'}</th>
                  <th>{lang === 'ru' ? 'Итоговый ROI (%)' : 'Cumulative ROI (%)'}</th>
                  <th>{lang === 'ru' ? 'IRR (%)' : 'IRR (%)'}</th>
                </tr>
              </thead>
              <tbody>
                {installmentPeriodData.map((monthData, index) => (
                  <tr key={index}>
                    <td>{monthData.month}</td>
                    <td>{monthData.leaseFactor.toFixed(3)}</td>
                    <td>{monthData.ageFactor.toFixed(3)}</td>
                    <td>{monthData.brandFactor.toFixed(3)}</td>
                    <td>{monthData.inflationFactor.toFixed(3)}</td>
                    <td>{formatCurrency(monthData.marketValue)}</td>
                    <td>{formatCurrency(monthData.rentalIncome)}</td>
                    <td>{formatCurrency(monthData.totalCapitalization)}</td>
                    <td>{formatCurrency(monthData.installmentPayment)}</td>
                    <td>{formatPercent(monthData.monthlyRoi)}</td>
                    <td>{formatPercent(monthData.cumulativeRoi)}</td>
                    <td>{formatPercent(monthData.irr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>

    {/* Футер */}
    <footer className="footer">
      <p>&copy; 2024 Arconique. {lang === 'ru' ? 'Все права защищены.' : 'All rights reserved.'}</p>
    </footer>
  </div>
);

// Рендер приложения
const root = createRoot(document.getElementById('root'));
root.render(<App />);
      
