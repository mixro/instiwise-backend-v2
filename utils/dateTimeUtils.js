// utils/dateTimeUtils.js
import { format, parse, isToday, isBefore, isAfter } from 'date-fns';

const parseTime = (timeStr) => {
  // "09:00 AM" → Date object (today)
  return parse(timeStr, 'hh:mm a', new Date());
};

const parseDate = (dateStr) => {
  // "24/10/2025" → Date object
  return parse(dateStr, 'dd/MM/yyyy', new Date());
};

export const classifyEvent = (event) => {
  const eventDate = parseDate(event.date);
  const now = new Date();

  // Past: event date is before today
  if (isBefore(eventDate, now) && !isToday(eventDate)) {
    return 'past';
  }

  // Future: event date is after today
  if (isAfter(eventDate, now) && !isToday(eventDate)) {
    return 'upcoming';
  }

  // Today: Check time
  if (isToday(eventDate)) {
    const startTime = parseTime(event.start);
    const endTime = parseTime(event.end);

    if (isBefore(now, startTime)) return 'upcoming';
    if (isAfter(now, endTime)) return 'past';
    return 'ongoing'; // now >= start && now <= end
  }

  return 'past'; // fallback
};