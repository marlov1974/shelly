// poll context 1.0.0
function createPollCtx() {
  return {
    supply: {
      pa: 0,
      ls: 0,
      rpm: 0,
      fan_on: 0,
      fan_pct: 0,
      fan_w: 0,
      fan_run: 0,
      temp_post_vvx: 0,
      temp_outdoor: 0,
      temp_to_outdoor: 0
    },
    extract: {
      pa: 0,
      ls: 0,
      rpm: 0,
      fan_on: 0,
      fan_pct: 0,
      fan_w: 0,
      fan_run: 0,
      temp_to_house: 0,
      temp_brine: 0,
      temp_hotwater: 0
    },
    process: {
      rpm_vvx: 0,
      co2_ppm: 0,
      temp_house: 20.0,
      rh_house: 60
    },
    heat: { on: 0, pct: 0, w: 0, run: 0 },
    cool: { on: 0, pct: 0, w: 0, run: 0 },
    vvx: { on: 0, w: 0, run: 0, eff_pct: 0 },
    dmp: { on: 0, run: 0 },
    power: { total_w: 0 },
    fan: { avg_pct: 0 },
    hist: { vvx_r0: 0.0, vvx_r1: 0.0, vvx_r2: 0.0 }
  };
}
