// brain io-forced-mode 2.0.0
function isForcedMode(mode) { return mode === MODE_BST || mode === MODE_FIRE; }

function readForcedMode(ctx, cb) {
  kvsGet(KEY_MODE_FORCED_STATE, function (v) {
    if (v && typeof v === "object") {
      ctx.forced.mode = (v.mode === MODE_BST || v.mode === MODE_FIRE || v.mode === MODE_STD) ? v.mode : MODE_STD;
      ctx.forced.cycles = i(n(v.cycles, 0));
    } else {
      ctx.forced.mode = MODE_STD;
      ctx.forced.cycles = 0;
    }
    cb();
  });
}

function writeForcedMode(ctx, cb) {
  kvsSet(KEY_MODE_FORCED_STATE, { mode: ctx.forced.mode, cycles: ctx.forced.cycles }, cb);
}

function applyForcedModeTimeout(ctx, cb) {
  if (!isForcedMode(ctx.cmd.mode)) {
    ctx.forced.mode = MODE_STD;
    ctx.forced.cycles = 0;
    writeForcedMode(ctx, cb);
    return;
  }

  if (ctx.forced.mode === ctx.cmd.mode) ctx.forced.cycles = ctx.forced.cycles + 1;
  else {
    ctx.forced.mode = ctx.cmd.mode;
    ctx.forced.cycles = 1;
  }

  if (ctx.forced.cycles >= FORCED_MODE_MAX_CYCLES) {
    ctx.forced.mode = MODE_STD;
    ctx.forced.cycles = 0;
    ctx.cmd.mode = MODE_STD;
    enumSet(CMD_MODE_ID, MODE_STD, function () { writeForcedMode(ctx, cb); });
    return;
  }

  writeForcedMode(ctx, cb);
}
