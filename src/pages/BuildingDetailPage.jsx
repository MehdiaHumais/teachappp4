import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBuildingById, findNearestRisers, getBuildings, findRisersOnFloor } from '../services/api';
import BottomNav from '../components/ui/BottomNav';
import BackButton from '../components/ui/BackButton';
import Button from '../components/ui/Button';
import FloorSelector from '../components/Building/FloorSelector';
import NearestRiserDisplay from '../components/Building/NearestRiserDisplay';

const BuildingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [allBuildings, setAllBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [riserInfo, setRiserInfo] = useState({ onCurrentFloor: [], above: null, below: null });
  const [risersOnFloor, setRisersOnFloor] = useState([]);
  const [selectedRiser, setSelectedRiser] = useState(null);
  const [showRiserSelection, setShowRiserSelection] = useState(false);
  const [imageSections, setImageSections] = useState({
    parking: false,
    entrance: false,
    riser: false,
    panel: false,
    other: false
  });

  useEffect(() => {
    const fetchBuilding = async () => {
      try {
        setLoading(true);
        const [buildingData, allBuildingsData] = await Promise.all([
          getBuildingById(id),
          getBuildings()
        ]);

        if (buildingData) {
          setBuilding(buildingData);
        } else {
          setError('Building not found.');
        }

        setAllBuildings(allBuildingsData);
      } catch (err) {
        setError('Failed to fetch building details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBuilding();
  }, [id]);

  // Function to get all linked images for this building
  const getLinkedImages = () => {
    if (!allBuildings || !building) return [];

    const linkedImages = [];

    allBuildings.forEach(b => {
      if (b.images && b.images.length > 0) {
        b.images.forEach(img => {
          if (img.linkedBuildingIds && img.linkedBuildingIds.includes(parseInt(id))) {
            // Add building name to the image to show which building it's from
            linkedImages.push({
              ...img,
              sourceBuilding: b.name,
              isLinked: true
            });
          }
        });
      }
    });

    return linkedImages;
  };

  useEffect(() => {
    if (building && selectedFloor !== null) {
      const info = findNearestRisers(building, selectedFloor);
      setRiserInfo(info);

      // Also find risers that are on this specific floor
      const risers = findRisersOnFloor(building, selectedFloor);
      setRisersOnFloor(risers);

      // If there are multiple risers on this floor, show the selection modal
      if (risers.length > 1) {
        setShowRiserSelection(true);
        setSelectedRiser(null); // Reset selected riser when showing selection
      } else if (risers.length === 1) {
        // If there's only one riser, automatically select it
        setSelectedRiser(risers[0]);
        setShowRiserSelection(false);
      } else {
        // If there are no risers on this floor, clear selection
        setSelectedRiser(null);
        setShowRiserSelection(false);
      }
    } else {
      setRiserInfo({ onCurrentFloor: [], above: null, below: null });
      setRisersOnFloor([]);
      setSelectedRiser(null);
      setShowRiserSelection(false);
    }
  }, [building, selectedFloor]);

  const toggleImageSection = (section) => {
    setImageSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRiserSelect = (riser) => {
    setSelectedRiser(riser);
    setShowRiserSelection(false);
  };

  const handleRiserSelectionCancel = () => {
    setShowRiserSelection(false);
    setSelectedRiser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B181C] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B181C] flex flex-col items-center justify-center text-white p-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate('/buildings')} className="mt-4 bg-teal-500 text-black">
          Back to Buildings
        </Button>
      </div>
    );
  }

  if (!building) {
    return null;
  }

  // Get linked images
  const linkedImages = getLinkedImages();

  // Combine direct and linked images
  const allImages = [
    ...(building.images || []).map(img => ({...img, isLinked: false})),
    ...linkedImages
  ];

  // Group images by type
  const groupedImages = {
    parking: allImages.filter(img => img.type === 'Parking').map(img => ({url: img.url, isLinked: img.isLinked, sourceBuilding: img.sourceBuilding})),
    entrance: allImages.filter(img => img.type === 'Entrance').map(img => ({url: img.url, isLinked: img.isLinked, sourceBuilding: img.sourceBuilding})),
    riser: allImages.filter(img => img.type === 'Riser').map(img => ({url: img.url, isLinked: img.isLinked, sourceBuilding: img.sourceBuilding})),
    panel: allImages.filter(img => img.type === 'Panel').map(img => ({url: img.url, isLinked: img.isLinked, sourceBuilding: img.sourceBuilding})),
    other: allImages.filter(img => img.type === 'Other').map(img => ({url: img.url, isLinked: img.isLinked, sourceBuilding: img.sourceBuilding}))
  };

  return (
    <div className="min-h-screen bg-[#0B181C] text-white flex flex-col">
      <div className="p-4 flex-grow relative pt-12 pb-20">
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">{building.name}</h1>
          <p className="text-gray-400">{building.address}</p>
          <p className="text-teal-400 font-semibold">Direction: {building.direction || 'N/A'}</p>
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-gray-400">Technologies: </span>
            {(building.technologySummary || building.technology || '').split(', ').filter(tech => tech.trim() !== '').map(tech => (
              <span key={tech} className="inline-block bg-gray-700 text-white text-sm font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                {tech.trim()}
              </span>
            ))}
          </div>

          <p><span className="text-gray-400">Complexity:</span> {building.complexityPercentage}%</p>
          <p><span className="text-gray-400">Required Techs:</span> {building.requiredTechnicians}</p>

          {/* Parking Images */}
          <div>
            <p className="flex items-center">
              <span className="text-gray-400 mr-4">Parking:</span>
              {groupedImages.parking.length > 0 && (
                <Button onClick={() => toggleImageSection('parking')} className="bg-gray-700 text-white py-1 px-3 rounded-lg">
                  {imageSections.parking ? 'Hide' : 'View'} Parking Photos ({groupedImages.parking.length})
                </Button>
              )}
            </p>
            <p className="mt-2 text-gray-300">{building.parkingInstructions}</p>
            {imageSections.parking && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {groupedImages.parking.map((imgData, index) => (
                  <div key={index} className="relative">
                    <img src={imgData.url} alt={`Parking ${index + 1}`} className="w-full h-auto rounded-lg"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }} />
                    {imgData.isLinked && imgData.sourceBuilding && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg flex justify-between items-center">
                        <span>From: {imgData.sourceBuilding}</span>
                        {imgData.linkedBuildingIds && imgData.linkedBuildingIds.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Navigate to the first linked building
                              const firstLinkedBuildingId = imgData.linkedBuildingIds[0];
                              navigate(`/building/${firstLinkedBuildingId}`);
                            }}
                            className="ml-2 text-xs bg-blue-600 hover:bg-blue-700 px-1 py-0.5 rounded"
                          >
                            Open
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Entrance Images */}
          {groupedImages.entrance.length > 0 && (
            <div>
              <p className="flex items-center">
                <span className="text-gray-400 mr-4">Entrance:</span>
                <Button onClick={() => toggleImageSection('entrance')} className="bg-gray-700 text-white py-1 px-3 rounded-lg">
                  {imageSections.entrance ? 'Hide' : 'View'} Entrance Photos ({groupedImages.entrance.length})
                </Button>
              </p>
              {imageSections.entrance && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {groupedImages.entrance.map((imgData, index) => (
                    <div key={index} className="relative">
                      <img src={imgData.url} alt={`Entrance ${index + 1}`} className="w-full h-auto rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }} />
                      {imgData.isLinked && imgData.sourceBuilding && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg flex justify-between items-center">
                          <span>From: {imgData.sourceBuilding}</span>
                          {imgData.isLinked && imgData.sourceBuilding && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Find the building ID that corresponds to the source building
                                const sourceBuilding = allBuildings.find(b => b.name === imgData.sourceBuilding);
                                if (sourceBuilding) {
                                  navigate(`/building/${sourceBuilding.id}`);
                                }
                              }}
                              className="ml-2 text-xs bg-blue-600 hover:bg-blue-700 px-1 py-0.5 rounded"
                            >
                              Open
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Riser Images */}
          {groupedImages.riser.length > 0 && (
            <div>
              <p className="flex items-center">
                <span className="text-gray-400 mr-4">Riser:</span>
                <Button onClick={() => toggleImageSection('riser')} className="bg-gray-700 text-white py-1 px-3 rounded-lg">
                  {imageSections.riser ? 'Hide' : 'View'} Riser Photos ({groupedImages.riser.length})
                </Button>
              </p>
              {imageSections.riser && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {groupedImages.riser.map((imgData, index) => (
                    <div key={index} className="relative">
                      <img src={imgData.url} alt={`Riser ${index + 1}`} className="w-full h-auto rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }} />
                      {imgData.isLinked && imgData.sourceBuilding && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg flex justify-between items-center">
                          <span>From: {imgData.sourceBuilding}</span>
                          {imgData.isLinked && imgData.sourceBuilding && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Find the building ID that corresponds to the source building
                                const sourceBuilding = allBuildings.find(b => b.name === imgData.sourceBuilding);
                                if (sourceBuilding) {
                                  navigate(`/building/${sourceBuilding.id}`);
                                }
                              }}
                              className="ml-2 text-xs bg-blue-600 hover:bg-blue-700 px-1 py-0.5 rounded"
                            >
                              Open
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Panel Images */}
          {groupedImages.panel.length > 0 && (
            <div>
              <p className="flex items-center">
                <span className="text-gray-400 mr-4">Panel:</span>
                <Button onClick={() => toggleImageSection('panel')} className="bg-gray-700 text-white py-1 px-3 rounded-lg">
                  {imageSections.panel ? 'Hide' : 'View'} Panel Photos ({groupedImages.panel.length})
                </Button>
              </p>
              {imageSections.panel && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {groupedImages.panel.map((imgData, index) => (
                    <div key={index} className="relative">
                      <img src={imgData.url} alt={`Panel ${index + 1}`} className="w-full h-auto rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }} />
                      {imgData.isLinked && imgData.sourceBuilding && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg flex justify-between items-center">
                          <span>From: {imgData.sourceBuilding}</span>
                          {imgData.isLinked && imgData.sourceBuilding && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Find the building ID that corresponds to the source building
                                const sourceBuilding = allBuildings.find(b => b.name === imgData.sourceBuilding);
                                if (sourceBuilding) {
                                  navigate(`/building/${sourceBuilding.id}`);
                                }
                              }}
                              className="ml-2 text-xs bg-blue-600 hover:bg-blue-700 px-1 py-0.5 rounded"
                            >
                              Open
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Other Images */}
          {groupedImages.other.length > 0 && (
            <div>
              <p className="flex items-center">
                <span className="text-gray-400 mr-4">Other:</span>
                <Button onClick={() => toggleImageSection('other')} className="bg-gray-700 text-white py-1 px-3 rounded-lg">
                  {imageSections.other ? 'Hide' : 'View'} Other Photos ({groupedImages.other.length})
                </Button>
              </p>
              {imageSections.other && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {groupedImages.other.map((imgData, index) => (
                    <div key={index} className="relative">
                      <img src={imgData.url} alt={`Other ${index + 1}`} className="w-full h-auto rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }} />
                      {imgData.isLinked && imgData.sourceBuilding && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg flex justify-between items-center">
                          <span>From: {imgData.sourceBuilding}</span>
                          {imgData.isLinked && imgData.sourceBuilding && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Find the building ID that corresponds to the source building
                                const sourceBuilding = allBuildings.find(b => b.name === imgData.sourceBuilding);
                                if (sourceBuilding) {
                                  navigate(`/building/${sourceBuilding.id}`);
                                }
                              }}
                              className="ml-2 text-xs bg-blue-600 hover:bg-blue-700 px-1 py-0.5 rounded"
                            >
                              Open
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Risers Section */}
          {building.risers && building.risers.length > 0 && (
            <div>
              <p className="text-gray-400 mb-2">All Risers:</p>
              <div className="space-y-2">
                {building.risers.map(riser => {
                  // Parse floors covered to show which specific floors this riser serves
                  const parseFloors = (floorsStr) => {
                    if (typeof floorsStr !== 'string') return [];
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
                    return floors;
                  };

                  const floors = parseFloors(riser.floors_covered || riser.floorsCovered);

                  return (
                    <div key={riser.id} className="mockup-card p-3 bg-gray-800 rounded-lg">
                      <p><span className="font-bold">{riser.number}</span></p>
                      <p className="text-sm">Floors: {riser.floors_covered || riser.floorsCovered || 'N/A'}</p>
                      {floors.length > 0 && (
                        <p className="text-xs text-gray-300">Specific floors: {floors.join(', ')}</p>
                      )}
                      <p className="text-sm">Location: {riser.location_description || riser.locationDescription || 'N/A'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-gray-400 mb-2">Floors:</p>
            <FloorSelector
              floors={building.floors}
              risers={building.risers}
              onSelectFloor={setSelectedFloor}
              selectedFloor={selectedFloor}
            />
          </div>

          <div>
            <NearestRiserDisplay
              riserInfo={riserInfo}
              selectedRiser={selectedRiser}
              onRiserChange={() => setShowRiserSelection(true)}
            />
          </div>

          {/* Display risers that are on the selected floor */}
          {selectedFloor !== null && risersOnFloor.length > 0 && (
            <div className="mt-4">
              <p className="text-gray-400 mb-2">Risers on Floor {selectedFloor}:</p>
              <div className="space-y-2">
                {risersOnFloor.map(riser => (
                  <div key={riser.id} className="mockup-card p-3 bg-gray-800 rounded-lg">
                    <p><span className="font-bold">{riser.number}</span></p>
                    <p className="text-sm">Floors: {riser.floors_covered || riser.floorsCovered || 'N/A'}</p>
                    <p className="text-sm">Location: {riser.location_description || riser.locationDescription || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {selectedFloor !== null && risersOnFloor.length === 0 && (
            <div className="mt-4">
              <p className="text-gray-400 mb-2">Risers on Floor {selectedFloor}:</p>
              <p className="text-sm text-gray-500">No risers on this floor</p>
            </div>
          )}

          <div className="pt-4">
            <Link to={`/pdfs/${building.id}`} className="block w-full bg-[#00BFA5] text-black text-center font-bold py-3 rounded-lg hover:bg-teal-400 transition-colors">
              View ONT Configuration PDFs
            </Link>
          </div>
        </div>
      </div>

      {/* Riser Selection Modal */}
      {showRiserSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Select Riser on Floor {selectedFloor}</h3>
            <p className="text-sm text-gray-400 mb-4">Multiple risers found on this floor. Please select the specific riser you're referring to:</p>

            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {risersOnFloor.map(riser => (
                <div
                  key={riser.id}
                  className={`mockup-card p-3 rounded-lg cursor-pointer ${
                    selectedRiser && selectedRiser.id === riser.id
                      ? 'bg-teal-600 border border-teal-400'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={() => handleRiserSelect(riser)}
                >
                  <p className="font-bold">{riser.number}</p>
                  <p className="text-sm">Floors: {riser.floors_covered || riser.floorsCovered || 'N/A'}</p>
                  <p className="text-sm">Location: {riser.location_description || riser.locationDescription || 'N/A'}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRiserSelectionCancel}
                className="btn-mockup-outline flex-grow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default BuildingDetailPage;