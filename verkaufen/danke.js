/* Danke-Seite. Liest nur den lokalen Übergang aus dem Funnel, kein Tracking mit Kontaktdaten. */
(function () {
  'use strict';
  var daten = {};
  try { daten = JSON.parse(sessionStorage.getItem('ic-danke') || '{}'); } catch (e) { daten = {}; }
  var name = daten.vorname || '';
  var titel = document.getElementById('dankeTitel');
  if (titel) titel.textContent = name ? 'Danke, ' + name + '! Wir haben deine Anfrage.' : 'Danke! Wir haben deine Anfrage.';
  var b = daten.variante === 'B';
  var weg = daten.weg || 'ankauf';
  var schluessel = (b ? 'b-' : 'a-') + (weg === 'makler' ? 'makler' : weg === 'auswertung' ? 'auswertung' : 'ankauf');
  document.querySelectorAll('[data-danke]').forEach(function (el) {
    el.hidden = el.getAttribute('data-danke') !== schluessel;
  });
  var extra = document.getElementById('dankeExtra');
  if (extra) {
    if (daten.telefon && daten.rueckruf) {
      var fenster = { vormittag: 'vormittags', mittag: 'mittags', nachmittag: 'nachmittags', abend: 'abends' };
      extra.hidden = false;
      extra.textContent = 'Wir rufen dich innerhalb von 24 Stunden an, möglichst ' + (fenster[daten.rueckruf] || 'bald') + '.';
    } else if (!daten.telefon) {
      extra.hidden = false;
      extra.textContent = 'Wir melden uns per E-Mail bei dir.';
    }
  }
})();
