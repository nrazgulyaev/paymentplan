// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE (С ИНФЛЯЦИЕЙ, СТАРЕНИЕМ И БРЕНД-ФАКТОРОМ) =====

// ===== ТИПЫ И ИНТЕРФЕЙСЫ =====
// PricingConfig - конфигурация ценообразования
const DEFAULT_PRICING_CONFIG = {
  inflationRatePct: 10,        // g в процентах (0..100), по умолчанию 10
  leaseAlpha: 1,               // alpha, по умолчанию 1
  agingBeta: 0.025,            // beta в долях/год, по умолчанию 0.025
  brandPeak: 1.2,              // по умолчанию 1.2
  brandRampYears: 3,           // по умолчанию 3
  brandPlateauYears: 4,        // по умолчанию 4
  brandDecayYears: 8,          // по умолчанию 8
  brandTail: 1.0               // по умолчанию 1.0
};

// ===== УТИЛИТЫ РАСЧЕТА ЦЕНООБРАЗОВАНИЯ =====

// Фактор убывания ценности lease
function leaseFactor(t, T, alpha) {
  const rem = Math.max(T - t, 0);
  return Math.pow(rem / T, alpha);
}

// Фактор старения (износа/обесценения)
function ageFactor(t, beta) {
  return Math.exp(-beta * t);
}

// Фактор бренда/популярности
function brandFactor(t, brandParams) {
  const { peak, rampYears, plateauYears, decayYears, tail } = brandParams;
  
  if (t <= 0) return 1.0;

  if (rampYears > 0 && t <= rampYears) {
    // от 1.0 до peak
    return 1.0 + (peak - 1.0) * (t / rampYears);
  }

  const afterRamp = Math.max(t - rampYears, 0);

  if (afterRamp > 0 && afterRamp <= plateauYears) {
    return peak;
  }

  const afterPlateau = Math.max(afterRamp - plateauYears, 0);

  if (decayYears > 0 && afterPlateau > 0 && afterPlateau <= decayYears) {
    // от peak до tail
    return peak + (tail - peak) * (afterPlateau / decayYears);
  }

  return tail;
}

// Итоговая цена в году t
function priceAtYear(params) {
  const { P0, g, t, T, alpha, beta, brand } = params;
  const market = P0 * Math.pow(1 + g, t);
  return market
    * leaseFactor(t, T, alpha)
    * ageFactor(t, beta)
    * brandFactor(t, brand);
}

// Генерация данных для графика ценообразования
function generatePricingChartData(villa, pricingConfig, maxYears = 60) {
  const data = [];
  const P0 = villa.baseUSD;
  const T = villa.leaseTotalYears || 30;
  const g = pricingConfig.inflationRatePct / 100;
  const alpha = pricingConfig.leaseAlpha;
  const beta = pricingConfig.agingBeta;
  const brand = {
    peak: pricingConfig.brandPeak,
    rampYears: pricingConfig.brandRampYears,
    plateauYears: pricingConfig.brandPlateauYears,
    decayYears: pricingConfig.brandDecayYears,
    tail: pricingConfig.brandTail
  };

  for (let t = 0; t <= Math.min(T, maxYears); t++) {
    const marketPrice = P0 * Math.pow(1 + g, t);
    const finalPrice = priceAtYear({ P0, g, t, T, alpha, beta, brand });
    
    data.push({
      year: t,
      marketPrice,
      finalPrice,
      leaseFactor: leaseFactor(t, T, alpha),
      ageFactor: ageFactor(t, beta),
      brandFactor: brandFactor(t, brand),
      leaseRemaining: Math.max(T - t, 0)
    });
  }
  
  return data;
}

// ===== ОСНОВНОЕ ПРИЛОЖЕНИЕ =====
function App() {
  // ===== СОСТОЯНИЕ =====
  const [lang, setLang] = useState('ru');
  const [currency, setCurrency] = useState('USD');
  const [idrPerUsd, setIdrPerUsd] = useState(16000);
  const [eurPerUsd, setEurPerUsd] = useState(0.85);
  const [startMonth, setStartMonth] = useState(new Date(2025, 7, 1)); // 1 августа 2025
  const [handoverMonth, setHandoverMonth] = useState(18);
  const [monthlyRatePct, setMonthlyRatePct] = useState(1.5);
  const [months, setMonths] = useState(12);
  const [isClient, setIsClient] = useState(false);
  
  // НОВОЕ: Конфигурация ценообразования
  const [pricingConfig, setPricingConfig] = useState(DEFAULT_PRICING_CONFIG);
  const [showPricingConfigModal, setShowPricingConfigModal] = useState(false);
  
  // ===== ПЕРЕВОДЫ =====
  const T = {
    ru: {
      title: 'Arconique - Калькулятор рассрочки',
      lang: 'Язык',
      currencyDisplay: 'Валюта отображения',
      idrRate: 'IDR за 1 USD',
      eurRate: 'EUR за 1 USD',
      startMonth: 'Начальный месяц',
      handoverMonth: 'Месяц получения ключей',
      globalRate: 'Глобальная ставка, %/мес',
      globalTerm: 'Глобальный срок, мес',
      clientTerm: 'Срок рассрочки (клиент), мес',
      months: 'мес',
      toggleToEditor: 'Переключиться в редактор',
      toggleToClient: 'Переключиться в клиент',
      client: 'Клиент',
      editor: 'Редактор',
      enterPin: 'Введите PIN для доступа к редактору:',
      wrongPin: 'Неверный PIN!',
      editorActivated: 'Редактор активирован!',
      switchedToClient: 'Переключено в клиентский режим',
      
      // Новые переводы для ценообразования
      pricingConfig: 'Параметры ценообразования',
      inflation: 'Инфляция рынка вилл',
      inflationRatePct: 'Годовой рост, %',
      leaseDecay: 'Убывание ценности lease',
      leaseAlpha: 'Степень убывания (α)',
      leaseAlphaHint: '1 — линейно; >1 — сильнее дисконт в конце',
      aging: 'Старение (износ/обесценение)',
      agingBeta: 'Коэффициент старения (β)',
      agingBetaHint: '0.025 ≈ 2.5%/год экспоненциально',
      brand: 'Бренд/популярность',
      brandPeak: 'Пик бренда',
      brandRampYears: 'Годы роста',
      brandPlateauYears: 'Годы плато',
      brandDecayYears: 'Годы спада',
      brandTail: 'Хвост бренда',
      saveConfig: 'Сохранить',
      resetToDefault: 'Сбросить к дефолту',
      configSaved: 'Конфигурация сохранена!',
      configReset: 'Конфигурация сброшена к дефолту!',
      
      // Существующие переводы...
      villasTitle: 'Расчёт (позиции)',
      addFromCatalog: 'Добавить из каталога',
      project: 'Проект',
      villa: 'Вилла',
      qty: 'Кол-во',
      area: 'Площадь',
      ppsm: 'Цена за м²',
      price: 'Цена',
      discount: 'Скидка, %',
      prePct: 'До ключей, %',
      months: 'Месяцы',
      rate: 'Ставка, %/мес',
      dailyRate: 'Стоимость ночи',
      occupancyRate: 'Заполняемость, %',
      rentalPriceIndex: 'Индексация аренды, %',
      lineTotal: 'Итого по позиции',
      addStage: 'Добавить этап',
      stagesTitle: 'Базовая рассрочка',
      stage: 'Этап',
      percent: '%',
      month: 'Месяц',
      actions: 'Действия',
      delete: 'Удалить',
      stagesSum: 'Сумма этапов:',
      notEnough: 'Недостаточно',
      exceeds: 'Превышает',
      cashflowTitle: 'Сводный кэшфлоу по месяцам',
      exportCSV: 'Экспорт CSV',
      exportXLSX: 'Экспорт XLSX',
      exportPDF: 'Экспорт PDF',
      month: 'Месяц',
      description: 'Описание',
      amountDue: 'К оплате',
      rentalIncome: 'Доход от аренды',
      netPayment: 'Чистый платеж/доход',
      remainingBalance: 'Остаток долга',
      catalogTitle: 'Каталог проектов и вилл (редактор)',
      addProject: 'Добавить проект',
      addVilla: 'Добавить виллу',
      exportCatalog: 'Экспорт каталога',
      importCatalog: 'Импорт каталога',
      searchPlaceholder: 'Поиск по названию...',
      sortByName: 'По названию',
      sortByPrice: 'По цене',
      sortByArea: 'По площади',
      areaFrom: 'Площадь от',
      areaTo: 'до',
      priceFrom: 'Цена от',
      priceTo: 'до',
      projectName: 'Название проекта',
      villaName: 'Название виллы',
      villaArea: 'Площадь виллы',
      villaPpsm: 'Цена за м²',
      villaBasePrice: 'Базовая цена',
      leaseholdEndDate: 'Дата окончания лизхолда',
      dailyRate: 'Стоимость проживания в сутки',
      rentalPriceIndex: 'Индексация роста цены аренды в год',
      save: 'Сохранить',
      cancel: 'Отмена',
      editProject: 'Редактировать проект',
      deleteProjectConfirm: 'Удалить проект?',
      deleteVillaConfirm: 'Удалить виллу?',
      catalogImported: 'Каталог импортирован!',
      wrongFileFormat: 'Неверный формат файла!',
      importError: 'Ошибка импорта!',
      notSet: 'Не задано',
      rentalIncomeChart: 'График общей доходности от сдачи в аренду',
      totalIncome: 'Доход за год',
      cumulativeIncome: 'Накопительный доход',
      cleanLeaseholdTerm: 'Чистый срок лизхолда',
      years: 'лет',
      months: 'мес',
      totalAmount: 'Общая сумма',
      amountDue: 'К оплате',
      after: 'После ключей',
      interest: 'Проценты',
      finalPrice: 'Итоговая цена',
      lines: 'Позиций',
      keys: 'Ключи через',
      selectFromCatalog: 'Выберите из каталога',
      addSelected: 'Добавить выбранную',
      reportTitle: 'Отчет по рассрочке Arconique',
      reportCreated: 'Отчет создан',
      projectSummary: 'Сводка по проекту',
      monthlyCashflow: 'Месячный кэшфлоу',
      xlsxNotLoaded: 'XLSX.js не загружен',
      html2pdfNotLoaded: 'html2pdf.js не загружен'
    },
    en: {
      title: 'Arconique - Installment Calculator',
      lang: 'Language',
      currencyDisplay: 'Display Currency',
      idrRate: 'IDR per 1 USD',
      eurRate: 'EUR per 1 USD',
      startMonth: 'Start Month',
      handoverMonth: 'Handover Month',
      globalRate: 'Global Rate, %/month',
      globalTerm: 'Global Term, months',
      clientTerm: 'Installment Term (Client), months',
      months: 'mo',
      toggleToEditor: 'Switch to Editor',
      toggleToClient: 'Switch to Client',
      client: 'Client',
      editor: 'Editor',
      enterPin: 'Enter PIN to access editor:',
      wrongPin: 'Wrong PIN!',
      editorActivated: 'Editor activated!',
      switchedToClient: 'Switched to client mode',
      
      // New translations for pricing
      pricingConfig: 'Pricing Parameters',
      inflation: 'Villa Market Inflation',
      inflationRatePct: 'Annual Growth, %',
      leaseDecay: 'Lease Value Decay',
      leaseAlpha: 'Decay Degree (α)',
      leaseAlphaHint: '1 — linear; >1 — stronger discount at end',
      aging: 'Aging (Depreciation)',
      agingBeta: 'Aging Coefficient (β)',
      agingBetaHint: '0.025 ≈ 2.5%/year exponentially',
      brand: 'Brand/Popularity',
      brandPeak: 'Brand Peak',
      brandRampYears: 'Growth Years',
      brandPlateauYears: 'Plateau Years',
      brandDecayYears: 'Decay Years',
      brandTail: 'Brand Tail',
      saveConfig: 'Save',
      resetToDefault: 'Reset to Default',
      configSaved: 'Configuration saved!',
      configReset: 'Configuration reset to default!',
      
      // Existing translations...
      villasTitle: 'Calculation (Positions)',
      addFromCatalog: 'Add from Catalog',
      project: 'Project',
      villa: 'Villa',
      qty: 'Qty',
      area: 'Area',
      ppsm: 'Price per m²',
      price: 'Price',
      discount: 'Discount, %',
      prePct: 'Before Keys, %',
      months: 'Months',
      rate: 'Rate, %/month',
      dailyRate: 'Daily Rate',
      occupancyRate: 'Occupancy, %',
      rentalPriceIndex: 'Rental Price Indexation, %',
      lineTotal: 'Line Total',
      addStage: 'Add Stage',
      stagesTitle: 'Basic Installment',
      stage: 'Stage',
      percent: '%',
      month: 'Month',
      actions: 'Actions',
      delete: 'Delete',
      stagesSum: 'Stages sum:',
      notEnough: 'Not enough',
      exceeds: 'Exceeds',
      cashflowTitle: 'Monthly Cashflow Summary',
      exportCSV: 'Export CSV',
      exportXLSX: 'Export XLSX',
      exportPDF: 'Export PDF',
      month: 'Month',
      description: 'Description',
      amountDue: 'Amount Due',
      rentalIncome: 'Rental Income',
      netPayment: 'Net Payment/Income',
      remainingBalance: 'Remaining Balance',
      catalogTitle: 'Projects and Villas Catalog (Editor)',
      addProject: 'Add Project',
      addVilla: 'Add Villa',
      exportCatalog: 'Export Catalog',
      importCatalog: 'Import Catalog',
      searchPlaceholder: 'Search by name...',
      sortByName: 'By Name',
      sortByPrice: 'By Price',
      sortByArea: 'By Area',
      areaFrom: 'Area from',
      areaTo: 'to',
      priceFrom: 'Price from',
      priceTo: 'to',
      projectName: 'Project Name',
      villaName: 'Villa Name',
      villaArea: 'Villa Area',
      villaPpsm: 'Price per m²',
      villaBasePrice: 'Base Price',
      leaseholdEndDate: 'Leasehold End Date',
      dailyRate: 'Daily Rate',
      rentalPriceIndex: 'Annual Rental Price Indexation',
      save: 'Save',
      cancel: 'Cancel',
      editProject: 'Edit Project',
      deleteProjectConfirm: 'Delete project?',
      deleteVillaConfirm: 'Delete villa?',
      catalogImported: 'Catalog imported!',
      wrongFileFormat: 'Wrong file format!',
      importError: 'Import error!',
      notSet: 'Not set',
      rentalIncomeChart: 'Total Rental Income Chart',
      totalIncome: 'Annual Income',
      cumulativeIncome: 'Cumulative Income',
      cleanLeaseholdTerm: 'Clean Leasehold Term',
      years: 'years',
      months: 'months',
      totalAmount: 'Total Amount',
      amountDue: 'Amount Due',
      after: 'After Keys',
      interest: 'Interest',
      finalPrice: 'Final Price',
      lines: 'Lines',
      keys: 'Keys in',
      selectFromCatalog: 'Select from Catalog',
      addSelected: 'Add Selected',
      reportTitle: 'Arconique Installment Report',
      reportCreated: 'Report created',
      projectSummary: 'Project Summary',
      monthlyCashflow: 'Monthly Cashflow',
      xlsxNotLoaded: 'XLSX.js not loaded',
      html2pdfNotLoaded: 'html2pdf.js not loaded'
    }
  };

  const t = T[lang];

  // ===== ЭФФЕКТЫ =====
  useEffect(() => {
    document.title = t.title;
    const appTitleElement = document.getElementById('app-title');
    if (appTitleElement) {
      appTitleElement.textContent = t.title;
    }
  }, [t.title]);

  // Загрузка конфигурации ценообразования из localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('arconique_pricing_config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setPricingConfig({ ...DEFAULT_PRICING_CONFIG, ...parsed });
      } catch (e) {
        console.warn('Failed to parse saved pricing config, using defaults');
      }
    }
  }, []);

  // Сохранение конфигурации ценообразования в localStorage
  const savePricingConfig = (newConfig) => {
    setPricingConfig(newConfig);
    localStorage.setItem('arconique_pricing_config', JSON.stringify(newConfig));
    alert(t.configSaved);
    setShowPricingConfigModal(false);
  };

  // Сброс конфигурации к дефолту
  const resetPricingConfig = () => {
    setPricingConfig(DEFAULT_PRICING_CONFIG);
    localStorage.removeItem('arconique_pricing_config');
    alert(t.configReset);
  };

  // ===== ОСТАЛЬНОЕ СОСТОЯНИЕ =====
  const [stages, setStages] = useState([
    {id: 1, label: 'Договор', pct: 30, month: 0},
    {id: 2, label: '50% готовности', pct: 40, month: 6},
    {id: 3, label: 'Ключи', pct: 30, month: 12}
  ]);
  
  const [lines, setLines] = useState([]);
  const [catalog, setCatalog] = useState([
    {
      projectId: 'project1',
      projectName: 'Проект 1',
      villas: [
        {
          villaId: 'villa1',
          name: 'Вилла А',
          area: 150,
          ppsm: 2500,
          baseUSD: 375000,
          leaseTotalYears: 30,
          leaseholdEndDate: new Date(2055, 7, 1),
          dailyRateUSD: 150,
          rentalPriceIndexPct: 5
        }
      ]
    }
  ]);

  // ===== ВЫЧИСЛЕНИЯ =====
  const stagesSumPct = useMemo(() => stages.reduce((sum, s) => sum + s.pct, 0), [stages]);
  
  const linesData = useMemo(() => lines.map(line => {
    const villa = catalog.flatMap(p => p.villas).find(v => v.villaId === line.villaId);
    if (!villa) return null;
    
    const base = (line.snapshot?.baseUSD || villa.baseUSD) * (line.qty || 1);
    const discount = (line.discountPct || 0) / 100;
    const discounted = base * (1 - discount);
    const prePct = (line.prePct || 70) / 100;
    const pre = discounted * prePct;
    const after = discounted - pre;
    
    const vMonths = line.ownTerms ? (line.months || months) : months;
    const vRate = line.ownTerms ? (line.monthlyRatePct || monthlyRatePct) : monthlyRatePct;
    
    const monthly = after / vMonths;
    const interest = monthly * vRate / 100 * vMonths;
    const lineTotal = pre + after + interest;
    
    return { line, base, discount, discounted, prePct, pre, after, vMonths, vRate, monthly, interest, lineTotal };
  }).filter(Boolean), [lines, catalog, months, monthlyRatePct]);

  // ===== ПРОЕКТ И КЭШФЛОУ =====
  const project = useMemo(() => {
    if (linesData.length === 0) return { cashflow: [], totals: { baseUSD: 0, preUSD: 0, afterUSD: 0, interestUSD: 0, finalUSD: 0 } };
    
    const baseUSD = linesData.reduce((sum, ld) => sum + ld.base, 0);
    const preUSD = linesData.reduce((sum, ld) => sum + ld.pre, 0);
    const afterUSD = linesData.reduce((sum, ld) => sum + ld.after, 0);
    const interestUSD = linesData.reduce((sum, ld) => sum + ld.interest, 0);
    const finalUSD = baseUSD + interestUSD;
    
    // Генерация кэшфлоу с учетом новых параметров ценообразования
    const cashflow = [];
    const maxMonth = Math.max(...stages.map(s => s.month), handoverMonth + 60); // Увеличиваем для учета лизинга
    
    for (let month = 1; month <= maxMonth; month++) {
      const items = [];
      let amountUSD = 0;
      
      // Платежи по этапам
      stages.forEach(stage => {
        if (stage.month === month) {
          const stageAmount = (stage.pct / 100) * preUSD;
          items.push(`${stage.label}: ${fmtMoney(stageAmount, 'USD')}`);
          amountUSD += stageAmount;
        }
      });
      
      // Платежи после ключей
      if (month > handoverMonth) {
        const postKeyMonth = month - handoverMonth;
        const monthlyPayment = afterUSD / months;
        items.push(`После ключей: ${fmtMoney(monthlyPayment, 'USD')}`);
        amountUSD += monthlyPayment;
      }
      
      // Доход от аренды (начинается через 3 месяца после ключей)
      let rentalIncome = 0;
      if (month > handoverMonth + 3) {
        const rentalMonth = month - handoverMonth - 3;
        const year = Math.floor(rentalMonth / 12);
        
        linesData.forEach(ld => {
          const villa = catalog.flatMap(p => p.villas).find(v => v.villaId === ld.line.villaId);
          if (villa) {
            const daysInMonth = getDaysInMonth(startMonth.getFullYear() + Math.floor(month / 12), (month % 12) + 1);
            const indexedDailyRate = getIndexedRentalPrice(villa.dailyRateUSD || 150, villa.rentalPriceIndexPct || 5, year);
            const monthlyRental = indexedDailyRate * 0.55 * (ld.line.occupancyPct || 75) / 100 * daysInMonth;
            rentalIncome += monthlyRental * ld.qty;
          }
        });
      }
      
      // Чистый платеж/доход
      const netPayment = amountUSD - rentalIncome;
      
      // Остаток долга
      let balanceUSD = 0;
      if (month <= handoverMonth) {
        balanceUSD = preUSD - stages.filter(s => s.month <= month).reduce((sum, s) => sum + s.pct / 100 * preUSD, 0);
      } else {
        const paidAfterKeys = (month - handoverMonth) * (afterUSD / months);
        balanceUSD = Math.max(0, afterUSD - paidAfterKeys);
      }
      
      if (items.length > 0 || rentalIncome > 0) {
        cashflow.push({
          month,
          items,
          amountUSD,
          rentalIncome,
          netPayment,
          balanceUSD
        });
      }
    }
    
    return {
      cashflow,
      totals: { baseUSD, preUSD, afterUSD, interestUSD, finalUSD }
    };
  }, [linesData, stages, handoverMonth, months, startMonth, catalog]);

  // ===== УТИЛИТЫ =====
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function fmtMoney(amount, currency) {
    if (currency === 'USD') return `$${Math.round(amount).toLocaleString()}`;
    if (currency === 'IDR') return `Rp${Math.round(amount).toLocaleString()}`;
    if (currency === 'EUR') return `€${Math.round(amount).toLocaleString()}`;
    return amount.toLocaleString();
  }

  function formatMonth(month) {
    const date = new Date(startMonth);
    date.setMonth(date.getMonth() + month - 1);
    return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  }

  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function getCleanLeaseholdTerm(villa) {
    if (!villa.leaseholdEndDate) return { years: 0, months: 0 };
    
    const handoverDate = new Date(startMonth);
    handoverDate.setMonth(handoverDate.getMonth() + handoverMonth);
    
    const diffTime = villa.leaseholdEndDate.getTime() - handoverDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    return { years, months };
  }

  function getIndexedRentalPrice(dailyRate, indexPct, years) {
    return dailyRate * Math.pow(1 + indexPct / 100, years);
  }

  function getYearlyRentalIncome(villa, year) {
    const dailyRate = getIndexedRentalPrice(villa.dailyRateUSD || 150, villa.rentalPriceIndexPct || 5, year);
    const monthlyIncome = dailyRate * 0.55 * (75 / 100) * 30.44; // Среднее дней в месяце
    return monthlyIncome * 12;
  }

  function getCumulativeRentalIncome(villa, maxYear) {
    let cumulative = 0;
    for (let year = 0; year <= maxYear; year++) {
      cumulative += getYearlyRentalIncome(villa, year);
    }
    return cumulative;
  }

  // Данные для графика доходности от аренды
  const yearlyRentalData = useMemo(() => {
    const data = [];
    let cumulative = 0;
    
    for (let year = 0; year <= 20; year++) {
      const yearIncome = linesData.reduce((sum, ld) => {
        const villa = catalog.flatMap(p => p.villas).find(v => v.villaId === ld.line.villaId);
        if (villa) {
          return sum + getYearlyRentalIncome(villa, year) * ld.qty;
        }
        return sum;
      }, 0);
      
      cumulative += yearIncome;
      data.push({ year, yearIncome, cumulativeIncome: cumulative });
    }
    
    return data;
  }, [linesData, catalog]);

  // Общий чистый срок лизхолда для KPI
  const totalLeaseholdTerm = useMemo(() => {
    if (linesData.length === 0) return { years: 0, months: 0 };
    
    const allVillas = linesData.map(ld => 
      catalog.flatMap(p => p.villas).find(v => v.villaId === ld.line.villaId)
    ).filter(Boolean);
    
    if (allVillas.length === 0) return { years: 0, months: 0 };
    
    const avgTerm = allVillas.reduce((sum, villa) => {
      const term = getCleanLeaseholdTerm(villa);
      return sum + term.years * 12 + term.months;
    }, 0) / allVillas.length;
    
    return {
      years: Math.floor(avgTerm / 12),
      months: Math.floor(avgTerm % 12)
    };
  }, [linesData, catalog, startMonth, handoverMonth]);

  // ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ЛИНИЯМИ =====
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
      dailyRateUSD: villa.dailyRateUSD || 150,
      occupancyPct: 75,
      rentalPriceIndexPct: villa.rentalPriceIndexPct || 5,
      snapshot: {
        name: villa.name, 
        area: villa.area, 
        ppsm: villa.ppsm, 
        baseUSD: villa.baseUSD,
        leaseholdEndDate: villa.leaseholdEndDate,
        leaseTotalYears: villa.leaseTotalYears || 30
      }
    };
    setLines(prev => [...prev, newLine]);
    setModalOpen(false);
  };

  // ===== ФУНКЦИИ ЭКСПОРТА =====
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

  // ===== ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ РЕЖИМА =====
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

  // ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ЭТАПАМИ =====
  const addStage = () => {
    const newId = stages.length + 1;
    setStages(prev => [...prev, {id: newId, label: lang === 'ru' ? 'Новый этап' : 'New stage', pct: 5, month: 0}]);
  };

  const delStage = (id) => setStages(prev => prev.filter(s => s.id !== id));

  const updStage = (id, patch) => setStages(prev => prev.map(s => s.id === id ? {...s, ...patch} : s));

  // ===== СОСТОЯНИЕ ДЛЯ МОДАЛЬНЫХ ОКОН =====
  const [modalOpen, setModalOpen] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProjectForm, setNewProjectForm] = useState({
    projectName: '',
    projectId: ''
  });
  const [newVillaForm, setNewVillaForm] = useState({
    name: '',
    area: 0,
    ppsm: 0,
    baseUSD: 0,
    leaseTotalYears: 30,
    leaseholdEndDate: null,
    dailyRateUSD: 150,
    rentalPriceIndexPct: 5
  });

  // ===== ФУНКЦИИ ДЛЯ РАБОТЫ С КАТАЛОГОМ =====
  const addProject = () => {
    const newId = 'project' + Date.now();
    const newProject = {
      projectId: newId,
      projectName: newProjectForm.projectName,
      villas: []
    };
    setCatalog(prev => [...prev, newProject]);
    setNewProjectForm({ projectName: '', projectId: '' });
    setShowAddProjectModal(false);
  };

  const saveProject = () => {
    if (editingProject) {
      setCatalog(prev => prev.map(p => 
        p.projectId === editingProject.projectId ? editingProject : p
      ));
      setEditingProject(null);
    } else {
      addProject();
    }
  };

  const addVilla = (projectId) => {
    const newId = 'villa' + Date.now();
    const newVilla = {
      villaId: newId,
      name: newVillaForm.name,
      area: newVillaForm.area,
      ppsm: newVillaForm.ppsm,
      baseUSD: newVillaForm.baseUSD,
      leaseTotalYears: newVillaForm.leaseTotalYears,
      leaseholdEndDate: newVillaForm.leaseholdEndDate,
      dailyRateUSD: newVillaForm.dailyRateUSD,
      rentalPriceIndexPct: newVillaForm.rentalPriceIndexPct
    };
    
    setCatalog(prev => prev.map(p => 
      p.projectId === projectId 
        ? { ...p, villas: [...p.villas, newVilla] }
        : p
    ));
    
    setNewVillaForm({
      name: '',
      area: 0,
      ppsm: 0,
      baseUSD: 0,
      leaseTotalYears: 30,
      leaseholdEndDate: null,
      dailyRateUSD: 150,
      rentalPriceIndexPct: 5
    });
    setShowAddVillaModal(false);
  };

  const saveVilla = () => {
    if (editingProject) {
      addVilla(editingProject.projectId);
    } else {
      // Если не выбран проект, добавляем в первый доступный
      if (catalog.length > 0) {
        addVilla(catalog[0].projectId);
      }
    }
  };

  // ===== PIN КОД =====
  const PIN_CODE = '1234';

  // ... existing code ...

  return (
    <>
      {/* Внизу по порядку: */}
      
      {/* 1. Настройки */}
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

          {/* Курсы валют (только для редактора) */}
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

        {/* Ряд 2: Кнопки управления */}
        <div className="row">
          <button className="btn" onClick={toggleMode}>
            {isClient ? t.toggleToEditor : t.toggleToClient}
          </button>
          
          {/* НОВАЯ КНОПКА: Параметры ценообразования (только для редактора) */}
          {!isClient && (
            <button className="btn primary" onClick={() => setShowPricingConfigModal(true)}>
              {t.pricingConfig}
            </button>
          )}
        </div>
      </div>

      {/* 2. Расчёт (позиции) - ОБНОВЛЕН С НОВЫМИ ПОЛЯМИ ДЛЯ ЦЕНООБРАЗОВАНИЯ */}
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
                <th className="col-dailyRate">{t.dailyRate}</th>
                <th className="col-occupancyRate">{t.occupancyRate}</th>
                <th className="col-rentalIndex">{t.rentalPriceIndex}</th>
                {/* НОВЫЕ КОЛОНКИ ДЛЯ ЦЕНООБРАЗОВАНИЯ */}
                <th className="col-leaseYears">Срок лизинга</th>
                <th className="col-pricing">Ценообразование</th>
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
                  
                  {/* НОВЫЕ КОЛОНКИ ДЛЯ ЦЕНООБРАЗОВАНИЯ */}
                  <td className="col-leaseYears">
                    <div className="lease-years-display">
                      {ld.line.snapshot?.leaseTotalYears || 30} {t.years}
                    </div>
                  </td>
                  <td className="col-pricing">
                    <button 
                      className="btn small pricing-btn" 
                      onClick={() => {
                        // Показать модальное окно с графиком ценообразования для конкретной виллы
                        setSelectedVillaForPricing(ld.line);
                        setShowVillaPricingModal(true);
                      }}
                    >
                      📊 График
                    </button>
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

      {/* 3. KPI показатели */}
      <div className="card">
        <div className="row" style={{justifyContent: 'space-between', alignItems: 'baseline'}}>
          <div className="row">
            <span className="badge">{t.lines}: {lines.length}</span>
            <span className="badge">{t.keys} {handoverMonth} {lang === 'ru' ? 'мес.' : 'mo.'}</span>
            <span className="badge">{lang === 'ru' ? 'Срок:' : 'Term:'} {months} {lang === 'ru' ? 'мес.' : 'mo.'}</span>
          </div>
          <div className="muted">{isClient ? t.client : t.editor}</div>
        </div>

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
          <div className="kpi">
            <div className="muted">{t.cleanLeaseholdTerm}</div>
            <div className="v">{totalLeaseholdTerm.years} {t.years} {totalLeaseholdTerm.months} {t.months}</div>
          </div>
        </div>
      </div>

      {/* 4. Базовая рассрочка */}
      <div className="card">
        <div className="stages-section">
          <h3>{t.stagesTitle}</h3>
          
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

      {/* 5. Сводный кэшфлоу по месяцам */}
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
                  <th>{t.rentalIncome}</th>
                  <th>{t.netPayment}</th>
                  <th>{t.remainingBalance}</th>
                </tr>
              </thead>
              <tbody>
                {project.cashflow.map(c => (
                  <tr key={c.month}>
                    <td>{formatMonth(c.month)}</td>
                    <td style={{textAlign: 'left'}}>{(c.items || []).join(' + ')}</td>
                    <td>{fmtMoney(c.amountUSD, currency)}</td>
                    <td>{fmtMoney(c.rentalIncome || 0, currency)}</td>
                    <td className={c.netPayment >= 0 ? 'positive' : 'negative'}>
                      {fmtMoney(c.netPayment || 0, currency)}
                    </td>
                    <td>{fmtMoney(c.balanceUSD, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. График общей доходности от сдачи в аренду */}
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

      {/* 7. Каталог проектов и вилл (только для редактора) */}
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

      {/* ===== НОВЫЕ МОДАЛЬНЫЕ ОКНА ДЛЯ ЦЕНООБРАЗОВАНИЯ ===== */}
      
      {/* Модальное окно конфигурации ценообразования */}
      {showPricingConfigModal && (
        <PricingConfigModal 
          config={pricingConfig}
          onSave={savePricingConfig}
          onReset={resetPricingConfig}
          onClose={() => setShowPricingConfigModal(false)}
          t={t}
          lang={lang}
        />
      )}

      {/* Модальное окно графика ценообразования для конкретной виллы */}
      {showVillaPricingModal && selectedVillaForPricing && (
        <VillaPricingModal 
          villa={selectedVillaForPricing}
          pricingConfig={pricingConfig}
          onClose={() => {
            setShowVillaPricingModal(false);
            setSelectedVillaForPricing(null);
          }}
          t={t}
          lang={lang}
          fmtMoney={fmtMoney}
        />
      )}

      {/* Существующие модальные окна */}
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

      {/* Остальные модальные окна... */}
    </>
  );
}

// ===== НОВЫЕ КОМПОНЕНТЫ ДЛЯ ЦЕНООБРАЗОВАНИЯ =====

// Модальное окно конфигурации ценообразования
function PricingConfigModal({ config, onSave, onReset, onClose, t, lang }) {
  const [localConfig, setLocalConfig] = useState(config);

  const handleSave = () => {
    onSave(localConfig);
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_PRICING_CONFIG);
    onReset();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pricing-config-modal" onClick={e => e.stopPropagation()}>
        <h3>{t.pricingConfig}</h3>
        
        <div className="pricing-sections">
          {/* Инфляция */}
          <div className="pricing-section">
            <h4>{t.inflation}</h4>
            <div className="form-group">
              <label>{t.inflationRatePct}:</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                step="0.1" 
                value={localConfig.inflationRatePct} 
                onChange={e => setLocalConfig(prev => ({...prev, inflationRatePct: parseFloat(e.target.value) || 0}))}
                className="input"
              />
              <span className="unit">%</span>
            </div>
          </div>

          {/* Убывание ценности lease */}
          <div className="pricing-section">
            <h4>{t.leaseDecay}</h4>
            <div className="form-group">
              <label>{t.leaseAlpha}:</label>
              <input 
                type="number" 
                min="0.1" 
                max="5" 
                step="0.1" 
                value={localConfig.leaseAlpha} 
                onChange={e => setLocalConfig(prev => ({...prev, leaseAlpha: parseFloat(e.target.value) || 1}))}
                className="input"
              />
              <div className="hint">{t.leaseAlphaHint}</div>
            </div>
          </div>

          {/* Старение */}
          <div className="pricing-section">
            <h4>{t.aging}</h4>
            <div className="form-group">
              <label>{t.agingBeta}:</label>
              <input 
                type="number" 
                min="0" 
                max="0.2" 
                step="0.001" 
                value={localConfig.agingBeta} 
                onChange={e => setLocalConfig(prev => ({...prev, agingBeta: parseFloat(e.target.value) || 0}))}
                className="input"
              />
              <div className="hint">{t.agingBetaHint}</div>
            </div>
          </div>

          {/* Бренд/популярность */}
          <div className="pricing-section">
            <h4>{t.brand}</h4>
            <div className="brand-params">
              <div className="form-group">
                <label>{t.brandPeak}:</label>
                <input 
                  type="number" 
                  min="1.0" 
                  max="1.5" 
                  step="0.01" 
                  value={localConfig.brandPeak} 
                  onChange={e => setLocalConfig(prev => ({...prev, brandPeak: parseFloat(e.target.value) || 1.2}))}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>{t.brandRampYears}:</label>
                <input 
                  type="number" 
                  min="0" 
                  step="1" 
                  value={localConfig.brandRampYears} 
                  onChange={e => setLocalConfig(prev => ({...prev, brandRampYears: parseInt(e.target.value) || 0}))}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>{t.brandPlateauYears}:</label>
                <input 
                  type="number" 
                  min="0" 
                  step="1" 
                  value={localConfig.brandPlateauYears} 
                  onChange={e => setLocalConfig(prev => ({...prev, brandPlateauYears: parseInt(e.target.value) || 0}))}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>{t.brandDecayYears}:</label>
                <input 
                  type="number" 
                  min="0" 
                  step="1" 
                  value={localConfig.brandDecayYears} 
                  onChange={e => setLocalConfig(prev => ({...prev, brandDecayYears: parseInt(e.target.value) || 0}))}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>{t.brandTail}:</label>
                <input 
                  type="number" 
                  min="0.8" 
                  max="1.2" 
                  step="0.01" 
                  value={localConfig.brandTail} 
                  onChange={e => setLocalConfig(prev => ({...prev, brandTail: parseFloat(e.target.value) || 1.0}))}
                  className="input"
                />
              </div>
            </div>
            
            {/* Мини-график профиля BrandFactor */}
            <div className="brand-factor-preview">
              <h5>Профиль BrandFactor(t):</h5>
              <div className="brand-factor-chart">
                {/* Здесь будет мини-график */}
                <div className="brand-factor-info">
                  <div>Рост: 1.0 → {localConfig.brandPeak} за {localConfig.brandRampYears} лет</div>
                  <div>Плато: {localConfig.brandPeak} за {localConfig.brandPlateauYears} лет</div>
                  <div>Спад: {localConfig.brandPeak} → {localConfig.brandTail} за {localConfig.brandDecayYears} лет</div>
                  <div>Хвост: {localConfig.brandTail}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={handleSave} className="btn primary">{t.saveConfig}</button>
          <button onClick={handleReset} className="btn">{t.resetToDefault}</button>
          <button onClick={onClose} className="btn">{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}

// Модальное окно графика ценообразования для конкретной виллы
function VillaPricingModal({ villa, pricingConfig, onClose, t, lang, fmtMoney }) {
  const [selectedYear, setSelectedYear] = useState(0);
  
  // Генерация данных для графика
  const chartData = useMemo(() => {
    return generatePricingChartData(villa, pricingConfig);
  }, [villa, pricingConfig]);

  // Нахождение максимальной цены для масштабирования графика
  const maxPrice = useMemo(() => {
    return Math.max(...chartData.map(d => Math.max(d.marketPrice, d.finalPrice)));
  }, [chartData]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content villa-pricing-modal" onClick={e => e.stopPropagation()}>
        <h3>Ценообразование: {villa.snapshot?.name}</h3>
        
        {/* Параметры расчёта (read-only) */}
        <div className="pricing-params-display">
          <h4>Параметры расчёта:</h4>
          <div className="params-grid">
            <div className="param-item">
              <span className="param-label">Инфляция:</span>
              <span className="param-value">g = {pricingConfig.inflationRatePct}%</span>
            </div>
            <div className="param-item">
              <span className="param-label">Старение:</span>
              <span className="param-value">β = {pricingConfig.agingBeta}</span>
            </div>
            <div className="param-item">
              <span className="param-label">Lease α:</span>
              <span className="param-value">α = {pricingConfig.leaseAlpha}</span>
            </div>
            <div className="param-item">
              <span className="param-label">Brand:</span>
              <span className="param-value">peak={pricingConfig.brandPeak}, ramp={pricingConfig.brandRampYears}, plateau={pricingConfig.brandPlateauYears}, decay={pricingConfig.brandDecayYears}, tail={pricingConfig.brandTail}</span>
            </div>
          </div>
        </div>

        {/* График ценообразования */}
        <div className="pricing-chart-section">
          <h4>График ценообразования:</h4>
          <div className="pricing-chart">
            <div className="chart-lines">
              {chartData.map((data, index) => (
                <div key={index} className="chart-line">
                  <div className="line-points">
                    <div 
                      className="point market-point" 
                      style={{
                        left: `${(data.year / Math.max(...chartData.map(d => d.year))) * 100}%`,
                        bottom: `${(data.marketPrice / maxPrice) * 100}%`
                      }}
                      title={`Год ${data.year}: Рыночная цена ${fmtMoney(data.marketPrice, 'USD')}`}
                    ></div>
                    <div 
                      className="point final-point" 
                      style={{
                        left: `${(data.year / Math.max(...chartData.map(d => d.year))) * 100}%`,
                        bottom: `${(data.finalPrice / maxPrice) * 100}%`
                      }}
                      title={`Год ${data.year}: Итоговая цена ${fmtMoney(data.finalPrice, 'USD')}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-axes">
              <div className="y-axis">
                <span>{fmtMoney(maxPrice, 'USD')}</span>
                <span>{fmtMoney(maxPrice * 0.5, 'USD')}</span>
                <span>$0</span>
              </div>
              <div className="x-axis">
                <span>0</span>
                <span>{Math.floor(chartData.length / 4)}</span>
                <span>{Math.floor(chartData.length / 2)}</span>
                <span>{Math.floor(chartData.length * 3 / 4)}</span>
                <span>{chartData.length - 1}</span>
              </div>
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color market-color"></div>
                <span>Рыночная цена (без износа/lease/бренда)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color final-color"></div>
                <span>Итоговая цена по формуле</span>
              </div>
            </div>
          </div>
        </div>

        {/* Таблица факторов */}
        <div className="pricing-table-section">
          <h4>Таблица факторов:</h4>
          <div className="pricing-table-scroll">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Год (t)</th>
                  <th>LeaseFactor</th>
                  <th>AgeFactor</th>
                  <th>BrandFactor</th>
                  <th>Price(t)</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((data, index) => (
                  <tr key={index} className={selectedYear === data.year ? 'selected-row' : ''}>
                    <td>{data.year}</td>
                    <td>{data.leaseFactor.toFixed(4)}</td>
                    <td>{data.ageFactor.toFixed(4)}</td>
                    <td>{data.brandFactor.toFixed(4)}</td>
                    <td className="price-cell">{fmtMoney(data.finalPrice, 'USD')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn">{t.close}</button>
        </div>
      </div>
    </div>
  );
}

// ===== КОМПОНЕНТ КАТАЛОГА =====
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
  // ... existing code ...
<｜tool▁call▁end｜><｜tool▁calls▁end｜>
  // ... existing code ...

// ===== КОМПОНЕНТ КАТАЛОГА =====
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
                    {/* НОВОЕ ПОЛЕ: Срок лизинга */}
                    <div className="detail-row">
                      <span className="label">Срок лизинга:</span>
                      <span className="value">{villa.leaseTotalYears || 30} {t.years}</span>
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
            
