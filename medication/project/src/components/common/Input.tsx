import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', icon, fullWidth = true, ...props }, ref) => {
    const inputClasses = `
      px-4 py-2 border rounded-md shadow-sm placeholder-gray-400 
      focus:outline-none focus:ring-blue-500 focus:border-blue-500
      ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} 
      ${fullWidth ? 'w-full' : ''}
      ${icon ? 'pl-10' : ''}
      dark:bg-gray-800 dark:text-white
      ${className}
    `;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
          <input ref={ref} className={inputClasses} {...props} />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;