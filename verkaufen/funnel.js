/* Verkäufer-Funnel. Kein Tracking, kein Autocomplete.
   Fortschritt liegt im sessionStorage, damit ein Reload den Schritt nicht verwirft.
   Das ist für den angeforderten Ablauf nötig und wird beim Absenden gelöscht. */
(function () {
  'use strict';

  var SCHRITTE = ['adresse', 'art', 'details', 'zustand', 'anlass', 'ergebnis', 'kontakt', 'danke'];
  var NAMEN = ['Adresse', 'Objektart', 'Eckdaten', 'Zustand', 'Anlass', 'Spanne', 'Kontakt', 'Danke'];
  var KEY = 'ic-verkauf-funnel';
  var schritt = 0;
  var lage = null;
  var bewertung = null;
  var weg = '';
  var adresseStand = '';

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
  function art() { return radio('art'); }

  function zeigeFehler(text) {
    fehler.textContent = text || '';
  }

  function adresseKey() {
    return [wert('fStrasse'), wert('fNr'), wert('fPlz'), wert('fOrt')].join('|').toLowerCase();
  }

  function detailsFuerArt() {
    var a = art();
    document.querySelectorAll('[data-fuer]').forEach(function (el) {
      el.hidden = el.getAttribute('data-fuer').split(/\s+/).indexOf(a) === -1;
    });
  }

  function telefonZeilen() {
    var hat = wert('fTelefon').length > 0;
    var block = $('rueckrufBlock');
    if (block) block.hidden = !hat;
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
      titel.textContent = 'Bodenrichtwert hier: ' + euroQm(brw.wert);
    } else {
      titel.textContent = 'Kein Bodenrichtwert in den Wohnlagen-Layern';
    }
    box.appendChild(titel);
    var zeile = document.createElement('p');
    var teile = [];
    if (brw) {
      if (brw.ortsteil) teile.push(brw.ortsteil);
      if (brw.gemeinde) teile.push(brw.gemeinde);
      if (brw.nutzung) teile.push('Nutzung ' + brw.nutzung);
      if (brw.geschosszahl) teile.push('Geschosszahl ' + brw.geschosszahl);
      if (brw.gfz) teile.push('GFZ ' + brw.gfz);
      if (brw.zone) teile.push('Zone ' + brw.zone);
      if (brw.stichtag) teile.push('Stichtag ' + brw.stichtag);
    }
    teile.push('Quelle: BORIS.NRW');
    zeile.textContent = teile.filter(Boolean).join(' · ');
    box.appendChild(zeile);
    if (brw && brw.gutachterausschuss) {
      var g = document.createElement('p');
      g.textContent = brw.gutachterausschuss + '. Datenlizenz Deutschland – Zero – Version 2.0.';
      box.appendChild(g);
    }
    if (lage.hinweis) {
      var h = document.createElement('p');
      h.textContent = lage.hinweis;
      box.appendChild(h);
    }
    box.scrollIntoView({ block: 'nearest' });
  }

  function tendenzSatz(t) {
    if (t === 'unten') return 'Nach deinen Angaben zum Zustand eher am unteren Ende der Spanne.';
    if (t === 'oben') return 'Nach deinen Angaben zum Zustand eher am oberen Ende der Spanne.';
    return '';
  }

  function zeichneErgebnis() {
    var box = $('ergebnisInhalt');
    box.replaceChildren();
    if (!bewertung) {
      var warten = document.createElement('p');
      warten.textContent = 'Die Spanne laden wir gerade.';
      box.appendChild(warten);
      return;
    }
    if (bewertung.spanne) {
      var gross = document.createElement('p');
      gross.className = 'spanne';
      gross.textContent = euro(bewertung.spanne.niedrig) + ' – ' + euro(bewertung.spanne.hoch);
      box.appendChild(gross);
      var mitte = document.createElement('p');
      mitte.className = 'mitte';
      mitte.textContent = 'Mitte etwa ' + euro(bewertung.spanne.mitte) + (bewertung.qm ? ' · rund ' + euroQm(bewertung.qm) : '');
      box.appendChild(mitte);
    } else {
      var keine = document.createElement('p');
      keine.className = 'spanne';
      keine.style.fontSize = '1.35rem';
      keine.textContent = 'Keine automatische Spanne';
      box.appendChild(keine);
    }
    var tendenz = tendenzSatz(bewertung.tendenz);
    if (tendenz) {
      var ts = document.createElement('p');
      ts.textContent = tendenz;
      box.appendChild(ts);
    }
    if (bewertung.hinweis) {
      var hi = document.createElement('p');
      hi.textContent = bewertung.hinweis;
      box.appendChild(hi);
    }
    if (bewertung.zeilen && bewertung.zeilen.length) {
      var ul = document.createElement('ul');
      ul.className = 'zeilen';
      bewertung.zeilen.forEach(function (z) {
        var li = document.createElement('li');
        li.textContent = z;
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }
    if (bewertung.brw && bewertung.brw.wert) {
      var b = document.createElement('p');
      b.className = 'quelle';
      b.textContent = 'Bodenrichtwert an dieser Stelle: ' + euroQm(bewertung.brw.wert) + (bewertung.brw.ortsteil ? ' · ' + bewertung.brw.ortsteil : '');
      box.appendChild(b);
    }
    var q = $('quellenZeile');
    q.textContent = (bewertung.quelle || '') + ' Lizenz: ' + (bewertung.lizenz || 'Datenlizenz Deutschland – Zero – Version 2.0') + '.';
    if (bewertung.umrechnung) {
      var link = document.createElement('a');
      link.href = bewertung.umrechnung;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = ' Umrechnungstabelle des Gutachterausschusses (PDF)';
      q.appendChild(link);
    }
  }

  function wegName() {
    return weg === 'makler' ? 'Wir verkaufen für dich als Makler' : 'Wir kaufen direkt';
  }

  function zeichneKontakt() {
    var merke = $('wegText');
    if (merke) merke.textContent = wegName();
  }

  function zeichneDanke() {
    var name = wert('fVorname');
    $('dankeTitel').textContent = name ? 'Danke, ' + name + '.' : 'Danke.';
    $('dankeText').textContent = weg === 'makler'
      ? 'Navid oder Nikan meldet sich innerhalb von 24 Stunden mit einem Vorschlag, wie wir den Verkauf angehen.'
      : 'Du bekommst ein Kaufangebot innerhalb von 48 Stunden. Vorher meldet sich Navid oder Nikan persönlich.';
  }

  function whatsappHref() {
    var meta = document.querySelector('meta[name="ic-whatsapp"]');
    var nummer = meta && meta.content ? meta.content.replace(/\D/g, '') : '';
    if (!nummer || nummer.indexOf('TODO') !== -1) return '';
    var text = 'Hallo, ich habe gerade eine Immobilie auf immocousins.de bewertet.';
    return 'https://wa.me/' + nummer + '?text=' + encodeURIComponent(text);
  }

  function zeige(index) {
    schritt = index;
    SCHRITTE.forEach(function (name, i) {
      var el = document.querySelector('[data-step="' + name + '"]');
      if (el) el.hidden = i !== index;
    });
    label.textContent = 'Schritt ' + (index + 1) + ' von 8 · ' + NAMEN[index];
    balken.style.width = Math.round(((index + 1) / 8) * 100) + '%';
    zurueck.hidden = index === 0 || index === 7;
    nav.hidden = index === 5 || index === 7;
    if (index === 0) weiter.textContent = (lage && adresseKey() === adresseStand) ? 'Weiter' : 'Bodenrichtwert anzeigen';
    else if (index === 4) weiter.textContent = 'Spanne anzeigen';
    else if (index === 6) weiter.textContent = 'Angaben senden';
    else weiter.textContent = 'Weiter';
    zeigeFehler('');
    detailsFuerArt();
    if (index === 5) zeichneErgebnis();
    if (index === 6) zeichneKontakt();
    if (index === 7) zeichneDanke();
    var fokus = document.querySelector('[data-step="' + SCHRITTE[index] + '"] h2');
    if (fokus) fokus.setAttribute('tabindex', '-1'), fokus.focus();
    speichern();
  }

  function objektDaten() {
    var a = art();
    var zustand = a === 'grundstueck' ? radio('zustandLand') : radio('zustand');
    var mods = [];
    document.querySelectorAll('input[name="mod"]:checked').forEach(function (el) { mods.push(el.value); });
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
      we: zahlOderNull('fWe'),
      leerstand: zahlOderNull('fLeer'),
      mieteMonat: zahlOderNull('fMiete'),
      mieteUnbekannt: $('fMieteUnbekannt') ? $('fMieteUnbekannt').checked : false,
      gewerbeanteil: radio('gewerbe') || '0',
      zustand: zustand,
      modernisierung: mods,
      anlass: radio('anlass'),
      zeitpunkt: radio('zeitpunkt'),
      bauform: radio('bauform'),
    };
  }

  function zahlOderNull(id) {
    var roh = wert(id).replace(/\./g, '').replace(',', '.');
    if (!roh) return null;
    var n = Number(roh);
    return isFinite(n) ? n : null;
  }

  function validiereAktuell() {
    if (schritt === 0) {
      if (wert('fStrasse').length < 2) return 'Wie heißt die Straße?';
      if (!wert('fNr')) return 'Die Hausnummer fehlt noch.';
      if (!/^\d{5}$/.test(wert('fPlz'))) return 'Die Postleitzahl braucht fünf Ziffern.';
      if (wert('fOrt').length < 2) return 'In welchem Ort steht das Objekt?';
    }
    if (schritt === 1 && !art()) return 'Wähl eine Objektart.';
    if (schritt === 2) {
      var a = art();
      if (a === 'etw' || a === 'efh') {
        var fl = zahlOderNull('fFlaeche');
        if (!fl || fl < 10) return 'Wie viele Quadratmeter Wohnfläche sind es?';
      }
      if (a === 'mfh') {
        var we = zahlOderNull('fWe');
        if (!we || we < 1) return 'Wie viele Wohnungen hat das Haus?';
        var miete = zahlOderNull('fMiete');
        var unbekannt = $('fMieteUnbekannt').checked;
        var flaeche = zahlOderNull('fFlaeche');
        if (unbekannt && !(flaeche > 30)) return 'Wenn du die Miete nicht weißt, brauchen wir die Wohn- und Nutzfläche.';
        if (!unbekannt && (!miete || miete < 50)) return 'Wie hoch ist die monatliche Nettokaltmiete?';
      }
      if (a === 'grundstueck') {
        var g = zahlOderNull('fGrund');
        if (!g || g < 20) return 'Wie groß ist das Grundstück?';
      }
    }
    if (schritt === 3) {
      var z = art() === 'grundstueck' ? radio('zustandLand') : radio('zustand');
      if (!z) return 'Wie ist der Zustand?';
    }
    if (schritt === 4) {
      if (!radio('anlass')) return 'Was ist der Anlass?';
      if (!radio('zeitpunkt')) return 'Wann soll etwas passieren?';
    }
    if (schritt === 6) {
      if (wert('fVorname').length < 2) return 'Wie dürfen wir dich ansprechen?';
      if (wert('fEmail').indexOf('@') < 1) return 'Die E-Mail-Adresse fehlt oder ist unvollständig.';
      if (!$('fDsgvo').checked) return 'Bitte den Datenschutzhinweis bestätigen.';
      if (wert('fTelefon') && !$('fTelefonJa').checked) return 'Für einen Anruf brauchen wir eine eigene Einwilligung. Sonst lass die Nummer leer.';
      if (!weg) return 'Wähl noch, ob wir kaufen oder verkaufen sollen.';
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
    var alt = weiter.textContent;
    weiter.textContent = 'Bodenrichtwert wird geladen …';
    zeigeFehler('');
    return post('/api/lage', {
      strasse: wert('fStrasse'),
      hausnummer: wert('fNr'),
      plz: wert('fPlz'),
      ort: wert('fOrt') || 'Köln',
    }).then(function (daten) {
      weiter.disabled = false;
      weiter.textContent = alt;
      if (!daten || !daten.ok) {
        zeigeFehler((daten && daten.fehler) || 'Der Bodenrichtwert antwortet gerade nicht.');
        return false;
      }
      lage = daten;
      adresseStand = adresseKey();
      zeichneBrw();
      weiter.textContent = 'Weiter';
      speichern();
      return true;
    }).catch(function () {
      weiter.disabled = false;
      weiter.textContent = 'Bodenrichtwert anzeigen';
      zeigeFehler('Das hat gerade nicht geklappt. Versuch es noch einmal.');
      return false;
    });
  }

  function ladeBewertung() {
    weiter.disabled = true;
    weiter.textContent = 'Spanne wird gerechnet …';
    var daten = objektDaten();
    return post('/api/bewertung', daten).then(function (antwort) {
      weiter.disabled = false;
      if (!antwort || !antwort.ok) {
        bewertung = {
          spanne: null,
          hinweis: (antwort && antwort.fehler) || 'Die Spanne können wir gerade nicht automatisch rechnen. Schick uns die Angaben trotzdem.',
          zeilen: [],
          disclaimer: '',
          brw: lage && lage.brw,
        };
      } else {
        bewertung = antwort;
      }
      zeichneErgebnis();
      return true;
    }).catch(function () {
      weiter.disabled = false;
      bewertung = {
        spanne: null,
        hinweis: 'Die Spanne können wir gerade nicht automatisch rechnen. Schick uns die Angaben trotzdem, wir melden uns in 48 Stunden.',
        zeilen: [],
        brw: lage && lage.brw,
      };
      return true;
    });
  }

  function senden() {
    weiter.disabled = true;
    weiter.textContent = 'Wird gesendet …';
    var body = {
      quelle: 'verkauf',
      typ: 'verkaeufer',
      vorname: wert('fVorname'),
      email: wert('fEmail'),
      telefon: wert('fTelefon'),
      telefonEinwilligung: $('fTelefonJa').checked,
      einwilligung: $('fDsgvo').checked,
      rueckruf: radio('rueckruf'),
      weg: weg,
      website: wert('fWebsite'),
      objekt: objektDaten(),
      mehrgeschossig: lage && lage.mehrgeschossig,
      einZweifamilien: lage && lage.einZweifamilien,
      irw: bewertung && bewertung.irw,
    };
    return post('/api/lead', body).then(function (antwort) {
      weiter.disabled = false;
      if (!antwort || !antwort.ok) {
        zeigeFehler((antwort && antwort.fehler) || 'Das hat leider nicht geklappt. Schreib uns auf Instagram @immo.cousins.');
        weiter.textContent = 'Angaben senden';
        return;
      }
      try { sessionStorage.removeItem(KEY); } catch (e) { /* egal */ }
      var wa = $('dankeWhatsapp');
      var href = whatsappHref();
      if (href) {
        wa.href = href;
        wa.hidden = false;
      } else {
        wa.hidden = true;
      }
      zeige(7);
    }).catch(function () {
      weiter.disabled = false;
      weiter.textContent = 'Angaben senden';
      zeigeFehler('Das hat leider nicht geklappt. Schreib uns auf Instagram @immo.cousins.');
    });
  }

  function speichern() {
    if (schritt === 7) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({
        schritt: schritt,
        weg: weg,
        adresseStand: adresseStand,
        lage: lage,
        bewertung: bewertung,
        felder: {
          strasse: wert('fStrasse'), nr: wert('fNr'), plz: wert('fPlz'), ort: wert('fOrt'),
          flaeche: wert('fFlaeche'), grund: wert('fGrund'), baujahr: wert('fBaujahr'),
          we: wert('fWe'), leer: wert('fLeer'), miete: wert('fMiete'),
          mieteUnbekannt: $('fMieteUnbekannt') && $('fMieteUnbekannt').checked,
          vorname: wert('fVorname'), email: wert('fEmail'), telefon: wert('fTelefon'),
          art: art(), geschoss: radio('geschoss'), nutzung: radio('nutzung'),
          gewerbe: radio('gewerbe'), bauform: radio('bauform'),
          zustand: radio('zustand'), zustandLand: radio('zustandLand'),
          anlass: radio('anlass'), zeitpunkt: radio('zeitpunkt'),
          mods: Array.prototype.map.call(document.querySelectorAll('input[name="mod"]:checked'), function (el) { return el.value; }),
        },
      }));
    } catch (e) { /* Speicher voll oder blockiert: der Schritt läuft trotzdem */ }
  }

  function wiederherstellen() {
    var roh = null;
    try { roh = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { roh = null; }
    if (!roh || !roh.felder) return;
    var f = roh.felder;
    $('fStrasse').value = f.strasse || '';
    $('fNr').value = f.nr || '';
    $('fPlz').value = f.plz || '';
    $('fOrt').value = f.ort || 'Köln';
    $('fFlaeche').value = f.flaeche || '';
    $('fGrund').value = f.grund || '';
    $('fBaujahr').value = f.baujahr || '';
    $('fWe').value = f.we || '';
    $('fLeer').value = f.leer || '';
    $('fMiete').value = f.miete || '';
    $('fMieteUnbekannt').checked = !!f.mieteUnbekannt;
    $('fVorname').value = f.vorname || '';
    $('fEmail').value = f.email || '';
    $('fTelefon').value = f.telefon || '';
    if (f.art) setzen('art', f.art);
    if (f.geschoss !== '') setzen('geschoss', String(f.geschoss));
    if (f.nutzung) setzen('nutzung', f.nutzung);
    if (f.gewerbe) setzen('gewerbe', f.gewerbe);
    if (f.bauform) setzen('bauform', f.bauform);
    if (f.zustand) setzen('zustand', f.zustand);
    if (f.zustandLand) setzen('zustandLand', f.zustandLand);
    if (f.anlass) setzen('anlass', f.anlass);
    if (f.zeitpunkt) setzen('zeitpunkt', f.zeitpunkt);
    (f.mods || []).forEach(function (m) {
      var el = document.querySelector('input[name="mod"][value="' + m + '"]');
      if (el) el.checked = true;
    });
    lage = roh.lage || null;
    bewertung = roh.bewertung || null;
    weg = roh.weg || '';
    adresseStand = roh.adresseStand || '';
    if (lage) zeichneBrw();
    var params = new URLSearchParams(location.search);
    if (params.get('art')) setzen('art', params.get('art'));
    if (params.get('anlass')) setzen('anlass', params.get('anlass'));
    var ziel = Math.min(roh.schritt || 0, 6);
    zeige(ziel);
  }

  function vorwahlAusUrl() {
    var params = new URLSearchParams(location.search);
    if (params.get('art')) setzen('art', params.get('art'));
    if (params.get('anlass')) setzen('anlass', params.get('anlass'));
  }

  document.getElementById('funnel').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!weiter.disabled) weiter.click();
  });

  weiter.addEventListener('click', function () {
    var meldung = validiereAktuell();
    if (meldung) { zeigeFehler(meldung); return; }
    if (schritt === 0 && adresseKey() !== adresseStand) {
      ladeLage();
      return;
    }
    if (schritt === 4) {
      ladeBewertung().then(function () { zeige(5); });
      return;
    }
    if (schritt === 6) { senden(); return; }
    zeige(schritt + 1);
  });

  zurueck.addEventListener('click', function () {
    if (schritt > 0) zeige(schritt - 1);
  });

  $('wahlKauf').addEventListener('click', function () { weg = 'ankauf'; zeige(6); });
  $('wahlMakler').addEventListener('click', function () { weg = 'makler'; zeige(6); });
  $('wegAendern').addEventListener('click', function () { zeige(5); });
  $('fTelefon').addEventListener('input', telefonZeilen);
  document.querySelectorAll('input[name="art"]').forEach(function (el) {
    el.addEventListener('change', detailsFuerArt);
  });
  ['fStrasse', 'fNr', 'fPlz', 'fOrt'].forEach(function (id) {
    $(id).addEventListener('input', function () {
      if (adresseKey() !== adresseStand) {
        weiter.textContent = 'Bodenrichtwert anzeigen';
      }
    });
  });

  var neu = $('neuStarten');
  if (neu) neu.addEventListener('click', function () {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    location.href = location.pathname;
  });

  vorwahlAusUrl();
  wiederherstellen();
  if (!sessionStorage.getItem(KEY)) zeige(0);
  telefonZeilen();
})();
