/* Verkäufer-Funnel. Keine Cookies, keine Adresse im Tracking.
   Fortschritt liegt im sessionStorage und wird beim Absenden gelöscht. */
(function () {
  'use strict';

  var SCHRITTE = ['adresse', 'art', 'details', 'zustand', 'anlass', 'ergebnis', 'kontakt'];
  var KEY = 'ic-verkauf-funnel';
  var schritt = 0;
  var lage = null;
  var bewertung = null;
  var weg = '';
  var adresseStand = '';
  var uploadAn = false;
  var gestartet = false;
  var abgeschlossen = false;
  var hochOk = '';

  var label = document.getElementById('schrittLabel');
  var balken = document.getElementById('fortschrittBalken');
  var fehler = document.getElementById('funnelFehler');
  var nav = document.getElementById('funnelNav');
  var weiter = document.getElementById('weiter');
  var zurueck = document.getElementById('zurueck');

  function $(id) { return document.getElementById(id); }
  function wert(id) {
    var el = $(id);
    return el ? el.value.trim() : '';
  }
  function radio(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }
  function setzen(name, value) {
    var el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
    if (el) el.checked = true;
  }
  function euro(n) {
    if (!isFinite(n)) return '–';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(n));
  }
  function euroQm(n) {
    if (!isFinite(n)) return '–';
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n)) + ' €/m²';
  }
  function prozent(n) {
    return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n * 100) + ' %';
  }
  function art() { return radio('art'); }
  function track(name, data) {
    window.icTrack = window.icTrack || [];
    window.icTrack.push({ name: name, data: data || {} });
  }
  function stichtagText(wertDatum) {
    var treffer = /^(\d{4})-(\d{2})-(\d{2})/.exec(wertDatum || '');
    if (treffer) return treffer[3] + '.' + treffer[2] + '.' + treffer[1];
    return wertDatum || '01.01.2026';
  }
  function region() {
    return (lage && lage.lage && lage.lage.region) || '';
  }
  function varianteB() {
    if (bewertung && (bewertung.variante === 'B' || bewertung.verfahren === 'persoenlich')) return true;
    return art() === 'efh' && region() === 'koeln' && (radio('bauform') === 'reihe' || radio('bauform') === 'doppel');
  }

  function zeigeFehler(text) {
    fehler.textContent = text || '';
    var wa = $('fehlerWhatsapp');
    if (wa) wa.hidden = !text || text.indexOf('nur in Köln') === -1;
  }

  function adresseKey() {
    return [wert('fStrasse'), wert('fNr'), wert('fPlz'), wert('fOrt')].join('|').toLowerCase();
  }

  function detailsFuerArt() {
    var a = art();
    document.querySelectorAll('[data-fuer]').forEach(function (el) {
      el.hidden = el.getAttribute('data-fuer').split(/\s+/).indexOf(a) === -1;
    });
    var titel = $('detailsTitel');
    if (titel) {
      if (a === 'etw') titel.textContent = 'Erzähl uns kurz von deiner Wohnung';
      else if (a === 'grundstueck') titel.textContent = 'Erzähl uns kurz vom Grundstück';
      else titel.textContent = 'Erzähl uns kurz von deinem Haus';
    }
    var fl = $('flaecheLabel');
    if (fl) fl.textContent = (a === 'etw' || a === 'efh') ? 'Wohnfläche (m²)' : 'Wohn- und Nutzfläche gesamt (m²)';
  }

  function telefonZeilen() {
    var hat = wert('fTelefon').length > 0;
    var block = $('rueckrufBlock');
    var ruf = $('rufZeile');
    if (block) block.hidden = !hat;
    if (ruf) ruf.hidden = !hat;
  }

  function uploadZeigen() {
    var block = $('uploadBlock');
    if (!block) return;
    block.hidden = !(uploadAn && weg === 'ankauf');
  }

  function zeichneBrw() {
    var box = $('brwBox');
    if (!box) return;
    box.replaceChildren();
    if (!lage) { box.hidden = true; return; }
    box.hidden = false;
    var brw = lage.brw;
    var titel = document.createElement('b');
    if (brw && brw.wert) {
      var g = brw.gutachterausschuss || 'Gutachterausschuss';
      titel.textContent = 'Bodenrichtwert hier: ' + euroQm(brw.wert) + ' (Stichtag ' + stichtagText(brw.stichtag) + ', ' + g + ')';
    } else {
      titel.textContent = 'Bodenrichtwert für diese Stelle liegt nicht vor';
    }
    box.appendChild(titel);
    if (region() === 'andere') {
      var aussen = document.createElement('p');
      aussen.textContent = 'Wir sind nur in Köln und im Rhein-Erft-Kreis aktiv. Schreib uns trotzdem, wenn du Fragen hast.';
      box.appendChild(aussen);
      var link = document.createElement('a');
      link.href = 'https://wa.me/4915785568680';
      link.textContent = 'WhatsApp';
      box.appendChild(link);
    }
    var gebiet = region() === 'koeln' ? 'koeln' : region() === 'rhein-erft' ? 'rek' : 'ausserhalb';
    track('funnel_brw_shown', { gebiet: gebiet });
  }

  function quellenSatz() {
    var brw = (bewertung && bewertung.brw) || (lage && lage.brw) || {};
    var g = brw.gutachterausschuss || 'Gutachterausschuss';
    return 'Quellen: BORIS.NRW, ' + g + ', Grundstücksmarktbericht 2026. Daten: Datenlizenz Deutschland – Zero – Version 2.0.';
  }

  function brwAbsatz(ziel) {
    var brw = (bewertung && bewertung.brw) || (lage && lage.brw);
    if (!brw || !brw.wert) return;
    var p = document.createElement('p');
    p.className = 'brw';
    var b = document.createElement('b');
    b.textContent = 'Bodenrichtwert ' + euroQm(brw.wert);
    p.appendChild(b);
    var q = document.createElement('span');
    q.textContent = ' ' + quellenSatz();
    p.appendChild(q);
    ziel.appendChild(p);
  }

  function zeichneErgebnis() {
    var box = $('ergebnisInhalt');
    var titel = $('ergebnisTitel');
    box.replaceChildren();
    var b = varianteB();
    if (titel) titel.hidden = b;
    if (b) {
      var satz = document.createElement('p');
      satz.className = 'spanne';
      satz.style.fontSize = '1.35rem';
      satz.textContent = 'Diese Objektart bewerten wir persönlich, du bekommst die Einschätzung in 48 h';
      box.appendChild(satz);
      brwAbsatz(box);
      track('funnel_result_view', { objektart: 'efh', methode: 'persoenlich' });
    } else if (!bewertung) {
      var warten = document.createElement('p');
      warten.textContent = 'Die Spanne laden wir gerade.';
      box.appendChild(warten);
    } else if (bewertung.spanne) {
      var gross = document.createElement('p');
      gross.className = 'spanne';
      gross.textContent = euro(bewertung.spanne.niedrig) + ' bis ' + euro(bewertung.spanne.hoch);
      box.appendChild(gross);
      var a = art();
      if (a === 'mfh' || a === 'wgh') {
        var zeile = document.createElement('p');
        zeile.className = 'mitte';
        var text = 'Mitte nach Faktor-Methode ' + euro(bewertung.spanne.mitte);
        if (bewertung.ertragswert) text += ' · Ertragswert ' + euro(bewertung.ertragswert);
        zeile.textContent = text;
        box.appendChild(zeile);
      } else if ((a === 'etw' || a === 'efh') && bewertung.irw && bewertung.irw.wert) {
        var irw = document.createElement('p');
        irw.className = 'mitte';
        irw.textContent = 'Immobilienrichtwert der Zone ' + (bewertung.irw.name || 'deiner Lage') + ': ' + euroQm(bewertung.irw.wert) + ', angepasst an deine Angaben';
        box.appendChild(irw);
      }
      if (bewertung.kennzeichen || (bewertung.brw && bewertung.brw.wert)) {
        var kasten = document.createElement('div');
        kasten.className = 'kennzahlen';
        var teile = [];
        if (bewertung.brw && bewertung.brw.wert) teile.push('Bodenrichtwert ' + euroQm(bewertung.brw.wert));
        if (bewertung.kennzeichen) {
          teile.push('Liegenschaftszins ' + prozent(bewertung.kennzeichen.lzs));
          teile.push('Rohertragsfaktor ' + bewertung.kennzeichen.faktorMin + '–' + bewertung.kennzeichen.faktorMax);
        }
        teile.forEach(function (teil) {
          var span = document.createElement('span');
          span.textContent = teil;
          kasten.appendChild(span);
        });
        box.appendChild(kasten);
      }
      track('funnel_result_view', { objektart: a, methode: bewertung.verfahren || 'spanne' });
    } else {
      var keine = document.createElement('p');
      keine.textContent = bewertung.hinweis || 'Für diese Stelle setzen wir keine Spanne an.';
      box.appendChild(keine);
      brwAbsatz(box);
    }
    var q = $('quellenZeile');
    if (q) q.textContent = quellenSatz();
    var aus = $('wahlAuswertung');
    if (aus) aus.textContent = b ? 'Ich will erst nur die persönliche Einschätzung' : 'Ich will erst nur die ausführliche Auswertung';
  }

  function consentSichtbar() {
    var b = varianteB();
    document.querySelectorAll('[data-consent="a"]').forEach(function (el) { el.hidden = b; });
    document.querySelectorAll('[data-consent="b"]').forEach(function (el) { el.hidden = !b; });
    var el = document.querySelector(b ? '[data-consent="b"]' : '[data-consent="a"]');
    return el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
  }

  function zeichneKontakt() {
    var b = varianteB();
    var titel = $('kontaktTitel');
    var micro = $('kontaktMicro');
    var map = {
      ankauf: 'Wohin dürfen wir dein Kaufangebot schicken?',
      makler: 'Wie erreichen wir dich für das Gespräch?',
      auswertung: b ? 'Wohin dürfen wir deine persönliche Einschätzung schicken?' : 'Wohin dürfen wir deine ausführliche Auswertung schicken?',
    };
    if (titel) titel.textContent = map[weg] || map.ankauf;
    if (micro) {
      micro.hidden = !b;
      micro.textContent = b ? 'Diese Objektart bewerten wir persönlich, du bekommst die Einschätzung in 48 h' : '';
    }
    var namen = { ankauf: 'Wir kaufen selbst', makler: 'Wir verkaufen für dich', auswertung: b ? 'Persönliche Einschätzung' : 'Ausführliche Auswertung' };
    var merke = $('wegText');
    if (merke) merke.textContent = namen[weg] || namen.ankauf;
    var knopf = { ankauf: 'Kaufangebot anfordern', makler: 'Gespräch anfragen', auswertung: b ? 'Einschätzung anfordern' : 'Auswertung schicken' };
    weiter.textContent = knopf[weg] || 'Kaufangebot anfordern';
    consentSichtbar();
    uploadZeigen();
    telefonZeilen();
  }

  function zeige(index) {
    schritt = index;
    SCHRITTE.forEach(function (name, i) {
      var el = document.querySelector('[data-step="' + name + '"]');
      if (el) el.hidden = i !== index;
    });
    label.textContent = 'Schritt ' + (index + 1) + ' von 8';
    balken.style.width = Math.round(((index + 1) / 8) * 100) + '%';
    zurueck.hidden = index === 0;
    nav.hidden = index === 5;
    if (index !== 6) weiter.textContent = 'Weiter';
    zeigeFehler('');
    detailsFuerArt();
    if (index === 5) zeichneErgebnis();
    if (index === 6) zeichneKontakt();
    track('funnel_step_view', { step: index + 1, objektart: art() || '' });
    var fokus = document.querySelector('[data-step="' + SCHRITTE[index] + '"] h2');
    if (fokus && !fokus.hidden) fokus.setAttribute('tabindex', '-1'), fokus.focus();
    speichern();
  }

  function vorhabenWerte() {
    var v = radio('vorhaben');
    if (v === 'jetzt') return { anlass: 'verkauf', zeitpunkt: 'jetzt' };
    if (v === 'monate12') return { anlass: 'verkauf', zeitpunkt: 'monate12' };
    if (v === 'erbe') return { anlass: 'erbe', zeitpunkt: 'jetzt' };
    if (v === 'wert') return { anlass: 'wert', zeitpunkt: 'spaeter' };
    return { anlass: '', zeitpunkt: '' };
  }

  function gewerbeBucket() {
    if (art() !== 'wgh') return '0';
    var n = zahlOderNull('fGewerbeProzent');
    if (n == null || n <= 0) return '0';
    if (n <= 50) return 'bis50';
    return 'ueber50';
  }

  function objektDaten() {
    var plan = vorhabenWerte();
    var mods = [];
    document.querySelectorAll('input[name="mod"]:checked').forEach(function (el) {
      if (el.value !== 'nichts') mods.push(el.value);
    });
    var jahres = zahlOderNull('fMiete');
    var a = art();
    return {
      strasse: wert('fStrasse'),
      hausnummer: wert('fNr'),
      plz: wert('fPlz'),
      ort: wert('fOrt') || 'Köln',
      lat: lage && lage.lage && lage.lage.lat,
      lon: lage && lage.lage && lage.lage.lon,
      art: a,
      wohnflaeche: zahlOderNull('fFlaeche'),
      grundstueck: zahlOderNull('fGrund'),
      baujahr: zahlOderNull('fBaujahr'),
      geschoss: radio('geschoss') === '' ? null : Number(radio('geschoss')),
      nutzung: radio('nutzung'),
      we: a === 'etw' ? zahlOderNull('fWeHaus') : zahlOderNull('fWe'),
      leerstand: zahlOderNull('fLeer'),
      jahresmiete: jahres,
      mieteMonat: jahres ? jahres / 12 : null,
      gewerbeanteil: gewerbeBucket(),
      zustand: a === 'grundstueck' ? radio('zustandLand') : radio('zustand'),
      modernisierung: mods,
      anlass: plan.anlass,
      zeitpunkt: plan.zeitpunkt,
      bauform: radio('bauform'),
      variante: varianteB() ? 'B' : 'A',
    };
  }

  function zahlOderNull(id) {
    var roh = wert(id).replace(/\./g, '').replace(',', '.');
    if (!roh) return null;
    var n = Number(roh);
    return isFinite(n) ? n : null;
  }

  function zahlFeld(id, min, max, pflicht) {
    var roh = wert(id);
    if (!roh) return pflicht ? 'Bitte gib eine Zahl ein.' : '';
    var n = zahlOderNull(id);
    if (n == null || n < min) return 'Bitte gib eine Zahl ein.';
    if (n > max) {
      var schluessel = id + ':' + n;
      if (hochOk === schluessel) return '';
      hochOk = schluessel;
      return 'Das wirkt ungewöhnlich hoch, stimmt die Angabe?';
    }
    return '';
  }

  function validiereAktuell() {
    if (schritt === 0) {
      if (wert('fStrasse').length < 2 || !wert('fNr')) return 'Adresse nicht gefunden. Prüf bitte Straße und Hausnummer.';
      if (!/^\d{5}$/.test(wert('fPlz'))) return 'Adresse nicht gefunden. Prüf bitte Straße und Hausnummer.';
    }
    if (schritt === 1 && !art()) return 'Wähl eine Objektart.';
    if (schritt === 2) {
      var a = art();
      if (a === 'etw' || a === 'efh') {
        var fl = zahlFeld('fFlaeche', 10, 20000, true);
        if (fl) return fl;
      }
      if (a === 'efh' && !radio('bauform')) return 'Wähl einen Haustyp.';
      if (a === 'mfh' || a === 'wgh') {
        var we = zahlFeld('fWe', 1, 400, true);
        if (we) return we;
        var miete = zahlFeld('fMiete', 100, 5000000, true);
        if (miete) return miete;
        var flaeche = zahlFeld('fFlaeche', 10, 20000, true);
        if (flaeche) return flaeche;
      }
      if (a === 'grundstueck') {
        var g = zahlFeld('fGrund', 20, 100000, true);
        if (g) return g;
        if (!radio('zustandLand')) return 'Ist das Grundstück bebaut oder unbebaut?';
      }
      if (a === 'efh') {
        var grund = zahlFeld('fGrund', 20, 100000, false);
        if (grund) return grund;
      }
    }
    if (schritt === 3 && art() !== 'grundstueck' && !radio('zustand')) return 'Wie schätzt du den Zustand ein?';
    if (schritt === 4 && !radio('vorhaben')) return 'Was hast du vor?';
    if (schritt === 6) {
      if (wert('fVorname').length < 2) return 'Wie dürfen wir dich ansprechen?';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(wert('fEmail'))) return 'Bitte gib eine gültige E-Mail-Adresse ein.';
      if (!$('fDsgvo').checked) return 'Bitte die Einwilligung ankreuzen.';
      if (wert('fTelefon') && !$('fTelefonJa').checked) return 'Für einen Anruf brauchen wir das zweite Häkchen. Sonst lass die Nummer leer.';
      if (!weg) return 'Wähl noch, wie du weitermachen willst.';
    }
    return '';
  }

  function post(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).then(function (antwort) {
      return antwort.json().catch(function () { return { ok: false, fehler: 'Unerwartete Antwort.' }; });
    });
  }

  function ladeLage() {
    weiter.disabled = true;
    weiter.textContent = 'Weiter';
    zeigeFehler('');
    return post('/api/lage', {
      strasse: wert('fStrasse'),
      hausnummer: wert('fNr'),
      plz: wert('fPlz'),
      ort: wert('fOrt') || 'Köln',
    }).then(function (daten) {
      weiter.disabled = false;
      if (!daten || !daten.ok) {
        zeigeFehler((daten && daten.fehler) || 'Adresse nicht gefunden. Prüf bitte Straße und Hausnummer.');
        return false;
      }
      lage = daten;
      adresseStand = adresseKey();
      zeichneBrw();
      if (!gestartet) {
        gestartet = true;
        track('funnel_start', { einstieg: document.body.getAttribute('data-einstieg') || 'hausbewertung' });
      }
      speichern();
      return true;
    }).catch(function () {
      weiter.disabled = false;
      zeigeFehler('Das hat gerade nicht geklappt. Versuch es noch einmal.');
      return false;
    });
  }

  function ladeBewertung() {
    weiter.disabled = true;
    var daten = objektDaten();
    return post('/api/bewertung', daten).then(function (antwort) {
      weiter.disabled = false;
      if (!antwort || !antwort.ok) {
        bewertung = {
          spanne: null,
          hinweis: (antwort && antwort.fehler) || 'Die Spanne können wir gerade nicht automatisch rechnen.',
          brw: lage && lage.brw,
          variante: varianteB() ? 'B' : 'A',
        };
      } else {
        bewertung = antwort;
        if (!bewertung.brw && lage) bewertung.brw = lage.brw;
      }
      return true;
    }).catch(function () {
      weiter.disabled = false;
      bewertung = {
        spanne: null,
        hinweis: 'Die Spanne können wir gerade nicht automatisch rechnen.',
        brw: lage && lage.brw,
        variante: varianteB() ? 'B' : 'A',
      };
      return true;
    });
  }

  function ladeUpload() {
    var input = $('fUnterlagen');
    var block = $('uploadBlock');
    if (!input || !block || block.hidden || !input.files || !input.files.length) return Promise.resolve([]);
    var formular = new FormData();
    Array.prototype.forEach.call(input.files, function (datei) { formular.append('dateien', datei); });
    formular.append('website', wert('fWebsite'));
    return fetch('/api/unterlagen', { method: 'POST', body: formular }).then(function (antwort) {
      return antwort.json().catch(function () { return { ok: false }; });
    }).then(function (daten) {
      if (!daten || !daten.ok) throw new Error((daten && daten.fehler) || 'Die Unterlagen konnten nicht hochgeladen werden.');
      track('upload_done', { anzahl_dateien: (daten.dateien || []).length });
      return daten.dateien || [];
    });
  }

  function senden() {
    weiter.disabled = true;
    var objekt = objektDaten();
    var plan = vorhabenWerte();
    track('funnel_anlass', { anlass: plan.anlass === 'verkauf' && plan.zeitpunkt === 'jetzt' ? 'jetzt' : plan.anlass === 'verkauf' ? '12m' : plan.anlass === 'erbe' ? 'erbe' : 'nur_wert' });
    ladeUpload().then(function (dateien) {
      var body = {
        quelle: 'verkauf',
        typ: 'verkaeufer',
        vorname: wert('fVorname'),
        email: wert('fEmail'),
        telefon: wert('fTelefon'),
        telefonEinwilligung: $('fTelefonJa').checked,
        einwilligung: $('fDsgvo').checked,
        einwilligungText: consentSichtbar(),
        telefonEinwilligungText: $('fTelefonJa').checked ? $('fTelefonJa').nextElementSibling.textContent.trim() : '',
        rueckruf: radio('rueckruf'),
        weg: weg,
        variante: varianteB() ? 'B' : 'A',
        website: wert('fWebsite'),
        unterlagen: dateien,
        objekt: objekt,
        mehrgeschossig: lage && lage.mehrgeschossig,
        einZweifamilien: lage && lage.einZweifamilien,
        irw: bewertung && bewertung.irw,
      };
      return post('/api/lead', body);
    }).then(function (antwort) {
      weiter.disabled = false;
      if (!antwort || !antwort.ok) {
        zeigeFehler((antwort && antwort.fehler) || 'Das hat leider nicht geklappt.');
        zeichneKontakt();
        return;
      }
      track('lead_submit', {
        weg: weg,
        objektart: art(),
        variante: varianteB() ? 'B' : 'A',
        telefon: wert('fTelefon').length > 0,
        rueckruf_consent: $('fTelefonJa').checked,
      });
      try { sessionStorage.removeItem(KEY); } catch (e) { /* egal */ }
      var danke = {
        vorname: wert('fVorname'),
        weg: weg,
        variante: varianteB() ? 'B' : 'A',
        telefon: wert('fTelefon').length > 0,
        rueckruf: radio('rueckruf'),
      };
      try { sessionStorage.setItem('ic-danke', JSON.stringify(danke)); } catch (e) { /* egal */ }
      abgeschlossen = true;
      location.href = '/danke-verkauf/';
    }).catch(function (err) {
      weiter.disabled = false;
      zeichneKontakt();
      zeigeFehler((err && err.message) || 'Das hat leider nicht geklappt.');
    });
  }

  function speichern() {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({
        schritt: schritt,
        weg: weg,
        adresseStand: adresseStand,
        lage: lage,
        bewertung: bewertung,
        gestartet: gestartet,
        felder: {
          strasse: wert('fStrasse'), nr: wert('fNr'), plz: wert('fPlz'), ort: wert('fOrt'),
          flaeche: wert('fFlaeche'), grund: wert('fGrund'), baujahr: wert('fBaujahr'),
          we: wert('fWe'), weHaus: wert('fWeHaus'), leer: wert('fLeer'), miete: wert('fMiete'),
          gewerbeProzent: wert('fGewerbeProzent'), gewerbeWe: wert('fGewerbeWe'),
          vorname: wert('fVorname'), email: wert('fEmail'), telefon: wert('fTelefon'),
          art: art(), geschoss: radio('geschoss'), nutzung: radio('nutzung'),
          bauform: radio('bauform'), zustand: radio('zustand'), zustandLand: radio('zustandLand'),
          vorhaben: radio('vorhaben'),
          mods: Array.prototype.map.call(document.querySelectorAll('input[name="mod"]:checked'), function (el) { return el.value; }),
        },
      }));
    } catch (e) { /* Der Schritt läuft trotzdem. */ }
  }

  function wiederherstellen() {
    var roh = null;
    try { roh = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { roh = null; }
    if (!roh || !roh.felder) return false;
    var f = roh.felder;
    $('fStrasse').value = f.strasse || '';
    $('fNr').value = f.nr || '';
    $('fPlz').value = f.plz || '';
    $('fOrt').value = f.ort || 'Köln';
    $('fFlaeche').value = f.flaeche || '';
    $('fGrund').value = f.grund || '';
    $('fBaujahr').value = f.baujahr || '';
    $('fWe').value = f.we || '';
    if ($('fWeHaus')) $('fWeHaus').value = f.weHaus || '';
    $('fLeer').value = f.leer || '';
    $('fMiete').value = f.miete || '';
    if ($('fGewerbeProzent')) $('fGewerbeProzent').value = f.gewerbeProzent || '';
    if ($('fGewerbeWe')) $('fGewerbeWe').value = f.gewerbeWe || '';
    $('fVorname').value = f.vorname || '';
    $('fEmail').value = f.email || '';
    $('fTelefon').value = f.telefon || '';
    if (f.art) setzen('art', f.art);
    if (f.geschoss !== '' && f.geschoss != null) setzen('geschoss', String(f.geschoss));
    if (f.nutzung) setzen('nutzung', f.nutzung);
    if (f.bauform) setzen('bauform', f.bauform);
    if (f.zustand) setzen('zustand', f.zustand);
    if (f.zustandLand) setzen('zustandLand', f.zustandLand);
    if (f.vorhaben) setzen('vorhaben', f.vorhaben);
    (f.mods || []).forEach(function (m) {
      var el = document.querySelector('input[name="mod"][value="' + m + '"]');
      if (el) el.checked = true;
    });
    lage = roh.lage || null;
    bewertung = roh.bewertung || null;
    weg = roh.weg || '';
    adresseStand = roh.adresseStand || '';
    gestartet = !!roh.gestartet;
    if (lage) zeichneBrw();
    zeige(Math.min(roh.schritt || 0, 6));
    return true;
  }

  function adresseAusQuery(text) {
    var teile = String(text || '').trim().split(/\s+/).filter(Boolean);
    var plz = '';
    var index = -1;
    teile.forEach(function (teil, i) {
      if (/^\d{5}$/.test(teil)) { plz = teil; index = i; }
    });
    var rest = index >= 0 ? teile.slice(0, index) : teile.slice();
    var nr = '';
    if (rest.length && /\d/.test(rest[rest.length - 1])) nr = rest.pop();
    return { strasse: rest.join(' '), nr: nr, plz: plz };
  }

  function vorwahlAusUrl() {
    var params = new URLSearchParams(location.search);
    var sammel = params.get('adresse');
    if (sammel) {
      var teile = adresseAusQuery(sammel);
      if (teile.strasse) $('fStrasse').value = teile.strasse;
      if (teile.nr) $('fNr').value = teile.nr;
      if (teile.plz) $('fPlz').value = teile.plz;
    }
    if (params.get('strasse')) $('fStrasse').value = params.get('strasse');
    if (params.get('nr')) $('fNr').value = params.get('nr');
    if (params.get('plz')) $('fPlz').value = params.get('plz');
    if (params.get('ort')) $('fOrt').value = params.get('ort');
    if (params.get('art')) setzen('art', params.get('art'));
    var vorhaben = params.get('vorhaben') || (params.get('anlass') === 'erbe' ? 'erbe' : '');
    if (vorhaben) setzen('vorhaben', vorhaben);
    if (params.get('zustand')) setzen('zustand', params.get('zustand'));
    if (params.get('nutzung')) setzen('nutzung', params.get('nutzung'));
    if (params.get('bauform')) setzen('bauform', params.get('bauform'));
  }

  document.getElementById('funnel').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!weiter.disabled) weiter.click();
  });

  weiter.addEventListener('click', function () {
    var meldung = validiereAktuell();
    if (meldung) { zeigeFehler(meldung); return; }
    track('funnel_step_complete', { step: schritt + 1 });
    if (schritt === 0 && adresseKey() !== adresseStand) {
      ladeLage();
      return;
    }
    if (schritt === 4) {
      var plan = vorhabenWerte();
      track('funnel_anlass', { anlass: plan.anlass === 'erbe' ? 'erbe' : plan.zeitpunkt === 'jetzt' ? 'jetzt' : plan.zeitpunkt === 'monate12' ? '12m' : 'nur_wert' });
      ladeBewertung().then(function () { zeige(5); });
      return;
    }
    if (schritt === 6) { senden(); return; }
    zeige(schritt + 1);
  });

  zurueck.addEventListener('click', function () {
    if (schritt > 0) zeige(schritt - 1);
  });

  $('wahlKauf').addEventListener('click', function () { weg = 'ankauf'; track('funnel_weg', { weg: 'direktankauf' }); zeige(6); });
  $('wahlMakler').addEventListener('click', function () { weg = 'makler'; track('funnel_weg', { weg: 'makler' }); zeige(6); });
  $('wahlAuswertung').addEventListener('click', function () { weg = 'auswertung'; track('funnel_weg', { weg: 'nur_auswertung' }); zeige(6); });
  $('wegAendern').addEventListener('click', function () { zeige(5); });
  $('fTelefon').addEventListener('input', telefonZeilen);
  document.querySelectorAll('input[name="art"]').forEach(function (el) {
    el.addEventListener('change', detailsFuerArt);
  });
  document.querySelectorAll('input[name="mod"]').forEach(function (el) {
    el.addEventListener('change', function () {
      if (el.value === 'nichts' && el.checked) {
        document.querySelectorAll('input[name="mod"]').forEach(function (andere) {
          if (andere !== el) andere.checked = false;
        });
      } else if (el.checked) {
        var nichts = document.querySelector('input[name="mod"][value="nichts"]');
        if (nichts) nichts.checked = false;
      }
    });
  });

  window.addEventListener('pagehide', function () {
    if (!abgeschlossen && schritt < 6) track('funnel_abort', { letzter_step: schritt + 1 });
  });

  fetch('/api/konfig').then(function (antwort) { return antwort.json(); }).then(function (daten) {
    uploadAn = !!(daten && daten.upload);
    uploadZeigen();
  }).catch(function () { uploadAn = false; });

  if (/[?&](adresse|art|vorhaben|anlass)=/.test(location.search)) {
    try { sessionStorage.removeItem(KEY); } catch (e) { /* egal */ }
  }
  vorwahlAusUrl();
  if (!wiederherstellen()) zeige(0);
  telefonZeilen();
})();
