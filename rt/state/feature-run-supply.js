// state feature-run-supply 1.1.0
var SUPPLY_RUN_PCT_MIN = 10;
var SUPPLY_RUN_RPM_MIN = 250;
var SUPPLY_RUN_PA_MIN = 5;

function calcSupplyRun(telM, telAct) {
  var sup = telAct && telAct.sup ? telAct.sup : {};
  var rpm = telM && telM.rpm ? telM.rpm : {};
  var pa = telM && telM.pa ? telM.pa : {};

  return b(
    on(sup) &&
    pct(sup) > SUPPLY_RUN_PCT_MIN &&
    sget(rpm, "sup", 0) > SUPPLY_RUN_RPM_MIN &&
    sget(pa, "sup", 0) >= SUPPLY_RUN_PA_MIN
  );
}
