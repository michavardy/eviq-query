import { useState, useEffect } from 'react';

function useData() {
  const [sections, setSections] = useState([]);
  const [medications, setMedications] = useState([]);
  const [protocols, setProtocols] = useState([])
  const [translation, setTranslation] = useState({})
  const [comments, setComments] = useState([])
  const baseURL = `http://${window.location.hostname}`;

  useEffect(() => {
    const baseURL = `http://${window.location.hostname}`;
    const fetchSectionData = async () => {
        const response = await fetch(`${baseURL}/eviq-query/sections`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();
        setSections(jsonData);
    };
    const fetchProtocolData = () => {
      fetch(`${baseURL}/eviq-query/protocols`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch data');
          }
          return response.json();
        })
        .then(jsonData => {
          setProtocols(jsonData);
        })
        .catch(error => {
          console.error('Error fetching protocols:', error);
        });
    };
  const fetchTranslationData = async () => {
    const response = await fetch(`${baseURL}/eviq-query/translation`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const jsonData = await response.json();
    setTranslation(jsonData);
  };
  const fetchCommentsData = async () => {
    const response = await fetch(`${baseURL}/eviq-query/comments`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const jsonData = await response.json();
    setComments(jsonData);
  }

    fetchSectionData();
    fetchProtocolData();
    fetchTranslationData();
    fetchCommentsData();
  }, []);

  useEffect(()=>{
    const extractMedicationsFromProtocols = () => {
      if (protocols.length > 0 && medications.length === 0) {
        const medicationSet = new Set();
        protocols.forEach(protocol => {
          protocol.drug_sequence.forEach(sequence => {
            sequence.forEach(drug => {
              if (drug.drug_name) { // Filter out null or undefined drug names
                const cleanedDrugName = drug.drug_name.toLowerCase().replace(/[^a-z]/g, '').trim();
                medicationSet.add(cleanedDrugName);
              }
            });
          });
        });
        const medicationArray = Array.from(medicationSet)
        console.log('medications')
        console.log(medicationArray)
        setMedications(medicationArray);
      }
  
    };
    extractMedicationsFromProtocols()
  },[protocols, medications])
  
  useEffect(()=>{
    function extractMetastaticData() {
      if (protocols.length > 0) {
        const updatedProtocols = protocols.map(protocol => {
          const isMetastatic = /metastatic/i.test(protocol.url);
          return { ...protocol, metastatic: isMetastatic };
        });
        setProtocols(updatedProtocols);
      }
    }
    extractMetastaticData();
  },[protocols])





  const putComment = async (protocolId, newComment) => {
    const transformedProtocolId = protocolId.replace(/\s/g, '_');
    try {
      const response = await fetch(`http://${window.location.hostname}/eviq-query/comments/${transformedProtocolId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({newComment }),
      });
      if (!response.ok) {
        throw new Error('Failed to update comment');
      }
      // Assuming response.json() returns a message or updated data
      const jsonData = await response.json();
      // Update comments state with updated data if necessary
      console.log(jsonData); // Log or update state as needed
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };
  const reLoadCommentsData = async () => {
    const response = await fetch(`${baseURL}/eviq-query/comments`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const jsonData = await response.json();
    setComments(jsonData);
  }
  const deleteComment = async (protocolId) => {
    const transformedProtocolId = protocolId.replace(/\s/g, '_');
    try {
      const response = await fetch(`http://${window.location.hostname}/eviq-query/comments/${transformedProtocolId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      // Assuming response.json() returns a message or confirmation
      const jsonData = await response.json();
      // Update comments state if necessary
      console.log(jsonData); // Log or update state as needed
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return {sections, medications, protocols, translation, comments, putComment, deleteComment, reLoadCommentsData};
}

export default useData;