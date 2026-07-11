import React, { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, fullWidth = true, ...props }, ref) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
        {label && (
          <label className="block text-sm font-medium text-brand-black mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            block w-full rounded-md border border-gray-300 px-3 py-2 text-brand-black 
            placeholder-gray-400 focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold sm:text-sm min-h-[44px]
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
