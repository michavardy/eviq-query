import React, { useState } from 'react';

export default function Display({ protocols, selectedMedicines, selectedSection, selectedStatuses, selectedLanguage, translation }) {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };



  const filterProtocols = (protocols) => {
    try {
      return protocols.filter((protocol) => {
        const matchesSection = selectedSection
          ? protocol.category_name && protocol.category_name.toLowerCase() === selectedSection.toLowerCase()
          : true;

        const allDrugs = protocol.drug_sequence.flat().map(sequence =>
          sequence.drug_name ? sequence.drug_name.toLowerCase() : ''
        );

        const matchesMedicine = selectedMedicines.length
          ? selectedMedicines.every(med => allDrugs.includes(med.toLowerCase()))
          : true;

        const matchesStatus = selectedStatuses.length
          ? selectedStatuses.includes(protocol.protocol_status)
          : true;

        return matchesSection && matchesMedicine && matchesStatus;
      });
    } catch (error) {
      console.error("Error filtering protocols:", error);
      return []; // Return an empty array if there's an error
    }
  };

  const filterDuplicates = (protocols) => {
    return protocols.map((protocol) => {
      const seen = new Set();
      const uniqueSequences = protocol.drug_sequence.map((sequence) => {
        return sequence.filter((seqItem) => {
          const identifier = `${seqItem.drug_name}-${seqItem.day}-${seqItem.dose}-${seqItem.frequency}-${seqItem.route}-${seqItem.cycles}-${seqItem.is_neoadjuvant}-${seqItem.is_adjuvant}`;
          if (seen.has(identifier)) {
            return false;
          } else {
            seen.add(identifier);
            return true;
          }
        });
      });
      return { ...protocol, drug_sequence: uniqueSequences };
    });
  };

  const filteredProtocols = filterProtocols(protocols);
  const uniqueProtocols = filterDuplicates(filteredProtocols);
  const paginatedProtocols = uniqueProtocols.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(uniqueProtocols.length / rowsPerPage);

  return (
    <div id='table-component' className="p-4">
      <div id='table-title' className="text-2xl font-bold mb-4 text-gray-500">
        {selectedLanguage === 'H' && translation['Protocol Data Table'] ? translation['Protocol Data Table'] : 'Protocol Data Table'}
      </div>
      <div id='table-container' className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['ID'] ? translation['ID'] : 'ID'}
              </th>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Status'] ? translation['Status'] : 'Status'}
              </th>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Category'] ? translation['Category'] : 'Category'}
              </th>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Link'] ? translation['Link'] : 'Link'}
              </th>
              <th colSpan="9" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Drug Sequence'] ? translation['Drug Sequence'] : 'Drug Sequence'}
              </th>
            </tr>
            <tr>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Regimen'] ? translation['Regimen'] : 'Regimen'}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Drug'] ? translation['Drug'] : 'Drug'}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Day'] ? translation['Day'] : 'Day'}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Dose'] ? translation['Dose'] : 'Dose'}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Frequency'] ? translation['Frequency'] : 'Frequency'}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Route'] ? translation['Route'] : 'Route'}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Cycles'] ? translation['Cycles'] : 'Cycles'}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Neoadjuvant'] ? translation['Neoadjuvant'] : 'Neoadjuvant'}
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                {selectedLanguage === 'H' && translation['Adjuvant'] ? translation['Adjuvant'] : 'Adjuvant'}
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
                            <td rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)} className="px-4 py-2 text-sm text-gray-500 border">{protocol.protocol_status}</td>
                            <td rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)} className="px-4 py-2 text-sm text-gray-500 border">{protocol.category_name}</td>
                            <td rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)} className="px-4 py-2 text-sm text-gray-500 border">
                              <a href={protocol.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a>
                            </td>
                          </>
                        )}
                        {drugIndex === 0 && (
                          <td rowSpan={sequence.length} className="px-4 py-2 text-sm text-gray-500 border">{seqIndex + 1}</td>
                        )}
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.drug_name}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.day}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.dose}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.frequency}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.route}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.cycles}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.is_neoadjuvant ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2 text-sm text-gray-500">{seqItem.is_adjuvant ? 'Yes' : 'No'}</td>
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
    </div>
  );
}
