import React, { useState, useEffect } from 'react';
import { User, Pill as Pills, Clock, AlertTriangle, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { User as UserType, Medication, MedicationLog } from '../types';
import { formatDate, formatTime } from '../utils/helpers';

const PatientPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  const [patients, setPatients] = useState<UserType[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<UserType | null>(null);
  const [patientMedications, setPatientMedications] = useState<Medication[]>([]);
  const [patientLogs, setPatientLogs] = useState<MedicationLog[]>([]);
  
  useEffect(() => {
    if (currentUser?.patients?.length) {
      // Fetch patient details from localStorage
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as UserType[];
      const userPatients = allUsers.filter(
        user => currentUser.patients?.includes(user.id)
      );
      setPatients(userPatients);
      
      // If no patient is selected, select the first one
      if (userPatients.length > 0 && !selectedPatient) {
        setSelectedPatient(userPatients[0]);
      }
    } else {
      setPatients([]);
      setSelectedPatient(null);
    }
  }, [currentUser, selectedPatient]);
  
  useEffect(() => {
    if (selectedPatient) {
      // Fetch patient's medications
      const allMedications = JSON.parse(localStorage.getItem('medications') || '[]') as Medication[];
      const patientMeds = allMedications.filter(med => med.userId === selectedPatient.id);
      setPatientMedications(patientMeds);
      
      // Fetch patient's logs
      const allLogs = JSON.parse(localStorage.getItem('medicationLogs') || '[]') as MedicationLog[];
      const patientMedLogs = allLogs.filter(log => log.userId === selectedPatient.id);
      setPatientLogs(patientMedLogs);
    } else {
      setPatientMedications([]);
      setPatientLogs([]);
    }
  }, [selectedPatient]);
  
  // Get today's logs
  const getTodaysLogs = () => {
    const today = new Date().toISOString().split('T')[0];
    return patientLogs.filter(log => log.scheduledTime.startsWith(today));
  };
  
  // Calculate statistics
  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = patientLogs.filter(log => log.scheduledTime.startsWith(today));
    
    return {
      totalMedications: patientMedications.length,
      totalDosesToday: todayLogs.length,
      takenToday: todayLogs.filter(log => log.status === 'taken').length,
      missedToday: todayLogs.filter(log => log.status === 'missed').length,
    };
  };
  
  // Find medication name by ID
  const getMedicationName = (medicationId: string) => {
    const medication = patientMedications.find(med => med.id === medicationId);
    return medication ? medication.name : 'Unknown Medication';
  };
  
  const stats = getStats();
  const todaysLogs = getTodaysLogs();
  
  if (patients.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Patients
        </h1>
        
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You don't have any patients yet
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Patients will appear here once they add you as their caretaker
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Patients
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patients.map(patient => (
                  <div
                    key={patient.id}
                    className={`
                      p-3 rounded-md cursor-pointer flex items-center
                      ${selectedPatient?.id === patient.id 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }
                    `}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{patient.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Patient Details */}
        <div className="lg:col-span-3">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Patient Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium">
                        {selectedPatient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                          {selectedPatient.name}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                          {selectedPatient.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Mail size={16} />}
                      onClick={() => window.location.href = `mailto:${selectedPatient.email}`}
                    >
                      Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Medication Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                  <CardContent className="flex items-center p-4">
                    <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                      <Pills className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Medications</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.totalMedications}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800">
                  <CardContent className="flex items-center p-4">
                    <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 mr-4">
                      <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Doses Today</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.totalDosesToday}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                  <CardContent className="flex items-center p-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
                      <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taken Today</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.takenToday}</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                  <CardContent className="flex items-center p-4">
                    <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 mr-4">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Missed Today</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">{stats.missedToday}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Today's Medication Log */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Medication Log</CardTitle>
                </CardHeader>
                <CardContent>
                  {todaysLogs.length === 0 ? (
                    <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No medication logs for today
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {todaysLogs.map(log => (
                        <div key={log.id} className="py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`
                              h-8 w-8 rounded-full flex items-center justify-center mr-3
                              ${log.status === 'taken' 
                                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                              }
                            `}>
                              {log.status === 'taken' 
                                ? <Clock className="h-4 w-4" />
                                : <AlertTriangle className="h-4 w-4" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {getMedicationName(log.medicationId)}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {log.scheduledTime.split(' ')[1]} ({formatTime(log.scheduledTime.split(' ')[1])})
                              </p>
                            </div>
                          </div>
                          <div className={`
                            px-3 py-1 rounded-full text-sm
                            ${log.status === 'taken' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            }
                          `}>
                            {log.status === 'taken' ? 'Taken' : 'Missed'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* All Medications */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  {patientMedications.length === 0 ? (
                    <p className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No medications added yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {patientMedications.map(medication => (
                        <div 
                          key={medication.id}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center mb-2">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                              <Pills className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {medication.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {medication.dosage}
                              </p>
                            </div>
                          </div>
                          
                          <div className="ml-13 space-y-1 text-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Schedule:</span> {medication.frequency} times daily
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Period:</span> {formatDate(medication.startDate)} - {formatDate(medication.endDate)}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Remaining:</span> {medication.quantityRemaining} pills
                            </p>
                            
                            <div className="mt-2">
                              <span className="font-medium text-gray-600 dark:text-gray-400">Times:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {medication.times.map(time => (
                                  <span 
                                    key={time.id}
                                    className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded"
                                  >
                                    {formatTime(time.time)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a patient to view their details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientPage;