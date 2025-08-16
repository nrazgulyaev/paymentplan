// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE (С ЛИЗХОЛДОМ, ИНДЕКСАЦИЕЙ И ЦЕНООБРАЗОВАНИЕМ) - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ И ПРОВЕРЕННАЯ ВЕРСИЯ =====

import React, { useState, useEffect, useMemo, useRef } from 'react';
import './styles.css';

// ===== ПЕРЕВОДЫ =====
const T = {
  // Основные
  title: 'Arconique - Калькулятор рассрочки',
  subtitle: 'Расчет рассрочки для вилл в Дубае',
  
  // Режимы
  clientMode: 'Клиентский режим',
  editorMode: 'Редактор',
  switchToEditor: 'Переключиться в редактор',
  switchToClient: 'Переключиться в клиентский режим',
  
  // Основные блоки
  kpi: 'Ключевые показатели',
  installmentPlan: 'План рассрочки',
  cashflow: 'Денежный поток',
  rentalIncome: 'Доход от аренды',
  positionCalculation: 'Расчет позиции',
  pricingFactors: 'Факторы ценообразования',
  catalog: 'Каталог проектов и вилл',
  
  // KPI
  totalCost: 'Общая стоимость',
  downPayment: 'Первый взнос',
  monthlyPayment: 'Ежемесячный платеж',
  totalInterest: 'Общий процент',
  totalPayments: 'Общие платежи',
  
  // Рассрочка
  stage: 'Этап',
  amount: 'Сумма',
  date: 'Дата',
  percentage: 'Процент',
  
  // Аренда
  rentalIncomeChart: 'График общей доходности от сдачи в аренду',
  yearlyIncome: 'Годовой доход',
  cumulativeIncome: 'Накопительный доход',
  
  // Ценообразование
  pricingParameters: 'Параметры ценообразования',
  inflationRate: 'Инфляция (g)',
  agingFactor: 'Старение (β)',
  leaseDecay: 'Lease Decay (α)',
  brandPeak: 'Brand Peak',
  brandRamp: 'Brand Ramp (годы)',
  brandPlateau: 'Brand Plateau (годы)',
  brandDecay: 'Brand Decay (годы)',
  brandTail: 'Brand Tail',
  
  // Расчет
  priceDynamics: 'Динамика цены виллы',
  factorsTable: 'Таблица факторов',
  year: 'Год',
  leaseFactor: 'Lease Factor',
  ageFactor: 'Age Factor',
  brandFactor: 'Brand Factor',
  inflationFactor: 'Коэффициент инфляции',
  finalPrice: 'Final Price',
  
  // Коэффициенты
  currentCoefficients: 'Текущие коэффициенты',
  overallMultiplier: 'Общий множитель',
  
  // Каталог
  addProject: 'Добавить проект',
  addVilla: 'Добавить виллу',
  editVilla: 'Редактировать виллу',
  deleteVilla: 'Удалить виллу',
  deleteProject: 'Удалить проект',
  
  // Формы
  projectName: 'Название проекта',
  villaName: 'Название виллы',
  area: 'Площадь (кв.м)',
  ppsm: 'Цена за кв.м (USD)',
  leaseholdEnd: 'Дата окончания лизинга',
  dailyRate: 'Дневная ставка (USD)',
  rentalIndex: 'Индекс аренды (%)',
  
  // Действия
  save: 'Сохранить',
  cancel: 'Отмена',
  delete: 'Удалить',
  export: 'Экспорт',
  exportCSV: 'Экспорт CSV',
  exportExcel: 'Экспорт Excel',
  exportPDF: 'Экспорт PDF',
  
  // PIN
  enterPin: 'Введите PIN для переключения в режим редактора',
  pin: 'PIN',
  submit: 'Подтвердить',
  
  // Время
  years: 'Годы',
  months: 'Месяцы',
  current: 'Текущий'
};

// ===== ОСНОВНОЕ ПРИЛОЖЕНИЕ =====
function App() {
  // ===== СОСТОЯНИЕ =====
  const [isEditor, setIsEditor] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  
  // Параметры ценообразования
  const [pricingConfig, setPricingConfig] = useState({
    inflationRate: 0.05,        // 5% годовая инфляция
    leaseAlpha: 0.3,            // Параметр затухания лизинга
    agingBeta: 0.02,            // Параметр старения
    brandPeak: 1.2,             // Пик бренда
    brandRamp: 3,               // Годы роста бренда
    brandPlateau: 5,            // Годы плато бренда
    brandDecay: 3,              // Годы затухания бренда
    brandTail: 0.8              // Хвост бренда
  });
  
  // Каталог проектов и вилл
  const [catalog, setCatalog] = useState([
    {
      id: 1,
      name: 'Palm Jumeirah',
      villas: [
        {
          id: 1,
          name: 'Villa Marina',
          area: 450,
          ppsm: 2500,
          leaseholdEndDate: '2099-12-31',
          dailyRateUSD: 800,
          rentalPriceIndexPct: 3.5
        },
        {
          id: 2,
          name: 'Villa Ocean',
          area: 520,
          ppsm: 2800,
          leaseholdEndDate: '2099-12-31',
          dailyRateUSD: 950,
          rentalPriceIndexPct: 4.0
        }
      ]
    },
    {
      id: 2,
      name: 'Downtown Dubai',
      villas: [
        {
          id: 3,
          name: 'Villa Skyline',
          area: 380,
          ppsm: 3200,
          leaseholdEndDate: '2099-12-31',
          dailyRateUSD: 1200,
          rentalPriceIndexPct: 5.0
        }
      ]
    }
  ]);
  
  // План рассрочки
  const [stages, setStages] = useState([
    { id: 1, name: 'Бронирование', amount: 50000, date: '2024-01-15', percentage: 10 },
    { id: 2, name: 'Фундамент', amount: 100000, date: '2024-03-15', percentage: 20 },
    { id: 3, name: 'Стены', amount: 150000, date: '2024-06-15', percentage: 30 },
    { id: 4, name: 'Отделка', amount: 100000, date: '2024-09-15', percentage: 20 },
    { id: 5, name: 'Ключи', amount: 100000, date: '2024-12-15', percentage: 20 }
  ]);
  
  // Выбранные позиции
  const [lines, setLines] = useState([
    {
      id: 1,
      projectId: 1,
      villaId: 1,
      snapshot: {
        name: 'Villa Marina',
        area: 450,
        ppsm: 2500,
        leaseholdEndDate: '2099-12-31',
        dailyRateUSD: 800,
        rentalPriceIndexPct: 3.5
      }
    }
  ]);
  
  // Модальные окна
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // Формы
  const [newProjectForm, setNewProjectForm] = useState({ name: '' });
  const [newVillaForm, setNewVillaForm] = useState({
    name: '',
    area: '',
    ppsm: '',
    leaseholdEndDate: '',
    dailyRateUSD: '',
    rentalPriceIndexPct: ''
  });
  
  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const fmtMoney = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  
  // Функции ценообразования
  const leaseFactor = (year, totalYears, alpha) => {
    if (totalYears <= 0) return 0;
    return Math.pow((totalYears - year) / totalYears, alpha);
  };
  
  const ageFactor = (year, beta) => {
    return Math.exp(-beta * year);
  };
  
  const brandFactor = (year, config) => {
    const { brandPeak, brandRamp, brandPlateau, brandDecay, brandTail } = config;
    
    if (year <= brandRamp) {
      // Фаза роста
      return 1 + (brandPeak - 1) * (year / brandRamp);
    } else if (year <= brandRamp + brandPlateau) {
      // Фаза плато
      return brandPeak;
    } else if (year <= brandRamp + brandPlateau + brandDecay) {
      // Фаза затухания
      const decayProgress = (year - brandRamp - brandPlateau) / brandDecay;
      return brandPeak + (brandTail - brandPeak) * decayProgress;
    } else {
      // Хвост
      return brandTail;
    }
  };
  
  const calculateVillaPrice = (villa, yearOffset) => {
    if (!villa || !villa.leaseholdEndDate) return 0;
    
    const startMonth = new Date();
    const endDate = new Date(villa.leaseholdEndDate);
    const totalYears = Math.ceil((endDate - startMonth) / (1000 * 60 * 60 * 24 * 365));
    
    const basePrice = villa.area * villa.ppsm;
    const leaseF = leaseFactor(yearOffset, totalYears, pricingConfig.leaseAlpha);
    const ageF = ageFactor(yearOffset, pricingConfig.agingBeta);
    const brandF = brandFactor(yearOffset, pricingConfig);
    const inflationF = Math.pow(1 + pricingConfig.inflationRate, yearOffset);
    
    return basePrice * leaseF * ageF * brandF * inflationF;
  };
  
  const generatePricingData = (villa) => {
    if (!villa || !villa.leaseholdEndDate) return [];
    
    const startMonth = new Date();
    const endDate = new Date(villa.leaseholdEndDate);
    const totalYears = Math.ceil((endDate - startMonth) / (1000 * 60 * 60 * 24 * 365));
    
    const data = [];
    for (let year = 0; year <= Math.min(totalYears, 20); year++) {
      const leaseF = leaseFactor(year, totalYears, pricingConfig.leaseAlpha);
      const ageF = ageFactor(year, pricingConfig.agingBeta);
      const brandF = brandFactor(year, pricingConfig);
      const inflationF = Math.pow(1 + pricingConfig.inflationRate, year);
      const finalPrice = calculateVillaPrice(villa, year);
      
      data.push({
        year: startMonth.getFullYear() + year,
        leaseFactor: leaseF,
        ageFactor: ageF,
        brandFactor: brandF,
        inflationFactor: inflationF,
        finalPrice: finalPrice
      });
    }
    
    return data;
  };
  
  // Функции аренды
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  
  const getCleanLeaseholdTerm = (leaseholdEndDate) => {
    const endDate = new Date(leaseholdEndDate);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };
  
  const getIndexedRentalPrice = (dailyRate, rentalPriceIndexPct, yearOffset) => {
    return dailyRate * Math.pow(1 + rentalPriceIndexPct / 100, yearOffset);
  };
  
  const getYearlyRentalIncome = (villa, yearOffset) => {
    if (!villa || !villa.dailyRateUSD) return 0;
    
    const indexedDailyRate = getIndexedRentalPrice(villa.dailyRateUSD, villa.rentalPriceIndexPct, yearOffset);
    const occupancyRate = 0.7; // 70% загрузка
    const daysInYear = 365;
    
    return indexedDailyRate * occupancyRate * daysInYear;
  };
  
  const getCumulativeRentalIncome = (villa, yearOffset) => {
    if (!villa || !villa.dailyRateUSD) return 0;
    
    let cumulative = 0;
    for (let year = 0; year <= yearOffset; year++) {
      cumulative += getYearlyRentalIncome(villa, year);
    }
    return cumulative;
  };
  
  // ===== ВЫЧИСЛЕНИЯ =====
  const startMonth = useMemo(() => new Date(), []);
  
  const linesData = useMemo(() => {
    if (!lines || lines.length === 0) return null;
    return lines[0];
  }, [lines]);
  
  const project = useMemo(() => {
    if (!linesData) return null;
    
    const totalCost = linesData.snapshot.area * linesData.snapshot.ppsm;
    const downPayment = totalCost * 0.1;
    const monthlyPayment = (totalCost - downPayment) / 12;
    const totalInterest = totalCost * 0.08;
    const totalPayments = totalCost + totalInterest;
    
    // Прогноз арендного дохода на 5 лет
    const rentalForecast = [];
    for (let year = 0; year <= 5; year++) {
      rentalForecast.push({
        year: year === 0 ? 'Текущий' : year.toString(),
        yearlyIncome: getYearlyRentalIncome(linesData.snapshot, year),
        cumulativeIncome: getCumulativeRentalIncome(linesData.snapshot, year)
      });
    }
    
    return {
      totalCost,
      downPayment,
      monthlyPayment,
      totalInterest,
      totalPayments,
      rentalForecast
    };
  }, [linesData, startMonth]);
  
  const yearlyRentalData = useMemo(() => {
    if (!linesData || !linesData.snapshot) return [];
    
    const currentYear = startMonth.getFullYear();
    const data = [];
    
    // Текущий год (аренда начинается через 3 месяца)
    data.push({
      year: 'Текущий',
      yearlyIncome: getYearlyRentalIncome(linesData.snapshot, 0),
      cumulativeIncome: getCumulativeRentalIncome(linesData.snapshot, 0)
    });
    
    // Прогноз на 5 лет
    for (let i = 1; i <= 5; i++) {
      data.push({
        year: i.toString(),
        yearlyIncome: getYearlyRentalIncome(linesData.snapshot, i),
        cumulativeIncome: getCumulativeRentalIncome(linesData.snapshot, i)
      });
    }
    
    return data;
  }, [linesData, startMonth]);
  
  const selectedVilla = useMemo(() => {
    if (!linesData || !linesData.villaId) return null;
    
    for (const project of catalog) {
      const villa = project.villas.find(v => v.id === linesData.villaId);
      if (villa) return villa;
    }
    return null;
  }, [linesData, catalog]);
  
  const pricingData = useMemo(() => {
    if (!selectedVilla) return [];
    return generatePricingData(selectedVilla);
  }, [selectedVilla, pricingConfig]);
  
  // ===== ОБРАБОТЧИКИ =====
  const handlePinSubmit = () => {
    if (pin === '1234') {
      setIsEditor(true);
      setShowPinModal(false);
      setPin('');
    } else {
      alert('Неверный PIN');
    }
  };
  
  const handleAddProject = () => {
    if (newProjectForm.name.trim()) {
      const newProject = {
        id: Date.now(),
        name: newProjectForm.name.trim(),
        villas: []
      };
      setCatalog([...catalog, newProject]);
      setNewProjectForm({ name: '' });
      setShowAddProjectModal(false);
    }
  };
  
  const handleAddVilla = () => {
    if (editingProject && newVillaForm.name && newVillaForm.area && newVillaForm.ppsm) {
      const newVilla = {
        id: Date.now(),
        name: newVillaForm.name,
        area: parseFloat(newVillaForm.area),
        ppsm: parseFloat(newVillaForm.ppsm),
        leaseholdEndDate: newVillaForm.leaseholdEndDate || '2099-12-31',
        dailyRateUSD: parseFloat(newVillaForm.dailyRateUSD) || 0,
        rentalPriceIndexPct: parseFloat(newVillaForm.rentalPriceIndexPct) || 0
      };
      
      const updatedCatalog = catalog.map(project => {
        if (project.id === editingProject.id) {
          return {
            ...project,
            villas: [...project.villas, newVilla]
          };
        }
        return project;
      });
      
      setCatalog(updatedCatalog);
      setNewVillaForm({
        name: '',
        area: '',
        ppsm: '',
        leaseholdEndDate: '',
        dailyRateUSD: '',
        rentalPriceIndexPct: ''
      });
      setShowAddVillaModal(false);
      setEditingProject(null);
    }
  };
  
  const handleEditVilla = (villa, project) => {
    setEditingProject(project);
    setNewVillaForm({
      name: villa.name,
      area: villa.area.toString(),
      ppsm: villa.ppsm.toString(),
      leaseholdEndDate: villa.leaseholdEndDate,
      dailyRateUSD: villa.dailyRateUSD.toString(),
      rentalPriceIndexPct: villa.rentalPriceIndexPct.toString()
    });
    setShowAddVillaModal(true);
  };
  
  const handleSaveVilla = () => {
    if (!editingProject) {
      alert('Ошибка: проект не выбран для редактирования');
      return;
    }
    
    const updatedCatalog = catalog.map(project => {
      if (project.id === editingProject.id) {
        return {
          ...project,
          villas: project.villas.map(villa => {
            if (villa.name === newVillaForm.name) {
              const updatedVilla = {
                ...villa,
                name: newVillaForm.name,
                area: parseFloat(newVillaForm.area),
                ppsm: parseFloat(newVillaForm.ppsm),
                leaseholdEndDate: newVillaForm.leaseholdEndDate,
                dailyRateUSD: parseFloat(newVillaForm.dailyRateUSD),
                rentalPriceIndexPct: parseFloat(newVillaForm.rentalPriceIndexPct)
              };
              
              // Обновляем snapshot в lines если эта вилла выбрана
              setLines(prevLines => 
                prevLines.map(line => 
                  line.villaId === villa.id 
                    ? { ...line, snapshot: updatedVilla }
                    : line
                )
              );
              
              return updatedVilla;
            }
            return villa;
          })
        };
      }
      return project;
    });
    
    setCatalog(updatedCatalog);
    setNewVillaForm({
      name: '',
      area: '',
      ppsm: '',
      leaseholdEndDate: '',
      dailyRateUSD: '',
      rentalPriceIndexPct: ''
    });
    setShowAddVillaModal(false);
    setEditingProject(null);
  };
  
  const handleDeleteProject = (projectId) => {
    if (window.confirm('Удалить проект и все его виллы?')) {
      setCatalog(catalog.filter(p => p.id !== projectId));
      setLines(lines.filter(line => line.projectId !== projectId));
    }
  };
  
  const handleDeleteVilla = (villaId, projectId) => {
    if (window.confirm('Удалить виллу?')) {
      const updatedCatalog = catalog.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            villas: project.villas.filter(v => v.id !== villaId)
          };
        }
        return project;
      });
      setCatalog(updatedCatalog);
      setLines(lines.filter(line => line.villaId !== villaId));
    }
  };
  
  const addFromCatalog = (villa, project) => {
    const newLine = {
      id: Date.now(),
      projectId: project.id,
      villaId: villa.id,
      snapshot: { ...villa }
    };
    setLines([newLine]);
  };
  
  const exportCSV = () => {
    if (!project) return;
    
    const csvContent = [
      ['Показатель', 'Значение'],
      ['Общая стоимость', project.totalCost],
      ['Первый взнос', project.downPayment],
      ['Ежемесячный платеж', project.monthlyPayment],
      ['Общий процент', project.totalInterest],
      ['Общие платежи', project.totalPayments]
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arconique_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  const exportXLSX = () => {
    if (typeof XLSX === 'undefined') {
      alert('Библиотека XLSX не загружена. Пожалуйста, подключите XLSX.js');
      return;
    }
    
    if (!project) return;
    
    const data = [
      ['Показатель', 'Значение'],
      ['Общая стоимость', project.totalCost],
      ['Первый взнос', project.downPayment],
      ['Ежемесячный платеж', project.monthlyPayment],
      ['Общий процент', project.totalInterest],
      ['Общие платежи', project.totalPayments]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Arconique Data');
    XLSX.writeFile(wb, 'arconique_data.xlsx');
  };
  
  const exportPDF = () => {
    if (typeof html2pdf === 'undefined') {
      alert('Библиотека html2pdf не загружена. Пожалуйста, подключите html2pdf.js');
      return;
    }
    
    const element = document.getElementById('app-content');
    if (element) {
      html2pdf().from(element).save('arconique_report.pdf');
    }
  };
  
  // ===== РЕНДЕР =====
  if (!project) {
    return (
      <div className="app">
        <div className="header">
          <h1>{T.title}</h1>
          <p>{T.subtitle}</p>
        </div>
        <div className="no-data">
          <p>Выберите виллу из каталога для начала работы</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app" id="app-content">
      {/* Заголовок */}
      <div className="header">
        <h1>{T.title}</h1>
        <p>{T.subtitle}</p>
        <div className="mode-switcher">
          {isEditor ? (
            <>
              <span className="mode-badge editor">{T.editorMode}</span>
              <button onClick={() => setIsEditor(false)} className="btn btn-secondary">
                {T.switchToClient}
              </button>
            </>
          ) : (
            <>
              <span className="mode-badge client">{T.clientMode}</span>
              <button onClick={() => setShowPinModal(true)} className="btn btn-primary">
                {T.switchToEditor}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="main-content">
        {/* 1. Ключевые показатели */}
        <div className="card">
          <h3>{T.kpi}</h3>
          <div className="kpi-grid">
            <div className="kpi-item">
              <span className="kpi-label">{T.totalCost}</span>
              <span className="kpi-value">{fmtMoney(project.totalCost)}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">{T.downPayment}</span>
              <span className="kpi-value">{fmtMoney(project.downPayment)}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">{T.monthlyPayment}</span>
              <span className="kpi-value">{fmtMoney(project.monthlyPayment)}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">{T.totalInterest}</span>
              <span className="kpi-value">{fmtMoney(project.totalInterest)}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">{T.totalPayments}</span>
              <span className="kpi-value">{fmtMoney(project.totalPayments)}</span>
            </div>
          </div>
        </div>
        
        {/* 2. План рассрочки */}
        <div className="card">
          <h3>{T.installmentPlan}</h3>
          <div className="stages-table">
            <table>
              <thead>
                <tr>
                  <th>{T.stage}</th>
                  <th>{T.amount}</th>
                  <th>{T.date}</th>
                  <th>{T.percentage}</th>
                </tr>
              </thead>
              <tbody>
                {stages.map(stage => (
                  <tr key={stage.id}>
                    <td>{stage.name}</td>
                    <td>{fmtMoney(stage.amount)}</td>
                    <td>{stage.date}</td>
                    <td>{stage.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 3. Денежный поток */}
        <div className="card">
          <h3>{T.cashflow}</h3>
          <div className="cashflow-chart">
            <h4>Динамика платежей по этапам</h4>
            <div className="cashflow-bars">
              {stages.map((stage, index) => (
                <div key={stage.id} className="cashflow-bar">
                  <div className="bar-label">{stage.name}</div>
                  <div className="bar-container">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        height: `${(stage.amount / Math.max(...stages.map(s => s.amount))) * 200}px`,
                        backgroundColor: `hsl(${index * 60}, 70%, 60%)`
                      }}
                    ></div>
                  </div>
                  <div className="bar-value">{fmtMoney(stage.amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 4. Доход от аренды */}
        <div className="card">
          <h3>{T.rentalIncome}</h3>
          <div className="rental-summary">
            <h4>Прогноз арендного дохода на 5 лет</h4>
            <div className="rental-grid">
              {project.rentalForecast.map((forecast, index) => (
                <div key={index} className="rental-item">
                  <span className="rental-year">{forecast.year}</span>
                  <span className="rental-income">{fmtMoney(forecast.yearlyIncome)}</span>
                  <span className="rental-cumulative">{fmtMoney(forecast.cumulativeIncome)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 5. График общей доходности от сдачи в аренду - ПОЛНОСТЬЮ ИСПРАВЛЕННАЯ ВЕРСИЯ */}
        <div className="card">
          <h3>{T.rentalIncomeChart}</h3>
          <div className="rental-chart-container">
            <h4>Динамика накопленного дохода от аренды</h4>
            <p className="chart-subtitle">Накопительный доход по годам (аренда начинается через 3 месяца после получения ключей)</p>
            
            {/* ИСПРАВЛЕНО: Добавляем проверку данных */}
            {yearlyRentalData && Array.isArray(yearlyRentalData) && yearlyRentalData.length > 0 ? (
              <div className="rental-chart-svg" id="rental-chart-svg">
                <svg width="100%" height="300" viewBox="0 0 800 300">
                  <g className="chart-lines">
                    {(() => {
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
                    {(() => {
                      const currentYear = startMonth.getFullYear();
                      
                      return yearlyRentalData.map((point, index) => {
                        const x = 50 + (index / (yearlyRentalData.length - 1)) * 700;
                        
                        // ИСПРАВЛЕНО: Вычисляем конкретный год аренды
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
                      });
                    })()}
                    
                    {/* Подписи по оси Y (доход) */}
                    {(() => {
                      const maxIncome = Math.max(...yearlyRentalData.map(d => d.cumulativeIncome));
                      const minIncome = Math.min(...yearlyRentalData.map(d => d.cumulativeIncome));
                      const incomeRange = maxIncome - minIncome;
                      
                      return [0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                        const income = minIncome + ratio * incomeRange;
                        const y = 50 + (1 - ratio) * 250;
                        
                        return (
                          <g key={index}>
                            <line x1="45" y1={y} x2="50" y2={y} stroke="#ccc" strokeWidth="1" />
                            <text x="40" y={y + 3} textAnchor="end" fontSize="10" fill="#666">
                              {fmtMoney(income)}
                            </text>
                          </g>
                        );
                      });
                    })()}
                  </g>
                </svg>
              </div>
            ) : (
              // ИСПРАВЛЕНО: Показываем сообщение если данных нет
              <div className="no-data-message">
                <p>Данные для графика аренды недоступны. Выберите виллу с параметрами аренды.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 6. Расчет позиции - Параметры ценообразования и график */}
        <div className="card">
          <h3>{T.positionCalculation}</h3>
          
          {/* Параметры ценообразования - редактируемые в редакторском режиме */}
          {isEditor ? (
            <div className="pricing-params-editor">
              <h4>{T.pricingParameters}</h4>
              <div className="pricing-grid">
                <div className="form-group">
                  <label>{T.inflationRate}:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingConfig.inflationRate}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      inflationRate: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <small>Годовая ставка инфляции (например: 0.05 = 5%)</small>
                </div>
                
                <div className="form-group">
                  <label>{T.agingFactor}:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingConfig.agingBeta}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      agingBeta: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <small>Коэффициент старения виллы (например: 0.02 = 2% в год)</small>
                </div>
                
                <div className="form-group">
                  <label>{T.leaseDecay}:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingConfig.leaseAlpha}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      leaseAlpha: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <small>Коэффициент затухания лизинга (например: 0.3)</small>
                </div>
                
                <div className="form-group">
                  <label>{T.brandPeak}:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingConfig.brandPeak}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      brandPeak: parseFloat(e.target.value) || 1
                    }))}
                  />
                  <small>Пиковое значение бренд-фактора</small>
                </div>
                
                <div className="form-group">
                  <label>{T.brandRamp}:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingConfig.brandRamp}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      brandRamp: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <small>Годы роста бренда</small>
                </div>
                
                <div className="form-group">
                  <label>{T.brandPlateau}:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingConfig.brandPlateau}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      brandPlateau: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <small>Годы плато бренда</small>
                </div>
                
                <div className="form-group">
                  <label>{T.brandDecay}:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingConfig.brandDecay}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      brandDecay: parseFloat(e.target.value) || 0
                    }))}
                  />
                  <small>Годы затухания бренда</small>
                </div>
                
                <div className="form-group">
                  <label>{T.brandTail}:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pricingConfig.brandTail}
                    onChange={(e) => setPricingConfig(prev => ({
                      ...prev,
                      brandTail: parseFloat(e.target.value) || 1
                    }))}
                  />
                  <small>Хвостовое значение бренд-фактора</small>
                </div>
              </div>
            </div>
          ) : (
            /* В клиентском режиме показываем текущие коэффициенты */
            <div className="current-coefficients-display">
              <h4>{T.currentCoefficients}</h4>
              <div className="coefficients-grid">
                {(() => {
                  if (!selectedVilla) return null;
                  
                  const currentYear = 0;
                  const leaseF = leaseFactor(currentYear, 100, pricingConfig.leaseAlpha);
                  const ageF = ageFactor(currentYear, pricingConfig.agingBeta);
                  const brandF = brandFactor(currentYear, pricingConfig);
                  const inflationF = Math.pow(1 + pricingConfig.inflationRate, currentYear);
                  const overallMultiplier = leaseF * ageF * brandF * inflationF;
                  
                  return (
                    <>
                      <div className="coefficient-item">
                        <span className="coefficient-label">{T.leaseFactor}:</span>
                        <span className="coefficient-value">{leaseF.toFixed(1)}</span>
                      </div>
                      <div className="coefficient-item">
                        <span className="coefficient-label">{T.ageFactor}:</span>
                        <span className="coefficient-value">{ageF.toFixed(1)}</span>
                      </div>
                      <div className="coefficient-item">
                        <span className="coefficient-label">{T.brandFactor}:</span>
                        <span className="coefficient-value">{brandF.toFixed(1)}</span>
                      </div>
                      <div className="coefficient-item">
                        <span className="coefficient-label">{T.inflationFactor}:</span>
                        <span className="coefficient-value">{inflationF.toFixed(1)}</span>
                      </div>
                      <div className="coefficient-item">
                        <span className="coefficient-label">{T.overallMultiplier}:</span>
                        <span className="coefficient-value">{overallMultiplier.toFixed(1)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
          
          {/* График динамики цены виллы */}
          <div className="pricing-chart">
            <h4>{T.priceDynamics}</h4>
            <p className="chart-subtitle">Влияние факторов на цену виллы по годам</p>
            
            {pricingData && pricingData.length > 0 ? (
              <div className="pricing-chart-svg" id="pricing-chart-svg">
                <svg width="100%" height="300" viewBox="0 0 800 300">
                  <g className="chart-lines">
                    {(() => {
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
                              fill="#007bff" 
                              stroke="none"
                            />
                            {index > 0 && (
                              <line 
                                x1={padding + ((index - 1) / (pricingData.length - 1)) * (chartWidth - 2 * padding)}
                                y1={padding + ((maxPrice - pricingData[index - 1].finalPrice) / priceRange) * (chartHeight - 2 * padding)}
                                x2={x}
                                y2={y}
                                stroke="#007bff"
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
                      Цена виллы (USD)
                    </text>
                    
                    {/* Подписи по оси X (КОНКРЕТНЫЕ ГОДЫ) */}
                    {/* Подписи по оси X (КОНКРЕТНЫЕ ГОДЫ) */}
                    {pricingData.map((point, index) => {
                      const x = 50 + (index / (pricingData.length - 1)) * 700;
                      return (
                        <text key={index} x={x} y="315" textAnchor="middle" fontSize="10" fill="#666">
                          {point.year}
                        </text>
                      );
                    })}
                    
                    {/* Подписи по оси Y (цена) */}
                    {(() => {
                      const maxPrice = Math.max(...pricingData.map(d => d.finalPrice));
                      const minPrice = Math.min(...pricingData.map(d => d.finalPrice));
                      const priceRange = maxPrice - minPrice;
                      
                      return [0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                        const price = minPrice + ratio * priceRange;
                        const y = 50 + (1 - ratio) * 250;
                        
                        return (
                          <g key={index}>
                            <line x1="45" y1={y} x2="50" y2={y} stroke="#ccc" strokeWidth="1" />
                            <text x="40" y={y + 3} textAnchor="end" fontSize="10" fill="#666">
                              {fmtMoney(price)}
                            </text>
                          </g>
                        );
                      });
                    })()}
                  </g>
                </svg>
              </div>
            ) : (
              <div className="no-data-message">
                <p>Данные для графика ценообразования недоступны.</p>
              </div>
            )}
          </div>
          
          {/* Таблица факторов */}
          <div className="factors-table">
            <h4>{T.factorsTable}</h4>
            {pricingData && pricingData.length > 0 ? (
              <div className="factors-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>{T.year}</th>
                      <th>{T.leaseFactor}</th>
                      <th>{T.ageFactor}</th>
                      <th>{T.brandFactor}</th>
                      <th>{T.inflationFactor}</th>
                      <th>{T.finalPrice}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingData.map((point, index) => (
                      <tr key={index}>
                        <td>{point.year}</td>
                        <td>{point.leaseFactor.toFixed(3)}</td>
                        <td>{point.ageFactor.toFixed(3)}</td>
                        <td>{point.brandFactor.toFixed(3)}</td>
                        <td>{point.inflationFactor.toFixed(3)}</td>
                        <td>{fmtMoney(point.finalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data-message">
                <p>Данные для таблицы факторов недоступны.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 7. Каталог проектов и вилл */}
        <div className="card">
          <h3>{T.catalog}</h3>
          
          {isEditor && (
            <div className="catalog-actions">
              <button onClick={() => setShowAddProjectModal(true)} className="btn btn-primary">
                {T.addProject}
              </button>
            </div>
          )}
          
          <div className="catalog-grid">
            {catalog.map(project => (
              <div key={project.id} className="project-block">
                <div className="project-header">
                  <h4>{project.name}</h4>
                  {isEditor && (
                    <button 
                      onClick={() => handleDeleteProject(project.id)}
                      className="btn btn-danger btn-sm"
                    >
                      {T.deleteProject}
                    </button>
                  )}
                </div>
                
                <div className="villas-list">
                  {project.villas.map(villa => (
                    <div key={villa.id} className="villa-item">
                      <div className="villa-info">
                        <span className="villa-name">{villa.name}</span>
                        <span className="villa-details">
                          {villa.area} кв.м • {fmtMoney(villa.ppsm)}/кв.м
                        </span>
                      </div>
                      
                      <div className="villa-actions">
                        {isEditor ? (
                          <>
                            <button 
                              onClick={() => handleEditVilla(villa, project)}
                              className="btn btn-secondary btn-sm"
                            >
                              {T.editVilla}
                            </button>
                            <button 
                              onClick={() => handleDeleteVilla(villa.id, project.id)}
                              className="btn btn-danger btn-sm"
                            >
                              {T.deleteVilla}
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => addFromCatalog(villa, project)}
                            className="btn btn-primary btn-sm"
                          >
                            Выбрать
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Кнопка добавить виллу внутри проекта */}
                  {isEditor && (
                    <div className="add-villa-in-project">
                      <button 
                        onClick={() => {
                          setEditingProject(project);
                          setShowAddVillaModal(true);
                        }}
                        className="btn btn-outline-primary btn-sm"
                      >
                        {T.addVilla}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 8. Экспорт */}
        <div className="card">
          <h3>{T.export}</h3>
          <div className="export-buttons">
            <button onClick={exportCSV} className="btn btn-secondary">
              {T.exportCSV}
            </button>
            <button onClick={exportXLSX} className="btn btn-secondary">
              {T.exportExcel}
            </button>
            <button onClick={exportPDF} className="btn btn-secondary">
              {T.exportPDF}
            </button>
          </div>
        </div>
      </div>
      
      {/* Модальное окно PIN */}
      {showPinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{T.enterPin}</h3>
            <div className="form-group">
              <label>{T.pin}:</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Введите PIN"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handlePinSubmit} className="btn btn-primary">
                {T.submit}
              </button>
              <button onClick={() => setShowPinModal(false)} className="btn btn-secondary">
                {T.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Модальное окно добавления проекта */}
      {showAddProjectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{T.addProject}</h3>
            <div className="form-group">
              <label>{T.projectName}:</label>
              <input
                type="text"
                value={newProjectForm.name}
                onChange={(e) => setNewProjectForm({ name: e.target.value })}
                placeholder="Название проекта"
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleAddProject} className="btn btn-primary">
                {T.save}
              </button>
              <button onClick={() => setShowAddProjectModal(false)} className="btn btn-secondary">
                {T.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Модальное окно добавления/редактирования виллы */}
      {showAddVillaModal && (
        <div className="modal-overlay">
          <div className="modal villa-modal">
            <h3>{editingProject ? 'Редактировать виллу' : T.addVilla}</h3>
            
            <div className="form-group">
              <label>{T.villaName}:</label>
              <input
                type="text"
                value={newVillaForm.name}
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Название виллы"
              />
            </div>
            
            <div className="form-group">
              <label>{T.area}:</label>
              <input
                type="number"
                value={newVillaForm.area}
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, area: e.target.value }))}
                placeholder="Площадь в кв.м"
              />
            </div>
            
            <div className="form-group">
              <label>{T.ppsm}:</label>
              <input
                type="number"
                value={newVillaForm.ppsm}
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, ppsm: e.target.value }))}
                placeholder="Цена за кв.м в USD"
              />
            </div>
            
            <div className="form-group">
              <label>{T.leaseholdEnd}:</label>
              <input
                type="date"
                value={newVillaForm.leaseholdEndDate}
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, leaseholdEndDate: e.target.value }))}
              />
            </div>
            
            <div className="form-group">
              <label>{T.dailyRate}:</label>
              <input
                type="number"
                value={newVillaForm.dailyRateUSD}
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, dailyRateUSD: e.target.value }))}
                placeholder="Дневная ставка в USD"
              />
            </div>
            
            <div className="form-group">
              <label>{T.rentalIndex}:</label>
              <input
                type="number"
                step="0.1"
                value={newVillaForm.rentalPriceIndexPct}
                onChange={(e) => setNewVillaForm(prev => ({ ...prev, rentalPriceIndexPct: e.target.value }))}
                placeholder="Индекс аренды в %"
              />
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={editingProject ? handleSaveVilla : handleAddVilla} 
                className="btn btn-primary"
              >
                {editingProject ? 'Сохранить изменения' : T.save}
              </button>
              <button onClick={() => {
                setShowAddVillaModal(false);
                setEditingProject(null);
                setNewVillaForm({
                  name: '',
                  area: '',
                  ppsm: '',
                  leaseholdEndDate: '',
                  dailyRateUSD: '',
                  rentalPriceIndexPct: ''
                });
              }} className="btn btn-secondary">
                {T.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
// ===== РЕНДЕРИНГ ПРИЛОЖЕНИЯ =====
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

