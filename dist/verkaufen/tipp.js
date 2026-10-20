/* Kurzes Tippgeber-Formular. Dieselbe Lead-Schnittstelle, anderer Typ. */
(function () {
  'use strict';
  var form = document.getElementById('tippForm');
  if (!form) return;
  var fehler = document.getElementById('tippFehler');
  var knopf = document.getElementById('tippSenden');

  function wert(id) { return document.getElementById(id).value.trim(); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    fehler.textContent = '';
    var art = (document.querySelector('input[name="tippArt"]:checked') || {}).value || '';
    var daten = {
      quelle: 'tippgeber',
      typ: 'tippgeber',
      vorname: wert('tVorname'),
      email: wert('tEmail'),
      telefon: wert('tTelefon'),
      telefonEinwilligung: document.getElementById('tTelefonJa').checked,
      einwilligung: document.getElementById('tDsgvo').checked,
      dritteEinwilligung: document.getElementById('tDritte').checked,
      nachricht: wert('tText'),
      website: wert('tWebsite'),
      weg: 'tipp',
      objekt: { art: art, ort: wert('tOrt'), plz: wert('tPlz') },
    };
    var fehlt = [];
    if (daten.vorname.length < 2) fehlt.push('Vorname');
    if (daten.email.indexOf('@') < 1) fehlt.push('E-Mail');
    if (!daten.einwilligung) fehlt.push('Datenschutz');
    if (!daten.dritteEinwilligung) fehlt.push('Einverständnis zur Weitergabe');
    if (daten.telefon && !daten.telefonEinwilligung) fehlt.push('Einwilligung zum Anruf');
    if (!art) fehlt.push('Objektart');
    if (fehlt.length) {
      fehler.textContent = 'Es fehlt noch: ' + fehlt.join(', ') + '.';
      return;
    }
    knopf.disabled = true;
    knopf.textContent = 'Wird gesendet …';
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(daten),
    }).then(function (a) {
      return a.json().catch(function () { return { ok: a.ok }; });
    }).then(function (antwort) {
      if (!antwort || !antwort.ok) throw new Error(antwort && antwort.fehler);
      var ok = document.createElement('p');
      ok.className = 'hinweis';
      ok.textContent = 'Danke. Wir melden uns bei dir, sobald wir den Tipp eingeordnet haben.';
      form.replaceWith(ok);
    }).catch(function (err) {
      knopf.disabled = false;
      knopf.textContent = 'Tipp senden';
      fehler.textContent = (err && err.message) || 'Das hat nicht geklappt. Schreib uns auf Instagram @immo.cousins.';
    });
  });
})();
