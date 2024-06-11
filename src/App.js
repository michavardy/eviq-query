
import './App.css';
import TopBar from './components/TopBar.jsx';
import useData from './components/useData'; // Import the custom hook
import Form from './components/Form.jsx';
import Display from './components/Display.jsx';
import React, { useState} from 'react';
function App() {
  const { sections, medications, protocols, translation } = useData();
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("E");
  return (
    <div className="App">
        <TopBar setSelectedLanguage={setSelectedLanguage} selectedLanguage={selectedLanguage} translation={translation}/>
        <div className="flex">
        <div className="w-1/6 p-4">
          <Form 
          sections={sections} 
          selectedSection={selectedSection} 
          setSelectedSection={setSelectedSection} 
          medications={medications} 
          selectedMedicines={selectedMedicines} 
          setSelectedMedicines={setSelectedMedicines} 
          setSelectedStatuses={setSelectedStatuses}
          selectedStatuses={selectedStatuses}
          protocols={protocols}
          translation={translation}
          selectedLanguage={selectedLanguage}
          />
        </div>
        <div className="w-5/6 p-4">
          <Display protocols={protocols} selectedMedicines={selectedMedicines} selectedSection={selectedSection} selectedStatuses={selectedStatuses} selectedLanguage={selectedLanguage} translation={translation}/>
        </div>
      </div>

    </div>
  );
}

export default App;
