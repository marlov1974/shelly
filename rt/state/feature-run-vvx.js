// state feature-run-vvx 1.1.0
var VVX_RUN_RPM_MIN = 4;

function calcVvxRun(telM, telAct) {
  var vvx = telAct && telAct.vvx ? telAct.vvx : {};
  var rpm = telM && telM.rpm ? telM.rpm : {};

  return b(on(vvx) && sget(rpm, "vvx", 0) > VVX_RUN_RPM_MIN);
}
