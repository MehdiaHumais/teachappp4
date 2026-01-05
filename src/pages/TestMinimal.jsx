// src/pages/TestMinimal.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/ui/BottomNav';

const TestMinimal = () => {
  const { user, loading } = useAuth(); // Get user and loading state from context

  console.log("TestMinimal: Component rendering. User:", user, "Loading:", loading); // Debug log

  // Check user role immediately (this should happen after context is initialized)
  if (loading) {
    console.log("TestMinimal: Context still loading..."); // Debug log
    return (
      <div className="full-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Checking Permissions...</h1>
        </div>
      </div>
    );
  }

  if (user?.role !== 'Admin') {
    console.log("TestMinimal: Access denied check. User role:", user?.role); // Debug log
    return (
      <div className="full-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You must be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  console.log("TestMinimal: User is admin, showing content..."); // Debug log

  // If user is admin and loading is finished, render the minimal content
  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Test Minimal Page</h1>
        <p>This page does nothing except check the user role.</p>
        <p>User Role (from context): {user?.role || 'N/A'}</p>
        <p>Loading State (from context): {loading ? 'True' : 'False'}</p>
        {/* Add a simple button to test if *any* button works on this simple page */}
        <button
          onClick={() => console.log("TestMinimal: Button clicked!")}
          className="bg-primary text-white p-2 rounded mt-4"
        >
          Click Me (Console Log)
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default TestMinimal;