import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBuildings, addImageToBuilding, removeImageFromBuilding } from '../services/api'; // Fetch buildings to link images
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BottomNav from '../components/ui/BottomNav';
import BackButton from '../components/ui/BackButton';

const ManageImages = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState({ type: 'Parking', url: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
        setImages(building.images || []);
      }
    } else {
      setImages([]);
    }
  }, [selectedBuildingId, buildings]);

  if (user?.role !== 'Admin') {
    return <div className="text-center mt-10">Access Denied. Admins Only.</div>;
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Basic validation for image files
      if (!selectedFile.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }
      setFile(selectedFile);
      setNewImage({ ...newImage, url: URL.createObjectURL(selectedFile) });
    }
  };

  const handleUploadImage = async () => {
    if (!selectedBuildingId || !file) {
      if (!file) alert('Please select an image file to upload');
      return;
    }

    setUploading(true);
    try {
      // For now, we'll use a placeholder URL since we don't have actual file upload implementation
      // In a real app, you would upload to a service like Supabase storage, AWS S3, etc.
      const newImageObj = {
        type: newImage.type,
        url: URL.createObjectURL(file), // This is a temporary URL until we implement real upload
        originalFileName: file.name
      };

      await addImageToBuilding(selectedBuildingId, newImageObj);

      // Fetch updated list to reflect the change properly
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === selectedBuildingId);
      if (updatedBuilding) {
        setImages(updatedBuilding.images || []);
      }
      setFile(null);
      setNewImage({ type: 'Parking', url: '' });
    } catch (err) {
      console.error("Error adding image:", err);
      alert(`Error adding image: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageByUrl = async () => {
    if (!selectedBuildingId || !newImage.url) return; // Basic validation
    try {
      const newImageObj = { type: newImage.type, url: newImage.url };
      await addImageToBuilding(selectedBuildingId, newImageObj);
      // Fetch updated list to reflect the change properly
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === selectedBuildingId);
      if (updatedBuilding) {
        setImages(updatedBuilding.images || []);
      }
      setNewImage({ type: 'Parking', url: '' });
    } catch (err) {
      console.error("Error adding image:", err);
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await removeImageFromBuilding(imageId); // Fixed: removeImageFromBuilding doesn't need buildingId
      // Fetch updated list to reflect the change properly
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === selectedBuildingId);
      if (updatedBuilding) {
        setImages(updatedBuilding.images || []);
      }
    } catch (err) {
      console.error("Error deleting image:", err);
    }
  };

  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto relative">
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold mb-4 ml-12">Manage Building Images</h1>

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
              <h3 className="mockup-card-header">Add Image to {buildings.find(b => b.id === selectedBuildingId)?.name}</h3>

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
                  onChange={handleFileChange}
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
                  onClick={handleUploadImage}
                  disabled={!file || uploading}
                  className="btn-mockup flex-grow"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
                <Button
                  onClick={handleAddImageByUrl}
                  disabled={uploading}
                  className="btn-mockup flex-grow"
                >
                  Add by URL
                </Button>
              </div>
            </Card>

            <h2 className="text-xl font-bold mt-4 mb-2">Images</h2>
            <div className="grid grid-cols-2 gap-2">
              {images.map(image => (
                <Card key={image.id} className="mockup-card flex flex-col items-center">
                  <img src={image.url} alt={`${image.type} for ${buildings.find(b => b.id === selectedBuildingId)?.name}`} className="w-full h-auto rounded-md mb-2" />
                  <p className="text-xs">{image.type}</p>
                  <Button onClick={() => handleDeleteImage(image.id)} className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700 mt-1">Delete</Button>
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

export default ManageImages;