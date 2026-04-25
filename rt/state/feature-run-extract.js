// state feature-run-extract 1.1.0
var EXTRACT_RUN_PCT_MIN = 10;
var EXTRACT_RUN_RPM_MIN = 250;
var EXTRACT_RUN_PA_MIN = 5;

function calcExtractRun(telM, telAct) {
  var ext = telAct && telAct.ext ? telAct.ext : {};
  var rpm = telM && telM.rpm ? telM.rpm : {};
  var pa = telM && telM.pa ? telM.pa : {};

  return b(
    on(ext) &&
    pct(ext) > EXTRACT_RUN_PCT_MIN &&
    sget(rpm, "ext", 0) > EXTRACT_RUN_RPM_MIN &&
    sget(pa, "ext", 0) >= EXTRACT_RUN_PA_MIN
  );
}
