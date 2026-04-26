// state run-air 1.3.0-classic
var SUPPLY_RUN_PCT_MIN = 10;
var SUPPLY_RUN_RPM_MIN = 250;
var SUPPLY_RUN_PA_MIN = 5;
var EXTRACT_RUN_PCT_MIN = 10;
var EXTRACT_RUN_RPM_MIN = 250;
var EXTRACT_RUN_PA_MIN = 5;

function applySupplyRun(ctx) {
  var m = ctx.telM || {};
  var a = ctx.telAct || {};
  var sup = a.sup || {};
  var rpm = m.rpm || {};
  var pa = m.pa || {};
  ctx.run.sup = b(on(sup) && pct(sup) > SUPPLY_RUN_PCT_MIN && sget(rpm, "sup", 0) > SUPPLY_RUN_RPM_MIN && sget(pa, "sup", 0) >= SUPPLY_RUN_PA_MIN);
}

function applyExtractRun(ctx) {
  var m = ctx.telM || {};
  var a = ctx.telAct || {};
  var ext = a.ext || {};
  var rpm = m.rpm || {};
  var pa = m.pa || {};
  ctx.run.ext = b(on(ext) && pct(ext) > EXTRACT_RUN_PCT_MIN && sget(rpm, "ext", 0) > EXTRACT_RUN_RPM_MIN && sget(pa, "ext", 0) >= EXTRACT_RUN_PA_MIN);
}
