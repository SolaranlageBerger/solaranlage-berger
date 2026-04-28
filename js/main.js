// === Mobile Menu ===
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// === Sticky Header Shadow ===
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// === Intersection Observer for Animations ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// === Animated Counters ===
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix !== undefined ? el.dataset.suffix : '+';
      const duration = 1500;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));

// === FAQ Accordion ===
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const answer = item.querySelector('.faq-answer');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(openItem => {
      openItem.classList.remove('open');
      openItem.querySelector('.faq-answer').style.maxHeight = null;
      openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('open');
      answer.style.maxHeight = answer.scrollHeight + 'px';
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// === Solar Calculator ===
let calcStep = 1;
const totalSteps = 5;
const calcData = {
  roofArea: 80,
  orientation: 'south',
  monthCost: 150,
  eAuto: false,
  storage: false
};

const areaSlider = document.getElementById('roofArea');
const costSlider = document.getElementById('monthCost');
const areaValue = document.getElementById('areaValue');
const costValue = document.getElementById('costValue');

areaSlider.addEventListener('input', () => {
  calcData.roofArea = parseInt(areaSlider.value);
  areaValue.textContent = calcData.roofArea + ' m²';
});

costSlider.addEventListener('input', () => {
  calcData.monthCost = parseInt(costSlider.value);
  costValue.textContent = calcData.monthCost + ' €';
});

document.querySelectorAll('#step2 .calc-option').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#step2 .calc-option').forEach(b => {
      b.classList.remove('selected');
      b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('selected');
    btn.setAttribute('aria-checked', 'true');
    calcData.orientation = btn.dataset.value;
  });
});

function setupToggle(stepId, dataKey) {
  document.querySelectorAll(`#${stepId} .calc-toggle`).forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll(`#${stepId} .calc-toggle`).forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');
      calcData[dataKey] = btn.dataset.value === 'yes';
    });
  });
}
setupToggle('step4', 'eAuto');
setupToggle('step5', 'storage');

const calcNext = document.getElementById('calcNext');
const calcBack = document.getElementById('calcBack');
const calcNav = document.getElementById('calcNav');

function updateCalcUI() {
  document.querySelectorAll('.calc-step').forEach(s => s.classList.remove('active'));

  if (calcStep <= totalSteps) {
    document.getElementById('step' + calcStep).classList.add('active');
    calcNav.style.display = 'flex';
    calcBack.style.visibility = calcStep === 1 ? 'hidden' : 'visible';
    calcNext.textContent = calcStep === totalSteps ? 'Ergebnis berechnen ✨' : 'Weiter →';
  } else {
    document.getElementById('stepResult').classList.add('active');
    calcNav.style.display = 'none';
    calculateResult();
  }

  for (let i = 1; i <= totalSteps; i++) {
    document.getElementById('prog' + i).classList.toggle('active', i <= calcStep);
  }
}

calcNext.addEventListener('click', () => {
  if (calcStep <= totalSteps) {
    calcStep++;
    updateCalcUI();
  }
});

calcBack.addEventListener('click', () => {
  if (calcStep > 1) {
    calcStep--;
    updateCalcUI();
  }
});

function calculateResult() {
  let factor;
  switch (calcData.orientation) {
    case 'south': factor = 0.15; break;
    case 'east-west': factor = 0.12; break;
    default: factor = 0.10;
  }

  const kwp = calcData.roofArea * factor;
  const yearlyYield = kwp * 950;

  let selfConsumptionRate = calcData.storage ? 0.70 : 0.30;
  if (calcData.eAuto) selfConsumptionRate = Math.min(selfConsumptionRate + 0.10, 0.90);

  const selfConsumed = yearlyYield * selfConsumptionRate;
  const fedIn = yearlyYield - selfConsumed;
  const yearlySavings = selfConsumed * 0.35 + fedIn * 0.08;

  const systemCost = kwp * 1300 + (calcData.storage ? 5000 : 0);
  const amortization = systemCost / yearlySavings;

  animateValue('resultSavings', 0, Math.round(yearlySavings), '€');
  animateValue('resultKwp', 0, Math.round(kwp * 10) / 10, 'kWp');
  animateValue('resultAmort', 0, Math.round(amortization * 10) / 10, 'Jahre');
}

function animateValue(id, start, end, suffix) {
  const el = document.getElementById(id);
  const duration = 1200;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (end - start) * eased;

    if (suffix === 'kWp' || suffix === 'Jahre') {
      el.textContent = current.toFixed(1) + ' ' + suffix;
    } else {
      el.textContent = Math.round(current).toLocaleString('de-DE') + ' ' + suffix;
    }

    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// === Helper: Submit form to Netlify Forms via fetch ===
function submitToNetlify(form) {
  const formData = new FormData(form);
  const params = new URLSearchParams();
  formData.forEach((value, key) => params.append(key, value));

  return fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
}

// === Lead Form Submit (Solar-Rechner) ===
function submitLead(form) {
  const orientationLabel = {
    'south': 'Süd',
    'east-west': 'Ost-West',
    'other': 'Sonstiges'
  }[calcData.orientation] || calcData.orientation;

  document.getElementById('leadDachflaeche').value = calcData.roofArea + ' m²';
  document.getElementById('leadAusrichtung').value = orientationLabel;
  document.getElementById('leadStromkosten').value = calcData.monthCost + ' €/Monat';
  document.getElementById('leadEauto').value = calcData.eAuto ? 'Ja' : 'Nein';
  document.getElementById('leadSpeicher').value = calcData.storage ? 'Ja' : 'Nein';
  document.getElementById('leadErsparnis').value = document.getElementById('resultSavings').textContent;
  document.getElementById('leadKwp').value = document.getElementById('resultKwp').textContent;
  document.getElementById('leadAmort').value = document.getElementById('resultAmort').textContent;

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';
  }

  submitToNetlify(form)
    .then(response => {
      if (!response.ok) throw new Error('Netzwerkfehler');
      form.innerHTML = '<div style="text-align:center;padding:24px 0;"><div style="font-size:2.5rem;margin-bottom:12px;">✅</div><h4 style="margin-bottom:8px;color:#fff;">Vielen Dank!</h4><p style="color:rgba(255,255,255,0.6);">Wir melden uns innerhalb von 24 Stunden mit Ihrem persönlichen Angebot bei Ihnen.</p></div>';
    })
    .catch(error => {
      console.error('Lead form error:', error);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kostenloses Angebot anfordern';
      }
      alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder rufen Sie uns direkt an: 06022 651 913 0');
    });
}

// === Contact Form Submit ===
function submitContact(form) {
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const privacy = document.getElementById('contact-privacy').checked;

  if (!name || !email || !privacy) {
    alert('Bitte füllen Sie alle Pflichtfelder (*) aus und akzeptieren Sie die Datenschutzerklärung.');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';
  }

  submitToNetlify(form)
    .then(response => {
      if (!response.ok) throw new Error('Netzwerkfehler');
      form.innerHTML = '<div style="text-align:center;padding:48px 0;"><div style="font-size:2.5rem;margin-bottom:12px;">✅</div><h3 style="color:var(--primary);margin-bottom:8px;">Nachricht gesendet!</h3><p style="color:var(--gray-500);">Vielen Dank für Ihre Anfrage. Wir melden uns innerhalb von 24 Stunden bei Ihnen.</p></div>';
    })
    .catch(error => {
      console.error('Contact form error:', error);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Nachricht senden';
      }
      alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder rufen Sie uns direkt an: 06022 651 913 0');
    });
}

// === Request Offer Helper (Pricing buttons) ===
function requestOffer(text) {
  document.getElementById('contact-message').value = text;
  document.getElementById('kontakt').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    document.getElementById('contact-name').focus();
  }, 600);
}

// Cookie-Banner-Logik wurde nach js/consent.js verlagert (DSGVO-konform)
