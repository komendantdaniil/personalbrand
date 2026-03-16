/**
 * Personal Brand Simulator — Interactive Logic
 * Based on empirical research: Frontiers in Psychology (2019), Gorbatov et al. (2021)
 * Career chain: Personal Branding (γ=0.61) → Perceived Employability (β=0.70) → Career Satisfaction
 * Model explains 43% of variance in career satisfaction.
 */

'use strict';

/* =========================================
   THEME TOGGLE
   ========================================= */
(function() {
  const toggle = document.querySelector('[data-theme-toggle]');
  const html = document.documentElement;
  let dark = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  html.setAttribute('data-theme', dark);
  updateToggleIcon(toggle, dark);

  if (toggle) {
    toggle.addEventListener('click', () => {
      dark = dark === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', dark);
      updateToggleIcon(toggle, dark);
    });
  }

  function updateToggleIcon(btn, mode) {
    if (!btn) return;
    btn.setAttribute('aria-label', 'Přepnout na ' + (mode === 'dark' ? 'světlý' : 'tmavý') + ' režim');
    btn.innerHTML = mode === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
})();

/* =========================================
   SLIDER CONFIGURATION
   ========================================= */
const sliders = [
  {
    id: 'sl-linkedin',
    valId: 'val-linkedin',
    insId: 'ins-linkedin',
    labels: ['0 min/den', '5 min/den', '10 min/den', '20 min/den', '30 min/den', '45 min/den', '60+ min/den'],
    insights: [
      '64 % profesionálů používá LinkedIn jako hlavní platformu pro personal brand',
      '47 % recruiterů nepozve kandidáta, kterého nenajde online',
      'Každou minutu je přijato 7 lidí přes LinkedIn — je kde zaujmout',
      'Aktivní LinkedIn profil zvyšuje viditelnost exponenciálně',
      'Konzistentní přítomnost vede k vnímání odbornosti v oboru',
      '76 % manažerů důvěřuje firmě, pokud znají jejího leadera — tvůj profil je tvá firma',
      'Top 1 % profesionálů na LinkedIn investuje 45–60+ min denně'
    ],
    // Weights for brand dimensions [appeal, differentiation, recognition]
    weights: [0.2, 0.3, 0.5]
  },
  {
    id: 'sl-networking',
    valId: 'val-networking',
    insId: 'ins-networking',
    labels: ['žádný', 'občasný', '1 akce/měsíc', '2 akce/měsíc', '1 akce/týden', '2× týdně', 'každý den'],
    insights: [
      'Bez networkingu je kariérní mobilita výrazně omezena',
      'Neformální networking buduje povědomí v okolí',
      'Sociální kapitál: silné propojení koreluje s kariérní mobilitou',
      '70 % pracovních míst se obsazuje skrze síť kontaktů',
      'Pravidelný networking buduje reputaci jako "go-to" osoby v oboru',
      'Intenzivní networking zvyšuje brand recognition exponenciálně',
      'Každodenní networking je strategie top influencerů a leaderů'
    ],
    weights: [0.3, 0.2, 0.5]
  },
  {
    id: 'sl-appearance',
    valId: 'val-appearance',
    insId: 'ins-appearance',
    labels: ['žádná péče', 'minimální', 'přiměřená', 'cílená', 'profesionální', 'strategická', 'výjimečná'],
    insights: [
      'Vizuální složka prvního dojmu tvoří 55 % (UCLA / Mehrabian)',
      'Základní upravenost zajistí průchod prvním filtrem',
      '94 % personalistů odmítne kandidáta kvůli špatnému prvnímu dojmu',
      'Cílený vzhled signalizuje profesionalitu a sebevědomí',
      'APA: styl oblékání hraje měřitelnou roli ve formování dojmu',
      '52,4 % vyšší šance na prestižní roli u atraktivních absolventů MBA (INFORMS, 2025)',
      'Výjimečná vizuální prezentace tvoří silnou offline značku'
    ],
    weights: [0.5, 0.3, 0.2]
  },
  {
    id: 'sl-authenticity',
    valId: 'val-authenticity',
    insId: 'ins-authenticity',
    labels: ['nízká', 'slabá', 'střední', 'dobrá', 'silná', 'velmi silná', 'výjimečná'],
    insights: [
      'Nízká autenticita vede k propasti desired self vs. perceived self',
      'Gen Z naopak preferuje autenticitu před dokonalostí',
      '62 % lidí reaguje ochotněji na autentický obsah',
      'Konzistentní online/offline prezentace předchází nesrovnalostem',
      'Recruiteři zkoumají LinkedIn ještě před pohovorem',
      'Silná autenticita vytváří trvalou brand loyalty',
      'Výjimečná konzistence = silný Brand Recognition'
    ],
    weights: [0.4, 0.35, 0.25]
  },
  {
    id: 'sl-content',
    valId: 'val-content',
    insId: 'ins-content',
    labels: ['nikdy', 'vzácně', '1× měsíčně', '1× týdně', '2–3× týdně', '5× týdně', 'každý den'],
    insights: [
      'Bez obsahu je online přítomnost pasivní a neviditelná',
      'Vzácný obsah udržuje profil živý, ale nebuduje autoritu',
      'Kulturní kapitál: vzdělání a reference sdílené online',
      'Studenti sdílející odbornost reportují vyšší sebevědomí',
      'Pravidelný obsah buduje brand differentiation — jsi expertem',
      'Intenzivní sdílení obsahu = rapidní růst brand appeal',
      'Každodenní obsah je strategie myšlenkových lídrů'
    ],
    weights: [0.35, 0.45, 0.2]
  }
];

/* =========================================
   STATE
   ========================================= */
const state = {
  linkedin: 20,
  networking: 20,
  appearance: 40,
  authenticity: 50,
  content: 30
};

/* =========================================
   UTILITY FUNCTIONS
   ========================================= */
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function mapRange(val, inMin, inMax, outMin, outMax) {
  return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/* =========================================
   COMPUTE BRAND SCORES
   Research model:
   - Raw brand score = weighted average of slider inputs
   - Employability = brand_score * 0.61 (path coefficient γ=0.61)
   - Career satisfaction = employability * 0.70 (path coefficient β=0.70)
   - PBE dimensions computed from specific weighted combinations
   ========================================= */
function computeScores() {
  const li = state.linkedin / 100;
  const nw = state.networking / 100;
  const ap = state.appearance / 100;
  const au = state.authenticity / 100;
  const co = state.content / 100;

  // Brand Appeal: authenticity (40%) + content (35%) + networking (25%)
  const appeal = au * 0.40 + co * 0.35 + nw * 0.25;

  // Brand Differentiation: content (45%) + linkedin (30%) + appearance (25%)
  const differentiation = co * 0.45 + li * 0.30 + ap * 0.25;

  // Brand Recognition: linkedin (50%) + networking (35%) + authenticity (15%)
  const recognition = li * 0.50 + nw * 0.35 + au * 0.15;

  // Composite brand score (equal weight PBE dimensions)
  const brandRaw = (appeal + differentiation + recognition) / 3;

  // Apply path coefficients from Frontiers in Psychology 2019
  // γ = 0.61: personal brand → perceived employability
  // β = 0.70: perceived employability → career satisfaction
  // These are structural equation model path coefficients
  // We normalize to 0–100 range for display
  const brandScore = clamp(brandRaw * 100, 0, 100);
  const employability = clamp(brandScore * 0.61, 0, 100);
  const careerSat = clamp(employability * 0.70, 0, 100);

  // Burnout risk: high investment with low authenticity = burnout risk
  const overextension = (li + nw + co) / 3;
  const burnoutRisk = overextension * (1 - au) * 100;

  return {
    brand: brandScore,
    employability,
    careerSat,
    appeal: appeal * 100,
    differentiation: differentiation * 100,
    recognition: recognition * 100,
    burnout: burnoutRisk
  };
}

/* =========================================
   SLIDER VALUE LABELS
   ========================================= */
function getLabel(sliderId, value) {
  const config = sliders.find(s => s.id === sliderId);
  if (!config) return value;
  const idx = Math.round(mapRange(value, 0, 100, 0, config.labels.length - 1));
  return config.labels[clamp(idx, 0, config.labels.length - 1)];
}

function getInsight(sliderId, value) {
  const config = sliders.find(s => s.id === sliderId);
  if (!config) return '';
  const idx = Math.round(mapRange(value, 0, 100, 0, config.insights.length - 1));
  return config.insights[clamp(idx, 0, config.insights.length - 1)];
}

/* =========================================
   UPDATE UI
   ========================================= */
function updateUI() {
  const scores = computeScores();

  // --- Chain values ---
  setTextContent('chain-brand', Math.round(scores.brand) + '%');
  setTextContent('chain-emp', Math.round(scores.employability) + '%');
  setTextContent('chain-sat', Math.round(scores.careerSat) + '%');

  // --- Bar chart ---
  setBarWidth('bar-brand', scores.brand);
  setBarWidth('bar-emp', scores.employability);
  setBarWidth('bar-sat', scores.careerSat);
  setTextContent('bar-brand-pct', Math.round(scores.brand) + '%');
  setTextContent('bar-emp-pct', Math.round(scores.employability) + '%');
  setTextContent('bar-sat-pct', Math.round(scores.careerSat) + '%');

  // --- PBE scores ---
  setTextContent('pbe-appeal-score', Math.round(scores.appeal));
  setTextContent('pbe-diff-score', Math.round(scores.differentiation));
  setTextContent('pbe-rec-score', Math.round(scores.recognition));
  setBarWidth('pbe-appeal-bar', scores.appeal);
  setBarWidth('pbe-diff-bar', scores.differentiation);
  setBarWidth('pbe-rec-bar', scores.recognition);

  // --- Burnout ---
  updateBurnout(scores.burnout);

  // --- Competition meter ---
  updateMeter(scores.brand);

  // --- Slider values and insights ---
  updateSliderDisplays();
}

function setTextContent(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setBarWidth(id, pct) {
  const el = document.getElementById(id);
  if (el) el.style.width = clamp(pct, 0, 100) + '%';
}

function updateBurnout(risk) {
  const card = document.getElementById('burnout-card');
  const desc = document.getElementById('burnout-desc');
  const level = document.getElementById('burnout-level');
  if (!card || !desc || !level) return;

  card.className = 'burnout-card';
  if (risk < 20) {
    card.classList.add('low');
    card.querySelector('.burnout-icon').textContent = '✅';
    desc.textContent = 'Zdravá rovnováha — investice je udržitelná a autenticita chrání před vyhořením.';
    level.textContent = 'Nízké';
    level.style.color = 'var(--color-success)';
  } else if (risk < 50) {
    card.querySelector('.burnout-icon').textContent = '⚠';
    desc.textContent = 'Střední riziko. Investice do brandu roste, ale autenticita drží rovnováhu.';
    level.textContent = 'Střední';
    level.style.color = 'var(--color-warning)';
  } else {
    card.classList.add('high');
    card.querySelector('.burnout-icon').textContent = '🔥';
    desc.textContent = 'Vysoké riziko vyhoření! Bez autenticity se brand stává výkonem, ne vyjádřením — viz paradox TikTok.';
    level.textContent = 'Vysoké';
    level.style.color = 'var(--color-danger)';
  }
}

function updateMeter(brandScore) {
  // Position on gradient: left = regional avg (low brand), right = Prague/top 10%
  // brand score 0 = regional avg position (15%)
  // brand score 100 = top position (90%)
  const position = clamp(mapRange(brandScore, 0, 100, 12, 88), 12, 88);
  const you = document.getElementById('meter-you');
  const msg = document.getElementById('context-message');
  if (you) you.style.left = position + '%';

  if (brandScore < 25) {
    if (msg) msg.textContent = 'Tvůj brand tě zatím neodlišuje od průměru regionu s 8–9 uchazeči na místo.';
  } else if (brandScore < 50) {
    if (msg) msg.textContent = 'Tvůj brand začíná vyčnívat — jsi nad krajským průměrem, ale stále pod celonárodním.';
  } else if (brandScore < 75) {
    if (msg) msg.textContent = 'Dobrý brand tě řadí do top 30 % — výrazná výhoda v Ústeckém kraji.';
  } else {
    if (msg) msg.textContent = 'Silný brand te přibližuje úrovni Prahy — konkuruješ celonárodně, ne jen regionálně.';
  }
}

function updateSliderDisplays() {
  sliders.forEach(cfg => {
    const slider = document.getElementById(cfg.id);
    if (!slider) return;
    const val = parseInt(slider.value);
    const label = getLabel(cfg.id, val);
    const insight = getInsight(cfg.id, val);
    setTextContent(cfg.valId, label);
    const insEl = document.getElementById(cfg.insId);
    if (insEl) insEl.textContent = insight;
  });
}

/* =========================================
   EVENT LISTENERS
   ========================================= */
function getStateKey(sliderId) {
  return sliderId.replace('sl-', '');
}

sliders.forEach(cfg => {
  const slider = document.getElementById(cfg.id);
  if (!slider) return;

  slider.addEventListener('input', () => {
    const key = getStateKey(cfg.id);
    state[key] = parseInt(slider.value);
    updateSliderProgressColor(slider);
    updateUI();
  });

  // Set initial progress color
  updateSliderProgressColor(slider);
});

function updateSliderProgressColor(slider) {
  const val = (parseInt(slider.value) - parseInt(slider.min)) / (parseInt(slider.max) - parseInt(slider.min));
  const pct = val * 100;
  slider.style.background = `linear-gradient(to right, var(--color-accent) ${pct}%, var(--color-divider) ${pct}%)`;
}

// Reset button
document.getElementById('btn-reset')?.addEventListener('click', () => {
  state.linkedin = 20;
  state.networking = 20;
  state.appearance = 40;
  state.authenticity = 50;
  state.content = 30;
  syncSlidersToState();
});

// Low preset
document.getElementById('btn-low')?.addEventListener('click', () => {
  state.linkedin = 5;
  state.networking = 5;
  state.appearance = 15;
  state.authenticity = 20;
  state.content = 5;
  syncSlidersToState();
});

// High preset
document.getElementById('btn-high')?.addEventListener('click', () => {
  state.linkedin = 80;
  state.networking = 75;
  state.appearance = 85;
  state.authenticity = 90;
  state.content = 70;
  syncSlidersToState();
});

function syncSlidersToState() {
  const map = {
    'sl-linkedin': state.linkedin,
    'sl-networking': state.networking,
    'sl-appearance': state.appearance,
    'sl-authenticity': state.authenticity,
    'sl-content': state.content
  };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) {
      el.value = val;
      updateSliderProgressColor(el);
    }
  });
  updateUI();
}

/* =========================================
   MARKET BARS ANIMATION (intersection observer)
   ========================================= */
function animateMarketBars() {
  const fills = document.querySelectorAll('.market-bar-fill');
  fills.forEach(fill => {
    const target = parseFloat(fill.dataset.target) || 0;
    setTimeout(() => {
      fill.style.width = target + '%';
    }, 100);
  });
}

const marketSection = document.getElementById('trh');
if (marketSection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateMarketBars();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  observer.observe(marketSection);
}

/* =========================================
   SMOOTH SCROLL for nav links
   ========================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* =========================================
   INIT
   ========================================= */
updateUI();
