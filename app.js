// app.js
// продолжаем
const { useEffect, useMemo, useRef, useState } = React;
const { createRoot } = ReactDOM;

/* =========================
   Константы и хранилище
========================= */
const PIN_CODE = "334346";
const LS_CATALOG = "arq_catalog_v2";
const LS_RATES = "arq_rates_v1";
const LS_LANG = "arq_lang_v1";
const VAT = 0.11; // для каталога (Цена с НДС 11%)

/* =========================
   I18n (полноценный для каталога)
========================= */
const DICT = {
  en: {
    app_title: "Arconique / Investment Property Catalog in Bali",
    projects_title: "Projects",
    anchors_all: "All",
    search_placeholder: "Search by name...",
    btn_presentation: "Project presentation PDF",
    btn_reports: "Construction reports",
    btn_price_list: "Download price list",
    pill_keys_in: (label) => `Keys in ${label}`,
    pill_progress: (pct) => `Current progress: ${pct}%`,
    table_villa: "Villa",
    table_rooms: "Rooms",
    table_land: "Land, m²",
    table_villa_area: "Villa, m²",
    table_floor1: "1st floor, m²",
    table_floor2: "2nd floor, m²",
    table_rooftop: "Rooftop, m²",
    table_garden: "Garden & pool, m²",
    table_ppsm: "Price per m², $",
    table_price_vat: "Price incl. VAT, $",
    table_status: "Status",
    table_action: "Payments & model",
    status_available: "available",
    status_reserved: "reserved",
    status_hold: "on hold",
    catalog_includes: "Included in price",
    masterplan_add_hint: "Add master plan URL",
    modal_add_project: "Add project",
    modal_edit_project: "Edit project",
    label_project_name: "Project name",
    label_planned_completion: "Planned completion (month/year)",
    label_progress: "Construction progress (%)",
    label_presentation_url: "Presentation URL (PDF)",
    label_master_url: "Master plan URL (image)",
    label_master_caption: "Master plan caption",
    btn_save: "Save",
    btn_cancel: "Cancel",
    btn_add_villa: "Add villa",
    btn_edit: "Edit",
    btn_delete: "Delete",
    reports_title: (n) => `Construction reports — ${n}`,
    reports_empty: "No reports yet",
    report_type_yt: "YouTube",
    report_type_album: "Photo/Album",
    reports_add: "Add report",
    report_name: "Title",
    report_date: "Date (month/year)",
    report_type: "Type",
    report_link: "URL",
    btn_open: "Open",
    curr_usd: "USD",
    curr_idr: "IDR",
    curr_eur: "EUR",
  },
  ru: {
    app_title: "Arconique / Каталог инвестиционной недвижимости на Бали",
    projects_title: "Проекты",
    anchors_all: "Все",
    search_placeholder: "Поиск по названию...",
    btn_presentation: "Презентация проекта PDF",
    btn_reports: "Отчёты о строительстве",
    btn_price_list: "Скачать прайс‑лист",
    pill_keys_in: (label) => `Ключи в ${label}`,
    pill_progress: (pct) => `Текущий прогресс: ${pct}%`,
    table_villa: "Вилла",
    table_rooms: "Комнат",
    table_land: "Земля, м²",
    table_villa_area: "Вилла, м²",
    table_floor1: "1 этаж, м²",
    table_floor2: "2 этаж, м²",
    table_rooftop: "Руфтоп, м²",
    table_garden: "Сад и бассейн, м²",
    table_ppsm: "Цена за м², $",
    table_price_vat: "Цена с НДС, $",
    table_status: "Статус",
    table_action: "Платежи и финмодель",
    status_available: "в наличии",
    status_reserved: "забронировано",
    status_hold: "на паузе",
    catalog_includes: "В стоимость включено",
    masterplan_add_hint: "Добавьте ссылку на мастер‑план",
    modal_add_project: "Добавить проект",
    modal_edit_project: "Правка проекта",
    label_project_name: "Название проекта",
    label_planned_completion: "Планируемая дата завершения (месяц/год)",
    label_progress: "Достигнутый прогресс строительства (%)",
    label_presentation_url: "Ссылка на презентацию (PDF)",
    label_master_url: "URL мастер‑плана (изображение)",
    label_master_caption: "Подпись к мастер‑плану",
    btn_save: "Сохранить",
    btn_cancel: "Отмена",
    btn_add_villa: "Добавить виллу",
    btn_edit: "Править",
    btn_delete: "Удалить",
    reports_title: (n) => `Отчёты о строительстве — ${n}`,
    reports_empty: "Пока нет отчётов",
    report_type_yt: "YouTube",
    report_type_album: "Фото/Альбом",
    reports_add: "Добавить отчёт",
    report_name: "Название",
    report_date: "Дата (месяц/год)",
    report_type: "Тип",
    report_link: "Ссылка",
    btn_open: "Открыть",
    curr_usd: "USD",
    curr_idr: "IDR",
    curr_eur: "EUR",
  }
};
function useLang() {
  const [lang, setLang] = useState(() => { try { return localStorage.getItem(LS_LANG) || "ru"; } catch { return "ru"; } });
  useEffect(() => { try { localStorage.setItem(LS_LANG, lang); } catch {} }, [lang]);
  const dict = DICT[lang] || DICT.ru;
  const t = (key, ...args) => {
    const v = dict[key];
    return typeof v === "function" ? v(...args) : (v ?? key);
  };
  return { lang, setLang, t };
}

/* =========================
   I18n для калькулятора
========================= */
const CALC_I18N = {
  en: {
    stages_title: "Installments before key handover (set a comfortable plan)",
    btn_add_stage: "Add stage",
    stages_head_name: "Stage",
    stages_head_pct: "%",
    stages_head_month: "Month",
    stages_head_actions: "Actions",
    stages_sum_prefix: "Stages sum:",
    stages_cmp_over: (target) => `— exceeds target ${target}%`,
    stages_cmp_under: (target) => `— below target ${target}%`,
    stages_cmp_equal: (target) => `— equals target ${target}%`,
    back_to_catalog: "← Back to catalog",
    settings_lang: "Interface language",
    settings_currency: "Display currency",
    settings_idr: "IDR per 1 USD",
    settings_eur: "EUR per 1 USD",
    settings_contract: "Contract signing",
    settings_handover_label: "Key handover",
    settings_handover_fallback: "Construction duration (months)",
    settings_rate: "Global monthly rate, %/mo",
    settings_post_term: "Global post‑handover term (6–24 mo)",
    settings_months: "months:",
    settings_post_term_client: "Post‑handover installments (months)",
    obj_title: "Property",
    obj_col_project: "Project",
    obj_col_villa: "Villa",
    obj_col_sqm: "m²",
    obj_col_ppsm: "$ / m²",
    obj_col_base: "Current price (USD)",
    obj_col_disc: "Discount, %",
    obj_col_pre: "Before keys, %",
    obj_col_term: "Installment term, mo",
    obj_col_rate: "Rate, %/mo",
    obj_col_growth: "Monthly price growth before keys (%)",
    obj_col_dr: "Daily rate (USD)",
    obj_col_occ: "Average occupancy per month (%)",
    obj_col_ridx: "Rental price growth per year (%)",
    obj_col_total: "Total (with the selected plan)",
    kpi_base: "Base price",
    kpi_pre: "Payments before keys",
    kpi_after: "After prepayments",
    kpi_interest: "Interest",
    kpi_total: "Planned total",
    kpi_roi_to_keys: "ROI before keys (annualized)",
    kpi_net_to_keys: "Net income before keys",
    kpi_lease_term: "Net leasehold term after keys",
    kpi_irr: "IRR",
    kpi_exit: "Exit",
    kpi_cum_roi: "Cumulative ROI",
    cashflow_title: "Full payment schedule",
    btn_export_csv: "Export CSV",
    btn_export_xlsx: "Export Excel",
    btn_export_pdf: "Save to PDF",
    cashflow_col_month: "Month",
    cashflow_col_desc: "Description",
    cashflow_col_pay: "Payment",
    cashflow_col_rent: "Rental income",
    cashflow_col_net: "Net per month",
    cashflow_col_balance: "Contract balance",
    finmodel_title: "Investment return model",
    finmodel_subtitle: "Impact of factors on price and rental yield",
    finmodel_legend_infl: "Inflation:",
    finmodel_legend_age: "Aging:",
    finmodel_legend_lease: "Lease decay:",
    finmodel_legend_brand: "Brand factor:",
    price_chart_title: "Villa price & rental dynamics",
    yearly_title: "Indicators (yearly)",
    yearly_col_year: "Year",
    yearly_col_lease: "Lease Factor",
    yearly_col_age: "Age Factor",
    yearly_col_brand: "Brand Factor",
    yearly_col_infl: "Inflation factor",
    yearly_col_price: "Market price",
    yearly_col_rent: "Rental income",
    yearly_col_cap: "Total capitalization",
    yearly_col_roi: "ROI / year (%)",
    yearly_col_cum: "Cumulative ROI (%)",
    yearly_col_irr: "IRR (%)",
    monthly_title: "Indicators (installment period)",
    monthly_col_period: "Period",
    monthly_col_payment: "Installment payment",
    monthly_col_mroi: "ROI / month (%)",
    monthly_col_mcum: "Cumulative ROI (%)",
  },
  ru: {
    stages_title: "Рассрочка до получения ключей (установите комфортный план оплаты)",
    btn_add_stage: "Добавить этап",
    stages_head_name: "Этап",
    stages_head_pct: "%",
    stages_head_month: "Месяц",
    stages_head_actions: "Действия",
    stages_sum_prefix: "Сумма этапов:",
    stages_cmp_over: (target) => `— превышает ${target}%`,
    stages_cmp_under: (target) => `— ниже целевого ${target}%`,
    stages_cmp_equal: (target) => `— совпадает с целевым ${target}%`,
    back_to_catalog: "← К каталогу",
    settings_lang: "Язык интерфейса",
    settings_currency: "Валюта отображения",
    settings_idr: "IDR за 1 USD",
    settings_eur: "EUR за 1 USD",
    settings_contract: "Заключение договора",
    settings_handover_label: "Завершение строительства",
    settings_handover_fallback: "Срок строительства (мес)",
    settings_rate: "Глобальная ставка, %/мес",
    settings_post_term: "Глобальный срок post‑handover (6–24 мес)",
    settings_months: "месяцев:",
    settings_post_term_client: "Post‑handover рассрочка (мес)",
    obj_title: "Объект недвижимости",
    obj_col_project: "Проект",
    obj_col_villa: "Вилла",
    obj_col_sqm: "м²",
    obj_col_ppsm: "$ / м²",
    obj_col_base: "Текущая стоимость (USD)",
    obj_col_disc: "Скидка, %",
    obj_col_pre: "До ключей, %",
    obj_col_term: "Срок рассрочки, мес",
    obj_col_rate: "Ставка, %/мес",
    obj_col_growth: "Месячный рост цены до ключей (%)",
    obj_col_dr: "Стоимость проживания в сутки (USD)",
    obj_col_occ: "Средняя заполняемость за месяц (%)",
    obj_col_ridx: "Рост цены аренды в год (%)",
    obj_col_total: "Итоговая стоимость (с учетом выбранного плана рассрочки)",
    kpi_base: "Базовая цена",
    kpi_pre: "Платежи до ключей",
    kpi_after: "После предоплат",
    kpi_interest: "Проценты",
    kpi_total: "Итог по плану",
    kpi_roi_to_keys: "ROI до ключей (г/г)",
    kpi_net_to_keys: "Чистый доход до ключей",
    kpi_lease_term: "Чистый срок лизхолда после ключей",
    kpi_irr: "IRR",
    kpi_exit: "Выход",
    kpi_cum_roi: "Кум. ROI",
    cashflow_title: "Полный график платежей",
    btn_export_csv: "Экспорт CSV",
    btn_export_xlsx: "Экспорт Excel",
    btn_export_pdf: "Сохранить в PDF",
    cashflow_col_month: "Месяц",
    cashflow_col_desc: "Описание",
    cashflow_col_pay: "Платеж",
    cashflow_col_rent: "Арендный доход",
    cashflow_col_net: "Чистый платеж/доход в месяц",
    cashflow_col_balance: "Остаток по договору",
    finmodel_title: "Финмодель доходности инвестиций",
    finmodel_subtitle: "Влияние факторов на цену и доходность от аренды",
    finmodel_legend_infl: "ИНФЛЯЦИЯ:",
    finmodel_legend_age: "СТАРЕНИЕ:",
    finmodel_legend_lease: "LEASE DECAY:",
    finmodel_legend_brand: "BRAND FACTOR:",
    price_chart_title: "Динамика стоимости виллы и арендного дохода",
    yearly_title: "Расчет показателей (годовой)",
    yearly_col_year: "Год",
    yearly_col_lease: "Lease Factor",
    yearly_col_age: "Age Factor",
    yearly_col_brand: "Brand Factor",
    yearly_col_infl: "Коэффициент инфляции",
    yearly_col_price: "Рыночная стоимость",
    yearly_col_rent: "Арендный доход",
    yearly_col_cap: "Совокупная капитализация",
    yearly_col_roi: "ROI за год (%)",
    yearly_col_cum: "Итоговый ROI (%)",
    yearly_col_irr: "IRR (%)",
    monthly_title: "Расчет показателей (на период рассрочки)",
    monthly_col_period: "Период",
    monthly_col_payment: "Платеж по рассрочке",
    monthly_col_mroi: "ROI за месяц (%)",
    monthly_col_mcum: "Итоговый ROI (%)",
  },
};
const useCalcI18n = (lang) => {
  const dict = CALC_I18N[lang] || CALC_I18N.ru;
  return (k, ...a) => {
    const v = dict[k];
    return typeof v === "function" ? v(...a) : (v ?? k);
  };
};

/* =========================
   Форматирование, даты, деньги
========================= */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const fmtInt = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.round(n || 0));
const fmt2 = (n) => new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(+n || 0);
function fmtMoney(n, c = "USD", max = 0) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: max }).format(Math.round(+n || 0));
}
function ruMonthName(i) {
  const m = ["январь","февраль","март","апрель","май","июнь","июль","август","сентябрь","октябрь","ноябрь","декабрь"];
  return m[Math.max(0, Math.min(11, i))];
}
function ruMonthNamePrepositional(i) {
  const m = ["январе","феврале","марте","апреле","мае","июне","июле","августе","сентябре","октябре","ноябре","декабре"];
  return m[Math.max(0, Math.min(11, i))];
}
function ymLabel(yyyyMm) {
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return "—";
  const [y, m] = yyyyMm.split("-").map(Number);
  return `${ruMonthName(m - 1)} ${y}`;
}
function ymLabelPrepositional(yyyyMm) {
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return "—";
  const [y, m] = yyyyMm.split("-").map(Number);
  return `${ruMonthNamePrepositional(m - 1)} ${y}`;
}
function normalizeYM(input) {
  if (!input) return "";
  if (/^\d{4}-\d{2}$/.test(input)) return input;
  const mapRu = { "январ":"01","феврал":"02","март":"03","апрел":"04","май":"05","мая":"05","июн":"06","июл":"07","август":"08","сентябр":"09","октябр":"10","ноябр":"11","декабр":"12" };
  const v = (input || "").toString().trim().toLowerCase();
  const ym = v.match(/(20\d{2})[-/.](\d{1,2})/);
  if (ym) return `${ym[1]}-${ym[2].padStart(2, "0")}`;
  const ru = v.match(/([а-я]+)/i), y = v.match(/(20\d{2})/);
  if (ru && y) { const k = Object.keys(mapRu).find(k => ru[1].startsWith(k)); if (k) return `${y[1]}-${mapRu[k]}`; }
  return "";
}
function monthsDiff(fromDate, yyyyMm) {
  if (!/^\d{4}-\d{2}$/.test(yyyyMm)) return null;
  const [y, m] = yyyyMm.split("-").map(Number);
  const target = new Date(y, m - 1, 1);
  const base = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  return Math.max(0, (target.getFullYear() - base.getFullYear()) * 12 + (target.getMonth() - base.getMonth()));
}
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const getYoutubeId = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
  } catch {}
  return null;
};

/* =========================
   Reveal анимация
========================= */
function useRevealOnMount() {
  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    });
  }, []);
}
function useRevealOnRoute(routeKey) {
  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
    });
  }, [routeKey]);
}

/* =========================
   Портал для модалок + lock-scroll
========================= */
function Portal({ children }) {
  const elRef = useRef(null);
  if (!elRef.current) {
    elRef.current = document.createElement("div");
    elRef.current.className = "portal-root";
  }
  useEffect(() => {
    const el = elRef.current;
    document.body.appendChild(el);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      try { document.body.removeChild(el); } catch {}
    };
  }, []);
  return ReactDOM.createPortal(children, elRef.current);
}

/* =========================
   Дефолтные данные каталога (+ поля документов)
========================= */
function defaults() {
  return [
    {
      projectId: "ahau-gardens",
      projectName: "Ahau Gardens by Arconique",
      theme: "light",
      plannedCompletion: "2026-12",
      constructionProgressPct: 20,
      presentationUrl: "",
      masterPlan: { url: "", caption: "" },
      constructionReports: [],
      includes: [
        "Полная комплектация (под ключ)",
        "Налог с продаж 10%",
        "Нотариальные 1%",
        "График платежей: 30%+30%+25%+10%+5%"
      ],
      villas: [
        { villaId: "ahau-type-a-2br", name: "Type A 2 bedroom", status: "available", rooms: "2", land: 201.7, area: 142.7, f1: 107.1, f2: 38.89, roof: 0, garden: 57.5, ppsm: 2200, baseUSD: 313940, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2055-01-01", dailyRateUSD: 220, occupancyPct: 75, rentalPriceIndexPct: 5 },
        { villaId: "ahau-type-b-2br", name: "Type B 2 bedroom", status: "hold", rooms: "2", land: 180.0, area: 192.0, f1: 83.1, f2: 67.96, roof: 40.9, garden: 24.51, ppsm: 2250, baseUSD: 432000, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2055-01-01", dailyRateUSD: 280, occupancyPct: 75, rentalPriceIndexPct: 5 }
      ]
    },
    {
      projectId: "enso-villas",
      projectName: "ENSO by Arconique",
      theme: "light",
      plannedCompletion: "2026-12",
      constructionProgressPct: 20,
      presentationUrl: "",
      masterPlan: { url: "", caption: "" },
      constructionReports: [],
      includes: [
        "Полная комплектация (под ключ)",
        "Налог с продаж 10%",
        "Нотариальные 1%",
        "График платежей: 30%+30%+25%+10%+5%"
      ],
      villas: [
        { villaId: "enso-l-type-2br", name: "L type 2 bedroom", status: "available", rooms: "2", land: 174.6, area: 104.1, f1: 0, f2: 0, roof: 0, garden: 40.73, ppsm: 2610, baseUSD: 271701, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2054-12-01", dailyRateUSD: 220, occupancyPct: 70, rentalPriceIndexPct: 5 },
        { villaId: "enso-v-type-2br", name: "V type 2 bedroom", status: "reserved", rooms: "2", land: 165.8, area: 114.1, f1: 0, f2: 0, roof: 0, garden: 43.4, ppsm: 2548, baseUSD: 290840, monthlyPriceGrowthPct: 1.5, leaseholdEndDate: "2054-12-01", dailyRateUSD: 220, occupancyPct: 70, rentalPriceIndexPct: 5 }
      ]
    }
  ];
}
const migrateProject = (p) => ({
  ...p,
  plannedCompletion: normalizeYM(p.plannedCompletion) || "",
  presentationUrl: typeof p.presentationUrl === "string" ? p.presentationUrl : "",
  masterPlan: p.masterPlan && typeof p.masterPlan === "object" ? { url: p.masterPlan.url || "", caption: p.masterPlan.caption || "" } : { url: "", caption: "" },
  constructionReports: Array.isArray(p.constructionReports) ? p.constructionReports : [],
});
const loadCatalog = () => {
  try {
    const raw = localStorage.getItem(LS_CATALOG);
    const cat = raw ? JSON.parse(raw) : defaults();
    const norm = Array.isArray(cat) ? cat : defaults();
    return norm.map(migrateProject);
  } catch { return defaults().map(migrateProject); }
};
const saveCatalog = (c) => { try { localStorage.setItem(LS_CATALOG, JSON.stringify(c)); } catch {} };

/* =========================
   Финансовые утилиты
========================= */
function getDaysInMonthFrom(startDate, offsetMonths) {
  const d = new Date(startDate);
  d.setMonth(d.getMonth() + offsetMonths);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
function getCleanLeaseholdTerm(leaseholdEndISO, startMonth, handoverMonth) {
  if (!leaseholdEndISO) return { years: 0, months: 0 };
  const handoverDate = new Date(startMonth);
  handoverDate.setMonth(handoverDate.getMonth() + handoverMonth);
  const end = new Date(leaseholdEndISO);
  const months = Math.max(0, (end.getFullYear() - handoverDate.getFullYear()) * 12 + (end.getMonth() - handoverDate.getMonth()));
  return { years: Math.floor(months / 12), months: months % 12 };
}
function getIndexedRentalPrice(baseDailyUSD, indexPct, yearOffset) {
  return (+baseDailyUSD || 0) * Math.pow(1 + (+indexPct || 0) / 100, Math.max(0, yearOffset));
}
function calculateIRR(cashFlows, maxIterations = 100, tolerance = 1e-4) {
  if (!cashFlows || cashFlows.length < 2) return 0;
  let r = 0.1;
  for (let it = 0; it < maxIterations; it++) {
    let npv = 0, d = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      const df = Math.pow(1 + r, i);
      npv += cashFlows[i] / df;
      if (i > 0) d -= i * cashFlows[i] / (df * (1 + r));
    }
    if (Math.abs(npv) < tolerance || Math.abs(d) < tolerance) break;
    r = r - npv / d;
    if (r < -0.99 || r > 10) break;
  }
  return r * 100;
}

/* =========================
   УЛУЧШЕННЫЙ экспорт в PDF (общая функция)
========================= */
async function rafFrames(n=2){for(let i=0;i<n;i++)await new Promise(r=>requestAnimationFrame(()=>r()));}

async function exportNodeToPDF(node, options = {}) {
  const {
    filename = `export-${new Date().toISOString().slice(0,10)}.pdf`,
    orientation = "portrait",
    margin = 6,
    scale = 1.75,
    hideMedia = true,
    stripSticky = true,
    forceNoWrap = true,
    pagebreak = ["css","legacy"],
    beforeClone = null,
    afterDone = null
  } = options;

  try {
    if (typeof html2pdf === "undefined") {
      alert("html2pdf не загружен (подключите bundle до app.js)");
      return;
    }
    if (!node) { alert("Нет узла для экспорта"); return; }

    const clone = node.cloneNode(true);
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, { position:"fixed", inset:"0", background:"#fff", overflow:"auto", opacity:"0", zIndex:"999999" });
    wrapper.className = "print-mode";

    if (hideMedia) clone.querySelectorAll("img,video,iframe").forEach(el => el.style.display="none");
    if (stripSticky) clone.querySelectorAll("*").forEach(el => { const s=getComputedStyle(el); if (s.position==="sticky") el.style.position="static"; });
    if (forceNoWrap) clone.querySelectorAll("table,th,td").forEach(el => el.style.whiteSpace = "nowrap");

    if (typeof beforeClone === "function") { try { beforeClone(clone); } catch {} }
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    if (document.fonts?.ready) { try { await document.fonts.ready; } catch {} }
    await rafFrames(2);

    const windowWidth = wrapper.scrollWidth || wrapper.clientWidth || 1200;
    const windowHeight = Math.max(wrapper.scrollHeight, 800);
    let adjScale = scale;
    if (windowHeight > 30000) adjScale = Math.min(adjScale, 1.25);
    else if (windowHeight > 15000) adjScale = Math.min(adjScale, 1.5);

    await html2pdf().from(wrapper).set({
      margin,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        backgroundColor: "#fff",
        scale: adjScale,
        useCORS: true,
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth,
        windowHeight
      },
      jsPDF: { unit: "mm", format: "a4", orientation },
      pagebreak: { mode: pagebreak }
    }).save();

    try { document.body.removeChild(wrapper); } catch {}
    if (typeof afterDone === "function") afterDone();
  } catch (e) {
    console.error(e);
    alert("PDF не сформирован, см. консоль");
  }
}

/* =========================
   CatalogManager (полный, c i18n и валютами)
========================= */
function CatalogManager({ catalog, setCatalog, onCalculate, isClient, lang, setLang, rates, setRates, t }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddVillaModal, setShowAddVillaModal] = useState(false);
  const [editingVilla, setEditingVilla] = useState(null);
  const [reportsProject, setReportsProject] = useState(null);

  const [newProjectForm, setNewProjectForm] = useState({
    projectId: "", projectName: "", plannedCompletion: "2026-12", constructionProgressPct: 20,
    presentationUrl: "", masterPlan: { url: "", caption: "" }, constructionReports: [], includes: []
  });
  const [newVillaForm, setNewVillaForm] = useState({
    projectId: "", villaId: "", name: "", status: "available",
    rooms: "", land: 0, area: 100, f1: 0, f2: 0, roof: 0, garden: 0,
    ppsm: 2500, baseUSD: 250000,
    monthlyPriceGrowthPct: 2, leaseholdEndDate: new Date().toISOString().slice(0,10),
    dailyRateUSD: 150, occupancyPct: 70, rentalPriceIndexPct: 5
  });

  function StatusPill({ status }) {
    const key = status === "available" ? "status_available" : status === "reserved" ? "status_reserved" : "status_hold";
    const cls = status === "available" ? "status-available" : status === "reserved" ? "status-reserved" : "status-hold";
    return <span className={`status-pill ${cls}`}>{t(key)}</span>;
  }

  const filtered = useMemo(() => {
    if (!searchTerm) return catalog;
    const s = searchTerm.toLowerCase();
    return catalog.map(p => ({
      ...p,
      villas: p.villas.filter(v => (v.name || "").toLowerCase().includes(s))
    })).filter(p => p.villas.length > 0 || (p.projectName || "").toLowerCase().includes(s));
  }, [catalog, searchTerm]);

  const projectAnchors = useMemo(() => filtered.map(p => ({ id: p.projectId, name: p.projectName })), [filtered]);

  function convertUSD(valueUSD) {
    if (rates.currency === "IDR") return +valueUSD * (rates.idrPerUsd || 1);
    if (rates.currency === "EUR") return +valueUSD * (rates.eurPerUsd || 1);
    return +valueUSD;
  }
  function displayMoney(valueUSD, max = 0) {
    const v = convertUSD(valueUSD);
    return new Intl.NumberFormat("en-US", { style: "currency", currency: rates.currency || "USD", maximumFractionDigits: max }).format(Math.round(v || 0));
  }

  const addProject = () => {
    setNewProjectForm({
      projectId: "", projectName: "", plannedCompletion: "2026-12", constructionProgressPct: 20,
      presentationUrl: "", masterPlan: { url: "", caption: "" }, constructionReports: [], includes: []
    });
    setShowAddProjectModal(true);
  };
  const saveProject = () => {
    if (!newProjectForm.projectName) { alert(t("label_project_name")); return; }
    const projectIdBase = newProjectForm.projectName.toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");
    let projectId = projectIdBase || `project-${Date.now()}`;
    let suffix = 2;
    while (catalog.find(p => p.projectId === projectId)) projectId = `${projectIdBase}-${suffix++}`;
    const planned = normalizeYM(newProjectForm.plannedCompletion);
    const newProject = { ...newProjectForm, projectId, plannedCompletion: planned };
    setCatalog(prev => [...prev, { ...newProject, villas: [] }]);
    setShowAddProjectModal(false);
  };
  const deleteProject = (projectId) => {
    if (!confirm(`${t("btn_delete")}?`)) return;
    setCatalog(prev => prev.filter(p => p.projectId !== projectId));
  };

  const openEditProject = (project) => setEditingProject({ ...project });
  const commitEditProject = () => {
    const planned = normalizeYM(editingProject.plannedCompletion);
    const mp = editingProject.masterPlan || { url: "", caption: "" };
    setCatalog(prev => prev.map(p => p.projectId === editingProject.projectId
      ? { ...editingProject, plannedCompletion: planned, masterPlan: { url: mp.url || "", caption: mp.caption || "" } }
      : p));
    setEditingProject(null);
  };

  const addVilla = (projectId) => {
    setShowAddVillaModal(true);
    setNewVillaForm({
      projectId, villaId: "", name: "", status: "available",
      rooms: "", land: 0, area: 100, f1: 0, f2: 0, roof: 0, garden: 0,
      ppsm: 2500, baseUSD: 250000,
      monthlyPriceGrowthPct: 2, leaseholdEndDate: new Date().toISOString().slice(0,10),
      dailyRateUSD: 150, occupancyPct: 70, rentalPriceIndexPct: 5
    });
  };
  const uniqueVillaId = (project, baseName) => {
    const base = `${project.projectId}-${(baseName || "").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")}` || `${project.projectId}-villa`;
    if (!project.villas.find(v => v.villaId === base)) return base;
    let i = 2, id = `${base}-${i}`;
    while (project.villas.find(v => v.villaId === id)) { i += 1; id = `${base}-${i}`; }
    return id;
  };
  const saveVilla = () => {
    const project = catalog.find(p => p.projectId === newVillaForm.projectId);
    if (!project) { alert("No project"); return; }
    if (!newVillaForm.name) { alert("Name / Название"); return; }
    const villaId = uniqueVillaId(project, newVillaForm.name);
    const v = { ...newVillaForm, villaId };
    setCatalog(prev => prev.map(p => p.projectId === project.projectId ? { ...p, villas: [...p.villas, v] } : p));
    setShowAddVillaModal(false);
  };
  const deleteVilla = (projectId, villaId) => {
    if (!confirm(`${t("btn_delete")}?`)) return;
    setCatalog(prev => prev.map(p => p.projectId === projectId ? { ...p, villas: p.villas.filter(v => v.villaId !== villaId) } : p));
  };

  function openEditVilla(villa, projectId) { setEditingVilla({ ...villa, projectId }); }
  function commitEditVilla() {
    setCatalog(prev => prev.map(p => p.projectId === editingVilla.projectId
      ? { ...p, villas: p.villas.map(x => x.villaId === editingVilla.villaId ? editingVilla : x) }
      : p
    ));
    setEditingVilla(null);
  }

  function openReports(project) { setReportsProject({ ...project }); }
  function addReport(patch) {
    const item = { id: uid(), date: patch.date || "", title: patch.title || "", type: patch.type || "youtube", url: patch.url || "" };
    setReportsProject(prev => ({ ...prev, constructionReports: [...(prev.constructionReports || []), item] }));
  }
  function deleteReport(id) {
    setReportsProject(prev => ({ ...prev, constructionReports: (prev.constructionReports || []).filter(r => r.id !== id) }));
  }
  function saveReportsToProject() {
    if (!reportsProject) return;
    setCatalog(prev => prev.map(p => p.projectId === reportsProject.projectId ? { ...p, constructionReports: reportsProject.constructionReports || [] } : p));
    setReportsProject(null);
  }

  async function exportProjectPDF(projectId) {
    const original = document.getElementById(`project-${projectId}`);
    await exportNodeToPDF(original, {
      filename: `arconique-price-list-${projectId}.pdf`,
      orientation: "landscape",
      scale: 2
    });
  }

  return (
    <div className="catalog-section reveal">
      <div className="catalog-header">
        <h2>{t("projects_title")}</h2>
        <div className="catalog-controls">
          <input className="search-input" placeholder={t("search_placeholder")} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          <select className="btn small" value={lang} onChange={e => { setLang(e.target.value); try { localStorage.setItem(LS_LANG, e.target.value); } catch {} }}>
            <option value="en">EN</option><option value="ru">RU</option>
          </select>
          <select className="btn small" value={rates.currency} onChange={e => setRates(prev => ({ ...prev, currency: e.target.value }))}>
            <option value="USD">{t("curr_usd")}</option><option value="IDR">{t("curr_idr")}</option><option value="EUR">{t("curr_eur")}</option>
          </select>
          {!isClient && (
            <>
              <input className="btn small" style={{ width:110 }} type="number" step="1" value={rates.idrPerUsd || 16300}
                     onChange={e => setRates(prev => ({ ...prev, idrPerUsd: clamp(parseFloat(e.target.value||0), 1, 1e9) }))} title="IDR per USD" />
              <input className="btn small" style={{ width:110 }} type="number" step="0.01" value={rates.eurPerUsd || 0.88}
                     onChange={e => setRates(prev => ({ ...prev, eurPerUsd: clamp(parseFloat(e.target.value||0), 0.01, 100) }))} title="EUR per USD" />
            </>
          )}
          {!isClient && <button className="btn primary" onClick={addProject}>{t("modal_add_project")}</button>}
        </div>
      </div>

      <div className="project-anchors">
        <button className="pill link" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>{t("anchors_all")}</button>
        {projectAnchors.map(a => (
          <button key={a.id} className="pill link" onClick={() => {
            const el = document.getElementById(`project-${a.id}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          }}>{a.name}</button>
        ))}
      </div>

      <div className="catalog-list">
        {filtered.map(project => (
          <div id={`project-${project.projectId}`} key={project.projectId} className="project-card">
            <div className="project-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, padding:"12px" }}>
              <h3 style={{ margin:0 }}>{project.projectName}</h3>
              <div className="project-actions" style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                {project.presentationUrl && (
                  <a className="btn small" href={project.presentationUrl} target="_blank" rel="noreferrer">{t("btn_presentation")}</a>
                )}
                <button className="btn small" onClick={() => openReports(project)}>{t("btn_reports")}</button>
                <button className="btn small" onClick={() => exportProjectPDF(project.projectId)}>{t("btn_price_list")}</button>
                {!isClient && <button className="btn small" onClick={() => openEditProject(project)}>{t("btn_edit")}</button>}
                {!isClient && <button className="btn danger small" onClick={() => deleteProject(project.projectId)}>{t("btn_delete")}</button>}
                {!isClient && <button className="btn success small" onClick={() => addVilla(project.projectId)}>{t("btn_add_villa")}</button>}
              </div>
            </div>

            <div className="pill-row" style={{ display:"flex", gap:6, flexWrap:"wrap", padding:"0 12px 10px" }}>
              {project.plannedCompletion && (
                <span className="pill">{t("pill_keys_in", ymLabelPrepositional(project.plannedCompletion))}</span>
              )}
              {Number.isFinite(project.constructionProgressPct) && (
                <span className="pill pill-muted">{t("pill_progress", project.constructionProgressPct)}</span>
              )}
            </div>

            <div className="project-details-grid" style={{ display:"grid", gap:12, gridTemplateColumns:"1fr 1fr", padding:"0 12px 12px" }}>
              <div>
                <div className="project-includes" style={{ background:"#fff", border:"1px dashed #b9b9b9", borderRadius:12, padding:12 }}>
                  <div className="includes-title" style={{ fontWeight:600, marginBottom:6 }}>{t("catalog_includes")}</div>
                  <ul className="includes-list" style={{ margin:0, paddingLeft:18 }}>
                    {(project.includes || []).map((item, i) => (<li key={i}>{item}</li>))}
                  </ul>
                </div>
              </div>
              <div>
                {project.masterPlan?.url ? (
                  <a className="masterplan-card" href={project.masterPlan.url} target="_blank" rel="noreferrer" title="Master plan" style={{ display:"block", background:"#fff", border:"1px dashed #b9b9b9", borderRadius:12, padding:12 }}>
                    <img className="masterplan-img" src={project.masterPlan.url} alt="Master plan" crossOrigin="anonymous" style={{ width:"100%", height:220, objectFit:"cover", borderRadius:8 }} />
                    {project.masterPlan.caption ? <div className="label" style={{ marginTop:8 }}>{project.masterPlan.caption}</div> : null}
                  </a>
                ) : (
                  !isClient ? <div className="masterplan-card" style={{ background:"#fff", border:"1px dashed #b9b9b9", borderRadius:12, padding:12 }}><div className="label">{t("masterplan_add_hint")}</div></div> : null
                )}
              </div>
            </div>

            <div className="table-wrap scroll-x" style={{ padding:"0 12px 12px" }}>
              <table className="catalog-table" style={{ width:"100%", background:"#fff", border:"1px dashed #b9b9b9", borderRadius:12, borderCollapse:"separate", borderSpacing:0 }}>
                <thead>
                  <tr style={{ background:"#f3f4f6" }}>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_villa")}</th>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_rooms")}</th>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_land")}</th>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_villa_area")}</th>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_floor1")}</th>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_floor2")}</th>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_rooftop")}</th>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_garden")}</th>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_ppsm")}</th>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_price_vat")}</th>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_status")}</th>
                    <th className="w-1" style={{ textAlign:"left", padding:"12px" }}>{t("table_action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {project.villas.map(v => {
                    const isAvail = v.status === "available";
                    return (
                      <tr key={v.villaId} style={{ borderTop:"1px solid #e5e7eb" }}>
                        <td className="td-left" style={{ padding:"10px 12px" }}>{v.name}</td>
                        <td style={{ padding:"10px 12px" }}>{v.rooms || "—"}</td>
                        <td style={{ padding:"10px 12px" }}>{v.land ?? 0}</td>
                        <td style={{ padding:"10px 12px" }}>{v.area ?? 0}</td>
                        <td style={{ padding:"10px 12px" }}>{v.f1 ?? 0}</td>
                        <td style={{ padding:"10px 12px" }}>{v.f2 ?? 0}</td>
                        <td style={{ padding:"10px 12px" }}>{v.roof ?? 0}</td>
                        <td style={{ padding:"10px 12px" }}>{v.garden ?? 0}</td>
                        <td style={{ padding:"10px 12px" }}>{isAvail ? (rates.currency === "USD" ? (v.ppsm ?? 0) : Math.round(convertUSD((v.ppsm ?? 0)))) : "—"}</td>
                        <td style={{ padding:"10px 12px" }}>{isAvail ? displayMoney((v.baseUSD || 0) * (1 + VAT)) : "—"}</td>
                        <td style={{ padding:"10px 12px" }}><StatusPill status={v.status} /></td>
                        <td style={{ padding:"10px 12px" }}>
                          {isAvail ? (
                            <button className="btn small primary" onClick={() => onCalculate(project, v)}>{lang === "en" ? "Calculate" : "Рассчитать"}</button>
                          ) : null}
                          {!isClient && (
                            <span style={{ display: "inline-flex", gap: 6, marginLeft: 8 }}>
                              <button className="btn small" onClick={() => openEditVilla(v, project.projectId)}>{t("btn_edit")}</button>
                              <button className="btn danger small" onClick={() => deleteVilla(project.projectId, v.villaId)}>{t("btn_delete")}</button>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {showAddProjectModal && (
        <Portal>
          <div className="modal-overlay" onClick={() => setShowAddProjectModal(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"grid", placeItems:"center", zIndex:1000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width:"min(720px, 92vw)", background:"#fff", borderRadius:12, padding:16 }}>
              <h3>{t("modal_add_project")}</h3>
              <div className="form-group"><label>{t("label_project_name")}</label><input className="input" value={newProjectForm.projectName} onChange={e => setNewProjectForm(p => ({ ...p, projectName: e.target.value }))} /></div>
              <div className="form-group"><label>{t("label_planned_completion")}</label><input type="month" className="input" value={newProjectForm.plannedCompletion} onChange={e => setNewProjectForm(p => ({ ...p, plannedCompletion: e.target.value }))} /></div>
              <div className="form-group"><label>{t("label_progress")}</label><input type="number" min="0" max="100" className="input" value={newProjectForm.constructionProgressPct} onChange={e => setNewProjectForm(p => ({ ...p, constructionProgressPct: clamp(parseFloat(e.target.value||0),0,100) }))} /></div>
              <div className="form-group"><label>{t("label_presentation_url")}</label><input className="input" placeholder="https://..." value={newProjectForm.presentationUrl} onChange={e => setNewProjectForm(p => ({ ...p, presentationUrl: e.target.value }))} /></div>
              <div className="row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="form-group"><label>{t("label_master_url")}</label><input className="input" placeholder="https://..." value={newProjectForm.masterPlan.url} onChange={e => setNewProjectForm(p => ({ ...p, masterPlan: { ...p.masterPlan, url: e.target.value } }))} /></div>
                <div className="form-group"><label>{t("label_master_caption")}</label><input className="input" value={newProjectForm.masterPlan.caption} onChange={e => setNewProjectForm(p => ({ ...p, masterPlan: { ...p.masterPlan, caption: e.target.value } }))} /></div>
              </div>
              <div className="modal-actions" style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:10 }}>
                <button className="btn primary" onClick={saveProject}>{t("btn_save")}</button>
                <button className="btn" onClick={() => setShowAddProjectModal(false)}>{t("btn_cancel")}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {editingProject && (
        <Portal>
          <div className="modal-overlay" onClick={() => setEditingProject(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"grid", placeItems:"center", zIndex:1000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width:"min(720px, 92vw)", background:"#fff", borderRadius:12, padding:16 }}>
              <h3>{t("modal_edit_project")}</h3>
              <div className="form-group"><label>{t("label_project_name")}</label><input className="input" value={editingProject.projectName} onChange={e => setEditingProject(p => ({ ...p, projectName: e.target.value }))} /></div>
              <div className="form-group"><label>{t("label_planned_completion")}</label><input type="month" className="input" value={editingProject.plannedCompletion || ""} onChange={e => setEditingProject(p => ({ ...p, plannedCompletion: e.target.value }))} /></div>
              <div className="form-group"><label>{t("label_progress")}</label><input type="number" min="0" max="100" className="input" value={editingProject.constructionProgressPct ?? 0} onChange={e => setEditingProject(p => ({ ...p, constructionProgressPct: clamp(parseFloat(e.target.value||0),0,100) }))} /></div>
              <div className="form-group"><label>{t("label_presentation_url")}</label><input className="input" placeholder="https://..." value={editingProject.presentationUrl || ""} onChange={e => setEditingProject(p => ({ ...p, presentationUrl: e.target.value }))} /></div>
              <div className="row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div className="form-group"><label>{t("label_master_url")}</label><input className="input" placeholder="https://..." value={editingProject.masterPlan?.url || ""} onChange={e => setEditingProject(p => ({ ...p, masterPlan: { ...(p.masterPlan||{}), url: e.target.value } }))} /></div>
                <div className="form-group"><label>{t("label_master_caption")}</label><input className="input" value={editingProject.masterPlan?.caption || ""} onChange={e => setEditingProject(p => ({ ...p, masterPlan: { ...(p.masterPlan||{}), caption: e.target.value } }))} /></div>
              </div>
              <div className="modal-actions" style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:10 }}>
                <button className="btn primary" onClick={commitEditProject}>{t("btn_save")}</button>
                <button className="btn" onClick={() => setEditingProject(null)}>{t("btn_cancel")}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {showAddVillaModal && (
        <Portal>
          <div className="modal-overlay" onClick={() => setShowAddVillaModal(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"grid", placeItems:"center", zIndex:1000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width:"min(920px, 94vw)", background:"#fff", borderRadius:12, padding:16 }}>
              <h3>{t("btn_add_villa")}</h3>
              <div className="form-row" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                <div className="form-group"><label>{t("table_villa")}</label><input className="input" value={newVillaForm.name} onChange={e => setNewVillaForm(v => ({ ...v, name: e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_status")}</label>
                  <select className="input" value={newVillaForm.status} onChange={e => setNewVillaForm(v => ({ ...v, status: e.target.value }))}>
                    <option value="available">{t("status_available")}</option>
                    <option value="reserved">{t("status_reserved")}</option>
                    <option value="hold">{t("status_hold")}</option>
                  </select>
                </div>
                <div className="form-group"><label>{t("table_rooms")}</label><input className="input" value={newVillaForm.rooms} onChange={e => setNewVillaForm(v => ({ ...v, rooms: e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_land")}</label><input type="number" className="input" value={newVillaForm.land} onChange={e => setNewVillaForm(v => ({ ...v, land: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_villa_area")}</label><input type="number" className="input" value={newVillaForm.area} onChange={e => setNewVillaForm(v => ({ ...v, area: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_floor1")}</label><input type="number" className="input" value={newVillaForm.f1} onChange={e => setNewVillaForm(v => ({ ...v, f1: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_floor2")}</label><input type="number" className="input" value={newVillaForm.f2} onChange={e => setNewVillaForm(v => ({ ...v, f2: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_rooftop")}</label><input type="number" className="input" value={newVillaForm.roof} onChange={e => setNewVillaForm(v => ({ ...v, roof: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_garden")}</label><input type="number" className="input" value={newVillaForm.garden} onChange={e => setNewVillaForm(v => ({ ...v, garden: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_ppsm")}</label><input type="number" className="input" value={newVillaForm.ppsm} onChange={e => setNewVillaForm(v => ({ ...v, ppsm: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_price_vat")}</label><input type="number" className="input" value={newVillaForm.baseUSD} onChange={e => setNewVillaForm(v => ({ ...v, baseUSD: +e.target.value }))} /></div>
              </div>
              <div className="modal-actions" style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:10 }}>
                <button className="btn primary" onClick={saveVilla}>{t("btn_save")}</button>
                <button className="btn" onClick={() => setShowAddVillaModal(false)}>{t("btn_cancel")}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {editingVilla && (
        <Portal>
          <div className="modal-overlay" onClick={() => setEditingVilla(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"grid", placeItems:"center", zIndex:1000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width:"min(920px, 94vw)", background:"#fff", borderRadius:12, padding:16 }}>
              <h3>{t("btn_edit")} — {editingVilla.name}</h3>
              <div className="form-row" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
                <div className="form-group"><label>{t("table_villa")}</label><input className="input" value={editingVilla.name || ""} onChange={e => setEditingVilla(v => ({ ...v, name: e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_status")}</label>
                  <select className="input" value={editingVilla.status || "available"} onChange={e => setEditingVilla(v => ({ ...v, status: e.target.value }))}>
                    <option value="available">{t("status_available")}</option>
                    <option value="reserved">{t("status_reserved")}</option>
                    <option value="hold">{t("status_hold")}</option>
                  </select>
                </div>
                <div className="form-group"><label>{t("table_rooms")}</label><input className="input" value={editingVilla.rooms || ""} onChange={e => setEditingVilla(v => ({ ...v, rooms: e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_land")}</label><input type="number" className="input" value={editingVilla.land ?? 0} onChange={e => setEditingVilla(v => ({ ...v, land: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_villa_area")}</label><input type="number" className="input" value={editingVilla.area ?? 0} onChange={e => setEditingVilla(v => ({ ...v, area: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_floor1")}</label><input type="number" className="input" value={editingVilla.f1 ?? 0} onChange={e => setEditingVilla(v => ({ ...v, f1: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_floor2")}</label><input type="number" className="input" value={editingVilla.f2 ?? 0} onChange={e => setEditingVilla(v => ({ ...v, f2: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_rooftop")}</label><input type="number" className="input" value={editingVilla.roof ?? 0} onChange={e => setEditingVilla(v => ({ ...v, roof: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_garden")}</label><input type="number" className="input" value={editingVilla.garden ?? 0} onChange={e => setEditingVilla(v => ({ ...v, garden: +e.target.value }))} /></div>
                <div className="form-group"><label>{t("table_ppsm")}</label><input type="number" className="input" value={editingVilla.ppsm ?? 0} onChange={e => setEditingVilla(v => ({ ...v, ppsm: +e.target.value }))} /></div>
                <div className="form-group"><label>Price (USD)</label><input type="number" className="input" value={editingVilla.baseUSD ?? 0} onChange={e => setEditingVilla(v => ({ ...v, baseUSD: +e.target.value }))} /></div>
              </div>
              <div className="modal-actions" style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:10 }}>
                <button className="btn primary" onClick={commitEditVilla}>{t("btn_save")}</button>
                <button className="btn" onClick={() => setEditingVilla(null)}>{t("btn_cancel")}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {reportsProject && (
        <Portal>
          <div className="modal-overlay" onClick={() => setReportsProject(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", display:"grid", placeItems:"center", zIndex:1000 }}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width:"min(920px, 94vw)", background:"#fff", borderRadius:12, padding:16 }}>
              <h3>{t("reports_title", reportsProject.projectName)}</h3>
              <div className="catalog-grid" style={{ display:"grid", gap:8, marginTop:8 }}>
                {(reportsProject.constructionReports || []).length === 0 && <div className="label">{t("reports_empty")}</div>}
                {(reportsProject.constructionReports || []).slice().reverse().map(item => {
                  const ytId = item.type === "youtube" ? getYoutubeId(item.url) : null;
                  const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;
                  return (
                    <div key={item.id} className="villa-item" onClick={() => window.open(item.url, "_blank", "noreferrer")} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, padding:8, border:"1px dashed #b9b9b9", borderRadius:10, cursor:"pointer" }}>
                      <div className="villa-info" style={{ minWidth:0 }}>
                        <div className="value" style={{ fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.title || "(untitled)"} — {item.date || "—"}</div>
                        <div className="label" style={{ color:"#666" }}>{item.type === "youtube" ? t("report_type_yt") : t("report_type_album")}</div>
                      </div>
                      {thumb ? <img src={thumb} alt="" style={{ width:72, height:40, objectFit:"cover", borderRadius:8 }} /> : <span className="badge">{t("btn_open")}</span>}
                      {!isClient && (
                        <button className="btn danger small" onClick={(e) => { e.stopPropagation(); deleteReport(item.id); }}>{t("btn_delete")}</button>
                      )}
                    </div>
                  );
                })}
              </div>
              {!isClient && (
                <>
                  <div className="divider-line" style={{ height:1, background:"#e5e7eb", margin:"10px 0" }} />
                  <AddReportForm onAdd={(r) => addReport(r)} t={t} />
                </>
              )}
              <div className="modal-actions" style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:10 }}>
                {!isClient && <button className="btn primary" onClick={saveReportsToProject}>{t("btn_save")}</button>}
                <button className="btn" onClick={() => setReportsProject(null)}>{t("btn_cancel")}</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}

function AddReportForm({ onAdd, t }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("youtube");
  const [url, setUrl] = useState("");
  return (
    <div className="row" style={{ marginTop: 10, display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:8 }}>
      <div className="form-group"><label>{t("report_name")}</label><input className="input" value={title} onChange={e => setTitle(e.target.value)} /></div>
      <div className="form-group"><label>{t("report_date")}</label><input type="month" className="input" value={date} onChange={e => setDate(e.target.value)} /></div>
      <div className="form-group"><label>{t("report_type")}</label>
        <select className="input" value={type} onChange={e => setType(e.target.value)}>
          <option value="youtube">{t("report_type_yt")}</option>
          <option value="album">{t("report_type_album")}</option>
        </select>
      </div>
      <div className="form-group"><label>{t("report_link")}</label><input className="input" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} /></div>
      <div className="form-group" style={{ alignSelf:"end" }}>
        <button className="btn" onClick={() => { if (!url) return; onAdd({ title, date, type, url }); setTitle(""); setDate(""); setUrl(""); }}>{t("reports_add")}</button>
      </div>
    </div>
  );
}

/* =========================
   Калькулятор (полный, с KPI, графиком и 2 таблицами; i18n + IRR)
========================= */
function Calculator({ catalog, initialProject, initialVilla, isClient, onBackToCatalog }) {
  useRevealOnMount();

  const [lang, setLang] = useState("ru");
  const tC = useCalcI18n(lang);

  const [rates, setRates] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_RATES);
      return raw ? JSON.parse(raw) : { currency: "USD", idrPerUsd: 16300, eurPerUsd: 0.88 };
    } catch { return { currency: "USD", idrPerUsd: 16300, eurPerUsd: 0.88 }; }
  });
  useEffect(() => { try { localStorage.setItem(LS_RATES, JSON.stringify(rates)); } catch {} }, [rates]);

  const [startMonth, setStartMonth] = useState(new Date());
  const [handoverMonth, setHandoverMonth] = useState(12);
  const [months, setMonths] = useState(12);
  const [monthlyRatePct, setMonthlyRatePct] = useState(8.33);

  useEffect(() => {
    const ym = initialProject?.plannedCompletion && normalizeYM(initialProject.plannedCompletion);
    if (ym) {
      const md = monthsDiff(startMonth, ym);
      if (md != null) setHandoverMonth(md);
    }
  }, [initialProject, startMonth]);

  const [stages, setStages] = useState([
    { id: 1, label: "Договор", pct: 30, month: 0 },
    { id: 2, label: "50% готовности", pct: 30, month: 6 },
    { id: 3, label: "70% готовности", pct: 20, month: 9 },
    { id: 4, label: "90% готовности", pct: 15, month: 11 },
    { id: 5, label: "Ключи", pct: 5, month: 12 }
  ]);
  const stagesSumPct = useMemo(() => stages.reduce((s, x) => s + (+x.pct || 0), 0), [stages]);

  const [lines, setLines] = useState(() => {
    if (!initialVilla || !initialProject) return [];
    return [{
      id: 1,
      projectId: initialProject.projectId,
      villaId: initialVilla.villaId,
      qty: 1,
      prePct: 100,
      ownTerms: false,
      months: null,
      monthlyRatePct: null,
      firstPostUSD: 0,
      discountPct: 0,
      monthlyPriceGrowthPct: initialVilla.monthlyPriceGrowthPct || 2,
      dailyRateUSD: initialVilla.dailyRateUSD || 150,
      occupancyPct: initialVilla.occupancyPct || 70,
      rentalPriceIndexPct: initialVilla.rentalPriceIndexPct || 5,
      snapshot: {
        name: initialVilla.name,
        area: initialVilla.area,
        ppsm: initialVilla.ppsm,
        baseUSD: initialVilla.baseUSD,
        leaseholdEndDate: initialVilla.leaseholdEndDate
      }
    }];
  });

  function convertUSD(valueUSD) {
    if (rates.currency === "IDR") return +valueUSD * (rates.idrPerUsd || 1);
    if (rates.currency === "EUR") return +valueUSD * (rates.eurPerUsd || 1);
    return +valueUSD;
  }
  function display(valueUSD, max = 0) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: rates.currency || "USD", maximumFractionDigits: max }).format(Math.round(convertUSD(valueUSD) || 0));
  }
  function formatMonth(offset) {
    const d = new Date(startMonth);
    d.setMonth(d.getMonth() + offset);
    return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", { month: "long", year: "numeric" });
  }

  const limitStageLabel = (v) => (v || "").slice(0, 20);
  const parsePct = (v) => {
    const s = (v || "").replace(/,/g,'.').replace(/[^0-9.]/g,'');
    const ix = s.indexOf('.');
    const cleaned = ix >= 0 ? s.slice(0, ix + 1) + s.slice(ix + 1).replace(/\./g,'') : s;
    const trimmed = cleaned.slice(0, 6);
    const num = parseFloat(trimmed);
    return isNaN(num) ? 0 : clamp(num, 0, 100);
  };
  const parseMonth3 = (v) => {
    const s = (v || "").replace(/[^0-9]/g,'').slice(0,3);
    const num = parseInt(s || "0", 10);
    return clamp(num, 0, 120);
  };

  const linesData = useMemo(() => {
    return lines.map(line => {
      const baseOne = line.snapshot?.baseUSD ?? ((line.snapshot?.area || 0) * (line.snapshot?.ppsm || 0));
      const disc = clamp(+line.discountPct || 0, 0, 20);
      const base = baseOne * (1 - disc / 100);

      const prePct = clamp(line.prePct ?? 100, 50, 100);
      const vMonths = line.ownTerms && line.months ? line.months : months;
      const rate = (line.ownTerms && line.monthlyRatePct != null) ? (line.monthlyRatePct / 100) : (monthlyRatePct / 100);
      const firstPostUSD = Math.max(0, +line.firstPostUSD || 0);

      const k = stagesSumPct === 0 ? 0 : prePct / stagesSumPct;
      const preTmp = stages.map(s => ({
        month: Math.max(0, Math.min(handoverMonth, Math.round(+s.month || 0))),
        label: s.label,
        amountUSD: base * (((+s.pct || 0) * k) / 100)
      })).filter(r => r.amountUSD > 0).sort((a,b)=>a.month-b.month);
      const preTotalOne = preTmp.reduce((s, r) => s + r.amountUSD, 0);

      const principalBase = Math.max(0, base - preTotalOne - firstPostUSD);
      let bal = principalBase, totalInterest = 0;
      const principalShare = vMonths > 0 ? principalBase / vMonths : 0;
      const postRows = [];
      for (let i = 1; i <= vMonths; i++) {
        const interest = bal * rate;
        totalInterest += interest;
        const payment = principalShare + interest;
        postRows.push({
          month: handoverMonth + i,
          label: `Месяц ${i}`,
          principalUSD: principalShare,
          interestUSD: interest,
          paymentUSD: payment,
          balanceAfterUSD: Math.max(0, bal - principalShare)
        });
        bal -= principalShare;
      }
      const lineTotalOne = base + totalInterest;

      const preSchedule = stages.map(s => ({
        month: Math.max(0, Math.min(handoverMonth, Math.round(+s.month || 0))),
        label: s.label,
        amountUSD: base * (((+s.pct || 0) * k) / 100)
      })).filter(r => r.amountUSD > 0).sort((a,b)=>a.month-b.month);

      const qty = Math.max(1, parseInt(line.qty || 1, 10));
      const preScheduleQ = preSchedule.map(r => ({...r, amountUSD: r.amountUSD * qty}));
      const postRowsQ = postRows.map(r => ({
        ...r,
        principalUSD: r.principalUSD * qty,
        interestUSD: r.interestUSD * qty,
        paymentUSD: r.paymentUSD * qty
      }));
      const preTotal = preTotalOne * qty;
      const baseQ = base * qty;
      const lineTotal = lineTotalOne * qty;

      return {
        line, qty, baseOne: base, base: baseQ,
        preSchedule: preScheduleQ, preTotal,
        firstPostUSD: firstPostUSD * qty,
        postRows: postRowsQ,
        lineTotal, vMonths, rate,
        discountPct: disc, prePct
      };
    });
  }, [lines, stages, stagesSumPct, handoverMonth, months, monthlyRatePct]);

  const project = useMemo(() => {
    const totals = {
      baseUSD: linesData.reduce((s, x) => s + x.base, 0),
      preUSD: linesData.reduce((s, x) => s + x.preTotal, 0),
      finalUSD: linesData.reduce((s, x) => s + x.lineTotal, 0)
    };
    totals.interestUSD = totals.finalUSD - totals.baseUSD;
    totals.afterUSD = totals.finalUSD - totals.preUSD;

    const m = new Map();
    const push = (month, amt, desc) => {
      if (amt <= 0) return;
      const prev = m.get(month) || { month, items: [], amountUSD: 0 };
      prev.items.push(desc);
      prev.amountUSD += amt;
      m.set(month, prev);
    };
    linesData.forEach(ld => {
      ld.preSchedule.forEach(r => push(r.month, r.amountUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${r.label}`));
      if (ld.firstPostUSD > 0) push(handoverMonth + 1, ld.firstPostUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: Первый платёж`);
      ld.postRows.forEach(r => push(r.month, r.paymentUSD, `${ld.line.snapshot?.name || 'Villa'} ×${ld.qty}: ${r.label}`));
    });

    const rentalIncomeMap = new Map();
    linesData.forEach(ld => {
      const startRentalMonth = handoverMonth + 3;
      for (let month = startRentalMonth; month <= handoverMonth + months; month++) {
        const yearOffset = Math.floor((month - handoverMonth) / 12);
        const price = getIndexedRentalPrice(ld.line.dailyRateUSD, ld.line.rentalPriceIndexPct, yearOffset);
        const dim = getDaysInMonthFrom(startMonth, month);
        const income = price * 0.55 * (ld.line.occupancyPct / 100) * dim * ld.qty;
        if (income > 0) rentalIncomeMap.set(month, (rentalIncomeMap.get(month) || 0) + income);
      }
    });

    const raw = [...m.values()].sort((a, b) => a.month - b.month);
    let cumulative = 0;
    const cashflow = raw.map(row => {
      cumulative += row.amountUSD;
      const balanceUSD = Math.max(0, totals.finalUSD - cumulative);
      const rentalIncome = rentalIncomeMap.get(row.month) || 0;
      return { ...row, rentalIncome, netPayment: row.amountUSD - rentalIncome, cumulativeUSD: cumulative, balanceUSD };
    });

    return { totals, cashflow };
  }, [linesData, handoverMonth, months, startMonth]);

  const selectedVilla = useMemo(() => {
    if (!lines.length) return null;
    const vid = lines[0].villaId;
    for (const p of catalog) {
      const v = p.villas.find(x => x.villaId === vid);
      if (v) return v;
    }
    return null;
  }, [lines, catalog]);

  function calculateMarketPriceAtHandover(villa, line) {
    if (!villa || !line) return 0;
    const base = villa.baseUSD || 0;
    const r = (line.monthlyPriceGrowthPct || 0) / 100;
    return base * Math.pow(1 + r, handoverMonth);
  }

  function generatePricingData(villa, line) {
    if (!villa?.leaseholdEndDate) return [];
    const end = new Date(villa.leaseholdEndDate);
    const totalYears = Math.max(0, Math.ceil((end - startMonth) / (365 * 24 * 60 * 60 * 1000)));
    const mph = calculateMarketPriceAtHandover(villa, line);
    const data = [];
    for (let y = 0; y <= totalYears; y++) {
      const inflationF = Math.pow(1 + 0.10, y);
      const leaseF = Math.pow((Math.max(1, totalYears) - y) / Math.max(1, totalYears), 1);
      const ageF = Math.exp(-0.025 * y);
      const brandF = (y <= 3) ? 1 + (1.2 - 1) * (y / 3) : (y <= 7 ? 1.2 : (y <= 15 ? 1.2 - (1.2 - 1.0) * ((y - 7) / 8) : 1.0));
      data.push({ year: y, leaseFactor: leaseF, ageFactor: ageF, brandFactor: brandF, finalPrice: mph * inflationF * leaseF * ageF * brandF });
    }
    return data;
  }

  function generateMonthlyPricingData(villa, line, linesData) {
    if (!villa?.leaseholdEndDate || !line) return [];
    const totalMonths = months + handoverMonth;
    const mph = calculateMarketPriceAtHandover(villa, line);
    const monthly = [];
    for (let m = 0; m <= totalMonths; m++) {
      let leaseF = 1, ageF = 1, brandF = 1, inflationF = 1, finalPrice = 0, rentalIncome = 0, paymentAmount = 0;
      if (m <= handoverMonth) {
        const r = (line.monthlyPriceGrowthPct || 0) / 100;
        finalPrice = (line.snapshot?.baseUSD || 0) * Math.pow(1 + r, m);
        const pre = linesData.find(ld => ld.line.id === line.id)?.preSchedule.find(s => s.month === m);
        if (pre) paymentAmount = pre.amountUSD;
      } else {
        const yo = (m - handoverMonth) / 12;
        inflationF = Math.pow(1 + 0.10, yo);
        leaseF = 1;
        ageF = Math.exp(-0.025 * yo);
        brandF = (yo <= 3) ? 1 + (1.2 - 1) * (yo / 3) : (yo <= 7 ? 1.2 : (yo <= 15 ? 1.2 - (1.2 - 1.0) * ((yo - 7) / 8) : 1.0));
        finalPrice = mph * inflationF * leaseF * ageF * brandF;

        if (m >= handoverMonth + 3) {
          const price = getIndexedRentalPrice(line.dailyRateUSD, line.rentalPriceIndexPct, yo);
          const dim = getDaysInMonthFrom(startMonth, m);
          rentalIncome = price * 0.55 * (line.occupancyPct / 100) * dim * (line.qty || 1);
        }
        const ld = linesData.find(ld => ld.line.id === line.id);
        const row = ld?.postRows.find(r => r.month === m);
        if (row) paymentAmount = row.paymentUSD;
      }
      monthly.push({
        month: m,
        monthName: formatMonth(m),
        leaseFactor: leaseF, ageFactor: ageF, brandFactor: brandF, inflationFactor: inflationF,
        finalPrice, rentalIncome, paymentAmount
      });
    }
    return monthly;
  }

  const annualRentalIncome = (line, y) => {
    const price = getIndexedRentalPrice(line.dailyRateUSD, line.rentalPriceIndexPct, y);
    return price * 0.55 * (line.occupancyPct / 100) * (12 * 30.4) * (line.qty || 1);
  };

  const totalLeaseholdTerm = useMemo(() => {
    if (!lines.length) return { years: 0, months: 0 };
    const terms = lines.map(l => getCleanLeaseholdTerm(l.snapshot?.leaseholdEndDate, startMonth, handoverMonth));
    return { years: Math.max(...terms.map(t => t.years)), months: Math.max(...terms.map(t => t.months)) };
  }, [lines, startMonth, handoverMonth]);

  const bestExit = useMemo(() => {
    if (!lines.length || !selectedVilla) return { irr: 0, yearIdx: 0, cumRoiPct: 0, year: new Date().getFullYear() };
    const l0 = lines[0];
    const data = generatePricingData(selectedVilla, l0);
    let best = { irr: -Infinity, yearIdx: 0, cumRoiPct: 0, year: new Date().getFullYear() };
    for (let i = 1; i < data.length; i++) {
      const flows = [ -project.totals.finalUSD ];
      for (let y = 1; y < i; y++) flows.push(annualRentalIncome(l0, y));
      const lastIncome = annualRentalIncome(l0, i);
      const irr = calculateIRR([ ...flows, lastIncome + data[i].finalPrice ]);
      const cumRoi = project.totals.finalUSD > 0
        ? ((data[i].finalPrice + flows.slice(1).reduce((s,x)=>s+x,0)) - project.totals.finalUSD) / project.totals.finalUSD * 100
        : 0;
      if (irr > best.irr) {
        best = {
          irr,
          yearIdx: i,
          cumRoiPct: cumRoi,
          year: Math.floor(startMonth.getFullYear() + handoverMonth/12 + i)
        };
      }
    }
    return best;
  }, [selectedVilla, lines, project, startMonth, handoverMonth]);

  async function exportCalcPDF() {
    const scope = document.getElementById("calc-print-scope");
    await exportNodeToPDF(scope, {
      filename: `arconique-calculator-${new Date().toISOString().slice(0,10)}.pdf`,
      orientation: "portrait",
      scale: 1.75
    });
  }

  if (!lines.length || !selectedVilla) {
    return (
      <div className="container reveal">
        <div className="card" style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16 }}>
          <div className="card-header"><h3>Калькулятор</h3></div>
          <div>Нет данных по объекту. Вернитесь в каталог и выберите виллу.</div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn" onClick={onBackToCatalog}>{tC("back_to_catalog")}</button>
          </div>
        </div>
      </div>
    );
  }

  const targetPrePct = clamp(lines[0]?.prePct ?? 100, 50, 100);
  const compareText = stagesSumPct > targetPrePct
    ? tC("stages_cmp_over", targetPrePct.toFixed(2))
    : stagesSumPct < targetPrePct
      ? tC("stages_cmp_under", targetPrePct.toFixed(2))
      : tC("stages_cmp_equal", targetPrePct.toFixed(2));

  return (
    <div className="container reveal">
      <div className="top-section" style={{ display:"grid", gridTemplateColumns:"1.4fr .9fr", gap:12 }}>
        <div className="card stages-card" style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
          <div className="card-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <h3>{tC("stages_title")}</h3>
            <button className="btn primary" onClick={() => setStages(prev => [...prev, { id: (prev.at(-1)?.id || 0) + 1, label: "Новый этап", pct: 0, month: 0 }])}>{tC("btn_add_stage")}</button>
          </div>
          <div className="stages-scroll" style={{ overflowX:"auto" }}>
            <table className="factors-table" style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
              <colgroup>
                <col className="stages-col-name" />
                <col className="stages-col-pct" />
                <col className="stages-col-month" />
                <col />
              </colgroup>
              <thead><tr>
                <th style={{ textAlign:"left", padding:"8px 10px", background:"#f8fafc" }}>{tC("stages_head_name")}</th>
                <th style={{ textAlign:"left", padding:"8px 10px", background:"#f8fafc" }}>{tC("stages_head_pct")}</th>
                <th style={{ textAlign:"left", padding:"8px 10px", background:"#f8fafc" }}>{tC("stages_head_month")}</th>
                <th style={{ textAlign:"left", padding:"8px 10px", background:"#f8fafc" }}>{tC("stages_head_actions")}</th>
              </tr></thead>
              <tbody>
                {stages.map(s => (
                  <tr key={s.id}>
                    <td style={{ padding:"6px 8px" }}>
                      <input className="compact-input" value={s.label} onChange={e => {
                        const v = limitStageLabel(e.target.value || "");
                        setStages(prev => prev.map(x => x.id === s.id ? { ...x, label: v } : x));
                      }} onBlur={e => {
                        const v = limitStageLabel(e.target.value || "");
                        setStages(prev => prev.map(x => x.id === s.id ? { ...x, label: v } : x));
                      }} />
                    </td>
                    <td style={{ padding:"6px 8px" }}>
                      <input className="compact-input" inputMode="decimal" placeholder="0–100"
                        value={String(s.pct)} onChange={e => {
                          const num = parsePct(e.target.value);
                          setStages(prev => prev.map(x => x.id === s.id ? { ...x, pct: num } : x));
                        }} />
                    </td>
                    <td style={{ padding:"6px 8px" }}>
                      <input className="compact-input" inputMode="numeric" placeholder="0–120"
                        value={String(s.month)} onChange={e => {
                          const num = parseMonth3(e.target.value);
                          setStages(prev => prev.map(x => x.id === s.id ? { ...x, month: num } : x));
                        }} />
                    </td>
                    <td style={{ padding:"6px 8px" }}><button className="btn danger small" onClick={() => setStages(prev => prev.filter(x => x.id !== s.id))}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="stages-summary" style={{ marginTop:8 }}>
            <div className="pill">{tC("stages_sum_prefix")} {stagesSumPct.toFixed(2)}% {compareText}</div>
          </div>
        </div>

        <div className="card settings-card" style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
          <div className="row" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
            <div className="field compact"><label>{tC("settings_lang")}</label>
              <select value={lang} onChange={e => setLang(e.target.value)}>
                <option value="ru">Русский</option><option value="en">English</option>
              </select>
            </div>

            <div className="field compact"><label>{tC("settings_currency")}</label>
              <select value={rates.currency} onChange={e => setRates(prev => ({ ...prev, currency: e.target.value }))}>
                <option>USD</option><option>IDR</option><option>EUR</option>
              </select>
            </div>

            {!isClient ? (
              <>
                <div className="field compact"><label>{tC("settings_idr")}</label>
                  <input type="number" min="1" step="1" value={rates.idrPerUsd} onChange={e => setRates(prev => ({ ...prev, idrPerUsd: clamp(parseFloat(e.target.value || 0), 1, 1e9) }))} />
                </div>
                <div className="field compact"><label>{tC("settings_eur")}</label>
                  <input type="number" min="0.01" step="0.01" value={rates.eurPerUsd} onChange={e => setRates(prev => ({ ...prev, eurPerUsd: clamp(parseFloat(e.target.value || 0), 0.01, 100) }))} />
                </div>
              </>
            ) : null}

            <div className="field compact"><label>{tC("settings_contract")}</label>
              <div className="info-display">{startMonth.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", { month: "long", year: "numeric" })}</div>
            </div>

            {normalizeYM(initialProject?.plannedCompletion) ? (
              <div className="field compact"><label>{tC("settings_handover_label")}</label>
                <div className="info-display">{ymLabel(initialProject.plannedCompletion)}</div>
              </div>
            ) : (
              <div className="field compact"><label>{tC("settings_handover_fallback")}</label>
                <input type="number" min="1" step="1" value={handoverMonth} onChange={e => setHandoverMonth(clamp(parseInt(e.target.value || 0, 10), 1, 120))} />
              </div>
            )}

            {!isClient ? (
              <>
                <div className="field compact"><label>{tC("settings_rate")}</label>
                  <input type="number" min="0" step="0.01" value={monthlyRatePct} onChange={e => setMonthlyRatePct(clamp(parseFloat(e.target.value || 0), 0, 1000))} />
                </div>
                <div className="field compact" style={{ gridColumn:"span 2" }}><label>{tC("settings_post_term")}</label>
                  <input type="range" min="6" max="24" step="1" value={months} onChange={e => setMonths(parseInt(e.target.value, 10))} />
                  <div className="pill" style={{ marginTop: 6 }}>{tC("settings_months")} {months}</div>
                </div>
              </>
            ) : (
              <div className="field compact"><label>{tC("settings_post_term_client")}</label>
                <input type="number" min="6" step="1" value={months} onChange={e => setMonths(clamp(parseInt(e.target.value || 0, 10), 6, 120))} />
              </div>
            )}
          </div>

          <div className="row" style={{ marginTop:10 }}>
            <button className="btn" onClick={onBackToCatalog}>{tC("back_to_catalog")}</button>
          </div>
        </div>
      </div>

      {/* ПЕЧАТНЫЙ ДИАПАЗОН */}
      <div id="calc-print-scope" style={{ marginTop:12 }}>
        {/* Объект недвижимости */}
        <div className="card" style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
          <h3 style={{ margin: "6px 0" }}>{tC("obj_title")}</h3>
          <div className="calc-scroll" style={{ overflowX:"auto" }}>
            <table className="calc-table" style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
              <thead>
                <tr>
                  <th>{tC("obj_col_project")}</th><th>{tC("obj_col_villa")}</th><th>{tC("obj_col_sqm")}</th><th>{tC("obj_col_ppsm")}</th><th>{tC("obj_col_base")}</th>
                  {!isClient && <th>{tC("obj_col_disc")}</th>}
                  <th>{tC("obj_col_pre")}</th>
                  {!isClient && <th>{tC("obj_col_term")}</th>}
                  {!isClient && <th>{tC("obj_col_rate")}</th>}
                  {!isClient && <th>{tC("obj_col_growth")}</th>}
                  <th>{tC("obj_col_dr")}</th>
                  <th>{tC("obj_col_occ")}</th>
                  <th>{tC("obj_col_ridx")}</th>
                  <th>{tC("obj_col_total")}</th>
                </tr>
              </thead>
              <tbody>
                {linesData.map(ld => (
                  <tr key={ld.line.id}>
                    <td style={{ textAlign: "left" }}>{catalog.find(p => p.projectId === ld.line.projectId)?.projectName || ld.line.projectId}</td>
                    <td style={{ textAlign: "left" }}>{ld.line.snapshot?.name}</td>
                    <td>{ld.line.snapshot?.area || 0}</td>
                    <td>{ld.line.snapshot?.ppsm || 0}</td>
                    <td className="base-strong">{display(ld.base)}</td>
                    {!isClient && (
                      <td><input type="number" min="0" max="20" step="0.1" className="compact-input" value={ld.line.discountPct || 0} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,discountPct:clamp(parseFloat(e.target.value||0),0,20)}:x))} /></td>
                    )}
                    <td>
                      <input type="range" min="50" max="100" step="1" className="range"
                        value={Math.max(50, Math.min(100, (ld.line.prePct ?? 100)))}
                        onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x, prePct: clamp(parseInt(e.target.value || 0, 10), 50, 100)}:x))} />
                      <div className="pill" style={{ marginTop: 6 }}>{Math.max(50, Math.min(100, (ld.line.prePct ?? 100)))}%</div>
                    </td>
                    {!isClient && (
                      <td>
                        <input type="checkbox" checked={ld.line.ownTerms || false} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,ownTerms:e.target.checked}:x))} />
                        <input type="number" min="6" step="1" disabled={!ld.line.ownTerms} className="compact-input"
                          value={ld.line.months || months} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,months:clamp(parseInt(e.target.value || 0, 10), 6, 120)}:x))} />
                      </td>
                    )}
                    {!isClient && (
                      <td><input type="number" min="0" step="0.01" disabled={!ld.line.ownTerms} className="compact-input" value={ld.line.monthlyRatePct ?? monthlyRatePct} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,monthlyRatePct:clamp(parseFloat(e.target.value || 0), 0, 1000)}:x))} /></td>
                    )}
                    {!isClient && (
                      <td><input type="number" min="0" max="50" step="0.1" className="compact-input" value={ld.line.monthlyPriceGrowthPct || 2} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,monthlyPriceGrowthPct:clamp(parseFloat(e.target.value || 0), 0, 50)}:x))} /></td>
                    )}
                    <td><input type="number" min="0" step="1" className="compact-input" value={ld.line.dailyRateUSD || 150} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,dailyRateUSD:clamp(parseFloat(e.target.value || 0), 0, 10000)}:x))} /></td>
                    <td><input type="number" min="0" max="100" step="1" className="compact-input" value={ld.line.occupancyPct || 70} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,occupancyPct:clamp(parseFloat(e.target.value || 0), 0, 100)}:x))} /></td>
                    <td><input type="number" min="0" max="50" step="0.1" className="compact-input" value={ld.line.rentalPriceIndexPct || 5} onChange={e => setLines(prev => prev.map(x => x.id===ld.line.id?{...x,rentalPriceIndexPct:clamp(parseFloat(e.target.value || 0), 0, 50)}:x))} /></td>
                    <td className="line-total">{display(ld.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* KPI */}
        <div className="card" style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
          <div className="kpi-header-pills" style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
            <span className="badge">Выбрано вилл: {lines.length}</span>
            <span className="badge">Ключи через {handoverMonth} мес.</span>
            <span className="badge">Post‑handover: {months} мес.</span>
          </div>
          <div className="kpis" style={{ display:"grid", gridTemplateColumns:"repeat(4, minmax(0, 1fr))", gap:10 }}>
            {!isClient && (<div className="kpi" style={{ background:"#fafafa", border:"1px solid #eee", borderRadius:10, padding:10 }}><div className="muted">{tC("kpi_base")}</div><div className="v" style={{ fontWeight:700 }}>{display(project.totals.baseUSD)}</div></div>)}
            <div className="kpi kpi-pair" style={{ background:"#fafafa", border:"1px solid #eee", borderRadius:10, padding:10, display:"grid", gap:8 }}>
              <div className="pair-item"><div className="muted">{tC("kpi_pre")}</div><div className="v" style={{ fontWeight:700 }}>{display(project.totals.preUSD)}</div></div>
              <div className="pair-item"><div className="muted">{tC("kpi_after")}</div><div className="v" style={{ fontWeight:700 }}>{display(project.totals.afterUSD)}</div></div>
            </div>
            {!isClient && (<div className="kpi" style={{ background:"#fafafa", border:"1px solid #eee", borderRadius:10, padding:10 }}><div className="muted">{tC("kpi_interest")}</div><div className="v" style={{ fontWeight:700 }}>{display(project.totals.interestUSD)}</div></div>)}
            <div className="kpi" style={{ background:"#fafafa", border:"1px solid #eee", borderRadius:10, padding:10 }}><div className="muted">{tC("kpi_total")}</div><div className="v" style={{ fontWeight:700 }}>{display(project.totals.finalUSD)}</div></div>

            <div className="kpi kpi-pair" style={{ background:"#fafafa", border:"1px solid #eee", borderRadius:10, padding:10, display:"grid", gap:8 }}>
              <div className="pair-item"><div className="muted">{tC("kpi_roi_to_keys")}</div><div className="v" style={{ fontWeight:700 }}>
                {(() => {
                  const l0 = lines[0];
                  const pd = generateMonthlyPricingData(selectedVilla, l0, linesData);
                  const m = Math.max(0, handoverMonth - 1);
                  const mm = pd.find(x => x.month === m);
                  const paid = project.totals.preUSD;
                  const roiAnnual = paid > 0 ? ((Math.max(0, (mm?.finalPrice || 0) - project.totals.finalUSD)) / paid) * 100 * (12 / Math.max(1, m + 1)) : 0;
                  return `${fmt2(roiAnnual)}%`;
                })()}
              </div></div>
              <div className="pair-item"><div className="muted">{tC("kpi_net_to_keys")}</div><div className="v" style={{ fontWeight:700 }}>
                {(() => {
                  const l0 = lines[0];
                  const pd = generateMonthlyPricingData(selectedVilla, l0, linesData);
                  const m = Math.max(0, handoverMonth - 1);
                  const mm = pd.find(x => x.month === m);
                  const net = (mm?.finalPrice || 0) - project.totals.finalUSD;
                  return display(net);
                })()}
              </div></div>
            </div>

            <div className="kpi" style={{ background:"#fafafa", border:"1px solid #eee", borderRadius:10, padding:10 }}>
              <div className="muted">{tC("kpi_irr")}</div>
              <div className="v" style={{ fontWeight:700 }}>{fmt2(bestExit.irr)}%</div>
              <div className="sub" style={{ color:"#666", marginTop:4 }}>
                {tC("kpi_exit")}: {bestExit.year} · {tC("kpi_cum_roi")}: {fmt2(bestExit.cumRoiPct)}%
              </div>
            </div>

            <div className="kpi" style={{ background:"#fafafa", border:"1px solid #eee", borderRadius:10, padding:10 }}>
              <div className="muted">{tC("kpi_lease_term")}</div>
              <div className="v" style={{ fontWeight:700 }}>{totalLeaseholdTerm.years} {lang==="ru"?"лет":"yrs"} {totalLeaseholdTerm.months} {lang==="ru"?"мес.":"mo"}</div>
            </div>
          </div>
        </div>

        <div className="html2pdf__page-break"></div>

        {/* Полный график платежей */}
        <div className="card" style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
          <div className="card-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
            <h2>{tC("cashflow_title")}</h2>
            <div className="export-buttons" style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <button className="btn" onClick={() => {
                const rows = [
                  [tC("cashflow_col_month"),tC("cashflow_col_desc"),tC("cashflow_col_pay"),tC("cashflow_col_rent"),tC("cashflow_col_net"),tC("cashflow_col_balance")],
                  ...project.cashflow.map(c => [
                    formatMonth(c.month),
                    (c.items || []).join(" + "),
                    Math.round(c.amountUSD),
                    Math.round(c.rentalIncome || 0),
                    Math.round(c.netPayment || 0),
                    Math.round(c.balanceUSD)
                  ])
                ];
                const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `arconique_cashflow_${new Date().toISOString().slice(0,10)}.csv`;
                a.click();
                URL.revokeObjectURL(a.href);
              }}>{tC("btn_export_csv")}</button>
              <button className="btn" onClick={() => {
                if (typeof XLSX === "undefined") { alert("Библиотека XLSX не загружена"); return; }
                const ws1 = XLSX.utils.json_to_sheet(project.cashflow.map(c => ({
                  [tC("cashflow_col_month")]: formatMonth(c.month),
                  [tC("cashflow_col_desc")]: (c.items || []).join(" + "),
                  [tC("cashflow_col_pay")]: Math.round(c.amountUSD),
                  [tC("cashflow_col_rent")]: Math.round(c.rentalIncome || 0),
                  [tC("cashflow_col_net")]: Math.round(c.netPayment || 0),
                  [tC("cashflow_col_balance")]: Math.round(c.balanceUSD)
                })));
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws1, "Cashflow");
                XLSX.writeFile(wb, `arconique_installments_${new Date().toISOString().slice(0,10)}.xlsx`);
              }}>{tC("btn_export_xlsx")}</button>
              <button className="btn" onClick={exportCalcPDF}>{tC("btn_export_pdf")}</button>
            </div>
          </div>
          <div className="cashflow-scroll" style={{ overflowX:"auto", marginTop:8 }}>
            <table className="factors-table" style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
              <thead><tr>
                <th>{tC("cashflow_col_month")}</th>
                <th style={{textAlign:"left"}}>{tC("cashflow_col_desc")}</th>
                <th>{tC("cashflow_col_pay")}</th>
                <th>{tC("cashflow_col_rent")}</th>
                <th>{tC("cashflow_col_net")}</th>
                <th>{tC("cashflow_col_balance")}</th>
              </tr></thead>
              <tbody>
                {project.cashflow.map(c => (
                  <tr key={c.month}>
                    <td>{formatMonth(c.month)}</td>
                    <td style={{ textAlign:"left" }}>{(c.items || []).join(" + ")}</td>
                    <td>{display(c.amountUSD)}</td>
                    <td>{display(c.rentalIncome || 0)}</td>
                    <td className={c.netPayment >= 0 ? "positive" : "negative"}>{display(c.netPayment || 0)}</td>
                    <td>{display(c.balanceUSD)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="html2pdf__page-break"></div>

        {/* Финмодель доходности инвестиций (график) */}
        <div className="card" style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
          <h3>{tC("finmodel_title")}</h3>
          <div className="calculation-params-compact" style={{ display:"flex", gap:10, flexWrap:"wrap", color:"#555" }}>
            <div className="param-item-compact"><span className="param-label-compact">{tC("finmodel_legend_infl")}</span><span className="param-value-compact">g = 10%/год</span></div>
            <div className="param-item-compact"><span className="param-label-compact">{tC("finmodel_legend_age")}</span><span className="param-value-compact">β = 0.025/год</span></div>
            <div className="param-item-compact"><span className="param-label-compact">{tC("finmodel_legend_lease")}</span><span className="param-value-compact">α = 1</span></div>
            <div className="param-item-compact"><span className="param-label-compact">{tC("finmodel_legend_brand")}</span><span className="param-value-compact">Пик = 1.2x</span></div>
          </div>

          <div className="pricing-chart-container" style={{ marginTop:8 }}>
            <h4>{tC("price_chart_title")}</h4>
            <p className="chart-subtitle" style={{ color:"#666", margin:"4px 0 8px" }}>{tC("finmodel_subtitle")}</p>
            <div className="pricing-chart-svg">
              <svg width="100%" height="300" viewBox="0 0 800 300">
                {(() => {
                  const l0 = lines[0];
                  const annual = generatePricingData(selectedVilla, l0);
                  if (!annual.length) return null;
                  const rental = annual.map(d => {
                    const price = getIndexedRentalPrice(l0.dailyRateUSD, l0.rentalPriceIndexPct, d.year);
                    const monthsWorked = d.year === 0 ? Math.max(0, 12 - (handoverMonth + 3)) : 12;
                    const avgDays = 30.4;
                    const income = price * 0.55 * (l0.occupancyPct / 100) * (monthsWorked * avgDays) * (l0.qty || 1);
                    return { year: d.year, rentalIncome: income };
                  });
                  const maxV = Math.max(...annual.map(x => x.finalPrice), ...rental.map(x => x.rentalIncome));
                  const minV = 0;
                  const range = Math.max(1, maxV - minV);
                  const x = i => 50 + i * (700 / Math.max(1, annual.length - 1));
                  const y = v => 250 - ((v - minV) / range) * 200;
                  return (
                    <>
                      <polyline fill="none" stroke="#1f6feb" strokeWidth="2" points={annual.map((d,i)=>`${x(i)},${y(d.finalPrice)}`).join(" ")} />
                      <polyline fill="none" stroke="#2da44e" strokeWidth="2" points={rental.map((d,i)=>`${x(i)},${y(d.rentalIncome)}`).join(" ")} />
                      {annual.map((d,i)=>(<circle key={i} cx={x(i)} cy={y(d.finalPrice)} r="3" fill="#1f6feb" />))}
                      {rental.map((d,i)=>(<circle key={`r${i}`} cx={x(i)} cy={y(d.rentalIncome)} r="3" fill="#2da44e" />))}
                      <line x1="50" y1="50" x2="50" y2="250" stroke="#666" />
                      <line x1="50" y1="250" x2="750" y2="250" stroke="#666" />
                      {annual.map((d,i)=>(<text key={`t${i}`} x={x(i)} y="270" fontSize="11" textAnchor="middle" fill="#666">{Math.floor(startMonth.getFullYear() + handoverMonth/12 + d.year)}</text>))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>
        </div>

        <div className="html2pdf__page-break"></div>

        {/* Расчет показателей (годовой) */}
        <div className="card" style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
          <h4>{tC("yearly_title")}</h4>
          <div className="factors-table-scroll" style={{ overflowX:"auto" }}>
            <table className="factors-table" style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
              <thead>
                <tr>
                  <th>{tC("yearly_col_year")}</th><th>{tC("yearly_col_lease")}</th><th>{tC("yearly_col_age")}</th><th>{tC("yearly_col_brand")}</th><th>{tC("yearly_col_infl")}</th>
                  <th>{tC("yearly_col_price")}</th><th>{tC("yearly_col_rent")}</th><th>{tC("yearly_col_cap")}</th><th>{tC("yearly_col_roi")}</th><th>{tC("yearly_col_cum")}</th><th>{tC("yearly_col_irr")}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const l0 = lines[0];
                  const data = generatePricingData(selectedVilla, l0);
                  return data.map((d, i) => {
                    const inflF = Math.pow(1 + 0.10, d.year);
                    const rentalIncome = annualRentalIncome(l0, d.year);
                    const totalCapital = d.finalPrice + rentalIncome;
                    const prev = data[i - 1]?.finalPrice || d.finalPrice;
                    const yearlyRoi = i > 0 ? ((rentalIncome + (d.finalPrice - prev)) / prev) * 100 : 0;
                    const cumulativeRoi = i > 0 ? ((d.finalPrice + rentalIncome - project.totals.finalUSD) / project.totals.finalUSD) * 100 : 0;
                    const cashFlows = [ -project.totals.finalUSD, ...Array.from({length: i}, (_,k)=> annualRentalIncome(l0, k+1) ), rentalIncome + d.finalPrice ];
                    const irr = i > 0 ? calculateIRR(cashFlows) : 0;
                    return (
                      <tr key={i}>
                        <td>{Math.floor(startMonth.getFullYear() + handoverMonth/12 + d.year)}</td>
                        <td>{d.leaseFactor.toFixed(3)}</td>
                        <td>{d.ageFactor.toFixed(3)}</td>
                        <td>{d.brandFactor.toFixed(3)}</td>
                        <td>{inflF.toFixed(3)}</td>
                        <td className="price-cell">{display(d.finalPrice)}</td>
                        <td className="rental-cell">{display(rentalIncome)}</td>
                        <td className="total-capital-cell">{display(totalCapital)}</td>
                        <td className="yearly-roi-cell">{fmt2(yearlyRoi)}%</td>
                        <td className="cumulative-roi-cell">{fmt2(cumulativeRoi)}%</td>
                        <td className="irr-cell">{fmt2(irr)}%</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

        <div className="html2pdf__page-break"></div>

        {/* Расчет показателей (на период рассрочки) */}
        <div className="card" style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
          <h4>{tC("monthly_title")}</h4>
          <div className="factors-table-scroll" style={{ overflowX:"auto" }}>
            <table className="factors-table" style={{ width:"100%", borderCollapse:"separate", borderSpacing:0 }}>
              <thead>
                <tr>
                  <th>{tC("monthly_col_period")}</th><th>Lease Factor</th><th>Age Factor</th><th>Brand Factor</th><th>{tC("yearly_col_infl")}</th>
                  <th>{tC("yearly_col_price")}</th><th>{tC("yearly_col_rent")}</th><th>{tC("yearly_col_cap")}</th><th>{tC("monthly_col_payment")}</th><th>{tC("monthly_col_mroi")}</th><th>{tC("monthly_col_mcum")}</th><th>{tC("yearly_col_irr")}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const l0 = lines[0];
                  const md = generateMonthlyPricingData(selectedVilla, l0, linesData);
                  let paid = 0;
                  return md.map((m, idx) => {
                    paid += m.paymentAmount || 0;
                    const prev = md[idx - 1]?.finalPrice || m.finalPrice;
                    const monthlyRoi = paid > 0 ? ((m.rentalIncome + (m.finalPrice - prev)) / paid) * 100 : 0;
                    const cumulativeRoi = project.totals.finalUSD > 0 ? (((m.finalPrice - project.totals.finalUSD) + m.rentalIncome) / project.totals.finalUSD) * 100 : 0;
                    const irr = calculateIRR([ -project.totals.finalUSD, ...Array.from({length: idx}, ()=> m.rentalIncome || 0), (m.rentalIncome || 0) + m.finalPrice ]);
                    return (
                      <tr key={m.month}>
                        <td>{m.monthName}</td>
                        <td>{m.leaseFactor.toFixed(3)}</td>
                        <td>{m.ageFactor.toFixed(3)}</td>
                        <td>{m.brandFactor.toFixed(3)}</td>
                        <td>{m.inflationFactor.toFixed(3)}</td>
                        <td className="price-cell">{display(m.finalPrice)}</td>
                        <td className="rental-cell">{display(m.rentalIncome)}</td>
                        <td className="total-capital-cell">{display(m.finalPrice + m.rentalIncome)}</td>
                        <td className="payment-cell">{m.paymentAmount > 0 ? display(m.paymentAmount) : "-"}</td>
                        <td className="monthly-roi-cell">{fmt2(monthlyRoi)}%</td>
                        <td className="cumulative-roi-cell">{fmt2(cumulativeRoi)}%</td>
                        <td className="irr-cell">{fmt2(irr)}%</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Главный App
========================= */
function App() {
  useRevealOnMount();
  const { lang, setLang, t } = useLang();

  const [isClient, setIsClient] = useState(true);
  const [catalog, setCatalog] = useState(loadCatalog());
  useEffect(() => saveCatalog(catalog), [catalog]);

  const [rates, setRates] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_RATES);
      return raw ? JSON.parse(raw) : { currency: "USD", idrPerUsd: 16300, eurPerUsd: 0.88 };
    } catch { return { currency: "USD", idrPerUsd: 16300, eurPerUsd: 0.88 }; }
  });
  useEffect(() => { try { localStorage.setItem(LS_RATES, JSON.stringify(rates)); } catch {} }, [rates]);

  const [calcInput, setCalcInput] = useState(null);
  useRevealOnRoute(calcInput ? "calc" : "catalog");

  function handleCalculate(project, villa) {
    setCalcInput({ project, villa });
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
  function handleBackToCatalog() {
    setCalcInput(null);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function toggleMode() {
    if (isClient) {
      const pin = prompt("PIN:");
      if (pin === PIN_CODE) setIsClient(false);
      else if (pin !== null) alert("Wrong PIN");
    } else setIsClient(true);
  }

  return (
    <>
      <div className="container reveal">
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 className="h1" style={{ margin: 0, fontSize: 24 }}>{t("app_title")}</h1>
          <div style={{ display: "flex", gap: 8 }}>
            {calcInput && <button className="btn" onClick={handleBackToCatalog}>{lang === "en" ? "← Back to catalog" : "← К каталогу"}</button>}
            <button className="btn icon tiny" title={isClient ? "Editor" : "Client"} onClick={toggleMode}>🛠</button>
          </div>
        </div>
      </div>

      {!calcInput ? (
        <CatalogManager
          catalog={catalog}
          setCatalog={setCatalog}
          onCalculate={handleCalculate}
          isClient={isClient}
          lang={lang}
          setLang={setLang}
          rates={rates}
          setRates={setRates}
          t={t}
        />
      ) : (
        <Calculator
          catalog={catalog}
          initialProject={calcInput.project}
          initialVilla={calcInput.villa}
          isClient={isClient}
          onBackToCatalog={handleBackToCatalog}
        />
      )}
    </>
  );
}

/* =========================
   Рендер
========================= */
const root = createRoot(document.getElementById("root"));
root.render(<App />);
