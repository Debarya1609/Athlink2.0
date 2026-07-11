import React, { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export function Button({
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-gold focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-brand-gold text-brand-black hover:bg-yellow-500',
    secondary: 'bg-brand-black text-white hover:bg-gray-800',
    outline: 'border-2 border-brand-black text-brand-black hover:bg-gray-50',
    ghost: 'bg-transparent text-brand-black hover:bg-gray-100',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
  }

  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth ? 'w-full' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
