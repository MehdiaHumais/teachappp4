import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-gray-900 rounded-lg shadow-md p-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;