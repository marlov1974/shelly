// optimize-dampers algorithm 1.1.0-compact-prep
var OE0 = 0.8, OE1 = 1.1, OE2 = 1.8, OE3 = 2.4, OE4 = 7.5;
var OH0 = 8.8, OH1 = 11.4, OH2 = 18.8, OH3 = 24.0, OH4 = 54.0;

function selectOptLib(code) {
  OE0 = 0.8; OE1 = 1.1; OE2 = 1.8; OE3 = 2.4; OE4 = 7.5;
  OH0 = 8.8; OH1 = 11.4; OH2 = 18.8; OH3 = 24.0; OH4 = 54.0;
  if (code === 2) {
    OE0 = 0.5; OE1 = 0.7; OE2 = 1.2; OE3 = 1.7; OE4 = 5.2;
    OH0 = 5.8; OH1 = 7.8; OH2 = 12.8; OH3 = 17.0; OH4 = 40.0;
  }
  if (code === 3) {
    OE0 = 0.65; OE1 = 0.9; OE2 = 1.5; OE3 = 2.0; OE4 = 6.5;
    OH0 = 7.2; OH1 = 9.6; OH2 = 15.6; OH3 = 20.0; OH4 = 48.0;
  }
}

function optE(level) { if (level === 0) return OE0; if (level === 1) return OE1; if (level === 2) return OE2; if (level === 3) return OE3; return OE4; }
function optH(level) { if (level === 0) return OH0; if (level === 1) return OH1; if (level === 2) return OH2; if (level === 3) return OH3; return OH4; }
function optCost(level, price) { return d1(optE(level) * 2.0 * price); }

function sumHeat(plan) {
  return d1(optH(plan[0]) + optH(plan[1]) + optH(plan[2]) + optH(plan[3]));
}

function sumCost(plan, prices) {
  var s = 0;
  var b;
  for (b = 0; b < 4; b++) s += optCost(plan[b], priceAt(prices, b));
  return d1(s);
}

function findBestStep(plan, prices) {
  var bestBlock = -1;
  var bestSekKwh = 999999;
  var b;
  for (b = 0; b < 4; b++) {
    var from = plan[b];
    if (from >= 4) continue;
    var to = from + 1;
    var dh = d1(optH(to) - optH(from));
    var dc = d1(optCost(to, priceAt(prices, b)) - optCost(from, priceAt(prices, b)));
    if (dh <= 0) continue;
    var sekKwh = d1(dc / dh);
    if (sekKwh < bestSekKwh) {
      bestSekKwh = sekKwh;
      bestBlock = b;
    }
  }
  return bestBlock;
}

function optimize(prep) {
  var required = n(prep.required_heat_kwh, 0);
  var plan = parsePlan(prep.start_plan);
  var guard = 0;
  selectOptLib(prep.period_code);
  var delivered = sumHeat(plan);
  while (delivered < required && guard < 16) {
    var block = findBestStep(plan, prep.prices);
    if (block < 0) break;
    plan[block] = plan[block] + 1;
    delivered = sumHeat(plan);
    guard++;
  }
  return {
    plan: planString(plan),
    required_heat_kwh: d1(required),
    delivered_heat_kwh: d1(delivered),
    cost: sumCost(plan, prep.prices),
    iterations: guard
  };
}
