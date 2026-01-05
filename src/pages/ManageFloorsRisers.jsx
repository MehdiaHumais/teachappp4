import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBuildings, addFloorToBuilding, removeFloorFromBuilding, addRiserToBuilding, removeRiserFromBuilding } from '../services/api'; // Fetch buildings to link floors/risers
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BottomNav from '../components/ui/BottomNav';
import BackButton from '../components/ui/BackButton';

const ManageFloorsRisers = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [floors, setFloors] = useState([]);
  const [risers, setRisers] = useState([]);
  const [newFloor, setNewFloor] = useState({ number: '', description: '' });
  const [newRiser, setNewRiser] = useState({ number: '', floorsCovered: '', locationDescription: '' });

  useEffect(() => {
    const fetchBuildings = async () => {
      const data = await getBuildings(); 
      setBuildings(data);
    };
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (selectedBuildingId) {
      const building = buildings.find(b => b.id === selectedBuildingId);
      if (building) {
        setFloors(building.floors || []);
        setRisers(building.risers || []);
      }
    } else {
      setFloors([]);
      setRisers([]);
    }
  }, [selectedBuildingId, buildings]);

  if (user?.role !== 'Admin') {
    return <div className="text-center mt-10">Access Denied. Admins Only.</div>;
  }

  const handleAddFloor = async () => {
    if (!selectedBuildingId || !newFloor.number) return; // Basic validation
    try {
      const newFloorObj = { number: parseInt(newFloor.number), description: newFloor.description };
      await addFloorToBuilding(selectedBuildingId, newFloorObj);
      // Fetch updated list to reflect the change properly
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === selectedBuildingId);
      if (updatedBuilding) {
        setFloors(updatedBuilding.floors || []);
      }
      setNewFloor({ number: '', description: '' });
    } catch (err) {
      console.error("Error adding floor:", err);
    }
  };

  const handleAddRiser = async () => {
    if (!selectedBuildingId || !newRiser.number) return;
    try {
      const newRiserObj = { number: newRiser.number, floorsCovered: newRiser.floorsCovered, locationDescription: newRiser.locationDescription };
      await addRiserToBuilding(selectedBuildingId, newRiserObj);
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === selectedBuildingId);
      if (updatedBuilding) {
        setRisers(updatedBuilding.risers || []);
      }
      setNewRiser({ number: '', floorsCovered: '', locationDescription: '' });
    } catch (err) {
      console.error("Error adding riser:", err);
    }
  };

  const handleDeleteFloor = async (floorId) => {
    try {
      await removeFloorFromBuilding(selectedBuildingId, floorId);

      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === selectedBuildingId);
      if (updatedBuilding) {
        setFloors(updatedBuilding.floors || []);
      }
    } catch (err) {
      console.error("Error deleting floor:", err);
    }
  };

  const handleDeleteRiser = async (riserId) => {
    try {
      await removeRiserFromBuilding(selectedBuildingId, riserId);
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === selectedBuildingId);
      if (updatedBuilding) {
        setRisers(updatedBuilding.risers || []);
      }
    } catch (err) {
      console.error("Error deleting riser:", err);
    }
  };

  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto relative">
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold mb-4 ml-12">Manage Floors & Risers</h1>
        <select
          value={selectedBuildingId}
          onChange={(e) => setSelectedBuildingId(e.target.value)}
          className="input-mockup mb-4 w-full"
        >
          <option value="">Select a Building</option>
          {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        {selectedBuildingId && (
          <>
            <Card className="mockup-card mb-4">
              <h3 className="mockup-card-header">Add Floor to {buildings.find(b => b.id === selectedBuildingId)?.name}</h3>
              <Input label="Floor Number" type="number" value={newFloor.number} onChange={(e) => setNewFloor({ ...newFloor, number: e.target.value })} />
              <Input label="Description" value={newFloor.description} onChange={(e) => setNewFloor({ ...newFloor, description: e.target.value })} />
              <Button onClick={handleAddFloor} className="btn-mockup mt-2">Add Floor</Button>
            </Card>

            <Card className="mockup-card mb-4">
              <h3 className="mockup-card-header">Add Riser to {buildings.find(b => b.id === selectedBuildingId)?.name}</h3>
              <Input label="Riser Name/Direction (e.g., North, East, Riser A)" value={newRiser.number} onChange={(e) => setNewRiser({ ...newRiser, number: e.target.value })} />
              <Input label="Floors Covered (e.g., 1-10, 12)" value={newRiser.floorsCovered} onChange={(e) => setNewRiser({ ...newRiser, floorsCovered: e.target.value })} />
              <Input label="Location Description" value={newRiser.locationDescription} onChange={(e) => setNewRiser({ ...newRiser, locationDescription: e.target.value })} />
              <Button onClick={handleAddRiser} className="btn-mockup mt-2">Add Riser</Button>
            </Card>
            <h2 className="text-xl font-bold mt-4 mb-2">Floors</h2>
            <div className="space-y-2">
              {floors.map(floor => (
                <Card key={floor.id} className="mockup-card flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">Floor {floor.number}</h3>
                    {floor.description && <p className="text-sm text-gray-400">{floor.description}</p>}
                  </div>
                  <Button onClick={() => handleDeleteFloor(floor.id)} className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700">Delete</Button>
                </Card>
              ))}
            </div>

            <h2 className="text-xl font-bold mt-4 mb-2">Risers</h2>
            <div className="space-y-2">
              {risers.map(riser => (
                <Card key={riser.id} className="mockup-card flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">Riser {riser.number}</h3>
                    <p className="text-sm text-gray-400">Floors: {riser.floorsCovered}</p>
                    <p className="text-sm text-gray-400">Location: {riser.locationDescription}</p>
                  </div>
                  <Button onClick={() => handleDeleteRiser(riser.id)} className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700">Delete</Button>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default ManageFloorsRisers;