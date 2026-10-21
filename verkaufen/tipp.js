/* Tippgeber-Formular. Dieselbe Lead-Schnittstelle, quelle tippgeber. */
(function () {
  'use strict';
  var form = document.getElementById('tippForm');
  if (!form) return;
  var fehler = document.getElementById('tippFehler');
  var knopf = document.getElementById('tippSenden');

  function wert(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function eigentuemerSichtbar() {
    var hat = wert('tEigentuemer').length > 0;
    var block = document.getElementById('tEigentuemerJaZeile');
    if (block) block.hidden = !hat;
    return hat;
  }

  var eigentuemer = document.getElementById('tEigentuemer');
  if (eigentuemer) eigentuemer.addEventListener('input', eigentuemerSichtbar);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    fehler.textContent = '';
    var art = (document.querySelector('input[name="tippArt"]:checked') || {}).value || '';
    var hatEigentuemer = eigentuemerSichtbar();
    var dsgvo = document.getElementById('tDsgvo');
    var dritte = document.getElementById('tEigentuemerJa');
    var daten = {
      quelle: 'tippgeber',
      typ: 'tippgeber',
      vorname: wert('tVorname'),
      nachname: wert('tNachname'),
      email: wert('tEmail'),
      telefon: wert('tTelefon'),
      telefonEinwilligung: document.getElementById('tTelefonJa') ? document.getElementById('tTelefonJa').checked : false,
      einwilligung: dsgvo.checked,
      einwilligungText: dsgvo.nextElementSibling.textContent.replace(/\s+/g, ' ').trim(),
      dritteEinwilligung: !!(dritte && dritte.checked),
      eigentuemerKontakt: wert('tEigentuemer'),
      nachricht: wert('tText'),
      website: wert('tWebsite'),
      weg: 'tipp',
      objekt: {
        art: art,
        strasse: wert('tLage'),
        ort: '',
        plz: '',
      },
    };
    var fehlt = [];
    if (daten.vorname.length < 2) fehlt.push('Vorname');
    if (daten.nachname.length < 2) fehlt.push('Nachname');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(daten.email)) fehlt.push('E-Mail');
    if (daten.objekt.strasse.length < 3) fehlt.push('Lage');
    if (!art) fehlt.push('Art');
    if (!daten.einwilligung) fehlt.push('Einwilligung');
    if (hatEigentuemer && !daten.dritteEinwilligung) fehlt.push('Einverständnis des Eigentümers');
    if (daten.telefon && !daten.telefonEinwilligung) fehlt.push('Einwilligung zum Anruf');
    if (fehlt.length) {
      fehler.textContent = 'Bitte prüfen: ' + fehlt.join(', ') + '.';
      return;
    }
    knopf.disabled = true;
    knopf.textContent = 'Wird gesendet …';
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(daten),
    }).then(function (antwort) {
      return antwort.json().catch(function () { return { ok: antwort.ok }; });
    }).then(function (antwort) {
      if (!antwort || !antwort.ok) throw new Error(antwort && antwort.fehler);
      window.icTrack = window.icTrack || [];
      window.icTrack.push({ name: 'tipp_submit', data: { objektart: art, eigentuemer_kontakt: hatEigentuemer } });
      var ok = document.createElement('p');
      ok.className = 'hinweis';
      ok.textContent = 'Danke für deinen Tipp! Navid oder Nikan schauen ihn sich an und melden sich bei dir. Denk dran: Die Prämie von bis zu 5.000 €, abhängig vom Objekt, gibt es nur, wenn wir die Immobilie tatsächlich kaufen.';
      form.replaceWith(ok);
    }).catch(function (err) {
      knopf.disabled = false;
      knopf.textContent = 'Tipp absenden';
      fehler.textContent = (err && err.message) || 'Das hat nicht geklappt. Schreib uns per WhatsApp.';
    });
  });
})();
