// driver rpc 1.0.0
function remoteGet(url, tag, cb) {
  Shelly.call("HTTP.GET", { url: url, timeout: 5 }, function (res, err) {
    if (err || !res) {
      log("ERR " + tag);
      if (cb) cb(0);
      return;
    }
    if (cb) cb(1);
  });
}

function boolStr(v) {
  return v ? "true" : "false";
}

function remoteSwitchSet(ip, id, onValue, cb) {
  var url = "http://" + ip + "/rpc/Switch.Set?id=" + id + "&on=" + boolStr(onValue);
  remoteGet(url, "SW " + ip, cb);
}

function remoteLightSet(ip, id, onValue, pctValue, cb) {
  var pct2 = clipPct(pctValue);
  var url = "http://" + ip + "/rpc/Light.Set?id=" + id + "&on=" + boolStr(onValue) + "&brightness=" + pct2;
  remoteGet(url, "LT " + ip, cb);
}
