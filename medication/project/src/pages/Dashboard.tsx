import React, { useState } from 'react';
import { PlusCircle, AlertTriangle, CheckCircle, Clock, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMedication } from '../contexts/MedicationContext';
import MedicationCard from '../components/medications/MedicationCard';
import Button from '../components/common/Button';
import Card, { CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Modal from '../components/common/Modal';
import MedicationForm from '../components/medications/MedicationForm';
import { Medication } from '../types';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    getTodaysMedications, 
    getUpcomingMedications, 
    getMissedMedications,
    getLowStockMedications,
    markMedicationAsTaken,
    addMedication
  } = useMedication();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get medication data
  const todaysMedications = getTodaysMedications();
  const upcomingMedications = getUpcomingMedications();
  const missedMedications = getMissedMedications();
  const lowStockMedications = getLowStockMedications();
  
  const handleAddMedication = (medicationData: Omit<Medication, 'id' | 'userId'>) => {
    addMedication(medicationData);
    setIsModalOpen(false);
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString(undefined, { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          icon={<PlusCircle size={20} />}
          className="mt-2 md:mt-0"
        >
          Add Medication
        </Button>
      </div>
      
      {/* Medication Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Medications</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{todaysMedications.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Doses</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{upcomingMedications.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 mr-4">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Missed Doses</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{missedMedications.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-4">
              <Package className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Low Stock</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{lowStockMedications.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Upcoming Medications */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Medications</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMedications.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No upcoming medications for today
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMedications.map(({ medication, time }) => {
                const timeObj = medication.times.find(t => t.time === time);
                return timeObj ? (
                  <MedicationCard
                    key={`${medication.id}-${timeObj.id}`}
                    medication={medication}
                    timeId={timeObj.id}
                    status="upcoming"
                    onMarkTaken={markMedicationAsTaken}
                  />
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Missed Medications */}
      {missedMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Missed Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {missedMedications.map(({ medication, time }) => {
                const timeObj = medication.times.find(t => t.time === time);
                return timeObj ? (
                  <MedicationCard
                    key={`${medication.id}-${timeObj.id}`}
                    medication={medication}
                    timeId={timeObj.id}
                    status="missed"
                    onMarkTaken={markMedicationAsTaken}
                  />
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Low Stock Medications */}
      {lowStockMedications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockMedications.map(medication => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  showActions={false}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Add Medication Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Medication"
        size="lg"
      >
        <MedicationForm 
          onSubmit={handleAddMedication}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;