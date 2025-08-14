// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE (ИДЕАЛЬНАЯ ВЕРСИЯ) =====

const {useEffect,useMemo,useRef,useState} = React;

/* ---------- PIN / security ---------- */
const PIN_CODE = '334346';
const PIN_SALT = 'enso-v7.4-salt-1';
const PIN_HASH_HEX = 'c0b37fd5b1ebc835af06c260b9ceb435285f79ecffd7f0a68be695db347d2aa6';

async function sha256Hex(str){
  try{
    if (!crypto.subtle) {
      console.warn('crypto.subtle not available, using fallback');
      return '';
    }
    const buf = new TextEncoder().encode(str);
    const digest = await crypto.subtle.digest('SHA-256', buf);
    return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){ 
    console.warn('SHA-256 failed:', e);
    return ''; 
  }
}

async function verifyPinFlow(){
  const pin = prompt('Enter PIN');
  if(pin==null) return false;
  const hex = await sha256Hex(`${pin}|${PIN_SALT}`);
  if(hex && hex === PIN_HASH_HEX) return true;
  return pin === PIN_CODE;
}

/* ---------- i18n ---------- */
const T = {
  ru: {
    title:'Arconique / Калькулятор рассрочки для любимых клиентов',
    editor:'Редактор', client:'Клиент',
    lang:'Язык интерфейса', currencyDisplay:'Валюта отображения',
    idrRate:'IDR за 1 USD', eurRate:'EUR за 1 USD',
    handoverMonth:'Месяц получения ключей',
    globalTerm:'Глобальный срок post‑handover (6–24 мес)',
    globalRate:'Глобальная ставка, %/мес',
    clientTerm:'Срок post‑handover (мес)',
    startMonth:'Начальный месяц',
    stagesTitle:'Базовая рассрочка',
    stage:'Этап', percent:'%', month:'Месяц',
    addStage:'Добавить этап', delete:'Удалить',
    villasTitle:'Расчёт (позиции)',
    project:'Проект', villa:'Вилла', qty:'Кол-во',
    area:'м²', ppsm:'$ / м²', price:'Базовая стоимость (USD)',
    discount:'Скидка, %', prePct:'До ключей, %',
    months:'Срок рассрочки, мес', rate:'Ставка, %/мес',
    firstPost:'Первый платёж', lineTotal:'Итоговая стоимость',
    addFromCatalog:'Добавить из каталога',
    cashflowTitle:'Сводный кэшфлоу по месяцам',
    cashMonth:'Месяц', cashDesc:'Описание',
    cashTotal:'Сумма к оплате', cashBalance:'Остаток долга',
    totals:'Итоги', base:'Базовая стоимость', prepay:'Оплата до ключей',
    after:'Остаток после ключей', interestTotal:'Проценты (post)',
    final:'Итоговая цена',
    lines:'Выбрано вилл', keys:'Ключи через',
    chartTitle:'Платежи по месяцам',
    sumStages:'Сумма этапов', targetPrepay:'Целевой % до ключей',
    mismatch:'— отличается от целевого', mixedTargets:'разные цели у строк',
    shareCopied:'Ссылка скопирована',
    exportCSV:'Экспорт CSV', exportXLSX:'Экспорт Excel', exportPDF:'Сохранить в PDF',
    tabCalc:'Расчёт', tabCatalog:'Каталог',
    catalogTitle:'Каталог проектов и вилл (редактор)',
    addProject:'Добавить проект', addVilla:'Добавить виллу',
    importJSON:'Импорт JSON', exportJSON:'Экспорт JSON',
    selectFromCatalog:'Выбор из каталога',
    search:'Поиск', areaFrom:'м² от', areaTo:'м² до',
    priceFrom:'Цена от', priceTo:'Цена до',
    sort:'Сортировать', byPrice:'по цене', byArea:'по площади', byName:'по названию',
    addSelected:'Добавить выбранные', cancel:'Отмена',
    qtyShort:'Кол-во', baseUSD:'Базовая стоимость (USD)',
    projectId:'ID проекта', projectName:'Название проекта',
    villaId:'ID виллы', villaName:'Название виллы',
    villaArea:'Площадь (м²)', villaPpsm:'Цена за м² ($)',
    villaBasePrice:'Базовая цена ($)', save:'Сохранить',
    edit:'Редактировать', remove:'Удалить',
    projectNameRequired:'Введите название проекта',
    villaNameRequired:'Введите название виллы'
  },
  en: {
    title:'Arconique / Installments Calculator',
    editor:'Editor', client:'Client',
    lang:'Language', currencyDisplay:'Display currency',
    idrRate:'IDR per 1 USD', eurRate:'EUR per 1 USD',
    handoverMonth:'Handover month',
    globalTerm:'Global post‑handover term (6–24 mo)',
    globalRate:'Global rate, %/month',
    clientTerm:'Post‑handover term (months)',
    startMonth:'Start month',
    stagesTitle:'Basic installments',
    stage:'Stage', percent:'%', month:'Month',
    addStage:'Add stage', delete:'Delete',
    villasTitle:'Calculation (lines)',
    project:'Project', villa:'Villa', qty:'Qty',
    area:'sqm', ppsm:'$ / sqm', price:'Base Price (USD)',
    discount:'Discount, %', prePct:'Pre‑handover, %',
    months:'Installment term, mo', rate:'Rate, %/mo',
    firstPost:'First payment', lineTotal:'Final price',
    addFromCatalog:'Add from catalog',
    cashflowTitle:'Monthly consolidated cashflow',
    cashMonth:'Month', cashDesc:'Description',
    cashTotal:'Amount due', cashBalance:'Remaining balance',
    totals:'Totals', base:'Base price', prepay:'Paid before keys',
    after:'Balance after keys', interestTotal:'Interest (post)',
    final:'Final price',
    lines:'Selected villas', keys:'Keys in',
    chartTitle:'Payments by month',
    sumStages:'Stages sum', targetPrepay:'Target pre‑handover %',
    mismatch:'— differs from target', mixedTargets:'different line targets',
    shareCopied:'Link copied',
    exportCSV:'Export CSV', exportXLSX:'Export Excel', exportPDF:'Save to PDF',
    tabCalc:'Calculation', tabCatalog:'Catalog',
    catalogTitle:'Projects & Villas Catalog (editor)',
    addProject:'Add project', addVilla:'Add villa',
    importJSON:'Import JSON', exportJSON:'Export JSON',
    selectFromCatalog:'Select from catalog',
    search:'Search', areaFrom:'sqm from', areaTo:'sqm to',
    priceFrom:'Price from', priceTo:'Price to',
    sort:'Sort', byPrice:'by price', byArea:'by area', byName:'by name',
    addSelected:'Add selected', cancel:'Cancel',
    qtyShort:'Qty', baseUSD:'Base Price (USD)',
    projectId:'Project ID', projectName:'Project Name',
    villaId:'Villa ID', villaName:'Villa Name',
    villaArea:'Area (sqm)', villaPpsm:'Price per sqm ($)',
    villaBasePrice:'Base Price ($)', save:'Save',
    edit:'Edit', remove:'Remove',
    projectNameRequired:'Enter project name',
    villaNameRequired:'Enter villa name'
  }
};

const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const fmtMoney=(n,c='USD')=>new Intl.NumberFormat('en-US',{style:'currency',currency:c,maximumFractionDigits:2}).format(n??0);

/* ---------- URL state (compressed hash) ---------- */
const readHash=()=>{const h=location.hash.startsWith('#')?location.hash.slice(1):location.hash;const sp=new URLSearchParams(h);return {s:sp.get('s'),view:sp.get('view')}};
const encodeState=(state,{view}={})=>{try{const s=LZString.compressToEncodedURIComponent(JSON.stringify(state));const u=new URL(location.href);const sp=new URLSearchParams();sp.set('s',s);if(view)sp.set('view',view);u.hash=sp.toString();return u.toString()}catch{return ''}};
const decodeState=()=>{try{const {s,view}=readHash();if(!s)return null;const json=LZString.decompressFromEncodedURIComponent(s);return {state:JSON.parse(json),view}}catch{return null}};

/* ---------- demo catalog ---------- */
const DEFAULT_CATALOG=[
  {projectId:'ahao',projectName:'AHAO Gardens',villas:[
    {villaId:'ahao-2br',name:'2BR Garden Villa',area:100,ppsm:2500,baseUSD:250000},
    {villaId:'ahao-3br',name:'3BR Garden Villa',area:130,ppsm:2450,baseUSD:318500}
  ]},
  {projectId:'enso',projectName:'Enso Villas',villas:[
    {villaId:'enso-2br',name:'Enso 2BR',area:100,ppsm:2500,baseUSD:250000},
    {villaId:'enso-3br',name:'Enso 3BR',area:120,ppsm:2700,baseUSD:324000}
  ]},
  {projectId:'eternal',projectName:'Eternal Villas',villas:[
    {villaId:'eternal-1br',name:'Eternal 1BR Loft',area:80,ppsm:2600,baseUSD:208000},
    {villaId:'eternal-2br',name:'Eternal 2BR',area:110,ppsm:2550,baseUSD:280500}
  ]}
];

/* ---------- Components ---------- */
function App(){
  const [lang,setLang]=useState('ru'); const t=T[lang];
  const [isClient,setIsClient]=useState(true);

  const [currency,setCurrency]=useState('USD');
  const [idrPerUsd,setIdrPerUsd]=useState(16500);
  const [eurPerUsd,setEurPerUsd]=useState(0.92);
  const toCurrency=usd=>currency==='USD'?usd:(currency==='IDR'?usd*idrPerUsd:usd*eurPerUsd);

  const [handoverMonth,setHandoverMonth]=useState(12);
  const [months,setMonths]=useState(12);
  const [monthlyRatePct,setMonthlyRatePct]=useState(8.33);
  
  // НОВОЕ: Начальный месяц для реальных дат (автоматически текущий)
  const [startMonth,setStartMonth]=useState(new Date());

  const [stages,setStages]=useState([
    {id:1,label:'Договор',pct:30,month:0},
    {id:2,label:'50% готовности',pct:30,month:6},
    {id:3,label:'70% готовности',pct:20,month:9},
    {id:4,label:'90% готовности',pct:15,month:11},
    {id:5,label:'Ключи',pct:5,month:12},
  ]);
  const stagesSumPct=useMemo(()=>stages.reduce((s,x)=>s+(+x.pct||0),0),[stages]);

  const [catalog,setCatalog]=useState(DEFAULT_CATALOG);

  const [lines,setLines]=useState([
    {id:1,projectId:'enso',villaId:'enso-2br',qty:1,prePct:70,ownTerms:false,months:null,monthlyRatePct:null,firstPostUSD:0,discountPct:0,
     snapshot:{name:'Enso 2BR',area:100,ppsm:2500,baseUSD:250000}}
  ]);

  // Состояния для модальных окон
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

  const [modalOpen,setModalOpen]=useState(false);
  const [catalogModalOpen,setCatalogModalOpen]=useState(false);

  // НОВАЯ ФУНКЦИЯ: Форматирование месяца для кэшфлоу
  const formatMonth = (monthOffset) => {
    const date = new Date(startMonth);
    date.setMonth(date.getMonth() + monthOffset);
    return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  useEffect(()=>{(async()=>{
    try{
      const fromUrl=decodeState();
      const saved=fromUrl?.state || JSON.parse(localStorage.getItem('arconique_v76')||'null');
      if(saved){
        if(saved.lang) setLang(saved.lang);
        if(saved.currency) setCurrency(saved.currency);
        if(typeof saved.idrPerUsd==='number') setIdrPerUsd(saved.idrPerUsd);
        if(typeof saved.eurPerUsd==='number') setEurPerUsd(saved.eurPerUsd);
        if(typeof saved.handoverMonth==='number') setHandoverMonth(saved.handoverMonth);
        if(typeof saved.months==='number') setMonths(saved.months);
        if(typeof saved.monthlyRatePct==='number') setMonthlyRatePct(saved.monthlyRatePct);
        if(Array.isArray(saved.stages)) setStages(saved.stages);
        if(Array.isArray(saved.catalog)) setCatalog(saved.catalog);
        if(Array.isArray(saved.lines)) setLines(saved.lines);
        if(saved.startMonth) setStartMonth(new Date(saved.startMonth));
      }
      const view=(fromUrl?.view)|| (new URLSearchParams(location.hash.slice(1)).get('view'));
      if(view==='editor'){
        const ok=await verifyPinFlow();
        setIsClient(!ok);
        if(!ok){
          const url=encodeState(snapshot(),{view:'client'});
          if(url) history.replaceState(null,'',url);
          alert(lang==='ru'?'Неверный PIN — открыт клиентский режим':'Wrong PIN — opened client view');
        }
      }else setIsClient(true);
    }catch(e){ console.error(e); }
    document.getElementById('app-title').textContent=t.title;
    document.title=t.title;
  })()},[]);

  const snapshot=()=>({lang,currency,idrPerUsd,eurPerUsd,handoverMonth,months,monthlyRatePct,stages,catalog,lines,startMonth});
  useEffect(()=>{
    localStorage.setItem('arconique_v76',JSON.stringify(snapshot()));
    document.getElementById('app-title').textContent=t.title;
    document.title=t.title;
  },[lang,currency,idrPerUsd,eurPerUsd,handoverMonth,months,monthlyRatePct,stages,catalog,lines,startMonth]);

  const findProject=pid=>catalog.find(p=>p.projectId===pid);

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
  };

  // Функции для работы с виллами
  const addVilla = (projectId) => {
    setNewVillaForm({
      villaId: '',
      name: '',
      area: 100,
      ppsm: 2500,
      baseUSD: 250000
    });
    setEditingProject(projectId);
    setShowAddVillaModal(true);
  };

  const saveVilla = () => {
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
  };

  const linesData=useMemo(()=>lines.map(line=>{
    const base0=line.snapshot?.baseUSD ?? ((line.snapshot?.area||0)*(line.snapshot?.ppsm||0));
    const disc=clamp(+line.discountPct||0,0,20);
    const base=base0*(1-disc/100);

    // ИСПРАВЛЕНИЕ: Ограничение "До ключей" от 50% до 100%
    const prePct=clamp(line.prePct ?? 0, 50, 100);
    const k=stagesSumPct===0?0:prePct/stagesSumPct;
    const preSchedule=stages.map(s=>({
      month:Math.max(0,Math.min(handoverMonth,Math.round(+s.month||0))),
      label:s.label,
      amountUSD: base*(((+s.pct||0)*k)/100),
    })).filter(r=>r.amountUSD>0).sort((a,b)=>a.month-b.month);
    const preTotalOne=preSchedule.reduce((s,r)=>s+r.amountUSD,0);

    const vMonths=line.ownTerms && line.months ? line.months : months;
    const rate=(line.ownTerms && line.monthlyRatePct!=null)?(line.monthlyRatePct/100):(monthlyRatePct/100);
    const firstPostUSD=Math.max(0,+line.firstPostUSD||0);
    const principalBase=Math.max(0, base - preTotalOne - firstPostUSD);

    let bal=principalBase,totalInterest=0;
    const principalShare=vMonths>0?principalBase/vMonths:0;
    const postRows=[];
    for(let i=1;i<=vMonths;i++){
      const interest=bal*rate; totalInterest+=interest;
      const payment=principalShare+interest;
      postRows.push({month:handoverMonth+i,label:(lang==='ru'?'Месяц ':'Month ')+i,principalUSD:principalShare,interestUSD:interest,paymentUSD:payment,balanceAfterUSD:Math.max(0,bal-principalShare)});
      bal-=principalShare;
    }
    const lineTotalOne=base+totalInterest;

    const qty=Math.max(1,parseInt(line.qty||1,10));
    const preScheduleQ=preSchedule.map(r=>({...r,amountUSD:r.amountUSD*qty}));
    const postRowsQ=postRows.map(r=>({...r,principalUSD:r.principalUSD*qty,interestUSD:r.interestUSD*qty,paymentUSD:r.paymentUSD*qty}));
    const preTotal=preTotalOne*qty;
    const firstPostQ=firstPostUSD*qty;
    const baseQ=base*qty;
    const lineTotal=lineTotalOne*qty;

    return {line,qty,baseOne:base,base:baseQ,preSchedule:preScheduleQ,preTotal,firstPostUSD:firstPostQ,postRows:postRowsQ,lineTotal,vMonths,rate,discountPct:disc,prePct:prePct};
  }),[lines,stages,stagesSumPct,handoverMonth,months,monthlyRatePct,lang]);

  const project=useMemo(()=>{
    const totals={
      baseUSD:linesData.reduce((s,x)=>s+x.base,0),
      preUSD: linesData.reduce((s,x)=>s+x.preTotal,0),
      finalUSD:linesData.reduce((s,x)=>s+x.lineTotal,0),
    };
    totals.interestUSD = totals.finalUSD - totals.baseUSD;
    totals.afterUSD = totals.finalUSD - totals.preUSD;

    const m=new Map();
    const push=(month,amt,desc)=>{ if(amt<=0) return; const prev=m.get(month)||{month,items:[],amountUSD:0}; prev.items.push(desc); prev.amountUSD+=amt; m.set(month,prev); };
    linesData.forEach(ld=>{
      ld.preSchedule.forEach(r=> push(r.month,r.amountUSD,`${ld.line.snapshot?.name||'Villa'} ×${ld.qty}: ${r.label}`));
      if(ld.firstPostUSD>0) push(handoverMonth+1, ld.firstPostUSD, `${ld.line.snapshot?.name||'Villa'} ×${ld.qty}: ${lang==='ru'?'Первый платёж':'First payment'}`);
      ld.postRows.forEach(r=> push(r.month, r.paymentUSD, `${ld.line.snapshot?.name||'Villa'} ×${ld.qty}: ${r.label}`));
    });
    const raw=[...m.values()].sort((a,b)=>a.month-b.month);
    let cumulative=0;
    const cashflow=raw.map(row=>{ cumulative+=row.amountUSD; const balanceUSD=Math.max(0, totals.finalUSD - cumulative); return {...row,cumulativeUSD:cumulative,balanceUSD}; });
    return {totals,cashflow};
  },[linesData,handoverMonth,lang]);

  const chartRef=useRef(null); const chartObj=useRef(null);
  useEffect(()=>{
    try{
      const ctx=chartRef.current?.getContext('2d'); if(!ctx) return;
      if(chartObj.current) chartObj.current.destroy();
      chartObj.current=new Chart(ctx,{
        type:'bar',
        data:{labels:project.cashflow.map(c=>formatMonth(c.month)),datasets:[{label:T[lang].chartTitle,data:project.cashflow.map(c=>toCurrency(c.amountUSD))}]},
        options:{responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{label:(c)=>fmtMoney(c.parsed.y,currency)}}},scales:{y:{ticks:{callback:(v)=>fmtMoney(v,currency)}}}}
      });
    }catch(e){ /* если Chart.js не загрузился — не ломаем страницу */ }
  },[project.cashflow,currency,idrPerUsd,eurPerUsd,lang,startMonth]);

  const exportCSV=()=>{
    const rows=[[t.cashMonth,t.cashDesc,t.cashTotal,t.cashBalance],...project.cashflow.map(c=>[formatMonth(c.month),(c.items||[]).join(' + '),toCurrency(c.amountUSD).toFixed(2),toCurrency(c.balanceUSD).toFixed(2)])];
    const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`arconique_cashflow_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };
  
  const exportXLSX=()=>{
    const ws1=XLSX.utils.json_to_sheet(project.cashflow.map(c=>({[t.cashMonth]:formatMonth(c.month),[t.cashDesc]:(c.items||[]).join(' + '),[t.cashTotal]:toCurrency(c.amountUSD),[t.cashBalance]:toCurrency(c.balanceUSD)})));
    const ws2=XLSX.utils.json_to_sheet(linesData.map(ld=>({[t.project]:findProject(ld.line.projectId)?.projectName||ld.line.projectId,[t.villa]:ld.line.snapshot?.name,[t.qty]:ld.qty,[t.area]:ld.line.snapshot?.area,[t.ppsm]:ld.line.snapshot?.ppsm,[t.price]:ld.base,[t.discount]:(ld.discountPct||0)+'%',[t.prePct]:ld.prePct,[t.months]:ld.vMonths,[t.lineTotal]:ld.lineTotal})));
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws1,'Cashflow'); XLSX.utils.book_append_sheet(wb,ws2,'Lines'); XLSX.writeFile(wb,`arconique_installments_${new Date().toISOString().slice(0,10)}.xlsx`);
  };
  
  // Исправленная функция экспорта в PDF
  const exportPDF = () => {
    if (!project) return;
    
    // Создаем чистый HTML для PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${findProject(lines[0]?.projectId)?.projectName || 'Project'} - Cashflow Report</title>
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
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${findProject(lines[0]?.projectId)?.projectName || 'Project'}</h1>
          <div class="date">Отчет создан: ${new Date().toLocaleDateString('ru-RU')}</div>
        </div>
        
        <div class="summary">
          <h3>Сводка проекта</h3>
          <p><strong>Общая сумма:</strong> <span class="amount">${fmtMoney(project.totals.baseUSD,'USD')}</span></p>
          <p><strong>Итоговая цена:</strong> <span class="amount">${fmtMoney(project.totals.finalUSD,'USD')}</span></p>
          <p><strong>Проценты:</strong> <span class="amount">${fmtMoney(project.totals.interestUSD,'USD')}</span></p>
        </div>
        
        <h3>Денежный поток по месяцам</h3>
        <table>
          <thead>
            <tr>
              <th>Месяц</th>
              <th>Описание</th>
              <th>Сумма к оплате</th>
              <th>Остаток долга</th>
            </tr>
          </thead>
          <tbody>
            ${project.cashflow.map(c => `
              <tr>
                <td>${formatMonth(c.month)}</td>
                <td>${(c.items || []).join(' + ')}</td>
                <td class="amount">${fmtMoney(c.amountUSD,'USD')}</td>
                <td class="amount">${fmtMoney(c.balanceUSD,'USD')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    // Используем html2pdf для создания PDF
    const element = document.createElement('div');
    element.innerHTML = pdfContent;
    document.body.appendChild(element);
    
    html2pdf()
      .from(element)
      .save(`${findProject(lines[0]?.projectId)?.projectName || 'Project'}-cashflow-${new Date().toISOString().slice(0, 10)}.pdf`)
      .then(() => {
        document.body.removeChild(element);
      });
  };

  const share=async(view)=>{const url=encodeState(snapshot(),{view}); if(url){await navigator.clipboard.writeText(url); alert(t.shareCopied)}};

  const updLine=(id,patch)=>setLines(prev=>prev.map(l=>l.id===id?{...l,...patch}:l));
  const delLine=(id)=>setLines(prev=>prev.filter(l=>l.id!==id));
  const dupLine=(id)=>setLines(prev=>{const src=prev.find(x=>x.id===id); if(!src)return prev; const nid=(prev[prev.length-1]?.id||0)+1; return [...prev,{...src,id:nid,qty:1}]});

  return (
    <>
      <div className="grid">
        <div className="card">
          {/* УБРАЛИ ВКЛАДКИ - каталог перемещен в правую часть */}
          
          {/* Оптимизированные поля настроек */}
          <div className="row">
            <div className="field compact">
              <label>{t.lang}</label>
              <select value={lang} onChange={e=>setLang(e.target.value)}>
                <option value="ru">Русский</option><option value="en">English</option>
              </select>
            </div>
            
            <div className="field compact">
              <label>{t.currencyDisplay}</label>
              <select value={currency} onChange={e=>setCurrency(e.target.value)}>
                <option>USD</option><option>IDR</option><option>EUR</option>
              </select>
            </div>
          </div>

          {!isClient && (
            <div className="row">
              <div className="field compact">
                <label>{t.idrRate}</label>
                <input type="number" min="1" step="1" value={idrPerUsd} onChange={e=>setIdrPerUsd(clamp(parseFloat(e.target.value||0),1,1e9))}/>
              </div>
              <div className="field compact">
                <label>{t.eurRate}</label>
                <input type="number" min="0.01" step="0.01" value={eurPerUsd} onChange={e=>setEurPerUsd(clamp(parseFloat(e.target.value||0),0.01,100))}/>
              </div>
            </div>
          )}

          {/* НОВОЕ: Информационный блок начального месяца (не редактируемый) */}
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

          {/* ИСПРАВЛЕНИЕ: Поменяли местами поля "Глобальная ставка" и "Глобальный срок" */}
          <div className="row">
            <div className="field compact">
              <label>{t.handoverMonth}</label>
              <input type="number" min="1" step="1" value={handoverMonth} onChange={e=>setHandoverMonth(clamp(parseInt(e.target.value||0,10),1,120))}/>
            </div>
            {!isClient ? (
              <>
                <div className="field compact">
                  <label>{t.globalRate}</label>
                  <input type="number" min="0" step="0.01" value={monthlyRatePct} onChange={e=>setMonthlyRatePct(clamp(parseFloat(e.target.value||0),0,1000))}/>
                </div>
                <div className="field compact">
                  <label>{t.globalTerm}</label>
                  <input type="range" min="6" max="24" step="1" value={months} onChange={e=>setMonths(parseInt(e.target.value,10))}/>
                  <div className="pill">{t.months}: {months}</div>
                </div>
              </>
            ) : (
              <div className="field compact">
                <label>{t.clientTerm}</label>
                <input type="number" min="6" step="1" value={months} onChange={e=>setMonths(clamp(parseInt(e.target.value||0,10),6,120))}/>
              </div>
            )}
          </div>

          <div className="hr"></div>

          <h3 style={{margin:'6px 0'}}>{t.stagesTitle}</h3>
          
          {/* ИСПРАВЛЕНИЕ: Динамическая высота блока этапов */}
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
                {stages.map(s=>(
                  <tr key={s.id}>
                    <td className="col-stage">
                      <input 
                        type="text" 
                        className="stage-input"
                        value={s.label} 
                        onChange={e=>setStages(prev=>prev.map(x=>x.id===s.id?{...x,label:e.target.value}:x))}
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
                        onChange={e=>setStages(prev=>prev.map(x=>x.id===s.id?{...x,pct:clamp(parseFloat(e.target.value||0),0,100)}:x))}
                      />
                    </td>
                    <td className="col-month">
                      <input 
                        type="number" 
                        min="0" 
                        step="1" 
                        value={s.month} 
                        onChange={e=>setStages(prev=>prev.map(x=>x.id===s.id?{...x,month:clamp(parseInt(e.target.value||0,10),0,handoverMonth)}:x))}
                      />
                    </td>
                    <td className="col-actions">
                      <div className="stage-actions">
                        <button className="delete-stage-btn" onClick={()=>setStages(prev=>prev.filter(x=>x.id!==s.id))}>
                          {t.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row" style={{marginTop:8,alignItems:'center',justifyContent:'space-between'}}>
            <button className="btn primary" onClick={()=>setStages(prev=>{const last=prev[prev.length-1];const id=(last?.id||0)+1;const nextMonth=Math.min(handoverMonth,(last?.month??0)+1);return [...prev,{id,label:(lang==='ru'?'Этап':'Stage'),pct:5,month:nextMonth}]})}>{t.addStage}</button>
            {(() => {
              const vals=lines.map(l=>l.prePct||0);
              const allSame=vals.length?vals.every(v=>v===vals[0]):true;
              const targetText=allSame?`${vals[0]||0}%`:`${Math.min(...vals||[0])}%–${Math.max(...vals||[0])}%`;
              const mismatch=allSame ? (Math.round(stagesSumPct*100)/100!==(vals[0]||0)) : true;
              return <div className={`hint ${mismatch?'warn':''}`}>{t.sumStages}: {Math.round(stagesSumPct*100)/100}% · {t.targetPrepay}: {targetText} {mismatch? (allSame? ` ${t.mismatch}` : ` (${t.mixedTargets})`) : ''}</div>;
            })()}
          </div>

          <div className="hr"></div>

          {!isClient && (
            <div className="row">
              <button className="btn primary" onClick={()=>share('editor')}>Поделиться (редактор)</button>
              <button className="btn" onClick={()=>share('client')}>Поделиться (клиент)</button>
            </div>
          )}
          {isClient && <div className="row"><button className="btn" onClick={()=>share('client')}>Поделиться</button></div>}
        </div>

        <div className="card">
          <div className="row" style={{justifyContent:'space-between',alignItems:'baseline'}}>
            <div className="row">
              <span className="badge">{t.lines}: {lines.length}</span>
              <span className="badge">{t.keys} {handoverMonth} мес.</span>
              {!isClient && <span className="badge">{t.months}: {months}</span>}
            </div>
            <div className="muted">{isClient ? t.client : t.editor}</div>
          </div>

          <KPIBlock isClient={isClient} t={t} totals={project.totals} currency={currency} toCurrency={toCurrency}/>

          <div className="hr"></div>

          {/* ИСПРАВЛЕНИЕ: Отступ между блоками и кнопка видна в клиентском режиме */}
          <div className="calculation-header">
            <h3 style={{margin:'6px 0'}}>{t.villasTitle}</h3>
            <button className="btn success" onClick={()=>setModalOpen(true)}>{t.addFromCatalog}</button>
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
                  <th className="col-first">{t.firstPost}</th>
                  <th className="col-lineTotal">{t.lineTotal}</th>
                  <th className="col-actions"></th>
                </tr>
              </thead>
              <tbody>
                {linesData.map(ld=>{
                  const projName=findProject(ld.line.projectId)?.projectName || ld.line.projectId;
                  const villaName=ld.line.snapshot?.name || ld.line.villaId;
                  return (
                    <tr key={ld.line.id}>
                      <td className="col-project" style={{textAlign:'left'}}>
                        <div className="project-name-display">
                          {projName}
                        </div>
                      </td>
                      <td className="col-villa" style={{textAlign:'left'}}>
                        <div className="villa-name-display">
                          {villaName}
                        </div>
                      </td>
                      <td className="col-qty">
                        <input 
                          type="number" 
                          min="1" 
                          step="1" 
                          value={ld.line.qty} 
                          onChange={e=>updLine(ld.line.id,{qty:clamp(parseInt(e.target.value||0,10),1,9999)})}
                          style={{width:'100%',minWidth:'50px'}}
                        />
                      </td>
                      <td className="col-area">
                        <div className="area-display">
                          {ld.line.snapshot?.area||0}
                        </div>
                      </td>
                      <td className="col-ppsm">
                        <div className="ppsm-display">
                          {ld.line.snapshot?.ppsm||0}
                        </div>
                      </td>
                      <td className="col-base base-strong">
                        {fmtMoney(toCurrency(ld.base),currency)}
                      </td>
                      {!isClient && (
                        <td className="col-disc">
                          <input 
                            type="number" 
                            min="0" 
                            max="20" 
                            step="0.1" 
                            value={ld.line.discountPct||0} 
                                                       onChange={e=>updLine(ld.line.id,{discountPct:clamp(parseFloat(e.target.value||0),0,20)})}
                            style={{width:'100%',minWidth:'50px'}}
                          />
                        </td>
                      )}
                      <td className="col-pre">
                        {/* ИСПРАВЛЕНИЕ: Ограничение "До ключей" от 50% до 100% */}
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
                          style={{width:'100%',minWidth:'80px'}}
                        />
                        <div className="pill">{Math.max(50, Math.min(100, ld.prePct || 0))}%</div>
                      </td>
                      {!isClient && (
                        <>
                          <td className="col-months">
                            <input 
                              type="checkbox" 
                              checked={ld.line.ownTerms||false} 
                              onChange={e=>updLine(ld.line.id,{ownTerms:e.target.checked})}
                            />
                            <input 
                              type="number" 
                              min="6" 
                              step="1" 
                              value={ld.line.months||months} 
                              onChange={e=>updLine(ld.line.id,{months:clamp(parseInt(e.target.value||0,10),6,120)})}
                              disabled={!ld.line.ownTerms}
                              style={{width:'100%',minWidth:'50px'}}
                            />
                          </td>
                          <td className="col-rate">
                            <input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              value={ld.line.monthlyRatePct||monthlyRatePct} 
                              onChange={e=>updLine(ld.line.id,{monthlyRatePct:clamp(parseFloat(e.target.value||0),0,1000)})}
                              disabled={!ld.line.ownTerms}
                              style={{width:'100%',minWidth:'60px'}}
                            />
                          </td>
                        </>
                      )}
                      <td className="col-first">
                        <input 
                          type="number" 
                          min="0" 
                          step="1" 
                          value={ld.line.firstPostUSD||0} 
                          onChange={e=>updLine(ld.line.id,{firstPostUSD:clamp(parseFloat(e.target.value||0),0,ld.base)})}
                          style={{width:'100%',minWidth:'80px'}}
                        />
                      </td>
                      <td className="col-lineTotal line-total">
                        {fmtMoney(toCurrency(ld.lineTotal),currency)}
                      </td>
                      <td className="col-actions">
                        <div className="row" style={{gap:4}}>
                          <button className="btn icon" onClick={()=>dupLine(ld.line.id)}>📋</button>
                          {!isClient && <button className="btn danger icon" onClick={()=>delLine(ld.line.id)}>🗑️</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="hr"></div>

          <h3 style={{margin:'6px 0'}}>{t.cashflowTitle}</h3>
          {/* ИСПРАВЛЕНИЕ: Отступы между кнопками экспорта */}
          <div className="row" style={{justifyContent:'space-between',alignItems:'center'}}>
            <div className="export-buttons">
              <button className="btn" onClick={exportCSV}>{t.exportCSV}</button>
              <button className="btn" onClick={exportXLSX}>{t.exportXLSX}</button>
              <button className="btn" onClick={exportPDF}>{t.exportPDF}</button>
            </div>
          </div>

          {/* ИСПРАВЛЕНИЕ: Реальные даты в кэшфлоу и убрали ограничение высоты */}
          <div className="cashflow-scroll">
            <table className="cashflow-table">
              <thead>
                <tr>
                  <th>{t.cashMonth}</th>
                  <th style={{textAlign:'left'}}>{t.cashDesc}</th>
                  <th>{t.cashTotal}</th>
                  <th>{t.cashBalance}</th>
                </tr>
              </thead>
              <tbody>
                {project.cashflow.map(c=>(
                  <tr key={c.month}>
                    <td>{formatMonth(c.month)}</td>
                    <td style={{textAlign:'left'}}>{(c.items||[]).join(' + ')}</td>
                    <td>{fmtMoney(toCurrency(c.amountUSD),currency)}</td>
                    <td>{fmtMoney(toCurrency(c.balanceUSD),currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="hr"></div>

          <canvas ref={chartRef} style={{height:'200px',width:'100%'}}></canvas>

          {/* ИСПРАВЛЕНИЕ: Каталог перемещен в правую часть под графиком */}
          {!isClient && (
            <>
              <div className="hr"></div>
              <h3 style={{margin:'6px 0'}}>{t.catalogTitle}</h3>
              
              {/* Оптимизированные кнопки каталога */}
              <div className="row" style={{gap:'var(--spacing-md)'}}>
                <button className="btn success" onClick={addProject}>{t.addProject}</button>
                <button className="btn" onClick={()=>{
                  const json=prompt('Paste catalog JSON:', JSON.stringify(catalog,null,2));
                  if(!json) return;
                  try{ const obj=JSON.parse(json); if(Array.isArray(obj)) setCatalog(obj); else alert('Invalid JSON'); }catch{ alert('Invalid JSON'); }
                }}>{t.importJSON}</button>
                <button className="btn" onClick={()=>{
                  const blob=new Blob([JSON.stringify(catalog,null,2)],{type:'application/json'});
                  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`arconique_catalog_${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(a.href);
                }}>{t.exportJSON}</button>
              </div>
              
              <div className="scroll" style={{maxHeight:'32vh'}}>
                {catalog.map(p=>(
                  <div key={p.projectId} className="catalog-card">
                    <div className="catalog-header">
                      <div className="row" style={{flex:1}}>
                        <span className="badge">{t.project}:</span>
                        <input 
                          type="text" 
                          value={p.projectName} 
                          onChange={e=>setCatalog(prev=>prev.map(x=>x.projectId===p.projectId?{...x,projectName:e.target.value}:x))}
                          style={{flex:1,marginRight:8}}
                        />
                        <span className="pill">{p.projectId}</span>
                      </div>
                      <div className="catalog-actions">
                        <button className="btn primary" onClick={()=>addVilla(p.projectId)}>{t.addVilla}</button>
                        <button className="btn danger" onClick={()=>{
                          if(confirm(t.remove + ' ' + p.projectName + '?')) {
                            setCatalog(prev=>prev.filter(x=>x.projectId!==p.projectId));
                          }
                        }}>{t.remove}</button>
                      </div>
                    </div>
                    
                    <table className="catalog-table">
                      <thead>
                        <tr>
                          <th style={{textAlign:'left'}}>{t.villa}</th>
                          <th>{t.area}</th>
                          <th>{t.ppsm}</th>
                          <th>{t.price}</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.villas.map(v=>(
                          <tr key={v.villaId}>
                            <td style={{textAlign:'left'}}>
                              <input 
                                value={v.name} 
                                onChange={e=>setCatalog(prev=>prev.map(pr=>pr.projectId===p.projectId?{...pr,villas:pr.villas.map(vv=>vv.villaId===v.villaId?{...vv,name:e.target.value}:vv)}:pr))}
                              />
                              <div className="muted" style={{fontSize:10}}>{v.villaId}</div>
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="1" 
                                step="0.1" 
                                value={v.area} 
                                onChange={e=>setCatalog(prev=>prev.map(pr=>pr.projectId===p.projectId?{...pr,villas:pr.villas.map(vv=>vv.villaId===v.villaId?{...vv,area:clamp(parseFloat(e.target.value||0),1,100000)}:vv)}:pr))}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0" 
                                step="1" 
                                value={v.ppsm} 
                                onChange={e=>setCatalog(prev=>prev.map(pr=>pr.projectId===p.projectId?{...pr,villas:pr.villas.map(vv=>vv.villaId===v.villaId?{...vv,ppsm:clamp(parseFloat(e.target.value||0),0,1e9)}:vv)}:pr))}
                              />
                            </td>
                            <td>
                              <input 
                                type="number" 
                                min="0" 
                                step="1" 
                                value={v.baseUSD} 
                                onChange={e=>setCatalog(prev=>prev.map(pr=>pr.projectId===p.projectId?{...pr,villas:pr.villas.map(vv=>vv.villaId===v.villaId?{...vv,baseUSD:clamp(parseFloat(e.target.value||0),0,1e12)}:vv)}:pr))}
                              />
                            </td>
                            <td>
                              <button 
                                className="btn danger icon" 
                                onClick={()=>{
                                  if(confirm(t.remove + ' ' + v.name + '?')) {
                                    setCatalog(prev=>prev.map(pr=>pr.projectId===p.projectId?{...pr,villas:pr.villas.filter(vv=>vv.villaId!==v.villaId)}:pr));
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
            </>
          )}
        </div>
      </div>

      {/* Модальное окно добавления проекта */}
      {showAddProjectModal && (
        <div className="modal-overlay" onClick={() => setShowAddProjectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.addProject}</h3>
              <button className="btn icon" onClick={() => setShowAddProjectModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>{t.projectId}</label>
                    <input 
                      type="text" 
                      placeholder="project-id"
                      value={newProjectForm.projectId}
                      onChange={e => setNewProjectForm(prev => ({ ...prev, projectId: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.projectName}</label>
                    <input 
                      type="text" 
                      placeholder={t.projectName}
                      value={newProjectForm.projectName}
                      onChange={e => setNewProjectForm(prev => ({ ...prev, projectName: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button className="btn" onClick={() => setShowAddProjectModal(false)}>{t.cancel}</button>
                <button className="btn success" onClick={saveProject}>{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления виллы */}
      {showAddVillaModal && (
        <div className="modal-overlay" onClick={() => setShowAddVillaModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.addVilla}</h3>
              <button className="btn icon" onClick={() => setShowAddVillaModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>{t.villaId}</label>
                    <input 
                      type="text" 
                      placeholder="villa-id"
                      value={newVillaForm.villaId}
                      onChange={e => setNewVillaForm(prev => ({ ...prev, villaId: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.villaName}</label>
                    <input 
                      type="text" 
                      placeholder={t.villaName}
                      value={newVillaForm.name}
                      onChange={e => setNewVillaForm(prev => ({ ...prev, name: e.target.value }))}
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
                      value={newVillaForm.area}
                      onChange={e => setNewVillaForm(prev => ({ ...prev, area: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t.villaPpsm}</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="1" 
                      placeholder="2500"
                      value={newVillaForm.ppsm}
                      onChange={e => setNewVillaForm(prev => ({ ...prev, ppsm: parseFloat(e.target.value) || 0 }))}
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
                      value={newVillaForm.baseUSD}
                      onChange={e => setNewVillaForm(prev => ({ ...prev, baseUSD: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button className="btn" onClick={() => setShowAddVillaModal(false)}>{t.cancel}</button>
                <button className="btn success" onClick={saveVilla}>{t.save}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления из каталога */}
      {modalOpen && (
        <div className="modal-overlay" onClick={()=>setModalOpen(false)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t.selectFromCatalog}</h3>
              <button className="btn icon" onClick={()=>setModalOpen(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="search-filters">
                                <input 
                  type="text" 
                  placeholder={t.search} 
                  className="search-input"
                  onChange={e=>{
                    const query=e.target.value.toLowerCase();
                    const filtered=catalog.map(p=>({
                      ...p,
                      villas:p.villas.filter(v=>
                        p.projectName.toLowerCase().includes(query) ||
                        v.name.toLowerCase().includes(query) ||
                        v.villaId.toLowerCase().includes(query)
                      )
                    })).filter(p=>p.villas.length>0);
                    // Здесь можно добавить состояние для фильтрации
                  }}
                />
                
                <div className="filter-row">
                  <div className="filter-group">
                    <label>{t.areaFrom}</label>
                    <input type="number" min="0" step="1" placeholder="0" />
                  </div>
                  <div className="filter-group">
                    <label>{t.areaTo}</label>
                    <input type="number" min="0" step="1" placeholder="1000" />
                  </div>
                </div>
                
                <div className="filter-row">
                  <div className="filter-group">
                    <label>{t.priceFrom}</label>
                    <input type="number" min="0" step="1000" placeholder="0" />
                  </div>
                  <div className="filter-group">
                    <label>{t.priceTo}</label>
                    <input type="number" min="0" step="1000" placeholder="1000000" />
                  </div>
                </div>
                
                <div className="filter-row">
                  <div className="filter-group">
                    <label>{t.sort}</label>
                    <select>
                      <option value="name">{t.byName}</option>
                      <option value="area">{t.byArea}</option>
                      <option value="price">{t.byPrice}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="catalog-selection">
                {catalog.map(p=>(
                  <div key={p.projectId} className="catalog-selection-project">
                    <h4>{p.projectName}</h4>
                    <div className="villas-selection">
                      {p.villas.map(v=>(
                        <div key={v.villaId} className="villa-selection-item">
                          <div className="villa-info">
                            <div className="villa-name">{v.name}</div>
                            <div className="villa-details">
                              <span>{v.area} {t.area}</span>
                              <span>{v.ppsm} {t.ppsm}</span>
                              <span>{fmtMoney(v.baseUSD,'USD')}</span>
                            </div>
                          </div>
                          {/* ИСПРАВЛЕНИЕ: Очень компактная кнопка "Добавить выбранные" */}
                          <button 
                            className="btn success add-selected-btn" 
                            onClick={()=>{
                              const newLine={
                                id:Date.now()+Math.random(),
                                projectId:p.projectId,
                                villaId:v.villaId,
                                qty:1,
                                prePct:stagesSumPct,
                                ownTerms:false,
                                months:null,
                                monthlyRatePct:null,
                                firstPostUSD:0,
                                discountPct:0,
                                snapshot:{name:v.name,area:v.area,ppsm:v.ppsm,baseUSD:v.baseUSD}
                              };
                              setLines(prev=>[...prev,newLine]);
                              setModalOpen(false);
                            }}
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
      )}
    </>
  );
}

/* ---------- KPI Block Component ---------- */
function KPIBlock({isClient, t, totals, currency, toCurrency}){
  return (
    <div className="kpis">
      <div className="kpi">
        <div className="muted">{t.base}</div>
        <div className="v">{fmtMoney(toCurrency(totals.baseUSD),currency)}</div>
      </div>
      <div className="kpi">
        <div className="muted">{t.prepay}</div>
        <div className="v">{fmtMoney(toCurrency(totals.preUSD),currency)}</div>
      </div>
      <div className="kpi">
        <div className="muted">{t.after}</div>
        <div className="v">{fmtMoney(toCurrency(totals.afterUSD),currency)}</div>
      </div>
      {!isClient && (
        <div className="kpi">
          <div className="muted">{t.interestTotal}</div>
          <div className="v">{fmtMoney(toCurrency(totals.interestUSD),currency)}</div>
        </div>
      )}
      <div className="kpi">
        <div className="muted">{t.final}</div>
        <div className="v">{fmtMoney(toCurrency(totals.finalUSD),currency)}</div>
      </div>
    </div>
  );
}

/* ---------- Render ---------- */
ReactDOM.render(<App/>,document.getElementById('root'));
