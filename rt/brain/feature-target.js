// brain feature-target 2.1.0
var NIGHT_SETBACK_DELTA_C = 1.0;
var NIGHT_SETBACK_START_HOUR = 19;
var NIGHT_SETBACK_END_HOUR = 4;

var WEATHER_BIAS_START_HOUR = 4;
var WEATHER_BIAS_END_HOUR = 19;
var WEATHER_SOLAR_NEUTRAL_KWH = 15;
var WEATHER_TEMP_NEUTRAL_C = 5;
var WEATHER_SOLAR_SLOPE_C_PER_KWH = 0.04;
var WEATHER_TEMP_WARM_SLOPE_C_PER_C = 0.10;
var WEATHER_TEMP_COLD_SLOPE_C_PER_C = 0.10;
var WEATHER_BIAS_MIN_C = -3.0;
var WEATHER_BIAS_MAX_C = 1.5;

var DP_A = 17.62;
var DP_B = 243.12;

function isNightSetbackWindow() {
  var hour = getHourNow();
  return (hour >= NIGHT_SETBACK_START_HOUR || hour < NIGHT_SETBACK_END_HOUR) ? 1 : 0;
}

function isWeatherBiasWindow() {
  var hour = getHourNow();
  return (hour >= WEATHER_BIAS_START_HOUR && hour < WEATHER_BIAS_END_HOUR) ? 1 : 0;
}

function calcWeatherBiasC(solarKwh, tempC) {
  var solarBias = 0;
  var tempBias = 0;
  var s = n(solarKwh, 0);
  var t = n(tempC, WEATHER_TEMP_NEUTRAL_C);

  if (s > WEATHER_SOLAR_NEUTRAL_KWH) {
    solarBias = -WEATHER_SOLAR_SLOPE_C_PER_KWH * (s - WEATHER_SOLAR_NEUTRAL_KWH);
  }

  if (t > WEATHER_TEMP_NEUTRAL_C) {
    tempBias = -WEATHER_TEMP_WARM_SLOPE_C_PER_C * (t - WEATHER_TEMP_NEUTRAL_C);
  } else if (t < WEATHER_TEMP_NEUTRAL_C) {
    tempBias = WEATHER_TEMP_COLD_SLOPE_C_PER_C * (WEATHER_TEMP_NEUTRAL_C - t);
  }

  return clip(solarBias + tempBias, WEATHER_BIAS_MIN_C, WEATHER_BIAS_MAX_C);
}

function calcDewPointC(tempC, rhPct) {
  var rh = clip(rhPct, 1, 100);
  var gamma = (DP_A * tempC) / (DP_B + tempC) + Math.log(rh / 100);
  return (DP_B * gamma) / (DP_A - gamma);
}

function calcTarget(ctx) {
  var targetRawC;
  var dewPointHouseC;

  targetRawC = ctx.cmd.house_temp_c - clip(ctx.inp.t_house_c - ctx.cmd.house_temp_c, -10, 10);

  if (ctx.cmd.night_setback && isNightSetbackWindow()) {
    targetRawC = targetRawC - NIGHT_SETBACK_DELTA_C;
  }

  if (isWeatherBiasWindow()) {
    ctx.dx.weatherBiasC = calcWeatherBiasC(ctx.weather.solar_kwh_today, ctx.weather.temp_now_c);
    targetRawC = targetRawC + ctx.dx.weatherBiasC;
  } else {
    ctx.dx.weatherBiasC = 0;
  }

  dewPointHouseC = calcDewPointC(ctx.inp.t_house_c, ctx.inp.rh_house_pct);
  ctx.dx.targetToHouseC = max2(targetRawC, dewPointHouseC);
  ctx.dx.supplyDeltaPostC = ctx.dx.targetToHouseC - ctx.inp.t_post_vvx_c;
  ctx.dx.deltaToHouseC = ctx.dx.targetToHouseC - ctx.inp.t_to_house_c;
}
