import { format, formatDistance, formatDistanceToNow } from 'date-fns';

export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy'): string => {
  try {
    return format(new Date(date), formatStr);
  } catch {
    return 'Invalid date';
  }
};

export const formatDateTime = (date: string | Date): string => {
  try {
    return format(new Date(date), 'MMM dd, yyyy hh:mm a');
  } catch {
    return 'Invalid date';
  }
};

export const formatTime = (date: string | Date): string => {
  try {
    return format(new Date(date), 'hh:mm a');
  } catch {
    return 'Invalid time';
  }
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Invalid date';
  }
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
