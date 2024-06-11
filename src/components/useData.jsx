import { useState, useEffect } from 'react';

function useData() {
  const [sections, setSections] = useState([]);
  const [medications, setMedications] = useState([]);
  const [protocols, setProtocols] = useState([])
  const [translation, setTranslation] = useState({})


  useEffect(() => {
    const baseURL = window.location.origin;
    const fetchSectionData = async () => {
        const response = await fetch(`${baseURL}/sections`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setSections(jsonData);
    };
    const fetchMediationData = async () => {
      const response = await fetch(`${baseURL}/medications`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();
      setMedications(jsonData)
    }

    const fetchProtocolData = async () => {
      const response = await fetch(`${baseURL}/protocols`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const jsonData = await response.json();
      setProtocols(jsonData);
  };
  const fetchTranslationData = async () => {
    const response = await fetch(`${baseURL}/translation`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const jsonData = await response.json();
    setTranslation(jsonData);
  }

    fetchSectionData();
    fetchMediationData();
    fetchProtocolData();
    fetchTranslationData();
  }, []);

  return {sections, medications, protocols, translation};
}

export default useData;