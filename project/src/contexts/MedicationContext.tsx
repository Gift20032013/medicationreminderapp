import React, { createContext, useContext, useState, useEffect } from 'react';
import { Medication, MedicationLog, User } from '../types';
import { generateId } from '../utils/helpers';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { isBefore, isAfter, parseISO, format } from 'date-fns';

interface MedicationContextType {
  medications: Medication[];
  medicationLogs: MedicationLog[];
  addMedication: (medication: Omit<Medication, 'id' | 'userId'>) => Medication;
  updateMedication: (medication: Medication) => void;
  deleteMedication: (id: string) => void;
  markMedicationAsTaken: (medicationId: string, timeId: string) => void;
  getMedicationById: (id: string) => Medication | undefined;
  getLogsForMedication: (medicationId: string) => MedicationLog[];
  getTodaysMedications: () => Medication[];
  getUpcomingMedications: () => { medication: Medication; time: string }[];
  getMissedMedications: () => { medication: Medication; time: string }[];
  getLowStockMedications: () => Medication[];
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined);

export const useMedication = (): MedicationContextType => {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedication must be used within a MedicationProvider');
  }
  return context;
};

export const MedicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<MedicationLog[]>([]);

  // Load medications from localStorage on mount and when user changes
  useEffect(() => {
    if (currentUser) {
      const storedMedications = JSON.parse(localStorage.getItem('medications') || '[]') as Medication[];
      setMedications(storedMedications.filter(m => m.userId === currentUser.id));
      
      const storedLogs = JSON.parse(localStorage.getItem('medicationLogs') || '[]') as MedicationLog[];
      setMedicationLogs(storedLogs.filter(l => l.userId === currentUser.id));
    } else {
      setMedications([]);
      setMedicationLogs([]);
    }
  }, [currentUser]);

  // Save medications to localStorage when they change
  useEffect(() => {
    if (currentUser) {
      const allMedications = JSON.parse(localStorage.getItem('medications') || '[]') as Medication[];
      const otherMedications = allMedications.filter(m => m.userId !== currentUser.id);
      localStorage.setItem('medications', JSON.stringify([...otherMedications, ...medications]));
    }
  }, [medications, currentUser]);

  // Save medication logs to localStorage when they change
  useEffect(() => {
    if (currentUser) {
      const allLogs = JSON.parse(localStorage.getItem('medicationLogs') || '[]') as MedicationLog[];
      const otherLogs = allLogs.filter(l => l.userId !== currentUser.id);
      localStorage.setItem('medicationLogs', JSON.stringify([...otherLogs, ...medicationLogs]));
    }
  }, [medicationLogs, currentUser]);

  // Check for medications that should be taken now
  useEffect(() => {
    if (!currentUser) return;

    const checkMedications = () => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      
      medications.forEach(medication => {
        // Check if medication is active for today
        const startDate = parseISO(medication.startDate);
        const endDate = parseISO(medication.endDate);
        
        if (isBefore(now, startDate) || isAfter(now, endDate)) {
          return;
        }
        
        medication.times.forEach(timeSlot => {
          const [hour, minute] = timeSlot.time.split(':').map(Number);
          const medicationTime = new Date();
          medicationTime.setHours(hour, minute, 0, 0);
          
          const timeDiff = Math.abs(now.getTime() - medicationTime.getTime()) / 60000; // Difference in minutes
          
          // Check if it's time to take medication (within 5 minutes) and hasn't been taken yet
          if (timeDiff <= 5) {
            // Check if notification has already been sent
            const todayLogs = medicationLogs.filter(log => 
              log.medicationId === medication.id && 
              log.scheduledTime.startsWith(format(now, 'yyyy-MM-dd'))
            );
            
            const alreadyNotified = todayLogs.some(log => 
              log.scheduledTime === `${format(now, 'yyyy-MM-dd')} ${timeSlot.time}`
            );
            
            if (!alreadyNotified) {
              // Add notification
              addNotification({
                userId: currentUser.id,
                medicationId: medication.id,
                title: 'Medication Reminder',
                message: `Time to take ${medication.name} - ${medication.dosage}`,
                type: 'reminder',
              });
              
              // Add to logs as 'missed' initially - will be updated to 'taken' if user marks it
              const newLog: MedicationLog = {
                id: generateId(),
                medicationId: medication.id,
                userId: currentUser.id,
                scheduledTime: `${format(now, 'yyyy-MM-dd')} ${timeSlot.time}`,
                status: 'missed',
              };
              
              setMedicationLogs(prev => [...prev, newLog]);
              
              // If user has caretakers, schedule a missed medication notification
              if (currentUser.role === 'patient' && currentUser.caretakers && currentUser.caretakers.length > 0) {
                // This would typically be handled by a server, but we'll simulate it
                setTimeout(() => {
                  // Check if the medication was taken
                  const latestLogs = JSON.parse(localStorage.getItem('medicationLogs') || '[]') as MedicationLog[];
                  const log = latestLogs.find(l => l.id === newLog.id);
                  
                  if (log && log.status === 'missed') {
                    // Notify caretakers
                    const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
                    currentUser.caretakers!.forEach(caretakerId => {
                      const caretaker = allUsers.find(u => u.id === caretakerId);
                      if (caretaker) {
                        addNotification({
                          userId: caretakerId,
                          medicationId: medication.id,
                          title: 'Missed Medication',
                          message: `${currentUser.name} missed their ${medication.name} dose at ${timeSlot.time}`,
                          type: 'missed',
                        });
                      }
                    });
                  }
                }, 60 * 60 * 1000); // Check after 1 hour
              }
            }
          }
        });
        
        // Check for low stock
        if (medication.quantityRemaining <= medication.quantityThreshold) {
          // Add low stock notification if not already notified
          addNotification({
            userId: currentUser.id,
            medicationId: medication.id,
            title: 'Low Medication Stock',
            message: `You have only ${medication.quantityRemaining} ${medication.name} left. Time to refill!`,
            type: 'low-stock',
          });
        }
      });
    };
    
    // Check immediately and then every 5 minutes
    checkMedications();
    const interval = setInterval(checkMedications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [medications, medicationLogs, currentUser, addNotification]);

  const addMedication = (medicationData: Omit<Medication, 'id' | 'userId'>): Medication => {
    if (!currentUser) throw new Error('User must be logged in to add medication');
    
    const newMedication: Medication = {
      ...medicationData,
      id: generateId(),
      userId: currentUser.id,
    };
    
    setMedications(prev => [...prev, newMedication]);
    return newMedication;
  };

  const updateMedication = (medication: Medication) => {
    if (!currentUser) throw new Error('User must be logged in to update medication');
    if (medication.userId !== currentUser.id) throw new Error('Cannot update medication that does not belong to user');
    
    setMedications(prev => prev.map(m => m.id === medication.id ? medication : m));
  };

  const deleteMedication = (id: string) => {
    if (!currentUser) throw new Error('User must be logged in to delete medication');
    
    const medication = medications.find(m => m.id === id);
    if (!medication) throw new Error('Medication not found');
    if (medication.userId !== currentUser.id) throw new Error('Cannot delete medication that does not belong to user');
    
    setMedications(prev => prev.filter(m => m.id !== id));
    // Also remove logs
    setMedicationLogs(prev => prev.filter(l => l.medicationId !== id));
  };

  const markMedicationAsTaken = (medicationId: string, timeId: string) => {
    if (!currentUser) throw new Error('User must be logged in to mark medication as taken');
    
    const medication = medications.find(m => m.id === medicationId);
    if (!medication) throw new Error('Medication not found');
    
    const timeSlot = medication.times.find(t => t.id === timeId);
    if (!timeSlot) throw new Error('Time slot not found');
    
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const scheduledTime = `${today} ${timeSlot.time}`;
    
    // Find existing log for this medication at this time
    const existingLogIndex = medicationLogs.findIndex(
      l => l.medicationId === medicationId && l.scheduledTime === scheduledTime
    );
    
    if (existingLogIndex >= 0) {
      // Update existing log
      const updatedLogs = [...medicationLogs];
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        status: 'taken',
        takenTime: format(now, 'yyyy-MM-dd HH:mm:ss')
      };
      setMedicationLogs(updatedLogs);
    } else {
      // Create new log
      const newLog: MedicationLog = {
        id: generateId(),
        medicationId,
        userId: currentUser.id,
        scheduledTime,
        status: 'taken',
        takenTime: format(now, 'yyyy-MM-dd HH:mm:ss')
      };
      setMedicationLogs(prev => [...prev, newLog]);
    }
    
    // Update remaining quantity
    const updatedMedication = {
      ...medication,
      quantityRemaining: Math.max(0, medication.quantityRemaining - 1)
    };
    updateMedication(updatedMedication);
  };

  const getMedicationById = (id: string) => {
    return medications.find(m => m.id === id);
  };

  const getLogsForMedication = (medicationId: string) => {
    return medicationLogs.filter(l => l.medicationId === medicationId);
  };

  const getTodaysMedications = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return medications.filter(med => {
      const startDate = med.startDate;
      const endDate = med.endDate;
      return startDate <= today && endDate >= today;
    });
  };

  const getUpcomingMedications = () => {
    const now = new Date();
    const todayDateStr = format(now, 'yyyy-MM-dd');
    const currentTime = format(now, 'HH:mm');
    
    const upcoming: { medication: Medication; time: string }[] = [];
    
    getTodaysMedications().forEach(med => {
      med.times.forEach(timeSlot => {
        if (timeSlot.time > currentTime) {
          const scheduledTime = `${todayDateStr} ${timeSlot.time}`;
          const log = medicationLogs.find(l => 
            l.medicationId === med.id && 
            l.scheduledTime === scheduledTime
          );
          
          if (!log || log.status === 'missed') {
            upcoming.push({ medication: med, time: timeSlot.time });
          }
        }
      });
    });
    
    return upcoming.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getMissedMedications = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const missed: { medication: Medication; time: string }[] = [];
    
    medicationLogs
      .filter(log => log.status === 'missed' && log.scheduledTime.startsWith(today))
      .forEach(log => {
        const medication = medications.find(med => med.id === log.medicationId);
        if (medication) {
          const time = log.scheduledTime.split(' ')[1];
          missed.push({ medication, time });
        }
      });
    
    return missed;
  };

  const getLowStockMedications = () => {
    return medications.filter(med => med.quantityRemaining <= med.quantityThreshold);
  };

  const value = {
    medications,
    medicationLogs,
    addMedication,
    updateMedication,
    deleteMedication,
    markMedicationAsTaken,
    getMedicationById,
    getLogsForMedication,
    getTodaysMedications,
    getUpcomingMedications,
    getMissedMedications,
    getLowStockMedications
  };

  return <MedicationContext.Provider value={value}>{children}</MedicationContext.Provider>;
};