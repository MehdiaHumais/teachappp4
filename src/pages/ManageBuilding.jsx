import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBuildings, createBuilding, updateBuilding, deleteBuilding, addPdfToBuilding, removePdfFromBuilding, addFloorToBuilding, removeFloorFromBuilding, addRiserToBuilding, removeRiserFromBuilding, addImageToBuilding, removeImageFromBuilding, updatePdfLinks, updateImageLinks } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BottomNav from '../components/ui/BottomNav';
import BackButton from '../components/ui/BackButton';
import AllPDFsManager from '../components/Admin/AllPDFsManager';

const ManageBuilding = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [newBuilding, setNewBuilding] = useState({
    name: '', address: '', technology: 'Huawei', customTechnology: '', complexityPercentage: 0, requiredTechnicians: 1, parkingType: 'Underground', parkingInstructions: '', direction: 'N/A'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('buildings'); // buildings, floors-risers, images, pdfs
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [showAllPdfs, setShowAllPdfs] = useState(false); // For PDF sub-tabs
  const [pdfs, setPdfs] = useState([]);
  const [newPdf, setNewPdf] = useState({ title: '', tech: 'Huawei', url: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [floors, setFloors] = useState([]);
  const [newFloor, setNewFloor] = useState({ number: '', description: '' });
  const [risers, setRisers] = useState([]);
  const [newRiser, setNewRiser] = useState({ number: '', floorsCovered: '', locationDescription: '' });
  const [editingRiser, setEditingRiser] = useState(null);
  const [editingFloor, setEditingFloor] = useState(null);
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState({ type: 'Parking', url: '' });
  const [imageFile, setImageFile] = useState(null);

  // Get unique technologies from buildings for the dropdown
  const allTechnologies = [...new Set([
    'Huawei', 'Nokia', 'SmartOLT', 'U2000', 'Positron', // Default technologies
    ...buildings.flatMap(building => [
      building.technology || building.technologySummary
    ]).filter(Boolean)
  ])];

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getBuildings();
        setBuildings(data);
      } catch (err) {
        console.error("ManageBuilding: Error fetching buildings:", err);
        setError(`Failed to load buildings: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };
    fetchBuildings();
  }, []);


  useEffect(() => {
    if (selectedBuildingId) {
      const building = buildings.find(b => b.id === parseInt(selectedBuildingId));
      if (building) {
        setFloors(building.floors || []);
        setRisers(building.risers || []);

        const linkedImages = getLinkedImages();
        const allImages = [
          ...(building.images || []).map(img => ({...img, isLinked: false})),
          ...linkedImages
        ];
        setImages(allImages);

        // Get linked PDFs and combine with direct PDFs
        const linkedPDFs = getLinkedPDFs();
        const allPdfs = [
          ...(building.techPDFs || []).map(pdf => ({...pdf, isLinked: false})),
          ...linkedPDFs
        ];
        setPdfs(allPdfs);
      }
    } else {
      setFloors([]);
      setRisers([]);
      setImages([]);
      setPdfs([]);
    }
  }, [selectedBuildingId, buildings]);


  const getLinkedPDFs = () => {
    if (!buildings || !selectedBuildingId) return [];

    const linkedPDFs = [];

    buildings.forEach(b => {
      if (b.techPDFs && b.techPDFs.length > 0) {
        b.techPDFs.forEach(pdf => {
          if (pdf.linkedBuildingIds && pdf.linkedBuildingIds.includes(parseInt(selectedBuildingId))) {
            // Add building name to the PDF to show which building it's from
            linkedPDFs.push({
              ...pdf,
              sourceBuilding: b.name,
              isLinked: true
            });
          }
        });
      }
    });

    return linkedPDFs;
  };

  // Function to get all linked images for the currently selected building
  const getLinkedImages = () => {
    if (!buildings || !selectedBuildingId) return [];

    const linkedImages = [];

    buildings.forEach(b => {
      if (b.images && b.images.length > 0) {
        b.images.forEach(img => {
          if (img.linkedBuildingIds && img.linkedBuildingIds.includes(parseInt(selectedBuildingId))) {
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

  // Building management functions
  const handleCreateBuilding = async (e) => {
    e.preventDefault();
    if (!newBuilding.name) {
      setError("Building name is required.");
      return;
    }
    setError('');
    try {
      // Use custom technology if 'Other' is selected and custom technology is provided
      const buildingToCreate = {
        ...newBuilding,
        technology: newBuilding.technology === 'Other' && newBuilding.customTechnology
          ? newBuilding.customTechnology
          : newBuilding.technology
      };

      const result = await createBuilding(buildingToCreate);
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      setNewBuilding({
        name: '',
        address: '',
        technology: 'Huawei',
        customTechnology: '',
        complexityPercentage: 0,
        requiredTechnicians: 1,
        parkingType: 'Underground',
        parkingInstructions: '',
        direction: 'N/A'
      });
    } catch (err) {
      console.error("ManageBuilding: Error creating building:", err);
      setError(`Failed to create building: ${err.message || err}`);
    }
  };

  const handleUpdateBuilding = async (e) => {
    e.preventDefault();
    if (!editingBuilding || !editingBuilding.name) {
      setError("Building name is required for update.");
      return;
    }
    setError('');
    try {
      // Use custom technology if 'Other' is selected and custom technology is provided
      const buildingToUpdate = {
        ...editingBuilding,
        technology: editingBuilding.technology === 'Other' && editingBuilding.customTechnology
          ? editingBuilding.customTechnology
          : editingBuilding.technology
      };

      await updateBuilding(editingBuilding.id, buildingToUpdate);
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      setEditingBuilding(null);
    } catch (err) {
      console.error("ManageBuilding: Error updating building:", err);
      setError(`Failed to update building: ${err.message || err}`);
    }
  };

  const handleDeleteBuilding = async (id) => {
    setError('');
    try {
      await deleteBuilding(id);
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      if (editingBuilding && editingBuilding.id === id) {
        setEditingBuilding(null);
      }
      if (parseInt(selectedBuildingId) === id) {
        setSelectedBuildingId('');
      }
    } catch (err) {
      console.error("ManageBuilding: Error deleting building:", err);
      setError(`Failed to delete building: ${err.message || err}`);
    }
  };

  const startEditingBuilding = (building) => {
    setEditingBuilding({
      ...building,
      technology: building.technology || building.technologySummary || 'Huawei',
      customTechnology: building.customTechnology || '',
      direction: building.direction || 'N/A'
    });
  };

  const handleChangeBuilding = (e, field, isEditing = false) => {
    const value = e.target.value;
    if (isEditing) {
      setEditingBuilding(prev => ({ ...prev, [field]: value }));
    } else {
      setNewBuilding(prev => ({ ...prev, [field]: value }));
    }
  };

  // PDF management functions
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }
      setFile(selectedFile);
      setNewPdf({ ...newPdf, title: selectedFile.name.replace('.pdf', '') });
    }
  };

  // State for building selection during upload
  const [pdfBuildingsToLink, setPdfBuildingsToLink] = useState([]);
  const [imageBuildingsToLink, setImageBuildingsToLink] = useState([]);
  const [showPdfLinkOptions, setShowPdfLinkOptions] = useState(false);
  const [showImageLinkOptions, setShowImageLinkOptions] = useState(false);

  const togglePdfBuildingLink = (buildingId) => {
    if (pdfBuildingsToLink.includes(buildingId)) {
      setPdfBuildingsToLink(pdfBuildingsToLink.filter(id => id !== buildingId));
    } else {
      setPdfBuildingsToLink([...pdfBuildingsToLink, buildingId]);
    }
  };

  const toggleImageBuildingLink = (buildingId) => {
    if (imageBuildingsToLink.includes(buildingId)) {
      setImageBuildingsToLink(imageBuildingsToLink.filter(id => id !== buildingId));
    } else {
      setImageBuildingsToLink([...imageBuildingsToLink, buildingId]);
    }
  };

  const selectAllPdfBuildings = () => {
    const allBuildingIds = buildings.filter(b => b.id !== parseInt(selectedBuildingId)).map(b => b.id);
    setPdfBuildingsToLink(allBuildingIds);
  };

  const selectAllImageBuildings = () => {
    const allBuildingIds = buildings.filter(b => b.id !== parseInt(selectedBuildingId)).map(b => b.id);
    setImageBuildingsToLink(allBuildingIds);
  };

  const clearAllPdfBuildings = () => {
    setPdfBuildingsToLink([]);
  };

  const clearAllImageBuildings = () => {
    setImageBuildingsToLink([]);
  };

  const handleUploadPdf = async () => {
    if (!selectedBuildingId || !file) {
      if (!file) alert('Please select a PDF file to upload');
      return;
    }

    setUploading(true);
    try {
      // Create a temporary URL for immediate use during the API call
      const tempUrl = URL.createObjectURL(file);

      const newPdfObj = {
        title: newPdf.title || file.name.replace('.pdf', ''),
        tech: newPdf.tech,
        originalFileName: file.name,
        url: tempUrl, // Use temporary URL for the API call
        linkedBuildingIds: pdfBuildingsToLink // Use the selected buildings
      };

      await addPdfToBuilding(selectedBuildingId, newPdfObj);

      // If we need to add this PDF to other buildings as well
      if (pdfBuildingsToLink.length > 0) {
        for (const buildingId of pdfBuildingsToLink) {
          // Create a new PDF object for the linked building, with updated linkedBuildingIds
          const linkedPdfObj = {
            ...newPdfObj,
            linkedBuildingIds: [selectedBuildingId, ...pdfBuildingsToLink.filter(id => id !== buildingId)]
          };

          // Add the PDF to the linked building
          await addPdfToBuilding(buildingId, linkedPdfObj);
        }
      }

      // Refresh all data after adding to multiple buildings
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === parseInt(selectedBuildingId));
      if (updatedBuilding) {
        // The updated building will have placeholder URLs, but that's expected for mock API
        setPdfs(updatedBuilding.techPDFs || []);
      }
      setFile(null);
      setNewPdf({ title: '', tech: 'Huawei', url: '' });
      setPdfBuildingsToLink([]); // Reset the linked buildings
      setShowPdfLinkOptions(false); // Hide the options after upload
    } catch (err) {
      console.error("Error adding PDF:", err);
      setError(`Error adding PDF: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAddPdfByUrl = async () => {
    if (!selectedBuildingId || !newPdf.title || !newPdf.url) return;
    try {
      const newPdfObj = {
        title: newPdf.title,
        tech: newPdf.tech,
        url: newPdf.url,
        linkedBuildingIds: pdfBuildingsToLink // Use the selected buildings
      };
      await addPdfToBuilding(selectedBuildingId, newPdfObj);

      // If we need to add this PDF to other buildings as well
      if (pdfBuildingsToLink.length > 0) {
        for (const buildingId of pdfBuildingsToLink) {
          // Create a new PDF object for the linked building, with updated linkedBuildingIds
          const linkedPdfObj = {
            ...newPdfObj,
            linkedBuildingIds: [selectedBuildingId, ...pdfBuildingsToLink.filter(id => id !== buildingId)]
          };

          // Add the PDF to the linked building
          await addPdfToBuilding(buildingId, linkedPdfObj);
        }
      }

      // Refresh all data after adding to multiple buildings
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === parseInt(selectedBuildingId));
      if (updatedBuilding) {
        setPdfs(updatedBuilding.techPDFs || []);
      }
      setNewPdf({ title: '', tech: 'Huawei', url: '' });
      setPdfBuildingsToLink([]); // Reset the linked buildings
      setShowPdfLinkOptions(false); // Hide the options after upload
    } catch (err) {
      console.error("Error adding PDF:", err);
      setError(`Error adding PDF: ${err.message || err}`);
    }
  };

  const handleDeletePdf = async (pdfId) => {
    try {
      await removePdfFromBuilding(pdfId);
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);

      // Reload both direct and linked PDFs for the selected building
      const currentBuilding = updatedBuildings.find(b => b.id === parseInt(selectedBuildingId));
      if (currentBuilding) {
        const linkedPDFs = getLinkedPDFs();
        const allPdfs = [
          ...(currentBuilding.techPDFs || []).map(pdf => ({...pdf, isLinked: false})),
          ...linkedPDFs
        ];
        setPdfs(allPdfs);
      }
    } catch (err) {
      console.error("Error deleting PDF:", err);
      setError(`Error deleting PDF: ${err.message || err}`);
    }
  };

  // Floor management functions
  const handleAddFloor = async (e) => {
    e.preventDefault();
    if (!selectedBuildingId || !newFloor.number) return; // Basic validation

    try {
      const newFloorObj = { number: parseInt(newFloor.number), description: newFloor.description };
      await addFloorToBuilding(selectedBuildingId, newFloorObj);
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === parseInt(selectedBuildingId));
      if (updatedBuilding) {
        setFloors(updatedBuilding.floors || []);
      }
      setNewFloor({ number: '', description: '' });
    } catch (err) {
      console.error("Error adding floor:", err);
      setError(`Error adding floor: ${err.message || err}`);
    }
  };

  const handleAddRiser = async (e) => {
    e.preventDefault();
    if (!selectedBuildingId || !newRiser.number) return;

    try {
      const newRiserObj = { number: newRiser.number, floorsCovered: newRiser.floorsCovered, locationDescription: newRiser.locationDescription };
      await addRiserToBuilding(selectedBuildingId, newRiserObj);
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === parseInt(selectedBuildingId));
      if (updatedBuilding) {
        setRisers(updatedBuilding.risers || []);
      }
      setNewRiser({ number: '', floorsCovered: '', locationDescription: '' });
    } catch (err) {
      console.error("Error adding riser:", err);
      setError(`Error adding riser: ${err.message || err}`);
    }
  };

  const startEditingRiser = (riser) => {
    setEditingRiser(riser);
    setNewRiser({
      number: riser.number,
      floorsCovered: riser.floorsCovered,
      locationDescription: riser.locationDescription
    });
  };

  const handleUpdateRiser = async (e) => {
    e.preventDefault();
    if (!selectedBuildingId || !editingRiser || !newRiser.number) return;

    try {
      // In the current API, we need to delete and recreate since there's no updateRiser function
      // We'll delete the old one and add a new one with updated info
      await removeRiserFromBuilding(selectedBuildingId, editingRiser.id);

      const updatedRiserObj = {
        id: editingRiser.id, // Keep the same ID if possible
        number: newRiser.number,
        floorsCovered: newRiser.floorsCovered,
        locationDescription: newRiser.locationDescription
      };

      // Since we don't have a direct update function, we'll recreate it
      await addRiserToBuilding(selectedBuildingId, updatedRiserObj);

      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === parseInt(selectedBuildingId));
      if (updatedBuilding) {
        setRisers(updatedBuilding.risers || []);
      }
      setNewRiser({ number: '', floorsCovered: '', locationDescription: '' });
      setEditingRiser(null);
    } catch (err) {
      console.error("Error updating riser:", err);
      setError(`Error updating riser: ${err.message || err}`);
    }
  };

  const cancelEditingRiser = () => {
    setEditingRiser(null);
    setNewRiser({ number: '', floorsCovered: '', locationDescription: '' });
  };

  const startEditingFloor = (floor) => {
    setEditingFloor(floor);
    setNewFloor({
      number: floor.number,
      description: floor.description
    });
  };

  const handleUpdateFloor = async (e) => {
    e.preventDefault();
    if (!selectedBuildingId || !editingFloor || !newFloor.number) return;

    try {
      // In the current API, we need to delete and recreate since there's no updateFloor function
      await removeFloorFromBuilding(selectedBuildingId, editingFloor.id);

      const updatedFloorObj = {
        id: editingFloor.id,
        number: parseInt(newFloor.number),
        description: newFloor.description
      };

      await addFloorToBuilding(selectedBuildingId, updatedFloorObj);

      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === parseInt(selectedBuildingId));
      if (updatedBuilding) {
        setFloors(updatedBuilding.floors || []);
      }
      setNewFloor({ number: '', description: '' });
      setEditingFloor(null);
    } catch (err) {
      console.error("Error updating floor:", err);
      setError(`Error updating floor: ${err.message || err}`);
    }
  };

  const cancelEditingFloor = () => {
    setEditingFloor(null);
    setNewFloor({ number: '', description: '' });
  };

  const handleDeleteFloor = async (floorId) => {
    if (!selectedBuildingId) return;

    try {
      await removeFloorFromBuilding(selectedBuildingId, floorId);
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === parseInt(selectedBuildingId));
      if (updatedBuilding) {
        setFloors(updatedBuilding.floors || []);
      }
    } catch (err) {
      console.error("Error deleting floor:", err);
      setError(`Error deleting floor: ${err.message || err}`);
    }
  };

  const handleDeleteRiser = async (riserId) => {
    if (!selectedBuildingId) return;

    try {
      await removeRiserFromBuilding(selectedBuildingId, riserId);
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === parseInt(selectedBuildingId));
      if (updatedBuilding) {
        setRisers(updatedBuilding.risers || []);
      }
    } catch (err) {
      console.error("Error deleting riser:", err);
      setError(`Error deleting riser: ${err.message || err}`);
    }
  };

  // Image management functions
  const handleImageFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Basic validation for image files
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      setImageFile(selectedFile);
      setNewImage({ ...newImage, url: URL.createObjectURL(selectedFile) });
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await removeImageFromBuilding(imageId); // Note: removeImageFromBuilding only needs the imageId
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);

      // Reload both direct and linked images for the selected building
      const currentBuilding = updatedBuildings.find(b => b.id === parseInt(selectedBuildingId));
      if (currentBuilding) {
        const linkedImages = getLinkedImages();
        const allImages = [
          ...(currentBuilding.images || []).map(img => ({...img, isLinked: false})),
          ...linkedImages
        ];
        setImages(allImages);
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      setError(`Error deleting image: ${err.message || err}`);
    }
  };

  const handleAddImage = async () => {
    if (!selectedBuildingId) return;

    // Check if we have either a file or a URL
    if (!imageFile && !newImage.url) {
      alert('Please select an image file or enter an image URL');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = newImage.url;

      // If we have a file, use its object URL; otherwise use the entered URL
      if (imageFile) {
        imageUrl = URL.createObjectURL(imageFile);
      }

      const imageObj = {
        type: newImage.type,
        url: imageUrl,
        originalFileName: imageFile ? imageFile.name : null,
        linkedBuildingIds: imageBuildingsToLink // Use the selected buildings
      };

      await addImageToBuilding(selectedBuildingId, imageObj);

      // If we need to add this image to other buildings as well
      if (imageBuildingsToLink.length > 0) {
        for (const buildingId of imageBuildingsToLink) {
          // Create a new image object for the linked building, with updated linkedBuildingIds
          const linkedImageObj = {
            ...imageObj,
            linkedBuildingIds: [selectedBuildingId, ...imageBuildingsToLink.filter(id => id !== buildingId)]
          };

          // Add the image to the linked building
          await addImageToBuilding(buildingId, linkedImageObj);
        }
      }

      // Refresh all data after adding to multiple buildings
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === parseInt(selectedBuildingId));
      if (updatedBuilding) {
        // The updated building will have placeholder URLs, but that's expected for mock API
        setImages(updatedBuilding.images || []);
      }
      setImageFile(null);
      setNewImage({ type: 'Parking', url: '' });
      setImageBuildingsToLink([]); // Reset the linked buildings
      setShowImageLinkOptions(false); // Hide the options after upload
    } catch (err) {
      console.error("Error adding image:", err);
      setError(`Error adding image: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };


  if (user?.role !== 'Admin') {
    return <div className="text-center mt-10">Access Denied. Admins Only.</div>;
  }

  if (loading) {
    return (
      <div className="full-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Buildings...</h1>
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
        <h1 className="text-2xl font-bold mb-4 ml-12">Manage Building</h1>

        {error && <div className="mb-4 p-2 bg-red-600 text-white rounded">{error}</div>}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-600 mb-4">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'buildings' ? 'text-[#00BFA5] border-b-2 border-[#00BFA5]' : 'text-gray-400'}`}
            onClick={() => setActiveTab('buildings')}
          >
            Buildings
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'pdfs' ? 'text-[#00BFA5] border-b-2 border-[#00BFA5]' : 'text-gray-400'}`}
            onClick={() => setActiveTab('pdfs')}
          >
            PDFs
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'floors-risers' ? 'text-[#00BFA5] border-b-2 border-[#00BFA5]' : 'text-gray-400'}`}
            onClick={() => setActiveTab('floors-risers')}
          >
            Floors & Risers
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'images' ? 'text-[#00BFA5] border-b-2 border-[#00BFA5]' : 'text-gray-400'}`}
            onClick={() => setActiveTab('images')}
          >
            Images
          </button>
        </div>

        {/* Buildings Tab */}
        {activeTab === 'buildings' && (
          <div>
            <Card className="mockup-card mb-4">
              <h3 className="mockup-card-header">Add New Building</h3>
              <form onSubmit={handleCreateBuilding}>
                <Input label="Name" value={newBuilding.name} onChange={(e) => handleChangeBuilding(e, 'name')} required />
                <Input label="Address" value={newBuilding.address} onChange={(e) => handleChangeBuilding(e, 'address')} />
                <select value={newBuilding.technology} onChange={(e) => {
                  handleChangeBuilding(e, 'technology');
                  if (e.target.value !== 'Other') {
                    handleChangeBuilding({target: {value: ''}}, 'customTechnology');
                  }
                }} className="input-mockup mb-2 w-full">
                  {allTechnologies.map((tech, index) => (
                    <option key={`new-${index}`} value={tech}>{tech}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {newBuilding.technology === 'Other' && (
                  <Input
                    label="Custom Technology"
                    value={newBuilding.customTechnology}
                    onChange={(e) => handleChangeBuilding(e, 'customTechnology')}
                    placeholder="Enter custom technology name"
                  />
                )}
                <Input label="Complexity %" type="number" value={newBuilding.complexityPercentage} onChange={(e) => handleChangeBuilding(e, 'complexityPercentage')} />
                <Input label="Required Techs" type="number" value={newBuilding.requiredTechnicians} onChange={(e) => handleChangeBuilding(e, 'requiredTechnicians')} />
                <select value={newBuilding.parkingType} onChange={(e) => handleChangeBuilding(e, 'parkingType')} className="input-mockup mb-2">
                  <option value="Underground">Underground</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Street">Street</option>
                  <option value="Other">Other</option>
                </select>
                <Input label="Parking Instructions" value={newBuilding.parkingInstructions} onChange={(e) => handleChangeBuilding(e, 'parkingInstructions')} />
                <select value={newBuilding.direction} onChange={(e) => handleChangeBuilding(e, 'direction')} className="input-mockup mb-2">
                  <option value="N/A">N/A</option>
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                  <option value="North-East">North-East</option>
                  <option value="North-West">North-West</option>
                  <option value="South-East">South-East</option>
                  <option value="South-West">South-West</option>
                  <option value="Left">Left</option>
                  <option value="Right">Right</option>
                  <option value="Front">Front</option>
                  <option value="Back">Back</option>
                </select>
                <Button type="submit" className="btn-mockup mt-2">Add Building</Button>
              </form>
            </Card>

            {editingBuilding && (
              <Card className="mockup-card mb-4">
                <h3 className="mockup-card-header">Edit Building: {editingBuilding.name}</h3>
                <form onSubmit={handleUpdateBuilding}>
                  <Input label="Name" value={editingBuilding.name} onChange={(e) => handleChangeBuilding(e, 'name', true)} required />
                  <Input label="Address" value={editingBuilding.address} onChange={(e) => handleChangeBuilding(e, 'address', true)} />
                  <select value={editingBuilding.technology} onChange={(e) => {
                    handleChangeBuilding(e, 'technology', true);
                    if (e.target.value !== 'Other') {
                      handleChangeBuilding({target: {value: ''}}, 'customTechnology', true);
                    }
                  }} className="input-mockup mb-2 w-full">
                    {allTechnologies.map((tech, index) => (
                      <option key={`edit-${index}`} value={tech}>{tech}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                  {editingBuilding.technology === 'Other' && (
                    <Input
                      label="Custom Technology"
                      value={editingBuilding.customTechnology}
                      onChange={(e) => handleChangeBuilding(e, 'customTechnology', true)}
                      placeholder="Enter custom technology name"
                    />
                  )}
                  <Input label="Complexity %" type="number" value={editingBuilding.complexityPercentage} onChange={(e) => handleChangeBuilding(e, 'complexityPercentage', true)} />
                  <Input label="Required Techs" type="number" value={editingBuilding.requiredTechnicians} onChange={(e) => handleChangeBuilding(e, 'requiredTechnicians', true)} />
                  <select value={editingBuilding.parkingType} onChange={(e) => handleChangeBuilding(e, 'parkingType', true)} className="input-mockup mb-2">
                    <option value="Underground">Underground</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Street">Street</option>
                    <option value="Other">Other</option>
                  </select>
                  <Input label="Parking Instructions" value={editingBuilding.parkingInstructions} onChange={(e) => handleChangeBuilding(e, 'parkingInstructions', true)} />
                  <select value={editingBuilding.direction} onChange={(e) => handleChangeBuilding(e, 'direction', true)} className="input-mockup mb-2">
                    <option value="N/A">N/A</option>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="North-East">North-East</option>
                    <option value="North-West">North-West</option>
                    <option value="South-East">South-East</option>
                    <option value="South-West">South-West</option>
                    <option value="Left">Left</option>
                    <option value="Right">Right</option>
                    <option value="Front">Front</option>
                    <option value="Back">Back</option>
                  </select>
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
                    <p className="text-sm text-teal-400">Direction: {building.direction || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => startEditingBuilding(building)} className="btn-mockup-outline text-xs">Edit</Button>
                    <Button onClick={() => handleDeleteBuilding(building.id)} className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700">Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* PDFs Tab */}
        {activeTab === 'pdfs' && (
          <div>
            {/* Sub-tab Navigation for PDFs */}
            <div className="flex border-b border-gray-600 mb-4">
              <button
                className={`py-2 px-4 font-medium ${!showAllPdfs ? 'text-[#00BFA5] border-b-2 border-[#00BFA5]' : 'text-gray-400'}`}
                onClick={() => setShowAllPdfs(false)}
              >
                Building PDFs
              </button>
              <button
                className={`py-2 px-4 font-medium ${showAllPdfs ? 'text-[#00BFA5] border-b-2 border-[#00BFA5]' : 'text-gray-400'}`}
                onClick={() => setShowAllPdfs(true)}
              >
                All PDFs
              </button>
            </div>

            {/* Building-specific PDFs view */}
            {!showAllPdfs && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <select
                    value={selectedBuildingId}
                    onChange={(e) => setSelectedBuildingId(e.target.value)}
                    className="input-mockup w-2/3"
                  >
                    <option value="">Select a Building</option>
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <Button
                    onClick={() => setShowAllPdfs(true)}
                    className="btn-mockup ml-2"
                  >
                    View PDF Configuration
                  </Button>
                </div>

                {selectedBuildingId && (
                  <>
                    <Card className="mockup-card mb-4">
                      <h3 className="mockup-card-header">Add PDF to {buildings.find(b => b.id === parseInt(selectedBuildingId))?.name}</h3>

                      {/* File upload section */}
                      <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Upload PDF File</label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                        />
                      </div>

                      <Input label="PDF Title" value={newPdf.title} onChange={(e) => setNewPdf({...newPdf, title: e.target.value})} />
                      <select
                        value={newPdf.tech}
                        onChange={(e) => setNewPdf({...newPdf, tech: e.target.value})}
                        className="input-mockup mb-2"
                      >
                        {allTechnologies.map((tech, index) => (
                          <option key={`pdf-${index}`} value={tech}>{tech}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                      <Input label="PDF URL" value={newPdf.url} onChange={(e) => setNewPdf({...newPdf, url: e.target.value})} placeholder="https://example.com/document.pdf" />

                      {/* Building linking options */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium">Link to other buildings:</label>
                          <Button
                            onClick={() => setShowPdfLinkOptions(!showPdfLinkOptions)}
                            className="btn-mockup-outline text-xs"
                          >
                            {showPdfLinkOptions ? 'Hide Options' : 'Show Options'}
                          </Button>
                        </div>

                        {showPdfLinkOptions && (
                          <div className="border border-gray-600 rounded p-3 mt-2">
                            <div className="flex gap-2 mb-3">
                              <Button onClick={selectAllPdfBuildings} className="btn-mockup text-xs flex-1">Select All</Button>
                              <Button onClick={clearAllPdfBuildings} className="btn-mockup-outline text-xs flex-1">Clear All</Button>
                            </div>

                            <div className="max-h-40 overflow-y-auto">
                              {buildings
                                .filter(b => b.id !== parseInt(selectedBuildingId)) // Exclude the current building
                                .map(building => (
                                  <div key={building.id} className="flex items-center mb-1">
                                    <input
                                      type="checkbox"
                                      id={`pdf-building-${building.id}`}
                                      checked={pdfBuildingsToLink.includes(building.id)}
                                      onChange={() => togglePdfBuildingLink(building.id)}
                                      className="mr-2"
                                    />
                                    <label htmlFor={`pdf-building-${building.id}`} className="flex-1 text-sm">
                                      {building.name}
                                    </label>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {uploading && (
                        <div className="mb-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-center mt-1">Uploading... {uploadProgress}%</p>
                        </div>
                      )}

                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={handleUploadPdf}
                          disabled={!file || uploading}
                          className="btn-mockup flex-grow"
                        >
                          {uploading ? 'Uploading...' : 'Upload PDF'}
                        </Button>
                        <Button
                          onClick={handleAddPdfByUrl}
                          disabled={uploading}
                          className="btn-mockup flex-grow"
                        >
                          Add by URL
                        </Button>
                      </div>
                    </Card>

                    <h2 className="text-xl font-bold mt-4 mb-2">PDFs</h2>
                    <div className="space-y-2">
                      {pdfs.map(pdf => (
                        <Card key={pdf.id} className="mockup-card flex justify-between items-center">
                          <div>
                            <h3 className="font-bold">{pdf.title}</h3>
                            <p className="text-sm text-gray-400">Tech: {pdf.tech}</p>
                            {pdf.isLinked && pdf.sourceBuilding && (
                              <p className="text-xs text-teal-400">From: {pdf.sourceBuilding}</p>
                            )}
                            {pdf.linkedBuildingIds && pdf.linkedBuildingIds.length > 0 && (
                              <p className="text-xs text-teal-400">Linked to {pdf.linkedBuildingIds.length} other building(s)</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => window.open(pdf.url, '_blank')} className="btn-mockup-outline text-xs">View</Button>
                            <Button onClick={() => handleDeletePdf(pdf.id)} className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700">Delete</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* All PDFs view */}
            {showAllPdfs && (
              <AllPDFsManager />
            )}
          </div>
        )}

        {/* Floors & Risers Tab */}
        {activeTab === 'floors-risers' && (
          <div>
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
                  <h3 className="mockup-card-header">{editingFloor ? 'Edit Floor' : 'Add Floor'}</h3>
                  <form onSubmit={editingFloor ? handleUpdateFloor : handleAddFloor}>
                    <Input label="Floor Number" type="number" value={newFloor.number} onChange={(e) => setNewFloor({...newFloor, number: e.target.value})} />
                    <Input label="Description" value={newFloor.description} onChange={(e) => setNewFloor({...newFloor, description: e.target.value})} />
                    <div className="flex gap-2 mt-2">
                      <Button type="submit" className="btn-mockup">
                        {editingFloor ? 'Update Floor' : 'Add Floor'}
                      </Button>
                      {editingFloor && (
                        <Button type="button" onClick={cancelEditingFloor} className="btn-mockup-outline">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Card>

                <Card className="mockup-card mb-4">
                  <h3 className="mockup-card-header">{editingRiser ? 'Edit Riser' : 'Add Riser'}</h3>
                  <form onSubmit={editingRiser ? handleUpdateRiser : handleAddRiser}>
                    <Input label="Riser Number" value={newRiser.number} onChange={(e) => setNewRiser({...newRiser, number: e.target.value})} />
                    <Input label="Floors Covered" placeholder="e.g., 1-5, 7-10" value={newRiser.floorsCovered} onChange={(e) => setNewRiser({...newRiser, floorsCovered: e.target.value})} />
                    <p className="text-xs text-gray-400 mb-2">Note: Multiple risers can cover the same floor (e.g., East and West risers on floor 24)</p>
                    <Input label="Location Description" value={newRiser.locationDescription} onChange={(e) => setNewRiser({...newRiser, locationDescription: e.target.value})} />
                    <div className="flex gap-2 mt-2">
                      <Button type="submit" className="btn-mockup">
                        {editingRiser ? 'Update Riser' : 'Add Riser'}
                      </Button>
                      {editingRiser && (
                        <Button type="button" onClick={cancelEditingRiser} className="btn-mockup-outline">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </Card>

                <h2 className="text-xl font-bold mt-4 mb-2">Floors</h2>
                <div className="space-y-2">
                  {floors.map(floor => (
                    <Card key={floor.id} className="mockup-card flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">Floor {floor.number}</h3>
                        <p className="text-sm text-gray-400">{floor.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => startEditingFloor(floor)} className="btn-mockup-outline text-xs">Edit</Button>
                        <Button onClick={() => handleDeleteFloor(floor.id)} className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700">Delete</Button>
                      </div>
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
                        <p className="text-sm text-gray-400">{riser.locationDescription}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => startEditingRiser(riser)} className="btn-mockup-outline text-xs">Edit</Button>
                        <Button onClick={() => handleDeleteRiser(riser.id)} className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700">Delete</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div>
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
                  <h3 className="mockup-card-header">Add Image to {buildings.find(b => b.id === parseInt(selectedBuildingId))?.name}</h3>

                  <select
                    value={newImage.type}
                    onChange={(e) => setNewImage({ ...newImage, type: e.target.value })}
                    className="input-mockup mb-2"
                  >
                    <option value="Parking">Parking</option>
                    <option value="Entrance">Entrance</option>
                    <option value="Riser">Riser</option>
                    <option value="Panel">Panel</option>
                    <option value="Other">Other</option>
                  </select>

                  {/* File upload section */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Upload Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md"
                    />
                  </div>

                  {/* Option to add by URL */}
                  <div className="mb-2">
                    <label className="block text-sm font-medium mb-1">Or Enter Image URL</label>
                    <Input
                      label=""
                      value={newImage.url}
                      onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Building linking options */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium">Link to other buildings:</label>
                      <Button
                        onClick={() => setShowImageLinkOptions(!showImageLinkOptions)}
                        className="btn-mockup-outline text-xs"
                      >
                        {showImageLinkOptions ? 'Hide Options' : 'Show Options'}
                      </Button>
                    </div>

                    {showImageLinkOptions && (
                      <div className="border border-gray-600 rounded p-3 mt-2">
                        <div className="flex gap-2 mb-3">
                          <Button onClick={selectAllImageBuildings} className="btn-mockup text-xs flex-1">Select All</Button>
                          <Button onClick={clearAllImageBuildings} className="btn-mockup-outline text-xs flex-1">Clear All</Button>
                        </div>

                        <div className="max-h-40 overflow-y-auto">
                          {buildings
                            .filter(b => b.id !== parseInt(selectedBuildingId)) // Exclude the current building
                            .map(building => (
                              <div key={building.id} className="flex items-center mb-1">
                                <input
                                  type="checkbox"
                                  id={`image-building-${building.id}`}
                                  checked={imageBuildingsToLink.includes(building.id)}
                                  onChange={() => toggleImageBuildingLink(building.id)}
                                  className="mr-2"
                                />
                                <label htmlFor={`image-building-${building.id}`} className="flex-1 text-sm">
                                  {building.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {imageFile && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-400">Selected file: {imageFile.name}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={handleAddImage}
                      disabled={(!imageFile && !newImage.url) || uploading}
                      className="btn-mockup flex-grow"
                    >
                      {uploading ? 'Uploading...' : imageFile ? 'Upload File' : 'Add by URL'}
                    </Button>
                  </div>
                </Card>

                <h2 className="text-xl font-bold mt-4 mb-2">Images</h2>
                <div className="grid grid-cols-2 gap-2">
                  {images.map(image => (
                    <Card key={image.id} className="mockup-card flex flex-col items-center">
                      <img
                        src={image.url}
                        alt={`${image.type} for ${buildings.find(b => b.id === parseInt(selectedBuildingId))?.name}`}
                        className="w-full h-auto rounded-md mb-2 max-h-32 object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                      <p className="text-xs">{image.type}</p>
                      {image.isLinked && image.sourceBuilding && (
                        <p className="text-xs text-teal-400">From: {image.sourceBuilding}</p>
                      )}
                      {image.linkedBuildingIds && image.linkedBuildingIds.length > 0 && (
                        <p className="text-xs text-teal-400">Linked to {image.linkedBuildingIds.length} other building(s)</p>
                      )}
                      <div className="flex gap-1 mt-1">
                        <Button onClick={() => handleDeleteImage(image.id)} className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700">Delete</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>


      <BottomNav />
    </div>
  );
};

export default ManageBuilding;