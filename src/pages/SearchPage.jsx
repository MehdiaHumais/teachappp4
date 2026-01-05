import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBuildings } from '../services/api';
import BuildingCard from '../components/building/BuildingCard';
import Input from '../components/ui/Input';
import BottomNav from '../components/ui/BottomNav';

const SearchPage = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTech, setFilterTech] = useState('');
  const [filterComplexity, setFilterComplexity] = useState('');

  useEffect(() => {
    const fetchBuildings = async () => {
      const data = await getBuildings();
      setBuildings(data);
    };
    fetchBuildings();
  }, []);

  const filteredBuildings = buildings.filter(building => {
    const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          building.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          building.technologySummary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTech = !filterTech || building.technologySummary.includes(filterTech);
    const matchesComplexity = !filterComplexity || (
      (filterComplexity === 'low' && building.complexityPercentage <= 33) ||
      (filterComplexity === 'medium' && building.complexityPercentage > 33 && building.complexityPercentage <= 66) ||
      (filterComplexity === 'high' && building.complexityPercentage > 66)
    );
    return matchesSearch && matchesTech && matchesComplexity;
  });

  if (user?.role !== 'Technician' && user?.role !== 'Admin') {
    return <div className="text-center mt-10">Access Denied.</div>;
  }

  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Search Buildings</h1>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Search: 23 Elowell, Nokia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 input-mockup"
          />
          <select
            value={filterTech}
            onChange={(e) => setFilterTech(e.target.value)}
            className="input-mockup"
          >
            <option value="">Technology ▼</option>
            <option value="Huawei">Huawei</option>
            <option value="Nokia">Nokia</option>
            <option value="SmartOLT">SmartOLT</option>
            <option value="U2000">U2000</option>
            <option value="Positron">Positron</option>
          </select>
          <select
            value={filterComplexity}
            onChange={(e) => setFilterComplexity(e.target.value)}
            className="input-mockup"
          >
            <option value="">Complexity ▼</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
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

export default SearchPage;