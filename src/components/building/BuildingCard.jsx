import React from 'react';
import { Link } from 'react-router-dom';

const BuildingCard = ({ building }) => {
  // Count total risers and floors for the building
  const totalRisers = building.risers ? building.risers.length : 0;
  const totalFloors = building.floors ? building.floors.length : 0;

  return (
    <Link to={`/building/${building.id}`} className="block w-full">
      <div className="bg-[#0D1C22] p-4 rounded-lg shadow-lg hover:bg-gray-800 transition-colors duration-200">
        <h3 className="text-xl font-bold text-white mb-3">{building.name}</h3>

        {/* Technology information */}
        <div className="mb-2">
          <span className="text-gray-400 text-sm">Technologies: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {(building.technologySummary || building.technology || '').split(', ')
              .filter(tech => tech.trim() !== '')
              .map((tech, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-700 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
                >
                  {tech.trim()}
                </span>
              ))}
          </div>
        </div>

        <div className="space-y-1 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Complexity</span>
            <span className="text-white font-semibold">{building.complexityPercentage}%</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Required</span>
            <span className="text-white font-semibold">{building.requiredTechnicians} Techs</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Floors</span>
            <span className="text-white font-semibold">{totalFloors}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Risers</span>
            <span className="text-white font-semibold">{totalRisers}</span>
          </div>
        </div>

        <div className="flex items-center justify-end mt-2">
          <svg
            className="w-5 h-5 text-gray-400 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default BuildingCard;