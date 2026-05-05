// weather-dampers parse 1.1.0
function parseNumberArray(body, name) {
  var key = '"' + name + '":[';
  var p = body.indexOf(key);
  if (p < 0) return null;
  p += key.length;

  var out = [];
  while (p < body.length) {
    var c = body.charAt(p);
    if (c === "]") break;
    if (c === "," || c === " ") { p++; continue; }

    var q = p;
    while (q < body.length) {
      c = body.charAt(q);
      if ((c >= "0" && c <= "9") || c === "." || c === "-") q++;
      else break;
    }

    if (q > p) {
      var v = Number(body.substring(p, q));
      if (!isNaN(v)) out.push(v);
      p = q;
    } else {
      p++;
    }
  }
  return out;
}

function buildWeather(body) {
  var temps = parseNumberArray(body, "temperature_2m");
  var solar = parseNumberArray(body, "shortwave_radiation");
  if (!temps || !temps.length || !solar || !solar.length) return null;

  var h = (new Date()).getHours();
  if (h < 0) h = 0;
  if (h >= temps.length) h = temps.length - 1;

  var sum = 0;
  var i2;
  for (i2 = 0; i2 < temps.length; i2++) sum += temps[i2];

  var rad = 0;
  if (h < solar.length) rad = solar[h];

  return {
    temp: d1(temps[h]),
    solar: d1(rad),
    dayAvgTemp: d1(sum / temps.length),
    count: temps.length
  };
}
