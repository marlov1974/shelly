// optimize-dampers parse 1.0.0
function splitSemi(s) {
  if (!s) return [];
  return String(s).split(";");
}

function splitComma(s) {
  if (!s) return [];
  return String(s).split(",");
}

function parsePlan(s) {
  var a = splitSemi(s);
  var out = [0, 0, 0, 0];
  var k;
  for (k = 0; k < 4 && k < a.length; k++) out[k] = i(n(a[k], 0));
  return out;
}

function planString(p) {
  return String(p[0]) + ";" + String(p[1]) + ";" + String(p[2]) + ";" + String(p[3]);
}

function parseLevelMap(s) {
  var rows = splitSemi(s);
  var heat = [];
  var cost = [];
  var k;
  for (k = 0; k < 20; k++) { heat[k] = 0; cost[k] = 0; }
  for (k = 0; k < rows.length; k++) {
    var c = splitComma(rows[k]);
    if (c.length >= 5) {
      var b = i(n(c[0], 0));
      var l = i(n(c[1], 0));
      var idx = b * 5 + l;
      if (idx >= 0 && idx < 20) {
        heat[idx] = n(c[3], 0);
        cost[idx] = n(c[4], 0);
      }
    }
  }
  return { heat: heat, cost: cost };
}

function getHeat(map, block, level) {
  return map.heat[block * 5 + level] || 0;
}

function getCost(map, block, level) {
  return map.cost[block * 5 + level] || 0;
}
