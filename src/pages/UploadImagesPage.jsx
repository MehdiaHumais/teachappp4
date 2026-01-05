import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBuildingById, addImageToBuilding, getBuildings } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BottomNav from '../components/ui/BottomNav';
import BackButton from '../components/ui/BackButton';

const UploadImagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const buildingId = searchParams.get('buildingId');
  const [building, setBuilding] = useState(null);
  const [newImages, setNewImages] = useState([{ type: 'Parking', url: '' }]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!buildingId) {
      setError('Building ID is required');
      return;
    }
    
    const fetchBuilding = async () => {
      try {
        const data = await getBuildingById(buildingId);
        if (data) {
          setBuilding(data);
        } else {
          setError('Building not found');
        }
      } catch (err) {
        setError(`Failed to load building: ${err.message}`);
      }
    };
    
    fetchBuilding();
  }, [buildingId]);

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

  const addImageField = () => {
    setNewImages([...newImages, { type: 'Parking', url: '' }]);
  };

  const removeImageField = (index) => {
    if (newImages.length > 1) {
      const updatedImages = [...newImages];
      updatedImages.splice(index, 1);
      setNewImages(updatedImages);
    }
  };

  const updateImageField = (index, field, value) => {
    const updatedImages = [...newImages];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setNewImages(updatedImages);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    
    // Filter out empty images
    const validImages = newImages.filter(img => img.url.trim() !== '');
    
    if (validImages.length === 0) {
      setError('Please provide at least one image URL');
      return;
    }
    
    try {
      for (const image of validImages) {
        await addImageToBuilding(buildingId, image);
      }
      
      // Navigate back to building detail after successful upload
      navigate(`/building/${buildingId}`);
    } catch (err) {
      setError(`Failed to upload images: ${err.message}`);
    }
  };

  if (error && !building) {
    return (
      <div className="full-screen bg-dark flex flex-col">
        <div className="p-4 flex-grow overflow-y-auto">
          <BackButton className="mb-4" />
          <div className="text-center mt-10 text-red-500">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p>{error}</p>
            <Button 
              onClick={() => navigate('/buildings')} 
              className="mt-4"
            >
              Go to Building List
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto relative pt-12">
        <BackButton className="absolute top-4 left-4 z-10" />
        <h1 className="text-2xl font-bold mb-4 ml-12">Upload Images to {building ? building.name : 'Building'}</h1>

        {error && <div className="mb-4 p-2 bg-red-600 text-white rounded">{error}</div>}

        <form onSubmit={handleUpload}>
          <Card className="mockup-card mb-4">
            {newImages.map((image, index) => (
              <div key={index} className="mb-4 p-3 border-b border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="mockup-card-header text-base">Image {index + 1}</h3>
                  {newImages.length > 1 && (
                    <Button 
                      type="button" 
                      onClick={() => removeImageField(index)}
                      className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <select
                  value={image.type}
                  onChange={(e) => updateImageField(index, 'type', e.target.value)}
                  className="input-mockup mb-2 w-full"
                >
                  <option value="Parking">Parking</option>
                  <option value="Entrance">Entrance</option>
                  <option value="Riser">Riser</option>
                  <option value="Panel">Panel</option>
                  <option value="Other">Other</option>
                </select>
                
                <Input
                  label="Image URL"
                  type="url"
                  value={image.url}
                  onChange={(e) => updateImageField(index, 'url', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
            ))}
            
            <div className="flex gap-2 mb-4">
              <Button 
                type="button" 
                onClick={addImageField}
                className="btn-mockup-outline flex-grow"
              >
                Add Another Image
              </Button>
            </div>
            
            <Button type="submit" className="btn-mockup w-full">
              Upload Images
            </Button>
          </Card>
        </form>
      </div>
      <BottomNav />
    </div>
  );
};

export default UploadImagesPage;