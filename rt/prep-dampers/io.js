// prep-dampers io 1.2.0-costed-levels
function readComfort(cb) {
  Shelly.call("Enum.GetStatus", { id: COMFORT_ENUM_ID }, function (res, err) {
    if (err || !res || !res.value) { cb("MED"); return; }
    cb(String(res.value));
  });
}

function readTargetTemp(cb) {
  Shelly.call("Number.GetStatus", { id: TARGET_TEMP_NUMBER_ID }, function (res, err) {
    if (err || !res) { cb(20.0); return; }
    cb(n(res.value, 20.0));
  });
}

function readWeatherDayAvg(cb) {
  kvsGet(KEY_WEATHER_DAY_AVG_TEMP_C, function (v) {
    cb(n(v, 0));
  });
}

function readPriceBlocks(cb) {
  kvsGet(KEY_PRICE_2H, function (v) {
    cb(String(v || ""));
  });
}

function readVvxTelemetry(cb) {
  var url = "http://" + IP_VVX + "/rpc/KVS.Get?key=" + KEY_VVX_TEL_M;
  Shelly.call("HTTP.GET", { url: url, timeout: 10 }, function (res, err) {
    var o = null;
    var v = null;
    if (!err && res && res.body) {
      try { o = JSON.parse(String(res.body)); } catch (e) { o = null; }
    }
    if (o && o.value) v = o.value;
    if (typeof v === "string") {
      try { v = JSON.parse(v); } catch (e2) { v = null; }
    }
    cb(v);
  });
}

function readHouseTemp(cb) {
  readVvxTelemetry(function (tel) {
    var t = null;
    if (tel && tel.t && tel.t.house !== undefined) t = n(tel.t.house, null);
    cb(t);
  });
}
