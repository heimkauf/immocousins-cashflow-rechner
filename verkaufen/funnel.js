/* Verkäufer-Funnel. Kein Tracking, kein Autocomplete.
   Fortschritt liegt im sessionStorage, damit ein Reload den Schritt nicht verwirft.
   Das ist für den angeforderten Ablauf nötig und wird beim Absenden gelöscht. */
(function () {
  'use strict';

  var KEY = 'ic-verkauf-funnel-v2';
  var AUTO = {
    art: 1, geschoss: 1, bauform: 1, nutzung: 1, gewerbe: 1,
    leer: 1, zustand: 1, zustandLand: 1, anlass: 1, zeitpunkt: 1,
  };
  var TITEL = {
    adresse: 'Adresse', art: 'Objekt', flaeche: 'Fläche', we: 'Wohnungen',
    grund: 'Grundstück', geschoss: 'Geschoss', bauform: 'Bauform', miete: 'Miete',
    nutzung: 'Nutzung', gewerbe: 'Gewerbe', leer: 'Leerstand', zustand: 'Zustand',
    zustandLand: 'Grundstück', anlass: 'Anlass', zeitpunkt: 'Zeitpunkt',
    ergebnis: 'Spanne', kontakt: 'Kontakt', danke: 'Fertig',
  };

  var aktuell = 'adresse';
  var lage = null;
  var bewertung = null;
  var weg = '';
  var adresseStand = '';
  var timer = 0;
  var ruhe = false;
  var erster = true;

  var label = document.getElementById('schrittLabel');
  var balken = document.getElementById('fortschrittBalken');
  var fortschritt = document.getElementById('fortschritt');
  var fehler = document.getElementById('funnelFehler');
  var nav = document.getElementById('funnelNav');
  var weiter = document.getElementById('weiter');
  var zurueck = document.getElementById('zurueck');
  var form = document.getElementById('funnel');

  function $(id) { return document.getElementById(id); }
  function wert(id) {
    var el = $(id);
    return el ? String(el.value || '').trim() : '';
  }
  function radio(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }
  function setzen(name, value) {
    if (value == null || value === '') return;
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
  function zeigeFehler(text) { fehler.textContent = text || ''; }
  function adresseKey() {
    return [wert('fStrasse'), wert('fNr'), wert('fPlz'), wert('fOrt')].join('|').toLowerCase();
  }
  function zahlOderNull(id) {
    var roh = wert(id).replace(/\./g, '').replace(',', '.');
    if (!roh) return null;
    var n = Number(roh);
    return isFinite(n) ? n : null;
  }
  function mieteUnbekannt() {
    return $('fMieteUnbekannt') ? $('fMieteUnbekannt').checked : false;
  }

  function liste() {
    var a = art();
    var s = ['adresse', 'art'];
    if (a === 'etw') s.push('flaeche', 'geschoss', 'nutzung', 'zustand');
    else if (a === 'efh') s.push('flaeche', 'bauform', 'nutzung', 'zustand');
    else if (a === 'mfh') {
      s.push('we', 'miete');
      if (mieteUnbekannt()) s.push('flaeche');
      s.push('gewerbe', 'leer', 'zustand');
    } else if (a === 'grundstueck') s.push('grund', 'zustandLand');
    s.push('anlass', 'zeitpunkt', 'ergebnis', 'kontakt', 'danke');
    return s;
  }

  function hatWahl(name) {
    if (name === 'leer') return radio('leerwahl') !== '';
    if (name === 'zustand') return radio('zustand') !== '';
    if (name === 'zustandLand') return radio('zustandLand') !== '';
    if (name === 'art') return art() !== '';
    return radio(name) !== '';
  }

  function telefonZeilen() {
    var block = $('rueckrufBlock');
    if (block) block.hidden = wert('fTelefon').length === 0;
  }

  function flaecheLabel() {
    var el = $('flaecheLbl');
    if (!el) return;
    el.textContent = art() === 'mfh' ? 'Wohn- und Nutzfläche in m²' : 'Wohnfläche in m²';
  }

  function mieteHinweis() {
    var el = $('mieteHinweis');
    if (el) el.hidden = !mieteUnbekannt();
  }

  function zeichneBrw() {
    var box = $('brwBox');
    if (!box) return;
    box.replaceChildren();
    if (!lage) { box.hidden = true; return; }
    box.hidden = false;
    var brw = lage.brw;
    var kicker = document.createElement('p');
    kicker.className = 'brw-kicker';
    kicker.textContent = 'Bodenrichtwert';
    var gross = document.createElement('p');
    gross.className = 'brw-wert';
    gross.textContent = brw && brw.wert ? euroQm(brw.wert) : 'Kein Wohnlagen-Wert';
    var meta = document.createElement('p');
    meta.className = 'brw-meta';
    var teile = [];
    if (brw) {
      if (brw.ortsteil) teile.push(brw.ortsteil);
      if (brw.gemeinde) teile.push(brw.gemeinde);
      if (brw.nutzung) teile.push(brw.nutzung);
      if (brw.geschosszahl) teile.push(brw.geschosszahl + ' Geschosse');
      if (brw.zone) teile.push('Zone ' + brw.zone);
    }
    teile.push('BORIS.NRW');
    meta.textContent = teile.filter(Boolean).join(' · ');
    box.append(kicker, gross, meta);
  }

  function tendenzSatz(t) {
    if (t === 'unten') return 'Eher am unteren Ende der Spanne.';
    if (t === 'oben') return 'Eher am oberen Ende der Spanne.';
    return '';
  }

  function zeichneErgebnis() {
    var box = $('ergebnisInhalt');
    if (!box) return;
    box.replaceChildren();
    if (!bewertung) return;
    if (bewertung.spanne) {
      var gross = document.createElement('p');
      gross.className = 'spanne';
      gross.textContent = euro(bewertung.spanne.niedrig) + ' – ' + euro(bewertung.spanne.hoch);
      var mitte = document.createElement('p');
      mitte.className = 'mitte';
      mitte.textContent = 'Mitte etwa ' + euro(bewertung.spanne.mitte) + (bewertung.qm ? ' · ' + euroQm(bewertung.qm) : '');
      var range = document.createElement('div');
      range.className = 'range';
      var track = document.createElement('div');
      track.className = 'range-track';
      var fill = document.createElement('div');
      fill.className = 'range-fill';
      var punkt = document.createElement('div');
      punkt.className = 'range-punkt';
      var pos = 50;
      var sp = bewertung.spanne;
      if (sp.hoch > sp.niedrig) {
        pos = ((sp.mitte - sp.niedrig) / (sp.hoch - sp.niedrig)) * 100;
        pos = Math.max(8, Math.min(92, pos));
      }
      punkt.style.left = pos + '%';
      track.append(fill, punkt);
      var werte = document.createElement('div');
      werte.className = 'range-werte';
      [euro(sp.niedrig), euro(sp.mitte), euro(sp.hoch)].forEach(function (text, i) {
        var span = document.createElement(i === 1 ? 'b' : 'span');
        span.textContent = text;
        werte.appendChild(span);
      });
      range.append(track, werte);
      box.append(gross, mitte, range);
      var tendenz = tendenzSatz(bewertung.tendenz);
      if (tendenz) {
        var ts = document.createElement('p');
        ts.className = 'mitte';
        ts.textContent = tendenz;
        box.appendChild(ts);
      }
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { range.classList.add('ist-da'); });
      });
    } else {
      var keine = document.createElement('p');
      keine.className = 'spanne';
      keine.textContent = 'Keine automatische Spanne';
      box.appendChild(keine);
      if (bewertung.hinweis) {
        var hi = document.createElement('p');
        hi.className = 'mitte';
        hi.textContent = bewertung.hinweis;
        box.appendChild(hi);
      }
    }
    var extra = [];
    if (bewertung.spanne && bewertung.hinweis) extra.push(bewertung.hinweis);
    if (bewertung.zeilen && bewertung.zeilen.length) extra = extra.concat(bewertung.zeilen);
    if (bewertung.brw && bewertung.brw.wert) {
      extra.push('Bodenrichtwert ' + euroQm(bewertung.brw.wert) + (bewertung.brw.ortsteil ? ' · ' + bewertung.brw.ortsteil : ''));
    }
    if (extra.length) {
      var details = document.createElement('details');
      details.className = 'klein';
      var summary = document.createElement('summary');
      summary.textContent = 'So gerechnet';
      var ul = document.createElement('ul');
      extra.forEach(function (z) {
        var li = document.createElement('li');
        li.textContent = z;
        ul.appendChild(li);
      });
      details.append(summary, ul);
      box.appendChild(details);
    }
    var q = $('quellenZeile');
    if (q) {
      q.textContent = (bewertung.quelle || 'Quelle: BORIS.NRW.') + ' Lizenz: ' + (bewertung.lizenz || 'Datenlizenz Deutschland – Zero – Version 2.0') + '.';
      if (bewertung.umrechnung) {
        var link = document.createElement('a');
        link.href = bewertung.umrechnung;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = ' Umrechnungstabelle (PDF)';
        q.appendChild(link);
      }
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
      ? 'Navid oder Nikan meldet sich innerhalb von 24 Stunden.'
      : 'Kaufangebot innerhalb von 48 Stunden. Vorher meldet sich Navid oder Nikan.';
  }
  function whatsappHref() {
    var meta = document.querySelector('meta[name="ic-whatsapp"]');
    var nummer = meta && meta.content ? meta.content.replace(/\D/g, '') : '';
    if (!nummer || nummer.indexOf('TODO') !== -1) return '';
    var text = 'Hallo, ich habe gerade eine Immobilie auf immocousins.de bewertet.';
    return 'https://wa.me/' + nummer + '?text=' + encodeURIComponent(text);
  }

  function zeige(name) {
    var folge = liste();
    if (folge.indexOf(name) === -1) name = 'adresse';
    aktuell = name;
    document.body.classList.toggle('im-fluss', name !== 'adresse');
    document.querySelectorAll('[data-step]').forEach(function (el) {
      el.hidden = el.getAttribute('data-step') !== name;
    });
    var sichtbar = folge.filter(function (s) { return s !== 'danke'; });
    var pos = sichtbar.indexOf(name);
    if (pos < 0) pos = sichtbar.length - 1;
    var max = sichtbar.length;
    label.textContent = (TITEL[name] || '') + ' · ' + (pos + 1) + ' / ' + max;
    balken.style.width = Math.round(((pos + 1) / max) * 100) + '%';
    if (fortschritt) {
      fortschritt.setAttribute('aria-valuemax', String(max));
      fortschritt.setAttribute('aria-valuenow', String(Math.min(pos + 1, max)));
    }
    var auto = !!AUTO[name];
    zurueck.hidden = name === 'adresse' || name === 'danke';
    weiter.hidden = name === 'ergebnis' || name === 'danke' || (auto && !hatWahl(name));
    nav.hidden = name === 'ergebnis' || name === 'danke';
    if (name === 'adresse') weiter.textContent = (lage && adresseKey() === adresseStand) ? 'Weiter' : 'Bodenrichtwert anzeigen';
    else if (name === 'zeitpunkt') weiter.textContent = 'Spanne anzeigen';
    else if (name === 'kontakt') weiter.textContent = 'Angaben senden';
    else weiter.textContent = 'Weiter';
    zeigeFehler('');
    flaecheLabel();
    mieteHinweis();
    if (name === 'ergebnis') zeichneErgebnis();
    if (name === 'kontakt') zeichneKontakt();
    if (name === 'danke') zeichneDanke();
    if (!erster) {
      var fokus = document.querySelector('[data-step="' + name + '"] h2');
      if (fokus) { fokus.setAttribute('tabindex', '-1'); fokus.focus(); }
    }
    erster = false;
    speichern();
  }

  function naechster() {
    var folge = liste();
    var i = folge.indexOf(aktuell);
    return i >= 0 ? folge[i + 1] : '';
  }
  function vorher() {
    var folge = liste();
    var i = folge.indexOf(aktuell);
    return i > 0 ? folge[i - 1] : '';
  }

  function objektDaten() {
    var a = art();
    var g = radio('geschoss');
    var leerWahl = radio('leerwahl');
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
      geschoss: g === '' || g === 'egal' ? null : Number(g),
      nutzung: radio('nutzung'),
      we: zahlOderNull('fWe'),
      leerstand: leerWahl !== '' ? Number(leerWahl) : zahlOderNull('fLeer'),
      mieteMonat: zahlOderNull('fMiete'),
      mieteUnbekannt: mieteUnbekannt(),
      gewerbeanteil: radio('gewerbe') || '0',
      zustand: a === 'grundstueck' ? radio('zustandLand') : radio('zustand'),
      modernisierung: [],
      anlass: radio('anlass'),
      zeitpunkt: radio('zeitpunkt'),
      bauform: radio('bauform'),
    };
  }

  function validiere(name) {
    if (name === 'adresse') {
      if (wert('fStrasse').length < 2) return 'Wie heißt die Straße?';
      if (!wert('fNr')) return 'Die Hausnummer fehlt noch.';
      if (!/^\d{5}$/.test(wert('fPlz'))) return 'Die Postleitzahl braucht fünf Ziffern.';
      if (wert('fOrt').length < 2) return 'In welchem Ort steht das Objekt?';
    }
    if (name === 'art' && !art()) return 'Wähl eine Objektart.';
    if (name === 'flaeche') {
      var fl = zahlOderNull('fFlaeche');
      var min = art() === 'mfh' ? 30 : 10;
      if (!fl || fl < min) return art() === 'mfh' ? 'Wie viele Quadratmeter Wohn- und Nutzfläche?' : 'Wie viele Quadratmeter Wohnfläche?';
    }
    if (name === 'we') {
      var we = zahlOderNull('fWe');
      if (!we || we < 1) return 'Wie viele Wohnungen hat das Haus?';
    }
    if (name === 'grund') {
      var g = zahlOderNull('fGrund');
      if (!g || g < 20) return 'Wie groß ist das Grundstück?';
    }
    if (name === 'geschoss' && radio('geschoss') === '') return 'Welches Geschoss?';
    if (name === 'bauform' && !radio('bauform')) return 'Frei stehend oder Reihe?';
    if (name === 'miete') {
      if (!mieteUnbekannt()) {
        var miete = zahlOderNull('fMiete');
        if (!miete || miete < 50) return 'Wie hoch ist die monatliche Nettokaltmiete?';
      }
    }
    if (name === 'nutzung' && !radio('nutzung')) return 'Wie wird sie genutzt?';
    if (name === 'gewerbe' && !radio('gewerbe')) return 'Wie viel Gewerbe steckt drin?';
    if (name === 'leer' && radio('leerwahl') === '') return 'Steht etwas leer?';
    if (name === 'zustand' && !radio('zustand')) return 'Wie ist der Zustand?';
    if (name === 'zustandLand' && !radio('zustandLand')) return 'Wie ist das Grundstück?';
    if (name === 'anlass' && !radio('anlass')) return 'Was ist der Anlass?';
    if (name === 'zeitpunkt' && !radio('zeitpunkt')) return 'Wann soll etwas passieren?';
    if (name === 'kontakt') {
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
    weiter.textContent = 'Wird geladen …';
    zeigeFehler('');
    return post('/api/lage', {
      strasse: wert('fStrasse'),
      hausnummer: wert('fNr'),
      plz: wert('fPlz'),
      ort: wert('fOrt') || 'Köln',
    }).then(function (daten) {
      weiter.disabled = false;
      if (!daten || !daten.ok) {
        weiter.textContent = 'Bodenrichtwert anzeigen';
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
    return post('/api/bewertung', objektDaten()).then(function (antwort) {
      weiter.disabled = false;
      bewertung = (antwort && antwort.ok) ? antwort : {
        spanne: null,
        hinweis: (antwort && antwort.fehler) || 'Die Spanne können wir gerade nicht automatisch rechnen. Schick uns die Angaben trotzdem.',
        zeilen: [],
        brw: lage && lage.brw,
      };
      return true;
    }).catch(function () {
      weiter.disabled = false;
      bewertung = {
        spanne: null,
        hinweis: 'Die Spanne können wir gerade nicht automatisch rechnen. Schick uns die Angaben trotzdem.',
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
      if (wa) {
        if (href) { wa.href = href; wa.hidden = false; }
        else wa.hidden = true;
      }
      zeige('danke');
    }).catch(function () {
      weiter.disabled = false;
      weiter.textContent = 'Angaben senden';
      zeigeFehler('Das hat leider nicht geklappt. Schreib uns auf Instagram @immo.cousins.');
    });
  }

  function geheWeiter() {
    clearTimeout(timer);
    var meldung = validiere(aktuell);
    if (meldung) { zeigeFehler(meldung); return; }
    if (aktuell === 'adresse' && adresseKey() !== adresseStand) { ladeLage(); return; }
    if (aktuell === 'zeitpunkt') {
      ladeBewertung().then(function () { zeige('ergebnis'); });
      return;
    }
    if (aktuell === 'kontakt') { senden(); return; }
    var n = naechster();
    if (n) zeige(n);
  }

  function planWeiter() {
    clearTimeout(timer);
    var name = aktuell;
    var ms = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180;
    timer = setTimeout(function () {
      if (aktuell !== name) return;
      geheWeiter();
    }, ms);
  }

  function speichern() {
    if (aktuell === 'danke') return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify({
        schrittName: aktuell,
        weg: weg,
        adresseStand: adresseStand,
        lage: lage,
        bewertung: bewertung,
        felder: {
          strasse: wert('fStrasse'), nr: wert('fNr'), plz: wert('fPlz'), ort: wert('fOrt'),
          flaeche: wert('fFlaeche'), grund: wert('fGrund'), baujahr: wert('fBaujahr'),
          we: wert('fWe'), leer: wert('fLeer'), miete: wert('fMiete'),
          mieteUnbekannt: mieteUnbekannt(),
          vorname: wert('fVorname'), email: wert('fEmail'), telefon: wert('fTelefon'),
          art: art(), geschoss: radio('geschoss'), nutzung: radio('nutzung'),
          gewerbe: radio('gewerbe'), bauform: radio('bauform'),
          zustand: radio('zustand'), zustandLand: radio('zustandLand'),
          anlass: radio('anlass'), zeitpunkt: radio('zeitpunkt'),
          leerwahl: radio('leerwahl'),
        },
      }));
    } catch (e) { /* Speicher voll oder blockiert */ }
  }

  function ausUrl() {
    var p = new URLSearchParams(location.search);
    if (p.get('strasse')) $('fStrasse').value = p.get('strasse');
    if (p.get('nr')) $('fNr').value = p.get('nr');
    if (p.get('plz')) $('fPlz').value = p.get('plz');
    if (p.get('ort')) $('fOrt').value = p.get('ort');
    if (p.get('art')) setzen('art', p.get('art'));
    if (p.get('anlass')) setzen('anlass', p.get('anlass'));
  }

  function wiederherstellen() {
    var roh = null;
    try { roh = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { roh = null; }
    if (!roh || !roh.felder) return false;
    ruhe = true;
    var f = roh.felder;
    $('fStrasse').value = f.strasse || '';
    $('fNr').value = f.nr || '';
    $('fPlz').value = f.plz || '';
    $('fOrt').value = f.ort || 'Köln';
    $('fFlaeche').value = f.flaeche || '';
    $('fGrund').value = f.grund || '';
    if ($('fBaujahr')) $('fBaujahr').value = f.baujahr || '';
    $('fWe').value = f.we || '';
    if ($('fLeer')) $('fLeer').value = f.leer || '';
    $('fMiete').value = f.miete || '';
    $('fMieteUnbekannt').checked = !!f.mieteUnbekannt;
    $('fVorname').value = f.vorname || '';
    $('fEmail').value = f.email || '';
    $('fTelefon').value = f.telefon || '';
    setzen('art', f.art);
    setzen('geschoss', f.geschoss);
    setzen('nutzung', f.nutzung);
    setzen('gewerbe', f.gewerbe);
    setzen('bauform', f.bauform);
    setzen('zustand', f.zustand);
    setzen('zustandLand', f.zustandLand);
    setzen('anlass', f.anlass);
    setzen('zeitpunkt', f.zeitpunkt);
    setzen('leerwahl', f.leerwahl);
    ruhe = false;
    lage = roh.lage || null;
    bewertung = roh.bewertung || null;
    weg = roh.weg || '';
    adresseStand = roh.adresseStand || '';
    if (lage) zeichneBrw();
    var ziel = roh.schrittName || 'adresse';
    if (ziel === 'kontakt' && !weg) ziel = 'ergebnis';
    if (liste().indexOf(ziel) === -1) ziel = 'adresse';
    zeige(ziel);
    return true;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!weiter.disabled && !weiter.hidden) geheWeiter();
  });
  weiter.addEventListener('click', geheWeiter);
  zurueck.addEventListener('click', function () {
    clearTimeout(timer);
    var v = vorher();
    if (v) zeige(v);
  });
  form.addEventListener('change', function (e) {
    if (ruhe) return;
    var t = e.target;
    if (!t || t.type !== 'radio') return;
    var step = t.closest('[data-step]');
    if (!step) return;
    var name = step.getAttribute('data-step');
    if (name === 'leer' && $('fLeer')) $('fLeer').value = t.value;
    if (!AUTO[name] || name !== aktuell) return;
    planWeiter();
  });
  $('wahlKauf').addEventListener('click', function () { weg = 'ankauf'; zeige('kontakt'); });
  $('wahlMakler').addEventListener('click', function () { weg = 'makler'; zeige('kontakt'); });
  $('wegAendern').addEventListener('click', function () { zeige('ergebnis'); });
  $('fTelefon').addEventListener('input', telefonZeilen);
  $('fMieteUnbekannt').addEventListener('change', mieteHinweis);
  ['fStrasse', 'fNr', 'fPlz', 'fOrt'].forEach(function (id) {
    $(id).addEventListener('input', function () {
      if (adresseKey() !== adresseStand && aktuell === 'adresse') weiter.textContent = 'Bodenrichtwert anzeigen';
    });
  });
  var neu = $('neuStarten');
  if (neu) neu.addEventListener('click', function () {
    try { sessionStorage.removeItem(KEY); } catch (e) {}
    location.href = location.pathname;
  });

  ausUrl();
  if (!wiederherstellen()) zeige('adresse');
  telefonZeilen();
  mieteHinweis();
})();
