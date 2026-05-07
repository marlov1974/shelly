// optimize-dampers algorithm 1.0.0
function sumHeat(plan, map) {
  var s = 0;
  var b;
  for (b = 0; b < 4; b++) s += getHeat(map, b, plan[b]);
  return d1(s);
}

function sumCost(plan, map) {
  var s = 0;
  var b;
  for (b = 0; b < 4; b++) s += getCost(map, b, plan[b]);
  return d1(s);
}

function findBestStep(plan, map) {
  var bestBlock = -1;
  var bestSekKwh = 999999;
  var bestDh = 0;
  var bestDc = 0;
  var b;
  for (b = 0; b < 4; b++) {
    var from = plan[b];
    if (from >= 4) continue;
    var to = from + 1;
    var dh = d1(getHeat(map, b, to) - getHeat(map, b, from));
    var dc = d1(getCost(map, b, to) - getCost(map, b, from));
    if (dh <= 0) continue;
    var sekKwh = d1(dc / dh);
    if (sekKwh < bestSekKwh) {
      bestSekKwh = sekKwh;
      bestBlock = b;
      bestDh = dh;
      bestDc = dc;
    }
  }
  if (bestBlock < 0) return null;
  return { block: bestBlock, sek_kwh: bestSekKwh, dh: bestDh, dc: bestDc };
}

function optimize(prep) {
  var required = n(prep.required_heat_kwh, 0);
  var plan = parsePlan(prep.start_plan);
  var map = parseLevelMap(prep.levels);
  var delivered = sumHeat(plan, map);
  var guard = 0;

  while (delivered < required && guard < 16) {
    var step = findBestStep(plan, map);
    if (!step) break;
    plan[step.block] = plan[step.block] + 1;
    delivered = sumHeat(plan, map);
    guard++;
  }

  return {
    plan: planString(plan),
    required_heat_kwh: d1(required),
    delivered_heat_kwh: d1(delivered),
    cost: sumCost(plan, map),
    iterations: guard
  };
}
