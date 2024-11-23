'use client';

import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'light' | 'dark';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type = 'text', variant = 'light', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={twMerge(
            "block text-sm font-medium leading-6 mb-2",
            variant === 'dark' ? 'text-gray-100' : 'text-gray-900'
          )}>
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <div className={variant === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                {icon}
              </div>
            </div>
          )}
          <input
            type={type}
            className={twMerge(
              `block w-full rounded-md border-0 py-2.5 px-3 ring-1 ring-inset 
              focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6
              disabled:cursor-not-allowed disabled:opacity-50`,
              variant === 'dark' 
                ? 'bg-gray-800 text-white ring-gray-700 placeholder:text-gray-500 focus:ring-blue-500'
                : 'bg-white text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-blue-600',
              icon && 'pl-10',
              error && 'ring-red-300 focus:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        {error && (
          <p className={twMerge(
            "mt-2 text-sm",
            variant === 'dark' ? 'text-red-400' : 'text-red-600'
          )}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
