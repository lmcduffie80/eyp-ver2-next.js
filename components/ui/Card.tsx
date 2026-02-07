import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const hoverStyles = hover
    ? 'transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer'
    : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-sm ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-5 bg-gray-50 border-b-2 border-gray-200 rounded-t-xl ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-5 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-5 bg-gray-50 border-t-2 border-gray-200 rounded-b-xl ${className}`}>
      {children}
    </div>
  );
}
