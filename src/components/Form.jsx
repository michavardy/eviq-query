import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';  // Import the Switch component

export default function Form({ sections, medications, selectedMedicines, setSelectedMedicines, selectedSection, setSelectedSection, protocols, translation, selectedLanguage, isMetaStatic, setIsMetaStatic }) {
  const [isAdjuvant, setIsAdjuvant] = useState(false);
  const [isNeoadjuvant, setIsNeoadjuvant] = useState(false);
  const [medicineInputValue, setMedicineInputValue] = useState('');

  const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
  };

  const handleMedicineChange = (event, value) => {
    if (value) {
      setSelectedMedicines((prev) => [
        ...prev,
        { medication: value, adjuvant: isAdjuvant, neoadjuvant: isNeoadjuvant }
      ]);
    }
    setMedicineInputValue(''); // Clear the medication field input after selection
  };

  const handleClear = () => {
    setSelectedSection('');
    setSelectedMedicines([]);
    setIsAdjuvant(false);
    setIsNeoadjuvant(false);
    setIsMetaStatic(false)
  };

  const handleRemoveMedicine = (index) => {
    setSelectedMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  function translate(keyword) {
    if (selectedLanguage === 'H' && translation[keyword]) {
      return translation[keyword];
    } else {
      return keyword;
    }
  }

  const handleMetaStaticChange = (event) => {
    setIsMetaStatic(event.target.checked);
  };

  return (
    <div>
      <Typography variant="h5" className="text-gray-700 mb-4" style={{ fontWeight: 'bold', textAlign: 'left' }}>
        {translate('Filter')}
      </Typography>
      <div className="flex flex-wrap items-center space-x-4 mb-4">
        <FormControl className="w-56">
          <InputLabel id="section_selection">
            {translate('Category')}
          </InputLabel>
          {sections.sections ? (
            <Select
              labelId="section_selection-label"
              id="section_selection"
              label="Section"
              value={selectedSection}
              onChange={handleSectionChange}
            >
              {sections.sections.map((section) => (
                <MenuItem key={section.id} value={section.name}>{section.name}</MenuItem>
              ))}
            </Select>
          ) : (
            <div>Loading sections...</div>
          )}
        </FormControl>
        <FormControlLabel
          control={<Switch checked={isMetaStatic} onChange={handleMetaStaticChange} />}
          label={translate('Metastatic')}
        />
        <FormControl className="w-56">
          <Autocomplete
            disablePortal
            id="medications-autocomplete"
            options={medications}
            inputValue={medicineInputValue}
            onInputChange={(event, newInputValue) => setMedicineInputValue(newInputValue)}
            onChange={handleMedicineChange}
            renderInput={(params) => <TextField {...params} label={translate('Medication')} value={medicineInputValue} />}
          />
        </FormControl>

        <div className='flex flex-col'>
          <FormControlLabel
            control={<Checkbox checked={isAdjuvant} onChange={() => setIsAdjuvant(!isAdjuvant)} />}
            label={translate('Adjuvant')}
          />
          <FormControlLabel
            control={<Checkbox checked={isNeoadjuvant} onChange={() => setIsNeoadjuvant(!isNeoadjuvant)} />}
            label={translate('Neoadjuvant')}
          />
        </div>

        <Button
          variant="contained"
          color="primary"
          onClick={handleClear}
          className="h-12"
        >
          {translate('Clear')}
        </Button>
      </div>

      <div className="flex flex-wrap">
        {selectedMedicines.map((med, index) => (
          <Chip
            key={index}
            label={`${med.medication} (${med.adjuvant ? translate('Adjuvant') : ''} ${med.neoadjuvant ? translate('Neoadjuvant') : ''})`}
            onDelete={() => handleRemoveMedicine(index)}
            className="m-1"
            style={{ backgroundColor: '#f0f0f0', color: '#000', borderRadius: '4px', margin: '4px' }}
          />
        ))}
      </div>
    </div>
  );
}
