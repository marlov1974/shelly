  var spot=Number(body.substring(i,j));
  if(!isNaN(spot)){sum+=tp(spot,m,w,Math.floor(q/4));cnt++;q++;if(cnt===8){out.push(r3(sum/8));sum=0;cnt=0;}}
  pos=j;
 }
 if(q!==96||out.length!==12){log("bad q="+q+" b="+out.length);return null;}return out;
}
function save(b,d){var s=b.join(",");set(K2H,s,function(){set(KD,ds(d),function(){set(KA,AREA,function(){set(KU,iso(),function(){set(KS,"ok",function(){log("ok "+ds(d)+" "+s);});});});});});}
function run(){var d=tdate(),u=url(d);log("GET "+u);status("fetching");Shelly.call("HTTP.GET",{url:u,timeout:15},function(res,err){if(err||!res||!res.body){log("http");status("http_error");return;}var b=blocks(res.body,d);if(!b){status("bad_count");return;}save(b,d);});}
run();
})();
