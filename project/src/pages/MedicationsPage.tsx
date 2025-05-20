import React, { useState } from 'react';
import { PlusCircle, Search, Trash2, Edit } from 'lucide-react';
import { useMedication } from '../contexts/MedicationContext';
import MedicationCard from '../components/medications/MedicationCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import MedicationForm from '../components/medications/MedicationForm';
import { Medication } from '../types';

const MedicationsPage: React.FC = () => {
  const { 
    medications, 
    addMedication, 
    updateMedication, 
    deleteMedication 
  } = useMedication();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentMedication, setCurrentMedication] = useState<Medication | null>(null);
  
  // Filter medications based on search term
  const filteredMedications = medications.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.dosage.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleEditMedication = (medication: Medication) => {
    setCurrentMedication(medication);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteMedication = (medication: Medication) => {
    setCurrentMedication(medication);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDeleteMedication = () => {
    if (currentMedication) {
      deleteMedication(currentMedication.id);
      setIsDeleteModalOpen(false);
    }
  };
  
  const handleSubmitAdd = (medicationData: Omit<Medication, 'id' | 'userId'>) => {
    addMedication(medicationData);
    setIsAddModalOpen(false);
  };
  
  const handleSubmitEdit = (medicationData: Omit<Medication, 'id' | 'userId'>) => {
    if (currentMedication) {
      updateMedication({
        ...medicationData,
        id: currentMedication.id,
        userId: currentMedication.userId
      });
      setIsEditModalOpen(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Medications
        </h1>
        
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          icon={<PlusCircle size={20} />}
          className="mt-2 md:mt-0"
        >
          Add Medication
        </Button>
      </div>
      
      {/* Search */}
      <div className="w-full max-w-md">
        <Input
          placeholder="Search medications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-5 w-5" />}
          fullWidth
        />
      </div>
      
      {/* Medications list */}
      {filteredMedications.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm ? 'No medications found matching your search' : 'No medications added yet'}
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              icon={<PlusCircle size={20} />}
            >
              Add Your First Medication
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedications.map(medication => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onEdit={() => handleEditMedication(medication)}
              onDelete={() => handleDeleteMedication(medication)}
            />
          ))}
        </div>
      )}
      
      {/* Add Medication Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Medication"
        size="lg"
      >
        <MedicationForm 
          onSubmit={handleSubmitAdd}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>
      
      {/* Edit Medication Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Medication"
        size="lg"
      >
        {currentMedication && (
          <MedicationForm 
            initialData={currentMedication}
            onSubmit={handleSubmitEdit}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Medication"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete {currentMedication?.name}? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteMedication}
              icon={<Trash2 size={16} />}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MedicationsPage;