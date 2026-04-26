// brain feature-vvx 2.1.0
var VVX_EFF_THEORY = 0.80;
var VVX_COST_BIAS_FACTOR = 2.0;
var VVX_COST_HOLD_DB_C = 0.2;

function calcVvxCost(candidateC, targetC, houseC) {
  var diff = n(candidateC, targetC) - n(targetC, candidateC);
  var houseVsTarget = n(houseC, targetC) - n(targetC, houseC);

  if (houseVsTarget > 0.1) {
    if (diff > 0) return VVX_COST_BIAS_FACTOR * diff;
    return -diff;
  }

  if (houseVsTarget < -0.1) {
    if (diff < 0) return VVX_COST_BIAS_FACTOR * (-diff);
    return diff;
  }

  return abs(diff);
}

function decideVvxOn(ctx) {
  var tVvxOff = ctx.inp.t_out_c;
  var tVvxOn = ctx.inp.t_out_c + VVX_EFF_THEORY * (ctx.inp.t_house_c - ctx.inp.t_out_c);
  var costOff = calcVvxCost(tVvxOff, ctx.dx.targetToHouseC, ctx.inp.t_house_c);
  var costOn = calcVvxCost(tVvxOn, ctx.dx.targetToHouseC, ctx.inp.t_house_c);

  ctx.dx.tVvxOffTheory = d1(tVvxOff);
  ctx.dx.tVvxOnTheory = d1(tVvxOn);
  ctx.dx.vvxCostOff = d1(costOff);
  ctx.dx.vvxCostOn = d1(costOn);

  if (costOn < (costOff - VVX_COST_HOLD_DB_C)) return 1;
  if (costOff < (costOn - VVX_COST_HOLD_DB_C)) return 0;
  return ctx.inp.vvx_on_actual;
}

function calcVvx(ctx) {
  ctx.dx.vvxOn = ctx.dx.fullAirReady ? decideVvxOn(ctx) : 0;
}
