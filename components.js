// ===== ОСНОВНЫЕ КОМПОНЕНТЫ =====

// Главный компонент приложения
const App = React.memo(() => {
  const [lang, setLang] = React.useState('ru');
  const [isClient, setIsClient] = React.useState(true);
  const [currency, setCurrency] = React.useState('USD');
  const [idrPerUsd, setIdrPerUsd] = React.useState(16500);
  const [eurPerUsd, setEurPerUsd] = React.useState(0.92);
  const [handoverMonth, setHandoverMonth] = React.useState(12);
  const [months, setMonths] = React.useState(12);
  const [monthlyRatePct, setMonthlyRatePct] = React.useState(8.33);
  const [startMonth, setStartMonth] = React.useState(new Date());
  const [stages, setStages] = React.useState([
    {id:1,label:'Договор',pct:30,month:0},
    {id:2,label:'50% готовности',pct:30,month:6},
    {id:3,label:'70% готовности',pct:20,month:9},
    {id:4,label:'90% готовности',pct:15,month:11},
    {id:5,label:'Ключи',pct:5,month:12},
  ]);
  const [catalog, setCatalog] = React.useState(DEFAULT_CATALOG);
  const [lines, setLines] = React.useState([
    {id:1,projectId:'enso',villaId:'enso-2br',qty:1,prePct:70,ownTerms:false,months:null,monthlyRatePct:null,firstPostUSD:0,discountPct:0,
     snapshot:{name:'Enso 2BR',area:100,ppsm:2500,baseUSD:250000}}
  ]);

  // Состояния для модальных окон
  const [showAddProjectModal, setShowAddProjectModal] = React.useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [catalogModalOpen, setCatalogModalOpen] = React.useState(false);

  // Уведомления
  const [notifications, setNotifications] = React.useState([]);

  // Сохраненные сценарии
  const [savedScenarios, setSavedScenarios] = React.useState([]);
  const [currentScenarioName, setCurrentScenarioName] = React.useState('');

  const t = T[lang];
  const toCurrency = usd => currency === 'USD' ? usd : (currency === 'IDR' ? usd * idrPerUsd : usd * eurPerUsd);

  // Мемоизированные вычисления
  const stagesSumPct = React.useMemo(() => stages.reduce((s, x) => s + (+x.pct || 0), 0), [stages]);
  
  const linesData = React.useMemo(() => calculateLinesData(lines, stages, stagesSumPct, handoverMonth, months, monthlyRatePct, lang), 
    [lines, stages, stagesSumPct, handoverMonth, months, monthlyRatePct, lang]);
  
  const project = React.useMemo(() => calculateProject(linesData, handoverMonth, lang), [linesData, handoverMonth, lang]);

  // Эффекты
  React.useEffect(() => {
    loadAppState();
    document.getElementById('app-title').textContent = t.title;
    document.title = t.title;
  }, []);

  React.useEffect(() => {
    saveAppState();
    document.getElementById('app-title').textContent = t.title;
    document.title = t.title;
  }, [lang, currency, idrPerUsd, eurPerUsd, handoverMonth, months, monthlyRatePct, stages, catalog, lines, startMonth]);

  // Функции
  const snapshot = () => ({lang, currency, idrPerUsd, eurPerUsd, handoverMonth, months, monthlyRatePct, stages, catalog, lines, startMonth});
  
  const loadAppState = async () => {
    try {
      const fromUrl = decodeState();
      const saved = fromUrl?.state || JSON.parse(localStorage.getItem('arconique_v77') || 'null');
      if (saved) {
        if (saved.lang) setLang(saved.lang);
        if (saved.currency) setCurrency(saved.currency);
        if (typeof saved.idrPerUsd === 'number') setIdrPerUsd(saved.idrPerUsd);
        if (typeof saved.eurPerUsd === 'number') setEurPerUsd(saved.eurPerUsd);
        if (typeof saved.handoverMonth === 'number') setHandoverMonth(saved.handoverMonth);
        if (typeof saved.months === 'number') setMonths(saved.months);
        if (typeof saved.monthlyRatePct === 'number') setMonthlyRatePct(saved.monthlyRatePct);
        if (Array.isArray(saved.stages)) setStages(saved.stages);
        if (Array.isArray(saved.catalog)) setCatalog(saved.catalog);
        if (Array.isArray(saved.lines)) setLines(saved.lines);
        if (saved.startMonth) setStartMonth(new Date(saved.startMonth));
        if (Array.isArray(saved.savedScenarios)) setSavedScenarios(saved.savedScenarios);
      }
      
      const view = (fromUrl?.view) || (new URLSearchParams(location.hash.slice(1)).get('view'));
      if (view === 'editor') {
        const ok = await verifyPinFlow();
        setIsClient(!ok);
        if (!ok) {
          const url = encodeState(snapshot(), {view: 'client'});
          if (url) history.replaceState(null, '', url);
          showNotification(lang === 'ru' ? 'Неверный PIN — открыт клиентский режим' : 'Wrong PIN — opened client view', 'warning');
        }
      } else setIsClient(true);
    } catch (e) { 
      console.error(e);
      showNotification('Ошибка загрузки данных', 'error');
    }
  };

  const saveAppState = () => {
    localStorage.setItem('arconique_v77', JSON.stringify(snapshot()));
  };

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type, timestamp: Date.now() };
    setNotifications(prev => [...prev, notification]);
    
    // Автоудаление через 5 секунд
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const saveScenario = () => {
    if (!currentScenarioName.trim()) {
      showNotification('Введите название сценария', 'warning');
      return;
    }
    
    const scenario = {
      id: Date.now(),
      name: currentScenarioName.trim(),
      data: snapshot(),
      createdAt: new Date().toISOString()
    };
    
    setSavedScenarios(prev => [...prev, scenario]);
    setCurrentScenarioName('');
    showNotification(`Сценарий "${scenario.name}" сохранен`, 'success');
  };

  const loadScenario = (scenario) => {
    try {
      const { lang: sLang, currency: sCurrency, idrPerUsd: sIdr, eurPerUsd: sEur, 
              handoverMonth: sHandover, months: sMonths, monthlyRatePct: sRate, 
              stages: sStages, catalog: sCatalog, lines: sLines, startMonth: sStart } = scenario.data;
      
      setLang(sLang);
      setCurrency(sCurrency);
      setIdrPerUsd(sIdr);
      setEurPerUsd(sEur);
      setHandoverMonth(sHandover);
      setMonths(sMonths);
      setMonthlyRatePct(sRate);
      setStages(sStages);
      setCatalog(sCatalog);
      setLines(sLines);
      setStartMonth(new Date(sStart));
      
      showNotification(`Сценарий "${scenario.name}" загружен`, 'success');
    } catch (e) {
      showNotification('Ошибка загрузки сценария', 'error');
    }
  };

  const deleteScenario = (scenarioId) => {
    setSavedScenarios(prev => prev.filter(s => s.id !== scenarioId));
    showNotification('Сценарий удален', 'info');
  };

  const share = async (view) => {
    const url = encodeState(snapshot(), {view});
    if (url) {
      await navigator.clipboard.writeText(url);
      showNotification(t.shareCopied, 'success');
    }
  };

  const updLine = (id, patch) => setLines(prev => prev.map(l => l.id === id ? {...l, ...patch} : l));
  const delLine = (id) => setLines(prev => prev.filter(l => l.id !== id));
  const dupLine = (id) => setLines(prev => {
    const src = prev.find(x => x.id === id);
    if (!src) return prev;
    const nid = (prev[prev.length - 1]?.id || 0) + 1;
    return [...prev, {...src, id: nid, qty: 1}];
  });

  return (
    <>
      {/* Уведомления */}
      <NotificationCenter notifications={notifications} onClose={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
      
      <div className="grid">
        {/* Левая панель - настройки */}
        <SettingsPanel 
          lang={lang} setLang={setLang}
          currency={currency} setCurrency={setCurrency}
          idrPerUsd={idrPerUsd} setIdrPerUsd={setIdrPerUsd}
          eurPerUsd={eurPerUsd} setEurPerUsd={setEurPerUsd}
          handoverMonth={handoverMonth} setHandoverMonth={setHandoverMonth}
          months={months} setMonths={setMonths}
          monthlyRatePct={monthlyRatePct} setMonthlyRatePct={setMonthlyRatePct}
          startMonth={startMonth}
          stages={stages} setStages={setStages}
          stagesSumPct={stagesSumPct}
          isClient={isClient}
          t={t}
          onShare={share}
        />

        {/* Правая панель - расчеты */}
        <CalculationPanel 
          lines={lines} linesData={linesData}
          project={project}
          catalog={catalog}
          isClient={isClient}
          currency={currency}
          toCurrency={toCurrency}
          t={t}
          onUpdateLine={updLine}
          onDeleteLine={delLine}
          onDuplicateLine={dupLine}
          onAddFromCatalog={() => setModalOpen(true)}
          onExportCSV={() => exportCSV(project, t, currency, toCurrency)}
          onExportXLSX={() => exportXLSX(project, linesData, t, currency, toCurrency)}
          onExportPDF={() => exportPDF(project, linesData, t, currency, toCurrency)}
        />
      </div>

      {/* Модальные окна */}
      <CatalogModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
        catalog={catalog}
        stagesSumPct={stagesSumPct}
        onAddLine={(line) => {
          setLines(prev => [...prev, line]);
          setModalOpen(false);
        }}
        t={t}
      />

      <ProjectModal 
        open={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        onSave={(project) => {
          setCatalog(prev => [...prev, project]);
          setShowAddProjectModal(false);
          showNotification('Проект добавлен', 'success');
        }}
        t={t}
      />

      <VillaModal 
        open={showAddVillaModal}
        onClose={() => setShowAddVillaModal(false)}
        projectId={editingProject}
        onSave={(villa) => {
          setCatalog(prev => prev.map(p => 
            p.projectId === editingProject 
              ? {...p, villas: [...p.villas, villa]}
              : p
          ));
          setShowAddVillaModal(false);
          setEditingProject(null);
          showNotification('Вилла добавлена', 'success');
        }}
        t={t}
      />

      {/* Панель сценариев */}
      <ScenariosPanel 
        scenarios={savedScenarios}
        currentName={currentScenarioName}
        onNameChange={setCurrentScenarioName}
        onSave={saveScenario}
        onLoad={loadScenario}
        onDelete={deleteScenario}
        t={t}
      />
    </>
  );
});

// ===== КОМПОНЕНТЫ ПАНЕЛЕЙ =====

// Панель настроек
const SettingsPanel = React.memo(({ 
  lang, setLang, currency, setCurrency, idrPerUsd, setIdrPerUsd, eurPerUsd, setEurPerUsd,
  handoverMonth, setHandoverMonth, months, setMonths, monthlyRatePct, setMonthlyRatePct,
  startMonth, stages, setStages, stagesSumPct, isClient, t, onShare 
}) => {
  return (
    <div className="card">
      {/* Язык и валюта */}
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
      </div>

      {/* Курсы валют (только для редактора) */}
      {!isClient && (
        <div className="row">
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
        </div>
      )}

      {/* Начальный месяц */}
      <div className="row">
        <div className="field compact">
          <label>{t.startMonth}</label>
          <div className="info-display">
            {startMonth.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Основные настройки */}
      <div className="row">
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

      <div className="hr"></div>

      {/* Этапы рассрочки */}
      <StagesManager 
        stages={stages} 
        setStages={setStages} 
        handoverMonth={handoverMonth}
        stagesSumPct={stagesSumPct}
        lang={lang}
        t={t}
      />

      <div className="hr"></div>

      {/* Кнопки поделиться */}
      {!isClient && (
        <div className="row">
          <button className="btn primary" onClick={() => onShare('editor')}>
            Поделиться (редактор)
          </button>
          <button className="btn" onClick={() => onShare('client')}>
            Поделиться (клиент)
          </button>
        </div>
      )}
      {isClient && (
        <div className="row">
          <button className="btn" onClick={() => onShare('client')}>
            Поделиться
          </button>
        </div>
      )}
    </div>
  );
});

// ===== ПРОДОЛЖЕНИЕ КОМПОНЕНТОВ =====

// Менеджер этапов рассрочки
const StagesManager = React.memo(({ stages, setStages, handoverMonth, stagesSumPct, lang, t }) => {
  const addStage = React.useCallback(() => {
    setStages(prev => {
      const last = prev[prev.length - 1];
      const id = (last?.id || 0) + 1;
      const nextMonth = Math.min(handoverMonth, (last?.month ?? 0) + 1);
      return [...prev, {id, label: (lang === 'ru' ? 'Этап' : 'Stage'), pct: 5, month: nextMonth}];
    });
  }, [setStages, handoverMonth, lang]);

  const updateStage = React.useCallback((id, field, value) => {
    setStages(prev => prev.map(x => x.id === id ? {...x, [field]: value} : x));
  }, [setStages]);

  const deleteStage = React.useCallback((id) => {
    setStages(prev => prev.filter(x => x.id !== id));
  }, [setStages]);

  return (
    <>
      <h3 style={{margin: '6px 0'}}>{t.stagesTitle}</h3>
      
      <div className="stages-scroll">
        <table className="stages-table">
          <thead>
            <tr>
              <th className="col-stage">{t.stage}</th>
              <th className="col-percent">{t.percent}</th>
              <th className="col-month">{t.month}</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {stages.map(s => (
              <tr key={s.id}>
                <td className="col-stage">
                  <input 
                    type="text" 
                    className="stage-input"
                    value={s.label} 
                    onChange={e => updateStage(s.id, 'label', e.target.value)}
                  />
                </td>
                <td className="col-percent">
                  <input 
                    type="number" 
                    className="stage-number-input"
                    min="0" 
                    max="100"
                    step="0.01" 
                    value={s.pct} 
                    onChange={e => updateStage(s.id, 'pct', clamp(parseFloat(e.target.value || 0), 0, 100))}
                  />
                </td>
                <td className="col-month">
                  <input 
                    type="number" 
                    className="stage-number-input"
                    min="0" 
                    step="1" 
                    value={s.month} 
                    onChange={e => updateStage(s.id, 'month', clamp(parseInt(e.target.value || 0, 10), 0, handoverMonth))}
                  />
                </td>
                <td className="col-actions">
                  <div className="stage-actions">
                    <button className="delete-stage-btn" onClick={() => deleteStage(s.id)}>
                      {t.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="row" style={{marginTop: 8, alignItems: 'center', justifyContent: 'space-between'}}>
        <button className="btn primary" onClick={addStage}>{t.addStage}</button>
        {(() => {
          const vals = stages.map(s => s.pct || 0);
          const allSame = vals.length ? vals.every(v => v === vals[0]) : true;
          const targetText = allSame ? `${vals[0] || 0}%` : `${Math.min(...vals || [0])}%–${Math.max(...vals || [0])}%`;
          const mismatch = allSame ? (Math.round(stagesSumPct * 100) / 100 !== (vals[0] || 0)) : true;
          return (
            <div className={`hint ${mismatch ? 'warn' : ''}`}>
              {t.sumStages}: {Math.round(stagesSumPct * 100) / 100}% · {t.targetPrepay}: {targetText} 
              {mismatch ? (allSame ? ` ${t.mismatch}` : ` (${t.mixedTargets})`) : ''}
            </div>
          );
        })()}
      </div>
    </>
  );
});

// Панель расчетов
const CalculationPanel = React.memo(({ 
  lines, linesData, project, catalog, isClient, currency, toCurrency, t,
  onUpdateLine, onDeleteLine, onDuplicateLine, onAddFromCatalog,
  onExportCSV, onExportXLSX, onExportPDF 
}) => {
  const chartRef = React.useRef(null);
  const chartObj = React.useRef(null);

  // Инициализация графика
  React.useEffect(() => {
    try {
      const ctx = chartRef.current?.getContext('2d');
      if (!ctx) return;
      
      if (chartObj.current) chartObj.current.destroy();
      
      chartObj.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: project.cashflow.map(c => formatMonth(c.month)),
          datasets: [{
            label: T[lang].chartTitle,
            data: project.cashflow.map(c => toCurrency(c.amountUSD))
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (c) => fmtMoney(c.parsed.y, currency)
              }
            }
          },
          scales: {
            y: {
              ticks: {
                callback: (v) => fmtMoney(v, currency)
              }
            }
          }
        }
      });
    } catch (e) {
      console.warn('Chart.js не загрузился:', e);
    }
  }, [project.cashflow, currency, toCurrency, lang]);

  return (
    <div className="card">
      {/* Заголовок с информацией */}
      <div className="row" style={{justifyContent: 'space-between', alignItems: 'baseline'}}>
        <div className="row">
          <span className="badge">{t.lines}: {lines.length}</span>
          <span className="badge">{t.keys} {project.handoverMonth} мес.</span>
          {!isClient && <span className="badge">{t.months}: {project.months}</span>}
        </div>
        <div className="muted">{isClient ? t.client : t.editor}</div>
      </div>

      {/* KPI блок */}
      <KPIBlock 
        isClient={isClient} 
        t={t} 
        totals={project.totals} 
        currency={currency} 
        toCurrency={toCurrency}
      />

      <div className="hr"></div>

      {/* Таблица расчетов */}
      <div className="calculation-header">
        <h3 style={{margin: '6px 0'}}>{t.villasTitle}</h3>
        <button className="btn success" onClick={onAddFromCatalog}>
          {t.addFromCatalog}
        </button>
      </div>

      <CalculationTable 
        linesData={linesData}
        isClient={isClient}
        currency={currency}
        toCurrency={toCurrency}
        t={t}
        onUpdateLine={onUpdateLine}
        onDeleteLine={onDeleteLine}
        onDuplicateLine={onDuplicateLine}
      />

      <div className="hr"></div>

      {/* Кэшфлоу */}
      <h3 style={{margin: '6px 0'}}>{t.cashflowTitle}</h3>
      
      <div className="row" style={{justifyContent: 'space-between', alignItems: 'center'}}>
        <div className="export-buttons">
          <button className="btn" onClick={onExportCSV}>{t.exportCSV}</button>
          <button className="btn" onClick={onExportXLSX}>{t.exportXLSX}</button>
          <button className="btn" onClick={onExportPDF}>{t.exportPDF}</button>
        </div>
      </div>

      <CashflowTable 
        cashflow={project.cashflow}
        t={t}
        currency={currency}
        toCurrency={toCurrency}
      />

      <div className="hr"></div>

      {/* График */}
      <canvas ref={chartRef} style={{height: '200px', width: '100%'}}></canvas>

      {/* Каталог (только для редактора) */}
      {!isClient && (
        <CatalogEditor 
          catalog={catalog}
          t={t}
        />
      )}
    </div>
  );
});

// Таблица расчетов
const CalculationTable = React.memo(({ 
  linesData, isClient, currency, toCurrency, t,
  onUpdateLine, onDeleteLine, onDuplicateLine 
}) => {
  return (
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
            <th className="col-first">{t.firstPost}</th>
            <th className="col-lineTotal">{t.lineTotal}</th>
            <th className="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          {linesData.map(ld => {
            const projName = findProject(ld.line.projectId)?.projectName || ld.line.projectId;
            const villaName = ld.line.snapshot?.name || ld.line.villaId;
            
            return (
              <tr key={ld.line.id}>
                <td className="col-project" style={{textAlign: 'left'}}>
                  <div className="project-name-display">{projName}</div>
                </td>
                <td className="col-villa" style={{textAlign: 'left'}}>
                  <div className="villa-name-display">{villaName}</div>
                </td>
                <td className="col-qty">
                  <input 
                    type="number" 
                    min="1" 
                    step="1" 
                    value={ld.line.qty} 
                    onChange={e => onUpdateLine(ld.line.id, {qty: clamp(parseInt(e.target.value || 0, 10), 1, 9999)})}
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
                  {fmtMoney(toCurrency(ld.base), currency)}
                </td>
                {!isClient && (
                  <td className="col-disc">
                    <input 
                      type="number" 
                      min="0" 
                      max="20" 
                      step="0.1" 
                      value={ld.line.discountPct || 0} 
                      onChange={e => onUpdateLine(ld.line.id, {discountPct: clamp(parseFloat(e.target.value || 0), 0, 20)})}
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
                      onUpdateLine(ld.line.id, { prePct: clampedValue });
                    }}
                    style={{width: '100%', minWidth: '80px'}}
                  />
                  <div className="pill">{Math.max(50, Math.min(100, ld.prePct || 0))}%</div>
                </td>
                {!isClient && (
                  <>
                    <td className="col-months">
                      <input 
                        type="checkbox" 
                        checked={ld.line.ownTerms || false} 
                        onChange={e => onUpdateLine(ld.line.id, {ownTerms: e.target.checked})}
                      />
                      <input 
                        type="number" 
                        min="6" 
                        step="1" 
                        value={ld.line.months || months} 
                        onChange={e => onUpdateLine(ld.line.id, {months: clamp(parseInt(e.target.value || 0, 10), 6, 120)})}
                        disabled={!ld.line.ownTerms}
                        style={{width: '100%', minWidth: '50px'}}
                      />
                    </td>
                    <td className="col-rate">
                      <input 
                        type="number" 
                        min="0" 
                        step="0.01" 
                        value={ld.line.monthlyRatePct || monthlyRatePct} 
                        onChange={e => onUpdateLine(ld.line.id, {monthlyRatePct: clamp(parseFloat(e.target.value || 0), 0, 1000)})}
                        disabled={!ld.line.ownTerms}
                        style={{width: '100%', minWidth: '60px'}}
                      />
                    </td>
                  </>
                )}
                <td className="col-first">
                  <input 
                    type="number" 
                    min="0" 
                    step="1" 
                    value={ld.line.firstPostUSD || 0} 
                    onChange={e => onUpdateLine(ld.line.id, {firstPostUSD: clamp(parseFloat(e.target.value || 0), 0, ld.base)})}
                    style={{width: '100%', minWidth: '80px'}}
                  />
                </td>
                <td className="col-lineTotal line-total">
                  {fmtMoney(toCurrency(ld.lineTotal), currency)}
                </td>
                <td className="col-actions">
                  <div className="row" style={{gap: 4}}>
                    <button className="btn icon" onClick={() => onDuplicateLine(ld.line.id)}>📋</button>
                    {!isClient && (
                      <button className="btn danger icon" onClick={() => onDeleteLine(ld.line.id)}>🗑️</button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

// ===== ПРОДОЛЖЕНИЕ КОМПОНЕНТОВ =====

// Таблица кэшфлоу
const CashflowTable = React.memo(({ cashflow, t, currency, toCurrency }) => {
  return (
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
              <td>{formatMonth(c.month)}</td>
              <td style={{textAlign: 'left'}}>{(c.items || []).join(' + ')}</td>
              <td>{fmtMoney(toCurrency(c.amountUSD), currency)}</td>
              <td>{fmtMoney(toCurrency(c.balanceUSD), currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// KPI блок
const KPIBlock = React.memo(({ isClient, t, totals, currency, toCurrency }) => {
  return (
    <div className="kpis">
      <div className="kpi">
        <div className="muted">{t.base}</div>
        <div className="v">{fmtMoney(toCurrency(totals.baseUSD), currency)}</div>
      </div>
      <div className="kpi">
        <div className="muted">{t.prepay}</div>
        <div className="v">{fmtMoney(toCurrency(totals.preUSD), currency)}</div>
      </div>
      <div className="kpi">
        <div className="muted">{t.after}</div>
        <div className="v">{fmtMoney(toCurrency(totals.afterUSD), currency)}</div>
      </div>
      {!isClient && (
        <div className="kpi">
          <div className="muted">{t.interestTotal}</div>
          <div className="v">{fmtMoney(toCurrency(totals.interestUSD), currency)}</div>
        </div>
      )}
      <div className="kpi">
        <div className="muted">{t.final}</div>
        <div className="v">{fmtMoney(toCurrency(totals.finalUSD), currency)}</div>
      </div>
    </div>
  );
});

// Редактор каталога
const CatalogEditor = React.memo(({ catalog, t }) => {
  const [showAddProjectModal, setShowAddProjectModal] = React.useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState(null);
  const [newProjectForm, setNewProjectForm] = React.useState({
    projectId: '',
    projectName: '',
    villas: []
  });
  const [newVillaForm, setNewVillaForm] = React.useState({
    villaId: '',
    name: '',
    area: 100,
    ppsm: 2500,
    baseUSD: 250000
  });

  const addProject = React.useCallback(() => {
    setNewProjectForm({
      projectId: '',
      projectName: '',
      villas: []
    });
    setShowAddProjectModal(true);
  }, []);

  const saveProject = React.useCallback(() => {
    if (!newProjectForm.projectId || !newProjectForm.projectName) {
      alert('Заполните ID и название проекта');
      return;
    }
    
    const projectExists = catalog.find(p => p.projectId === newProjectForm.projectId);
    if (projectExists) {
      alert('Проект с таким ID уже существует');
      return;
    }

    const newProject = {
      projectId: newProjectForm.projectId,
      projectName: newProjectForm.projectName,
      villas: newProjectForm.villas
    };

    setCatalog(prev => [...prev, newProject]);
    setShowAddProjectModal(false);
    setNewProjectForm({ projectId: '', projectName: '', villas: [] });
  }, [newProjectForm, catalog, setCatalog]);

  const addVilla = React.useCallback((projectId) => {
    setNewVillaForm({
      villaId: '',
      name: '',
      area: 100,
      ppsm: 2500,
      baseUSD: 250000
    });
    setEditingProject(projectId);
    setShowAddVillaModal(true);
  }, []);

  const saveVilla = React.useCallback(() => {
    if (!newVillaForm.villaId || !newVillaForm.name) {
      alert('Заполните ID и название виллы');
      return;
    }

    const project = catalog.find(p => p.projectId === editingProject);
    if (!project) return;

    const villaExists = project.villas.find(v => v.villaId === newVillaForm.villaId);
    if (villaExists) {
      alert('Вилла с таким ID уже существует в этом проекте');
      return;
    }

    const newVilla = {
      villaId: newVillaForm.villaId,
      name: newVillaForm.name,
      area: newVillaForm.area,
      ppsm: newVillaForm.ppsm,
      baseUSD: newVillaForm.baseUSD
    };

    setCatalog(prev => prev.map(p => 
      p.projectId === editingProject 
        ? { ...p, villas: [...p.villas, newVilla] }
        : p
    ));

    setShowAddVillaModal(false);
    setEditingProject(null);
    setNewVillaForm({ villaId: '', name: '', area: 100, ppsm: 2500, baseUSD: 250000 });
  }, [newVillaForm, editingProject, catalog, setCatalog]);

  return (
    <>
      <div className="hr"></div>
      <h3 style={{margin: '6px 0'}}>{t.catalogTitle}</h3>
      
      <div className="row" style={{gap: 'var(--spacing-md)'}}>
        <button className="btn success" onClick={addProject}>{t.addProject}</button>
        <button className="btn" onClick={() => {
          const json = prompt('Paste catalog JSON:', JSON.stringify(catalog, null, 2));
          if (!json) return;
          try {
            const obj = JSON.parse(json);
            if (Array.isArray(obj)) setCatalog(obj);
            else alert('Invalid JSON');
          } catch {
            alert('Invalid JSON');
          }
        }}>{t.importJSON}</button>
        <button className="btn" onClick={() => {
          const blob = new Blob([JSON.stringify(catalog, null, 2)], {type: 'application/json'});
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `arconique_catalog_${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(a.href);
        }}>{t.exportJSON}</button>
      </div>
      
      <div className="scroll" style={{maxHeight: '32vh'}}>
        {catalog.map(p => (
          <div key={p.projectId} className="catalog-card">
            <div className="catalog-header">
              <div className="row" style={{flex: 1}}>
                <span className="badge">{t.project}:</span>
                <input 
                  type="text" 
                  value={p.projectName} 
                  onChange={e => setCatalog(prev => prev.map(x => 
                    x.projectId === p.projectId ? {...x, projectName: e.target.value} : x
                  ))}
                  style={{flex: 1, marginRight: 8}}
                />
                <span className="pill">{p.projectId}</span>
              </div>
              <div className="catalog-actions">
                <button className="btn primary" onClick={() => addVilla(p.projectId)}>
                  {t.addVilla}
                </button>
                <button className="btn danger" onClick={() => {
                  if (confirm(t.remove + ' ' + p.projectName + '?')) {
                    setCatalog(prev => prev.filter(x => x.projectId !== p.projectId));
                  }
                }}>{t.remove}</button>
              </div>
            </div>
            
            <table className="catalog-table">
              <thead>
                <tr>
                  <th style={{textAlign: 'left'}}>{t.villa}</th>
                  <th>{t.area}</th>
                  <th>{t.ppsm}</th>
                  <th>{t.price}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {p.villas.map(v => (
                  <tr key={v.villaId}>
                    <td style={{textAlign: 'left'}}>
                      <input 
                        value={v.name} 
                        onChange={e => setCatalog(prev => prev.map(pr => 
                          pr.projectId === p.projectId 
                            ? {...pr, villas: pr.villas.map(vv => 
                                vv.villaId === v.villaId ? {...vv, name: e.target.value} : vv
                              )}
                            : pr
                        ))}
                      />
                      <div className="muted" style={{fontSize: 10}}>{v.villaId}</div>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="1" 
                        step="0.1" 
                        value={v.area} 
                        onChange={e => setCatalog(prev => prev.map(pr => 
                          pr.projectId === p.projectId 
                            ? {...pr, villas: pr.villas.map(vv => 
                                vv.villaId === v.villaId ? {...vv, area: clamp(parseFloat(e.target.value || 0), 1, 100000)} : vv
                              )}
                            : pr
                        ))}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="0" 
                        step="1" 
                        value={v.ppsm} 
                        onChange={e => setCatalog(prev => prev.map(pr => 
                          pr.projectId === p.projectId 
                            ? {...pr, villas: pr.villas.map(vv => 
                                vv.villaId === v.villaId ? {...vv, ppsm: clamp(parseFloat(e.target.value || 0), 0, 1e9)} : vv
                              )}
                            : pr
                        ))}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="0" 
                        step="1" 
                        value={v.baseUSD} 
                        onChange={e => setCatalog(prev => prev.map(pr => 
                          pr.projectId === p.projectId 
                            ? {...pr, villas: pr.villas.map(vv => 
                                vv.villaId === v.villaId ? {...vv, baseUSD: clamp(parseFloat(e.target.value || 0), 0, 1e12)} : vv
                              )}
                            : pr
                        ))}
                      />
                    </td>
                    <td>
                      <button 
                        className="btn danger icon" 
                        onClick={() => {
                          if (confirm(t.remove + ' ' + v.name + '?')) {
                            setCatalog(prev => prev.map(pr => 
                              pr.projectId === p.projectId 
                                ? {...pr, villas: pr.villas.filter(vv => vv.villaId !== v.villaId)}
                                : pr
                            ));
                          }
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Модальные окна для каталога */}
      <ProjectModal 
        open={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        onSave={saveProject}
        form={newProjectForm}
        setForm={setNewProjectForm}
        t={t}
      />

      <VillaModal 
        open={showAddVillaModal}
        onClose={() => setShowAddVillaModal(false)}
        onSave={saveVilla}
        form={newVillaForm}
        setForm={setNewVillaForm}
        t={t}
      />
    </>
  );
});

// Модальное окно добавления проекта
const ProjectModal = React.memo(({ open, onClose, onSave, form, setForm, t }) => {
  if (!open) return null;

  const handleSave = () => {
    if (!form.projectId || !form.projectName) {
      alert('Заполните ID и название проекта');
      return;
    }
    onSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t.addProject}</h3>
          <button className="btn icon" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label>{t.projectId}</label>
                <input 
                  type="text" 
                  placeholder="project-id"
                  value={form.projectId}
                  onChange={e => setForm(prev => ({ ...prev, projectId: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>{t.projectName}</label>
                <input 
                  type="text" 
                  placeholder={t.projectName}
                  value={form.projectName}
                  onChange={e => setForm(prev => ({ ...prev, projectName: e.target.value }))}
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button className="btn" onClick={onClose}>{t.cancel}</button>
            <button className="btn success" onClick={handleSave}>{t.save}</button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ===== ПРОДОЛЖЕНИЕ КОМПОНЕНТОВ =====

// Модальное окно добавления виллы
const VillaModal = React.memo(({ open, onClose, onSave, form, setForm, t }) => {
  if (!open) return null;

  const handleSave = () => {
    if (!form.villaId || !form.name) {
      alert('Заполните ID и название виллы');
      return;
    }
    onSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t.addVilla}</h3>
          <button className="btn icon" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label>{t.villaId}</label>
                <input 
                  type="text" 
                  placeholder="villa-id"
                  value={form.villaId}
                  onChange={e => setForm(prev => ({ ...prev, villaId: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>{t.villaName}</label>
                <input 
                  type="text" 
                  placeholder={t.villaName}
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t.villaArea}</label>
                <input 
                  type="number" 
                  min="1" 
                  step="0.1" 
                  placeholder="100"
                  value={form.area}
                  onChange={e => setForm(prev => ({ ...prev, area: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="form-group">
                <label>{t.villaPpsm}</label>
                <input 
                  type="number" 
                  min="0" 
                  step="1" 
                  placeholder="2500"
                  value={form.ppsm}
                  onChange={e => setForm(prev => ({ ...prev, ppsm: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>{t.villaBasePrice}</label>
                <input 
                  type="number" 
                  min="0" 
                  step="1000" 
                  placeholder="250000"
                  value={form.baseUSD}
                  onChange={e => setForm(prev => ({ ...prev, baseUSD: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button className="btn" onClick={onClose}>{t.cancel}</button>
            <button className="btn success" onClick={handleSave}>{t.save}</button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Модальное окно выбора из каталога
const CatalogModal = React.memo(({ open, onClose, catalog, stagesSumPct, onAddLine, t }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState({
    areaFrom: '',
    areaTo: '',
    priceFrom: '',
    priceTo: '',
    sortBy: 'name'
  });

  if (!open) return null;

  // Фильтрация и сортировка каталога
  const filteredCatalog = React.useMemo(() => {
    let filtered = catalog.map(p => ({
      ...p,
      villas: p.villas.filter(v => {
        const matchesSearch = 
          p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.villaId.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesArea = 
          (!filters.areaFrom || v.area >= parseFloat(filters.areaFrom)) &&
          (!filters.areaTo || v.area <= parseFloat(filters.areaTo));
        
        const matchesPrice = 
          (!filters.priceFrom || v.baseUSD >= parseFloat(filters.priceFrom)) &&
          (!filters.priceTo || v.baseUSD <= parseFloat(filters.priceTo));
        
        return matchesSearch && matchesArea && matchesPrice;
      })
    })).filter(p => p.villas.length > 0);

    // Сортировка
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price':
          return Math.min(...a.villas.map(v => v.baseUSD)) - Math.min(...b.villas.map(v => v.baseUSD));
        case 'area':
          return Math.min(...a.villas.map(v => v.area)) - Math.min(...b.villas.map(v => v.area));
        case 'name':
        default:
          return a.projectName.localeCompare(b.projectName);
      }
    });

    return filtered;
  }, [catalog, searchQuery, filters]);

  const handleAddLine = (project, villa) => {
    const newLine = {
      id: Date.now() + Math.random(),
      projectId: project.projectId,
      villaId: villa.villaId,
      qty: 1,
      prePct: stagesSumPct,
      ownTerms: false,
      months: null,
      monthlyRatePct: null,
      firstPostUSD: 0,
      discountPct: 0,
      snapshot: {
        name: villa.name,
        area: villa.area,
        ppsm: villa.ppsm,
        baseUSD: villa.baseUSD
      }
    };
    onAddLine(newLine);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t.selectFromCatalog}</h3>
          <button className="btn icon" onClick={onClose}>✕</button>
        </div>
        
        <div className="modal-body">
          <div className="search-filters">
            <input 
              type="text" 
              placeholder={t.search} 
              className="search-input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            
            <div className="filter-row">
              <div className="filter-group">
                <label>{t.areaFrom}</label>
                <input 
                  type="number" 
                  min="0" 
                  step="1" 
                  placeholder="0"
                  value={filters.areaFrom}
                  onChange={e => setFilters(prev => ({ ...prev, areaFrom: e.target.value }))}
                />
              </div>
              <div className="filter-group">
                <label>{t.areaTo}</label>
                <input 
                  type="number" 
                  min="0" 
                  step="1" 
                  placeholder="1000"
                  value={filters.areaTo}
                  onChange={e => setFilters(prev => ({ ...prev, areaTo: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label>{t.priceFrom}</label>
                <input 
                  type="number" 
                  min="0" 
                  step="1000" 
                  placeholder="0"
                  value={filters.priceFrom}
                  onChange={e => setFilters(prev => ({ ...prev, priceFrom: e.target.value }))}
                />
              </div>
              <div className="filter-group">
                <label>{t.priceTo}</label>
                <input 
                  type="number" 
                  min="0" 
                  step="1000" 
                  placeholder="1000000"
                  value={filters.priceTo}
                  onChange={e => setFilters(prev => ({ ...prev, priceTo: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="filter-row">
              <div className="filter-group">
                <label>{t.sort}</label>
                <select 
                  value={filters.sortBy}
                  onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                >
                  <option value="name">{t.byName}</option>
                  <option value="area">{t.byArea}</option>
                  <option value="price">{t.byPrice}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="catalog-selection">
            {filteredCatalog.map(p => (
              <div key={p.projectId} className="catalog-selection-project">
                <h4>{p.projectName}</h4>
                <div className="villas-selection">
                  {p.villas.map(v => (
                    <div key={v.villaId} className="villa-selection-item">
                      <div className="villa-info">
                        <div className="villa-name">{v.name}</div>
                        <div className="villa-details">
                          <span>{v.area} {t.area}</span>
                          <span>{v.ppsm} {t.ppsm}</span>
                          <span>{fmtMoney(v.baseUSD, 'USD')}</span>
                        </div>
                      </div>
                      <button 
                        className="btn success add-selected-btn" 
                        onClick={() => handleAddLine(p, v)}
                      >
                        {t.addSelected}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Панель сценариев
const ScenariosPanel = React.memo(({ scenarios, currentName, onNameChange, onSave, onLoad, onDelete, t }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (scenarios.length === 0 && !isExpanded) {
    return (
      <div className="scenarios-panel collapsed">
        <button className="btn" onClick={() => setIsExpanded(true)}>
          �� Сохранить сценарий
        </button>
      </div>
    );
  }

  return (
    <div className={`scenarios-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="scenarios-header">
        <h4>�� Сценарии расчета</h4>
        <button className="btn icon" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="scenarios-content">
          <div className="scenario-form">
            <input 
              type="text" 
              placeholder="Название сценария"
              value={currentName}
              onChange={e => onNameChange(e.target.value)}
              className="scenario-name-input"
            />
            <button className="btn success" onClick={onSave} disabled={!currentName.trim()}>
              Сохранить
            </button>
          </div>
          
          {scenarios.length > 0 && (
            <div className="scenarios-list">
              {scenarios.map(scenario => (
                <div key={scenario.id} className="scenario-item">
                  <div className="scenario-info">
                    <div className="scenario-name">{scenario.name}</div>
                    <div className="scenario-date">
                      {new Date(scenario.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="scenario-actions">
                    <button className="btn primary" onClick={() => onLoad(scenario)}>
                      Загрузить
                    </button>
                    <button className="btn danger" onClick={() => onDelete(scenario.id)}>
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// Центр уведомлений
const NotificationCenter = React.memo(({ notifications, onClose }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-center">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification notification-${notification.type}`}
          style={{
            animation: `slideInRight 0.3s ease-out, fadeOut 0.3s ease-out ${4.7}s forwards`
          }}
        >
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✅' : 
               notification.type === 'warning' ? '⚠️' : 
               notification.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
          <button className="notification-close" onClick={() => onClose(notification.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
});

// ===== АНИМИРОВАННЫЕ КОМПОНЕНТЫ =====

// Анимированный счетчик
const AnimatedCounter = React.memo(({ value, currency, className = '' }) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (value !== displayValue) {
      setIsAnimating(true);
      const startValue = displayValue;
      const endValue = value;
      const duration = 1000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Плавная анимация с easing
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOutQuart;
        
        setDisplayValue(Math.round(currentValue));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, displayValue]);

  return (
    <span className={`animated-counter ${className} ${isAnimating ? 'animating' : ''}`}>
      {fmtMoney(displayValue, currency)}
    </span>
  );
});

// Анимированная карточка
const AnimatedCard = React.memo(({ children, className = '', delay = 0, ...props }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={cardRef}
      className={`animated-card ${className} ${isVisible ? 'visible' : ''}`}
      {...props}
    >
      {children}
    </div>
  );
});

// ===== ЭКСПОРТ КОМПОНЕНТОВ =====

// Экспортируем все компоненты для использования
window.App = App;
window.SettingsPanel = SettingsPanel;
window.StagesManager = StagesManager;
window.CalculationPanel = CalculationPanel;
window.CalculationTable = CalculationTable;
window.CashflowTable = CashflowTable;
window.KPIBlock = KPIBlock;
window.CatalogEditor = CatalogEditor;
window.ProjectModal = ProjectModal;
window.VillaModal = VillaModal;
window.CatalogModal = CatalogModal;
window.ScenariosPanel = ScenariosPanel;
window.NotificationCenter = NotificationCenter;
window.AnimatedCounter = AnimatedCounter;
window.AnimatedCard = AnimatedCard;
