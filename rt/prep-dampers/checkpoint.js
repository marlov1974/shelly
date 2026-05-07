// prep-dampers checkpoint 1.3.0-calendar-periods
function checkpointTargetPct(weekday, hour) {
  if (weekday === 1 && hour === 8) return 100;
  if (weekday === 1 && hour === 16) return 55;
  if (weekday === 2 && hour === 0) return 20;
  if (weekday === 2 && hour === 8) return 95;
  if (weekday === 2 && hour === 16) return 50;
  if (weekday === 3 && hour === 0) return 15;
  if (weekday === 3 && hour === 8) return 90;
  if (weekday === 3 && hour === 16) return 45;
  if (weekday === 4 && hour === 0) return 10;
  if (weekday === 4 && hour === 8) return 85;
  if (weekday === 4 && hour === 16) return 40;
  if (weekday === 5 && hour === 0) return 5;
  if (weekday === 5 && hour === 8) return 80;
  if (weekday === 5 && hour === 16) return 35;
  if (weekday === 6 && hour === 0) return 0;
  if (weekday === 6 && hour === 8) return 75;
  if (weekday === 6 && hour === 16) return 45;
  if (weekday === 7 && hour === 0) return 15;
  if (weekday === 7 && hour === 8) return 90;
  if (weekday === 7 && hour === 16) return 55;
  if (weekday === 1 && hour === 0) return 25;
  return 50;
}
