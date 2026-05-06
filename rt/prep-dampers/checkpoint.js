// prep-dampers checkpoint 1.0.0
function checkpointTargetPct(weekday, hour) {
  if (weekday === 1 && hour === 6) return 100;
  if (weekday === 1 && hour === 14) return 55;
  if (weekday === 1 && hour === 22) return 20;
  if (weekday === 2 && hour === 6) return 95;
  if (weekday === 2 && hour === 14) return 50;
  if (weekday === 2 && hour === 22) return 15;
  if (weekday === 3 && hour === 6) return 90;
  if (weekday === 3 && hour === 14) return 45;
  if (weekday === 3 && hour === 22) return 10;
  if (weekday === 4 && hour === 6) return 85;
  if (weekday === 4 && hour === 14) return 40;
  if (weekday === 4 && hour === 22) return 5;
  if (weekday === 5 && hour === 6) return 80;
  if (weekday === 5 && hour === 14) return 35;
  if (weekday === 5 && hour === 22) return 0;
  if (weekday === 6 && hour === 6) return 75;
  if (weekday === 6 && hour === 14) return 45;
  if (weekday === 6 && hour === 22) return 15;
  if (weekday === 7 && hour === 6) return 90;
  if (weekday === 7 && hour === 14) return 55;
  if (weekday === 7 && hour === 22) return 25;
  return 50;
}
