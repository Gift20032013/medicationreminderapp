import React from 'react';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  onClick,
  className = '',
  children,
}) => {
  if (count === 0) return <>{children}</>;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div className={`relative inline-block ${className}`} onClick={onClick}>
      {children}
      <div className="absolute -top-1 -right-1 flex items-center justify-center">
        <span className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-medium text-white">
          {displayCount}
        </span>
      </div>
    </div>
  );
};

export default NotificationBadge;