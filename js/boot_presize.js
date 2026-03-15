(function () {
  var zMin = 0.4;
  var zMax = 1.6;
  var z = 1.0;

  try {
    var raw = localStorage.getItem('zoomLevel');
    if (raw !== null) {
      var parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        z = Math.min(zMax, Math.max(zMin, parsed));
      }
    }
  } catch {}

  var BASE_G_WIDTH = 500;
  var BASE_G_HEIGHT = 200;
  var BASE_PADDING = 60;
  var cw = Math.round(z * (BASE_G_WIDTH + BASE_PADDING));
  var ch = Math.round(z * (BASE_G_HEIGHT + 2 * BASE_PADDING));
  var root = document.documentElement;

  root.style.setProperty('--initial-fretboard-width', cw + 'px');
  root.style.setProperty('--initial-fretboard-height', ch + 'px');
})();
