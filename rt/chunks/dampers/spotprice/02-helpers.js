function wd(d){var w=d.getDay();return w===0?7:w;}
function high(m,w,h){return GRID==="time_tariff"&&has(HM,m)&&has(HD,w)&&h>=H0&&h<H1;}
function gp(m,w,h){if(GRID==="flat")return GFLAT;if(GRID==="time_tariff")return high(m,w,h)?GHIGH:GLOW;return GFLAT;}
function tp(spot,m,w,h){return (SPOT_EX?iv(spot):spot)+iv(MARKUP_EX)+iv(VARCOST_EX)+iv(ETAX_EX)+gp(m,w,h);}
function set(k,v,cb){Shelly.call("KVS.Set",{key:k,value:String(v)},function(res,err){if(err)log("KVS err "+k);if(cb)cb(!err);});}
function status(s){set(KS,s,null);}
function blocks(body,d){var key='"SEK_per_kWh":',pos=0,q=0,cnt=0,sum=0,out=[],m=d.getMonth()+1,w=wd(d);
 while(1){var i=body.indexOf(key,pos);if(i<0)break;i+=key.length;var j=i;
  while(j<body.length){var c=body.charAt(j);if((c>="0"&&c<="9")||c==="."||c==="-")j++;else break;}
