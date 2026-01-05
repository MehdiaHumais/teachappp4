import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBuildingById, getBuildings } from '../services/api';
import Card from '../components/ui/Card';
import BottomNav from '../components/ui/BottomNav';
import BackButton from '../components/ui/BackButton';
import Button from '../components/ui/Button';

const PDFViewerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [allBuildings, setAllBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch the specific building and all buildings
        const [buildingData, allBuildingsData] = await Promise.all([
          getBuildingById(id),
          getBuildings()
        ]);

        if (buildingData) {
          setBuilding(buildingData);
        } else {
          setError('Building not found.');
        }

        setAllBuildings(allBuildingsData);
      } catch (err) {
        setError('Failed to fetch building data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="full-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-screen bg-dark flex flex-col items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate('/buildings')} className="mt-4">
          Back to Buildings
        </Button>
      </div>
    );
  }

  if (!building) {
    return <div className="text-center mt-10">No building found.</div>;
  }

  // Function to get all linked PDFs for this building
  const getLinkedPDFs = () => {
    if (!allBuildings || !building) return [];

    const linkedPDFs = [];

    allBuildings.forEach(b => {
      if (b.techPDFs && b.techPDFs.length > 0) {
        b.techPDFs.forEach(pdf => {
          if (pdf.linkedBuildingIds && pdf.linkedBuildingIds.includes(parseInt(id))) {
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

  const linkedPDFs = getLinkedPDFs();
  const allPDFs = [
    ...(building.techPDFs || []).map(pdf => ({...pdf, isLinked: false})),
    ...linkedPDFs
  ];

  return (
    <div className="full-screen bg-dark flex flex-col">
      <div className="p-4 flex-grow overflow-y-auto relative pt-12">
        <div className="absolute top-4 left-4 z-10">
          <BackButton />
        </div>
        <h1 className="text-2xl font-bold mb-4">ONT Configuration Documents – {building.name}</h1>

        <div className="space-y-4">
          {allPDFs && allPDFs.length > 0 ? (
            allPDFs.map(pdf => (
              <Card key={pdf.id} className="mockup-card">
                <h3 className="mockup-card-header">{pdf.title}</h3>
                <p className="text-gray-400 mb-1">Tech: {pdf.tech}</p>
                {pdf.isLinked && pdf.sourceBuilding && (
                  <p className="text-sm text-teal-400 mb-1">From: {pdf.sourceBuilding}</p>
                )}
                {pdf.isLinked && (
                  <p className="text-xs text-gray-500 mb-2">(Linked from another building)</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="primary" size="sm" className="btn-mockup" onClick={() => window.open(pdf.url, '_blank')}>
                    OPEN PDF
                  </Button>
                  <Button variant="outline" size="sm" className="btn-mockup-outline" onClick={() => {
                    const link = document.createElement('a');
                    link.href = pdf.url;
                    link.download = pdf.title.replace(/\s+/g, '_') + '.pdf';
                    link.click();
                  }}>
                    DOWNLOAD
                  </Button>
                  {pdf.isLinked && pdf.sourceBuilding && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="btn-mockup-outline bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        // Find the building ID that corresponds to the source building
                        const sourceBuilding = allBuildings.find(b => b.name === pdf.sourceBuilding);
                        if (sourceBuilding) {
                          navigate(`/building/${sourceBuilding.id}`);
                        }
                      }}
                    >
                      OPEN BUILDING
                    </Button>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-400">No PDF documents available for this building.</p>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default PDFViewerPage;