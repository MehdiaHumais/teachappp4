import React, { useState, useEffect } from 'react';
import { getBuildings, addPdfToBuilding, removePdfFromBuilding, updatePdfLinks } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const AllPDFsManager = () => {
  const [buildings, setBuildings] = useState([]);
  const [allPdfs, setAllPdfs] = useState([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [newPdf, setNewPdf] = useState({ title: '', tech: 'Huawei', url: '' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [pdfToAttach, setPdfToAttach] = useState(null);
  const [pdfBuildingsToLink, setPdfBuildingsToLink] = useState([]);

  // Get unique technologies from buildings for the dropdown
  const allTechnologies = [...new Set([
    'Huawei', 'Nokia', 'SmartOLT', 'U2000', 'Positron', // Default technologies
    ...buildings.flatMap(building => [
      building.technology || building.technologySummary
    ]).filter(Boolean)
  ])];

  useEffect(() => {
    const fetchBuildings = async () => {
      const data = await getBuildings();
      setBuildings(data);

      // Collect all unique PDFs from all buildings with building associations
      const uniquePdfsMap = new Map();

      data.forEach(building => {
        if (building.techPDFs && building.techPDFs.length > 0) {
          building.techPDFs.forEach(pdf => {
            if (!uniquePdfsMap.has(pdf.id)) {
              uniquePdfsMap.set(pdf.id, {
                ...pdf,
                buildingNames: [building.name],
                buildingIds: [building.id]
              });
            } else {
              // If PDF already exists, add this building to its associations
              const existingPdf = uniquePdfsMap.get(pdf.id);
              if (!existingPdf.buildingIds.includes(building.id)) {
                existingPdf.buildingNames.push(building.name);
                existingPdf.buildingIds.push(building.id);
              }
            }
          });
        }
      });

      setAllPdfs(Array.from(uniquePdfsMap.values()));
    };
    fetchBuildings();
  }, []);

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
        originalFileName: file.name,
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

      // Refresh data
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);

      // Update all PDFs list
      const uniquePdfsMap = new Map();
      updatedBuildings.forEach(building => {
        if (building.techPDFs && building.techPDFs.length > 0) {
          building.techPDFs.forEach(pdf => {
            if (!uniquePdfsMap.has(pdf.id)) {
              uniquePdfsMap.set(pdf.id, {
                ...pdf,
                buildingNames: [building.name],
                buildingIds: [building.id]
              });
            } else {
              // If PDF already exists, add this building to its associations
              const existingPdf = uniquePdfsMap.get(pdf.id);
              if (!existingPdf.buildingIds.includes(building.id)) {
                existingPdf.buildingNames.push(building.name);
                existingPdf.buildingIds.push(building.id);
              }
            }
          });
        }
      });

      setAllPdfs(Array.from(uniquePdfsMap.values()));

      setFile(null);
      setNewPdf({ title: '', tech: 'Huawei', url: '' });
      setPdfBuildingsToLink([]); // Reset the linked buildings
    } catch (err) {
      console.error("Error adding PDF:", err);
      alert(`Error adding PDF: ${err.message}`);
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

      // Refresh data
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);

      // Update all PDFs list
      const uniquePdfsMap = new Map();
      updatedBuildings.forEach(building => {
        if (building.techPDFs && building.techPDFs.length > 0) {
          building.techPDFs.forEach(pdf => {
            if (!uniquePdfsMap.has(pdf.id)) {
              uniquePdfsMap.set(pdf.id, {
                ...pdf,
                buildingNames: [building.name],
                buildingIds: [building.id]
              });
            } else {
              // If PDF already exists, add this building to its associations
              const existingPdf = uniquePdfsMap.get(pdf.id);
              if (!existingPdf.buildingIds.includes(building.id)) {
                existingPdf.buildingNames.push(building.name);
                existingPdf.buildingIds.push(building.id);
              }
            }
          });
        }
      });

      setAllPdfs(Array.from(uniquePdfsMap.values()));

      setNewPdf({ title: '', tech: 'Huawei', url: '' });
      setPdfBuildingsToLink([]); // Reset the linked buildings
    } catch (err) {
      console.error("Error adding PDF:", err);
    }
  };

  const handleDeletePdf = async (pdfId, buildingId) => {
    try {
      await removePdfFromBuilding(pdfId);

      // Refresh data
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);

      // Update all PDFs list
      const uniquePdfsMap = new Map();
      updatedBuildings.forEach(building => {
        if (building.techPDFs && building.techPDFs.length > 0) {
          building.techPDFs.forEach(pdf => {
            if (!uniquePdfsMap.has(pdf.id)) {
              uniquePdfsMap.set(pdf.id, {
                ...pdf,
                buildingNames: [building.name],
                buildingIds: [building.id]
              });
            } else {
              // If PDF already exists, add this building to its associations
              const existingPdf = uniquePdfsMap.get(pdf.id);
              if (!existingPdf.buildingIds.includes(building.id)) {
                existingPdf.buildingNames.push(building.name);
                existingPdf.buildingIds.push(building.id);
              }
            }
          });
        }
      });

      setAllPdfs(Array.from(uniquePdfsMap.values()));
    } catch (err) {
      console.error("Error deleting PDF:", err);
    }
  };

  const openAttachModal = (pdf) => {
    setPdfToAttach(pdf);
    setPdfBuildingsToLink([]); // Reset selection
    setShowAttachModal(true);
  };

  const toggleBuildingLink = (buildingId) => {
    if (pdfBuildingsToLink.includes(buildingId)) {
      setPdfBuildingsToLink(pdfBuildingsToLink.filter(id => id !== buildingId));
    } else {
      setPdfBuildingsToLink([...pdfBuildingsToLink, buildingId]);
    }
  };

  const selectAllBuildings = () => {
    const allBuildingIds = buildings.map(b => b.id);
    setPdfBuildingsToLink(allBuildingIds);
  };

  const clearAllBuildings = () => {
    setPdfBuildingsToLink([]);
  };

  const handleAttachToBuildings = async () => {
    if (!pdfToAttach || pdfBuildingsToLink.length === 0) return;

    try {
      // For each selected building, add the PDF
      for (const buildingId of pdfBuildingsToLink) {
        // Create a new PDF object for each building
        const newPdfObj = {
          title: pdfToAttach.title,
          tech: pdfToAttach.tech,
          url: pdfToAttach.url,
          linkedBuildingIds: pdfBuildingsToLink // Link to all selected buildings
        };

        await addPdfToBuilding(buildingId, newPdfObj);
      }

      // Refresh data
      const updatedBuildings = await getBuildings();
      setBuildings(updatedBuildings);

      // Update all PDFs list
      const uniquePdfsMap = new Map();
      updatedBuildings.forEach(building => {
        if (building.techPDFs && building.techPDFs.length > 0) {
          building.techPDFs.forEach(pdf => {
            if (!uniquePdfsMap.has(pdf.id)) {
              uniquePdfsMap.set(pdf.id, {
                ...pdf,
                buildingNames: [building.name],
                buildingIds: [building.id]
              });
            } else {
              // If PDF already exists, add this building to its associations
              const existingPdf = uniquePdfsMap.get(pdf.id);
              if (!existingPdf.buildingIds.includes(building.id)) {
                existingPdf.buildingNames.push(building.name);
                existingPdf.buildingIds.push(building.id);
              }
            }
          });
        }
      });

      setAllPdfs(Array.from(uniquePdfsMap.values()));

      setShowAttachModal(false);
      setPdfBuildingsToLink([]);
    } catch (err) {
      console.error("Error attaching PDF to buildings:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">All PDFs Management</h2>

      {/* Upload PDF Form */}
      <Card className="mockup-card">
        <h3 className="mockup-card-header">Upload New PDF</h3>

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
          className="input-mockup mb-2 w-full"
        >
          {allTechnologies.map((tech, index) => (
            <option key={`pdf-${index}`} value={tech}>{tech}</option>
          ))}
          <option value="Other">Other</option>
        </select>

        <Input label="PDF URL" value={newPdf.url} onChange={(e) => setNewPdf({...newPdf, url: e.target.value})} placeholder="https://example.com/document.pdf" />

        {/* Building linking options */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-2">Upload to main building and link to others:</label>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Main building to upload to:</label>
            <select
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
              className="input-mockup w-full"
            >
              <option value="">Select a Building</option>
              {buildings.map(building => (
                <option key={`main-${building.id}`} value={building.id}>{building.name}</option>
              ))}
            </select>
          </div>

          <div className="border border-gray-600 rounded p-3">
            <div className="flex gap-2 mb-3">
              <Button onClick={selectAllBuildings} className="btn-mockup text-xs flex-1">Select All Buildings</Button>
              <Button onClick={clearAllBuildings} className="btn-mockup-outline text-xs flex-1">Clear All</Button>
            </div>

            <div className="max-h-40 overflow-y-auto">
              {buildings
                .filter(b => b.id !== selectedBuildingId) // Exclude the main building
                .map(building => (
                  <div key={`link-${building.id}`} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`upload-building-${building.id}`}
                      checked={pdfBuildingsToLink.includes(building.id)}
                      onChange={() => toggleBuildingLink(building.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`upload-building-${building.id}`} className="flex-1 text-sm">
                      {building.name}
                    </label>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {uploading && (
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: '100%' }}
              ></div>
            </div>
            <p className="text-xs text-center mt-1">Uploading...</p>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleUploadPdf}
            disabled={!file || !selectedBuildingId || uploading}
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

      {/* All PDFs List */}
      <div>
        <h3 className="text-xl font-bold mb-2">All PDFs</h3>
        <div className="space-y-2">
          {allPdfs.length > 0 ? (
            allPdfs.map(pdf => (
              <Card key={pdf.id} className="mockup-card flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{pdf.title}</h3>
                  <p className="text-sm text-gray-400">Tech: {pdf.tech}</p>
                  <p className="text-xs text-gray-500">
                    Linked to: {pdf.buildingNames.length} building{pdf.buildingNames.length !== 1 ? 's' : ''}
                    {pdf.buildingNames.length > 0 && ` (${pdf.buildingNames.join(', ')})`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(pdf.url, '_blank')}
                    className="btn-mockup-outline text-xs"
                  >
                    View PDF
                  </Button>
                  <Button
                    onClick={() => openAttachModal(pdf)}
                    className="btn-mockup-outline text-xs"
                  >
                    Attach to Buildings
                  </Button>
                  <Button
                    onClick={() => handleDeletePdf(pdf.id)}
                    className="btn-mockup-outline text-xs bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-gray-500">No PDFs found.</p>
          )}
        </div>
      </div>

      {/* Attach to Buildings Modal */}
      {showAttachModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Attach PDF to Buildings</h3>

            <div className="border border-gray-600 rounded p-3 mb-4">
              <div className="flex gap-2 mb-3">
                <Button onClick={selectAllBuildings} className="btn-mockup text-xs flex-1">Select All</Button>
                <Button onClick={clearAllBuildings} className="btn-mockup-outline text-xs flex-1">Clear All</Button>
              </div>

              <div className="max-h-60 overflow-y-auto">
                {buildings.map(building => (
                  <div key={building.id} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`attach-building-${building.id}`}
                      checked={pdfBuildingsToLink.includes(building.id)}
                      onChange={() => toggleBuildingLink(building.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`attach-building-${building.id}`} className="flex-1 text-sm">
                      {building.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAttachToBuildings}
                disabled={pdfBuildingsToLink.length === 0}
                className="btn-mockup flex-grow"
              >
                Attach to Selected Buildings
              </Button>
              <Button
                onClick={() => {
                  setShowAttachModal(false);
                  setPdfBuildingsToLink([]);
                }}
                className="btn-mockup-outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPDFsManager;