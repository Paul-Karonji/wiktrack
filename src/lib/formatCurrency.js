export function formatKES(value) {
  return `KES ${Math.round(value).toLocaleString('en-KE')}`;
}

export function formatKESWithDecimals(value) {
  const hasDecimals = value % 1 !== 0;
  if (hasDecimals) {
    return `KES ${value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return formatKES(value);
}
