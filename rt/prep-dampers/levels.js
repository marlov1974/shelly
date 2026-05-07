// prep-dampers levels 1.6.0-split
function addLevelRow(out, b, l, e, h, c) {
  if (out !== "") out += ";";
  return out + b + "," + l + "," + e + "," + h + "," + c;
}

function addStepRow(out, b, from, to, dh, dc) {
  var spk = 0;
  if (dh > 0) spk = d1(dc / dh);
  if (out !== "") out += ";";
  return out + b + "," + from + "," + to + "," + dh + "," + dc + "," + spk;
}

function buildLevelData(periodName, priceCsv) {
  selectLevelSet(periodName);
  var levels = "";
  var steps = "";
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

    steps = addStepRow(steps, b, 0, 1, d1(LV_H1 - LV_H0), d1(c1 - c0));
    steps = addStepRow(steps, b, 1, 2, d1(LV_H2 - LV_H1), d1(c2 - c1));
    steps = addStepRow(steps, b, 2, 3, d1(LV_H3 - LV_H2), d1(c3 - c2));
    steps = addStepRow(steps, b, 3, 4, d1(LV_H4 - LV_H3), d1(c4 - c3));
  }
  return { levels: levels, steps: steps };
}
