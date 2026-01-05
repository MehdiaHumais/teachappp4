import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ className = "" }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1);
  };
  return (
    <button
      onClick={handleClick}
      className={`back-button p-2 rounded-full hover:bg-gray-700 ${className}`}
      aria-label="Back"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
};

export default BackButton;