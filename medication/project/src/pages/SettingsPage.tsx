import React, { useState } from 'react';
import { Save, Moon, Bell, User, Key } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Card, { CardContent, CardHeader, CardTitle } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { validateEmail } from '../utils/helpers';

const SettingsPage: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    enableNotifications: true,
    enableSounds: true,
    caretakerAlerts: true,
  });
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when typing
    if (name === 'name') setNameError('');
    if (name === 'email') setEmailError('');
    if (['currentPassword', 'newPassword', 'confirmPassword'].includes(name)) {
      setPasswordError('');
    }
    
    // Clear success message when changes are made
    setSuccessMessage('');
  };
  
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
    setSuccessMessage('');
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    let isValid = true;
    
    if (!formData.name.trim()) {
      setNameError('Name is required');
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }
    
    if (!isValid) return;
    
    // Check if email is already in use by another user
    if (formData.email !== currentUser?.email) {
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const emailExists = allUsers.some((user: any) => 
        user.email === formData.email && user.id !== currentUser?.id
      );
      
      if (emailExists) {
        setEmailError('Email is already in use');
        return;
      }
    }
    
    // Update user profile
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: formData.name,
        email: formData.email,
      };
      
      updateUser(updatedUser);
      setSuccessMessage('Profile updated successfully');
    }
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!formData.newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Verify current password
    if (formData.currentPassword !== currentUser?.password) {
      setPasswordError('Current password is incorrect');
      return;
    }
    
    // Update password
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        password: formData.newPassword,
      };
      
      updateUser(updatedUser);
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      
      setSuccessMessage('Password updated successfully');
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>
      
      {successMessage && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-md">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col space-y-1">
                <a href="#profile" className="text-blue-600 dark:text-blue-400 py-2 px-3 rounded-md bg-blue-50 dark:bg-blue-900/20">
                  Profile Information
                </a>
                <a href="#password" className="text-gray-700 dark:text-gray-300 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  Password
                </a>
                <a href="#appearance" className="text-gray-700 dark:text-gray-300 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  Appearance
                </a>
                <a href="#notifications" className="text-gray-700 dark:text-gray-300 py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  Notifications
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Information */}
          <Card id="profile">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <Input
                  label="Name"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={nameError}
                  icon={<User className="h-5 w-5" />}
                />
                
                <Input
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={emailError}
                  icon={<Mail className="h-5 w-5" />}
                />
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<Save className="h-4 w-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Password */}
          <Card id="password">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
                    {passwordError}
                  </div>
                )}
                
                <Input
                  label="Current Password"
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  icon={<Key className="h-5 w-5" />}
                />
                
                <Input
                  label="New Password"
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  icon={<Key className="h-5 w-5" />}
                />
                
                <Input
                  label="Confirm New Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  icon={<Key className="h-5 w-5" />}
                />
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={<Save className="h-4 w-4" />}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Appearance */}
          <Card id="appearance">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                    <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {theme === 'dark' ? 'Currently enabled' : 'Currently disabled'}
                    </p>
                  </div>
                </div>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                  <input
                    type="checkbox"
                    id="darkMode"
                    className="absolute w-0 h-0 opacity-0"
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />
                  <label
                    htmlFor="darkMode"
                    className={`absolute inset-0 cursor-pointer rounded-full ${
                      theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 transition-transform duration-200 ease-in-out bg-white rounded-full ${
                        theme === 'dark' ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notifications */}
          <Card id="notifications">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="mr-3 p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                      <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Enable Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive reminders for your medications
                      </p>
                    </div>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="enableNotifications"
                      name="enableNotifications"
                      className="absolute w-0 h-0 opacity-0"
                      checked={notificationSettings.enableNotifications}
                      onChange={handleToggleChange}
                    />
                    <label
                      htmlFor="enableNotifications"
                      className={`absolute inset-0 cursor-pointer rounded-full ${
                        notificationSettings.enableNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 transition-transform duration-200 ease-in-out bg-white rounded-full ${
                          notificationSettings.enableNotifications ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="mr-3 p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                      <span className="block h-5 w-5 text-center text-gray-700 dark:text-gray-300">🔊</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Notification Sounds</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Play sounds for notification alerts
                      </p>
                    </div>
                  </div>
                  <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                    <input
                      type="checkbox"
                      id="enableSounds"
                      name="enableSounds"
                      className="absolute w-0 h-0 opacity-0"
                      checked={notificationSettings.enableSounds}
                      onChange={handleToggleChange}
                    />
                    <label
                      htmlFor="enableSounds"
                      className={`absolute inset-0 cursor-pointer rounded-full ${
                        notificationSettings.enableSounds ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 transition-transform duration-200 ease-in-out bg-white rounded-full ${
                          notificationSettings.enableSounds ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </label>
                  </div>
                </div>
                
                {currentUser?.role === 'patient' && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className="mr-3 p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                        <User className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Caretaker Alerts</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Notify caretakers when you miss medications
                        </p>
                      </div>
                    </div>
                    <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                      <input
                        type="checkbox"
                        id="caretakerAlerts"
                        name="caretakerAlerts"
                        className="absolute w-0 h-0 opacity-0"
                        checked={notificationSettings.caretakerAlerts}
                        onChange={handleToggleChange}
                      />
                      <label
                        htmlFor="caretakerAlerts"
                        className={`absolute inset-0 cursor-pointer rounded-full ${
                          notificationSettings.caretakerAlerts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 transition-transform duration-200 ease-in-out bg-white rounded-full ${
                            notificationSettings.caretakerAlerts ? 'transform translate-x-6' : ''
                          }`}
                        />
                      </label>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <Button
                    variant="primary"
                    icon={<Save className="h-4 w-4" />}
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;