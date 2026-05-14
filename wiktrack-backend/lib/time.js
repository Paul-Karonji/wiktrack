const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

export function getNairobiDayWindow(date = new Date()) {
  const eatNow = new Date(date.getTime() + EAT_OFFSET_MS);
  const year = eatNow.getUTCFullYear();
  const month = eatNow.getUTCMonth();
  const day = eatNow.getUTCDate();

  const startUtc = new Date(Date.UTC(year, month, day) - EAT_OFFSET_MS);
  const endUtc = new Date(Date.UTC(year, month, day + 1) - EAT_OFFSET_MS);

  return {
    date: eatNow.toISOString().slice(0, 10),
    start: startUtc.toISOString(),
    end: endUtc.toISOString(),
  };
}
