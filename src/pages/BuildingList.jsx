import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBuildings } from '../services/api';
import BuildingCard from '../components/building/BuildingCard';
import BottomNav from '../components/ui/BottomNav';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';

const BuildingList = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // Get user from context
  const [searchQuery, setSearchQuery] = useState('');
  const [technologyFilter, setTechnologyFilter] = useState('');
  const [complexityFilter, setComplexityFilter] = useState('');

  // Get unique technologies from buildings for the dropdown
  const allTechnologies = [...new Set([
    'Huawei', 'Nokia', 'SmartOLT', 'U2000', 'Positron', // Default technologies
    ...buildings.flatMap(building => [
      building.technology || building.technologySummary
    ]).filter(Boolean)
  ])];

  const fetchBuildings = async () => {
    try {
      setLoading(true); // Set loading to true before fetching
      setError(''); // Clear any previous errors
      const data = await getBuildings(); // This should fetch from your API
      setBuildings(data);
    } catch (err) {
      console.error("Error fetching buildings:", err);
      setError(`Failed to load buildings: ${err.message || err}`);
    } finally {
      setLoading(false); // Always set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []); // Empty dependency array means this runs once on mount

  const filteredBuildings = buildings
    .filter(building =>
      building.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(building =>
      technologyFilter === '' ||
      (building.technology && building.technology.toLowerCase().includes(technologyFilter.toLowerCase())) ||
      (building.technologySummary && building.technologySummary.toLowerCase().includes(technologyFilter.toLowerCase()))
    )
    .filter(building => {
      if (complexityFilter === '') return true;
      const [min, max] = complexityFilter.split('-').map(Number);
      return building.complexityPercentage >= min && building.complexityPercentage <= max;
    });

  if (loading) {
    return (
      <div className="full-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Buildings...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Buildings</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Building List</h1>
          <div className="flex gap-2">
            <Button
              onClick={fetchBuildings}
              variant="outline"
              className="text-sm"
            >
              Refresh
            </Button>
            {user?.role === 'Admin' && (
              <Link to="/admin">
                <Button variant="secondary">Admin Dashboard</Button>
              </Link>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-4.35-4.35m2.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </span>
            <Input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D1C22] text-white rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex gap-4 mt-4">
            <select
              value={technologyFilter}
              onChange={(e) => setTechnologyFilter(e.target.value)}
              className="w-full bg-[#0D1C22] text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Technologies</option>
              {allTechnologies.map((tech, index) => (
                <option key={index} value={tech}>{tech}</option>
              ))}
            </select>
            <select
              value={complexityFilter}
              onChange={(e) => setComplexityFilter(e.target.value)}
              className="w-full bg-[#0D1C22] text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">All Complexities</option>
              <option value="0-50">0-50%</option>
              <option value="51-100">51-100%</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredBuildings.map(building => (
            <BuildingCard key={building.id} building={building} />
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default BuildingList;