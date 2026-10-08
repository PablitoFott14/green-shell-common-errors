/* The example opens over the error you were reading, not on a page of its own:
   a dialog, the point being made pinned on the left, the task's own fields tabbed
   on the right, and closing it puts you back exactly where you were.

   Every tab opens on its first marked spot. The stepper in a tab's header walks
   the rest, and every reference in the diagnosis (criterion 19, the Execution
   target, a filename, a quote) jumps to what it names. */
(function () {
  "use strict";

  var open = null;          // the dialog currently up
  var prevFocus = null;     // whatever had focus before it opened
  // where the slides are, from where this script is: the deck is the site's front page
  var SLIDES = new URL("../index.html", (document.currentScript || {}).src || location.href).href;

  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function dialog(id) { return document.getElementById("ex-" + id); }

  /* The open example lives in the address, so a reload, or a link someone shares,
     lands on it again. replaceState adds no history entry. */
  function setHash(id) {
    try {
      history.replaceState(null, "", id ? "#ex-" + id : location.pathname + location.search);
    } catch (e) { /* a file:// page in some browsers */ }
  }

  /* Evidence loads only when its tab is up: a page, a video or a recording is
     fetched the first time someone opens it, never with the page itself. */
  function wake(pane) {
    if (!pane) return;
    all("[data-src]", pane).forEach(function (el) {
      if (!el.getAttribute("src")) {
        if (el.tagName !== "IFRAME") el.preload = "metadata";
        el.setAttribute("src", el.getAttribute("data-src"));
      }
    });
  }

  function hush(root, keep) {
    all("video, audio", root).forEach(function (m) { if (!keep || !keep.contains(m)) m.pause(); });
  }

  /* Scroll only the boxes inside the dialog, innermost first, so the spot sits a
     third of the way down every box that holds it. The page behind never moves. */
  function reveal(el) {
    var stop = el.closest(".ovpanes") || el.closest(".ov");
    var p = el.parentElement;
    while (p) {
      var cs = window.getComputedStyle(p);
      if (/(auto|scroll)/.test(cs.overflowY) && p.scrollHeight > p.clientHeight + 1) {
        var r = el.getBoundingClientRect(), b = p.getBoundingClientRect();
        var room = Math.max(24, (p.clientHeight - Math.min(r.height, p.clientHeight)) / 3);
        // already in view, in the top half of the box: leave the box where it is, so what sits
        // above the spot (a note, a header) stays readable
        var seen = r.top >= b.top && r.bottom <= b.bottom && r.top - b.top < p.clientHeight / 2;
        if (!seen) p.scrollTop += (r.top - b.top) - room;
      }
      if (p === stop) break;
      p = p.parentElement;
    }
  }

  function pulse(el) {
    el.classList.remove("pulse");
    void el.offsetWidth;                       // restart the animation
    el.classList.add("pulse");
    window.setTimeout(function () { el.classList.remove("pulse"); }, 1700);
  }

  /* ── the marked spots in a tab, and the stepper that walks them ─────────── */
  function spots(pane) { return all(".spot", pane); }
  function frameOf(pane) { return pane.querySelector("iframe[data-targets]:not([data-targets='0'])"); }

  function current(pane, el) {
    all(".spot.cur", pane).forEach(function (x) { x.classList.remove("cur"); });
    if (el) el.classList.add("cur");
  }

  function label(pane) {
    var st = pane.querySelector(".stepper");
    if (!st) return;
    var f = frameOf(pane), n, at;
    if (f) { n = f._marks || 0; at = f._at || 0; }
    else { n = spots(pane).length; at = pane._at || 0; }
    st.hidden = n < 1;
    st.querySelector(".stn").textContent = n ? "Spot " + (at + 1) + " of " + n : "";
    all(".stp", st).forEach(function (b) { b.disabled = n < 2; });
  }

  function goSpot(pane, i, flash) {
    var f = frameOf(pane);
    if (f) {
      // A golden page marks its own passages; ask it to show the next one.
      if (f.contentWindow) f.contentWindow.postMessage({ceStep: i}, "*");
      return;
    }
    var s = spots(pane);
    if (!s.length) return;
    pane._at = ((i % s.length) + s.length) % s.length;
    current(pane, s[pane._at]);
    reveal(s[pane._at]);
    if (flash) pulse(s[pane._at]);
    label(pane);
  }

  /* A page reports how many passages it marked and which one is showing. */
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (!d || d.ceEvidence === undefined) return;
    all("iframe[data-targets]").forEach(function (f) {
      if (f.contentWindow === e.source) {
        f._marks = d.marks || 0;
        f._at = d.at || 0;
        label(f.closest(".ovpane"));
      }
    });
  });

  /* ── tabs: one pane at a time, landing on its first spot ─────────────────── */
  function selectPane(dlg, n, land) {
    var on = null;
    all(".ovtab[data-pane]", dlg).forEach(function (t) {
      var here = t.getAttribute("data-pane") === String(n);
      t.classList.toggle("on", here);
      t.setAttribute("aria-selected", here ? "true" : "false");
    });
    all(".ovpane", dlg).forEach(function (p) {
      var here = p.getAttribute("data-pane") === String(n);
      p.classList.toggle("on", here);
      if (here) on = p;
    });
    if (!on) return null;
    hush(dlg, on);
    wake(on);
    label(on);
    if (land !== false) landOn(dlg, on);
    return on;
  }

  /* Put a pane's current spot in view, flashing it the first time it is shown. */
  function landOn(dlg, on) {
    var box = dlg.querySelector(".ovpanes");
    if (box) box.scrollTop = 0;
    if (!frameOf(on) && spots(on).length) goSpot(on, on._at || 0, !on._seen);
    on._seen = true;
  }

  /* A jump puts the right tab up, then walks you to the row, the words or the file. */
  function goTo(dlg, pane, rowId) {
    var p = selectPane(dlg, pane, false);
    var el = document.getElementById(rowId);
    if (!p || !el) return;
    var box = dlg.querySelector(".ovpanes");
    if (box && !p.contains(el)) return;
    if (box) box.scrollTop = 0;
    var s = spots(p), k = s.indexOf(el);
    if (k < 0 && s.length) {
      // a row that holds marked words steps to the first of them
      var inner = el.querySelector(".spot");
      k = inner ? s.indexOf(inner) : -1;
      if (k >= 0) el = inner;
    }
    if (k >= 0) { p._at = k; current(p, el); label(p); }
    p._seen = true;
    reveal(el);
    pulse(el);
  }

  /* ── opening and closing ─────────────────────────────────────────────────── */
  function show(id, pane, rowId) {
    var d = dialog(id);
    if (!d) return;
    if (open && open !== d) hide(true);
    else if (!open) prevFocus = document.activeElement;
    all(".ovpane", d).forEach(function (p) { p._at = 0; p._seen = false; });
    d.hidden = false;
    document.body.style.overflow = "hidden";
    open = d;
    setHash(id);
    var c = d.querySelector(".ovclose");
    if (c) c.focus({preventScroll: true});
    // Opened without a place, it opens where the diagnosis's first line points: that tab,
    // that row or those words. The tab goes up at once; the scroll waits for layout, so the
    // spot can be measured. A tab clicked in between has already landed, and is left alone.
    if (!(pane != null && rowId)) {
      pane = d.getAttribute("data-home") || "0";
      rowId = d.getAttribute("data-home-row");
    }
    selectPane(d, pane, false);
    window.requestAnimationFrame(function () {
      if (open !== d) return;
      if (rowId) goTo(d, pane, rowId);
      else {
        var on = d.querySelector(".ovpane.on");
        if (on && !on._seen) landOn(d, on);
      }
    });
  }

  function hide(swapping) {
    if (!open) return;
    hush(open);
    open.hidden = true;
    open.classList.remove("wide");
    var w = open.querySelector(".ovwide");
    if (w) w.textContent = "Expand";
    open = null;
    if (swapping) return;
    setHash(null);
    document.body.style.overflow = "";
    // Back to the card you came from, at the scroll position you left.
    if (prevFocus && prevFocus.focus) prevFocus.focus({preventScroll: true});
    prevFocus = null;
  }

  /* A marked span of a video: jump to its start, play it, stop at its end. */
  function playSpan(btn) {
    var v = btn.closest(".evi").querySelector("video, audio");
    if (!v) return;
    wake(btn.closest(".ovpane"));
    var start = parseFloat(btn.getAttribute("data-t")), end = parseFloat(btn.getAttribute("data-end"));
    function go() {
      v.currentTime = start;
      v._startAt = start;
      v._stopAt = end;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
    if (v.readyState >= 1) go();
    else v.addEventListener("loadedmetadata", go, {once: true});
  }

  /* Seeking out of the span by hand lets the video run on. */
  document.addEventListener("seeked", function (e) {
    var v = e.target;
    if (v._stopAt && (v.currentTime < v._startAt - 0.5 || v.currentTime > v._stopAt)) v._stopAt = null;
  }, true);

  document.addEventListener("timeupdate", function (e) {
    var v = e.target;
    if (v._stopAt && v.currentTime >= v._stopAt) { v.pause(); v._stopAt = null; }
  }, true);

  /* ── one click handler for the whole site ────────────────────────────────── */
  document.addEventListener("click", function (e) {
    var t = e.target;

    // "The rule it breaks": open the full quote where it sits, unfolding it if it is
    // folded away, without touching the address the open example keeps
    var rl = t.closest(".rlink");
    if (rl) {
      var rule = document.getElementById(rl.getAttribute("href").slice(1));
      if (rule) {
        var fold = rule.closest("details");
        if (fold && !fold.open) fold.open = true;
        if (rule.closest(".ovrail")) reveal(rule);
        else rule.scrollIntoView({behavior: "smooth", block: "center"});
        rule.classList.add("lit");
        window.setTimeout(function () { rule.classList.remove("lit"); }, 1800);
      }
      e.preventDefault();
      return;
    }

    // a line of the diagnosis, a reference or a file button: straight to what it names
    var jump = t.closest(".ref, .jump, .evjump");
    if (jump) {
      var ex = jump.getAttribute("data-ex");
      var pane = jump.getAttribute("data-pane"), row = jump.getAttribute("data-row");
      if (ex && (!open || open.id !== "ex-" + ex)) show(ex, pane, row);
      else if (open) goTo(open, pane, row);
      e.preventDefault();
      return;
    }

    var opener = t.closest(".exopen, .exnav");
    if (opener) { show(opener.getAttribute("data-ex")); return; }

    var card = t.closest(".excard");
    if (card && !t.closest("a, button")) { show(card.getAttribute("data-ex")); return; }

    if (t.closest(".ovclose")) { hide(); return; }

    var wide = t.closest(".ovwide");
    if (wide) {
      var back = wide.closest(".ovback");
      var now = back.classList.toggle("wide");
      wide.textContent = now ? "Shrink" : "Expand";
      return;
    }

    var body = t.closest(".ovbody");
    if (t.closest(".railhide") && body) { body.classList.add("railoff"); return; }
    if (t.closest(".showrail") && body) { body.classList.remove("railoff"); return; }

    var tab = t.closest(".ovtab[data-pane]");
    if (tab) { selectPane(tab.closest(".ovback"), tab.getAttribute("data-pane")); return; }

    var stp = t.closest(".stp, .stn");
    if (stp) {
      var p = stp.closest(".ovpane");
      var d = stp.classList.contains("stn") ? 0 : parseInt(stp.getAttribute("data-d"), 10);
      if (frameOf(p)) goSpot(p, d);
      else goSpot(p, (p._at || 0) + d, true);
      return;
    }

    var img = t.closest(".evimg");
    if (img) { img.classList.toggle("full"); return; }

    var span = t.closest(".evmark");
    if (span) { playSpan(span); return; }

  });

  /* Clicking the backdrop closes, the way every dialog on the dashboard does. */
  document.addEventListener("mousedown", function (e) {
    if (open && e.target === open) hide();
  });

  document.addEventListener("keydown", function (e) {
    if (!open) {
      // a focused card opens with Enter or Space, like the button it stands for
      var c = document.activeElement;
      if (c && c.classList && c.classList.contains("excard") && (e.key === "Enter" || e.key === " ")) {
        show(c.getAttribute("data-ex"));
        e.preventDefault();
      }
      return;
    }
    if (e.key === "Escape") { hide(); return; }
    // Left and right walk the tabs, so a long criteria block can be skimmed
    // without reaching for the mouse.
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (document.activeElement && document.activeElement.closest(".ovpanes, details")) return;
    var tabs = open.querySelectorAll(".ovtab[data-pane]");
    if (tabs.length < 2) return;
    var at = 0, i;
    for (i = 0; i < tabs.length; i++) if (tabs[i].classList.contains("on")) at = i;
    at = (at + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
    selectPane(open, tabs[at].getAttribute("data-pane"));
    e.preventDefault();
  });

  /* A link ending in #ex-<error>-<n> opens that example, which is how every example number on
     the slides lands on its task. Closing it leaves you on its card. */
  function fromHash() {
    var h = window.location.hash;
    if (h.indexOf("#ex-") !== 0) return;
    var id = decodeURIComponent(h.slice(4));
    if (!dialog(id)) return;
    if (open && open.id === "ex-" + id) return;
    var card = document.querySelector('.excard[data-ex="' + id + '"]');
    if (card) { card.scrollIntoView({block: "center"}); card.focus({preventScroll: true}); }
    show(id);
  }

  /* Back to slides. An example opened from the slides carries its slide in the address
     (?slide=5). From then on, every page offers the way back to that slide: fixed at the bottom
     left, above the example and its evidence, with room kept for it so it covers nothing, until
     you are back on the slides, which clear it. The Slides tab then puts you back where you were. */
  function backToSlides() {
    var m = /[?&]slide=(\d{1,3})(?:&|$)/.exec(location.search), n = m ? parseInt(m[1], 10) : 0;
    try {
      if (n) sessionStorage.setItem("gsce-from-slide", String(n));
      else n = parseInt(sessionStorage.getItem("gsce-from-slide") || "0", 10) || 0;
    } catch (e) { /* storage off: the address alone carries the slide */ }
    if (!n) return;
    var a = document.createElement("a");
    a.className = "toslides";
    a.href = SLIDES + "#" + n;
    a.setAttribute("aria-label", "Back to slides, slide " + n);
    a.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5"/></svg>' +
                  "<span>Back to slides</span><small>Slide " + n + "</small>";
    // first in the tab order after the skip link, and outside every dialog, so it is always there
    var skip = document.querySelector(".skip");
    document.body.insertBefore(a, skip ? skip.nextSibling : document.body.firstChild);
    document.documentElement.classList.add("fromslides");
  }

  /* ── what each marked spot is, said on the spot ──────────────────────────────
     The rail's lines each point at a place in the task: "Leg B turn 7", "Criterion 14". The
     place a line points at is tagged for what it is there, the mistake, context, or done right,
     and the fix the rail gives for that place is repeated under it, so the wrong words and the
     right ones sit together instead of a rail's length apart. A fix with no place of its own
     goes under the one missing row, or stays with the fix before it. Tags for the few places no
     line points at come with the dialog (data-tags). The task's own markup is left as it is:
     everything here is added beside it. */
  var ROW = ".row, .turn, .gm, .file, .prow, .tile";

  function decorate(d) {
    if (d._decorated) return;
    d._decorated = true;
    var rail = d.querySelector(".ovrail");
    if (!rail) return;
    var at = {}, last = null;
    function pin(id, kind, dl) {
      if (!id) return;
      (at[id] = at[id] || {was: [], ctx: [], now: []})[kind].push(dl);
    }
    all(".dl", rail).forEach(function (dl) {
      var chip = dl.querySelector(".dlw"), id = chip && chip.getAttribute("data-row");
      var kind = dl.classList.contains("l-now") ? "now" : dl.classList.contains("l-ctx") ? "ctx" : "was";
      if (!id && kind === "now") {
        var gaps = all(".ovpanes .row.gap", d);
        if (gaps.length === 1) id = gaps[0].id;
        else if (last) id = last;
      }
      if (id && kind === "now") last = id;
      pin(id, kind, dl);
    });
    var manual = {};
    (d.getAttribute("data-tags") || "").split(/\s+/).forEach(function (s) {
      var i = s.indexOf(":");
      if (i > 0) manual[s.slice(0, i)] = s.slice(i + 1).replace(/_/g, " ");
    });

    function fxl(kind, key, nodes) {
      var l = document.createElement("div"), k = document.createElement("span");
      l.className = "fxl " + kind;
      k.className = "fxk";
      k.textContent = key;
      l.appendChild(k);
      nodes.forEach(function (n) { l.appendChild(n); });
      return l;
    }
    function note(dl) {
      var n = dl.querySelector(".dn");
      return n ? [document.createTextNode(n.textContent)] : null;
    }
    /* The lines about one place, as a box: its note on the mistake, the context it gives, and the
       fix, badges (a new weight, a field, "Delete it") and words as the rail shows them. */
    function callout(p) {
      var box = document.createElement("div");
      box.className = "fx";
      p.was.forEach(function (dl) { var n = note(dl); if (n) box.appendChild(fxl("was", "✗", n)); });
      p.ctx.forEach(function (dl) { var n = note(dl); if (n) box.appendChild(fxl("ctx", "context", n)); });
      p.now.forEach(function (dl) {
        var bits = all(".dlh > :not(.dlw)", dl).concat(all(":scope > .dlt", dl)).map(function (x) { return x.cloneNode(true); });
        if (bits.length) box.appendChild(fxl("now", "✓ what it should have been", bits));
      });
      return box.children.length ? box : null;
    }
    function place(host, box) {
      if (!box) return;
      if (host.matches(".ph, .pb")) {          // a whole pane: under its header and note, above its content
        var pb = host.matches(".pb") ? host : host.parentElement.querySelector(":scope > .pb, :scope > .evnote + .pb");
        if (pb) pb.parentElement.insertBefore(box, pb); else host.insertAdjacentElement("afterend", box);
      } else if (host.matches(".file, .tile, .prow")) host.insertAdjacentElement("afterend", box);
      else (host.querySelector(":scope > .rc, :scope > .tt") || host).appendChild(box);
    }
    function tag(row, what) {
      if (!what || row.querySelector(":scope > .ptr")) return;
      var t = document.createElement("div");
      t.className = "ptr" + (what === "context" ? " ctx" : what === "done right" ? " ok" : "");
      t.textContent = what;
      row.insertBefore(t, row.firstChild);
      row.classList.add(what === "context" ? "ctxr" : what === "done right" ? "okr" : "flagged");
    }
    function hostOf(el) {
      if (!el) return null;
      if (el.matches(ROW + ", .ph, .pb")) return el;
      return el.closest(ROW) || el.closest(".pb");
    }
    var done = [];
    function settle(host, p, what) {
      if (!host || done.indexOf(host) >= 0) return;
      done.push(host);
      if (!host.matches(".ph, .pb")) tag(host, what);
      place(host, callout(p));
    }
    // first the places the rail points at, then every other marked spot
    Object.keys(at).forEach(function (id) {
      var p = at[id], host = hostOf(d.querySelector("#" + CSS.escape(id)));
      settle(host, p, manual[id] || (p.was.length ? "the mistake" : p.ctx.length ? "context" : null));
    });
    all(".ovpane", d).forEach(function (pane) {
      var head = pane.querySelector(".ph"), hp = head && at[head.id];
      all(".spot, mark.good", pane).forEach(function (el) {
        var host = hostOf(el);
        if (!host || host.matches(".ph, .pb") || done.indexOf(host) >= 0) return;
        var what = manual[host.id] || (hp && hp.was.length ? "the mistake" : hp && hp.ctx.length ? "context"
          : el.classList.contains("good") && !host.querySelector(".spot") ? "done right" : null);
        settle(host, {was: [], ctx: [], now: []}, what);
      });
    });
  }

  function start() {
    all(".ovback").forEach(decorate);
    backToSlides();
    fromHash();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
  window.addEventListener("hashchange", fromHash);
})();
