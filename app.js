// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE (С ЛИЗХОЛДОМ, ИНДЕКСАЦИЕЙ И ЦЕНООБРАЗОВАНИЕМ) - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ =====

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
      dailyRateUSD: 150,
      occupancyPct: 75,
      rentalPriceIndexPct: 5,
      snapshot: {
        name: 'Enso 2BR', 
        area: 100, 
        ppsm: 2500, 
        baseUSD: 250000,
        leaseholdEndDate: new Date(2030, 11, 31)
      }
    }
  ]);
  
  // Состояние модальных окон
  const [showPinModal, setShowPinModal] = useState(false);
    // НОВЫЕ ФУНКЦИИ ЦЕНООБРАЗОВАНИЯ
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

  const calculateVillaPrice = (villa, yearOffset) => {
    try {
      if (!villa || !villa.leaseholdEndDate) return 0;
      
      const totalYears = Math.ceil((villa.leaseholdEndDate - new Date()) / (365 * 24 * 60 * 60 * 1000));
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

  const generatePricingData = (villa) => {
    try {
      if (!villa || !villa.leaseholdEndDate) return [];
      
      const totalYears = Math.ceil((villa.leaseholdEndDate - new Date()) / (365 * 24 * 60 * 60 * 1000));
      const data = [];
      
      for (let year = 0; year <= Math.min(totalYears, 20); year++) {
        const marketPrice = villa.baseUSD * Math.pow(1 + pricingConfig.inflationRatePct / 100, year);
        const finalPrice = calculateVillaPrice(villa, year);
        
        data.push({
          year,
          marketPrice,
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
    // Расчет проекта (ОБНОВЛЕН С НОВОЙ ЛОГИКОЙ АРЕНДЫ С ИНДЕКСАЦИЕЙ)
  const project = useMemo(() => {
    const totals = {
      baseUSD: (linesData || []).reduce((s, x) => s + x.base, 0),
      preUSD: (linesData || []).reduce((s, x) => s + x.preTotal, 0),
      finalUSD: (linesData || []).reduce((s, x) => s + x.lineTotal, 0),
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
    (linesData || []).forEach(line => {
      const { base, preTotal, lineTotal } = line;
      const { prePct, months, monthlyRatePct, firstPostUSD, discountPct } = line;
      
      // Pre-handover платежи
      push(0, base * prePct / 100, `${line.snapshot.name} - ${t.preHandover}`);
      
      // Post-handover платежи
      if (months && monthlyRatePct) {
        const postAmount = lineTotal - preTotal;
        const monthlyPayment = postAmount * monthlyRatePct / 100;
        
        for (let i = 1; i <= months; i++) {
          push(handoverMonth + i, monthlyPayment, `${line.snapshot.name} - ${t.monthlyPayment} ${i}`);
        }
      }
      
      // Первый post-handover платеж
      if (firstPostUSD > 0) {
        push(handoverMonth + 1, firstPostUSD, `${line.snapshot.name} - ${t.firstPostPayment}`);
      }
    });

    // Сортировка по месяцам
    const sortedMonths = Array.from(m.values()).sort((a, b) => a.month - b.month);
    
    return {
      totals,
      months: sortedMonths,
      // НОВОЕ: Прогноз арендного дохода на 5 лет
      rentalForecast: (() => {
        const forecast = [];
        for (let year = 1; year <= 5; year++) {
          let totalAnnualUSD = 0;
          (linesData || []).forEach(line => {
            const villa = catalog
              .flatMap(p => p.villas)
              .find(v => v.villaId === line.villaId);
            
            if (villa) {
              const dailyRate = villa.dailyRateUSD || 150;
              const occupancy = (line.occupancyPct || 75) / 100;
              const indexation = Math.pow(1 + (villa.rentalPriceIndexPct || 5) / 100, year);
              const annualIncome = dailyRate * occupancy * 365 * indexation;
              totalAnnualUSD += annualIncome;
            }
          });
          
          forecast.push({
            year,
            totalAnnualUSD,
            monthlyUSD: totalAnnualUSD / 12
          });
        }
        return forecast;
      })()
    };
  }, [linesData, stages, handoverMonth, catalog]);

  // Данные для линий (ОБНОВЛЕНО С НОВЫМИ ПОЛЯМИ)
  const linesData = useMemo(() => {
    return lines.map(line => {
      const villa = catalog
        .flatMap(p => p.villas)
        .find(v => v.villaId === line.villaId);
      
      if (!villa) return null;
      
      const base = villa.baseUSD * line.qty;
      const discount = base * line.discountPct / 100;
      const discountedBase = base - discount;
      
      const preTotal = discountedBase * line.prePct / 100;
      const postTotal = discountedBase - preTotal;
      
      let lineTotal = discountedBase;
      if (line.months && line.monthlyRatePct) {
        const interest = postTotal * line.monthlyRatePct / 100 * line.months;
        lineTotal += interest;
      }
      
      return {
        ...line,
        base: discountedBase,
        preTotal,
        postTotal,
        lineTotal,
        // НОВЫЕ ПОЛЯ ДЛЯ ОТОБРАЖЕНИЯ
        dailyRateUSD: villa.dailyRateUSD || 150,
        occupancyPct: line.occupancyPct || 75,
        rentalPriceIndexPct: villa.rentalPriceIndexPct || 5,
        leaseholdEndDate: villa.leaseholdEndDate,
        area: villa.area,
        ppsm: villa.ppsm
      };
    }).filter(Boolean);
  }, [lines, catalog]);
    // Модальные окна
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = useState(false);
  const [showVillaPricingModal, setShowVillaPricingModal] = useState(false);
  const [showPricingConfigModal, setShowPricingConfigModal] = useState(false);
  const [editingVilla, setEditingVilla] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  // Переводы
  const t = useMemo(() => ({
    // Основные
    title: lang === 'ru' ? 'Калькулятор рассрочки ARCONIQUE' : 'ARCONIQUE Installment Calculator',
    clientMode: lang === 'ru' ? 'Клиентский режим' : 'Client Mode',
    editorMode: lang === 'ru' ? 'Редакторский режим' : 'Editor Mode',
    switchMode: lang === 'ru' ? 'Переключить режим' : 'Switch Mode',
    
    // Глобальные параметры
    globalHandover: lang === 'ru' ? 'Месяц получения ключей' : 'Handover Month',
    globalTerm: lang === 'ru' ? 'Срок post-handover' : 'Post-handover Term',
    globalRate: lang === 'ru' ? 'Месячная ставка %' : 'Monthly Rate %',
    startMonth: lang === 'ru' ? 'Месяц начала' : 'Start Month',
    
    // Ценообразование
    pricingConfigTitle: lang === 'ru' ? 'Параметры ценообразования' : 'Pricing Configuration',
    inflationRate: lang === 'ru' ? 'Инфляция' : 'Inflation Rate',
    leaseAlpha: lang === 'ru' ? 'Lease Alpha' : 'Lease Alpha',
    agingBeta: lang === 'ru' ? 'Aging Beta' : 'Aging Beta',
    brandPeak: lang === 'ru' ? 'Пик бренда' : 'Brand Peak',
    brandRampYears: lang === 'ru' ? 'Годы роста' : 'Ramp Years',
    brandPlateauYears: lang === 'ru' ? 'Годы плато' : 'Plateau Years',
    brandDecayYears: lang === 'ru' ? 'Годы спада' : 'Decay Years',
    brandTail: lang === 'ru' ? 'Хвост' : 'Tail',
    
    // Расчеты
    calculationParams: lang === 'ru' ? 'Параметры расчёта' : 'Calculation Parameters',
    inflation: lang === 'ru' ? 'Инфляция' : 'Inflation',
    aging: lang === 'ru' ? 'Старение' : 'Aging',
    leaseDecay: lang === 'ru' ? 'Lease Decay' : 'Lease Decay',
    brandFactor: lang === 'ru' ? 'Brand Factor' : 'Brand Factor',
    years: lang === 'ru' ? 'Год' : 'Year',
    leaseFactor: lang === 'ru' ? 'Lease Factor' : 'Lease Factor',
    ageFactor: lang === 'ru' ? 'Age Factor' : 'Age Factor',
    brandFactorValue: lang === 'ru' ? 'Brand Factor' : 'Brand Factor',
    marketPrice: lang === 'ru' ? 'Market Price' : 'Market Price',
    finalPrice: lang === 'ru' ? 'Final Price' : 'Final Price',
    chartTitle: lang === 'ru' ? 'Динамика цены виллы' : 'Villa Price Dynamics',
    chartSubtitle: lang === 'ru' ? 'Влияние факторов на цену' : 'Price Factor Impact',
    tableTitle: lang === 'ru' ? 'Таблица факторов' : 'Factors Table',
    price: lang === 'ru' ? 'Цена' : 'Price',
    
    // Каталог
    catalogTitle: lang === 'ru' ? 'Каталог проектов и вилл' : 'Projects and Villas Catalog',
    addProject: lang === 'ru' ? 'Добавить проект' : 'Add Project',
    addVilla: lang === 'ru' ? 'Добавить виллу' : 'Add Villa',
    editVilla: lang === 'ru' ? 'Редактировать' : 'Edit',
    deleteVilla: lang === 'ru' ? 'Удалить' : 'Delete',
    projectName: lang === 'ru' ? 'Название проекта' : 'Project Name',
    villaName: lang === 'ru' ? 'Название виллы' : 'Villa Name',
    area: lang === 'ru' ? 'Площадь (м²)' : 'Area (m²)',
    ppsm: lang === 'ru' ? 'Цена за м²' : 'Price per m²',
    basePrice: lang === 'ru' ? 'Базовая цена' : 'Base Price',
    leaseholdEnd: lang === 'ru' ? 'Конец лизхолда' : 'Leasehold End',
    dailyRate: lang === 'ru' ? 'Дневная ставка' : 'Daily Rate',
    rentalIndex: lang === 'ru' ? 'Индексация аренды' : 'Rental Indexation',
    
    // Рассрочка
    installmentTitle: lang === 'ru' ? 'Рассрочка' : 'Installment',
    addLine: lang === 'ru' ? 'Добавить позицию' : 'Add Line',
    project: lang === 'ru' ? 'Проект' : 'Project',
    villa: lang === 'ru' ? 'Вилла' : 'Villa',
    quantity: lang === 'ru' ? 'Кол-во' : 'Qty',
    preHandover: lang === 'ru' ? 'Pre-handover %' : 'Pre-handover %',
    ownTerms: lang === 'ru' ? 'Свои условия' : 'Own Terms',
    postMonths: lang === 'ru' ? 'Месяцев post' : 'Post Months',
    postRate: lang === 'ru' ? 'Ставка post %' : 'Post Rate %',
    firstPostPayment: lang === 'ru' ? 'Первый post-платеж' : 'First Post Payment',
    discount: lang === 'ru' ? 'Скидка %' : 'Discount %',
    monthlyPayment: lang === 'ru' ? 'Месячный платеж' : 'Monthly Payment',
    
    // Кэшфлоу
    cashflowTitle: lang === 'ru' ? 'Кэшфлоу' : 'Cashflow',
    month: lang === 'ru' ? 'Месяц' : 'Month',
    description: lang === 'ru' ? 'Описание' : 'Description',
    amount: lang === 'ru' ? 'Сумма' : 'Amount',
    
    // Экспорт
    exportTitle: lang === 'ru' ? 'Экспорт' : 'Export',
    exportCSV: lang === 'ru' ? 'CSV' : 'CSV',
    exportExcel: lang === 'ru' ? 'Excel' : 'Excel',
    exportPDF: lang === 'ru' ? 'PDF' : 'PDF',
    
    // Общие
    save: lang === 'ru' ? 'Сохранить' : 'Save',
    cancel: lang === 'ru' ? 'Отмена' : 'Cancel',
    close: lang === 'ru' ? 'Закрыть' : 'Close',
    delete: lang === 'ru' ? 'Удалить' : 'Delete',
    edit: lang === 'ru' ? 'Редактировать' : 'Edit',
    add: lang === 'ru' ? 'Добавить' : 'Add',
    
    // Дополнительные
    addVillaFirst: lang === 'ru' ? 'Сначала добавьте виллу в каталог' : 'Add villa to catalog first',
    selectProjectFirst: lang === 'ru' ? 'Сначала выберите проект' : 'Select project first',
    occupancyPct: lang === 'ru' ? 'Загрузка %' : 'Occupancy %'
  }), [lang]);
    // Форматирование денег
  const fmtMoney = (amount, curr = currency) => {
    if (curr === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    } else if (curr === 'IDR') {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount * idrPerUsd);
    } else if (curr === 'EUR') {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount * eurPerUsd);
    }
    return amount.toFixed(2);
  };

  // Обработчики
  const handleAddLine = () => {
    if (lines.length === 0) {
      alert(t.addVillaFirst);
      return;
    }
    
    const nid = (lines[lines.length - 1]?.id || 0) + 1;
    const newLine = {
      id: nid,
      projectId: lines[0].projectId,
      villaId: lines[0].villaId,
      qty: 1,
      prePct: 70,
      ownTerms: false,
      months: null,
      monthlyRatePct: null,
      firstPostUSD: 0,
      discountPct: 0,
      dailyRateUSD: lines[0].dailyRateUSD || 150,
      occupancyPct: 75,
      rentalPriceIndexPct: lines[0].rentalPriceIndexPct || 5,
      snapshot: {
        name: lines[0].snapshot.name, 
        area: lines[0].snapshot.area, 
        ppsm: lines[0].snapshot.ppsm, 
        baseUSD: lines[0].snapshot.baseUSD,
        leaseholdEndDate: lines[0].snapshot.leaseholdEndDate
      }
    };
    setLines(prev => [...prev, newLine]);
  };

  const handleEditLine = (line) => {
    setEditingVilla(line);
    setShowAddVillaModal(true);
  };

  const handleDeleteLine = (lineId) => {
    setLines(prev => prev.filter(l => l.id !== lineId));
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setShowAddProjectModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowAddProjectModal(true);
  };

  const handleDeleteProject = (projectId) => {
    setCatalog(prev => prev.filter(p => p.projectId !== projectId));
    setLines(prev => prev.filter(l => !catalog.find(p => p.projectId === projectId)));
  };

  const handleAddVilla = (projectId) => {
    setEditingVilla(null);
    setShowAddVillaModal(true);
  };

  const handleEditVilla = (villa, projectId) => {
    setEditingVilla({ ...villa, projectId });
    setShowAddVillaModal(true);
  };

  const handleDeleteVilla = (villaId, projectId) => {
    setCatalog(prev => prev.map(p => 
      p.projectId === projectId 
        ? { ...p, villas: p.villas.filter(v => v.villaId !== villaId) }
        : p
    ));
    setLines(prev => prev.filter(l => l.villaId !== villaId));
  };

  const handleSaveProject = (projectData) => {
    if (editingProject) {
      setCatalog(prev => prev.map(p => 
        p.projectId === editingProject.projectId 
          ? { ...p, ...projectData }
          : p
      ));
    } else {
      const newProject = {
        projectId: 'project-' + Date.now(),
        ...projectData,
        villas: []
      };
      setCatalog(prev => [...prev, newProject]);
    }
    setShowAddProjectModal(false);
    setEditingProject(null);
  };

  const handleSaveVilla = (villaData) => {
    const projectId = editingVilla?.projectId || lines[0]?.projectId;
    if (!projectId) {
      alert(t.selectProjectFirst);
      return;
    }

    if (editingVilla) {
      setCatalog(prev => prev.map(p => 
        p.projectId === projectId 
          ? { ...p, villas: p.villas.map(v => 
              v.villaId === editingVilla.villaId 
                ? { ...v, ...villaData }
                : v
            )}
          : p
      ));
      
      // Обновляем lines если редактируем текущую виллу
      setLines(prev => prev.map(l => 
        l.villaId === editingVilla.villaId 
          ? { ...l, snapshot: { ...l.snapshot, ...villaData } }
          : l
      ));
    } else {
      const newVilla = {
        villaId: 'villa-' + Date.now(),
        ...villaData,
        leaseholdEndDate: new Date(villaData.leaseholdEndDate)
      };
      
      setCatalog(prev => prev.map(p => 
        p.projectId === projectId 
          ? { ...p, villas: [...p.villas, newVilla] }
          : p
      ));
    }
    setShowAddVillaModal(false);
    setEditingVilla(null);
  };
    // Экспорт
  const exportToCSV = () => {
    const csvContent = [
      ['Проект', 'Вилла', 'Кол-во', 'Базовая цена', 'Pre-handover', 'Post-handover', 'Итого'],
      ...linesData.map(line => [
        catalog.find(p => p.projectId === line.projectId)?.projectName || '',
        line.snapshot.name,
        line.qty,
        fmtMoney(line.base),
        fmtMoney(line.preTotal),
        fmtMoney(line.postTotal),
        fmtMoney(line.lineTotal)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arconique-installment.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    exportToCSV(); // Excel может открыть CSV
  };

  const exportToPDF = () => {
    const element = document.getElementById('app-content');
    if (!element) return;
    
    const opt = {
      margin: 1,
      filename: 'arconique-installment.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  // PIN проверка
  const handlePinSubmit = (pin) => {
    if (pin === PIN_CODE) {
      setIsClient(false);
      setShowPinModal(false);
    } else {
      alert('Неверный PIN!');
    }
  };

  // Рендеринг
  return (
    <div id="app-content" className="app">
      <header className="app-header">
        <h1>{t.title}</h1>
        <div className="header-controls">
          <button 
            className={`btn ${isClient ? 'secondary' : 'primary'}`}
            onClick={() => setIsClient(!isClient)}
          >
            {isClient ? t.clientMode : t.editorMode}
          </button>
          <button className="btn" onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}>
            {lang === 'ru' ? 'EN' : 'RU'}
          </button>
        </div>
      </header>

      {/* Глобальные параметры */}
      <div className="card">
        <h3>⚙️ {lang === 'ru' ? 'Глобальные параметры' : 'Global Parameters'}</h3>
        <div className="fields-grid">
          <div className="field">
            <label>{t.globalHandover}</label>
            <input 
              type="number" 
              min="1" 
              max="24" 
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
              placeholder="Месячная ставка %"
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
                {t.edit}
              </button>
            </div>
          </div>
          
          <div className="pricing-grid-compact">
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.inflationRate}:</label>
              <input 
                className="pricing-input" 
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
            
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.leaseAlpha}:</label>
              <input 
                className="pricing-input" 
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
            </div>
            
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.agingBeta}:</label>
              <input 
                className="pricing-input" 
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
            </div>
            
            <div className="pricing-section-compact">
              <label className="pricing-label">{t.brandPeak}:</label>
              <input 
                className="pricing-input" 
                type="number" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={pricingConfig.brandPeak} 
                onChange={e => setPricingConfig(prev => ({
                  ...prev,
                  brandPeak: parseFloat(e.target.value)
                }))}
              />
              <span className="unit">множитель</span>
            </div>
          </div>
        </div>
      )}

      {/* Каталог проектов и вилл */}
      <div className="card">
        <div className="card-header">
          <h3>🏗️ {t.catalogTitle}</h3>
          <div className="card-actions">
            <button className="btn primary" onClick={handleAddProject}>
              {t.addProject}
            </button>
          </div>
        </div>
        
        {catalog.map(project => (
          <div key={project.projectId} className="project-block">
            <div className="project-header">
              <h4>{project.projectName}</h4>
              <div className="project-actions">
                <button className="btn secondary" onClick={() => handleEditProject(project)}>
                  {t.edit}
                </button>
                <button className="btn danger" onClick={() => handleDeleteProject(project.projectId)}>
                  {t.delete}
                </button>
                <button className="btn primary" onClick={() => handleAddVilla(project.projectId)}>
                  {t.addVilla}
                </button>
              </div>
            </div>
            
            <div className="villas-grid">
              {project.villas.map(villa => (
                <div key={villa.villaId} className="villa-card">
                  <div className="villa-info">
                    <h5>{villa.name}</h5>
                    <div className="villa-details">
                      <span>{villa.area} м²</span>
                      <span>{fmtMoney(villa.ppsm)}/м²</span>
                      <span>{fmtMoney(villa.baseUSD)}</span>
                    </div>
                    <div className="villa-leasehold">
                      <span>Лизхолд: {villa.leaseholdEndDate.toLocaleDateString()}</span>
                      <span>Аренда: ${villa.dailyRateUSD}/день</span>
                      <span>Индексация: {villa.rentalPriceIndexPct}%/год</span>
                    </div>
                  </div>
                  <div className="villa-actions">
                    <button className="btn secondary" onClick={() => handleEditVilla(villa, project.projectId)}>
                      {t.editVilla}
                    </button>
                    <button className="btn danger" onClick={() => handleDeleteVilla(villa.villaId, project.projectId)}>
                      {t.deleteVilla}
                    </button>
                    <button className="btn primary" onClick={() => setShowVillaPricingModal(true)}>
                      📊 Ценообразование
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Рассрочка */}
      <div className="card">
        <div className="card-header">
          <h3>💳 {t.installmentTitle}</h3>
          <div className="card-actions">
            <button className="btn primary" onClick={handleAddLine}>
              {t.addLine}
            </button>
          </div>
        </div>
        
        {lines.length === 0 ? (
          <div className="empty-state">
            <p>{t.addVillaFirst}</p>
          </div>
        ) : (
          <div className="lines-table-wrapper">
            <table className="lines-table">
              <thead>
                <tr>
                  <th>{t.project}</th>
                  <th>{t.villa}</th>
                  <th>{t.quantity}</th>
                  <th>{t.preHandover}</th>
                  <th>{t.ownTerms}</th>
                  <th>{t.postMonths}</th>
                  <th>{t.postRate}</th>
                  <th>{t.firstPostPayment}</th>
                  <th>{t.discount}</th>
                  <th>{t.basePrice}</th>
                  <th>{t.area}</th>
                  <th>{t.ppsm}</th>
                  <th>{t.dailyRate}</th>
                  <th>{t.occupancyPct}</th>
                  <th>{t.rentalIndex}</th>
                  <th>{t.leaseholdEnd}</th>
                  <th>Pre-total</th>
                  <th>Post-total</th>
                  <th>Итого</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {linesData.map(line => (
                  <tr key={line.id} className="line-row">
                    <td>{catalog.find(p => p.projectId === line.projectId)?.projectName}</td>
                    <td>{line.snapshot.name}</td>
                    <td>{line.qty}</td>
                    <td>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={line.prePct} 
                        onChange={e => setLines(prev => prev.map(l => 
                          l.id === line.id 
                            ? { ...l, prePct: +e.target.value }
                            : l
                        ))}
                      />
                    </td>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={line.ownTerms} 
                        onChange={e => setLines(prev => prev.map(l => 
                          l.id === line.id 
                            ? { ...l, ownTerms: e.target.checked }
                            : l
                        ))}
                      />
                    </td>
                    <td>
                      {line.ownTerms ? (
                        <input 
                          type="number" 
                          min="1" 
                          max="24" 
                          value={line.months || ''} 
                          onChange={e => setLines(prev => prev.map(l => 
                            l.id === line.id 
                              ? { ...l, months: +e.target.value }
                              : l
                          ))}
                        />
                      ) : (
                        <span>{months}</span>
                      )}
                    </td>
                    <td>
                      {line.ownTerms ? (
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          step="0.01" 
                          value={line.monthlyRatePct || ''} 
                          onChange={e => setLines(prev => prev.map(l => 
                            l.id === line.id 
                              ? { ...l, monthlyRatePct: +e.target.value }
                              : l
                          ))}
                        />
                      ) : (
                        <span>{monthlyRatePct}%</span>
                      )}
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="0" 
                        value={line.firstPostUSD} 
                        onChange={e => setLines(prev => prev.map(l => 
                          l.id === line.id 
                            ? { ...l, firstPostUSD: +e.target.value }
                            : l
                        ))}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        step="0.1" 
                        value={line.discountPct} 
                        onChange={e => setLines(prev => prev.map(l => 
                          l.id === line.id 
                            ? { ...l, discountPct: +e.target.value }
                            : l
                        ))}
                      />
                    </td>
                    <td>{fmtMoney(line.base)}</td>
                    <td>{line.area} м²</td>
                    <td>{fmtMoney(line.ppsm)}/м²</td>
                    <td>${line.dailyRateUSD}</td>
                    <td>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={line.occupancyPct} 
                        onChange={e => setLines(prev => prev.map(l => 
                          l.id === line.id 
                            ? { ...l, occupancyPct: +e.target.value }
                            : l
                        ))}
                      />
                    </td>
                    <td>{line.rentalPriceIndexPct}%</td>
                    <td>{line.leaseholdEndDate?.toLocaleDateString()}</td>
                    <td>{fmtMoney(line.preTotal)}</td>
                    <td>{fmtMoney(line.postTotal)}</td>
                    <td>{fmtMoney(line.lineTotal)}</td>
                    <td className="line-actions">
                      <button className="btn secondary" onClick={() => handleEditLine(line)}>
                        {t.edit}
                      </button>
                      <button className="btn danger" onClick={() => handleDeleteLine(line.id)}>
                        {t.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* НОВЫЙ БЛОК: Параметры расчёта и график ценообразования */}
      {lines.length > 0 && (
        <div className="card">
          <h3>📊 {t.calculationParams}</h3>
          
          {/* Параметры расчёта (read-only) */}
          <div className="calculation-params-compact">
            <div className="param-item-compact">
              <span className="param-label-compact">{t.inflation}:</span>
              <span className="param-value-compact">g = {pricingConfig.inflationRatePct}%/год</span>
            </div>
            <div className="param-item-compact">
              <span className="param-label-compact">{t.aging}:</span>
              <span className="param-value-compact">β = {pricingConfig.agingBeta}/год</span>
            </div>
            <div className="param-item-compact">
              <span className="param-label-compact">{t.leaseDecay}:</span>
              <span className="param-value-compact">α = {pricingConfig.leaseAlpha}</span>
            </div>
            <div className="param-item-compact">
              <span className="param-label-compact">{t.brandFactor}:</span>
              <span className="param-value-compact">Пик = {pricingConfig.brandPeak}x</span>
            </div>
          </div>
          
          {/* График ценообразования */}
          <div className="pricing-chart-container">
            <h4>{t.chartTitle}</h4>
            <p className="chart-subtitle">{t.chartSubtitle}</p>
            <div className="pricing-chart-svg" id="pricing-chart-svg">
              {/* SVG график будет здесь */}
              <svg width="100%" height="300" viewBox="0 0 800 300">
                <g className="chart-lines">
                  {(() => {
                    const selectedVilla = catalog
                      .flatMap(p => p.villas)
                      .find(v => v.villaId === lines[0]?.villaId);
                    const pricingData = selectedVilla && selectedVilla.leaseholdEndDate ? 
                      generatePricingData(selectedVilla) : [];
                    
                    if (pricingData.length === 0) return null;
                    
                    const maxPrice = Math.max(...pricingData.map(d => Math.max(d.marketPrice, d.finalPrice)));
                    const minPrice = Math.min(...pricingData.map(d => Math.min(d.marketPrice, d.finalPrice)));
                    const priceRange = maxPrice - minPrice;
                    
                    return (
                      <>
                        {/* Market Price линия */}
                        <polyline
                          className="chart-line"
                          points={pricingData.map((d, i) => 
                            `${50 + i * 35},${250 - ((d.marketPrice - minPrice) / priceRange) * 200}`
                          ).join(' ')}
                          fill="none"
                          stroke="#4CAF50"
                          strokeWidth="2"
                        />
                        {/* Final Price линия */}
                        <polyline
                          className="chart-line"
                          points={pricingData.map((d, i) => 
                            `${50 + i * 35},${250 - ((d.finalPrice - minPrice) / priceRange) * 200}`
                          ).join(' ')}
                          fill="none"
                          stroke="#2196F3"
                          strokeWidth="2"
                        />
                        {/* Точки */}
                        <g className="line-points">
                          {pricingData.map((d, i) => (
                            <g key={i}>
                              <circle
                                cx={50 + i * 35}
                                cy={250 - ((d.marketPrice - minPrice) / priceRange) * 200}
                                r="3"
                                fill="#4CAF50"
                              />
                              <circle
                                cx={50 + i * 35}
                                cy={250 - ((d.finalPrice - minPrice) / priceRange) * 200}
                                r="3"
                                fill="#2196F3"
                              />
                            </g>
                          ))}
                        </g>
                        {/* Оси */}
                        <g className="chart-axes">
                          <line className="y-axis" x1="50" y1="50" x2="50" y2="250" stroke="#666" strokeWidth="1"/>
                          <line className="x-axis" x1="50" y1="250" x2="750" y2="250" stroke="#666" strokeWidth="1"/>
                        </g>
                        {/* Легенда */}
                        <g className="chart-legend">
                          <rect x="600" y="20" width="15" height="15" fill="#4CAF50"/>
                          <text x="620" y="32" fontSize="12" fill="#333">{t.marketPrice}</text>
                          <rect x="600" y="40" width="15" height="15" fill="#2196F3"/>
                          <text x="620" y="52" fontSize="12" fill="#333">{t.finalPrice}</text>
                        </g>
                      </>
                    );
                  })()}
                </g>
              </svg>
            </div>
          </div>
          
          {/* Таблица факторов */}
          <div className="factors-table-container">
            <h4>{t.tableTitle}</h4>
            <div className="factors-table-scroll">
              <table className="factors-table">
                <thead>
                  <tr>
                    <th>{t.years}</th>
                    <th>{t.leaseFactor}</th>
                    <th>{t.ageFactor}</th>
                    <th>{t.brandFactorValue}</th>
                    <th>{t.marketPrice}</th>
                    <th>{t.finalPrice}</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const selectedVilla = catalog
                      .flatMap(p => p.villas)
                      .find(v => v.villaId === lines[0]?.villaId);
                    return selectedVilla && selectedVilla.leaseholdEndDate ? 
                      generatePricingData(selectedVilla).slice(0, 10).map((data, index) => (
                        <tr key={index}>
                          <td>{data.year}</td>
                          <td>{data.leaseFactor.toFixed(3)}</td>
                          <td>{data.ageFactor.toFixed(3)}</td>
                          <td>{data.brandFactor.toFixed(3)}</td>
                          <td className="price-cell">{fmtMoney(data.marketPrice)}</td>
                          <td className="price-cell">{fmtMoney(data.finalPrice)}</td>
                        </tr>
                      )) : null;
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Кэшфлоу */}
      {project.months.length > 0 && (
        <div className="card">
          <h3>💰 {t.cashflowTitle}</h3>
          <div className="cashflow-table-wrapper">
            <table className="cashflow-table">
              <thead>
                <tr>
                  <th>{t.month}</th>
                  <th>{t.description}</th>
                  <th>{t.amount}</th>
                </tr>
              </thead>
              <tbody>
                {project.months.map((month, index) => (
                  <tr key={index}>
                    <td>{month.month}</td>
                    <td>{month.items.join(', ')}</td>
                    <td>{fmtMoney(month.amountUSD)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Прогноз арендного дохода */}
      {project.rentalForecast && project.rentalForecast.length > 0 && (
        <div className="card">
          <h3>🏠 Прогноз арендного дохода (5 лет)</h3>
          <div className="rental-forecast-table-wrapper">
            <table className="rental-forecast-table">
              <thead>
                <tr>
                  <th>Год</th>
                  <th>Годовой доход</th>
                  <th>Месячный доход</th>
                </tr>
              </thead>
              <tbody>
                {project.rentalForecast.map((forecast, index) => (
                  <tr key={index}>
                    <td>{forecast.year}</td>
                    <td>{fmtMoney(forecast.totalAnnualUSD)}</td>
                    <td>{fmtMoney(forecast.monthlyUSD)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Экспорт */}
      <div className="card">
        <h3>�� {t.exportTitle}</h3>
        <div className="export-buttons">
          <button className="btn secondary" onClick={exportToCSV}>
            {t.exportCSV}
          </button>
          <button className="btn secondary" onClick={exportToExcel}>
            {t.exportExcel}
          </button>
          <button className="btn secondary" onClick={exportToPDF}>
            {t.exportPDF}
          </button>
        </div>
      </div>

      {/* Модальные окна */}
      {showPinModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Введите PIN для редакторского режима</h3>
            <input 
              type="password" 
              placeholder="PIN"
              onKeyPress={e => e.key === 'Enter' && handlePinSubmit(e.target.value)}
            />
            <div className="modal-actions">
              <button className="btn primary" onClick={() => handlePinSubmit(document.querySelector('input[type="password"]').value)}>
                Войти
              </button>
              <button className="btn" onClick={() => setShowPinModal(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showPricingConfigModal && (
        <div className="modal">
          <div className="modal-content pricing-config-modal">
            <h3>⚙️ {t.pricingConfigTitle}</h3>
            
            <div className="pricing-sections">
              <div className="pricing-section">
                <h4>Основные параметры</h4>
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
                  <div className="hint">Годовой рост стоимости недвижимости</div>
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

              <div className="pricing-section">
                <h4>Бренд-фактор</h4>
                <div className="brand-params">
                  <div className="form-group">
                    <label>{t.brandPeak}</label>
                    <input 
                      type="number" 
                      min="0.5" 
                      max="2" 
                      step="0.1" 
                      value={pricingConfig.brandPeak} 
                      onChange={e => setPricingConfig(prev => ({
                        ...prev,
                        brandPeak: parseFloat(e.target.value)
                      }))}
                    />
                    <span className="unit">множитель</span>
                  </div>

                  <div className="form-group">
                    <label>{t.brandRampYears}</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={pricingConfig.brandRampYears} 
                      onChange={e => setPricingConfig(prev => ({
                        ...prev,
                        brandRampYears: parseInt(e.target.value)
                      }))}
                    />
                    <span className="unit">годы</span>
                  </div>

                  <div className="form-group">
                    <label>{t.brandPlateauYears}</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={pricingConfig.brandPlateauYears} 
                      onChange={e => setPricingConfig(prev => ({
                        ...prev,
                        brandPlateauYears: parseInt(e.target.value)
                      }))}
                    />
                    <span className="unit">годы</span>
                  </div>

                  <div className="form-group">
                    <label>{t.brandDecayYears}</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="15" 
                      value={pricingConfig.brandDecayYears} 
                      onChange={e => setPricingConfig(prev => ({
                        ...prev,
                        brandDecayYears: parseInt(e.target.value)
                      }))}
                    />
                    <span className="unit">годы</span>
                  </div>

                  <div className="form-group">
                    <label>{t.brandTail}</label>
                    <input 
                      type="number" 
                      min="0.5" 
                      max="1.5" 
                      step="0.1" 
                      value={pricingConfig.brandTail} 
                      onChange={e => setPricingConfig(prev => ({
                        ...prev,
                        brandTail: parseFloat(e.target.value)
                      }))}
                    />
                    <span className="unit">множитель</span>
                  </div>
                </div>

                <div className="brand-factor-preview">
                  <h5>Предварительный просмотр бренд-фактора:</h5>
                  <div className="brand-factor-info">
                    <p>Рост: {pricingConfig.brandRampYears} лет до {pricingConfig.brandPeak}x</p>
                    <p>Плато: {pricingConfig.brandPlateauYears} лет</p>
                    <p>Спад: {pricingConfig.brandDecayYears} лет до {pricingConfig.brandTail}x</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn primary" onClick={() => setShowPricingConfigModal(false)}>
                {t.save}
              </button>
              <button className="btn" onClick={() => setShowPricingConfigModal(false)}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showVillaPricingModal && (
        <div className="modal">
          <div className="modal-content villa-pricing-modal">
            <h3>�� Ценообразование виллы</h3>
            
            {(() => {
              const selectedVilla = catalog
                .flatMap(p => p.villas)
                .find(v => v.villaId === lines[0]?.villaId);
              
              if (!selectedVilla) return <p>Вилла не выбрана</p>;
              
              const pricingData = generatePricingData(selectedVilla);
              
              return (
                <>
                  <div className="pricing-params-display">
                    <h4>Параметры виллы</h4>
                    <div className="params-grid">
                      <div className="param-item">
                        <span className="param-label">Название:</span>
                        <span className="param-value">{selectedVilla.name}</span>
                      </div>
                      <div className="param-item">
                        <span className="param-label">Базовая цена:</span>
                        <span className="param-value">{fmtMoney(selectedVilla.baseUSD)}</span>
                      </div>
                      <div className="param-item">
                        <span className="param-label">Площадь:</span>
                        <span className="param-value">{selectedVilla.area} м²</span>
                      </div>
                      <div className="param-item">
                        <span className="param-label">Цена за м²:</span>
                        <span className="param-value">{fmtMoney(selectedVilla.ppsm)}/м²</span>
                      </div>
                      <div className="param-item">
                        <span className="param-label">Конец лизхолда:</span>
                        <span className="param-value">{selectedVilla.leaseholdEndDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pricing-chart-section">
                    <h4>График динамики цены</h4>
                    <div className="pricing-chart">
                      <svg width="100%" height="300" viewBox="0 0 800 300">
                        <g className="chart-lines">
                          {pricingData.length > 0 && (() => {
                            const maxPrice = Math.max(...pricingData.map(d => Math.max(d.marketPrice, d.finalPrice)));
                            const minPrice = Math.min(...pricingData.map(d => Math.min(d.marketPrice, d.finalPrice)));
                            const priceRange = maxPrice - minPrice;
                            
                            return (
                              <>
                                <polyline
                                  className="chart-line"
                                  points={pricingData.map((d, i) => 
                                    `${50 + i * 35},${250 - ((d.marketPrice - minPrice) / priceRange) * 200}`
                                  ).join(' ')}
                                  fill="none"
                                  stroke="#4CAF50"
                                  strokeWidth="2"
                                />
                                <polyline
                                  className="chart-line"
                                  points={pricingData.map((d, i) => 
                                    `${50 + i * 35},${250 - ((d.finalPrice - minPrice) / priceRange) * 200}`
                                  ).join(' ')}
                                  fill="none"
                                  stroke="#2196F3"
                                  strokeWidth="2"
                                />
                                <g className="line-points">
                                  {pricingData.map((d, i) => (
                                    <g key={i}>
                                      <circle
                                        cx={50 + i * 35}
                                        cy={250 - ((d.marketPrice - minPrice) / priceRange) * 200}
                                        r="3"
                                        fill="#4CAF50"
                                      />
                                      <circle
                                        cx={50 + i * 35}
                                        cy={250 - ((d.finalPrice - minPrice) / priceRange) * 200}
                                        r="3"
                                        fill="#2196F3"
                                      />
                                    </g>
                                  ))}
                                </g>
                                <g className="chart-axes">
                                  <line className="y-axis" x1="50" y1="50" x2="50" y2="250" stroke="#666" strokeWidth="1"/>
                                  <line className="x-axis" x1="50" y1="250" x2="750" y2="250" stroke="#666" strokeWidth="1"/>
                                </g>
                                <g className="chart-legend">
                                  <rect x="600" y="20" width="15" height="15" fill="#4CAF50"/>
                                  <text x="620" y="32" fontSize="12" fill="#333">{t.marketPrice}</text>
                                  <rect x="600" y="40" width="15" height="15" fill="#2196F3"/>
                                  <text x="620" y="52" fontSize="12" fill="#333">{t.finalPrice}</text>
                                </g>
                              </>
                            );
                          })()}
                        </g>
                      </svg>
                    </div>
                  </div>

                  <div className="pricing-table-section">
                    <h4>Таблица факторов по годам</h4>
                    <div className="pricing-table-scroll">
                      <table className="pricing-table">
                        <thead>
                          <tr>
                            <th>{t.years}</th>
                            <th>{t.leaseFactor}</th>
                            <th>{t.ageFactor}</th>
                            <th>{t.brandFactorValue}</th>
                            <th>{t.marketPrice}</th>
                            <th>{t.finalPrice}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pricingData.slice(0, 15).map((data, index) => (
                            <tr key={index}>
                              <td>{data.year}</td>
                              <td>{data.leaseFactor.toFixed(3)}</td>
                              <td>{data.ageFactor.toFixed(3)}</td>
                              <td>{data.brandFactor.toFixed(3)}</td>
                              <td className="price-cell">{fmtMoney(data.marketPrice)}</td>
                              <td className="price-cell">{fmtMoney(data.finalPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()}

            <div className="modal-actions">
              <button className="btn" onClick={() => setShowVillaPricingModal(false)}>
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddProjectModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingProject ? 'Редактировать проект' : 'Добавить проект'}</h3>
            <div className="form-group">
              <label>{t.projectName}</label>
              <input 
                type="text" 
                value={editingProject?.projectName || ''} 
                onChange={e => setEditingProject(prev => ({ ...prev, projectName: e.target.value }))}
                placeholder="Название проекта"
              />
            </div>
            <div className="modal-actions">
              <button className="btn primary" onClick={() => handleSaveProject({ projectName: editingProject?.projectName || '' })}>
                {t.save}
              </button>
              <button className="btn" onClick={() => setShowAddProjectModal(false)}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddVillaModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingVilla ? 'Редактировать виллу' : 'Добавить виллу'}</h3>
            <div className="form-group">
              <label>{t.villaName}</label>
              <input 
                type="text" 
                value={editingVilla?.snapshot?.name || ''} 
                onChange={e => setEditingVilla(prev => ({ 
                  ...prev, 
                  snapshot: { ...prev?.snapshot, name: e.target.value }
                }))}
                placeholder="Название виллы"
              />
            </div>
            <div className="form-group">
              <label>{t.area}</label>
              <input 
                type="number" 
                min="1" 
                value={editingVilla?.snapshot?.area || ''} 
                onChange={e => setEditingVilla(prev => ({ 
                  ...prev, 
                  snapshot: { ...prev?.snapshot, area: +e.target.value }
                }))}
                placeholder="Площадь в м²"
              />
            </div>
            <div className="form-group">
              <label>{t.ppsm}</label>
              <input 
                type="number" 
                min="1" 
                value={editingVilla?.snapshot?.ppsm || ''} 
                onChange={e => setEditingVilla(prev => ({ 
                  ...prev, 
                  snapshot: { ...prev?.snapshot, ppsm: +e.target.value }
                }))}
                placeholder="Цена за м²"
              />
            </div>
            <div className="form-group">
              <label>{t.basePrice}</label>
              <input 
                type="number" 
                min="1" 
                value={editingVilla?.snapshot?.baseUSD || ''} 
                onChange={e => setEditingVilla(prev => ({ 
                  ...prev, 
                  snapshot: { ...prev?.snapshot, baseUSD: +e.target.value }
                }))}
                placeholder="Базовая цена в USD"
              />
            </div>
            <div className="form-group">
              <label>{t.leaseholdEnd}</label>
              <input 
                type="date" 
                value={editingVilla?.snapshot?.leaseholdEndDate?.toISOString().split('T')[0] || ''} 
                onChange={e => setEditingVilla(prev => ({ 
                  ...prev, 
                  snapshot: { ...prev?.snapshot, leaseholdEndDate: new Date(e.target.value) }
                }))}
              />
            </div>
            <div className="form-group">
              <label>{t.dailyRate}</label>
              <input 
                type="number" 
                min="1" 
                value={editingVilla?.dailyRateUSD || ''} 
                onChange={e => setEditingVilla(prev => ({ ...prev, dailyRateUSD: +e.target.value }))}
                placeholder="Дневная ставка аренды"
              />
            </div>
            <div className="form-group">
              <label>{t.rentalIndex}</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                step="0.1" 
                value={editingVilla?.rentalPriceIndexPct || ''} 
                onChange={e => setEditingVilla(prev => ({ ...prev, rentalPriceIndexPct: +e.target.value }))}
                placeholder="Индексация аренды %"
              />
            </div>
            <div className="modal-actions">
              <button className="btn primary" onClick={() => handleSaveVilla({
                name: editingVilla?.snapshot?.name || '',
                area: editingVilla?.snapshot?.area || 0,
                ppsm: editingVilla?.snapshot?.ppsm || 0,
                baseUSD: editingVilla?.snapshot?.baseUSD || 0,
                leaseholdEndDate: editingVilla?.snapshot?.leaseholdEndDate || new Date(),
                dailyRateUSD: editingVilla?.dailyRateUSD || 150,
                rentalPriceIndexPct: editingVilla?.rentalPriceIndexPct || 5
              })}>
                {t.save}
              </button>
              <button className="btn" onClick={() => setShowAddVillaModal(false)}>
                {t.cancel}
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
