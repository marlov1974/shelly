// brain io-commands 2.0.0
function normalizeMode(mode) {
  if (mode !== MODE_STD && mode !== MODE_BST && mode !== MODE_FIRE && mode !== MODE_MAN) return MODE_STD;
  return mode;
}

function readCommands(ctx, cb) {
  boolGet(CMD_ENABLE_ID, function (vEnable) {
    ctx.cmd.enable = vEnable;
    boolGet(CMD_NIGHT_SETBACK_ID, function (vNight) {
      ctx.cmd.night_setback = vNight;
      enumGet(CMD_MODE_ID, function (vMode) {
        ctx.cmd.mode = normalizeMode(vMode);
        numberGet(CMD_HOUSE_TEMP_ID, function (vTemp) {
          ctx.cmd.house_temp_c = n(vTemp, 21.0);
          cb();
        });
      });
    });
  });
}
