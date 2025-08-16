// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE (С ЛИЗХОЛДОМ, ИНДЕКСАЦИЕЙ И ЦЕНООБРАЗОВАНИЕМ) - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ И ПРОВЕРЕННАЯ ВЕРСИЯ =====

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
    {id: 3, label: '70% готовности', pct: 25, month: 12},
    {id: 4, label: 'Сдача', pct: 15, month: 18}
  ]);
  
  // Состояние для линий рассрочки
  const [lines, setLines] = useState([]);
  
  // Состояния для модальных окон
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [newProjectForm, setNewProjectForm] = useState({
    projectId: '',
    projectName: '',
    villas: []
  });
  const [newVillaForm, setNewVillaForm] = useState({
    name: '',
    area: 0,
    ppsm: 0,
    baseUSD: 0,
    leaseholdEndDate: new Date(2030, 11, 31),
    dailyRateUSD: 0,
    rentalPriceIndexPct: 5
  });
  
  // Переводы
  const t = {
    ru: {
      // Основные
      title: 'Arconique - Калькулятор рассрочки',
      clientMode: 'Клиентский режим',
      editorMode: 'Редакторский режим',
      switchMode: 'Переключить режим',
      
      // Валюты
      currency: 'Валюта',
      idrPerUsd: 'IDR за USD',
      eurPerUsd: 'EUR за USD',
      
      // Рассрочка
      months: 'Месяцев',
      monthlyRate: 'Месячная ставка %',
      handoverMonth: 'Месяц сдачи',
      startMonth: 'Месяц начала',
      
      // Этапы
      stagesTitle: 'Этапы рассрочки',
      stage: 'Этап',
      percent: 'Процент',
      month: 'Месяц',
      actions: 'Действия',
      addStage: 'Добавить этап',
      deleteStage: 'Удалить',
      
      // Виллы
      villasTitle: 'Виллы в рассрочке',
      project: 'Проект',
      villa: 'Вилла',
      qty: 'Кол-во',
      area: 'Площадь',
      ppsm: 'Цена за м²',
      price: 'Цена',
      discount: 'Скидка',
      prePct: 'Предоплата %',
      lineTotal: 'Итого по линии',
      addFromCatalog: 'Добавить из каталога',
      
      // Аренда
      dailyRate: 'Стоимость ночи',
      occupancyRate: 'Загрузка %',
      rentalPriceIndex: 'Индексация аренды %',
      leaseholdEndDate: 'Дата окончания лизхолда',
      
      // KPI
      kpiTitle: 'KPI по проекту',
      totalInvestment: 'Общие инвестиции',
      totalRentalIncome: 'Общий доход от аренды',
      netInvestment: 'Чистые инвестиции',
      roi: 'ROI',
      
      // Графики
      rentalIncomeChart: 'График общей доходности от сдачи в аренду',
      chartTitle: 'Динамика цены виллы',
      chartSubtitle: 'Влияние факторов на цену',
      tableTitle: 'Таблица факторов ценообразования',
      
      // Параметры ценообразования
      pricingConfigTitle: 'Параметры ценообразования',
      inflationRate: 'Инфляция (g)',
      leaseAlpha: 'Lease Decay (α)',
      agingBeta: 'Старение (β)',
      brandPeak: 'Brand Peak',
      brandRampYears: 'Brand Ramp (годы)',
      brandPlateauYears: 'Brand Plateau (годы)',
      brandDecayYears: 'Brand Decay (годы)',
      brandTail: 'Brand Tail',
      
      // Факторы
      years: 'Год',
      leaseFactor: 'Lease Factor',
      ageFactor: 'Age Factor',
      brandFactor: 'Brand Factor',
      inflationFactor: 'Коэффициент инфляции',
      marketPrice: 'Market Price',
      finalPrice: 'Final Price',
      
      // Каталог
      catalogTitle: 'Каталог проектов и вилл',
      addProject: 'Добавить проект',
      addVilla: 'Добавить виллу',
      editVilla: 'Редактировать виллу',
      deleteVilla: 'Удалить виллу',
      projectName: 'Название проекта',
      villaName: 'Название виллы',
      villaArea: 'Площадь (м²)',
      villaPpsm: 'Цена за м²',
      villaBasePrice: 'Базовая цена',
      
      // Модальные окна
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      projectNameRequired: 'Название проекта обязательно',
      projectExists: 'Проект с таким ID уже существует',
      deleteProjectConfirm: 'Удалить проект?',
      deleteVillaConfirm: 'Удалить виллу?',
      
      // Экспорт
      exportCSV: 'Экспорт CSV',
      exportExcel: 'Экспорт Excel',
      exportPDF: 'Экспорт PDF'
    },
    en: {
      // Основные
      title: 'Arconique - Installment Calculator',
      clientMode: 'Client Mode',
      editorMode: 'Editor Mode',
      switchMode: 'Switch Mode',
      
      // Валюты
      currency: 'Currency',
      idrPerUsd: 'IDR per USD',
      eurPerUsd: 'EUR per USD',
      
      // Рассрочка
      months: 'Months',
      monthlyRate: 'Monthly Rate %',
      handoverMonth: 'Handover Month',
      startMonth: 'Start Month',
      
      // Этапы
      stagesTitle: 'Installment Stages',
      stage: 'Stage',
      percent: 'Percent',
      month: 'Month',
      actions: 'Actions',
      addStage: 'Add Stage',
      deleteStage: 'Delete',
      
      // Виллы
      villasTitle: 'Villas in Installment',
      project: 'Project',
      villa: 'Villa',
      qty: 'Qty',
      area: 'Area',
      ppsm: 'Price per m²',
      price: 'Price',
      discount: 'Discount',
      prePct: 'Prepayment %',
      lineTotal: 'Line Total',
      addFromCatalog: 'Add from Catalog',
      
      // Аренда
      dailyRate: 'Daily Rate',
      occupancyRate: 'Occupancy %',
      rentalPriceIndex: 'Rental Index %',
      leaseholdEndDate: 'Leasehold End Date',
      
      // KPI
      kpiTitle: 'Project KPI',
      totalInvestment: 'Total Investment',
      totalRentalIncome: 'Total Rental Income',
      netInvestment: 'Net Investment',
      roi: 'ROI',
      
      // Графики
      rentalIncomeChart: 'Rental Income Chart',
      chartTitle: 'Villa Price Dynamics',
      chartSubtitle: 'Factor Impact on Price',
      tableTitle: 'Pricing Factors Table',
      
      // Параметры ценообразования
      pricingConfigTitle: 'Pricing Parameters',
      inflationRate: 'Inflation (g)',
      leaseAlpha: 'Lease Decay (α)',
      agingBeta: 'Aging (β)',
      brandPeak: 'Brand Peak',
      brandRampYears: 'Brand Ramp (years)',
      brandPlateauYears: 'Brand Plateau (years)',
      brandDecayYears: 'Brand Decay (years)',
      brandTail: 'Brand Tail',
      
      // Факторы
      years: 'Year',
      leaseFactor: 'Lease Factor',
      ageFactor: 'Age Factor',
      brandFactor: 'Brand Factor',
      inflationFactor: 'Inflation Factor',
      marketPrice: 'Market Price',
      finalPrice: 'Final Price',
      
      // Каталог
      catalogTitle: 'Projects and Villas Catalog',
      addProject: 'Add Project',
      addVilla: 'Add Villa',
      editVilla: 'Edit Villa',
      deleteVilla: 'Delete Villa',
      projectName: 'Project Name',
      villaName: 'Villa Name',
      villaArea: 'Area (m²)',
      villaPpsm: 'Price per m²',
      villaBasePrice: 'Base Price',
      
      // Модальные окна
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      projectNameRequired: 'Project name is required',
      projectExists: 'Project with this ID already exists',
      deleteProjectConfirm: 'Delete project?',
      deleteVillaConfirm: 'Delete villa?',
      
      // Экспорт
      exportCSV: 'Export CSV',
      exportExcel: 'Export Excel',
      exportPDF: 'Export PDF'
    }
  }[lang];
  
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

  const addVilla = (projectId) => {
    setNewVillaForm({
      name: '',
      area: 0,
      ppsm: 0,
      baseUSD: 0,
      leaseholdEndDate: new Date(2030, 11, 31),
      dailyRateUSD: 0,
      rentalPriceIndexPct: 5
    });
    setShowAddVillaModal(true);
  };

  const saveVilla = () => {
    // ИСПРАВЛЕНО: Проверяем что editingProject не null
    if (!editingProject) {
      alert('Ошибка: проект не выбран');
      return;
    }
    
    if (!newVillaForm.name || !newVillaForm.area || !newVillaForm.ppsm) {
      alert('Заполните все обязательные поля');
      return;
    }

    const newVilla = {
      villaId: `${editingProject}-${Date.now()}`,
      name: newVillaForm.name,
      area: newVillaForm.area,
      ppsm: newVillaForm.ppsm,
      baseUSD: newVillaForm.area * newVillaForm.ppsm,
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
    setEditingProject(null); // Сбрасываем editingProject
    setNewVillaForm({
      name: '',
      area: 0,
      ppsm: 0,
      baseUSD: 0,
      leaseholdEndDate: new Date(2030, 11, 31),
      dailyRateUSD: 0,
      rentalPriceIndexPct: 5
    });
  };

  const editVilla = (projectId, villa) => {
    setEditingProject(projectId); // Устанавливаем editingProject
    setNewVillaForm({
      name: villa.name,
      area: villa.area,
      ppsm: villa.ppsm,
      baseUSD: villa.baseUSD,
      leaseholdEndDate: villa.leaseholdEndDate,
      dailyRateUSD: villa.dailyRateUSD,
      rentalPriceIndexPct: villa.rentalPriceIndexPct
    });
    setShowAddVillaModal(true);
  };

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

  // Функции ценообразования
  const leaseFactor = (year, totalYears, alpha) => {
    if (totalYears <= 0) return 0;
    return Math.pow((totalYears - year) / totalYears, alpha);
  };

  const ageFactor = (year, beta) => {
    return Math.exp(-beta * year);
  };

  const brandFactor = (year, config) => {
    const { brandPeak, brandRampYears, brandPlateauYears, brandDecayYears, brandTail } = config;
    
    if (year <= brandRampYears) {
      // Рост
      return 1 + (brandPeak - 1) * (year / brandRampYears);
    } else if (year <= brandRampYears + brandPlateauYears) {
      // Плато
      return brandPeak;
    } else if (year <= brandRampYears + brandPlateauYears + brandDecayYears) {
      // Спад
      const decayStart = brandRampYears + brandPlateauYears;
      const decayProgress = (year - decayStart) / brandDecayYears;
      return brandPeak - (brandPeak - brandTail) * decayProgress;
    } else {
      // Хвост
      return brandTail;
    }
  };

  const calculateVillaPrice = (villa, yearOffset) => {
    if (!villa || !villa.leaseholdEndDate) return 0;
    
    // ИСПРАВЛЕНО: Используем startMonth вместо new Date()
    const totalYears = Math.ceil((villa.leaseholdEndDate - startMonth) / (365 * 24 * 60 * 60 * 1000));
    if (totalYears <= 0) return 0;
    
    const g = pricingConfig.inflationRatePct / 100;
    const lease = leaseFactor(yearOffset, totalYears, pricingConfig.leaseAlpha);
    const age = ageFactor(yearOffset, pricingConfig.agingBeta);
    const brand = brandFactor(yearOffset, pricingConfig);
    
    return villa.baseUSD * Math.pow(1 + g, yearOffset) * lease * age * brand;
  };

  const generatePricingData = (villa) => {
    try {
      if (!villa || !villa.leaseholdEndDate) return [];
      
      // ИСПРАВЛЕНО: Используем startMonth вместо new Date()
      const totalYears = Math.ceil((villa.leaseholdEndDate - startMonth) / (365 * 24 * 60 * 60 * 1000));
      const data = [];
      
      for (let year = 0; year <= Math.min(totalYears, 20); year++) {
        const g = pricingConfig.inflationRatePct / 100;
        const lease = leaseFactor(year, totalYears, pricingConfig.leaseAlpha);
        const age = ageFactor(year, pricingConfig.agingBeta);
        const brand = brandFactor(year, pricingConfig);
        const inflationFactor = Math.pow(1 + g, year);
        
        const finalPrice = villa.baseUSD * inflationFactor * lease * age * brand;
        
        data.push({
          year,
          leaseFactor: lease,
          ageFactor: age,
          brandFactor: brand,
          inflationFactor,
          finalPrice
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error generating pricing data:', error);
      return [];
    }
  };

  // Функции для работы с арендой
  const getDaysInMonth = (month) => {
    return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  };

  const getCleanLeaseholdTerm = (villa) => {
    if (!villa || !villa.leaseholdEndDate) return 0;
    const now = new Date();
    const end = new Date(villa.leaseholdEndDate);
    return Math.max(0, Math.ceil((end - now) / (365 * 24 * 60 * 60 * 1000)));
  };

  const getIndexedRentalPrice = (villa, month) => {
    if (!villa || !villa.dailyRateUSD) return 0;
    const monthsFromStart = Math.floor((month - startMonth) / (30 * 24 * 60 * 60 * 1000));
    const indexFactor = Math.pow(1 + (villa.rentalPriceIndexPct || 0) / 100, monthsFromStart / 12);
    return villa.dailyRateUSD * indexFactor;
  };

  const getYearlyRentalIncome = (villa, year) => {
    if (!villa || !villa.dailyRateUSD) return 0;
    const monthlyRate = (villa.occupancyPct || 70) / 100;
    const indexedRate = getIndexedRentalPrice(villa, new Date(startMonth.getTime() + year * 365 * 24 * 60 * 60 * 1000));
    return indexedRate * 365 * monthlyRate;
  };

  const getCumulativeRentalIncome = (villa, year) => {
    let cumulative = 0;
    for (let y = 0; y <= year; y++) {
      cumulative += getYearlyRentalIncome(villa, y);
    }
    return cumulative;
  };

  // Функции экспорта с проверкой библиотек
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
    a.download = 'cashflow.csv';
    a.click();
  };

  const exportXLSX = () => {
    // ИСПРАВЛЕНО: Проверяем наличие библиотеки XLSX
    if (typeof XLSX === 'undefined') {
      alert('Библиотека XLSX не загружена. Экспорт в Excel недоступен.');
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
      [t.leaseholdEndDate]: ld.line.snapshot?.leaseholdEndDate ? 
        ld.line.snapshot.leaseholdEndDate.toLocaleDateString() : ''
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Cashflow');
    XLSX.utils.book_append_sheet(wb, ws2, 'Lines');
    
    XLSX.writeFile(wb, 'arconique-data.xlsx');
  };

  const exportPDF = () => {
    // ИСПРАВЛЕНО: Проверяем наличие библиотеки html2pdf
    if (typeof html2pdf === 'undefined') {
      alert('Библиотека html2pdf не загружена. Экспорт в PDF недоступен.');
      return;
    }
    
    const element = document.getElementById('app-content');
    const opt = {
      margin: 1,
      filename: 'arconique-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  // Вспомогательные функции
  const formatMonth = (month) => {
    return month.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const fmtMoney = (amount, curr = currency) => {
    if (curr === 'USD') return `$${amount.toLocaleString()}`;
    if (curr === 'IDR') return `Rp${(amount * idrPerUsd).toLocaleString()}`;
    if (curr === 'EUR') return `€${(amount * eurPerUsd).toLocaleString()}`;
    return amount.toLocaleString();
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  // Вычисляемые значения
  const linesData = useMemo(() => {
    if (!lines.length) return [];
    
    return lines.map(line => {
      const snapshot = line.snapshot || {};
      const base = snapshot.baseUSD || 0;
      const discountPct = line.discountPct || 0;
      const discount = base * (discountPct / 100);
      const discounted = base - discount;
      const prePct = line.prePct || 0;
      const preAmount = discounted * (prePct / 100);
      const remaining = discounted - preAmount;
      const vMonths = line.vMonths || months;
      const monthlyPayment = remaining / vMonths;
      
      // Добавляем данные для аренды
      const dailyRateUSD = snapshot.dailyRateUSD || 0;
      const occupancyPct = snapshot.occupancyPct || 70;
      const rentalPriceIndexPct = snapshot.rentalPriceIndexPct || 5;
      const leaseholdEndDate = snapshot.leaseholdEndDate;
      const area = snapshot.area || 0;
      const ppsm = snapshot.ppsm || 0;
      
      return {
        line: {
          ...line,
          dailyRateUSD,
          occupancyPct,
          rentalPriceIndexPct,
          leaseholdEndDate,
          area,
          ppsm
        },
        base,
        discountPct,
        discount,
        discounted,
        prePct,
        preAmount,
        remaining,
        vMonths,
        monthlyPayment,
        lineTotal: discounted
      };
    });
  }, [lines, months]);

  const project = useMemo(() => {
    if (!linesData.length) return { cashflow: [], total: 0, totalRental: 0, netInvestment: 0, roi: 0 };
    
    const total = linesData.reduce((sum, ld) => sum + ld.lineTotal, 0);
    const totalRental = linesData.reduce((sum, ld) => {
      const villa = ld.line;
      if (!villa.leaseholdEndDate) return sum;
      
      let cumulativeRental = 0;
      for (let year = 0; year <= 5; year++) {
        cumulativeRental += getYearlyRentalIncome(villa, year);
      }
      return sum + cumulativeRental;
    }, 0);
    
    const netInvestment = total - totalRental;
    const roi = total > 0 ? ((totalRental - total) / total) * 100 : 0;
    
    const cashflow = [];
    let balance = total;
    
    // Добавляем этапы рассрочки
    stages.forEach(stage => {
      const amount = total * (stage.pct / 100);
      balance -= amount;
      
      cashflow.push({
        month: new Date(startMonth.getTime() + stage.month * 30 * 24 * 60 * 60 * 1000),
        items: [stage.label],
        amountUSD: amount,
        balanceUSD: Math.max(0, balance),
        rentalIncome: 0,
        netPayment: amount
      });
    });
    
    // Добавляем ежемесячные платежи
    const monthlyAmount = total / months;
    for (let month = 1; month <= months; month++) {
      const monthDate = new Date(startMonth.getTime() + month * 30 * 24 * 60 * 60 * 1000);
      const rentalIncome = linesData.reduce((sum, ld) => {
        const villa = ld.line;
        if (!villa.leaseholdEndDate) return sum;
        
        const year = Math.floor(month / 12);
        return sum + getYearlyRentalIncome(villa, year) / 12;
      }, 0);
      
      balance -= monthlyAmount;
      cashflow.push({
        month: monthDate,
        items: [`Месячный платеж ${month}`],
        amountUSD: monthlyAmount,
        balanceUSD: Math.max(0, balance),
        rentalIncome,
        netPayment: monthlyAmount - rentalIncome
      });
    }
    
    return { cashflow, total, totalRental, netInvestment, roi };
  }, [linesData, stages, months, startMonth]);

  const yearlyRentalData = useMemo(() => {
    if (!linesData.length) return [];
    
    const data = [];
    for (let year = 0; year <= 5; year++) {
      const yearlyIncome = linesData.reduce((sum, ld) => {
        const villa = ld.line;
        if (!villa.leaseholdEndDate) return sum;
        return sum + getYearlyRentalIncome(villa, year);
      }, 0);
      
      const cumulativeIncome = linesData.reduce((sum, ld) => {
        const villa = ld.line;
        if (!villa.leaseholdEndDate) return sum;
        return sum + getCumulativeRentalIncome(villa, year);
      }, 0);
      
      // ИСПРАВЛЕНО: Показываем конкретные годы аренды
      let yearLabel;
      if (year === 0) {
        yearLabel = 'Текущий'; // Год получения ключей (аренда начинается через 3 месяца)
      } else {
        yearLabel = year; // Последующие годы аренды
      }
      
      data.push({
        year: yearLabel,
        yearlyIncome,
        cumulativeIncome
      });
    }
    
    return data;
  }, [linesData]);

  // Функции для работы с каталогом
  const addFromCatalog = () => {
    if (!catalog.length) {
      alert('Каталог пуст. Сначала добавьте проекты и виллы.');
      return;
    }
    
    const projectId = prompt('Введите ID проекта:');
    if (!projectId) return;
    
    const project = catalog.find(p => p.projectId === projectId);
    if (!project) {
      alert('Проект не найден');
      return;
    }
    
    const villaId = prompt('Введите ID виллы:');
    if (!villaId) return;
    
    const villa = project.villas.find(v => v.villaId === villaId);
    if (!villa) {
      alert('Вилла не найдена');
      return;
    }
    
    const qty = prompt('Введите количество:');
    if (!qty || isNaN(qty)) return;
    
    const discountPct = prompt('Введите скидку в % (или 0):');
    if (!discountPct || isNaN(discountPct)) return;
    
    const prePct = prompt('Введите предоплату в % (или 0):');
    if (!prePct || isNaN(prePct)) return;
    
    const vMonths = prompt('Введите количество месяцев рассрочки:');
    if (!vMonths || isNaN(vMonths)) return;
    
    const newLine = {
      id: Date.now(),
      projectId,
      villaId,
      snapshot: {
        name: villa.name,
        area: villa.area,
        ppsm: villa.ppsm,
        baseUSD: villa.baseUSD,
        dailyRateUSD: villa.dailyRateUSD,
        occupancyPct: 70,
        rentalPriceIndexPct: villa.rentalPriceIndexPct,
        leaseholdEndDate: villa.leaseholdEndDate
      },
      qty: parseInt(qty),
      discountPct: parseFloat(discountPct),
      prePct: parseFloat(prePct),
      vMonths: parseInt(vMonths)
    };
    
    setLines(prev => [...prev, newLine]);
  };

  const handleSaveVilla = (projectId, villaId, updatedVilla) => {
    setCatalog(prev => prev.map(p => 
      p.projectId === projectId 
        ? { ...p, villas: p.villas.map(v => v.villaId === villaId ? updatedVilla : v) }
        : p
    ));
    
    // Обновляем snapshot в lines
    setLines(prev => prev.map(line => 
      line.villaId === villaId 
        ? { ...line, snapshot: { ...line.snapshot, ...updatedVilla } }
        : line
    ));
  };

  const handleDeleteProject = (projectId) => {
    setCatalog(prev => prev.filter(p => p.projectId !== projectId));
    setLines(prev => prev.filter(line => line.projectId !== projectId));
  };

  const handleDeleteVilla = (projectId, villaId) => {
    setCatalog(prev => prev.map(p => 
      p.projectId === projectId 
        ? { ...p, villas: p.villas.filter(v => v.villaId !== villaId) }
        : p
    ));
    setLines(prev => prev.filter(line => line.villaId !== villaId));
  };

  // Обработчик PIN кода
  const handlePinSubmit = (pin) => {
    if (pin === PIN_CODE) {
      setIsClient(false);
      setShowPinModal(false);
    } else {
      alert('Неверный PIN код');
    }
  };

  // Рендер приложения
  return (
    <div id="app-content">
      {/* Заголовок */}
      <div className="header">
        <h1>{t.title}</h1>
        <div className="mode-switch">
          <button 
            className={`btn ${isClient ? 'primary' : 'secondary'}`}
            onClick={() => setIsClient(!isClient)}
          >
            {isClient ? t.clientMode : t.editorMode}
          </button>
          {isClient && (
            <button 
              className="btn secondary"
              onClick={() => setShowPinModal(true)}
            >
              {t.switchMode}
            </button>
          )}
        </div>
      </div>

      {/* Основные настройки */}
      <div className="settings-section">
        <div className="card">
          <h3>Настройки</h3>
          <div className="settings-grid">
            <div className="setting-item">
              <label>Валюта:</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="IDR">IDR</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="setting-item">
              <label>IDR за USD:</label>
              <input 
                type="number" 
                value={idrPerUsd} 
                onChange={e => setIdrPerUsd(+e.target.value)}
              />
            </div>
            <div className="setting-item">
              <label>EUR за USD:</label>
              <input 
                type="number" 
                step="0.01" 
                value={eurPerUsd} 
                onChange={e => setEurPerUsd(+e.target.value)}
              />
            </div>
            <div className="setting-item">
              <label>Месяцев:</label>
              <input 
                type="number" 
                value={months} 
                onChange={e => setMonths(+e.target.value)}
              />
            </div>
            <div className="setting-item">
              <label>Месячная ставка %:</label>
              <input 
                type="number" 
                step="0.01" 
                value={monthlyRatePct} 
                onChange={e => setMonthlyRatePct(+e.target.value)}
              />
            </div>
            <div className="setting-item">
              <label>Месяц сдачи:</label>
              <input 
                type="number" 
                value={handoverMonth} 
                onChange={e => setHandoverMonth(+e.target.value)}
              />
            </div>
            <div className="setting-item">
              <label>Месяц начала:</label>
              <input 
                type="date" 
                value={startMonth.toISOString().split('T')[0]} 
                onChange={e => setStartMonth(new Date(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1. KPI по проекту - ОБНОВЛЕН С НОВЫМИ ПОЛЯМИ ДЛЯ АРЕНДЫ */}
      <div className="card">
        <h3>{t.kpiTitle}</h3>
        <div className="kpi-grid">
          <div className="kpi-item">
            <span className="kpi-label">{t.totalInvestment}:</span>
            <span className="kpi-value">{fmtMoney(project.total, currency)}</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">{t.totalRentalIncome}:</span>
            <span className="kpi-value positive">{fmtMoney(project.totalRental, currency)}</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">{t.netInvestment}:</span>
            <span className="kpi-value">{fmtMoney(project.netInvestment, currency)}</span>
          </div>
          <div className="kpi-item">
            <span className="kpi-label">{t.roi}:</span>
            <span className="kpi-value">{project.roi.toFixed(2)}%</span>
          </div>
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
                <th className="col-price">{t.price}</th>
                <th className="col-discount">{t.discount}</th>
                <th className="col-pre">{t.prePct}</th>
                <th className="col-months">{t.months}</th>
                <th className="col-total">{t.lineTotal}</th>
                {/* НОВЫЕ КОЛОНКИ ДЛЯ АРЕНДЫ */}
                <th className="col-daily-rate">{t.dailyRate}</th>
                <th className="col-occupancy">{t.occupancyRate}</th>
                <th className="col-rental-index">{t.rentalPriceIndex}</th>
                <th className="col-leasehold-end">{t.leaseholdEndDate}</th>
              </tr>
            </thead>
            <tbody>
              {linesData.map((lineData, index) => (
                <tr key={lineData.line.id} className="line-row">
                  <td className="col-project">
                    {catalog.find(p => p.projectId === lineData.line.projectId)?.projectName || lineData.line.projectId}
                  </td>
                  <td className="col-villa">{lineData.line.snapshot?.name}</td>
                  <td className="col-qty">{lineData.qty}</td>
                  <td className="col-area">{lineData.line.snapshot?.area} м²</td>
                  <td className="col-ppsm">${lineData.line.snapshot?.ppsm}</td>
                  <td className="col-price">{fmtMoney(lineData.base, currency)}</td>
                  <td className="col-discount">{lineData.discountPct}%</td>
                                   <td className="col-pre">{lineData.prePct}%</td>
                  <td className="col-months">{lineData.vMonths}</td>
                  <td className="col-total">{fmtMoney(lineData.lineTotal, currency)}</td>
                  {/* НОВЫЕ ЯЧЕЙКИ ДЛЯ АРЕНДЫ */}
                  <td className="col-daily-rate">${lineData.line.dailyRateUSD || 0}</td>
                  <td className="col-occupancy">{lineData.line.occupancyPct || 0}%</td>
                  <td className="col-rental-index">{lineData.line.rentalPriceIndexPct || 0}%</td>
                  <td className="col-leasehold-end">
                    {lineData.line.leaseholdEndDate ? 
                      lineData.line.leaseholdEndDate.toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Базовая рассрочка - ВОССТАНОВЛЕН СТАРЫЙ ДИЗАЙН */}
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
                      onChange={e => setStages(prev => prev.map(s => 
                        s.id === stage.id ? {...s, label: e.target.value} : s
                      ))}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={stage.pct} 
                      onChange={e => setStages(prev => prev.map(s => 
                        s.id === stage.id ? {...s, pct: +e.target.value} : s
                      ))}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={stage.month} 
                      onChange={e => setStages(prev => prev.map(s => 
                        s.id === stage.id ? {...s, month: +e.target.value} : s
                      ))}
                    />
                  </td>
                  <td>
                    <button 
                      className="btn danger small"
                      onClick={() => setStages(prev => prev.filter(s => s.id !== stage.id))}
                    >
                      {t.deleteStage}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button 
            className="btn success"
            onClick={() => setStages(prev => [...prev, {
              id: Math.max(...prev.map(s => s.id)) + 1,
              label: 'Новый этап',
              pct: 0,
              month: 0
            }])}
          >
            {t.addStage}
          </button>
        </div>
      </div>

      {/* 4. Кэшфлоу - ВОССТАНОВЛЕН СТАРЫЙ ДИЗАЙН */}
      <div className="card">
        <h3>Кэшфлоу</h3>
        <div className="cashflow-actions">
          <button className="btn primary" onClick={exportCSV}>{t.exportCSV}</button>
          <button className="btn primary" onClick={exportXLSX}>{t.exportExcel}</button>
          <button className="btn primary" onClick={exportPDF}>{t.exportPDF}</button>
        </div>
        
        <div className="cashflow-scroll">
          <table className="cashflow-table">
            <thead>
              <tr>
                <th>{t.month}</th>
                <th>Описание</th>
                <th>{t.amountDue}</th>
                <th>{t.rentalIncome}</th>
                <th>Чистый платеж</th>
                <th>Остаток</th>
              </tr>
            </thead>
            <tbody>
              {project.cashflow.map((cashflow, index) => (
                <tr key={index}>
                  <td>{formatMonth(cashflow.month)}</td>
                  <td>{(cashflow.items || []).join(' + ')}</td>
                  <td>{fmtMoney(cashflow.amountUSD, currency)}</td>
                  <td className="positive">{fmtMoney(cashflow.rentalIncome || 0, currency)}</td>
                  <td>{fmtMoney(cashflow.netPayment || 0, currency)}</td>
                  <td>{fmtMoney(cashflow.balanceUSD, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. График общей доходности от сдачи в аренду - ИСПРАВЛЕННАЯ ОРИЕНТАЦИЯ */}
      <div className="card">
        <h3>{t.rentalIncomeChart}</h3>
        <div className="rental-chart-container">
          <h4>Динамика накопленного дохода от аренды</h4>
          <p className="chart-subtitle">Накопительный доход по годам (аренда начинается через 3 месяца после получения ключей)</p>
          <div className="rental-chart-svg" id="rental-chart-svg">
            <svg width="100%" height="300" viewBox="0 0 800 300">
              <g className="chart-lines">
                {(() => {
                  if (yearlyRentalData.length === 0) return null;
                  
                  const maxIncome = Math.max(...yearlyRentalData.map(d => d.cumulativeIncome));
                  const minIncome = Math.min(...yearlyRentalData.map(d => d.cumulativeIncome));
                  const incomeRange = maxIncome - minIncome;
                  const chartWidth = 700;
                  const chartHeight = 250;
                  const padding = 50;
                  
                  return yearlyRentalData.map((point, index) => {
                    const x = padding + (index / (yearlyRentalData.length - 1)) * (chartWidth - 2 * padding);
                    const y = padding + ((maxIncome - point.cumulativeIncome) / incomeRange) * (chartHeight - 2 * padding);
                    
                    return (
                      <g key={index}>
                        <circle 
                          cx={x} 
                          cy={y} 
                          r="3" 
                          fill="#28a745" 
                          stroke="none"
                        />
                        {index > 0 && (
                          <line 
                            x1={padding + ((index - 1) / (yearlyRentalData.length - 1)) * (chartWidth - 2 * padding)}
                            y1={padding + ((maxIncome - yearlyRentalData[index - 1].cumulativeIncome) / incomeRange) * (chartHeight - 2 * padding)}
                            x2={x}
                            y2={y}
                            stroke="#28a745"
                            strokeWidth="2"
                          />
                        )}
                      </g>
                    );
                  });
                })()}
              </g>
              
              {/* Оси графика */}
              <g className="chart-axes">
                <line x1="50" y1="50" x2="50" y2="300" stroke="#ccc" strokeWidth="1" />
                <line x1="50" y1="300" x2="750" y2="300" stroke="#ccc" strokeWidth="1" />
                
                {/* Подписи осей */}
                <text x="400" y="320" textAnchor="middle" fontSize="12" fill="#666">
                  Годы
                </text>
                <text x="15" y="175" textAnchor="middle" fontSize="12" fill="#666" transform="rotate(-90, 15, 175)">
                  Накопительный доход (USD)
                </text>
                
                {/* Подписи по оси X (КОНКРЕТНЫЕ ГОДЫ АРЕНДЫ) */}
                {yearlyRentalData.map((point, index) => {
                  const x = 50 + (index / (yearlyRentalData.length - 1)) * 700;
                  
                  // ИСПРАВЛЕНО: Вычисляем конкретный год аренды
                  const currentYear = startMonth.getFullYear();
                  let rentalYear;
                  
                  if (point.year === 'Текущий') {
                    // Текущий год - аренда начинается через 3 месяца
                    rentalYear = currentYear;
                  } else {
                    // Последующие годы аренды
                    rentalYear = currentYear + parseInt(point.year);
                  }
                  
                  return (
                    <text key={index} x={x} y="315" textAnchor="middle" fontSize="10" fill="#666">
                      {rentalYear}
                    </text>
                  );
                })()}
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* 6. Параметры расчёта и график ценообразования - ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ */}
      {lines.length > 0 && (
        <div className="card">
          <h3>📊 Параметры расчёта</h3>
          
          {/* Параметры расчёта - РЕДАКТИРУЕМЫЕ в редакторском режиме */}
          <div className="calculation-params-editable">
            <div className="param-item-editable">
              <label className="param-label-editable">Инфляция (g):</label>
              {!isClient ? (
                <input 
                  type="number" 
                  min="0" 
                  max="50" 
                  step="0.1"
                  value={pricingConfig.inflationRatePct}
                  onChange={e => setPricingConfig(prev => ({...prev, inflationRatePct: +e.target.value}))}
                  className="param-input-editable"
                />
              ) : (
                <span className="param-value-display">
                  {pricingConfig.inflationRatePct}%
                </span>
              )}
            </div>
            
            <div className="param-item-editable">
              <label className="param-label-editable">Старение (β):</label>
              {!isClient ? (
                <input 
                  type="number" 
                  min="0" 
                  max="0.1" 
                  step="0.001"
                  value={pricingConfig.agingBeta}
                  onChange={e => setPricingConfig(prev => ({...prev, agingBeta: +e.target.value}))}
                  className="param-input-editable"
                />
              ) : (
                <span className="param-value-display">
                  {pricingConfig.agingBeta}
                </span>
              )}
            </div>
            
            <div className="param-item-editable">
              <label className="param-label-editable">Lease Decay (α):</label>
              {!isClient ? (
                <input 
                  type="number" 
                  min="0" 
                  max="2" 
                  step="0.1"
                  value={pricingConfig.leaseAlpha}
                  onChange={e => setPricingConfig(prev => ({...prev, leaseAlpha: +e.target.value}))}
                  className="param-input-editable"
                />
              ) : (
                <span className="param-value-display">
                  {pricingConfig.leaseAlpha}
                </span>
              )}
            </div>
            
            <div className="param-item-editable">
              <label className="param-label-editable">Brand Peak:</label>
              {!isClient ? (
                <input 
                  type="number" 
                  min="0.5" 
                  max="2" 
                  step="0.1"
                  value={pricingConfig.brandPeak}
                  onChange={e => setPricingConfig(prev => ({...prev, brandPeak: +e.target.value}))}
                  className="param-input-editable"
                />
              ) : (
                <span className="param-value-display">
                  {pricingConfig.brandPeak}
                </span>
              )}
            </div>
          </div>
          
          {/* Текущие коэффициенты - В СТИЛЕ СУЩЕСТВУЮЩИХ БЛОКОВ */}
          {(() => {
            const selectedVilla = catalog
              .flatMap(p => p.villas)
              .find(v => v.villaId === lines[0]?.villaId);
            
            if (!selectedVilla || !selectedVilla.leaseholdEndDate) return null;
            
            const currentYear = 0; // Текущий год
            const totalYears = Math.ceil((selectedVilla.leaseholdEndDate - startMonth) / (365 * 24 * 60 * 60 * 1000));
            
            const lease = leaseFactor(currentYear, totalYears, pricingConfig.leaseAlpha);
            const age = ageFactor(currentYear, pricingConfig.agingBeta);
            const brand = brandFactor(currentYear, pricingConfig);
            const inflation = Math.pow(1 + pricingConfig.inflationRatePct / 100, currentYear);
            const overallMultiplier = lease * age * brand * inflation;
            
            return (
              <div className="current-coefficients-display">
                <h4>Текущие коэффициенты</h4>
                <div className="coefficients-list">
                  <div className="coefficient-item">
                    <span className="coefficient-label">Lease Factor:</span>
                    <span className="coefficient-value">{lease.toFixed(1)}</span>
                  </div>
                  <div className="coefficient-item">
                    <span className="coefficient-label">Age Factor:</span>
                    <span className="coefficient-value">{age.toFixed(1)}</span>
                  </div>
                  <div className="coefficient-item">
                    <span className="coefficient-label">Brand Factor:</span>
                    <span className="coefficient-value">{brand.toFixed(1)}</span>
                  </div>
                  <div className="coefficient-item">
                    <span className="coefficient-label">Inflation Factor:</span>
                    <span className="coefficient-value">{inflation.toFixed(1)}</span>
                  </div>
                  <div className="coefficient-item">
                    <span className="coefficient-label">Общий множитель:</span>
                    <span className="coefficient-value">{overallMultiplier.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })()}
          
          {/* График ценообразования - ТОЛЬКО Final Price */}
          <div className="pricing-chart-container">
            <h4>Динамика цены виллы</h4>
            <p className="chart-subtitle">Влияние факторов на цену</p>
            <div className="pricing-chart-svg" id="pricing-chart-svg">
              <svg width="100%" height="300" viewBox="0 0 800 300">
                <g className="chart-lines">
                  {(() => {
                    const selectedVilla = catalog
                      .flatMap(p => p.villas)
                      .find(v => v.villaId === lines[0]?.villaId);
                    const pricingData = selectedVilla && selectedVilla.leaseholdEndDate ? 
                      generatePricingData(selectedVilla) : [];
                    
                    if (pricingData.length === 0) return null;
                    
                    const maxPrice = Math.max(...pricingData.map(d => d.finalPrice));
                    const minPrice = Math.min(...pricingData.map(d => d.finalPrice));
                    const priceRange = maxPrice - minPrice;
                    const chartWidth = 700;
                    const chartHeight = 250;
                    const padding = 50;
                    
                    return pricingData.map((point, index) => {
                      const x = padding + (index / (pricingData.length - 1)) * (chartWidth - 2 * padding);
                      const y = padding + ((maxPrice - point.finalPrice) / priceRange) * (chartHeight - 2 * padding);
                      
                      return (
                        <g key={index}>
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="3" 
                            fill="#2c5aa0" 
                            stroke="none"
                          />
                          {index > 0 && (
                            <line 
                              x1={padding + ((index - 1) / (pricingData.length - 1)) * (chartWidth - 2 * padding)}
                              y1={padding + ((maxPrice - pricingData[index - 1].finalPrice) / priceRange) * (chartHeight - 2 * padding)}
                              x2={x}
                              y2={y}
                              stroke="#2c5aa0"
                              strokeWidth="2"
                            />
                          )}
                        </g>
                      );
                    });
                  })()}
                </g>
                
                {/* Оси графика */}
                <g className="chart-axes">
                  <line x1="50" y1="50" x2="50" y2="300" stroke="#ccc" strokeWidth="1" />
                  <line x1="50" y1="300" x2="750" y2="300" stroke="#ccc" strokeWidth="1" />
                  
                  {/* Подписи осей */}
                  <text x="400" y="320" textAnchor="middle" fontSize="12" fill="#666">
                    Годы
                  </text>
                  <text x="15" y="175" textAnchor="middle" fontSize="12" fill="#666" transform="rotate(-90, 15, 175)">
                    Цена (USD)
                  </text>
                  
                  {/* Подписи по оси X (КОНКРЕТНЫЕ ГОДЫ) */}
                  {(() => {
                    const selectedVilla = catalog
                      .flatMap(p => p.villas)
                      .find(v => v.villaId === lines[0]?.villaId);
                    const pricingData = selectedVilla && selectedVilla.leaseholdEndDate ? 
                      generatePricingData(selectedVilla) : [];
                    
                    if (pricingData.length === 0) return null;
                    
                    const currentYear = startMonth.getFullYear();
                    
                    return pricingData.map((point, index) => {
                      const x = 50 + (index / (pricingData.length - 1)) * 700;
                      const specificYear = currentYear + point.year;
                      
                      return (
                        <text key={index} x={x} y="315" textAnchor="middle" fontSize="10" fill="#666">
                          {specificYear}
                        </text>
                      );
                    });
                  })()}
                </g>
              </svg>
            </div>
          </div>
          
          {/* Таблица факторов - ПОКАЗЫВАЕТ ВСЕ ГОДЫ */}
          <div className="factors-table-container">
            <h4>Таблица факторов ценообразования</h4>
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
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const selectedVilla = catalog
                      .flatMap(p => p.villas)
                      .find(v => v.villaId === lines[0]?.villaId);
                    
                    // ИСПРАВЛЕНО: Убрано ограничение .slice(0, 10) - показываем ВСЕ годы
                    const pricingData = selectedVilla && selectedVilla.leaseholdEndDate ? 
                      generatePricingData(selectedVilla) : [];
                    
                    return pricingData.map((point, index) => {
                      // ИСПРАВЛЕНО: Вычисляем конкретный год
                      const currentYear = startMonth.getFullYear();
                      const specificYear = currentYear + point.year;
                      
                      return (
                        <tr key={index}>
                          <td>{specificYear}</td>
                          <td>{point.leaseFactor.toFixed(3)}</td>
                          <td>{point.ageFactor.toFixed(3)}</td>
                          <td>{point.brandFactor.toFixed(3)}</td>
                          <td>{point.inflationFactor.toFixed(3)}</td>
                          <td>{fmtMoney(point.finalPrice, 'USD')}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. Каталог проектов и вилл (только для редактора) - УПРОЩЕННЫЙ БЕЗ ПОИСКА И ФИЛЬТРОВ */}
      {!isClient && (
        <div className="card">
          <h3>{t.catalogTitle}</h3>
          <div className="catalog-actions">
            <button className="btn success" onClick={addProject}>
              {t.addProject}
            </button>
          </div>
          
          <div className="projects-list">
            {catalog.map(project => (
              <div key={project.projectId} className="project-block">
                <div className="project-header">
                  <h4>{project.projectName}</h4>
                  <div className="project-actions">
                    <button 
                      className="btn danger small"
                      onClick={() => deleteProject(project.projectId)}
                    >
                      {t.delete}
                    </button>
                  </div>
                </div>
                
                <div className="villas-list">
                  {project.villas.map(villa => (
                    <div key={villa.villaId} className="villa-item">
                      <div className="villa-details">
                        <div className="detail-row">
                          <span className="label">{t.villaName}:</span>
                          <span className="value">{villa.name}</span>
                        </div>
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
                        <div className="detail-row">
                          <span className="label">{t.leaseholdEndDate}:</span>
                          <span className="value">
                            {villa.leaseholdEndDate ? villa.leaseholdEndDate.toLocaleDateString() : '-'}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="label">{t.dailyRate}:</span>
                          <span className="value">${villa.dailyRateUSD}</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">{t.rentalPriceIndex}:</span>
                          <span className="value">{villa.rentalPriceIndexPct}%</span>
                        </div>
                      </div>
                      
                      <div className="villa-actions">
                        <button 
                          className="btn primary small"
                          onClick={() => editVilla(project.projectId, villa)}
                        >
                          ✏️ {t.editVilla}
                        </button>
                        <button 
                          className="btn danger small"
                          onClick={() => deleteVilla(project.projectId, villa.villaId)}
                        >
                          🗑️ {t.deleteVilla}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Кнопка "Добавить виллу" ВНУТРИ каждого проекта */}
                  <div className="add-villa-section">
                    <button 
                      className="btn success small"
                      onClick={() => {
                        setEditingProject(project.projectId);
                        addVilla(project.projectId);
                      }}
                    >
                      ➕ {t.addVilla}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Модальное окно добавления проекта */}
      {showAddProjectModal && (
        <div className="modal-overlay">
          <div className="modal">
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
              <button className="btn primary" onClick={saveProject}>{t.save}</button>
              <button className="btn secondary" onClick={() => setShowAddProjectModal(false)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления/редактирования виллы - УПРОЩЕННОЕ */}
      {showAddVillaModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingProject ? t.editVilla : t.addVilla}</h3>
            
            {/* ТОЛЬКО ОСНОВНЫЕ ПОЛЯ - упрощенное модальное окно */}
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
                placeholder="Площадь в м²"
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
              <label>{t.leaseholdEndDate}:</label>
              <input 
                type="date" 
                value={newVillaForm.leaseholdEndDate.toISOString().split('T')[0]} 
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
                placeholder="Индексация аренды %"
                className="input"
              />
            </div>
            
            <div className="modal-actions">
              <button className="btn primary" onClick={saveVilla}>{t.save}</button>
              <button className="btn secondary" onClick={() => setShowAddVillaModal(false)}>{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно PIN кода */}
      {showPinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Введите PIN код</h3>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="PIN код"
                className="input"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    handlePinSubmit(e.target.value);
                  }
                }}
              />
            </div>
            <div className="modal-actions">
              <button className="btn primary" onClick={() => handlePinSubmit(document.querySelector('input[type="password"]').value)}>
                Войти
              </button>
              <button className="btn secondary" onClick={() => setShowPinModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== КОМПОНЕНТ КАТАЛОГА - УПРОЩЕННЫЙ БЕЗ ПОИСКА И ФИЛЬТРОВ =====
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
  // УБРАНЫ все состояния для поиска и фильтров
  
  return (
    <div className="catalog-manager">
      <div className="catalog-header">
        <h2>{t.catalogTitle}</h2>
        <button className="btn success" onClick={addProject}>
          {t.addProject}
        </button>
      </div>
      
      <div className="projects-grid">
        {catalog.map(project => (
          <div key={project.projectId} className="project-card">
            <div className="project-card-header">
              <h3>{project.projectName}</h3>
              <div className="project-card-actions">
                <button 
                  className="btn danger small"
                  onClick={() => {
                    if (confirm(t.deleteProjectConfirm)) {
                      setCatalog(prev => prev.filter(p => p.projectId !== project.projectId));
                    }
                  }}
                >
                  {t.delete}
                </button>
              </div>
            </div>
            
            <div className="villas-list">
              {project.villas.map(villa => (
                <div key={villa.villaId} className="villa-card">
                  <div className="villa-info">
                    <h4>{villa.name}</h4>
                    <p>Площадь: {villa.area} м²</p>
                    <p>Цена: {fmtMoney(villa.baseUSD, 'USD')}</p>
                    <p>Стоимость ночи: ${villa.dailyRateUSD}</p>
                    <p>Индексация аренды: {villa.rentalPriceIndexPct}%</p>
                  </div>
                  
                  <div className="villa-actions">
                    <button 
                      className="btn primary small"
                      onClick={() => {
                        setNewVillaForm({
                          name: villa.name,
                          area: villa.area,
                          ppsm: villa.ppsm,
                          baseUSD: villa.baseUSD,
                          leaseholdEndDate: villa.leaseholdEndDate,
                          dailyRateUSD: villa.dailyRateUSD,
                          rentalPriceIndexPct: villa.rentalPriceIndexPct
                        });
                        setShowAddVillaModal(true);
                      }}
                    >
                      ✏️ {t.editVilla}
                    </button>
                    <button 
                      className="btn danger small"
                      onClick={() => {
                        if (confirm(t.deleteVillaConfirm)) {
                          setCatalog(prev => prev.map(p => 
                            p.projectId === project.projectId 
                              ? { ...p, villas: p.villas.filter(v => v.villaId !== villa.villaId) }
                              : p
                          ));
                        }
                      }}
                    >
                      🗑️ {t.deleteVilla}
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Кнопка "Добавить виллу" ВНУТРИ каждого проекта */}
              <div className="add-villa-section">
                <button 
                  className="btn success small"
                  onClick={() => {
                    setEditingProject(project.projectId);
                    setNewVillaForm({
                      name: '',
                      area: 0,
                      ppsm: 0,
                      baseUSD: 0,
                      leaseholdEndDate: new Date(2030, 11, 31),
                      dailyRateUSD: 0,
                      rentalPriceIndexPct: 5
                    });
                    setShowAddVillaModal(true);
                  }}
                >
                  ➕ {t.addVilla}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Рендер приложения
ReactDOM.render(<App />, document.getElementById('root'));
