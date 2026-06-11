// brain io-commands 2.2.1-remote-vvx-command-source
var COMMAND_IP = "192.168.77.40";
var CMD_ENABLE_ID = 200;
var CMD_NIGHT_SETBACK_ID = 201;
var CMD_MODE_ID = 200;
var CMD_HOUSE_TEMP_ID = 200;

function remoteRpc(method, id, cb) {
  var url = "http://" + COMMAND_IP + "/rpc/" + method + "?id=" + id;
  Shelly.call("HTTP.GET", { url: url, timeout: 5 }, function (res, err) {
    var js;
    if (err || !res || !res.body) { cb(null); return; }
    try { js = JSON.parse(res.body); } catch (e) { cb(null); return; }
    cb(js);
  });
}

function remoteBoolGet(id, fallback, cb) {
  remoteRpc("Boolean.GetStatus", id, function (res) {
    if (!res || typeof res.value === "undefined") { cb(fallback); return; }
    cb(b(res.value));
  });
}

function remoteEnumGet(id, cb) {
  remoteRpc("Enum.GetStatus", id, function (res) {
    if (!res || !res.value) { cb(MODE_STD); return; }
    cb(String(res.value));
  });
}

function remoteNumberGet(id, cb) {
  remoteRpc("Number.GetStatus", id, function (res) {
    if (!res) { cb(21.0); return; }
    cb(n(res.value, 21.0));
  });
}

function readCommands(ctx, cb) {
  ctx.cmd.enable = 1;
  ctx.cmd.night_setback = 0;
  ctx.cmd.mode = MODE_STD;
  ctx.cmd.house_temp_c = 21.0;

  remoteBoolGet(CMD_ENABLE_ID, 1, function (vEnable) {
    ctx.cmd.enable = vEnable;
    remoteBoolGet(CMD_NIGHT_SETBACK_ID, 0, function (vNight) {
      ctx.cmd.night_setback = vNight;
      remoteEnumGet(CMD_MODE_ID, function (vMode) {
        ctx.cmd.mode = normalizeMode(vMode);
        remoteNumberGet(CMD_HOUSE_TEMP_ID, function (vTemp) {
          ctx.cmd.house_temp_c = n(vTemp, 21.0);
          cb();
        });
      });
    });
  });
}
