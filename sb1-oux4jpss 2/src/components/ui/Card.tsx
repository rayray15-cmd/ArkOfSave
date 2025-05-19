import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className = "", children }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<CardProps> = ({ className = "", children }) => (
  <div className={`p-4 flex flex-col h-full ${className}`}>{children}</div>
);

export const CardShell: React.FC<CardProps> = ({ className = "", children }) => (
  <Card className={className}>
    <CardContent>{children}</CardContent>
  </Card>
);