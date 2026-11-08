// Use the visitor's local calendar: November 15 through January 15, inclusive.
export function isChristmasSeason(date = new Date()): boolean {
  const month = date.getMonth();
  const day = date.getDate();
  return month === 11 || (month === 10 && day >= 15) || (month === 0 && day <= 15);
}

export function isChristmasEventActive(): boolean {
  if (import.meta.env.DEV) {
    const preview = new URLSearchParams(window.location.search).get('season');
    if (preview === 'christmas') return true;
    if (preview === 'normal') return false;
  }
  return isChristmasSeason();
}
