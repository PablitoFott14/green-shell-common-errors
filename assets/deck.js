/* The slides: one slide at a time. Buttons, the arrow keys, Page Up and Down, Space, Home
   and End, the strip, a swipe on a touch screen, full screen, and a link to every slide (#1 to
   #N). Every example number on a slide opens that example in the viewer. It reads the deck from
   the page itself and touches nothing outside #deck. */
(function () {
  'use strict';
  var data = JSON.parse(document.getElementById('deck-data').textContent);
  var slides = data.slides, N = slides.length;
  function $(s) { return document.querySelector(s); }
  var wrap = $('.dk-stagewrap'), stage = $('.dk-stage'), img = $('.dk-img'), count = $('.dk-count'),
      title = $('.dk-title'), part = $('.dk-part'), prevB = $('[data-act="prev"]'), nextB = $('[data-act="next"]'),
      fullB = $('[data-act="full"]'), live = $('.dk-live'), text = $('#dk-text'), strip = $('.dk-strip'),
      help = $('.dk-help'), thumbs = Array.prototype.slice.call(document.querySelectorAll('.dk-strip button')),
      hots = $('.dk-hots'), exrow = $('.dk-ex'), exlist = $('.dk-exl');
  var cur = -1, held = {};
  var ARROW = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4"/></svg>';

  function clamp(i) { return Math.max(0, Math.min(N - 1, i)); }
  function fromHash() {
    var m = /^#(\d+)$/.exec(location.hash);
    return m ? clamp(parseInt(m[1], 10) - 1) : 0;
  }
  // keep the neighbours decoded, so a step shows the next slide at once
  function hold(i) {
    if (i < 0 || i >= N || held[i]) return;
    var im = new Image();
    im.decoding = 'async';
    im.src = slides[i].img;
    held[i] = im;
  }
  function centre(t) {
    var sr = strip.getBoundingClientRect(), tr = t.getBoundingClientRect();
    if (tr.left < sr.left || tr.right > sr.right) strip.scrollLeft += (tr.left - sr.left) - (sr.width - tr.width) / 2;
  }
  // Every example number on a slide opens that example in the viewer. Each number gets a link laid
  // over it on the picture, and a button under the slide, which is also how a keyboard or a screen
  // reader reaches it. Pointing at either lights both.
  function light(n, on) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-n="' + n + '"]'), function (el) {
      el.classList.toggle('on', on);
    });
  }

  // The example opens in this tab, and its page offers Back to slides, to this slide (the address
  // carries it). Before leaving, the deck notes where you were: the slide, how far the page and the
  // strip were scrolled, the example you opened, whether you opened it from the keyboard, and
  // whether the slide was full screen. Coming back puts all of it back.
  var RETURN = 'gsce-slides-return', FROM = 'gsce-from-slide';
  function keep(k, v) {
    try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, JSON.stringify(v)); }
    catch (e) { /* storage off: the slide still comes back, from the address */ }
  }
  function kept(k) {
    try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; }
  }
  function link(el, l) {
    el.href = l.href;
    el.setAttribute('data-n', l.n);
    el.addEventListener('pointerenter', function () { light(l.n, true); });
    el.addEventListener('pointerleave', function () { light(l.n, false); });
    el.addEventListener('focus', function () { light(l.n, true); });
    el.addEventListener('blur', function () { light(l.n, false); });
    el.addEventListener('click', function (e) {
      keep(RETURN, {slide: cur + 1, y: window.scrollY, strip: strip.scrollLeft, n: l.n,
                    key: e.detail === 0, full: document.fullscreenElement === wrap});
    });
  }
  function resume() {
    var r = kept(RETURN);
    keep(RETURN, null);
    keep(FROM, null);   // back on the slides: the site stops offering the way back
    if (!r || r.slide !== cur + 1) return;
    // at once: the site scrolls smoothly, and coming back is not a scroll
    window.scrollTo({top: r.y || 0, left: 0, behavior: 'instant'});
    strip.scrollLeft = r.strip || 0;
    // the example you opened lights up for a moment, so you see where you were
    light(r.n, true);
    setTimeout(function () { light(r.n, false); }, 1600);
    if (r.key) {
      var c = exlist.querySelector('[data-n="' + r.n + '"]');
      if (c) c.focus({preventScroll: true});
    }
    // a browser only goes full screen when asked, so say how
    if (r.full && document.fullscreenEnabled) {
      var t = document.createElement('p');
      t.className = 'dk-hint';
      t.textContent = 'Press F to go back to full screen';
      stage.appendChild(t);
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 4000);
    }
  }
  function examples(s) {
    hots.textContent = '';
    exlist.textContent = '';
    var ls = s.links || [], seen = {}, prev = null;
    ls.forEach(function (l) {
      var a = document.createElement('a');
      a.className = 'dk-hot';
      a.tabIndex = -1;
      a.setAttribute('aria-hidden', 'true');
      a.title = 'Example ' + l.n + ': ' + l.title;
      a.style.left = l.box[0] + '%';
      a.style.top = l.box[1] + '%';
      a.style.width = l.box[2] + '%';
      a.style.height = l.box[3] + '%';
      link(a, l);
      hots.appendChild(a);
    });
    // one button per example, in number order; a gap where the next one is another mistake's
    ls.filter(function (l) { return !seen[l.n] && (seen[l.n] = true); })
      .sort(function (x, y) { return x.n - y.n; })
      .forEach(function (l) {
        var li = document.createElement('li'), c = document.createElement('a');
        if (prev !== null && prev !== l.title) li.className = 'brk';
        prev = l.title;
        c.className = 'dk-exa';
        c.title = l.title;
        c.setAttribute('aria-label', 'Example ' + l.n + ': ' + l.title);
        c.innerHTML = 'Example ' + Number(l.n) + ARROW;
        link(c, l);
        li.appendChild(c);
        exlist.appendChild(li);
      });
    if (ls.length) exrow.removeAttribute('data-empty'); else exrow.setAttribute('data-empty', '');
  }

  function show(i) {
    i = clamp(i);
    if (i === cur) return;
    cur = i;
    var s = slides[i];
    img.src = s.img;
    img.alt = 'Slide ' + (i + 1) + ' of ' + N + ': ' + s.name;
    examples(s);
    text.textContent = s.text;
    count.textContent = (i + 1) + ' / ' + N;
    title.textContent = s.name;
    part.textContent = s.part;
    prevB.disabled = i === 0;
    nextB.disabled = i === N - 1;
    thumbs.forEach(function (b, k) {
      if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    if (thumbs[i]) centre(thumbs[i]);
    if (location.hash !== '#' + (i + 1)) history.replaceState(null, '', '#' + (i + 1));
    live.textContent = 'Slide ' + (i + 1) + ' of ' + N + ': ' + s.name;
    document.title = s.name + ' · Green Shell · Common Errors';
    hold(i + 1);
    hold(i - 1);
  }
  function step(d) { show(cur + d); }

  // The slide takes the column's width, or less when the window is short, so the bar, the whole
  // slide and the strip fit on one screen without scrolling. Full screen fills the screen.
  function fit() {
    var w;
    if (document.fullscreenElement === wrap) {
      w = Math.min(window.innerWidth, window.innerHeight * 16 / 9);
    } else {
      var top = wrap.getBoundingClientRect().top + window.scrollY;
      var below = exrow.offsetHeight + 14 + strip.offsetHeight + (help && help.offsetParent ? help.offsetHeight + 14 : 0) + 14 + 18;
      var room = window.innerHeight - top - below;
      w = Math.min(wrap.clientWidth, Math.max(240, room * 16 / 9));
    }
    stage.style.width = Math.floor(w) + 'px';
  }

  function toggleFull() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (wrap.requestFullscreen) wrap.requestFullscreen().catch(function () {});
  }

  prevB.addEventListener('click', function () { step(-1); });
  nextB.addEventListener('click', function () { step(1); });
  fullB.addEventListener('click', toggleFull);
  if (!document.fullscreenEnabled) fullB.hidden = true;
  thumbs.forEach(function (b, k) { b.addEventListener('click', function () { show(k); }); });

  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    var t = e.target, k = e.key;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    // Space and Enter keep their usual job on a focused button or link
    if ((k === ' ' || k === 'Enter') && t && /^(BUTTON|A)$/.test(t.tagName)) return;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey)) step(1);
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey)) step(-1);
    else if (k === 'Home') show(0);
    else if (k === 'End') show(N - 1);
    else if ((k === 'f' || k === 'F') && document.fullscreenEnabled) toggleFull();
    else return;
    e.preventDefault();
  });

  stage.addEventListener('click', function (e) {
    // a click on an example number opens the example; it never also steps the slide
    if (document.fullscreenElement !== wrap || e.target.closest('.dk-hot')) return;
    var r = stage.getBoundingClientRect();
    step(e.clientX - r.left < r.width / 3 ? -1 : 1);
  });

  var sx = null, sy = 0;
  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') { sx = e.clientX; sy = e.clientY; }
  });
  stage.addEventListener('pointerup', function (e) {
    if (sx === null) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  });
  stage.addEventListener('pointercancel', function () { sx = null; });

  window.addEventListener('hashchange', function () { show(fromHash()); });
  document.addEventListener('fullscreenchange', function () {
    fullB.setAttribute('aria-pressed', document.fullscreenElement === wrap ? 'true' : 'false');
    fit();
  });
  window.addEventListener('resize', fit);

  show(fromHash());
  fit();
  resume();
  // Back from a page the browser kept whole: the slide is as it was, but the notes still clear
  window.addEventListener('pageshow', function (e) { if (e.persisted) resume(); });
  document.documentElement.setAttribute('data-deck', 'ready');
})();
