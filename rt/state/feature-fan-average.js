// state feature-fan-average 1.1.3
var FAN_SPEED_AVG_ID = 203;

function calcFanAverage(telM, telAct) {
  var sup = telAct && telAct.sup ? telAct.sup : {};
  var ext = telAct && telAct.ext ? telAct.ext : {};
  return clipPct((pct(sup) + pct(ext)) / 2);
}

function runFanAverageFeature(telM, telAct, cb) {
  var fanAvg = calcFanAverage(telM, telAct);
  numberSet(FAN_SPEED_AVG_ID, fanAvg, cb);
}
