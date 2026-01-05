import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMockUsers, createMockUser, updateMockUser, deleteMockUser } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BottomNav from '../components/ui/BottomNav';
import BackButton from '../components/ui/BackButton';

const ManageUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'Technician', isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getMockUsers();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(`Failed to load users: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (user?.role !== 'Admin') {
    return (
      <div className="full-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You must be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      setError("Full Name and Email are required.");
      return;
    }
    setError('');
    try {
      const created = await createMockUser(newUser);
      // Fetch updated list to reflect the change properly
      const updatedUsers = await getMockUsers();
      setUsers(updatedUsers);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'Technician',
        isActive: true
      });
      console.log("Created user:", created);
    } catch (err) {
      console.error("Error creating user:", err);
      setError(`Failed to create user: ${err.message}`);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name || !editingUser.email) {
      setError("Full Name and Email are required for update.");
      return;
    }
    setError('');
    try {
      await updateMockUser(editingUser.id, editingUser);
      // Fetch updated list to reflect the change properly
      const updatedUsers = await getMockUsers();
      setUsers(updatedUsers);
      setEditingUser(null);
      console.log("Updated user:", editingUser);
    } catch (err) {
      console.error("Error updating user:", err);
      setError(`Failed to update user: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await deleteMockUser(id);
      // Fetch updated list to reflect the change properly
      const updatedUsers = await getMockUsers();
      setUsers(updatedUsers);
      if (editingUser && editingUser.id === id) {
        setEditingUser(null);
      }
      console.log("Deleted user with id:", id);
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(`Failed to delete user: ${err.message}`);
    }
  };

  const startEditing = (user) => {
    setEditingUser({ ...user });
  };

  const handleChange = (e, field, isEditing = false) => {
    const value = e.target.value;
    if (isEditing) {
      setEditingUser(prev => ({ ...prev, [field]: value }));
    } else {
      setNewUser(prev => ({ ...prev, [field]: value }));
    }
  };

  if (loading) {
    return (
      <div className="full-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Users...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto relative">
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold mb-4 ml-12">Manage Users</h1>

        {error && <div className="mb-4 p-2 bg-red-600 text-white rounded">{error}</div>}

        <Card className="mockup-card mb-4">
          <h3 className="mockup-card-header">Add New User</h3>
          <Input label="Full Name" value={newUser.name} onChange={(e) => handleChange(e, 'name')} />
          <Input label="Email" value={newUser.email} onChange={(e) => handleChange(e, 'email')} />
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="flex gap-2">
              <Input type="password" value={newUser.password} onChange={(e) => handleChange(e, 'password')} />
              <Button onClick={() => setNewUser(prev => ({ ...prev, password: Math.random().toString(36).slice(2, 10) }))} variant="outline" className="btn-mockup-outline">Generate</Button>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between">
              <label className="block text-sm font-medium mb-1">Role</label>
              <label className="block text-sm font-medium mb-1">Active</label>
            </div>
            <div className="flex gap-2">
              <select value={newUser.role} onChange={(e) => handleChange(e, 'role')} className="input-mockup flex-grow">
                <option value="Technician">Field Technician</option>
                <option value="Admin">Admin</option>
              </select>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUser.isActive}
                    onChange={() => setNewUser(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
          <Button type="submit" onClick={handleCreate} className="btn-mockup mt-2">Add</Button>
        </Card>

        {editingUser && (
          <Card className="mockup-card mb-4">
            <h3 className="mockup-card-header">Edit User: {editingUser.name}</h3>
            <Input label="Full Name" value={editingUser.name} onChange={(e) => handleChange(e, 'name', true)} />
            <Input label="Email" value={editingUser.email} onChange={(e) => handleChange(e, 'email', true)} />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="flex gap-2">
                <Input type="password" value={editingUser.password} onChange={(e) => handleChange(e, 'password', true)} />
                <Button onClick={() => setEditingUser(prev => ({ ...prev, password: Math.random().toString(36).slice(2, 10) }))} variant="outline" className="btn-mockup-outline">Generate</Button>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between">
                <label className="block text-sm font-medium mb-1">Role</label>
                <label className="block text-sm font-medium mb-1">Active</label>
              </div>
              <div className="flex gap-2">
                <select value={editingUser.role} onChange={(e) => handleChange(e, 'role', true)} className="input-mockup flex-grow">
                  <option value="Technician">Field Technician</option>
                  <option value="Admin">Admin</option>
                </select>
                <div className="flex items-center">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.isActive}
                      onChange={() => setEditingUser(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button onClick={handleUpdate} className="btn-mockup">Save Changes</Button>
              <Button onClick={() => setEditingUser(null)} className="btn-mockup-outline">Cancel</Button>
            </div>
          </Card>
        )}

        <h2 className="text-xl font-bold mt-4 mb-2">Existing Users</h2>
        <div className="space-y-2">
          {users.map(user => (
            <Card key={user.id} className="mockup-card flex justify-between items-center">
              <div>
                <h3 className="font-bold">{user.name}</h3>
                <p className="text-sm text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-400">Role: {user.role}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => startEditing(user)} className="btn-mockup-outline text-xs">Edit</Button>
                <Button onClick={() => handleDelete(user.id)} className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700">Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ManageUsers;