/* ════════════════════════════════════════════════════════════
   INICIO DIGITAL — main.js
   Written in ES5-safe syntax so it parses in old browsers and
   webviews. The page is fully readable without this file; it
   only adds animation and interactivity. Each feature runs in
   its own try/catch so one failure can't take out the rest.
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;

  /* Stamp html.js — CSS only hides reveal elements once this runs,
     so a blocked/failed script can never leave sections invisible. */
  root.className += ' js';

  var reduceMotion = false;
  try {
    reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {}

  function safe(fn) {
    try { fn(); } catch (e) { /* isolate feature failures */ }
  }

  function each(list, fn) {
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }

  /* ── Scroll Reveal ── */
  safe(function () {
    var rvEls = [].slice.call(doc.querySelectorAll('.rv'));
    if (!rvEls.length) return;

    function rvShow(el) {
      if (el.className.indexOf('vis') !== -1) return;
      var m = el.className.match(/rv-d(\d)/);
      var d = m ? m[1] * 0.1 : 0;
      el.style.transition = 'opacity .6s ease ' + d + 's, transform .6s ease ' + d + 's';
      el.classList.add('vis');
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }
    function showAll() { each(rvEls, rvShow); }

    if (reduceMotion || !('IntersectionObserver' in window)) { showAll(); return; }

    function revealInView() {
      var vh = window.innerHeight || root.clientHeight;
      each(rvEls, function (el) {
        if (el.getBoundingClientRect().top < vh * 1.1) rvShow(el);
      });
    }

    /* Reveal anything already in view straight away, then again on the
       next frame. A tab that loads hidden, throttled or stalled gets no
       frames and no observer callbacks, and hiding is already stamped on
       html.js by this point — so nothing here may be the only thing
       standing between the visitor and a blank page. */
    revealInView();
    requestAnimationFrame(revealInView);

    /* Safety nets for that same case: re-check whenever the page comes
       back to the front, is restored from the back/forward cache, or is
       scrolled. Scrolling covers a dead observer; the listener detaches
       once everything is out. */
    function recheck() {
      revealInView();
      for (var i = 0; i < rvEls.length; i++) {
        if (rvEls[i].className.indexOf('vis') === -1) return;
      }
      doc.removeEventListener('visibilitychange', recheck);
      window.removeEventListener('pageshow', recheck);
      window.removeEventListener('scroll', recheck);
    }
    doc.addEventListener('visibilitychange', recheck);
    window.addEventListener('pageshow', recheck);
    window.addEventListener('scroll', recheck, { passive: true });

    var rvObs = new IntersectionObserver(function (entries) {
      each(entries, function (entry) {
        if (entry.isIntersecting) { rvShow(entry.target); rvObs.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px 60px 0px' });
    each(rvEls, function (el) { rvObs.observe(el); });
  });

  /* ── Mobile menu toggle + logo/burger cycle ── */
  safe(function () {
    var menuBtn = doc.getElementById('menuBtn');
    var mobMenu = doc.getElementById('mobMenu');
    var markTrack = doc.getElementById('markTrack');
    if (!menuBtn || !mobMenu || !markTrack) return;

    var menuOpen = false;
    var cycleTimer = null;

    function slideTo(burger) {
      markTrack.style.transform = burger ? 'translateY(-50%)' : 'translateY(0)';
    }

    function stopCycle() {
      clearTimeout(cycleTimer);
      clearInterval(cycleTimer);
      cycleTimer = null;
    }

    function startCycle() {
      if (reduceMotion) return;
      stopCycle();
      cycleTimer = setTimeout(function () {
        if (menuOpen) return;
        slideTo(true);
        cycleTimer = setTimeout(function () {
          if (menuOpen) return;
          slideTo(false);
          cycleTimer = setInterval(function () {
            if (menuOpen) return;
            slideTo(true);
            setTimeout(function () {
              if (menuOpen) return;
              slideTo(false);
            }, 1000);
          }, 5000);
        }, 1000);
      }, 1000);
    }

    function setMenu(open) {
      menuOpen = open;
      mobMenu.classList.toggle('open', open);
      menuBtn.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (open) {
        stopCycle();
        slideTo(true);
      } else {
        slideTo(false);
        startCycle();
      }
    }

    menuBtn.addEventListener('click', function (e) {
      if (window.innerWidth > 768) {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setMenu(!menuOpen);
    });

    each(mobMenu.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });

    doc.addEventListener('click', function (e) {
      if (menuOpen && !mobMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        setMenu(false);
      }
    });

    if (window.innerWidth <= 768) startCycle();
  });

  /* ── Nav frost on scroll ── */
  safe(function () {
    var nav = doc.getElementById('nav');
    if (!nav) return;
    var navScrolled = false;
    function checkNav() {
      var should = (window.pageYOffset || root.scrollTop || 0) > 32;
      if (should !== navScrolled) { navScrolled = should; nav.classList.toggle('scrolled', should); }
    }
    window.addEventListener('scroll', checkNav, { passive: true });
    checkNav();
  });

  /* ── Hero progress bar ── */
  safe(function () {
    var bar = doc.getElementById('heroBar');
    if (!bar) return;
    if (reduceMotion) { bar.style.transition = 'none'; bar.style.width = '68%'; return; }
    requestAnimationFrame(function () {
      setTimeout(function () { bar.style.width = '68%'; }, 600);
    });
  });

  /* ── Hero customer cycling ── */
  safe(function () {
    var container = doc.getElementById('heroLeads');
    var inner = doc.getElementById('heroLeadsInner');
    if (!container || !inner || reduceMotion) return;
    var heroBar = doc.getElementById('heroBar');
    var heroCustomersEl = doc.getElementById('heroCustomers');
    var heroMonthlyEl = doc.getElementById('heroMonthly');
    var heroAnnualEl = doc.getElementById('heroAnnual');
    var runCust = 380, runMonthly = 6200, runAnnual = 75000, runBatch = 68;
    var newLeads = [
      { name: 'Sarah Mitchell', addr: '14 Park Lane, EH6 4QJ', price: 18, dot: '#8b96cf' },
      { name: 'David Kerr', addr: '33 Broomhill Avenue, G11 7AB', price: 21, dot: '#e2c78d' },
      { name: 'Kirsty Wallace', addr: '7 Harbour Street, KY1 1BN', price: 15, dot: '#8b96cf' },
      { name: 'Graeme Murray', addr: '52 Elm Row, EH7 4AH', price: 20, dot: '#e2c78d' },
      { name: 'Nicola Fraser', addr: '19 Loch Road, FK3 8QP', price: 17, dot: '#8b96cf' },
      { name: 'Alan Sinclair', addr: '8 Cramond Road, EH4 6NS', price: 22, dot: '#e2c78d' },
      { name: 'Morag Chalmers', addr: '15 Union Terrace, AB10 1QE', price: 19, dot: '#8b96cf' },
      { name: 'Stuart Paterson', addr: '4 Lochside View, FK2 9DL', price: 16, dot: '#e2c78d' },
      { name: 'Helen Ramsay', addr: '31 Thistle Lane, DD2 1PH', price: 24, dot: '#8b96cf' },
      { name: 'Craig Buchanan', addr: '12 Inverleith Place, EH3 5NS', price: 18, dot: '#e2c78d' }
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
      var div = doc.createElement('div');
      div.className = 'hc-lead hc-lead-new hc-lead-top';
      div.innerHTML = '<div class="hc-lead-dot" style="background:' + c.dot + '"></div>'
        + '<div class="hc-lead-info"><div class="hc-lead-name">' + c.name + ' <span class="hc-new-badge">New</span></div>'
        + '<div class="hc-lead-addr">' + c.addr + '</div></div>'
        + '<div class="hc-lead-price">£' + c.price + '</div>';
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
      setTimeout(function () {
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
        setTimeout(function () {
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
        if (heroMonthlyEl) heroBump(heroMonthlyEl, prevMonthly, runMonthly, '£', 'k', 1000);
        if (heroAnnualEl) heroBump(heroAnnualEl, prevAnnual, runAnnual, '£', 'k', 1000);
        var heroBarEl = doc.getElementById('heroBar');
        if (heroBarEl) heroBarEl.style.width = runBatch + '%';
        idx++;
        cycleHeroLead();
      }, delay);
    }
    cycleHeroLead();
  });

  /* ── Animated impact counters ── */
  safe(function () {
    var counterPending = [].slice.call(doc.querySelectorAll('.impact-num[data-target]'));
    if (!counterPending.length) return;

    function animateCounter(el) {
      if (el.getAttribute('data-counted')) return;
      el.setAttribute('data-counted', '1');
      var target = +el.getAttribute('data-target');
      var prefix = el.getAttribute('data-prefix') || '';
      if (reduceMotion) { el.textContent = prefix + target.toLocaleString(); return; }
      var dur = 2200, start = performance.now();
      (function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var ease = 1 - Math.pow(1 - p, 4);
        el.textContent = prefix + Math.round(ease * target).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    }

    if (reduceMotion) { each(counterPending, animateCounter); return; }

    /* Reset to 0 so the count-up is visible (static HTML ships final values) */
    each(counterPending, function (el) { el.textContent = '0'; });

    function counterCheck() {
      var vh = window.innerHeight || root.clientHeight;
      for (var i = counterPending.length - 1; i >= 0; i--) {
        if (counterPending[i].getBoundingClientRect().top < vh - 40) {
          animateCounter(counterPending[i]);
          counterPending.splice(i, 1);
        }
      }
      if (counterPending.length) requestAnimationFrame(counterCheck);
    }
    window.addEventListener('scroll', function () { requestAnimationFrame(counterCheck); }, { passive: true });
    requestAnimationFrame(function () { setTimeout(counterCheck, 100); });
  });

  /* ── Smooth anchor scroll ── */
  safe(function () {
    each(doc.querySelectorAll('a[href^="#"]'), function (a) {
      a.addEventListener('click', function (e) {
        var href = a.getAttribute('href');
        if (!href || href === '#') return;
        try {
          var t = doc.querySelector(href);
          if (t) {
            e.preventDefault();
            t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
          }
        } catch (err) {}
      });
    });
  });

  /* ── Swipe dots for How It Works ── */
  safe(function () {
    var stepsEl = doc.querySelector('.steps');
    var dots = doc.querySelectorAll('.swipe-dot');
    if (!stepsEl || !dots.length) return;
    stepsEl.addEventListener('scroll', function () {
      var cards = stepsEl.querySelectorAll('.step');
      if (!cards.length) return;
      var cardWidth = cards[0].offsetWidth + 14;
      var idx = Math.round(stepsEl.scrollLeft / cardWidth);
      each(dots, function (d, i) { d.classList.toggle('active', i === idx); });
    }, { passive: true });
  });

  /* ── Slot machine hero text ── */
  safe(function () {
    var slotTrack = doc.getElementById('slotTrack');
    var slotWrap = doc.getElementById('slotWrap');
    if (!slotTrack || !slotWrap || reduceMotion) return;
    var firstClone = slotTrack.children[0].cloneNode(true);
    slotTrack.appendChild(firstClone);
    var realCount = slotTrack.children.length - 1;
    /* Use font-size * line-height for a tight slot height */
    var h1 = slotWrap.closest ? slotWrap.closest('h1') : null;
    if (!h1) {
      h1 = slotWrap.parentNode;
      while (h1 && h1.nodeName !== 'H1') h1 = h1.parentNode;
    }
    if (!h1) return;
    var fontSize = parseFloat(getComputedStyle(h1).fontSize);
    var slotH = Math.ceil(fontSize * 1.3);
    /* Set wrap + items to match */
    slotWrap.style.height = slotH + 'px';
    slotWrap.style.padding = '0';
    each(slotTrack.children, function (c) { c.style.height = slotH + 'px'; c.style.lineHeight = slotH + 'px'; });
    var idx = 0;
    setInterval(function () {
      idx++;
      slotTrack.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)';
      slotTrack.style.transform = 'translateY(-' + (idx * slotH) + 'px)';
      if (idx >= realCount) {
        setTimeout(function () {
          slotTrack.style.transition = 'none';
          idx = 0;
          slotTrack.style.transform = 'translateY(0)';
        }, 650);
      }
    }, 3000);
  });

  /* ── Parallax glow (desktop only) ── */
  safe(function () {
    if (reduceMotion || window.matchMedia('(max-width:768px)').matches) return;
    var glows = doc.querySelectorAll('.hero-glow, .cta-glow');
    if (!glows.length) return;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var y = window.pageYOffset || 0;
          each(glows, function (el, i) {
            el.style.transform = 'translateX(-50%) translateY(' + (y * (i % 2 === 0 ? 0.03 : -0.02)) + 'px)';
          });
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  });

  /* ── Dashboard feature pills ── */
  safe(function () {
    var pills = doc.querySelectorAll('.dash-pill-light');
    var tip = doc.getElementById('dashTip');
    if (!pills.length || !tip) return;
    each(pills, function (pill) {
      pill.addEventListener('click', function () {
        if (pill.classList.contains('dash-pill-light--active')) return;
        each(pills, function (p) { p.classList.remove('dash-pill-light--active'); });
        pill.classList.add('dash-pill-light--active');
        tip.textContent = pill.getAttribute('data-tip');
        tip.style.animation = 'none';
        tip.offsetHeight;
        tip.style.animation = 'tipIn .3s ease';
      });
    });
  });

  /* ── Dashboard card animations ── */
  safe(function () {
    var card = doc.querySelector('.dash-card');
    if (!card) return;
    var bar = doc.getElementById('dashBar');
    var batchTotal = 1000;
    var batchCurrent = 815;
    if (reduceMotion) return; /* static values already in the HTML */

    /* Static HTML ships final values; reset so the animation has
       somewhere to go once the card scrolls into view. */
    var counters = card.querySelectorAll('.dash-counter');
    each(counters, function (el) {
      el.textContent = (el.getAttribute('data-dash-prefix') || '') + '0';
    });
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0';
      bar.offsetHeight;
      bar.style.transition = '';
    }

    var fired = false;
    function animate() {
      if (fired) return;
      fired = true;
      /* Count-up numbers */
      each(counters, function (el) {
        var target = +el.getAttribute('data-dash-target');
        var prefix = el.getAttribute('data-dash-prefix') || '';
        var suffix = el.getAttribute('data-dash-suffix') || '';
        var divide = +el.getAttribute('data-dash-divide') || 0;
        var decimal = +el.getAttribute('data-dash-decimal') || 0;
        var dur = 2000, start = performance.now();
        (function tick(now) {
          var p = Math.min((now - start) / dur, 1);
          var ease = 1 - Math.pow(1 - p, 4);
          var val = ease * target;
          if (divide) {
            el.textContent = prefix + (val / divide).toFixed(p < 1 ? 1 : decimal);
            if (suffix && (p >= 1 || val / divide >= 1)) el.textContent += suffix;
          } else {
            el.textContent = prefix + Math.round(val).toLocaleString();
          }
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
      /* Progress bar fill — batch building toward £1000 */
      if (bar) setTimeout(function () { bar.style.width = (batchCurrent / batchTotal * 100) + '%'; }, 300);

      /* Customer cards — show new arrivals then stop */
      var newCustomers = [
        { name: 'Jamie Crawford', addr: '3 Birchwood Drive, G61 4SL', price: 20, dot: '#8b96cf' },
        { name: 'Fiona Baxter', addr: '41 Queens Road, EH9 2BX', price: 24, dot: '#e2c78d' },
        { name: 'Ewan Brodie', addr: '17 Harbour View, KY11 2ND', price: 16, dot: '#8b96cf' },
        { name: 'Isla Drummond', addr: '9 Castle Terrace, FK8 1RS', price: 22, dot: '#e2c78d' },
        { name: 'Ross Campbell', addr: '26 Glenburn Road, PA2 7LQ', price: 18, dot: '#8b96cf' }
      ];
      var custWrap = doc.querySelector('.dash-customer-wrap');
      var custEl = doc.getElementById('dashCustomer');
      var customersEl = counters[0];
      var monthlyEl = counters[1];
      var annualEl = counters[2];
      var runningMonthly = 815;
      var runningAnnual = 9780;
      var runningCustomers = 48;
      if (custEl && custWrap && newCustomers.length) {
        var idx = 0;
        var bumpStat = function (el, from, to, prefix, suffix, divide) {
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
        };
        var makeCard = function (c) {
          var div = doc.createElement('div');
          div.className = 'dash-toast entering';
          div.innerHTML = '<div class="dash-toast-dot" style="background:' + c.dot + '"></div>'
            + '<div class="dash-toast-info"><div class="dash-toast-name">' + c.name + ' <span class="hc-new-badge">New</span></div>'
            + '<div class="dash-toast-addr">' + c.addr + '</div></div>'
            + '<div class="dash-toast-price">£' + c.price + '</div>';
          return div;
        };
        var showNext = function () {
          if (idx >= newCustomers.length) return;
          var delay = idx === 0 ? 2000 : 6000 + Math.random() * 4000;
          setTimeout(function () {
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
            setTimeout(function () {
              if (oldEl.parentNode) oldEl.parentNode.removeChild(oldEl);
              newEl.classList.remove('enter');
              newEl.id = 'dashCustomer';
            }, 500);
            /* Bump stats */
            var prevMonthly = runningMonthly;
            var prevAnnual = runningAnnual;
            var prevCustomers = runningCustomers;
            runningMonthly += c.price;
            runningAnnual += c.price * 12;
            runningCustomers += 1;
            batchCurrent += c.price;
            if (monthlyEl) bumpStat(monthlyEl, prevMonthly, runningMonthly, '£', '', 0);
            if (annualEl) bumpStat(annualEl, prevAnnual, runningAnnual, '£', 'k', 1000);
            if (customersEl) bumpStat(customersEl, prevCustomers, runningCustomers, '', '', 0);
            /* Grow batch bar */
            if (bar) bar.style.width = Math.min(batchCurrent / batchTotal * 100, 100) + '%';
            showNext();
          }, delay);
        };
        showNext();
      }
    }

    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { animate(); obs.disconnect(); }
      }, { threshold: 0.3 });
      obs.observe(card);
    } else {
      animate();
    }
  });

})();
