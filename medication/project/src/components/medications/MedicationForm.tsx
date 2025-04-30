import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Clock } from 'lucide-react';
import { Medication, MedicationTime } from '../../types';
import { generateId, getPeriodFromTime } from '../../utils/helpers';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

interface MedicationFormProps {
  initialData?: Medication;
  onSubmit: (medication: Omit<Medication, 'id' | 'userId'>) => void;
  onCancel: () => void;
}

const emptyMedication: Omit<Medication, 'id' | 'userId'> = {
  name: '',
  dosage: '',
  frequency: 1,
  times: [],
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  quantityRemaining: 30,
  quantityThreshold: 5,
  notes: ''
};

const MedicationForm: React.FC<MedicationFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<Medication, 'id' | 'userId'>>(
    initialData ? 
      {
        name: initialData.name,
        dosage: initialData.dosage,
        frequency: initialData.frequency,
        times: [...initialData.times],
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        quantityRemaining: initialData.quantityRemaining,
        quantityThreshold: initialData.quantityThreshold,
        notes: initialData.notes || ''
      } 
      : emptyMedication
  );
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set up times based on frequency
  useEffect(() => {
    // Only initialize times if they're empty
    if (formData.times.length === 0) {
      initializeTimes();
    }
  }, [formData.frequency]);

  const initializeTimes = () => {
    const newTimes: MedicationTime[] = [];
    
    // Common times for different frequencies
    if (formData.frequency === 1) {
      newTimes.push({ id: generateId(), time: '09:00', period: 'morning' });
    } else if (formData.frequency === 2) {
      newTimes.push({ id: generateId(), time: '09:00', period: 'morning' });
      newTimes.push({ id: generateId(), time: '18:00', period: 'evening' });
    } else if (formData.frequency === 3) {
      newTimes.push({ id: generateId(), time: '09:00', period: 'morning' });
      newTimes.push({ id: generateId(), time: '14:00', period: 'afternoon' });
      newTimes.push({ id: generateId(), time: '20:00', period: 'night' });
    } else {
      // For 4 or more, add generic times
      for (let i = 0; i < formData.frequency; i++) {
        const hour = 8 + Math.floor(i * (16 / formData.frequency));
        const time = `${hour.toString().padStart(2, '0')}:00`;
        const period = getPeriodFromTime(time);
        newTimes.push({ id: generateId(), time, period });
      }
    }
    
    setFormData(prev => ({ ...prev, times: newTimes }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'frequency') {
      const frequency = parseInt(value, 10);
      setFormData(prev => ({ ...prev, frequency, times: [] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTimeChange = (id: string, time: string) => {
    const period = getPeriodFromTime(time);
    
    setFormData(prev => ({
      ...prev,
      times: prev.times.map(t => 
        t.id === id ? { ...t, time, period } : t
      )
    }));
  };

  const handleAddTime = () => {
    // Default to a reasonable time
    const newTime: MedicationTime = {
      id: generateId(),
      time: '12:00',
      period: 'afternoon'
    };
    
    setFormData(prev => ({
      ...prev,
      times: [...prev.times, newTime],
      frequency: prev.frequency + 1
    }));
  };

  const handleRemoveTime = (id: string) => {
    setFormData(prev => ({
      ...prev,
      times: prev.times.filter(t => t.id !== id),
      frequency: Math.max(1, prev.frequency - 1)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Medication name is required';
    }
    
    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }
    
    if (formData.times.length === 0) {
      newErrors.times = 'At least one time is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (formData.quantityRemaining < 0) {
      newErrors.quantityRemaining = 'Quantity must be 0 or greater';
    }
    
    if (formData.quantityThreshold < 0) {
      newErrors.quantityThreshold = 'Threshold must be 0 or greater';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Medication Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Aspirin"
            error={errors.name}
            required
          />
        </div>
        
        <div>
          <Input
            label="Dosage"
            id="dosage"
            name="dosage"
            value={formData.dosage}
            onChange={handleInputChange}
            placeholder="e.g., 500mg, 1 tablet"
            error={errors.dosage}
            required
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Schedule
          </label>
          <Button
            type="button"
            onClick={handleAddTime}
            variant="outline"
            size="sm"
            icon={<PlusCircle size={16} />}
          >
            Add Time
          </Button>
        </div>
        
        {errors.times && (
          <p className="text-sm text-red-600 mb-2">{errors.times}</p>
        )}
        
        <div className="space-y-3">
          {formData.times.map((time, index) => (
            <div key={time.id} className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <div className="flex-grow">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <Input
                    type="time"
                    value={time.time}
                    onChange={(e) => handleTimeChange(time.id, e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              {formData.times.length > 1 && (
                <Button
                  type="button"
                  onClick={() => handleRemoveTime(time.id)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500"
                  icon={<X size={16} />}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Start Date"
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleInputChange}
            error={errors.startDate}
            required
          />
        </div>
        
        <div>
          <Input
            label="End Date"
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleInputChange}
            error={errors.endDate}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Quantity Remaining"
            id="quantityRemaining"
            name="quantityRemaining"
            type="number"
            min="0"
            value={formData.quantityRemaining.toString()}
            onChange={handleInputChange}
            error={errors.quantityRemaining}
            required
          />
        </div>
        
        <div>
          <Input
            label="Low Stock Threshold"
            id="quantityThreshold"
            name="quantityThreshold"
            type="number"
            min="0"
            value={formData.quantityThreshold.toString()}
            onChange={handleInputChange}
            error={errors.quantityThreshold}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            You'll be notified when quantity falls below this number
          </p>
        </div>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleInputChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder="Special instructions or notes about this medication"
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Update Medication' : 'Add Medication'}
        </Button>
      </div>
    </form>
  );
};

export default MedicationForm;