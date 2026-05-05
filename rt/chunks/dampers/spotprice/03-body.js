  function buildBlocksFromBody(body, d) {
    var key = '"SEK_per_kWh":';
    var pos = 0;
    var quarterCount = 0;
    var countInBlock = 0;
    var sum = 0;
    var blocks = [];
    var month = d.getMonth() + 1;
    var weekday = weekdayMon1(d);

    while (true) {
      var p = body.indexOf(key, pos);
      if (p < 0) break;
      p += key.length;

      var q = p;
      while (q < body.length) {
        var ch = body.charAt(q);
        if ((ch >= "0" && ch <= "9") || ch === "." || ch === "-") q++;
        else break;
      }

      var spot = Number(body.substring(p, q));
      if (!isNaN(spot)) {
        var hour = Math.floor(quarterCount / 4);
        var total = totalPriceIncVat(spot, month, weekday, hour);
        sum += total;
        countInBlock++;
        quarterCount++;
        if (countInBlock === 8) {
          blocks.push(round3(sum / 8));
          sum = 0;
          countInBlock = 0;
        }
      }
      pos = q;
    }

    if (quarterCount !== 96 || blocks.length !== 12) {
      log("bad count q=" + quarterCount + " b=" + blocks.length);
      return null;
    }
    return blocks;
  }

  function saveBlocks(blocks, d) {
    var s = blocks.join(",");
    kvSet(KEY_PRICE_2H, s, function () {
      kvSet(KEY_PRICE_DATE, dateStr(d), function () {
        kvSet(KEY_PRICE_AREA, PRICE_AREA, function () {
          kvSet(KEY_PRICE_UPDATED, nowIsoLite(), function () {
            kvSet(KEY_PRICE_STATUS, "ok", function () {
              log("ok " + dateStr(d));
            });
          });
        });
      });
    });
  }

  function run() {
    var d = targetDateObj();
    var u = urlForDate(d);
    log("GET " + u);
    setStatus("fetching");
    Shelly.call("HTTP.GET", { url: u, timeout: 15 }, function (res, err) {
      if (err || !res || !res.body) {
        log("fetch failed");
        setStatus("fetch_failed");
        return;
      }
      var b = buildBlocksFromBody(res.body, d);
      if (!b) {
        setStatus("bad_count");
        return;
      }
      saveBlocks(b, d);
    });
  }

  run();
})();
