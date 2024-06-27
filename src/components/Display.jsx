import React, { useState } from 'react';
import { Edit, Delete } from '@mui/icons-material'; // Importing Material-UI icons
import EditModal from './EditModule';
import useData from './useData';
import { useToasts } from 'react-toast-notifications';

export default function Display({ protocols, selectedMedicines, selectedSection, selectedLanguage, translation, comments, reLoadCommentsData, isMetaStatic }) {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInputValue, setModalInputValue] = useState('');
  const [editProtocolId, setEditProtocolId] = useState(null); // Track which protocol is being edited
  const { putComment, deleteComment } = useData();
  const { addToast } = useToasts();

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const filterBySection = (protocols) => {
    return protocols.filter((protocol) => {
      return !selectedSection || protocol.category_name.toLowerCase() === selectedSection.toLowerCase();
    });
  };

  const filterByDrugSequence = (protocols) => {
    return protocols.filter((protocol) => {
      const firstDrug = protocol.drug_sequence[0]?.[0];
      if (!firstDrug) {
        return false; // Filter out protocols with no drug sequence
      }
      return true; // Keep protocols with drug sequence
    });
  };
  function filterUniqueDrugs(protocols) {
    const filteredProtocols = protocols.map(protocol => {
      const seenDrugs = new Set();
      const filteredDrugSequence = protocol.drug_sequence.map(sequence => {
        return sequence.filter(drug => {
          const drugKey = `${drug.drug_name}-${drug.is_neoadjuvant}-${drug.is_adjuvant}-${drug.day}-${drug.dose}-${drug.cycles}`;
          if (seenDrugs.has(drugKey)) {
            return false; // Filter out duplicate drugs
          } else {
            seenDrugs.add(drugKey);
            return true; // Keep the drug
          }
        });
      });
      return { ...protocol, drug_sequence: filteredDrugSequence };
    });
    return filteredProtocols;
  }
  const filterByMedications = (protocols) => {
    return protocols.filter((protocol) => {
      const firstDrug = protocol.drug_sequence[0]?.[0];
      if (!firstDrug) return false; // No drug sequence, filter out
      return selectedMedicines.length === 0 ||
        selectedMedicines.some(med => {
          return med.medication.toLowerCase() === firstDrug.drug_name.toLowerCase() &&
            med.adjuvant === firstDrug.is_adjuvant &&
            med.neoadjuvant === firstDrug.is_neoadjuvant
        }

        );
    });
  };
  const filterByMetastatic = (protocols) => {
    return protocols.filter((protocol) => {
      return protocol.metastatic === isMetaStatic;
    });
  };
  const filterProtocols = (protocols) => {
    try {

      let filteredProtocols = [...protocols];

      filteredProtocols = filterBySection(filteredProtocols);
      filteredProtocols = filterByDrugSequence(filteredProtocols);
      filteredProtocols = filterByMedications(filteredProtocols);
      filteredProtocols = filterUniqueDrugs(filteredProtocols);
      filteredProtocols = filterByMetastatic(filteredProtocols);

      return filteredProtocols;
    } catch (error) {
      console.error("Error filtering protocols:", error);
      return []; // Return an empty array if there's an error
    }
  };

  const filterDuplicates = (protocols) => {
    const seenProtocols = new Set();
  
    return protocols.filter((protocol) => {
      // Create a composite key based on protocol, category, and metastatic
      const key = `${protocol.protocol_id}-${protocol.category_name}-${protocol.metastatic}`;
  
      // Check if the key is already in seenProtocols set
      if (seenProtocols.has(key)) {
        return false; // Filter out protocols with duplicate key
      } else {
        seenProtocols.add(key);
        return true; // Keep the protocol
      }
    });
  };

  function translate(keyword) {
    if (selectedLanguage === 'H' && translation[keyword]) {
      return translation[keyword];
    } else {
      return keyword;
    }
  }
  const filteredProtocols = filterProtocols(protocols);
  const uniqueProtocols = filterDuplicates(filteredProtocols);
  const paginatedProtocols = uniqueProtocols.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(uniqueProtocols.length / rowsPerPage);

  // Function to open modal for editing
  const openModal = (protocolId, initialValue) => {
    const currentComment = comments.find(comment => comment.ID === protocolId.replace(' ', '_'))?.Comment || '';
    setEditProtocolId(protocolId);
    setModalInputValue(currentComment);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditProtocolId(null);
    setModalInputValue('');
  };

  // Function to handle save in modal
  const handleSaveModal = (newValue) => {
    // Implement save logic here (e.g., update protocol with newValue)
    console.log(`Save clicked for protocol ID ${editProtocolId} with new value: ${newValue}`);
    putComment(editProtocolId, newValue)
      .then(() => {
        addToast('Comment saved successfully', { appearance: 'success' });
        closeModal();
        reLoadCommentsData()
      })
      .catch((error) => {
        console.error('Error saving comment:', error);
        addToast('Failed to save comment', { appearance: 'error' });
      });
  };

  // Function to handle cancel in modal
  const handleCancelModal = () => {
    // Implement cancel logic here (e.g., discard changes)
    console.log('Cancel clicked');
    closeModal();
  };

  const handleDeleteComment = (protocolId) => {
    // Call deleteComment from useData hook to delete the comment
    deleteComment(protocolId)
    .then(() => {
      addToast('Comment removed successfully', { appearance: 'success' });
      reLoadCommentsData()
    })
    console.log(`Delete clicked for protocol ID ${protocolId}`);
    // Optionally, you can add additional logic here after deleting the comment
  };

  return (
    <div id='table-component' className="p-4">
      <div id='table-container' className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('ID')}
              </th>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Category')}
              </th>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Comment')}
              </th>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Action')}
              </th>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Link')}
              </th>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Metastatic')}
              </th>
              <th colSpan="9" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Drug Sequence')}
              </th>
            </tr>
            <tr>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Regimen')}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Drug')}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Neoadjuvant')}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Adjuvant')}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Dose')}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {translate('Cycles')}
              </th>

            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedProtocols.map((protocol, index) => (
              <React.Fragment key={protocol.id}>
                {protocol.drug_sequence.map((sequence, seqIndex) => (
                  <React.Fragment key={seqIndex}>
                    {sequence.map((seqItem, drugIndex) => (

                      <tr key={`${protocol.id}-${seqIndex}-${drugIndex}`} className="m-4">
                        {seqIndex === 0 && drugIndex === 0 && (
                          <>
                            <td rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)} className="px-4 py-2 text-sm text-gray-500 border">{protocol.protocol_id}</td>
                            <td rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)} className="px-4 py-2 text-sm text-gray-500 border">{protocol.category_name}</td>
                            <td
                              rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)}
                              className="px-4 py-2 text-sm text-gray-500 border break-words"
                            >
                              {comments
                                .find((comment) => comment.ID === protocol.protocol_id.replace(" ", "_"))
                                ?.Comment.split("\n")
                                .map((line, index) => (
                                  <React.Fragment key={index}>
                                    {line}
                                    <br />
                                  </React.Fragment>
                                ))}
                            </td>
                            <td rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)} className="px-4 py-2 text-sm text-gray-500 border">
                              <div className="flex space-x-2">
                                {/* Edit Button */}
                                <button
                                  onClick={() => openModal(protocol.protocol_id, '')}
                                  className="text-blue-500 hover:text-blue-600 focus:outline-none transition duration-300 ease-in-out"
                                >
                                  <Edit fontSize="small" className="inline-block align-middle" />
                                  <span className="sr-only">Edit</span>
                                </button>
                                {/* Delete Button */}
                                <button
                                  onClick={() => handleDeleteComment(protocol.protocol_id)}
                                  className="text-red-500 hover:text-red-600 focus:outline-none transition duration-300 ease-in-out"
                                >
                                  <Delete fontSize="small" className="inline-block align-middle" />
                                  <span className="sr-only">Delete</span>
                                </button>
                              </div>
                            </td>
                            <td rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)} className="px-4 py-2 text-sm text-gray-500 border">
                              <a href={protocol.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a>
                            </td>
                            <td rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)} className="px-4 py-2 text-sm text-gray-500 border">{protocol.metastatic? 'Yes' : 'No'}</td>
                          </>
                        )}
                        {drugIndex === 0 && (
                          <td rowSpan={sequence.length} className="px-4 py-2 text-sm text-gray-500 border">{seqIndex + 1}</td>
                        )}
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.drug_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.is_neoadjuvant ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.is_adjuvant ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.dose}</td>
                        <td className="px-2 py-2 text-sm text-gray-500 max-w-[200px]">
                          {seqItem.cycles}
                        </td>

                      </tr>
                    ))}

                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        {/* Pagination info */}
        <div>
          {`Page ${page} / ${pageCount}`}
        </div>
        {/* Pagination buttons */}
        <div className="flex space-x-2">
          {/* First page button */}
          <button
            onClick={() => handleChangePage(1)}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded-md"
          >
            {"<<"}
          </button>
          {/* Previous page button */}
          <button
            onClick={() => handleChangePage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded-md"
          >
            {"<"}
          </button>
          {/* Next page button */}
          <button
            onClick={() => handleChangePage(page + 1)}
            disabled={page === pageCount}
            className="px-3 py-1 border border-gray-300 rounded-md"
          >
            {">"}
          </button>
          {/* Last page button */}
          <button
            onClick={() => handleChangePage(pageCount)}
            disabled={page === pageCount}
            className="px-3 py-1 border border-gray-300 rounded-md"
          >
            {">>"}
          </button>
        </div>
      </div>
      <EditModal
        isOpen={isModalOpen}
        initialValue={modalInputValue}
        onSave={handleSaveModal}
        onCancel={handleCancelModal}
      />
    </div>
  );
}
