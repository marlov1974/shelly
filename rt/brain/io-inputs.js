// brain io-inputs 2.4.1-read-state-run
var KEY_TEL_M = "ftx.tel.m";
var KEY_TEL_ACT = "ftx.tel.act";
var KEY_STATE_RUN = "ftx.state.run";

function getTelMValue(telM, path1, path2, def) {
  var a = telM && telM[path1];
  if (!a || typeof a !== "object") return def;
  return n(a[path2], def);
}

function getTelActNumValue(telAct, dev, field, def) {
  var a = telAct && telAct[dev];
  if (!a || typeof a !== "object") return def;
  return n(a[field], def);
}

function getTelActBoolValue(telAct, dev, field, def) {
  var a = telAct && telAct[dev];
  if (!a || typeof a !== "object") return def;
  return b(a[field]);
}

function getRunValue(run, field, def) {
  if (!run || typeof run !== "object") return def;
  return b(run[field]);
}

function applyInputs(ctx, telM, telAct, stateRun) {
  ctx.inp.t_out_c = getTelMValue(telM, "t", "out", ctx.cmd.house_temp_c);
  ctx.inp.t_house_c = getTelMValue(telM, "t", "house", ctx.cmd.house_temp_c);
  ctx.inp.t_to_house_c = getTelMValue(telM, "t", "to_house", ctx.cmd.house_temp_c);
  ctx.inp.t_post_vvx_c = getTelMValue(telM, "t", "post_vvx", ctx.cmd.house_temp_c);
  ctx.inp.rh_house_pct = getTelMValue(telM, "rh", "house", 50.0);
  ctx.inp.ppm_house = getTelMValue(telM, "ppm", "house", 500.0);

  ctx.inp.dmp_run = getRunValue(stateRun, "dmp", getTelActBoolValue(telAct, "dmp", "run", 0));
  ctx.inp.sup_run = getRunValue(stateRun, "sup", getTelActBoolValue(telAct, "sup", "run", 0));
  ctx.inp.ext_run = getRunValue(stateRun, "ext", getTelActBoolValue(telAct, "ext", "run", 0));
  ctx.inp.vvx_on_actual = getTelActBoolValue(telAct, "vvx", "on", 0);
  ctx.inp.heat_pct_actual = getTelActNumValue(telAct, "heat", "pct", 0);
  ctx.inp.cool_pct_actual = getTelActNumValue(telAct, "cool", "pct", 0);
}

function readInputs(ctx, cb) {
  kvsGet(KEY_TEL_M, function (m) {
    var telM = (m && typeof m === "object") ? m : {};
    kvsGet(KEY_TEL_ACT, function (a) {
      var telAct = (a && typeof a === "object") ? a : {};
      kvsGet(KEY_STATE_RUN, function (r) {
        var stateRun = (r && typeof r === "object") ? r : {};
        applyInputs(ctx, telM, telAct, stateRun);
        cb();
      });
    });
  });
}
