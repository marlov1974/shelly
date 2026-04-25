// state feature-run-cool 1.1.0
var COOL_RUN_PCT_MIN = 0;
var COOL_RUN_DT_MIN_C = 0.5;

function calcCoolRun(telM, telAct) {
  var cool = telAct && telAct.cool ? telAct.cool : {};
  var t = telM && telM.t ? telM.t : {};

  return b(
    on(cool) &&
    pct(cool) > COOL_RUN_PCT_MIN &&
    (sget(t, "post_vvx", 0) - sget(t, "to_house", 0)) >= COOL_RUN_DT_MIN_C
  );
}
