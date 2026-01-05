import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBuildings, createBuilding, updateBuilding, deleteBuilding } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BottomNav from '../components/ui/BottomNav';
import BackButton from '../components/ui/BackButton';
import AllPDFsManager from '../components/Admin/AllPDFsManager';

const ManageBuildings = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [newBuilding, setNewBuilding] = useState({
    name: '', address: '', technologySummary: '', complexityPercentage: 0, requiredTechnicians: 1, parkingType: 'Underground', parkingInstructions: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('buildings'); // Add tab state

  console.log("ManageBuildings: Component rendering. User from context:", user);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        console.log("ManageBuildings: Fetching buildings from API...");
        setLoading(true);
        setError('');
        const data = await getBuildings();
        console.log("ManageBuildings: API call successful, received ", data);
        setBuildings(data);
      } catch (err) {
        console.error("ManageBuildings: Error fetching buildings:", err);
        setError(`Failed to load buildings: ${err.message || err}`);
      } finally {
        console.log("ManageBuildings: Setting loading to false after fetch attempt.");
        setLoading(false);
      }
    };
    fetchBuildings();
  }, []);


  const handleCreate = async (e) => {
    e.preventDefault();
    console.log("ManageBuildings: HandleCreate called with ", newBuilding);
    if (!newBuilding.name) {
      setError("Building name is required.");
      console.log("ManageBuildings: Create failed - name missing.");
      return;
    }
    setError('');
    try {
      const result = await createBuilding(newBuilding);
      console.log("ManageBuildings: Building created successfully, new building:", result);
      // Fetch updated list to reflect the change properly
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      setNewBuilding({
        name: '',
        address: '',
        technologySummary: '',
        complexityPercentage: 0,
        requiredTechnicians: 1,
        parkingType: 'Underground',
        parkingInstructions: ''
      });
    } catch (err) {
      console.error("ManageBuildings: Error creating building:", err); // Debug log
      setError(`Failed to create building: ${err.message || err}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault(); // Prevent default form submission
    console.log("ManageBuildings: HandleUpdate called with ", editingBuilding); // Debug log
    if (!editingBuilding || !editingBuilding.name) {
      setError("Building name is required for update.");
      console.log("ManageBuildings: Update failed - editingBuilding or name missing."); // Debug log
      return;
    }
    setError(''); // Clear error before action
    try {
      await updateBuilding(editingBuilding.id, editingBuilding);
      console.log("ManageBuildings: Update successful for:", editingBuilding); // Debug log
      // Fetch updated list to reflect the change properly
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      setEditingBuilding(null); // Clear editing state
    } catch (err) {
      console.error("ManageBuildings: Error updating building:", err); // Debug log
      setError(`Failed to update building: ${err.message || err}`);
    }
  };

  const handleDelete = async (id) => {
    console.log("ManageBuildings: HandleDelete called for id:", id); // Debug log
    setError(''); // Clear error before action
    try {
      await deleteBuilding(id);
      console.log("ManageBuildings: Deletion successful for id:", id); // Debug log
      // Fetch updated list to reflect the change properly
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      // If the deleted building was the one being edited, clear the editing state
      if (editingBuilding && editingBuilding.id === id) {
        setEditingBuilding(null);
      }
    } catch (err) {
      console.error("ManageBuildings: Error deleting building:", err); // Debug log
      setError(`Failed to delete building: ${err.message || err}`);
    }
  };

  const startEditing = (building) => {
    console.log("ManageBuildings: StartEditing called for building:", building); // Debug log
    setEditingBuilding({ ...building }); // Set the building to be edited
  };

  const handleChange = (e, field, isEditing = false) => {
    const value = e.target.value;
    console.log("ManageBuildings: HandleChange for field:", field, "value:", value, "isEditing:", isEditing); // Debug log
    if (isEditing) {
      setEditingBuilding(prev => ({ ...prev, [field]: value })); // Update editing state
    } else {
      setNewBuilding(prev => ({ ...prev, [field]: value })); // Update new building state
    }
  };

  // Show loading state while fetching buildings (this happens *after* AdminRoute check passes)
  if (loading) {
    console.log("ManageBuildings: Local loading (buildings) is true, showing loader..."); // Debug log
    return (
      <div className="full-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Buildings...</h1>
        </div>
      </div>
    );
  }

  console.log("ManageBuildings: Rendering main content. Buildings count:", buildings.length); // Debug log

  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto relative">
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>

        <div className="ml-12">
          <h1 className="text-2xl font-bold mb-4">Manage Buildings & PDFs</h1>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-600 mb-4">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'buildings'
                  ? 'border-b-2 border-teal-500 text-teal-400'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('buildings')}
            >
              Buildings
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'pdfs'
                  ? 'border-b-2 border-teal-500 text-teal-400'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('pdfs')}
            >
              PDFs
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'buildings' && (
            <div>
              {error && <div className="mb-4 p-2 bg-red-600 text-white rounded">{error}</div>}

              <Card className="mockup-card mb-4">
                <h3 className="mockup-card-header">Add New Building</h3>
                <form onSubmit={handleCreate}>
                  <Input label="Name" value={newBuilding.name} onChange={(e) => handleChange(e, 'name')} required />
                  <Input label="Address" value={newBuilding.address} onChange={(e) => handleChange(e, 'address')} />
                  <Input label="Technology Summary" value={newBuilding.technologySummary} onChange={(e) => handleChange(e, 'technologySummary')} />
                  <Input label="Complexity %" type="number" value={newBuilding.complexityPercentage} onChange={(e) => handleChange(e, 'complexityPercentage')} />
                  <Input label="Required Techs" type="number" value={newBuilding.requiredTechnicians} onChange={(e) => handleChange(e, 'requiredTechnicians')} />
                  <select value={newBuilding.parkingType} onChange={(e) => handleChange(e, 'parkingType')} className="input-mockup mb-2">
                    <option value="Underground">Underground</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Street">Street</option>
                    <option value="Other">Other</option>
                  </select>
                  <Input label="Parking Instructions" value={newBuilding.parkingInstructions} onChange={(e) => handleChange(e, 'parkingInstructions')} />
                  <Button type="submit" className="btn-mockup mt-2">Create Building</Button>
                </form>
              </Card>

              {editingBuilding && (
                <Card className="mockup-card mb-4">
                  <h3 className="mockup-card-header">Edit Building: {editingBuilding.name}</h3>
                  <form onSubmit={handleUpdate}>
                    <Input label="Name" value={editingBuilding.name} onChange={(e) => handleChange(e, 'name', true)} required />
                    <Input label="Address" value={editingBuilding.address} onChange={(e) => handleChange(e, 'address', true)} />
                    <Input label="Technology Summary" value={editingBuilding.technologySummary} onChange={(e) => handleChange(e, 'technologySummary', true)} />
                    <Input label="Complexity %" type="number" value={editingBuilding.complexityPercentage} onChange={(e) => handleChange(e, 'complexityPercentage', true)} />
                    <Input label="Required Techs" type="number" value={editingBuilding.requiredTechnicians} onChange={(e) => handleChange(e, 'requiredTechnicians', true)} />
                    <select value={editingBuilding.parkingType} onChange={(e) => handleChange(e, 'parkingType', true)} className="input-mockup mb-2">
                      <option value="Underground">Underground</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Street">Street</option>
                      <option value="Other">Other</option>
                    </select>
                    <Input label="Parking Instructions" value={editingBuilding.parkingInstructions} onChange={(e) => handleChange(e, 'parkingInstructions', true)} />
                    <div className="flex gap-2 mt-2">
                      <Button type="submit" className="btn-mockup">Save Changes</Button>
                      <Button type="button" onClick={() => setEditingBuilding(null)} className="btn-mockup-outline">Cancel</Button>
                    </div>
                  </form>
                </Card>
              )}

              <h2 className="text-xl font-bold mt-4 mb-2">Existing Buildings</h2>
              <div className="space-y-2">
                {buildings.map(building => (
                  <Card key={building.id} className="mockup-card flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{building.name}</h3>
                      <p className="text-sm text-gray-400">{building.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => startEditing(building)} className="btn-mockup-outline text-xs">Edit</Button>
                      <Button onClick={() => handleDelete(building.id)} className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700">Delete</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pdfs' && (
            <AllPDFsManager />
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ManageBuildings;