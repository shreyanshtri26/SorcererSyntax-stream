export const getEventDateTime = (dayStr, timeStr) => {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  const dayLower = dayStr.toLowerCase();
  if (dayLower.includes('today')) {
    // Keep today
  } else if (dayLower.includes('tomorrow')) {
    target.setDate(target.getDate() + 1);
  } else {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = daysOfWeek.findIndex(d => dayLower.includes(d));
    if (targetDayIndex !== -1) {
      const currentDayIndex = now.getDay();
      let diff = targetDayIndex - currentDayIndex;
      if (diff < 0) diff += 7;
      target.setDate(target.getDate() + diff);
    } else {
      const cleanDayStr = dayStr.replace(/^[a-zA-Z]+/, '').trim();
      const currentYear = now.getFullYear();
      const parsedDate = new Date(`${cleanDayStr} ${currentYear}`);
      if (!isNaN(parsedDate.getTime())) {
        target.setDate(parsedDate.getDate());
        target.setMonth(parsedDate.getMonth());
      }
    }
  }
  return target;
};
