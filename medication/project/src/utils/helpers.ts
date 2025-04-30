import { v4 as uuidv4 } from 'uuid';
import { format, parseISO } from 'date-fns';

export const generateId = (): string => {
  return uuidv4();
};

export const formatDate = (dateString: string): string => {
  return format(parseISO(dateString), 'MMM d, yyyy');
};

export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const isPM = hour >= 12;
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
};

export const getPeriodFromTime = (time: string): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = parseInt(time.split(':')[0], 10);
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

export const getPeriodColor = (period: 'morning' | 'afternoon' | 'evening' | 'night'): string => {
  switch (period) {
    case 'morning': return 'text-yellow-500';
    case 'afternoon': return 'text-orange-500';
    case 'evening': return 'text-blue-500';
    case 'night': return 'text-indigo-800';
    default: return 'text-gray-500';
  }
};

export const getPeriodIcon = (period: 'morning' | 'afternoon' | 'evening' | 'night'): string => {
  switch (period) {
    case 'morning': return 'sun';
    case 'afternoon': return 'sun';
    case 'evening': return 'sunset';
    case 'night': return 'moon';
    default: return 'clock';
  }
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
};