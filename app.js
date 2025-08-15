// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE (С АРЕНДНЫМ ДОХОДОМ) - ОЧИЩЕННАЯ ВЕРСИЯ =====

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
  
  // Правильная структура каталога с проектами и виллами
  const [catalog, setCatalog] = useState([
    {
      projectId: 'ahao',
      projectName: 'AHAO Gardens',
      villas: [
        {villaId: 'ahao-2br', name: '2BR Garden Villa', area: 100, ppsm: 2500, baseUSD: 250000},
        {villaId: 'ahao-3br', name: '3BR Garden Villa', area: 130, ppsm: 2450, baseUSD: 318500}
      ]
    },
    {
      projectId: 'enso',
      projectName: 'Enso Villas',
      villas: [
        {villaId: 'enso-2br', name: 'Enso 2BR', area: 100, ppsm: 2500, baseUSD: 250000},
        {villaId: 'enso-3br', name: 'Enso 3BR', area: 120, ppsm: 2700, baseUSD: 324000}
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
      // НОВЫЕ ПОЛЯ ДЛЯ АРЕНДЫ:
      dailyRateUSD: 150, // Стоимость проживания в сутки (USD)
      occupancyPct: 75,  // Средняя заполняемость за месяц (%)
      snapshot: {name: 'Enso 2BR', area: 100, ppsm: 2500, baseUSD: 250000}
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
    baseUSD: 250000
  });

  // Переводы
  const T = {
    ru: {
      title: 'Arconique / Калькулятор рассрочки для любимых клиентов',
      lang: 'Язык интерфейса',
      currencyDisplay: 'Валюта отображения',
      idrRate: 'IDR за 1 USD',
      eurRate: 'EUR за 1 USD',
      handoverMonth: 'Месяц получения ключей',
      gl: 'Начальный месяц',
      stagesTitle: 'Базовая рассрочка',
      stage: 'Этап оплаты',
      percent: '%',
      month: 'Месяц',
      addStage: 'Добавить этап',
      delete: 'Удалить',
      // НОВЫЕ ПЕРЕВОДЫ ДЛЯ АРЕНДЫ:
      dailyRate: 'Стоимость проживания в сутки (USD)',
      occupancyRate: 'Средняя заполняемость за месяц (%)',
      rentalIncome: 'Прогнозируемый доход от аренды в месяц',
      netPayment: 'Чистый платеж/доход в месяц',
      // Остальные переводы...
      stageDescription: 'Название этапа оплаты (например: Договор, 50% готовности)',
      percentDescription: 'Процент от общей стоимости к оплате на данном этапе',
      monthDescription: 'Месяц от начала проекта, когда наступает данный этап',
      actions: 'Действия',
      calculationTitle: 'Расчёт (позиции)',
      project: 'Проект',
      villa: 'Вилла',
      quantity: 'Количество',
      prePayment: 'Предоплата, %',
      ownTerms: 'Свои условия',
      discount: 'Скидка, %',
      months: 'Срок рассрочки, мес',
      rate: 'Ставка, %/мес',
      addFromCatalog: 'Добавить из каталога',
      kpiTitle: 'KPI показатели',
      totalAmount: 'Общая сумма',
      amountToPay: 'Сумма к оплате',
      after: 'После ключей',
      interest: 'Проценты',
      finalPrice: 'Итоговая цена',
      cashflowTitle: 'Сводный кэшфлоу по месяцам',
      description: 'Описание',
      amountDue: 'К оплате',
      remainingBalance: 'Остаток',
      exportCSV: 'Экспорт CSV',
      exportXLSX: 'Экспорт Excel',
      exportPDF: 'Экспорт PDF',
      catalogTitle: 'Каталог проектов и вилл (редактор)',
      addProject: 'Добавить проект',
      addVilla: 'Добавить виллу',
      projectName: 'Название проекта',
      villaName: 'Название виллы',
      area: 'Площадь (м²)',
      ppsm: 'Цена за м² (USD)',
      baseUSD: 'Базовая стоимость (USD)',
      projectNameRequired: 'Введите название проекта',
      projectExists: 'Проект с таким названием уже существует',
      villaNameRequired: 'Введите название виллы',
      villaExists: 'Вилла с таким названием уже существует',
      importCatalog: 'Импорт каталога',
      exportCatalog: 'Экспорт каталога',
      importSuccess: 'Каталог успешно импортирован',
      importError: 'Ошибка импорта каталога',
      exportSuccess: 'Каталог успешно экспортирован',
      exportError: 'Ошибка экспорта каталога',
      switchToEditor: 'Переключиться в редактор',
      switchToClient: 'Переключиться в клиентский режим',
      enterPin: 'Введите PIN код для доступа к редакторскому режиму',
      invalidPin: 'Неверный PIN код',
      selectedVillas: 'Выбрано вилл',
      cancel: 'Отмена',
    },
    en: {
      title: 'Arconique / Installment Calculator for Beloved Clients',
      lang: 'Interface language',
      currencyDisplay: 'Display currency',
      idrRate: 'IDR per 1 USD',
      eurRate: 'EUR per 1 USD',
      handoverMonth: 'Handover month',
      gl: 'Start month',
      stagesTitle: 'Base installment',
      stage: 'Payment stage',
      percent: '%',
      month: 'Month',
      addStage: 'Add stage',
      delete: 'Delete',
      // НОВЫЕ ПЕРЕВОДЫ ДЛЯ АРЕНДЫ:
      dailyRate: 'Daily accommodation rate (USD)',
      occupancyRate: 'Average monthly occupancy (%)',
      rentalIncome: 'Projected monthly rental income',
      netPayment: 'Net payment/income per month',
      // Остальные переводы...
      stageDescription: 'Payment stage name (e.g.: Contract, 50% completion)',
      percentDescription: 'Percentage of total cost to pay at this stage',
      monthDescription: 'Month from project start when this stage occurs',
      actions: 'Actions',
      calculationTitle: 'Calculation (positions)',
      project: 'Project',
      villa: 'Villa',
      quantity: 'Quantity',
      prePayment: 'Prepayment, %',
      ownTerms: 'Own terms',
      discount: 'Discount, %',
      months: 'Installment term, months',
      rate: 'Rate, %/month',
      addFromCatalog: 'Add from catalog',
      kpiTitle: 'KPI indicators',
      totalAmount: 'Total amount',
      amountToPay: 'Amount to pay',
      after: 'After keys',
      interest: 'Interest',
      finalPrice: 'Final price',
      cashflowTitle: 'Monthly cashflow summary',
      description: 'Description',
      amountDue: 'Amount due',
      remainingBalance: 'Remaining balance',
      exportCSV: 'Export CSV',
      exportXLSX: 'Export Excel',
      exportPDF: 'Export PDF',
      catalogTitle: 'Projects and villas catalog (editor)',
      addProject: 'Add project',
      addVilla: 'Add villa',
      projectName: 'Project name',
      villaName: 'Villa name',
      area: 'Area (m²)',
      ppsm: 'Price per m² (USD)',
      baseUSD: 'Base cost (USD)',
      projectNameRequired: 'Enter project name',
      projectExists: 'Project with this name already exists',
      villaNameRequired: 'Enter villa name',
      villaExists: 'Villa with this name already exists',
      importCatalog: 'Import catalog',
      exportCatalog: 'Export catalog',
      importSuccess: 'Catalog successfully imported',
      importError: 'Import error',
      exportSuccess: 'Catalog successfully exported',
      exportError: 'Export error',
      switchToEditor: 'Switch to editor',
      switchToClient: 'Switch to client mode',
      enterPin: 'Enter PIN code to access editor mode',
      invalidPin: 'Invalid PIN code',
      selectedVillas: 'Selected villas',
      cancel: 'Cancel',
    }
  };

  // Получаем переводы
  const t = T[lang] || T.ru;

  // Обновление заголовка страницы
  useEffect(() => {
    // Проверяем, существует ли элемент перед изменением
    const appTitleElement = document.getElementById('app-title');
    if (appTitleElement) {
      appTitleElement.textContent = t.title;
    }
    document.title = t.title;
  }, [t.title]);

  // Функция для расчета количества дней в конкретном месяце и году
  const getDaysInMonth = (monthOffset) => {
    const date = new Date(startMonth);
    date.setMonth(date.getMonth() + monthOffset);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Функция для обновления строки
  const updateLine = (id, field, value) => {
    setLines(lines.map(line => 
      line.id === id ? { ...line, [field]: value } : line
    ));
  };

  // Функция для удаления строки
  const deleteLine = (id) => {
    setLines(lines.filter(line => line.id !== id));
  };

  // Функция для добавления виллы из каталога
  const addFromCatalog = () => {
    setModalOpen(true);
  };

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

    setCatalog([...catalog, newProject]);
    setShowAddProjectModal(false);
    setNewProjectForm({projectId: '', projectName: '', villas: []});
  };

  // Функции для работы с виллами
  const addVilla = (projectId) => {
    setEditingProject(projectId);
    setNewVillaForm({
      villaId: '',
      name: '',
      area: 100,
      ppsm: 2500,
      baseUSD: 250000
    });
    setShowAddVillaModal(true);
  };

  const saveVilla = () => {
    if (!newVillaForm.name) {
      alert(t.villaNameRequired);
      return;
    }
    
    // Auto-generate villaId
    const newVillaId = `${editingProject}-${newVillaForm.name.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    const project = catalog.find(p => p.projectId === editingProject);
    if (project) {
      const villaExists = project.villas.find(v => v.villaId === newVillaId);
      if (villaExists) {
        alert(t.villaExists);
        return;
      }

      const newVilla = {
        villaId: newVillaId,
        name: newVillaForm.name,
        area: newVillaForm.area,
        ppsm: newVillaForm.ppsm,
        baseUSD: newVillaForm.area * newVillaForm.ppsm
      };

      setCatalog(catalog.map(p => 
        p.projectId === editingProject 
          ? {...p, villas: [...p.villas, newVilla]}
          : p
      ));
    }
    
    setShowAddVillaModal(false);
    setNewVillaForm({villaId: '', name: '', area: 100, ppsm: 2500, baseUSD: 250000});
  };

  // Функция для добавления этапа
  const addStage = () => {
    const newStage = {
      id: Math.max(...stages.map(s => s.id)) + 1,
      label: `${t.month} ${stages.length + 1}`,
      pct: 0,
      month: 0
    };
    setStages([...stages, newStage]);
  };

  // Функция для удаления этапа
  const deleteStage = (id) => {
    setStages(stages.filter(s => s.id !== id));
  };

  // Функция для обновления этапа
  const updateStage = (id, field, value) => {
    setStages(stages.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  // Функция для переключения режима
  const toggleMode = () => {
    if (isClient) {
      const pin = prompt(t.enterPin);
      if (pin === PIN_CODE) {
        setIsClient(false);
      } else {
        alert(t.invalidPin);
      }
    } else {
      setIsClient(true);
    }
  };

  // Вспомогательные функции
  const fmtMoney = (amount, curr) => {
    if (curr === 'USD') return `$${amount.toLocaleString()}`;
    if (curr === 'IDR') return `Rp${(amount * idrPerUsd).toLocaleString()}`;
    if (curr === 'EUR') return `€${(amount * eurPerUsd).toLocaleString()}`;
    return amount.toLocaleString();
  };

  const formatMonth = (month) => {
    const date = new Date(startMonth);
    date.setMonth(date.getMonth() + month);
    return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    // Функции экспорта
  const exportCSV = () => {
    const rows = [
      [t.month, t.description, t.amountDue, t.remainingBalance, t.rentalIncome, t.netPayment],
      ...project.cashflow.map(c => [
        formatMonth(c.month),
        (c.items || []).join(' + '),
        fmtMoney(c.amountUSD, currency),
        fmtMoney(c.balanceUSD, currency),
        fmtMoney(c.rentalIncome || 0, currency),
        fmtMoney(c.netPayment || 0, currency)
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `arconique_cashflow_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const exportXLSX = () => {
    const rows = [
      [t.month, t.description, t.amountDue, t.remainingBalance, t.rentalIncome, t.netPayment],
      ...project.cashflow.map(c => [
        formatMonth(c.month),
        (c.items || []).join(' + '),
        fmtMoney(c.amountUSD, currency),
        fmtMoney(c.balanceUSD, currency),
        fmtMoney(c.rentalIncome || 0, currency),
        fmtMoney(c.netPayment || 0, currency)
      ])
    ];
    
    // Здесь должна быть логика экспорта в Excel
    // Для простоты используем CSV
    exportCSV();
  };

  const exportPDF = () => {
    const rows = [
      [t.month, t.description, t.amountDue, t.remainingBalance, t.rentalIncome, t.netPayment],
      ...project.cashflow.map(c => [
        formatMonth(c.month),
        (c.items || []).join(' + '),
        fmtMoney(c.amountUSD, currency),
        fmtMoney(c.balanceUSD, currency),
        fmtMoney(c.rentalIncome || 0, currency),
        fmtMoney(c.netPayment || 0, currency)
      ])
    ];
    
    // Здесь должна быть логика экспорта в PDF
    // Для простоты используем CSV
    exportCSV();
  };

  // Функции для работы с каталогом
  const importCatalog = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            setCatalog(data);
            alert(t.importSuccess);
          } catch (error) {
            alert(t.importError);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const exportCatalog = () => {
    const dataStr = JSON.stringify(catalog, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'arconique_catalog.json';
    a.click();
    alert(t.exportSuccess);
  };

  // Расчеты
  const project = useMemo(() => {
    if (lines.length === 0) return { cashflow: [] };

    const totalBaseUSD = lines.reduce((sum, line) => sum + line.snapshot.baseUSD * line.qty, 0);
    const totalPrePct = lines.reduce((sum, line) => sum + line.prePct * line.qty, 0) / lines.reduce((sum, line) => sum + line.qty, 0);
    
    // Расчет кэшфлоу
    const cashflow = [];
    let balanceUSD = totalBaseUSD;
    
    for (let i = 0; i <= months; i++) {
      const stage = stages.find(s => s.month === i);
      let amountUSD = 0;
      let items = [];
      
      if (stage) {
        amountUSD = totalBaseUSD * stage.pct / 100;
        items.push(stage.label);
      }
      
      // НОВЫЙ РАСЧЕТ АРЕНДНОГО ДОХОДА:
      const rentalIncome = (() => {
        // Если месяц меньше чем (месяц получения ключей + 3), то доход = 0
        if (i < handoverMonth + 3) {
          return 0;
        }
        
        // Иначе рассчитываем доход по формуле
        const daysInMonth = getDaysInMonth(i);
        return lines.reduce((total, line) => {
          return total + (line.dailyRateUSD * 0.55 * line.occupancyPct / 100 * daysInMonth * line.qty);
        }, 0);
      })();

      // Чистый платеж/доход
      const netPayment = amountUSD - rentalIncome;
      
      balanceUSD -= amountUSD;
      
      cashflow.push({
        month: i,
        amountUSD,
        balanceUSD,
        items,
        rentalIncome, // НОВОЕ ПОЛЕ
        netPayment    // НОВОЕ ПОЛЕ
      });
    }

    return {
      totalBaseUSD,
      totalPrePct,
      cashflow
    };
  }, [lines, stages, months, handoverMonth, startMonth]);

  // Компонент для управления каталогом
  const CatalogManager = () => {
    if (isClient) return null;

    return (
      <div className="catalog-section">
        <div className="catalog-header">
          <h3>{t.catalogTitle}</h3>
          <div className="catalog-actions">
            <button onClick={addProject} className="btn primary">{t.addProject}</button>
            <button onClick={() => {
              setShowAddVillaModal(true);
            }} className="btn primary">{t.addVilla}</button>
            <button onClick={importCatalog} className="btn">{t.importCatalog}</button>
            <button onClick={exportCatalog} className="btn">{t.exportCatalog}</button>
          </div>
        </div>

        {catalog.map(project => (
          <div key={project.projectId} className="project-card">
            <div className="project-header">
              <h4>{project.projectName}</h4>
              <button onClick={() => addVilla(project.projectId)} className="btn small">{t.addVilla}</button>
            </div>
            <div className="villas-list">
              {project.villas.map(villa => (
                <div key={villa.villaId} className="villa-item">
                  <span>{villa.name}</span>
                  <span>{villa.area}м²</span>
                  <span>${villa.ppsm}/м²</span>
                  <span>${villa.baseUSD.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

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
          
          <div className="field compact">
            <label>{t.idrRate}</label>
            <input 
              type="number" 
              value={idrPerUsd} 
              onChange={e => setIdrPerUsd(parseFloat(e.target.value) || 0)}
              min="0"
              step="100"
            />
          </div>
          
          <div className="field compact">
            <label>{t.eurRate}</label>
            <input 
              type="number" 
              value={eurPerUsd} 
              onChange={e => setEurPerUsd(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="field compact">
            <label>{t.handoverMonth}</label>
            <input 
              type="number" 
              value={handoverMonth} 
              onChange={e => setHandoverMonth(parseInt(e.target.value) || 0)}
              min="0"
              step="1"
            />
          </div>
          
          <div className="field compact">
            <label>{t.gl}</label>
            <input 
              type="date" 
              value={startMonth.toISOString().split('T')[0]} 
              onChange={e => setStartMonth(new Date(e.target.value))}
            />
          </div>
        </div>
        
        {/* Ряд 2: Кнопка переключения режима */}
        <div className="row">
          <button onClick={toggleMode} className="btn primary">
            {isClient ? t.switchToEditor : t.switchToClient}
          </button>
        </div>
      </div>

      {/* 2. Расчёт (позиции) */}
      <div className="card">
        <h3>{t.calculationTitle}</h3>
        <table className="calculation-table">
          <thead>
            <tr>
              <th>{t.project}</th>
              <th>{t.villa}</th>
              <th>{t.quantity}</th>
              <th>{t.prePayment}</th>
              <th>{t.ownTerms}</th>
              {!isClient && (
                <>
                  <th>{t.discount}</th>
                  <th>{t.months}</th>
                  <th>{t.rate}</th>
                </>
              )}
              {/* НОВЫЕ КОЛОНКИ ДЛЯ АРЕНДЫ: */}
              <th>{t.dailyRate}</th>
              <th>{t.occupancyRate}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(line => (
              <tr key={line.id}>
                <td>{catalog.find(p => p.projectId === line.projectId)?.projectName || line.projectId}</td>
                <td>{line.snapshot.name}</td>
                <td>
                  <input 
                    type="number" 
                    value={line.qty} 
                    onChange={e => updateLine(line.id, 'qty', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    value={line.prePct} 
                    onChange={e => updateLine(line.id, 'prePct', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                  />%
                </td>
                <td>
                  <input 
                    type="checkbox" 
                    checked={line.ownTerms} 
                    onChange={e => updateLine(line.id, 'ownTerms', e.target.checked)}
                  />
                </td>
                {!isClient && (
                  <>
                    <td>
                      <input 
                        type="number" 
                        value={line.discountPct} 
                        onChange={e => updateLine(line.id, 'discountPct', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="100"
                      />%
                    </td>
                    <td>
                      {line.ownTerms ? (
                        <input 
                          type="number" 
                          value={line.months || ''} 
                          onChange={e => updateLine(line.id, 'months', parseInt(e.target.value) || null)}
                          min="1"
                        />
                      ) : '-'}
                    </td>
                    <td>
                      {line.ownTerms ? (
                        <>
                          <input 
                            type="number" 
                            value={line.monthlyRatePct || ''} 
                            onChange={e => updateLine(line.id, 'monthlyRatePct', parseFloat(e.target.value) || null)}
                            min="0"
                            step="0.01"
                          />
                          %/мес
                        </>
                      ) : '-'}
                    </td>
                  </>
                )}
                {/* НОВЫЕ ПОЛЯ ДЛЯ АРЕНДЫ: */}
                <td>
                  <input 
                    type="number" 
                    value={line.dailyRateUSD} 
                    onChange={e => updateLine(line.id, 'dailyRateUSD', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="1"
                  />
                </td>
                <td>
                  <input 
                    type="number" 
                    value={line.occupancyPct} 
                    onChange={e => updateLine(line.id, 'occupancyPct', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="1"
                  />%
                </td>
                <td>
                  <button onClick={() => deleteLine(line.id)} className="btn small danger">{t.delete}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="actions">
          <button onClick={addFromCatalog} className="btn primary">{t.addFromCatalog}</button>
        </div>
      </div>

      {/* 3. KPI показатели */}
      <div className="card">
        <h3>{t.kpiTitle}</h3>
        <div className="kpi-grid">
          <div className="kpi-item">
            <div className="kpi-label">{t.totalAmount}</div>
            <div className="kpi-value">{fmtMoney(project.totalBaseUSD || 0, currency)}</div>
          </div>
          <div className="kpi-item">
            <div className="kpi-label">{t.amountToPay}</div>
            <div className="kpi-value">{fmtMoney(project.totalBaseUSD || 0, currency)}</div>
          </div>
          <div className="kpi-item">
            <div className="kpi-label">{t.after}</div>
            <div className="kpi-value">{fmtMoney(project.totalBaseUSD * 0.05 || 0, currency)}</div>
          </div>
          {!isClient && (
            <>
              <div className="kpi-item">
                <div className="kpi-label">{t.interest}</div>
                <div className="kpi-value">{fmtMoney(0, currency)}</div>
              </div>
              <div className="kpi-item">
                <div className="kpi-label">{t.finalPrice}</div>
                <div className="kpi-value">{fmtMoney(project.totalBaseUSD || 0, currency)}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Базовая рассрочка */}
      <div className="card">
        <div className="stages-section">
          <h3>{t.stagesTitle}</h3>
          
          {/* ТАБЛИЦА С ЗАГОЛОВКАМИ КОЛОНОК */}
          <table className="stages-table">
            <thead>
              <tr>
                <th className="col-stage">
                  <div className="col-header">
                    <div className="col-title">{t.stage}</div>
                    <div className="col-description">{t.stageDescription}</div>
                  </div>
                </th>
                <th className="col-percent">
                  <div className="col-header">
                    <div className="col-title">{t.percent}</div>
                    <div className="col-description">{t.percentDescription}</div>
                  </div>
                </th>
                <th className="col-month">
                  <div className="col-header">
                    <div className="col-title">{t.month}</div>
                    <div className="col-description">{t.monthDescription}</div>
                  </div>
                </th>
                <th className="col-actions">
                  <div className="col-header">
                    <div className="col-title">{t.actions}</div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {stages.map(stage => (
                <tr key={stage.id}>
                  <td>
                    <input 
                      type="text" 
                      value={stage.label} 
                      onChange={e => updateStage(stage.id, 'label', e.target.value)}
                      placeholder={t.stage}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={stage.pct} 
                      onChange={e => updateStage(stage.id, 'pct', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />%
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={stage.month} 
                      onChange={e => updateStage(stage.id, 'month', parseInt(e.target.value) || 0)}
                      min="0"
                      step="1"
                    />
                  </td>
                  <td>
                    <button onClick={() => deleteStage(stage.id)} className="btn small danger">{t.delete}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="actions">
            <button onClick={addStage} className="btn primary">{t.addStage}</button>
          </div>
        </div>
      </div>

      {/* 5. Сводный кэшфлоу по месяцам */}
      <div className="card">
        <h3>{t.cashflowTitle}</h3>
        <table className="cashflow-table">
          <thead>
            <tr>
              <th>{t.month}</th>
              <th>{t.description}</th>
              <th>{t.amountDue}</th>
              <th>{t.remainingBalance}</th>
              {/* НОВЫЕ КОЛОНКИ ДЛЯ АРЕНДЫ: */}
              <th>{t.rentalIncome}</th>
              <th>{t.netPayment}</th>
            </tr>
          </thead>
          <tbody>
            {project.cashflow.map((c, i) => (
              <tr key={i} className="cashflow-row">
                <td>{formatMonth(c.month)}</td>
                <td>{(c.items || []).join(' + ')}</td>
                <td>{fmtMoney(c.amountUSD, currency)}</td>
                <td>{fmtMoney(c.balanceUSD, currency)}</td>
                {/* НОВЫЕ КОЛОНКИ ДЛЯ АРЕНДЫ: */}
                <td>{fmtMoney(c.rentalIncome || 0, currency)}</td>
                {/* CSS классы для цветового оформления */}
                <td className={c.netPayment >= 0 ? 'positive' : 'negative'}>
                  {fmtMoney(c.netPayment || 0, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="actions">
          <button onClick={exportCSV} className="btn">{t.exportCSV}</button>
          <button onClick={exportXLSX} className="btn">{t.exportXLSX}</button>
          <button onClick={exportPDF} className="btn">{t.exportPDF}</button>
        </div>
      </div>

      {/* 6. Каталог проектов и вилл */}
      <CatalogManager />

      {/* Модальные окна */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t.addFromCatalog}</h3>
            <div className="catalog-list">
              {catalog.map(project => (
                <div key={project.projectId} className="project-section">
                  <h4>{project.projectName}</h4>
                  {project.villas.map(villa => (
                    <div key={villa.villaId} className="villa-item">
                      <span>{villa.name}</span>
                      <span>{villa.area}м²</span>
                      <span>${villa.ppsm}/м²</span>
                      <span>${villa.baseUSD.toLocaleString()}</span>
                      <button 
                        onClick={() => {
                          const newLine = {
                            id: Math.max(...lines.map(l => l.id)) + 1,
                            projectId: project.projectId,
                            villaId: villa.villaId,
                            qty: 1,
                            prePct: 70,
                            ownTerms: false,
                            months: null,
                            monthlyRatePct: null,
                            firstPostUSD: 0,
                            discountPct: 0,
                            // НОВЫЕ ПОЛЯ ДЛЯ АРЕНДЫ:
                            dailyRateUSD: 150, // По умолчанию
                            occupancyPct: 75,  // По умолчанию
                            snapshot: {name: villa.name, area: villa.area, ppsm: villa.ppsm, baseUSD: villa.baseUSD}
                          };
                          setLines([...lines, newLine]);
                          setModalOpen(false);
                        }}
                        className="btn small primary"
                      >
                        {t.addFromCatalog}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления проекта */}
      {showAddProjectModal && (
        <div className="modal-overlay" onClick={() => setShowAddProjectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t.addProject}</h3>
            <div className="field">
              <label>{t.projectName}</label>
              <input 
                type="text" 
                value={newProjectForm.projectName} 
                onChange={e => setNewProjectForm({...newProjectForm, projectName: e.target.value})}
                placeholder={t.projectName}
              />
            </div>
            <div className="modal-actions">
              <button onClick={saveProject} className="btn primary">{t.addProject}</button>
              <button onClick={() => setShowAddProjectModal(false)} className="btn">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления виллы */}
      {showAddVillaModal && (
        <div className="modal-overlay" onClick={() => setShowAddVillaModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t.addVilla}</h3>
            <div className="field">
              <label>{t.villaName}</label>
              <input 
                type="text" 
                value={newVillaForm.name} 
                onChange={e => setNewVillaForm({...newVillaForm, name: e.target.value})}
                placeholder={t.villaName}
              />
            </div>
            <div className="field">
              <label>{t.area}</label>
              <input 
                type="number" 
                value={newVillaForm.area} 
                onChange={e => setNewVillaForm({...newVillaForm, area: parseFloat(e.target.value) || 0})}
                min="0"
                step="1"
              />
            </div>
            <div className="field">
              <label>{t.ppsm}</label>
              <input 
                type="number" 
                value={newVillaForm.ppsm} 
                onChange={e => setNewVillaForm({...newVillaForm, ppsm: parseFloat(e.target.value) || 0})}
                min="0"
                step="1"
              />
            </div>
            <div className="modal-actions">
              <button onClick={saveVilla} className="btn primary">{t.addVilla}</button>
              <button onClick={() => setShowAddVillaModal(false)} className="btn">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Рендеринг приложения
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
            
