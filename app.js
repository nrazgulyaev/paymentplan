// ===== ПОЛНОЕ ПРИЛОЖЕНИЕ ARCONIQUE (ИСПРАВЛЕННАЯ ВЕРСИЯ) =====

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
  })()},[]);

  const snapshot=()=>({lang,currency,idrPerUsd,eurPerUsd,handoverMonth,months,monthlyRatePct,stages,catalog,lines,startMonth});
  useEffect(()=>{
    localStorage.setItem('arconique_v76',JSON.stringify(snapshot()));
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

    const addFromCatalog=()=>setModalOpen(true);
  const addFromCatalogLine=(villa,projectId)=>{
    const nid=(lines[lines.length-1]?.id||0)+1;
    const newLine={
      id:nid,
      projectId:projectId,
      villaId:villa.villaId,
      qty:1,
      prePct:70,
      ownTerms:false,
      months:null,
      monthlyRatePct:null,
      firstPostUSD:0,
      discountPct:0,
      snapshot:{name:villa.name,area:villa.area,ppsm:villa.ppsm,baseUSD:villa.baseUSD}
    };
    setLines(prev=>[...prev,newLine]);
    setModalOpen(false);
  };

  const addStage=()=>{
    const newId=stages.length+1;
    setStages(prev=>[...prev,{id:newId,label:'',pct:0,month:0}]);
  };

  const delStage=(id)=>setStages(prev=>prev.filter(s=>s.id!==id));

  const updStage=(id,patch)=>setStages(prev=>prev.map(s=>s.id===id?{...s,...patch}:s));

  const toggleClientMode=async()=>{
    if(isClient){
      const ok=await verifyPinFlow();
      if(ok){
        setIsClient(false);
        const url=encodeState(snapshot(),{view:'editor'});
        if(url) history.pushState(null,'',url);
      }else{
        alert(lang==='ru'?'Неверный PIN':'Wrong PIN');
      }
    }else{
      setIsClient(true);
      const url=encodeState(snapshot(),{view:'client'});
      if(url) history.pushState(null,'',url);
    }
  };

  // Обновляем заголовок страницы
  useEffect(() => {
    const titleElement = document.getElementById('app-title');
    if (titleElement) {
      titleElement.textContent = t.title;
    }
    document.title = t.title;
  }, [t.title]);

  return (
    <>
      <div className="wrap">
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <h1>{t.title}</h1>
            </div>
            <div className="header-controls">
              <button className="btn btn-secondary" onClick={toggleClientMode}>
                {isClient ? t.editor : t.client}
              </button>
              <select value={lang} onChange={e=>setLang(e.target.value)} className="select">
                <option value="ru">🇷🇺 RU</option>
                <option value="en">🇺🇸 EN</option>
              </select>
              <select value={currency} onChange={e=>setCurrency(e.target.value)} className="select">
                <option value="USD">💵 USD</option>
                <option value="IDR">🇮🇩 IDR</option>
                <option value="EUR">🇪🇺 EUR</option>
              </select>
            </div>
          </div>
        </header>

        <main className="main">
          <div className="grid">
            {/* ЛЕВАЯ ПАНЕЛЬ */}
            <div className="left-panel">
              <div className="card">
                <h2>{t.stagesTitle}</h2>
                <div className="stages">
                  {stages.map(stage=>(
                    <div key={stage.id} className="stage-row">
                      <input type="text" value={stage.label} onChange={e=>updStage(stage.id,{label:e.target.value})} placeholder="Название этапа" className="input" />
                      <input type="number" value={stage.pct} onChange={e=>updStage(stage.id,{pct:+e.target.value})} placeholder="%" className="input input-small" />
                      <input type="number" value={stage.month} onChange={e=>updStage(stage.id,{month:+e.target.value})} placeholder="Месяц" className="input input-small" />
                      <button onClick={()=>delStage(stage.id)} className="btn btn-danger btn-small">{t.delete}</button>
                    </div>
                  ))}
                  <button onClick={addStage} className="btn btn-primary">{t.addStage}</button>
                </div>
                <div className="stages-summary">
                  <span>{t.sumStages}: {stagesSumPct}%</span>
                  {stagesSumPct!==100 && <span className="warning">— {stagesSumPct<100?'не хватает':'превышает'} 100%</span>}
                </div>
              </div>

              <div className="card">
                <h2>{t.villasTitle}</h2>
                <div className="lines">
                  {lines.map(line=>(
                    <div key={line.id} className="line-card">
                      <div className="line-header">
                        <div className="line-info">
                          <strong>{line.snapshot?.name || 'Villa'}</strong>
                          <span className="line-project">{findProject(line.projectId)?.projectName || line.projectId}</span>
                        </div>
                        <div className="line-actions">
                          <button onClick={()=>dupLine(line.id)} className="btn btn-secondary btn-small">📋</button>
                          <button onClick={()=>delLine(line.id)} className="btn btn-danger btn-small">🗑️</button>
                        </div>
                      </div>
                      
                      <div className="line-inputs">
                        <div className="input-group">
                          <label>{t.qty}:</label>
                          <input type="number" value={line.qty} onChange={e=>updLine(line.id,{qty:+e.target.value})} min="1" className="input input-small" />
                        </div>
                        <div className="input-group">
                          <label>{t.area}:</label>
                          <input type="number" value={line.snapshot?.area || 0} onChange={e=>updLine(line.id,{snapshot:{...line.snapshot,area:+e.target.value}})} className="input input-small" />
                          <span className="unit">м²</span>
                        </div>
                        <div className="input-group">
                          <label>{t.ppsm}:</label>
                          <input type="number" value={line.snapshot?.ppsm || 0} onChange={e=>updLine(line.id,{snapshot:{...line.snapshot,ppsm:+e.target.value}})} className="input input-small" />
                          <span className="unit">$</span>
                        </div>
                        <div className="input-group">
                          <label>{t.price}:</label>
                          <input type="number" value={line.snapshot?.baseUSD || 0} onChange={e=>updLine(line.id,{snapshot:{...line.snapshot,baseUSD:+e.target.value}})} className="input input-small" />
                          <span className="unit">USD</span>
                        </div>
                        <div className="input-group">
                          <label>{t.discount}:</label>
                          <input type="number" value={line.discountPct || 0} onChange={e=>updLine(line.id,{discountPct:+e.target.value})} min="0" max="20" className="input input-small" />
                          <span className="unit">%</span>
                        </div>
                        <div className="input-group">
                          <label>{t.prePct}:</label>
                          <input type="number" value={line.prePct || 0} onChange={e=>updLine(line.id,{prePct:+e.target.value})} min="50" max="100" className="input input-small" />
                          <span className="unit">%</span>
                        </div>
                        <div className="input-group">
                          <label>{t.months}:</label>
                          <input type="number" value={line.months || months} onChange={e=>updLine(line.id,{months:+e.target.value})} min="1" max="60" className="input input-small" />
                          <span className="unit">мес</span>
                        </div>
                        <div className="input-group">
                          <label>{t.rate}:</label>
                          <input type="number" value={line.monthlyRatePct || monthlyRatePct} onChange={e=>updLine(line.id,{monthlyRatePct:+e.target.value})} min="0.1" max="20" step="0.1" className="input input-small" />
                          <span className="unit">%/мес</span>
                        </div>
                        <div className="input-group">
                          <label>{t.firstPost}:</label>
                          <input type="number" value={line.firstPostUSD || 0} onChange={e=>updLine(line.id,{firstPostUSD:+e.target.value})} min="0" className="input input-small" />
                          <span className="unit">USD</span>
                        </div>
                      </div>
                      
                      <div className="line-total">
                        <strong>{t.lineTotal}: {fmtMoney(line.snapshot?.baseUSD * (line.qty || 1), 'USD')}</strong>
                      </div>
                    </div>
                  ))}
                  
                  <button onClick={addFromCatalog} className="btn btn-primary btn-full">
                    {t.addFromCatalog}
                  </button>
                </div>
              </div>
            </div>

            {/* ПРАВАЯ ПАНЕЛЬ */}
            <div className="right-panel">
              <div className="card">
                <h2>{t.totals}</h2>
                <div className="totals-grid">
                  <div className="total-item">
                    <span className="total-label">{t.base}:</span>
                    <span className="total-value">{fmtMoney(project.totals.baseUSD, 'USD')}</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">{t.prepay}:</span>
                    <span className="total-value">{fmtMoney(project.totals.preUSD, 'USD')}</span>
                  </div>
                  <div className="total-item">
                    <span className="total-label">{t.after}:</span>
                    <span className="total-value">{fmtMoney(project.totals.afterUSD, 'USD')}</span>
                  </div>
                  <div className="total-item total-item-highlight">
                    <span className="total-label">{t.interestTotal}:</span>
                    <span className="total-value">{fmtMoney(project.totals.interestUSD, 'USD')}</span>
                  </div>
                  <div className="total-item total-item-final">
                    <span className="total-label">{t.final}:</span>
                    <span className="total-value">{fmtMoney(project.totals.finalUSD, 'USD')}</span>
                  </div>
                </div>
                
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">{t.lines}:</span>
                    <span className="stat-value">{lines.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">{t.keys}:</span>
                    <span className="stat-value">{handoverMonth} {lang==='ru'?'мес':'mo'}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2>{t.chartTitle}</h2>
                <canvas ref={chartRef} className="chart"></canvas>
              </div>

              <div className="card">
                <div className="card-header">
                  <h2>{t.cashflowTitle}</h2>
                  <div className="card-actions">
                    <button onClick={exportCSV} className="btn btn-secondary btn-small">{t.exportCSV}</button>
                    <button onClick={exportXLSX} className="btn btn-secondary btn-small">{t.exportXLSX}</button>
                    <button onClick={exportPDF} className="btn btn-secondary btn-small">{t.exportPDF}</button>
                  </div>
                </div>
                <div className="cashflow-table-container">
                  <table className="cashflow-table">
                    <thead>
                      <tr>
                        <th>{t.cashMonth}</th>
                        <th>{t.cashDesc}</th>
                        <th>{t.cashTotal}</th>
                        <th>{t.cashBalance}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.cashflow.map((cash, index) => (
                        <tr key={index}>
                          <td>{formatMonth(cash.month)}</td>
                          <td>{(cash.items || []).join(' + ')}</td>
                          <td className="amount">{fmtMoney(cash.amountUSD, 'USD')}</td>
                          <td className="amount">{fmtMoney(cash.balanceUSD, 'USD')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* РЕДАКТОРСКИЙ РЕЖИМ */}
          {!isClient && (
            <div className="editor-mode">
              <h2>{t.catalogTitle}</h2>
              <CatalogManager 
                catalog={catalog} 
                setCatalog={setCatalog} 
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
                t={t}
              />
            </div>
          )}

          {/* СВОДНЫЙ КЭШФЛОУ ПО МЕСЯЦАМ (ОТДЕЛЬНЫЙ БЛОК ВНИЗУ) */}
          <div className="cashflow-block">
            <div className="card">
              <div className="card-header">
                <h2>{t.cashflowTitle}</h2>
                <div className="card-actions">
                  <button onClick={exportCSV} className="btn btn-secondary btn-small">{t.exportCSV}</button>
                  <button onClick={exportXLSX} className="btn btn-secondary btn-small">{t.exportXLSX}</button>
                  <button onClick={exportPDF} className="btn btn-secondary btn-small">{t.exportPDF}</button>
                </div>
              </div>
              <div className="cashflow-table-container">
                <table className="cashflow-table">
                  <thead>
                    <tr>
                      <th>{t.cashMonth}</th>
                      <th>{t.cashDesc}</th>
                      <th>{t.cashTotal}</th>
                      <th>{t.cashBalance}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {project.cashflow.map((cash, index) => (
                      <tr key={index}>
                        <td>{formatMonth(cash.month)}</td>
                        <td>{(cash.items || []).join(' + ')}</td>
                        <td className="amount">{fmtMoney(cash.amountUSD, 'USD')}</td>
                        <td className="amount">{fmtMoney(cash.balanceUSD, 'USD')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ИЗ КАТАЛОГА */}
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
                      </div>
                      <button className="btn btn-primary btn-small">{t.addSelected}</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary">{t.cancel}</button>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ПРОЕКТА */}
      {showAddProjectModal && (
        <div className="modal-overlay" onClick={() => setShowAddProjectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t.addProject}</h3>
            <div className="form-group">
              <label>{t.projectId}:</label>
              <input 
                type="text" 
                value={newProjectForm.projectId} 
                onChange={e => setNewProjectForm(prev => ({...prev, projectId: e.target.value}))}
                placeholder="ID проекта"
                className="input"
              />
            </div>
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
              <button onClick={saveProject} className="btn btn-primary">{t.save}</button>
              <button onClick={() => setShowAddProjectModal(false)} className="btn btn-secondary">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ ВИЛЛЫ */}
      {showAddVillaModal && (
        <div className="modal-overlay" onClick={() => setShowAddVillaModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{t.addVilla}</h3>
            <div className="form-group">
              <label>{t.villaId}:</label>
              <input 
                type="text" 
                value={newVillaForm.villaId} 
                onChange={e => setNewVillaForm(prev => ({...prev, villaId: e.target.value}))}
                placeholder="ID виллы"
                className="input"
              />
            </div>
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
                placeholder="Площадь"
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
              <label>{t.villaBasePrice}:</label>
              <input 
                type="number" 
                value={newVillaForm.baseUSD} 
                onChange={e => setNewVillaForm(prev => ({...prev, baseUSD: +e.target.value}))}
                placeholder="Базовая цена"
                className="input"
              />
            </div>
            <div className="modal-actions">
              <button onClick={saveVilla} className="btn btn-primary">{t.save}</button>
              <button onClick={() => setShowAddVillaModal(false)} className="btn btn-secondary">{t.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ===== КОМПОНЕНТ КАТАЛОГА =====
function CatalogManager({ 
  catalog, 
  setCatalog, 
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
  saveVilla,
  t 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [areaFilter, setAreaFilter] = useState({ from: '', to: '' });
  const [priceFilter, setPriceFilter] = useState({ from: '', to: '' });

  const filteredCatalog = useMemo(() => {
    let filtered = [...catalog];
    
    // Фильтрация по поиску
    if (searchTerm) {
      filtered = filtered.filter(project => 
        project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.villas.some(villa => 
          villa.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    // Фильтрация по площади
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
    
    // Фильтрация по цене
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
    
    // Сортировка
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
    if (confirm('Удалить проект и все его виллы?')) {
      setCatalog(prev => prev.filter(p => p.projectId !== projectId));
    }
  };

  const deleteVilla = (projectId, villaId) => {
    if (confirm('Удалить виллу?')) {
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
            alert('Каталог успешно импортирован');
          } else {
            alert('Неверный формат файла');
          }
        } catch (error) {
          alert('Ошибка при импорте файла');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="catalog-section">
      <div className="catalog-header">
        <div className="catalog-controls">
          <button onClick={addProject} className="btn btn-primary">{t.addProject}</button>
          <button onClick={() => setShowAddVillaModal(true)} className="btn btn-primary">{t.addVilla}</button>
          <button onClick={exportCatalog} className="btn btn-secondary">{t.exportJSON}</button>
          <label className="btn btn-secondary">
            {t.importJSON}
            <input type="file" accept=".json" onChange={importCatalog} style={{ display: 'none' }} />
          </label>
        </div>
        
        <div className="catalog-filters">
          <input 
            type="text" 
            placeholder={t.search} 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className="input"
          />
          
          <div className="filter-group">
            <input 
              type="number" 
              placeholder={t.areaFrom} 
              value={areaFilter.from} 
              onChange={e => setAreaFilter(prev => ({...prev, from: e.target.value}))}
              className="input input-small"
            />
            <input 
              type="number" 
              placeholder={t.areaTo} 
              value={areaFilter.to} 
              onChange={e => setAreaFilter(prev => ({...prev, to: e.target.value}))}
              className="input input-small"
            />
          </div>
          
          <div className="filter-group">
            <input 
              type="number" 
              placeholder={t.priceFrom} 
              value={priceFilter.from} 
              onChange={e => setPriceFilter(prev => ({...prev, from: e.target.value}))}
              className="input input-small"
            />
            <input 
              type="number" 
              placeholder={t.priceTo} 
              value={priceFilter.to} 
              onChange={e => setPriceFilter(prev => ({...prev, to: e.target.value}))}
              className="input input-small"
            />
          </div>
          
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="select">
            <option value="name">{t.sort} {t.byName}</option>
            <option value="price">{t.sort} {t.byPrice}</option>
            <option value="area">{t.sort} {t.byArea}</option>
          </select>
        </div>
      </div>

      <div className="catalog-content">
        {filteredCatalog.map(project => (
          <div key={project.projectId} className="project-card">
            <div className="project-header">
              <h3>{project.projectName}</h3>
              <div className="project-actions">
                <button onClick={() => setShowAddVillaModal(true)} className="btn btn-secondary btn-small">{t.addVilla}</button>
                <button onClick={() => deleteProject(project.projectId)} className="btn btn-danger btn-small">{t.remove}</button>
              </div>
            </div>
            
            <div className="villas-grid">
              {project.villas.map(villa => (
                <div key={villa.villaId} className="villa-card">
                  <div className="villa-header">
                    <h4>{villa.name}</h4>
                    <div className="villa-actions">
                      <button onClick={() => deleteVilla(project.projectId, villa.villaId)} className="btn btn-danger btn-small">{t.remove}</button>
                    </div>
                  </div>
                  
                  <div className="villa-details">
                    <div className="detail-item">
                      <span className="detail-label">{t.villaArea}:</span>
                      <span className="detail-value">{villa.area} м²</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">{t.villaPpsm}:</span>
                      <span className="detail-value">${villa.ppsm}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">{t.villaBasePrice}:</span>
                      <span className="detail-value">{fmtMoney(villa.baseUSD, 'USD')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== КОМПОНЕНТ KPI =====
function KPIBlock({ title, value, subtitle, className = '' }) {
  return (
    <div className={`kpi-block ${className}`}>
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
      {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
    </div>
  );
}

// ===== ЗАПУСК =====
ReactDOM.render(<App />, document.getElementById('root'));
