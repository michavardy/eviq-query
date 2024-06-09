import { useState, useEffect } from 'react';

function useData() {
  const [sections, setSections] = useState([]);
  const [medications, setMedications] = useState([]);
  const [protocols, setProtocols] = useState([])


  useEffect(() => {
    const fetchSectionData = async () => {
        const response = await fetch('http://localhost:8000/sections');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setSections(jsonData);
    };
    const fetchMediationData = async () => {
      const response = await fetch('http://localhost:8000/medications');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();
      setMedications(jsonData)
    }

    const fetchProtocolData = async () => {
      const response = await fetch('http://localhost:8000/protocols');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();
      setProtocols(jsonData);
  };

    fetchSectionData();
    fetchMediationData();
    fetchProtocolData();
  }, []);

  return {sections, medications, protocols};
}

export default useData;