const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isToday(date) {
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

function isThisWeek(date) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek;
}

function isThisYear(date) {
  return date.getFullYear() === new Date().getFullYear();
}

export function formatTime(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toLocaleTimeString('en-KE', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatTransactionDate(date) {
  if (!(date instanceof Date)) date = new Date(date);

  if (isToday(date)) {
    return formatTime(date);
  }
  if (isYesterday(date)) {
    return `Yesterday, ${formatTime(date)}`;
  }
  if (isThisWeek(date)) {
    return `${DAYS[date.getDay()]}, ${formatTime(date)}`;
  }
  const yearSuffix = isThisYear(date) ? '' : `, ${date.getFullYear()}`;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}${yearSuffix}, ${formatTime(date)}`;
}

export function formatDetailDate(date) {
  if (!(date instanceof Date)) date = new Date(date);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatGroupHeader(date) {
  if (!(date instanceof Date)) date = new Date(date);

  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return 'This Week';
  const yearSuffix = isThisYear(date) ? '' : `, ${date.getFullYear()}`;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}${yearSuffix}`;
}

export function formatRelativeTime(date) {
  if (!date) return '';
  if (!(date instanceof Date)) date = new Date(date);

  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Synced just now';
  if (diffMins < 60) return `Synced ${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Synced ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  return `Synced ${Math.floor(diffHours / 24)} day${Math.floor(diffHours / 24) === 1 ? '' : 's'} ago`;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
