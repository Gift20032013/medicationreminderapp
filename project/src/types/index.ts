export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'caretaker';
  caretakers?: string[]; // Array of caretaker IDs (for patients)
  patients?: string[]; // Array of patient IDs (for caretakers)
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: number; // Times per day
  times: MedicationTime[];
  startDate: string;
  endDate: string;
  quantityRemaining: number;
  quantityThreshold: number;
  notes?: string;
}

export interface MedicationTime {
  id: string;
  time: string; // 24-hour format (HH:MM)
  period: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  userId: string;
  scheduledTime: string;
  status: 'taken' | 'missed';
  takenTime?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  medicationId: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'reminder' | 'missed' | 'low-stock' | 'caretaker-invite' | 'system';
}

export interface AppSettings {
  userId: string;
  darkMode: boolean;
  notifications: boolean;
  caretakerAlerts: boolean;
  reminderTiming: number; // minutes before scheduled time
}