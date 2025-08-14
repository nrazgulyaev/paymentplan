// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE =====

const { useState, useEffect, useMemo } = React;

// PIN для редакторского режима
const PIN_CODE = '334346';

// ===== КОМПОНЕНТ КАТАЛОГА =====
function CatalogManager({ catalog, setCatalog, t, lang }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    villaId: '',
    name: '',
    project: '',
    price: '',
    currency: 'USD'
  });

  const addVilla = () => {
    if (!form.villaId || !form.name) {
      alert('Заполните ID и название виллы');
      return;
    }
    
    const newVilla = {
      id: Date.now(),
      villaId: form.villaId,
      name: form.name,
      project: form.project,
      price: parseFloat(form.price) || 0,
      currency: form.currency
    };
    
    setCatalog(prev => [...prev, newVilla]);
    setForm({ villaId: '', name: '', project: '', price: '', currency: 'USD' });
    setShowAddModal(false);
  };

  const deleteVilla = (id) => {
    if (confirm('Удалить виллу?')) {
      setCatalog(prev => prev.filter(v => v.id !== id));
    }
  };

  return (
    <div className="catalog-section">
      <div className="catalog-header">
        <h3>{t.catalogTitle}</h3>
        <button 
          className="btn primary" 
          onClick={() => setShowAddModal(true)}
        >
          {t.addVilla}
        </button>
      </div>

      <div className="catalog-table-wrapper">
        <table className="catalog-table">
          <thead>
            <tr>
              <th>{t.villaId}</th>
              <th>{t.villaName}</th>
              <th>{t.project}</th>
              <th>{t.price}</th>
              <th>{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {catalog.map(villa => (
              <tr key={villa.id}>
                <td>{villa.villaId}</td>
                <td>{villa.name}</td>
                <td>{villa.project}</td>
                <td>{fmtMoney(villa.price, villa.currency)}</td>
                <td>
                  <button 
                    className="btn danger small" 
                    onClick={() => deleteVilla(villa.id)}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Модальное окно добавления */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.addVilla}</h3>
              <button className="btn icon" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>{t.villaId}</label>
                <input 
                  type="text" 
                  value={form.villaId} 
                  onChange={e => setForm(prev => ({...prev, villaId: e.target.value}))}
                  placeholder="V001"
                />
              </div>
              
              <div className="form-group">
                <label>{t.villaName}</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={e => setForm(prev => ({...prev, name: e.target.value}))}
                  placeholder="Вилла на берегу моря"
                />
              </div>
              
              <div className="form-group">
                <label>{t.project}</label>
                <input 
                  type="text" 
                  value={form.project} 
                  onChange={e => setForm(prev => ({...prev, project: e.target.value}))}
                  placeholder="Проект Paradise"
                />
              </div>
              
              <div className="form-group">
                <label>{t.price}</label>
                <input 
                  type="number" 
                  value={form.price} 
                  onChange={e => setForm(prev => ({...prev, price: e.target.value}))}
                  placeholder="500000"
                />
              </div>
              
              <div className="form-group">
                <label>{t.currency}</label>
                <select 
                  value={form.currency} 
                  onChange={e => setForm(prev => ({...prev, currency: e.target.value}))}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="IDR">IDR</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowAddModal(false)}>
                {t.cancel}
              </button>
              <button className="btn primary" onClick={addVilla}>
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== УТИЛИТЫ =====
function fmtMoney(n, c = 'USD') {
  if (typeof n !== 'number' || isNaN(n)) return '0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: c,
    maximumFractionDigits: 2
  }).format(n);
}

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
  
  const [stages, setStages] = useState([
    {id:1,label:'Договор',pct:30,month:0},
    {id:2,label:'50% готовности',pct:30,month:6},
    {id:3,label:'100% готовности',pct:40,month:12}
  ]);
  
  const [catalog, setCatalog] = useState([
    {id:1,villaId:'V001',name:'Вилла на берегу моря',project:'Paradise Resort',price:500000,currency:'USD'},
    {id:2,villaId:'V002',name:'Горная вилла',project:'Mountain View',price:350000,currency:'USD'}
  ]);
  
  const [selectedVillas, setSelectedVillas] = useState([1]);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  // Переводы
  const t = {
    title: lang === 'ru' ? 'Калькулятор рассрочки' : 'Installment Calculator',
    subtitle: lang === 'ru' ? 'для любимых клиентов' : 'for valued clients',
    clientMode: lang === 'ru' ? 'Клиентский режим' : 'Client Mode',
    editorMode: lang === 'ru' ? 'Редакторский режим' : 'Editor Mode',
    enterPin: lang === 'ru' ? 'Введите PIN' : 'Enter PIN',
    pin: lang === 'ru' ? 'PIN' : 'PIN',
    submit: lang === 'ru' ? 'Войти' : 'Submit',
    cancel: lang === 'ru' ? 'Отмена' : 'Cancel',
    wrongPin: lang === 'ru' ? 'Неверный PIN' : 'Wrong PIN',
    language: lang === 'ru' ? 'Язык' : 'Language',
    currency: lang === 'ru' ? 'Валюта' : 'Currency',
    idrPerUsd: lang === 'ru' ? 'IDR за 1 USD' : 'IDR per 1 USD',
    eurPerUsd: lang === 'ru' ? 'EUR за 1 USD' : 'EUR per 1 USD',
    handoverMonth: lang === 'ru' ? 'Месяц сдачи' : 'Handover Month',
    months: lang === 'ru' ? 'Количество месяцев' : 'Number of Months',
    monthlyRate: lang === 'ru' ? 'Месячная ставка %' : 'Monthly Rate %',
    startMonth: lang === 'ru' ? 'Начальный месяц' : 'Start Month',
    stages: lang === 'ru' ? 'Этапы рассрочки' : 'Installment Stages',
    addStage: lang === 'ru' ? 'Добавить этап' : 'Add Stage',
    stage: lang === 'ru' ? 'Этап' : 'Stage',
    percentage: lang === 'ru' ? 'Процент' : 'Percentage',
    month: lang === 'ru' ? 'Месяц' : 'Month',
    delete: lang === 'ru' ? 'Удалить' : 'Delete',
    stagesSum: lang === 'ru' ? 'Сумма этапов' : 'Stages Sum',
    catalog: lang === 'ru' ? 'Каталог' : 'Catalog',
    addFromCatalog: lang === 'ru' ? 'Добавить из каталога' : 'Add from Catalog',
    selectedVillas: lang === 'ru' ? 'Выбрано вилл' : 'Selected Villas',
    addVilla: lang === 'ru' ? 'Добавить виллу' : 'Add Villa',
    villaId: lang === 'ru' ? 'ID виллы' : 'Villa ID',
    villaName: lang === 'ru' ? 'Название' : 'Name',
    project: lang === 'ru' ? 'Проект' : 'Project',
    price: lang === 'ru' ? 'Цена' : 'Price',
    actions: lang === 'ru' ? 'Действия' : 'Actions',
    save: lang === 'ru' ? 'Сохранить' : 'Save',
    catalogTitle: lang === 'ru' ? 'Каталог проектов и вилл' : 'Projects & Villas Catalog',
    cashflow: lang === 'ru' ? 'Кэшфлоу' : 'Cashflow',
    cashMonth: lang === 'ru' ? 'Месяц' : 'Month',
    cashDesc: lang === 'ru' ? 'Описание' : 'Description',
    cashTotal: lang === 'ru' ? 'Сумма' : 'Total',
    cashBalance: lang === 'ru' ? 'Баланс' : 'Balance',
    export: lang === 'ru' ? 'Экспорт' : 'Export',
    exportCsv: lang === 'ru' ? 'CSV' : 'CSV',
    exportExcel: lang === 'ru' ? 'Excel' : 'Excel',
    exportPdf: lang === 'ru' ? 'PDF' : 'PDF'
  };

  // Расчеты
  const stagesSumPct = useMemo(() => stages.reduce((sum, s) => sum + s.pct, 0), [stages]);
  const selectedVillasData = useMemo(() => catalog.filter(v => selectedVillas.includes(v.id)), [catalog, selectedVillas]);
  
  const cashflow = useMemo(() => {
    const result = [];
    let balance = 0;
    
    for (let month = 0; month <= months; month++) {
      const monthData = { month, items: [], total: 0, balance: 0 };
      
      // Добавляем этапы рассрочки
      stages.forEach(stage => {
        if (stage.month === month) {
          const amount = selectedVillasData.reduce((sum, villa) => {
            const villaPrice = villa.currency === 'USD' ? villa.price : 
                             villa.currency === 'EUR' ? villa.price / eurPerUsd :
                             villa.price / idrPerUsd;
            return sum + (villaPrice * stage.pct / 100);
          }, 0);
          
          monthData.items.push(`${stage.label}: ${fmtMoney(amount, currency)}`);
          monthData.total += amount;
        }
      });
      
      // Добавляем месячную ставку
      if (month > 0) {
        const monthlyRate = selectedVillasData.reduce((sum, villa) => {
          const villaPrice = villa.currency === 'USD' ? villa.price : 
                           villa.currency === 'EUR' ? villa.price / eurPerUsd :
                           villa.price / idrPerUsd;
          return sum + (villaPrice * monthlyRatePct / 100);
        }, 0);
        
        monthData.items.push(`Месячная ставка: ${fmtMoney(monthlyRate, currency)}`);
        monthData.total += monthlyRate;
      }
      
      balance += monthData.total;
      monthData.balance = balance;
      result.push(monthData);
    }
    
    return result;
  }, [stages, months, selectedVillasData, monthlyRatePct, currency, eurPerUsd, idrPerUsd]);

  // Функции
  const toggleMode = () => {
    if (isClient) {
      setShowPinModal(true);
    } else {
      setIsClient(true);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput === PIN_CODE) {
      setIsClient(false);
      setShowPinModal(false);
      setPinInput('');
    } else {
      alert(t.wrongPin);
      setPinInput('');
    }
  };

  const addStage = () => {
    const last = stages[stages.length - 1];
    const id = (last?.id || 0) + 1;
    const nextMonth = Math.min(handoverMonth, (last?.month ?? 0) + 1);
    setStages(prev => [...prev, {
      id, 
      label: lang === 'ru' ? 'Этап' : 'Stage', 
      pct: 5, 
      month: nextMonth
    }]);
  };

  const updateStage = (id, field, value) => {
    setStages(prev => prev.map(x => x.id === id ? {...x, [field]: value} : x));
  };

  const deleteStage = (id) => {
    setStages(prev => prev.filter(x => x.id !== id));
  };

  const toggleVillaSelection = (id) => {
    setSelectedVillas(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const exportData = (format) => {
    let data = '';
    let filename = `arconique-cashflow-${new Date().toISOString().split('T')[0]}`;
    
    if (format === 'csv') {
      data = 'Month,Description,Total,Balance\n';
      cashflow.forEach(c => {
        data += `${c.month},${c.items.join('; ')},${c.total},${c.balance}\n`;
      });
      filename += '.csv';
    } else if (format === 'excel') {
      // Простой CSV для Excel
      data = 'Month,Description,Total,Balance\n';
      cashflow.forEach(c => {
        data += `${c.month},${c.items.join('; ')},${c.total},${c.balance}\n`;
      });
      filename += '.csv';
    } else if (format === 'pdf') {
      // Простой текстовый файл (заглушка для PDF)
      data = 'Arconique - Кэшфлоу\n\n';
      cashflow.forEach(c => {
        data += `Месяц ${c.month}:\n`;
        data += `${c.items.join('\n')}\n`;
        data += `Итого: ${fmtMoney(c.total, currency)}\n`;
        data += `Баланс: ${fmtMoney(c.balance, currency)}\n\n`;
      });
      filename += '.txt';
    }
    
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="wrap">
      {/* Заголовок */}
      <header className="header">
        <div className="header-content">
          <h1 className="title">{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </div>
        
        <div className="header-actions">
          <button 
            className={`btn ${isClient ? 'primary' : 'secondary'}`}
            onClick={toggleMode}
          >
            {isClient ? t.editorMode : t.clientMode}
          </button>
          
          <select 
            value={lang} 
            onChange={e => setLang(e.target.value)}
            className="lang-select"
          >
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
        </div>
      </header>

      {/* Основной контент */}
      <main className="main">
        {/* Клиентский режим */}
        {isClient && (
          <div className="client-mode">
            {/* Основные параметры */}
            <div className="card">
              <h3>{t.currency}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>{t.currency}</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="IDR">IDR</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>{t.idrPerUsd}</label>
                  <input 
                    type="number" 
                    value={idrPerUsd} 
                    onChange={e => setIdrPerUsd(parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t.eurPerUsd}</label>
                  <input 
                    type="number" 
                    value={eurPerUsd} 
                    onChange={e => setEurPerUsd(parseFloat(e.target.value))}
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>{t.handoverMonth}</label>
                  <input 
                    type="number" 
                    value={handoverMonth} 
                    onChange={e => setHandoverMonth(parseInt(e.target.value))}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t.months}</label>
                  <input 
                    type="number" 
                    value={months} 
                    onChange={e => setMonths(parseInt(e.target.value))}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t.monthlyRate}</label>
                  <input 
                    type="number" 
                    value={monthlyRatePct} 
                    onChange={e => setMonthlyRatePct(parseFloat(e.target.value))}
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label>{t.startMonth}</label>
                  <input 
                    type="date" 
                    value={startMonth.toISOString().split('T')[0]} 
                    onChange={e => setStartMonth(new Date(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Этапы рассрочки */}
            <div className="card">
              <div className="card-header">
                <h3>{t.stages}</h3>
                <button className="btn primary" onClick={addStage}>
                  {t.addStage}
                </button>
              </div>
              
              <div className="stages-list">
                {stages.map(stage => (
                  <div key={stage.id} className="stage-item">
                    <input 
                      type="text" 
                      value={stage.label} 
                      onChange={e => updateStage(stage.id, 'label', e.target.value)}
                      className="stage-label"
                    />
                    <input 
                      type="number" 
                      value={stage.pct} 
                      onChange={e => updateStage(stage.id, 'pct', parseFloat(e.target.value))}
                      className="stage-pct"
                    />
                    <input 
                      type="number" 
                      value={stage.month} 
                      onChange={e => updateStage(stage.id, 'month', parseInt(e.target.value))}
                      className="stage-month"
                    />
                    <button 
                      className="btn danger small" 
                      onClick={() => deleteStage(stage.id)}
                    >
                      {t.delete}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="stages-sum">
                <strong>{t.stagesSum}: {stagesSumPct}%</strong>
              </div>
            </div>

            {/* Каталог вилл */}
            <div className="card">
              <h3>{t.catalog}</h3>
              <div className="villas-grid">
                {catalog.map(villa => (
                  <div 
                    key={villa.id} 
                    className={`villa-card ${selectedVillas.includes(villa.id) ? 'selected' : ''}`}
                    onClick={() => toggleVillaSelection(villa.id)}
                  >
                    <div className="villa-id">{villa.villaId}</div>
                    <div className="villa-name">{villa.name}</div>
                    <div className="villa-project">{villa.project}</div>
                    <div className="villa-price">{fmtMoney(villa.price, villa.currency)}</div>
                  </div>
                ))}
              </div>
              
              <div className="selected-info">
                <strong>{t.selectedVillas}: {selectedVillas.length}</strong>
              </div>
            </div>

            {/* Кэшфлоу */}
            <div className="card">
              <div className="card-header">
                <h3>{t.cashflow}</h3>
                <div className="export-buttons">
                  <button className="btn" onClick={() => exportData('csv')}>
                    {t.exportCsv}
                  </button>
                  <button className="btn" onClick={() => exportData('excel')}>
                    {t.exportExcel}
                  </button>
                  <button className="btn" onClick={() => exportData('pdf')}>
                    {t.exportPdf}
                  </button>
                </div>
              </div>
              
              <div className="cashflow-scroll">
                <table className="cashflow-table">
                  <thead>
                    <tr>
                      <th>{t.cashMonth}</th>
                      <th style={{textAlign: 'left'}}>{t.cashDesc}</th>
                      <th>{t.cashTotal}</th>
                      <th>{t.cashBalance}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashflow.map(c => (
                      <tr key={c.month}>
                        <td>{c.month}</td>
                        <td style={{textAlign: 'left'}}>{(c.items || []).join('<br>')}</td>
                        <td>{fmtMoney(c.total, currency)}</td>
                        <td>{fmtMoney(c.balance, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Редакторский режим */}
        {!isClient && (
          <div className="editor-mode">
            <h2>{t.editorMode}</h2>
            
            {/* Каталог проектов и вилл */}
            <CatalogManager 
              catalog={catalog} 
              setCatalog={setCatalog} 
              t={t} 
              lang={lang} 
            />
            
            {/* Остальные редакторские функции можно добавить здесь */}
          </div>
        )}
      </main>

      {/* Модальное окно PIN */}
      {showPinModal && (
        <div className="modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.enterPin}</h3>
              <button className="btn icon" onClick={() => setShowPinModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>{t.pin}</label>
                <input 
                  type="password" 
                  value={pinInput} 
                  onChange={e => setPinInput(e.target.value)}
                  placeholder="Введите PIN"
                  onKeyPress={e => e.key === 'Enter' && handlePinSubmit()}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowPinModal(false)}>
                {t.cancel}
              </button>
              <button className="btn primary" onClick={handlePinSubmit}>
                {t.submit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Запуск приложения
ReactDOM.render(<App />, document.getElementById('root'));
