// spotprice-dampers parse 1.1.0-tibber
function parseTotals(body, wantTomorrow) {
  var marker = wantTomorrow ? '"tomorrow"' : '"today"';
  var p = body.indexOf(marker);
  if (p < 0) return null;

  var endMarker = wantTomorrow ? null : '"tomorrow"';
  var e = body.length;
  if (endMarker) {
    var ep = body.indexOf(endMarker, p + marker.length);
    if (ep > p) e = ep;
  }

  var out = [];
  var key = '"total":';
  while (out.length < 96) {
    var i = body.indexOf(key, p);
    if (i < 0 || i > e) break;
    i += key.length;
    var j = i;
    while (j < body.length) {
      var c = body.charAt(j);
      if ((c >= "0" && c <= "9") || c === "." || c === "-") j++;
      else break;
    }
    var v = Number(body.substring(i, j));
    if (!isNaN(v)) out.push(v);
    p = j;
  }

  return out;
}

function blocksFromTotals(values) {
  var out = [];
  var step = 0;
  var perBlock = 0;

  if (!values || !values.length) return null;
  if (values.length >= 96) { step = 1; perBlock = 8; }
  else if (values.length >= 24) { step = 1; perBlock = 2; }
  else return null;

  var idx = 0;
  while (out.length < 12) {
    var sum = 0;
    var c = 0;
    while (c < perBlock) {
      sum += values[idx];
      idx += step;
      c++;
    }
    out.push(d1(sum / perBlock));
  }
  return out;
}
