// A link to a section (#contact, #evidence, #dataflow ...): while the page is still settling (late stylesheets,
// images, the hero), keep that section's heading just below the navigation bar, until the visitor scrolls,
// clicks or types, or 8 seconds have passed. #wf-* (the hero's abilities) and the #privacy / #terms dialogs
// are handled elsewhere and left alone.
(function () {
  'use strict';
  function holdHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id || /^(privacy|terms)$/.test(id) || /^wf-/.test(id)) return;
    var target = document.getElementById(id);
    if (!target) return;
    var head = /^H[1-6]$/.test(target.tagName) ? target : (target.querySelector('h1, h2, h3') || target);
    var stopAt = Date.now() + 8000, done = false;
    function stop() { done = true; }
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) { addEventListener(ev, stop, { passive: true, once: true }); });
    function align() {
      if (done || Date.now() > stopAt) return;
      var nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
      var off = head.getBoundingClientRect().top - (nav + 16);
      if (Math.abs(off) > 2) window.scrollTo({ top: window.scrollY + off, behavior: 'instant' });
    }
    align();
    addEventListener('load', function () { align(); setTimeout(align, 120); });
    [250, 700, 1500, 3000, 5000].forEach(function (ms) { setTimeout(align, ms); });
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(align);
      ro.observe(document.body);
      setTimeout(function () { ro.disconnect(); }, 8000);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', holdHash); else holdHash();
})();
