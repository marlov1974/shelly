// prep-dampers levels 1.3.0-calendar-periods
// Output format per option: block,level,electric_kW,heat_kWh_per_2h,cost
function parsePriceAt(csv, idx) {
  var s = String(csv || "");
  var p = 0;
  var k = 0;
  while (k < idx) {
    p = s.indexOf(",", p);
    if (p < 0) return 0;
    p++;
    k++;
  }
  var e = s.indexOf(",", p);
  if (e < 0) e = s.length;
  return n(s.substring(p, e), 0);
}

function libName(periodName) {
  if (periodName === "p2") return "morning";
  if (periodName === "p3") return "afternoon";
  return "night";
}

function levelEl(periodName, level) {
  var p = libName(periodName);
  if (p === "morning") {
    if (level === 0) return 0.5;
    if (level === 1) return 0.7;
    if (level === 2) return 1.2;
    if (level === 3) return 1.7;
    return 5.2;
  }
  if (p === "afternoon") {
    if (level === 0) return 0.65;
    if (level === 1) return 0.9;
    if (level === 2) return 1.5;
    if (level === 3) return 2.0;
    return 6.5;
  }
  if (level === 0) return 0.8;
  if (level === 1) return 1.1;
  if (level === 2) return 1.8;
  if (level === 3) return 2.4;
  return 7.5;
}

function levelHeat(periodName, level) {
  var p = libName(periodName);
  if (p === "morning") {
    if (level === 0) return 5.8;
    if (level === 1) return 7.8;
    if (level === 2) return 12.8;
    if (level === 3) return 17.0;
    return 40.0;
  }
  if (p === "afternoon") {
    if (level === 0) return 7.2;
    if (level === 1) return 9.6;
    if (level === 2) return 15.6;
    if (level === 3) return 20.0;
    return 48.0;
  }
  if (level === 0) return 8.8;
  if (level === 1) return 11.4;
  if (level === 2) return 18.8;
  if (level === 3) return 24.0;
  return 54.0;
}

function priceStartIndex(periodName) {
  if (periodName === "p2") return 4;
  if (periodName === "p3") return 8;
  return 0;
}

function costedLevels(periodName, priceCsv) {
  var out = "";
  var start = priceStartIndex(periodName);
  var b;
  var l;
  for (b = 0; b < 4; b++) {
    var price = parsePriceAt(priceCsv, start + b);
    for (l = 0; l < 5; l++) {
      var el = levelEl(periodName, l);
      var heat = levelHeat(periodName, l);
      var cost = d1(price * el * 2.0);
      if (out !== "") out += ";";
      out += String(b) + "," + String(l) + "," + String(el) + "," + String(heat) + "," + String(cost);
    }
  }
  return out;
}
