// brain io-commands 2.1.0
var CMD_ENABLE_ID = 200;
var CMD_NIGHT_SETBACK_ID = 201;
var CMD_MODE_ID = 200;
var CMD_HOUSE_TEMP_ID = 200;

function readCommands(ctx, cb) {
  ctx.cmd.enable = 0;
  ctx.cmd.night_setback = 0;
  ctx.cmd.mode = MODE_STD;
  ctx.cmd.house_temp_c = 21.0;

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
