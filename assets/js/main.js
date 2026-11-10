(function () {
  'use strict';

  var CONSENT_KEY = 'bk_cookie_consent_v1';
  var MAP_SRC = 'https://www.google.com/maps?q=Visagie+Street+Johannesburg+South+Africa&output=embed';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) { /* ignore */ }
  }

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  var banner = document.getElementById('cookie-banner');

  function loadMap() {
    var wrap = document.getElementById('map-wrap');
    if (!wrap || wrap.querySelector('iframe')) return;
    var iframe = document.createElement('iframe');
    iframe.src = MAP_SRC;
    iframe.title = 'Map showing the location of Barbrahs Kitchen';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    var ph = wrap.querySelector('.map-placeholder');
    if (ph) ph.hidden = true;
    wrap.appendChild(iframe);
  }
  function unloadMap() {
    var wrap = document.getElementById('map-wrap');
    if (!wrap) return;
    var f = wrap.querySelector('iframe');
    if (f) f.remove();
    var ph = wrap.querySelector('.map-placeholder');
    if (ph) ph.hidden = false;
  }
  function showBanner() {
    if (!banner) return;
    banner.classList.add('show');
    document.body.classList.add('banner-open');
    var first = banner.querySelector('button');
    if (first) first.focus({ preventScroll: true });
  }
  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('show');
    document.body.classList.remove('banner-open');
  }
  function choose(value) {
    setConsent(value);
    hideBanner();
    if (value === 'all') loadMap(); else unloadMap();
  }

  if (banner) {
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (b) choose(b.getAttribute('data-consent'));
    });
  }
  document.querySelectorAll('[data-open-cookie-settings]').forEach(function (b) {
    b.addEventListener('click', showBanner);
  });
  var mapBtn = document.querySelector('[data-load-map]');
  if (mapBtn) mapBtn.addEventListener('click', function () { choose('all'); });

  var existing = getConsent();
  if (existing === 'all') loadMap();
  else if (!existing) showBanner();

  var lb = document.getElementById('lightbox');
  if (lb) {
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('.gallery button'));
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var idx = 0, opener = null;
    var show = function (i) {
      idx = (i + thumbs.length) % thumbs.length;
      var img = thumbs[idx].querySelector('img');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
    };
    var open = function (i) { opener = document.activeElement; show(i); lb.classList.add('open'); lb.querySelector('.lb-close').focus(); };
    var close = function () { lb.classList.remove('open'); if (opener) opener.focus(); };
    thumbs.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');
    var btn = form.querySelector('button[type=submit]');
    var say = function (msg, ok) {
      status.textContent = msg;
      status.className = 'form-status show ' + (ok ? 'ok' : 'err');
      status.focus();
    };
    form.addEventListener('submit', function (e) {
      if (!form.checkValidity()) return; 
      if (!window.fetch || location.protocol === 'file:') return; 
      e.preventDefault();
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending…';
      var data = new FormData(form);
      var ajaxUrl = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
      fetch(ajaxUrl, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && String(res.j.success) === 'true') {
            form.reset();
            say('Thank you! Your message has been sent. We will get back to you soon.', true);
          } else {
            throw new Error((res.j && res.j.message) || 'failed');
          }
        })
        .catch(function () {
          say('Sorry, something went wrong. Please WhatsApp us on 071 282 3848 instead.', false);
        })
        .then(function () { btn.disabled = false; btn.textContent = label; });
    });
  }

  document.querySelectorAll('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });
})();
