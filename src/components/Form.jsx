import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button'; // Import the Button component from MUI

export default function Form({ sections, medications, selectedMedicines, setSelectedMedicines, selectedSection, setSelectedSection, setSelectedStatuses, selectedStatuses, protocols, translation, selectedLanguage}) {
  const [uniqueStatuses, setUniqueStatuses] = useState([]);

  // Function to extract unique statuses from protocols
  useEffect(() => {
    const statuses = Array.from(new Set(protocols.map(protocol => protocol.protocol_status)));
    setUniqueStatuses(statuses);
  }, [protocols]);

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleMedicineChange = (event, value) => {
    setSelectedMedicines(Array.isArray(value) ? value : []);
  };

  const handleStatusChange = (event, value) => {
    setSelectedStatuses(Array.isArray(value) ? value : []);
  };

  const handleClear = () => {
    setSelectedSection("");
    setSelectedMedicines([]);
    setSelectedStatuses([]);
  };

  return (
    <div className="flex flex-col space-y-4">
      <FormControl className="w-56">
        <InputLabel id="section_selection">
        {selectedLanguage === 'H' && translation['Category'] ? translation['Category'] : 'Category'}
          </InputLabel>
        {sections.sections ? ( // Check if sections.sections is defined
          <Select
            labelId="section_selection-label"
            id="section_selection"
            label="Section"
            value={selectedSection}
            onChange={handleSectionChange} // Handle the onChange event
          >
            {sections.sections.map((section) => (
              <MenuItem key={section.id} value={section.name}>{section.name}</MenuItem>
            ))}
          </Select>
        ) : (
          <div>Loading sections...</div> // Render a loading message while sections are being fetched
        )}
      </FormControl>

      <FormControl className="w-56">
        <Autocomplete
          multiple
          disablePortal
          id="medications-autocomplete"
          options={medications}
          value={selectedMedicines} // Set the value prop to selectedMedicines
          onChange={handleMedicineChange}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label={selectedLanguage === 'H' && translation['Medication'] ? translation['Medication'] : 'Medication'} />}
        />
      </FormControl>

      <FormControl className="w-56">
        <Autocomplete
          multiple
          disablePortal
          id="statuses-autocomplete"
          options={uniqueStatuses}
          value={selectedStatuses} // Set the value prop to selectedStatuses
          onChange={handleStatusChange}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label={selectedLanguage === 'H' && translation['Status'] ? translation['Status'] : 'Status'} />}
        />
      </FormControl>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleClear} 
        sx={{ width: 150 }} // Apply the same width as the other controls
      >
        {selectedLanguage === 'H' && translation['Clear'] ? translation['Clear'] : 'Clear'}
      </Button>
    </div>
  );
}
