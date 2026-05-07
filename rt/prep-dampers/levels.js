// prep-dampers levels 1.5.0-flat-builder
// levels: block,level,electric_kW,heat_kWh_per_2h,cost
// steps:  block,from,to,delta_heat_kWh,delta_cost,sek_per_kWh
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

function buildLevelData(periodName, priceCsv) {
  var start = 0;
  var e0 = 0.8, e1 = 1.1, e2 = 1.8, e3 = 2.4, e4 = 7.5;
  var h0 = 8.8, h1 = 11.4, h2 = 18.8, h3 = 24.0, h4 = 54.0;
  var levels = "";
  var steps = "";
  var b;

  if (periodName === "p2") {
    start = 4;
    e0 = 0.5; e1 = 0.7; e2 = 1.2; e3 = 1.7; e4 = 5.2;
    h0 = 5.8; h1 = 7.8; h2 = 12.8; h3 = 17.0; h4 = 40.0;
  }
  if (periodName === "p3") {
    start = 8;
    e0 = 0.65; e1 = 0.9; e2 = 1.5; e3 = 2.0; e4 = 6.5;
    h0 = 7.2; h1 = 9.6; h2 = 15.6; h3 = 20.0; h4 = 48.0;
  }

  for (b = 0; b < 4; b++) {
    var price = parsePriceAt(priceCsv, start + b);
    var c0 = d1(price * e0 * 2.0);
    var c1 = d1(price * e1 * 2.0);
    var c2 = d1(price * e2 * 2.0);
    var c3 = d1(price * e3 * 2.0);
    var c4 = d1(price * e4 * 2.0);

    if (levels !== "") levels += ";";
    levels += b + ",0," + e0 + "," + h0 + "," + c0;
    levels += ";" + b + ",1," + e1 + "," + h1 + "," + c1;
    levels += ";" + b + ",2," + e2 + "," + h2 + "," + c2;
    levels += ";" + b + ",3," + e3 + "," + h3 + "," + c3;
    levels += ";" + b + ",4," + e4 + "," + h4 + "," + c4;

    if (steps !== "") steps += ";";
    steps += b + ",0,1," + d1(h1 - h0) + "," + d1(c1 - c0) + "," + d1((c1 - c0) / (h1 - h0));
    steps += ";" + b + ",1,2," + d1(h2 - h1) + "," + d1(c2 - c1) + "," + d1((c2 - c1) / (h2 - h1));
    steps += ";" + b + ",2,3," + d1(h3 - h2) + "," + d1(c3 - c2) + "," + d1((c3 - c2) / (h3 - h2));
    steps += ";" + b + ",3,4," + d1(h4 - h3) + "," + d1(c4 - c3) + "," + d1((c4 - c3) / (h4 - h3));
  }

  return { levels: levels, steps: steps };
}
