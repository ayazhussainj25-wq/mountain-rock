/* ALPINE ET — site behaviour: header, menu, scroll effects, prices, offers, forms */
(function () {
  var C = window.ALPINE_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* Header: solid on scroll */
  var hdr = $('.hdr');
  function onScroll() { if (hdr && !hdr.classList.contains('always')) hdr.classList.toggle('solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Mobile menu */
  var burger = $('.burger'), nav = $('.nav');
  if (burger && nav) burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  /* Reveal on scroll */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }) : null;
  function watch(root) { $$('.rv,.zoom,.mask,[data-rv]', root).forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); }); }
  watch(document);

  /* Parallax peaks */
  var peaks = $$('.peaks');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (peaks.length && !reduce) window.addEventListener('scroll', function () {
    var y = window.scrollY; peaks.forEach(function (p) { p.style.transform = 'translate3d(0,' + (y * 0.18) + 'px,0)'; });
  }, { passive: true });

  /* Contact details from config */
  $$('[data-cfg]').forEach(function (el) {
    var k = el.getAttribute('data-cfg'), v = C[k]; if (!v) return;
    if (el.tagName === 'A') { el.href = (k === 'email' ? 'mailto:' : k === 'phone' ? 'tel:' : '') + String(v).replace(/\s/g, ''); }
    el.textContent = v;
  });
  if (C.whatsapp) $$('[data-wa]').forEach(function (el) { el.hidden = false; el.href = 'https://wa.me/' + C.whatsapp; });

  /* ---------- Prices ---------- */
  function fmt(n, d) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function loadPrices() {
    return fetch(C.pricesUrl, { headers: { accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); })
      .then(function (j) { if (!j || !j.items || !j.items.length) throw 0; return j; })
      .catch(function () { return fetch(C.pricesFallback).then(function (r) { return r.json(); }); });
  }
  function chg(it) {
    if (it.change == null || isNaN(it.change)) return { cls: '', txt: '' };
    var up = it.change >= 0, pct = it.prev ? (it.change / it.prev) * 100 : null;
    return { cls: up ? 'up' : 'dn', txt: (up ? '▲ ' : '▼ ') + fmt(Math.abs(it.change), it.unit === 'USD/gal' ? 3 : 2) + (pct != null ? ' (' + fmt(Math.abs(pct), 2) + '%)' : '') };
  }
  var needPrices = $('[data-ticker]') || $('[data-pcards]') || $('[data-ptable]');
  if (needPrices) loadPrices().then(function (d) {
    var items = d.items || [];
    var label = d.sample ? 'Sample figures. Live prices appear once the site is connected.' : 'Indicative benchmarks · updated ' + (d.updated ? new Date(d.updated).toUTCString().replace(' GMT', ' UTC') : '');
    var tk = $('[data-ticker]');
    if (tk) {
      var html = items.map(function (it) {
        var c = chg(it);
        return '<span class="tk"><b>' + esc(it.short || it.name) + '</b><span class="v">' + fmt(it.price, it.unit === 'USD/gal' ? 3 : 2) + '</span><span class="tk-note">' + esc(it.unit) + '</span><span class="' + c.cls + '">' + c.txt + '</span></span>';
      }).join('') + '<span class="tk"><span class="tk-note">' + esc(label) + '</span></span>';
      tk.innerHTML = '<div class="ticker-track">' + html + html + '</div>';
    }
    var pc = $('[data-pcards]');
    if (pc) {
      var top = items.filter(function (i) { return i.featured; }).slice(0, 4);
      pc.innerHTML = top.map(function (it) {
        var c = chg(it);
        return '<div class="pcard"><span class="k">' + esc(it.name) + '</span><span class="v">' + fmt(it.price, it.unit === 'USD/gal' ? 3 : 2) + '</span><span class="u">' + esc(it.unit) + ' · ' + esc(it.asOf || '') + '</span><span class="c ' + c.cls + '">' + c.txt + '</span></div>';
      }).join('');
    }
    var pt = $('[data-ptable]');
    if (pt) {
      pt.innerHTML = items.map(function (it) {
        var c = chg(it);
        return '<tr><td><span class="nm">' + esc(it.name) + '</span><span class="src">' + esc(it.desc || '') + '</span></td><td class="n"><b>' + fmt(it.price, it.unit === 'USD/gal' ? 3 : 2) + '</b></td><td class="hide-s">' + esc(it.unit) + '</td><td class="n ' + c.cls + '">' + c.txt + '</td><td class="hide-s">' + esc(it.asOf || '') + '<span class="src">' + esc(it.source || '') + '</span></td></tr>';
      }).join('');
    }
    $$('[data-price-note]').forEach(function (el) { el.textContent = label; });
  });

  /* ---------- Offers ---------- */
  var offersEl = $('[data-offers]');
  if (offersEl) fetch('data/offers.json').then(function (r) { return r.json(); }).then(function (d) {
    var all = (d.offers || []).filter(function (o) { return o.show !== false; });
    var limit = parseInt(offersEl.getAttribute('data-limit') || '0', 10);
    var badge = { available: 'b-avail', open: 'b-open', 'under offer': 'b-offer', closed: 'b-closed' };
    function render(kind) {
      var list = all.filter(function (o) { return !kind || kind === 'all' || o.type === kind; });
      if (limit) list = list.slice(0, limit);
      offersEl.innerHTML = list.length ? list.map(function (o, i) {
        var rows = (o.details || []).map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
        var isReq = o.type === 'requirement';
        var href = isReq ? 'suppliers.html' : 'buyers.html';
        return '<article class="offer rv d' + (i % 3 + 1) + '"><div class="offer-top"><div><div class="offer-type">' + (isReq ? 'Buyer requirement' : 'Supplier offer') + '</div><h3>' + esc(o.title) + '</h3><div class="offer-ref">Ref. ' + esc(o.ref || '') + '</div></div><div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">' +
          '<span class="badge ' + (badge[(o.status || '').toLowerCase()] || 'b-open') + '">' + esc(o.status || 'Open') + '</span>' + (o.sample ? '<span class="badge b-sample">Sample</span>' : '') + '</div></div>' +
          '<dl>' + rows + '</dl><div class="offer-foot"><a class="btn btn-navy" href="' + href + '?ref=' + encodeURIComponent(o.ref || '') + '">' + (isReq ? 'Respond as supplier' : 'Inquire as buyer') + ' <span class="arr">→</span></a></div></article>';
      }).join('') : '<p class="muted">No listings in this category right now. Send us your requirement and we will search our network.</p>';
      watch(offersEl);
    }
    render('all');
    $$('[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-filter]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        render(b.getAttribute('data-filter'));
      });
    });
  }).catch(function () { offersEl.innerHTML = '<p class="muted">Listings could not be loaded. Please contact us directly.</p>'; });

  /* ---------- Forms: Zoho embed or email fallback ---------- */
  $$('[data-form]').forEach(function (wrap) {
    var key = wrap.getAttribute('data-form');
    var url = C.zohoForms && C.zohoForms[key];
    if (url) { wrap.innerHTML = '<iframe class="zoho-frame" title="Inquiry form" src="' + esc(url) + '" loading="lazy"></iframe>'; return; }
    var form = $('form', wrap); if (!form) return;
    var ref = new URLSearchParams(location.search).get('ref');
    if (ref && form.elements.reference) form.elements.reference.value = ref;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var msg = $('.form-msg', form);
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var lines = [];
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === 'submit' || el.type === 'checkbox') return;
        if (el.value) lines.push((el.getAttribute('data-label') || el.name) + ': ' + el.value);
      });
      var subject = (form.getAttribute('data-subject') || 'Website inquiry') + (form.elements.company && form.elements.company.value ? ' — ' + form.elements.company.value : '');
      var href = 'mailto:' + (C.email || '') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
      msg.className = 'form-msg show';
      msg.innerHTML = 'Your email app should open with this inquiry ready to send. If it doesn\'t, email us at <b>' + esc(C.email) + '</b>.';
      try { window.location.href = href; } catch (e) {}
    });
  });


  /* Real photos: show when the file exists, otherwise keep the brand graphic */
  $$('img[data-photo]').forEach(function (img) {
    var box = img.parentNode;
    function ok() { if (img.naturalWidth > 0) box.classList.add('has-photo'); }
    function bad() { img.remove(); }
    if (img.complete) { img.naturalWidth > 0 ? ok() : bad(); }
    else { img.addEventListener('load', ok); img.addEventListener('error', bad); }
  });

  /* Print button (corporate profile) */
  $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { try { window.print(); } catch (e) {} }); });

  /* Year */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
