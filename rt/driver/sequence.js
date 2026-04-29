// driver sequence 1.0.0
function applyOnSequence(ctx, cb) {
  applyDampersIntent(ctx, function () {
    applyFansIntent(ctx, function () {
      applyVvxIntent(ctx, function () {
        applyThermalIntent(ctx, cb);
      });
    });
  });
}

function applyOffSequence(ctx, cb) {
  applyThermalOff(ctx, function () {
    applyVvxOn(ctx, 0, function () {
      applyFansOff(ctx, function () {
        applyDampersOn(ctx, 0, cb);
      });
    });
  });
}
