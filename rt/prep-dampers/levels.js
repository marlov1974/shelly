// prep-dampers levels 1.7.0-compact-output
function addLevelRow(out, b, l, e, h, c) {
  if (out !== "") out += ";";
  return out + b + "," + l + "," + e + "," + h + "," + c;
}

function buildLevelData(periodName, priceCsv) {
  selectLevelSet(periodName);
  var levels = "";
  var b;
  for (b = 0; b < 4; b++) {
    var price = parsePriceAt(priceCsv, LV_START + b);
    var c0 = d1(price * LV_E0 * 2.0);
    var c1 = d1(price * LV_E1 * 2.0);
    var c2 = d1(price * LV_E2 * 2.0);
    var c3 = d1(price * LV_E3 * 2.0);
    var c4 = d1(price * LV_E4 * 2.0);
    levels = addLevelRow(levels, b, 0, LV_E0, LV_H0, c0);
    levels = addLevelRow(levels, b, 1, LV_E1, LV_H1, c1);
    levels = addLevelRow(levels, b, 2, LV_E2, LV_H2, c2);
    levels = addLevelRow(levels, b, 3, LV_E3, LV_H3, c3);
    levels = addLevelRow(levels, b, 4, LV_E4, LV_H4, c4);
  }
  return levels;
}
