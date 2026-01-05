import React from 'react';

const FloorSelector = ({ floors, risers, onSelectFloor, selectedFloor }) => {
  // Function to count how many risers are on a specific floor
  const getRisersOnFloor = (floorNumber) => {
    if (!risers || !Array.isArray(risers)) return 0;

    return risers.filter(riser => {
      if (!riser.floorsCovered && !riser.floors_covered) return false;

      const floorsStr = riser.floorsCovered || riser.floors_covered;
      const ranges = floorsStr.split(',');
      const floors = [];

      ranges.forEach(range => {
        if (range.includes('-')) {
          const [start, end] = range.trim().split('-').map(Number);
          for (let i = start; i <= end; i++) {
            floors.push(i);
          }
        } else {
          floors.push(parseInt(range.trim()));
        }
      });

      return floors.includes(floorNumber);
    }).length;
  };

  return (
    <div className="relative">
      <select
        value={selectedFloor || ''}
        onChange={(e) => onSelectFloor(parseInt(e.target.value, 10))}
        className="w-full appearance-none bg-[#0D1C22] border-2 border-gray-700 text-white py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-teal-500"
      >
        <option value="">Select Your Current Floor</option>
        {floors.map(floor => {
          const risersCount = getRisersOnFloor(floor.number);
          return (
            <option key={floor.id} value={floor.number}>
              Floor {floor.number} {floor.description ? `(${floor.description})` : ''} {risersCount > 0 ? `(${risersCount} riser${risersCount !== 1 ? 's' : ''})` : ''}
            </option>
          );
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
};

export default FloorSelector;