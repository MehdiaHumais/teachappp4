import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import BottomNav from '../components/ui/BottomNav';

const ProfilePage = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center mt-10">Please log in.</div>;
  }

  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>

        <Card className="mockup-card">
          <h3 className="mockup-card-header">User Information</h3>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </Card>

        <Card className="mockup-card mt-4">
          <h3 className="mockup-card-header">Account Actions</h3>
          <Button onClick={logout} className="btn-mockup w-full">Logout</Button>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProfilePage;