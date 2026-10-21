/* Cookielos vorbereitet. Es geht nichts an einen Analysedienst, solange keiner eingebunden ist. */
(function () {
  'use strict';
  window.icTrack = window.icTrack || [];
  function push(name, data) {
    window.icTrack.push({ name: name, data: data || {} });
  }
  var seite = document.body && document.body.getAttribute('data-page');
  if (seite) push('page_view', { page: seite });
  document.addEventListener('click', function (event) {
    var el = event.target.closest('[data-track]');
    if (!el) return;
    push(el.getAttribute('data-track'), {
      page: seite || '',
      cta: el.getAttribute('data-cta') || '',
      ziel: el.getAttribute('data-ziel') || el.getAttribute('href') || '',
      kanal: el.getAttribute('data-kanal') || '',
    });
  });
  document.addEventListener('toggle', function (event) {
    var el = event.target;
    if (!el || el.tagName !== 'DETAILS' || !el.open) return;
    push('faq_open', { page: seite || '', frage: el.getAttribute('data-frage') || '' });
  }, true);
})();
