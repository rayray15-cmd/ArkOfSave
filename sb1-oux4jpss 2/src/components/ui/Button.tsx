import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'icon' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  className = "",
  variant = "default",
  size = "default",
  children,
  ...props 
}) => {
  const base = "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-95";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  };
  
  const sizes = {
    sm: "h-8 px-3 text-sm rounded-md",
    icon: "h-8 w-8 rounded-lg",
    default: "h-9 px-4 rounded-md text-sm",
    lg: "h-10 px-6 rounded-lg",
  };
  
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};