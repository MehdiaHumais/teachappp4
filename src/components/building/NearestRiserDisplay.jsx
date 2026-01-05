import React from 'react';
import Button from '../ui/Button';

const NearestRiserDisplay = ({ riserInfo, selectedRiser, onRiserChange }) => {
  const { onCurrentFloor, above, below } = riserInfo;

  return (
    <div className="space-y-3">
      {/* Display selected riser if one is selected */}
      {selectedRiser && (
        <div className="bg-teal-900 border border-teal-700 p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <strong>Selected Riser:</strong>
              <div className="mt-1">
                <p className="font-bold">{selectedRiser.number}</p>
                <p>Floors: {selectedRiser.floors_covered || selectedRiser.floorsCovered || 'N/A'}</p>
                <p>Location: {selectedRiser.location_description || selectedRiser.locationDescription || 'N/A'}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={() => {
                // If there's a callback function passed, use it to reset riser selection
                if (typeof onRiserChange === 'function') {
                  onRiserChange();
                }
              }}
            >
              Change
            </Button>
          </div>
          <Button variant="outline" size="sm" className="mt-2">View Riser Details</Button>
        </div>
      )}

      {/* Risers on the current floor */}
      {onCurrentFloor && onCurrentFloor.length > 0 && !selectedRiser && (
        <div>
          <strong>Risers on Current Floor:</strong>
          <div className="mt-1 space-y-1">
            {onCurrentFloor.map((riser, index) => (
              <div key={riser.id || index} className="p-2 border border-gray-600 rounded">
                <p className="font-bold">{riser.number}</p>
                <p>Floors: {riser.floors_covered || riser.floorsCovered || 'N/A'}</p>
                <p>Location: {riser.location_description || riser.locationDescription || 'N/A'}</p>
                <Button variant="outline" size="sm" className="mt-1">View Riser Details</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nearest riser above */}
      {above && !selectedRiser ? (
        <div>
          <strong>Nearest Riser Above:</strong> {above.number} ({above.distance} floor{above.distance > 1 ? 's' : ''} above)
          <div className="mt-1 p-2 border border-gray-600 rounded">
            <p>Floors: {above.floors_covered || above.floorsCovered || 'N/A'}</p>
            <p>Location: {above.location_description || above.locationDescription || 'N/A'}</p>
            <Button variant="outline" size="sm" className="mt-2">View Riser Details</Button>
          </div>
        </div>
      ) : !selectedRiser && (
        <p>No riser above.</p>
      )}

      {/* Nearest riser below */}
      {below && !selectedRiser ? (
        <div>
          <strong>Nearest Riser Below:</strong> {below.number} ({below.distance} floor{below.distance > 1 ? 's' : ''} below)
          <div className="mt-1 p-2 border border-gray-600 rounded">
            <p>Floors: {below.floors_covered || below.floorsCovered || 'N/A'}</p>
            <p>Location: {below.location_description || below.locationDescription || 'N/A'}</p>
            <Button variant="outline" size="sm" className="mt-2">View Riser Details</Button>
          </div>
        </div>
      ) : !selectedRiser && (
        <p>No riser below.</p>
      )}
    </div>
  );
};

export default NearestRiserDisplay;