// state feature-fan-average 1.1.0
function calcFanAverage(telM, telAct) {
  var sup = telAct && telAct.sup ? telAct.sup : {};
  var ext = telAct && telAct.ext ? telAct.ext : {};
  return clipPct((pct(sup) + pct(ext)) / 2);
}
