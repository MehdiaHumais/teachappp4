import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBuildings, addPdfToBuilding, removePdfFromBuilding } from '../services/api'; // Fetch buildings to link PDFs
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BottomNav from '../components/ui/BottomNav';
import BackButton from '../components/ui/BackButton';

const ManagePDFs = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [pdfs, setPdfs] = useState([]);
  const [newPdf, setNewPdf] = useState({ title: '', tech: 'Huawei', url: '' });
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
        setPdfs(building.techPDFs || []);
      }
    } else {
        setPdfs([]);
    }
  }, [selectedBuildingId, buildings]);

  if (user?.role !== 'Admin') {
    return <div className="text-center mt-10">Access Denied. Admins Only.</div>;
  }

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

  const handleUploadPdf = async () => {
    if (!selectedBuildingId || !file) {
      if (!file) alert('Please select a PDF file to upload');
      return;
    }

    setUploading(true);
    try {
      const newPdfObj = {
        title: newPdf.title || file.name.replace('.pdf', ''),
        tech: newPdf.tech,
        url: URL.createObjectURL(file),
        originalFileName: file.name
      };

      await addPdfToBuilding(selectedBuildingId, newPdfObj);

      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === selectedBuildingId);
      if (updatedBuilding) {
        setPdfs(updatedBuilding.techPDFs || []);
      }
      setFile(null);
      setNewPdf({ title: '', tech: 'Huawei', url: '' });
    } catch (err) {
      console.error("Error adding PDF:", err);
      alert(`Error adding PDF: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleAddPdfByUrl = async () => {
    if (!selectedBuildingId || !newPdf.title || !newPdf.url) return; // Basic validation
    try {
      const newPdfObj = { title: newPdf.title, tech: newPdf.tech, url: newPdf.url };
      await addPdfToBuilding(selectedBuildingId, newPdfObj);

      // Fetch updated list to reflect the change properly
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === selectedBuildingId);
      if (updatedBuilding) {
        setPdfs(updatedBuilding.techPDFs || []);
      }
      setNewPdf({ title: '', tech: 'Huawei', url: '' });
    } catch (err) {
      console.error("Error adding PDF:", err);
    }
  };

  const handleDeletePdf = async (pdfId) => {
    try {
      await removePdfFromBuilding(pdfId);
      // Fetch updated list to reflect the change properly
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);
      const updatedBuilding = updatedBuildings.find(b => b.id === selectedBuildingId);
      if (updatedBuilding) {
        setPdfs(updatedBuilding.techPDFs || []);
      }
    } catch (err) {
      console.error("Error deleting PDF:", err);
      // Fallback to client-side update if API fails
      const updatedBuildings = buildings.map(b => {
        if (b.id === selectedBuildingId) {
          return { ...b, techPDFs: b.techPDFs ? b.techPDFs.filter(p => p.id !== pdfId) : [] };
        }
        return b;
      });
      setBuildings(updatedBuildings);
      setPdfs(pdfs.filter(p => p.id !== pdfId));
    }
  };

  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto relative">
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold mb-4 ml-12">Manage Technology PDFs</h1>

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
              <h3 className="mockup-card-header">Add PDF to {buildings.find(b => b.id === selectedBuildingId)?.name}</h3>

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
                <option value="Huawei">Huawei</option>
                <option value="Nokia">Nokia</option>
                <option value="SmartOLT">SmartOLT</option>
                <option value="U2000">U2000</option>
                <option value="Positron">Positron</option>
                <option value="Other">Other</option>
              </select>
              <Input label="PDF URL" value={newPdf.url} onChange={(e) => setNewPdf({...newPdf, url: e.target.value})} placeholder="https://example.com/document.pdf" />

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
      <BottomNav />
    </div>
  );
};

export default ManagePDFs;