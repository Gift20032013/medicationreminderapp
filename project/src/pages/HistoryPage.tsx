import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { useMedication } from '../contexts/MedicationContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  subWeeks, 
  addWeeks,
  parseISO
} from 'date-fns';

const HistoryPage: React.FC = () => {
  const { medications, medicationLogs } = useMedication();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  
  // Calculate date range for the current view
  const startDate = view === 'day' ? currentDate : startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = view === 'day' ? currentDate : endOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Get days for the week view
  const daysOfWeek = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Filter logs for the current view
  const getFilteredLogs = () => {
    if (view === 'day') {
      return medicationLogs.filter(log => {
        const logDate = parseISO(log.scheduledTime.split(' ')[0]);
        return isSameDay(logDate, currentDate);
      });
    } else {
      return medicationLogs.filter(log => {
        const logDate = parseISO(log.scheduledTime.split(' ')[0]);
        return (
          logDate >= startOfWeek(currentDate, { weekStartsOn: 1 }) && 
          logDate <= endOfWeek(currentDate, { weekStartsOn: 1 })
        );
      });
    }
  };
  
  const filteredLogs = getFilteredLogs();
  
  // Navigation functions
  const goToPreviousPeriod = () => {
    if (view === 'day') {
      setCurrentDate(prev => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(prev => subWeeks(prev, 1));
    }
  };
  
  const goToNextPeriod = () => {
    if (view === 'day') {
      setCurrentDate(prev => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
    } else {
      setCurrentDate(prev => addWeeks(prev, 1));
    }
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Get medication name by ID
  const getMedicationName = (medicationId: string) => {
    const medication = medications.find(med => med.id === medicationId);
    return medication ? medication.name : 'Unknown Medication';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Medication History
        </h1>
        
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          <Button
            variant={view === 'day' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('day')}
          >
            Day
          </Button>
          <Button
            variant={view === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('week')}
          >
            Week
          </Button>
        </div>
      </div>
      
      {/* Calendar navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {view === 'day' 
                  ? format(currentDate, 'MMMM d, yyyy')
                  : `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
                }
              </h2>
            </div>
            
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPeriod}
                icon={<ChevronLeft className="h-4 w-4" />}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPeriod}
                icon={<ChevronRight className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Week view calendar */}
      {view === 'week' && (
        <div className="grid grid-cols-7 gap-2">
          {daysOfWeek.map(day => (
            <div 
              key={day.toString()} 
              className={`
                rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden 
                ${isSameDay(day, new Date()) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'bg-white dark:bg-gray-800'}
              `}
            >
              <div className="px-2 py-1 text-center border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {format(day, 'E')}
                </div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {format(day, 'd')}
                </div>
              </div>
              <div className="p-1">
                {/* Show day's logs summary */}
                {medicationLogs
                  .filter(log => {
                    const logDate = parseISO(log.scheduledTime.split(' ')[0]);
                    return isSameDay(logDate, day);
                  })
                  .map(log => (
                    <div 
                      key={log.id} 
                      className={`
                        text-xs p-1 mb-1 rounded-md
                        ${log.status === 'taken' 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                        }
                      `}
                    >
                      {log.status === 'taken' ? (
                        <CheckCircle2 className="inline-block h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="inline-block h-3 w-3 mr-1" />
                      )}
                      <span className="truncate">{getMedicationName(log.medicationId)}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Log List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {view === 'day' 
              ? `Medication Log for ${format(currentDate, 'MMMM d, yyyy')}` 
              : 'Medication Log for This Week'
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No medication logs found for this period
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLogs.map(log => {
                const medicationName = getMedicationName(log.medicationId);
                const [dateStr, timeStr] = log.scheduledTime.split(' ');
                const date = parseISO(dateStr);
                
                return (
                  <div key={log.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {log.status === 'taken' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mr-3" />
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {medicationName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Scheduled: {format(date, 'MMM d')} at {timeStr}
                          </p>
                          {log.takenTime && (
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Taken at: {format(parseISO(log.takenTime), 'h:mm a')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${log.status === 'taken' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }
                      `}>
                        {log.status === 'taken' ? 'Taken' : 'Missed'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;