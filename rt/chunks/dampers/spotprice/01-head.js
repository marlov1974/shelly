// spotprice 1.0.4-chunked
(function(){
"use strict";
var AREA="SE3",TOM=1,VAT=0.25,SPOT_EX=1,MARKUP_EX=0.06,VARCOST_EX=0,ETAX_EX=0.36;
var GRID="time_tariff",GFLAT=0.305,GHIGH=0.765,GLOW=0.305,HM="1,2,3,11,12",HD="1,2,3,4,5",H0=6,H1=22;
var K2H="hp.price.2h",KD="hp.price.date",KA="hp.price.area",KS="hp.price.status",KU="hp.price.updated";
function log(s){print("spotprice "+String(s||""));}
function p2(n){n=Number(n);return n<10?"0"+n:String(n);}
function r3(n){return Math.round(n*1000)/1000;}
function iv(v){return v*(1+VAT);}
function has(csv,v){return (","+csv+",").indexOf(","+String(v)+",")>=0;}
function iso(){var d=new Date();return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate())+"T"+p2(d.getHours())+":"+p2(d.getMinutes())+":"+p2(d.getSeconds());}
function tdate(){var d=new Date();if(TOM)d=new Date(d.getTime()+86400000);return d;}
function ds(d){return d.getFullYear()+"-"+p2(d.getMonth()+1)+"-"+p2(d.getDate());}
function url(d){return "https://www.elprisetjustnu.se/api/v1/prices/"+d.getFullYear()+"/"+p2(d.getMonth()+1)+"-"+p2(d.getDate())+"_"+AREA+".json";}
