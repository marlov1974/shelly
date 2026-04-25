// state feature-run-heat 1.1.0
var HEAT_RUN_PCT_MIN = 0;
var HEAT_RUN_DT_MIN_C = 0.5;

function calcHeatRun(telM, telAct) {
  var heat = telAct && telAct.heat ? telAct.heat : {};
  var t = telM && telM.t ? telM.t : {};

  return b(
    on(heat) &&
    pct(heat) > HEAT_RUN_PCT_MIN &&
    (sget(t, "to_house", 0) - sget(t, "post_vvx", 0)) >= HEAT_RUN_DT_MIN_C
  );
}
