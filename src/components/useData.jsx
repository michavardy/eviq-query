import { useState, useEffect } from 'react';

function useData() {
  const [sections, setSections] = useState([]);
  const [medications, setMedications] = useState([]);
  const [protocols, setProtocols] = useState([])
  const [translation, setTranslation] = useState({})
  const [comments, setComments] = useState([])
  const baseURL = `http://${window.location.hostname}:8000`;

  useEffect(() => {
    const baseURL = `http://${window.location.hostname}:8000`;
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
  };
  const fetchCommentsData = async () => {
    const response = await fetch(`${baseURL}/comments`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const jsonData = await response.json();
    setComments(jsonData);
  }

    fetchSectionData();
    fetchMediationData();
    fetchProtocolData();
    fetchTranslationData();
    fetchCommentsData();
  }, []);

  const putComment = async (protocolId, newComment) => {
    const transformedProtocolId = protocolId.replace(/\s/g, '_');
    try {
      const response = await fetch(`http://${window.location.hostname}:8000/comments/${transformedProtocolId}`, {
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
    const response = await fetch(`${baseURL}/comments`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const jsonData = await response.json();
    setComments(jsonData);
  }
  const deleteComment = async (protocolId) => {
    const transformedProtocolId = protocolId.replace(/\s/g, '_');
    try {
      const response = await fetch(`http://${window.location.hostname}:8000/comments/${transformedProtocolId}`, {
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