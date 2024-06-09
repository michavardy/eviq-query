import React, { useState } from 'react';

export default function Display({ protocols, selectedMedicines, selectedSection }) {
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };



  const filterProtocols = (protocols) => {
    return protocols.filter((protocol) => {
      const matchesSection = selectedSection
        ? protocol.category_name && protocol.category_name.toLowerCase() === selectedSection.toLowerCase()
        : true;

      const allDrugs = protocol.drug_sequence.flat().map(sequence => sequence.drug_name.toLowerCase());

      const matchesMedicine = selectedMedicines.length
        ? selectedMedicines.every(med => allDrugs.includes(med.toLowerCase()))
        : true;

      return matchesSection && matchesMedicine;
    });
  };

  const filteredProtocols = filterProtocols(protocols);
  const paginatedProtocols = filteredProtocols.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const pageCount = Math.ceil(filteredProtocols.length / rowsPerPage);

  return (
    <div id='table-component' className="p-4">
      <div id='table-title' className="text-2xl font-bold mb-4">
        Protocol Data Table
      </div>
      <div id='table-container' className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">ID</th>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Category</th>
              <th rowSpan="2" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Link</th>
              <th colSpan="9" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Drug Sequence</th>
            </tr>
            <tr>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Regiment</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Drug</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Day</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Dose</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Frequency</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Route</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Cycles</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Neoadjuvant</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">Adjuvant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedProtocols.map((protocol, index) => (
              <React.Fragment key={protocol.id}>
                {protocol.drug_sequence.map((sequence, seqIndex) => (
                  <React.Fragment key={seqIndex}>
                    {sequence.map((seqItem, drugIndex) => (
                      <tr key={`${protocol.id}-${seqIndex}-${drugIndex}`} className="bg-white">
                        {seqIndex === 0 && drugIndex === 0 && (
                          <>
                            <td rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)} className="px-4 py-2 text-sm text-gray-500 border">{protocol.protocol_id}</td>
                            <td rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)} className="px-4 py-2 text-sm text-gray-500 border">{protocol.category_name}</td>
                            <td rowSpan={protocol.drug_sequence.reduce((acc, seq) => acc + seq.length, 0)} className="px-4 py-2 text-sm text-gray-500 border">
                            <a href={protocol.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Link</a>
                            </td>
                          </>
                        )}
                        {drugIndex === 0 && (
                          <td rowSpan={sequence.length} className="px-4 py-2 text-sm text-gray-500 border">{seqIndex}</td>
                        )}
                        <td className={'px-4 py-2 text-sm'}>{seqItem.drug_name}</td>
                        <td className={'px-4 py-2 text-sm'}>{seqItem.day}</td>
                        <td className={'px-4 py-2 text-sm'}>{seqItem.dose}</td>
                        <td className={'px-4 py-2 text-sm'}>{seqItem.frequency}</td>
                        <td className={'px-4 py-2 text-sm'}>{seqItem.route}</td>
                        <td className={'px-4 py-2 text-sm'}>{seqItem.cycles}</td>
                        <td className={'px-4 py-2 text-sm'}>{seqItem.neoadjuvant ? 'Yes' : 'No'}</td>
                        <td className={'px-4 py-2 text-sm'}>{seqItem.adjuvant ? 'Yes' : 'No'}</td>
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
