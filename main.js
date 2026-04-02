/* ── Scroll Reveal (IntersectionObserver) ── */
var isMobile = window.innerWidth <= 768;
var rvEls = [].slice.call(document.querySelectorAll('.rv'));
rvEls.forEach(function(el) {
  /* On mobile, show above-fold content instantly */
  if (isMobile && el.getBoundingClientRect().top < window.innerHeight) {
    el.classList.add('vis');
    return;
  }
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
});
function rvShow(el) {
  if (el.classList.contains('vis')) return;
  el.classList.add('vis');
  var m = el.className.match(/rv-d(\d)/);
  var d = m ? m[1] * 0.1 : 0;
  el.style.transition = 'opacity .6s ease ' + d + 's, transform .6s ease ' + d + 's';
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
}
if ('IntersectionObserver' in window) {
  var rvObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { rvShow(entry.target); rvObs.unobserve(entry.target); }
    });
  }, { rootMargin: '0px 0px 60px 0px' });
  rvEls.forEach(function(el) { rvObs.observe(el); });
} else {
  rvEls.forEach(function(el) { rvShow(el); });
}

/* ── Nav frost on scroll ── */
const nav = document.getElementById('nav');
let navScrolled = false;
const checkNav = () => {
  const should = scrollY > 32;
  if (should !== navScrolled) { navScrolled = should; nav.classList.toggle('scrolled', should); }
};
addEventListener('scroll', checkNav, { passive: true });
checkNav();

/* ── Hero progress bar ── */
requestAnimationFrame(() => {
  setTimeout(() => {
    const bar = document.getElementById('heroBar');
    if (bar) bar.style.width = '68%';
  }, 600);
});

/* ── Hero customer cycling ── */
(function() {
  var container = document.getElementById('heroLeads');
  var inner = document.getElementById('heroLeadsInner');
  if (!container || !inner) return;
  var heroBar = document.getElementById('heroBar');
  var heroCustomersEl = document.getElementById('heroCustomers');
  var heroMonthlyEl = document.getElementById('heroMonthly');
  var heroAnnualEl = document.getElementById('heroAnnual');
  var runCust = 380, runMonthly = 6200, runAnnual = 75000, runBatch = 68;
  var newLeads = [
    { name: 'Sarah Mitchell', addr: '14 Park Lane, EH6 4QJ', price: 18, dot: '#3b82f6' },
    { name: 'David Kerr', addr: '33 Broomhill Avenue, G11 7AB', price: 21, dot: '#22c55e' },
    { name: 'Kirsty Wallace', addr: '7 Harbour Street, KY1 1BN', price: 15, dot: '#3b82f6' },
    { name: 'Graeme Murray', addr: '52 Elm Row, EH7 4AH', price: 20, dot: '#22c55e' },
    { name: 'Nicola Fraser', addr: '19 Loch Road, FK3 8QP', price: 17, dot: '#3b82f6' },
    { name: 'Alan Sinclair', addr: '8 Cramond Road, EH4 6NS', price: 22, dot: '#22c55e' },
    { name: 'Morag Chalmers', addr: '15 Union Terrace, AB10 1QE', price: 19, dot: '#3b82f6' },
    { name: 'Stuart Paterson', addr: '4 Lochside View, FK2 9DL', price: 16, dot: '#22c55e' },
    { name: 'Helen Ramsay', addr: '31 Thistle Lane, DD2 1PH', price: 24, dot: '#3b82f6' },
    { name: 'Craig Buchanan', addr: '12 Inverleith Place, EH3 5NS', price: 18, dot: '#22c55e' }
  ];
  function heroBump(el, from, to, prefix, suffix, divide) {
    var dur = 800, start = performance.now();
    (function tick(now) {
      var p = Math.min((now - start) / dur, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      var val = from + (to - from) * ease;
      if (divide) {
        el.textContent = prefix + (val / divide).toFixed(1) + (suffix || '');
      } else {
        el.textContent = prefix + Math.round(val).toLocaleString();
      }
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  var idx = 0;
  function makeLead(c) {
    var div = document.createElement('div');
    div.className = 'hc-lead hc-lead-new hc-lead-top';
    div.innerHTML = '<div class="hc-lead-dot" style="background:' + c.dot + '"></div>'
      + '<div class="hc-lead-info"><div class="hc-lead-name">' + c.name + ' <span class="hc-new-badge">New</span></div>'
      + '<div class="hc-lead-addr">' + c.addr + '</div></div>'
      + '<div class="hc-lead-price">\u00a3' + c.price + '</div>';
    return div;
  }
  /* Measure one card height (card + margin) */
  var firstCard = inner.querySelector('.hc-lead');
  var cardH = firstCard ? firstCard.offsetHeight + 7 : 50;
  /* Set container to exactly 3 cards tall */
  container.style.height = (cardH * 3 + 7) + 'px';

  function cycleHeroLead() {
    if (idx >= newLeads.length) return;
    var delay = idx === 0 ? 3000 : 5000 + Math.random() * 4000;
    setTimeout(function() {
      var c = newLeads[idx];
      var leads = inner.querySelectorAll('.hc-lead');
      /* Remove top highlight and New badge from current top */
      if (leads[0]) {
        leads[0].classList.remove('hc-lead-top');
        var oldBadge = leads[0].querySelector('.hc-new-badge');
        if (oldBadge) oldBadge.parentNode.removeChild(oldBadge);
      }
      /* Insert new card above visible area */
      var newEl = makeLead(c);
      inner.insertBefore(newEl, inner.firstChild);
      /* Start shifted up so new card is hidden above */
      inner.style.transition = 'none';
      inner.style.transform = 'translateY(-' + cardH + 'px)';
      /* Force reflow then animate down */
      inner.offsetHeight;
      inner.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
      inner.style.transform = 'translateY(0)';
      /* After animation: remove bottom card, reset */
      setTimeout(function() {
        var allLeads = inner.querySelectorAll('.hc-lead');
        if (allLeads.length > 3) {
          allLeads[allLeads.length - 1].parentNode.removeChild(allLeads[allLeads.length - 1]);
        }
      }, 550);
      /* Bump stats */
      var prevCust = runCust, prevMonthly = runMonthly, prevAnnual = runAnnual;
      runCust += 1;
      runMonthly += c.price;
      runAnnual += c.price * 12;
      runBatch = Math.min(runBatch + 3, 95);
      if (heroCustomersEl) heroBump(heroCustomersEl, prevCust, runCust, '', '', 0);
      if (heroMonthlyEl) heroBump(heroMonthlyEl, prevMonthly, runMonthly, '\u00a3', 'k', 1000);
      if (heroAnnualEl) heroBump(heroAnnualEl, prevAnnual, runAnnual, '\u00a3', 'k', 1000);
      if (heroBar) heroBar.style.width = runBatch + '%';
      idx++;
      cycleHeroLead();
    }, delay);
  }
  cycleHeroLead();
})();

/* ── Animated Counters ── */
function animateCounter(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target = +el.dataset.target, prefix = el.dataset.prefix || '';
  const dur = 2200, start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = prefix + Math.round(ease * target).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}
var counterPending = [].slice.call(document.querySelectorAll('.acounter[data-target], .impact-num[data-target]'));
function counterCheck() {
  var vh = window.innerHeight || document.documentElement.clientHeight;
  for (var i = counterPending.length - 1; i >= 0; i--) {
    if (counterPending[i].getBoundingClientRect().top < vh - 40) {
      animateCounter(counterPending[i]);
      counterPending.splice(i, 1);
    }
  }
  if (counterPending.length) requestAnimationFrame(counterCheck);
}
window.addEventListener('scroll', function() { requestAnimationFrame(counterCheck); }, { passive: true });
requestAnimationFrame(function() { setTimeout(counterCheck, 100); });

/* ── Smooth anchor scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    try { const t = document.querySelector(href); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch(err) {}
  });
});

/* ── Swipe dots for How It Works ── */
const stepsEl = document.querySelector('.steps');
const dots = document.querySelectorAll('.swipe-dot');
if (stepsEl && dots.length) {
  stepsEl.addEventListener('scroll', () => {
    const cards = stepsEl.querySelectorAll('.step');
    const scrollLeft = stepsEl.scrollLeft;
    const cardWidth = cards[0].offsetWidth + 14;
    const idx = Math.round(scrollLeft / cardWidth);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }, { passive: true });
}

/* ── Slot machine hero text ── */
const slotTrack = document.getElementById('slotTrack');
const slotWrap = document.getElementById('slotWrap');
if (slotTrack && slotWrap) {
  const firstClone = slotTrack.children[0].cloneNode(true);
  slotTrack.appendChild(firstClone);
  const realCount = slotTrack.children.length - 1;
  /* Use font-size * line-height for a tight slot height */
  const h1 = slotWrap.closest('h1');
  const cs = getComputedStyle(h1);
  const fontSize = parseFloat(cs.fontSize);
  const slotH = Math.ceil(fontSize * 1.3);
  /* Set wrap + items to match */
  slotWrap.style.height = slotH + 'px';
  slotWrap.style.padding = '0';
  Array.from(slotTrack.children).forEach(c => { c.style.height = slotH + 'px'; c.style.lineHeight = slotH + 'px'; });
  let idx = 0;
  setInterval(() => {
    idx++;
    slotTrack.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)';
    slotTrack.style.transform = `translateY(-${idx * slotH}px)`;
    if (idx >= realCount) {
      setTimeout(() => {
        slotTrack.style.transition = 'none';
        idx = 0;
        slotTrack.style.transform = 'translateY(0)';
      }, 650);
    }
  }, 3000);
}

/* ── Parallax glow (desktop) ── */
if (!matchMedia('(max-width:768px)').matches) {
  let ticking = false;
  addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = scrollY;
        document.querySelectorAll('.hero-glow, .cta-glow').forEach((el, i) => {
          el.style.transform = `translateX(-50%) translateY(${y * (i % 2 === 0 ? .03 : -.02)}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ── Dashboard feature pills ── */
(function() {
  var pills = document.querySelectorAll('.dash-pill-light');
  var tip = document.getElementById('dashTip');
  if (!pills.length || !tip) return;
  pills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      if (pill.classList.contains('dash-pill-light--active')) return;
      pills.forEach(function(p) { p.classList.remove('dash-pill-light--active'); });
      pill.classList.add('dash-pill-light--active');
      tip.innerHTML = pill.getAttribute('data-tip');
      tip.style.animation = 'none';
      tip.offsetHeight;
      tip.style.animation = 'tipIn .3s ease';
    });
  });
})();

/* ── Dashboard card animations ── */
(function() {
  var card = document.querySelector('.dash-card');
  if (!card) return;
  var fired = false;
  function animate() {
    if (fired) return;
    fired = true;
    /* Count-up numbers */
    var counters = card.querySelectorAll('.dash-counter');
    counters.forEach(function(el) {
      var target = +el.dataset.dashTarget;
      var prefix = el.dataset.dashPrefix || '';
      var suffix = el.dataset.dashSuffix || '';
      var divide = +el.dataset.dashDivide || 0;
      var decimal = +el.dataset.dashDecimal || 0;
      var dur = 2000, start = performance.now();
      (function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 4);
        var val = ease * target;
        if (divide) {
          el.textContent = prefix + (val / divide).toFixed(p < 1 ? 1 : decimal);
          if (suffix && p >= 1) el.textContent += suffix;
          else if (suffix && val / divide >= 1) el.textContent += suffix;
        } else {
          el.textContent = prefix + Math.round(val).toLocaleString();
        }
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });
    /* Progress bar fill — batch building toward £1000 */
    var bar = document.getElementById('dashBar');
    var batchValEl = document.getElementById('dashBatchVal');
    var batchTotal = 1000;
    var batchCurrent = 815;
    if (bar) setTimeout(function() { bar.style.width = (batchCurrent / batchTotal * 100) + '%'; }, 300);
    /* Count up batch value */
    if (batchValEl) {
      var bvDur = 2000, bvStart = performance.now();
      (function bvTick(now) {
        var p = Math.min((now - bvStart) / bvDur, 1);
        var ease = 1 - Math.pow(1 - p, 4);
        batchValEl.textContent = '\u00a3' + Math.round(ease * batchCurrent);
        if (p < 1) requestAnimationFrame(bvTick);
      })(bvStart);
    }
    /* Customer cards — show new arrivals then stop */
    var newCustomers = [
      { name: 'Jamie Crawford', addr: '3 Birchwood Drive, G61 4SL', price: 20, dot: '#3b82f6' },
      { name: 'Fiona Baxter', addr: '41 Queens Road, EH9 2BX', price: 24, dot: '#22c55e' },
      { name: 'Ewan Brodie', addr: '17 Harbour View, KY11 2ND', price: 16, dot: '#3b82f6' },
      { name: 'Isla Drummond', addr: '9 Castle Terrace, FK8 1RS', price: 22, dot: '#22c55e' },
      { name: 'Ross Campbell', addr: '26 Glenburn Road, PA2 7LQ', price: 18, dot: '#3b82f6' }
    ];
    var custWrap = document.querySelector('.dash-customer-wrap');
    var custEl = document.getElementById('dashCustomer');
    var statEls = card.querySelectorAll('.dash-counter');
    var monthlyEl = statEls[1];
    var annualEl = statEls[2];
    var customersEl = statEls[0];
    var runningMonthly = 815;
    var runningAnnual = 9780;
    var runningCustomers = 48;
    if (custEl && custWrap && newCustomers.length) {
      var idx = 0;
      function bumpStat(el, from, to, prefix, suffix, divide) {
        var dur = 800, start = performance.now();
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 3);
          var val = from + (to - from) * ease;
          if (divide) {
            el.textContent = prefix + (val / divide).toFixed(1) + (suffix || '');
          } else {
            el.textContent = prefix + Math.round(val).toLocaleString();
          }
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      }
      function makeCard(c) {
        var div = document.createElement('div');
        div.className = 'dash-toast entering';
        div.innerHTML = '<div class="dash-toast-dot" style="background:' + c.dot + '"></div>'
          + '<div class="dash-toast-info"><div class="dash-toast-name">' + c.name + ' <span class="hc-new-badge">New</span></div>'
          + '<div class="dash-toast-addr">' + c.addr + '</div></div>'
          + '<div class="dash-toast-price">\u00a3' + c.price + '</div>';
        return div;
      }
      function showNext() {
        if (idx >= newCustomers.length) return;
        var delay = idx === 0 ? 2000 : 6000 + Math.random() * 4000;
        setTimeout(function() {
          var c = newCustomers[idx];
          idx++;
          var oldEl = custWrap.querySelector('.dash-toast');
          var newEl = makeCard(c);
          custWrap.appendChild(newEl);
          /* Force layout then animate both simultaneously */
          newEl.offsetHeight;
          oldEl.classList.add('out');
          newEl.classList.remove('entering');
          newEl.classList.add('enter');
          /* Clean up old card after transition */
          setTimeout(function() {
            if (oldEl.parentNode) oldEl.parentNode.removeChild(oldEl);
            newEl.classList.remove('enter');
            newEl.id = 'dashCustomer';
          }, 500);
          /* Bump stats */
          var prevMonthly = runningMonthly;
          var prevAnnual = runningAnnual;
          var prevCustomers = runningCustomers;
          var prevBatch = batchCurrent;
          runningMonthly += c.price;
          runningAnnual += c.price * 12;
          runningCustomers += 1;
          batchCurrent += c.price;
          if (monthlyEl) bumpStat(monthlyEl, prevMonthly, runningMonthly, '\u00a3', '', 0);
          if (annualEl) bumpStat(annualEl, prevAnnual, runningAnnual, '\u00a3', 'k', 1000);
          if (customersEl) bumpStat(customersEl, prevCustomers, runningCustomers, '', '', 0);
          /* Grow batch bar and value */
          if (bar) bar.style.width = (batchCurrent / batchTotal * 100) + '%';
          if (batchValEl) bumpStat(batchValEl, prevBatch, batchCurrent, '\u00a3', '', 0);
          showNext();
        }, delay);
      }
      showNext();
    }
  }
  var obs = new IntersectionObserver(function(entries) {
    if (entries[0].isIntersecting) { animate(); obs.disconnect(); }
  }, { threshold: 0.3 });
  obs.observe(card);
})();
