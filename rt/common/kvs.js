// common kvs 1.0.0
function kvsSet(key, value, cb) {
  Shelly.call("KVS.Set", { key: String(key || ""), value: value }, function (res, err) {
    if (err) {
      log("KVS ERR");
      if (cb) cb(0);
      return;
    }
    if (cb) cb(1);
  });
}

function kvsWriteObject(key, obj, cb) {
  if (!obj || typeof obj !== "object") obj = {};
  kvsSet(key, obj, cb);
}

