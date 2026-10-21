/* Leichte Bewegung für die Verkäufer-Seiten.
   Maus und Trackpad gleiten, Touch bleibt nativ (dort ist das System schon träge).
   Nichts davon läuft bei prefers-reduced-motion. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fein = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var grob = matchMedia('(pointer: coarse)').matches;
  var marketing = document.body.classList.contains('seite-marketing');
  var eigen = false;
  var target = window.scrollY;
  var current = window.scrollY;
  var lastY = window.scrollY;
  var vel = 0;
  var laufX = 0;
  var halb = 0;
  var spur = document.querySelector('.laufband-spur');
  var pinBox = document.querySelector('.ablauf');
  var schritte = pinBox ? pinBox.querySelectorAll('.ablauf-schritte article') : [];
  var punkte = pinBox ? pinBox.querySelectorAll('.ablauf-punkte i') : [];
  var zahl = pinBox ? pinBox.querySelector('.ablauf-zahl') : null;
  var pinIndex = 0;
  var laufend = false;
  var rahmen = 0;
  var bandSichtbar = false;

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function pinSetzen(index) {
    if (index === pinIndex) return;
    pinIndex = index;
    for (var i = 0; i < schritte.length; i++) schritte[i].classList.toggle('ist-da', i === index);
    for (var j = 0; j < punkte.length; j++) punkte[j].classList.toggle('ist-da', j === index);
    if (zahl) zahl.textContent = '0' + (index + 1);
  }

  function pin() {
    if (!pinBox || reduce) return;
    var strecke = pinBox.offsetHeight - window.innerHeight;
    if (strecke <= 0) return;
    var y = Math.min(Math.max(-pinBox.getBoundingClientRect().top, 0), strecke);
    var index = Math.min(schritte.length - 1, Math.floor((y / strecke) * schritte.length));
    pinSetzen(index);
  }

  function marquee(dt) {
    if (!spur || !halb) return;
    var schub = Math.min(vel, 56) / 56;
    laufX -= (34 + schub * 110) * dt;
    if (laufX <= -halb) laufX += halb;
    spur.style.transform = 'translate3d(' + laufX.toFixed(2) + 'px,0,0)';
  }

  function gleiten() {
    var diff = target - current;
    if (Math.abs(diff) < 0.4) {
      current = target;
      eigen = false;
    } else {
      current += diff * 0.16;
    }
    var y = current;
    vel = Math.abs(y - lastY);
    lastY = y;
    window.scrollTo(0, current);
    pin();
  }

  function rahmenStart() {
    if (laufend) return;
    laufend = true;
    var zuletzt = performance.now();
    function frame(jetzt) {
      var dt = Math.min(34, jetzt - zuletzt) / 1000;
      zuletzt = jetzt;
      if (eigen) gleiten();
      else vel *= 0.86;
      marquee(dt);
      if (!document.hidden && (bandSichtbar || eigen)) rahmen = requestAnimationFrame(frame);
      else laufend = false;
    }
    rahmen = requestAnimationFrame(frame);
  }

  if (!reduce && spur && marketing && 'IntersectionObserver' in window) {
    spur.classList.add('lauf-js');
    halb = spur.scrollWidth / 2;
    var bandIO = new IntersectionObserver(function (entries) {
      bandSichtbar = entries.some(function (entry) { return entry.isIntersecting; });
      if (bandSichtbar) rahmenStart();
    }, { rootMargin: '80px' });
    bandIO.observe(spur);
  }

  if (!reduce && !grob && marketing) {
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey) return;
      e.preventDefault();
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY));
      eigen = true;
      rahmenStart();
    }, { passive: false });
    window.addEventListener('scroll', function () {
      if (eigen) return;
      current = target = lastY = window.scrollY;
      pin();
    }, { passive: true });
    document.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a[href^="#"]');
      if (!link) return;
      var id = link.getAttribute('href').slice(1);
      var ziel = id && document.getElementById(id);
      if (!ziel) return;
      e.preventDefault();
      target = Math.max(0, Math.min(maxScroll(), ziel.getBoundingClientRect().top + window.scrollY - 76));
      eigen = true;
      rahmenStart();
    });
  } else if (!reduce && pinBox) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      vel = Math.abs(y - lastY);
      lastY = y;
      pin();
    }, { passive: true });
  }

  if (!reduce && fein) {
    var karten = document.querySelectorAll('.karte, .kontakt-karte, .fliese, .gruender');
    var zeiger = null;
    var kippRahmen = 0;
    karten.forEach(function (k) { k.classList.add('neigen'); });
    function kippen() {
      kippRahmen = 0;
      var e = zeiger;
      zeiger = null;
      if (!e) return;
      var zielKarte = e.target.closest && e.target.closest('.neigen');
      for (var i = 0; i < karten.length; i++) {
        var k = karten[i];
        if (k !== zielKarte) {
          k.style.setProperty('--nx', '0deg');
          k.style.setProperty('--ny', '0deg');
          continue;
        }
        var r = k.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        k.style.setProperty('--nx', (px * 4.5).toFixed(2) + 'deg');
        k.style.setProperty('--ny', ((-py) * 3.5).toFixed(2) + 'deg');
      }
    }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      zeiger = e;
      if (!kippRahmen) kippRahmen = requestAnimationFrame(kippen);
    }, { passive: true });
    document.addEventListener('pointerleave', function () {
      for (var i = 0; i < karten.length; i++) {
        karten[i].style.setProperty('--nx', '0deg');
        karten[i].style.setProperty('--ny', '0deg');
      }
    });
  }

  if (!reduce) {
    var zaehler = document.querySelectorAll('.zaehl');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          var el = entry.target;
          var bis = Number(el.getAttribute('data-bis'));
          if (!bis) return;
          var zusatz = el.getAttribute('data-zusatz') || '';
          var lauf = el.querySelector('.zaehl-lauf');
          if (!lauf) return;
          var start = performance.now();
          el.classList.add('laeuft');
          function schritt(jetzt) {
            var p = Math.min(1, (jetzt - start) / 880);
            var kurve = 1 - Math.pow(1 - p, 3);
            lauf.textContent = Math.round(bis * kurve) + zusatz;
            if (p < 1) requestAnimationFrame(schritt);
            else el.classList.remove('laeuft');
          }
          requestAnimationFrame(schritt);
        });
      }, { threshold: 0.55 });
      zaehler.forEach(function (el) { io.observe(el); });
    }
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && !laufend && spur && !reduce) rahmenStart();
  });
})();
