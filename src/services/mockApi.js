// Mock API service using localStorage for development
// This bypasses Supabase and uses local storage instead

// Initialize mock data if not exists
const initializeMockData = () => {
  if (!localStorage.getItem('buildings')) {
    localStorage.setItem('buildings', JSON.stringify([
      {
        id: 1,
        name: 'Test Building 1',
        address: '123 Test St',
        technologySummary: 'Huawei Equipment',
        complexityPercentage: 75,
        requiredTechnicians: 2,
        parkingType: 'Underground',
        parkingInstructions: 'Use side entrance',
        direction: 'North', // Added direction field
        floors: [],
        risers: [],
        images: [],
        techPDFs: []
      }
    ]));
  }

  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        role: 'Admin',
        isActive: true
      },
      {
        id: 2,
        username: 'tech1',
        email: 'tech@example.com',
        role: 'Technician',
        isActive: true
      }
    ]));
  }
};

initializeMockData();

// Utility function to generate unique IDs
const generateId = (array) => {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
};

// Building functions
export const getBuildings = async () => {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  return buildings;
};

export const getBuildingById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  const building = buildings.find(b => b.id === parseInt(id));
  if (!building) throw new Error('Building not found');
  return building;
};

export const createBuilding = async (buildingData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  const newBuilding = {
    ...buildingData,
    id: generateId(buildings),
    direction: buildingData.direction || 'N/A', // Default direction if not provided
    floors: buildingData.floors || [],
    risers: buildingData.risers || [],
    images: buildingData.images || [],
    techPDFs: buildingData.techPDFs || []
  };
  buildings.push(newBuilding);
  localStorage.setItem('buildings', JSON.stringify(buildings));
  return newBuilding;
};

export const updateBuilding = async (id, updatedData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  const buildingIndex = buildings.findIndex(b => b.id === parseInt(id));
  if (buildingIndex === -1) throw new Error('Building not found');

  buildings[buildingIndex] = {
    ...buildings[buildingIndex],
    ...updatedData,
    id: parseInt(id),
    direction: updatedData.direction || buildings[buildingIndex].direction || 'N/A' // Preserve direction if not updated
  };
  localStorage.setItem('buildings', JSON.stringify(buildings));
  return buildings[buildingIndex];
};

export const deleteBuilding = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  let buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  buildings = buildings.filter(b => b.id !== parseInt(id));
  localStorage.setItem('buildings', JSON.stringify(buildings));
  return true;
};

// User functions
export const getMockUsers = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const login = async (email, password) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email);

  if (!user) throw new Error('Invalid email or password');
  // For mock, we're not actually checking password
  return user;
};

export const registerUser = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const existingUser = users.find(u => u.email === userData.email);

  if (existingUser) throw new Error('User already exists');

  const newUser = {
    ...userData,
    id: generateId(users),
    isActive: true
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return { user: newUser, session: { user: newUser } };
};

// Additional mock functions
export const addImageToBuilding = async (buildingId, image) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  const buildingIndex = buildings.findIndex(b => b.id === parseInt(buildingId));

  if (buildingIndex === -1) throw new Error('Building not found');

  const newImage = {
    ...image,
    id: generateId(buildings[buildingIndex].images),
    linkedBuildingIds: image.linkedBuildingIds || [] // Initialize linkedBuildingIds if not provided
  };
  buildings[buildingIndex].images.push(newImage);
  localStorage.setItem('buildings', JSON.stringify(buildings));
  return newImage;
};

export const removeImageFromBuilding = async (imageId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');

  buildings.forEach(building => {
    building.images = building.images.filter(img => img.id !== parseInt(imageId));
  });

  localStorage.setItem('buildings', JSON.stringify(buildings));
  return true;
};

export const addFloorToBuilding = async (buildingId, floor) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  const buildingIndex = buildings.findIndex(b => b.id === parseInt(buildingId));

  if (buildingIndex === -1) throw new Error('Building not found');

  const newFloor = { ...floor, id: generateId(buildings[buildingIndex].floors) };
  buildings[buildingIndex].floors.push(newFloor);
  localStorage.setItem('buildings', JSON.stringify(buildings));
  return newFloor;
};

export const addRiserToBuilding = async (buildingId, riser) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  const buildingIndex = buildings.findIndex(b => b.id === parseInt(buildingId));

  if (buildingIndex === -1) throw new Error('Building not found');

  const newRiser = { ...riser, id: generateId(buildings[buildingIndex].risers) };
  buildings[buildingIndex].risers.push(newRiser);
  localStorage.setItem('buildings', JSON.stringify(buildings));
  return newRiser;
};

export const addPdfToBuilding = async (buildingId, pdf) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  const buildingIndex = buildings.findIndex(b => b.id === parseInt(buildingId));

  if (buildingIndex === -1) throw new Error('Building not found');

  const newPdf = {
    ...pdf,
    id: generateId(buildings[buildingIndex].techPDFs),
    linkedBuildingIds: pdf.linkedBuildingIds || [] // Initialize linkedBuildingIds if not provided
  };
  buildings[buildingIndex].techPDFs.push(newPdf);
  localStorage.setItem('buildings', JSON.stringify(buildings));
  return newPdf;
};

export const removeFloorFromBuilding = async (buildingId, floorId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  const buildingIndex = buildings.findIndex(b => b.id === parseInt(buildingId));

  if (buildingIndex === -1) throw new Error('Building not found');

  buildings[buildingIndex].floors = buildings[buildingIndex].floors.filter(f => f.id !== parseInt(floorId));
  localStorage.setItem('buildings', JSON.stringify(buildings));
  return true;
};

export const removeRiserFromBuilding = async (buildingId, riserId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');
  const buildingIndex = buildings.findIndex(b => b.id === parseInt(buildingId));

  if (buildingIndex === -1) throw new Error('Building not found');

  buildings[buildingIndex].risers = buildings[buildingIndex].risers.filter(r => r.id !== parseInt(riserId));
  localStorage.setItem('buildings', JSON.stringify(buildings));
  return true;
};

export const removePdfFromBuilding = async (pdfId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');

  buildings.forEach(building => {
    building.techPDFs = building.techPDFs.filter(pdf => pdf.id !== parseInt(pdfId));
  });

  localStorage.setItem('buildings', JSON.stringify(buildings));
  return true;
};

// Function to update PDF with linked building IDs
export const updatePdfLinks = async (pdfId, linkedBuildingIds) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');

  let pdfFound = false;
  buildings.forEach(building => {
    const pdfIndex = building.techPDFs.findIndex(pdf => pdf.id === parseInt(pdfId));
    if (pdfIndex !== -1) {
      building.techPDFs[pdfIndex] = {
        ...building.techPDFs[pdfIndex],
        linkedBuildingIds: linkedBuildingIds || []
      };
      pdfFound = true;
    }
  });

  if (!pdfFound) throw new Error('PDF not found');

  localStorage.setItem('buildings', JSON.stringify(buildings));
  return true;
};

// Function to update Image with linked building IDs
export const updateImageLinks = async (imageId, linkedBuildingIds) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const buildings = JSON.parse(localStorage.getItem('buildings') || '[]');

  let imageFound = false;
  buildings.forEach(building => {
    const imageIndex = building.images.findIndex(img => img.id === parseInt(imageId));
    if (imageIndex !== -1) {
      building.images[imageIndex] = {
        ...building.images[imageIndex],
        linkedBuildingIds: linkedBuildingIds || []
      };
      imageFound = true;
    }
  });

  if (!imageFound) throw new Error('Image not found');

  localStorage.setItem('buildings', JSON.stringify(buildings));
  return true;
};

export const findNearestRisers = (building, currentFloor) => {
  const parseFloorsCovered = (floorsStr) => {
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

  const risersWithFloors = building.risers.map(riser => {
    const floors = parseFloorsCovered(riser.floorsCovered);
    return {
      ...riser,
      floorsCoveredArray: floors,
      minFloor: Math.min(...floors),
      maxFloor: Math.max(...floors),
      isOnCurrentFloor: floors.includes(currentFloor)
    };
  });

  // Find risers on the current floor
  const onCurrentFloor = risersWithFloors.filter(r => r.isOnCurrentFloor);

  // Find risers above the current floor
  const above = risersWithFloors
    .filter(r => r.minFloor > currentFloor)
    .map(r => ({
      ...r,
      distance: r.minFloor - currentFloor
    }))
    .sort((a, b) => a.distance - b.distance)[0] || null;

  // Find risers below the current floor
  const below = risersWithFloors
    .filter(r => r.maxFloor < currentFloor)
    .map(r => ({
      ...r,
      distance: currentFloor - r.maxFloor
    }))
    .sort((a, b) => a.distance - b.distance)[0] || null;

  return { onCurrentFloor, above, below };
};

// Function to find which risers are on a specific floor
export const findRisersOnFloor = (building, floorNumber) => {
  const parseFloorsCovered = (floorsStr) => {
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

  const risersOnFloor = building.risers.filter(riser => {
    const floors = parseFloorsCovered(riser.floorsCovered);
    return floors.includes(floorNumber);
  });

  return risersOnFloor;
};