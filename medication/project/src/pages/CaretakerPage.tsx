import React, { useState, useEffect } from 'react';
import { Plus, UserX, Mail, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Card, { CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { validateEmail } from '../utils/helpers';
import { User } from '../types';
import { useNotifications } from '../contexts/NotificationContext';

const CaretakerPage: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const { addNotification } = useNotifications();
  
  const [caretakers, setCaretakers] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [caretakerEmail, setCaretakerEmail] = useState('');
  const [error, setError] = useState('');
  const [currentCaretaker, setCurrentCaretaker] = useState<User | null>(null);
  
  useEffect(() => {
    if (currentUser?.caretakers?.length) {
      // Fetch caretaker details from localStorage
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      const userCaretakers = allUsers.filter(
        user => currentUser.caretakers?.includes(user.id)
      );
      setCaretakers(userCaretakers);
    } else {
      setCaretakers([]);
    }
  }, [currentUser]);
  
  const handleAddCaretaker = () => {
    if (!caretakerEmail.trim()) {
      setError('Please enter an email address');
      return;
    }
    
    if (!validateEmail(caretakerEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Check if caretaker exists
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const caretaker = allUsers.find(
      user => user.email === caretakerEmail && user.role === 'caretaker'
    );
    
    if (!caretaker) {
      setError('No caretaker found with this email');
      return;
    }
    
    // Check if already added
    if (currentUser?.caretakers?.includes(caretaker.id)) {
      setError('This caretaker is already added');
      return;
    }
    
    // Add caretaker to user's list
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        caretakers: [...(currentUser.caretakers || []), caretaker.id]
      };
      
      // Update caretaker's patients list
      const updatedCaretaker = {
        ...caretaker,
        patients: [...(caretaker.patients || []), currentUser.id]
      };
      
      // Update both in localStorage
      const updatedUsers = allUsers.map(user => {
        if (user.id === currentUser.id) return updatedUser;
        if (user.id === caretaker.id) return updatedCaretaker;
        return user;
      });
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Update current user state
      updateUser(updatedUser);
      
      // Add notification for the caretaker
      addNotification({
        userId: caretaker.id,
        medicationId: '', // No specific medication
        title: 'New Patient Connection',
        message: `${currentUser.name} has added you as their caretaker`,
        type: 'caretaker-invite',
      });
      
      // Close modal and reset form
      setIsAddModalOpen(false);
      setCaretakerEmail('');
      setError('');
    }
  };
  
  const handleRemoveCaretaker = () => {
    if (!currentCaretaker || !currentUser) return;
    
    // Remove from user's caretakers
    const updatedUser = {
      ...currentUser,
      caretakers: currentUser.caretakers?.filter(id => id !== currentCaretaker.id) || []
    };
    
    // Remove from caretaker's patients
    const updatedCaretaker = {
      ...currentCaretaker,
      patients: currentCaretaker.patients?.filter(id => id !== currentUser.id) || []
    };
    
    // Update both in localStorage
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const updatedUsers = allUsers.map(user => {
      if (user.id === currentUser.id) return updatedUser;
      if (user.id === currentCaretaker.id) return updatedCaretaker;
      return user;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Update current user state
    updateUser(updatedUser);
    
    // Add notification for the caretaker
    addNotification({
      userId: currentCaretaker.id,
      medicationId: '', // No specific medication
      title: 'Patient Connection Removed',
      message: `${currentUser.name} has removed you as their caretaker`,
      type: 'system',
    });
    
    // Close modal
    setIsRemoveModalOpen(false);
    setCurrentCaretaker(null);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Caretakers
        </h1>
        
        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          icon={<Plus size={20} />}
          className="mt-2 md:mt-0"
        >
          Add Caretaker
        </Button>
      </div>
      
      {caretakers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You haven't added any caretakers yet
            </p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              variant="primary"
              icon={<Plus size={20} />}
            >
              Add Your First Caretaker
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caretakers.map(caretaker => (
            <Card key={caretaker.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-medium">
                      {caretaker.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {caretaker.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {caretaker.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Mail size={16} />}
                    onClick={() => window.location.href = `mailto:${caretaker.email}`}
                  >
                    Email
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<UserX size={16} />}
                    onClick={() => {
                      setCurrentCaretaker(caretaker);
                      setIsRemoveModalOpen(true);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Caretaker Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setCaretakerEmail('');
          setError('');
        }}
        title="Add Caretaker"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Enter the email address of the caretaker you want to add. They must have a caretaker account on MedRemind.
          </p>
          
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}
          
          <Input
            label="Caretaker Email"
            value={caretakerEmail}
            onChange={(e) => setCaretakerEmail(e.target.value)}
            placeholder="caretaker@example.com"
            type="email"
            icon={<Mail className="h-5 w-5" />}
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddModalOpen(false);
                setCaretakerEmail('');
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddCaretaker}
              icon={<Send size={16} />}
            >
              Add Caretaker
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Remove Caretaker Modal */}
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        title="Remove Caretaker"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to remove {currentCaretaker?.name} as your caretaker? 
            They will no longer receive notifications about your medications.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsRemoveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRemoveCaretaker}
              icon={<UserX size={16} />}
            >
              Remove Caretaker
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CaretakerPage;