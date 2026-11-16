const tabs = document.querySelector('#structure-tabs');
const panel = document.querySelector('#structure-panel');
let entries = [];
let activeId = '';
let playing = true;
let frequency = 60;

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

function renderDiagram(type, title) {
  const base = `<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#45615b" stroke-width=".5" opacity=".35"/></pattern><linearGradient id="box" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#243b3c"/><stop offset="1" stop-color="#172527"/></linearGradient></defs><rect width="600" height="360" fill="url(#grid)"/><text x="20" y="32" fill="#81a198" font-family="monospace" font-size="11">FIG. ${type === 'sealed' ? '01' : type === 'ported' ? '02' : '03'} / SECTION VIEW</text>`;
  const driver = `<g><rect x="128" y="143" width="17" height="76" rx="2" fill="#66847d"/><path class="cone" d="M145 151 L181 171 L181 191 L145 211 Z" fill="#e87955" stroke="#ffab86" stroke-width="2"/><circle cx="181" cy="181" r="10" fill="#f9bb9c"/><path d="M129 150 L118 150 M129 211 L118 211" stroke="#9cbab0" stroke-width="3"/></g>`;
  const outer = `<path d="M144 85 H473 V279 H144 V218 M144 143 V85" fill="url(#box)" stroke="#91ada3" stroke-width="4"/>`;
  const waves = `<g fill="none" stroke="#fa784e" stroke-width="2"><path class="air-pulse" d="M195 155 Q218 181 195 207"/><path class="air-pulse delay" d="M220 144 Q250 181 220 218"/></g><text x="67" y="270" fill="#b3d6cb" font-family="monospace" font-size="11">DRIVER</text><path d="M105 266 L145 220" stroke="#78988f"/>`;
  let special = '';
  if (type === 'sealed') {
    special = `<g fill="none" stroke="#b3d6cb" stroke-width="2" opacity=".85"><path class="air-pulse" d="M337 125 Q315 181 337 238"/><path class="air-pulse delay" d="M365 130 Q343 181 365 232"/></g><path d="M421 134 l12 12 -12 12 12 12 -12 12 12 12 -12 12" fill="none" stroke="#689b90" stroke-width="2"/><text x="374" y="317" fill="#b3d6cb" font-family="monospace" font-size="11">TRAPPED AIR / 彈性負載</text><path d="M404 296 L425 220" stroke="#78988f"/>`;
  } else if (type === 'ported') {
    special = `<path d="M386 279 V237 H431 V279" fill="none" stroke="#fa784e" stroke-width="7"/><path class="line-flow" d="M406 220 V291" fill="none" stroke="#b3d6cb" stroke-width="3"/><path class="line-flow" d="M429 300 Q452 317 474 300" fill="none" stroke="#b3d6cb" stroke-width="2"/><text x="354" y="329" fill="#b3d6cb" font-family="monospace" font-size="11">PORT / 導管</text><path d="M398 311 L408 270" stroke="#78988f"/>`;
  } else {
    special = `<path d="M242 85 V235 H314 V124 H382 V235 H456 V121" fill="none" stroke="#90aaa1" stroke-width="9" stroke-linejoin="round"/><path class="line-flow" d="M197 182 H224 V256 H333 V142 H365 V258 H475" fill="none" stroke="#fa784e" stroke-width="3"/><circle class="air-pulse" cx="482" cy="258" r="5" fill="#fa784e"/><text x="310" y="328" fill="#b3d6cb" font-family="monospace" font-size="11">FOLDED PATH / 聲學路徑</text>`;
  }
  const cabin = type === 'transmission-line' ? outer.replace('H473 V279','H473 V279') : outer;
  return `<svg viewBox="0 0 600 360" role="img" aria-label="${escapeHtml(title)}箱體剖面示意圖">${base}${cabin}${driver}${waves}${special}</svg>`;
}

function renderTabs() {
  tabs.innerHTML = entries.map(item => `<button class="structure-tab" type="button" role="tab" id="tab-${item.id}" aria-controls="structure-panel" aria-selected="${item.id === activeId}" data-id="${item.id}"><span class="tab-number">${escapeHtml(item.number)} /</span><span><span class="tab-main">${escapeHtml(item.name)}</span><span class="tab-English">${escapeHtml(item.english.toUpperCase())}</span></span></button>`).join('');
  tabs.querySelectorAll('button').forEach(button => button.addEventListener('click', () => select(button.dataset.id)));
}

function renderPanel(item) {
  const params = item.parameters.map(param => `<div class="param"><span class="param-label">${escapeHtml(param.label)}</span><span class="param-value">${escapeHtml(param.value)}</span><span class="param-note">${escapeHtml(param.note)}</span></div>`).join('');
  const list = values => values.map(value => `<li>${escapeHtml(value)}</li>`).join('');
  panel.setAttribute('aria-labelledby', `tab-${item.id}`);
  panel.innerHTML = `<div class="panel-upper"><div class="diagram-area"><div class="diagram-top"><span>ACOUSTIC SECTION / ${escapeHtml(item.number)}</span><span>NOT TO SCALE</span></div><div id="diagram-stage" class="diagram-stage ${playing ? 'moving' : ''}" style="--speed:${speed()}s">${renderDiagram(item.diagram, item.name)}</div><div class="diagram-caption">● ${escapeHtml(item.motion.label)}　—　${escapeHtml(item.motion.description)}</div></div><div class="detail-area"><p class="detail-eyebrow">STRUCTURE / ${escapeHtml(item.number)}</p><h3>${escapeHtml(item.name)}<span class="period">.</span></h3><p class="detail-en">${escapeHtml(item.english.toUpperCase())}</p><p class="detail-tagline">${escapeHtml(item.tagline)}</p><p class="detail-principle">${escapeHtml(item.principle)}</p><div class="control-wrap"><div class="control-head"><span class="control-label">EXPLORE / 示意頻率</span><button class="play-button" type="button" aria-label="${playing ? '暫停' : '播放'}示意動畫">${playing ? 'Ⅱ PAUSE' : '▶ PLAY'}</button></div><div class="slider-row"><input id="frequency" type="range" min="30" max="120" step="5" value="${frequency}" aria-label="調整示意頻率"><output for="frequency">${frequency} Hz</output></div><p class="control-hint">調整動畫節奏以觀察運動；這不是聲壓或響應模擬。</p></div></div></div><div class="panel-lower"><div class="specs-area"><p class="small-heading">DESIGN VARIABLES / 設計變數</p><div class="param-grid">${params}</div></div><div class="pros-cons"><div><p class="small-heading">STRENGTHS / 特點</p><ul>${list(item.advantages)}</ul></div><div class="cons"><p class="small-heading">TRADEOFFS / 注意</p><ul>${list(item.tradeoffs)}</ul></div></div></div>`;
  const slider = panel.querySelector('#frequency');
  slider.addEventListener('input', () => { frequency = Number(slider.value); panel.querySelector('output').textContent = `${frequency} Hz`; panel.querySelector('#diagram-stage').style.setProperty('--speed', `${speed()}s`); });
  panel.querySelector('.play-button').addEventListener('click', () => { playing = !playing; panel.querySelector('#diagram-stage').classList.toggle('moving', playing); const button = panel.querySelector('.play-button'); button.textContent = playing ? 'Ⅱ PAUSE' : '▶ PLAY'; button.setAttribute('aria-label', `${playing ? '暫停' : '播放'}示意動畫`); });
}

function speed() { return (3.1 - (frequency - 30) / 90 * 2).toFixed(2); }
function select(id) {
  const item = entries.find(entry => entry.id === id);
  if (!item) return;
  activeId = id;
  renderTabs();
  renderPanel(item);
  history.replaceState(null, '', `#${id}`);
}

fetch('content/enclosures.json').then(response => { if (!response.ok) throw new Error('資料載入失敗'); return response.json(); }).then(data => {
  entries = data.enclosures;
  const hash = location.hash.slice(1);
  select(entries.some(item => item.id === hash) ? hash : entries[0].id);
}).catch(error => { panel.innerHTML = `<p style="padding:30px">內容暫時無法載入。請重新整理頁面。<br><small>${escapeHtml(error.message)}</small></p>`; });
