import React from 'react';
import { Pill, Check, Clock, AlertCircle } from 'lucide-react';
import { Medication } from '../../types';
import { formatDate, formatTime, getPeriodColor, getPeriodFromTime } from '../../utils/helpers';
import Card, { CardContent } from '../common/Card';
import Button from '../common/Button';

interface MedicationCardProps {
  medication: Medication;
  onMarkTaken?: (medicationId: string, timeId: string) => void;
  onEdit?: (medication: Medication) => void;
  onDelete?: (medicationId: string) => void;
  showActions?: boolean;
  timeId?: string;
  status?: 'upcoming' | 'taken' | 'missed';
}

const MedicationCard: React.FC<MedicationCardProps> = ({
  medication,
  onMarkTaken,
  onEdit,
  onDelete,
  showActions = true,
  timeId,
  status,
}) => {
  // Get the time details if timeId is provided
  const timeDetails = timeId 
    ? medication.times.find(t => t.id === timeId) 
    : undefined;
  
  // Determine status color
  const getStatusColor = () => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'taken': return 'bg-green-500';
      case 'missed': return 'bg-red-500';
      default: return '';
    }
  };

  // Determine status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4 text-white" />;
      case 'taken': return <Check className="w-4 h-4 text-white" />;
      case 'missed': return <AlertCircle className="w-4 h-4 text-white" />;
      default: return null;
    }
  };

  // Format period for time
  const getPeriod = (time: string) => {
    const period = getPeriodFromTime(time);
    return (
      <span className={`text-xs font-medium ${getPeriodColor(period)}`}>
        {period.charAt(0).toUpperCase() + period.slice(1)}
      </span>
    );
  };

  return (
    <Card className="h-full">
      <CardContent className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {medication.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {medication.dosage}
              </p>
            </div>
          </div>
          
          {status && (
            <div className={`rounded-full w-6 h-6 ${getStatusColor()} flex items-center justify-center`}>
              {getStatusIcon()}
            </div>
          )}
        </div>
        
        <div className="mt-1 flex-grow">
          {timeDetails ? (
            <div className="mb-3">
              <div className="flex items-baseline">
                <span className="text-base font-medium text-gray-900 dark:text-white mr-2">
                  {formatTime(timeDetails.time)}
                </span>
                {getPeriod(timeDetails.time)}
              </div>
            </div>
          ) : (
            <div className="mb-3">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Schedule: </span>
                {medication.frequency} times daily
              </div>
              
              <div className="flex flex-wrap gap-2 mt-1">
                {medication.times.map(time => (
                  <div key={time.id} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                    {formatTime(time.time)}
                    <span className="ml-1 text-gray-500">{getPeriod(time.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-sm mb-2">
            <div className="text-gray-500 dark:text-gray-400">
              <span className="font-medium">Period: </span> 
              {formatDate(medication.startDate)} - {formatDate(medication.endDate)}
            </div>
            <div className="text-gray-500 dark:text-gray-400 mt-1">
              <span className="font-medium">Remaining: </span>
              <span className={medication.quantityRemaining <= medication.quantityThreshold ? 'text-red-500' : ''}>
                {medication.quantityRemaining} pills
              </span>
            </div>
          </div>
          
          {medication.notes && (
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-3 italic">
              {medication.notes}
            </div>
          )}
        </div>
        
        {showActions && status !== 'taken' && (
          <div className="mt-4 flex justify-between space-x-2">
            {status === 'upcoming' && onMarkTaken && timeId && (
              <Button 
                onClick={() => onMarkTaken(medication.id, timeId)}
                variant="success"
                fullWidth
                icon={<Check className="h-4 w-4" />}
              >
                Take Now
              </Button>
            )}
            
            {!status && (
              <>
                {onEdit && (
                  <Button
                    onClick={() => onEdit(medication)}
                    variant="outline"
                  >
                    Edit
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    onClick={() => onDelete(medication.id)}
                    variant="danger"
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationCard;