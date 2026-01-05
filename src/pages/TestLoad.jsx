// src/pages/TestLoad.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/ui/BottomNav';

const TestLoad = () => {
  const { user } = useAuth();
  const [loadingState, setLoadingState] = useState('initial'); // 'initial', 'loading', 'success', 'error'
  const [message, setMessage] = useState('Page loaded.');

  console.log("TestLoad: Component rendering. User:", user, "Loading State:", loadingState); // Debug log

  // Simulate an action that might happen on mount, like fetching data or checking permissions
  useEffect(() => {
    console.log("TestLoad: useEffect started..."); // Debug log
    setLoadingState('loading');
    setMessage('Simulating data fetch...');

    // Simulate an API call or permission check that takes time
    const simulateAction = async () => {
      try {
        console.log("TestLoad: Starting simulated action..."); // Debug log
        // Simulate a delay (e.g., fetching data or validating session)
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        console.log("TestLoad: Simulated action completed successfully."); // Debug log
        setMessage('Data loaded successfully!');
        setLoadingState('success');
      } catch (err) {
        console.error("TestLoad: Simulated action failed:", err); // Debug log
        setMessage(`Error: ${err.message}`);
        setLoadingState('error');
      }
    };

    simulateAction();
  }, []); // Empty dependency array means this runs once on mount

  // Check if user is admin *after* potential loading/permission checks
  if (user?.role !== 'Admin') {
    console.log("TestLoad: Access denied check. User role:", user?.role); // Debug log
    return (
      <div className="full-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You must be an admin to view this page.</p>
        </div>
      </div>
    );
  }

  console.log("TestLoad: User is admin, rendering main content. Loading state:", loadingState); // Debug log

  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Test Load Page</h1>
        <p>Status Message: {message}</p>
        <p>Loading State Variable: {loadingState}</p>
        <p>User Role (from context): {user?.role || 'N/A'}</p>
        {/* Add a dummy button to test if *any* button works on this simple page */}
        <button
          onClick={() => console.log("TestLoad: Dummy button clicked!")}
          className="bg-primary text-white p-2 rounded mt-4"
        >
          Click Me (Console Log)
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default TestLoad;