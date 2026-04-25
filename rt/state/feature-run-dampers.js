// state feature-run-dampers 1.1.0
function calcDampersRun(telM, telAct) {
  var dmp = telAct && telAct.dmp ? telAct.dmp : {};
  return b(on(dmp));
}
