import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Pagination, Box, Typography
} from '@mui/material';

export default function Display({ protocols, selectedMedicines, selectedSection }) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const filterProtocols = (protocols) => {
    return protocols.filter((protocol) => {
      const matchesSection = selectedSection
        ? protocol.category_name && protocol.category_name.toLowerCase() === selectedSection.toLowerCase()
        : true;

      // Flatten the drug_sequence array to get all drug names
      const allDrugs = protocol.drug_sequence.flat().map(sequence => sequence.drug_name.toLowerCase());

      const matchesMedicine = selectedMedicines.length
        ? selectedMedicines.every(med => allDrugs.includes(med.toLowerCase()))
        : true;

      return matchesSection && matchesMedicine;
    });
  };

  const filteredProtocols = filterProtocols(protocols);
  const paginatedProtocols = filteredProtocols.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box>
      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: '#666', fontSize: '1.5rem', marginBottom: '16px' }}>
        Protocol Data Table
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="protocols table">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold', color: '#666', width: '10%' }}>ID</TableCell>
              <TableCell style={{ fontWeight: 'bold', color: '#666', width: '15%' }}>Section</TableCell>
              <TableCell style={{ fontWeight: 'bold', color: '#666', width: '15%' }}>Category</TableCell>
              <TableCell style={{ fontWeight: 'bold', color: '#666', width: '20%' }}>URL</TableCell>
              <TableCell style={{ fontWeight: 'bold', color: '#666', width: '40%' }} align="center">Drug Sequence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProtocols.map((protocol) => (
              <TableRow key={protocol.protocol_id}>
                <TableCell>{protocol.protocol_id}</TableCell>
                <TableCell>{protocol.section_name}</TableCell>
                <TableCell>{protocol.category_name}</TableCell>
                <TableCell>
                  <a
                    href={protocol.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'blue', textDecoration: 'underline' }}
                  >
                    Link
                  </a>
                </TableCell>
                <TableCell>
                  {protocol.drug_sequence.map((sequence, index) => (
                    <Box key={index}>
                      {index === 0 && (
                        <TableRow>
                          <TableCell style={{ fontWeight: 'bold', color: '#666' }}>Drug</TableCell>
                          <TableCell style={{ fontWeight: 'bold', color: '#666' }}>Day</TableCell>
                          <TableCell style={{ fontWeight: 'bold', color: '#666' }}>Dose</TableCell>
                          <TableCell style={{ fontWeight: 'bold', color: '#666' }}>Frequency</TableCell>
                          <TableCell style={{ fontWeight: 'bold', color: '#666' }}>Route</TableCell>
                          <TableCell style={{ fontWeight: 'bold', color: '#666' }}>Cycles</TableCell>
                          <TableCell style={{ fontWeight: 'bold', color: '#666' }}>Neoadjuvant</TableCell>
                          <TableCell style={{ fontWeight: 'bold', color: '#666' }}>Adjuvant</TableCell>
                        </TableRow>
                      )}
                      {sequence.map((drug, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{drug.drug_name}</TableCell>
                          <TableCell>{drug.day}</TableCell>
                          <TableCell>{drug.dose}</TableCell>
                          <TableCell>{drug.frequency}</TableCell>
                          <TableCell>{drug.route}</TableCell>
                          <TableCell>{drug.cycles}</TableCell>
                          <TableCell>{drug.is_neoadjuvant ? "Yes" : "No"}</TableCell>
                          <TableCell>{drug.is_adjuvant ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </Box>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(filteredProtocols.length / rowsPerPage)}
        page={page}
        onChange={handleChangePage}
        sx={{ mt: 2 }}
      />
    </Box>
  );
}
