
import './App.css';
import TopBar from './components/TopBar.jsx';
import useData from './components/useData'; // Import the custom hook
import Form from './components/Form.jsx';
import Display from './components/Display.jsx';
import React, { useState} from 'react';
function App() {
  const { sections, medications, protocols } = useData();
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  return (
    <div className="App">
        <TopBar/>
        <div className="flex">
        <div className="w-1/5 p-4">
          <Form 
          sections={sections} 
          selectedSection={selectedSection} 
          setSelectedSection={setSelectedSection} 
          medications={medications} 
          selectedMedicines={selectedMedicines} 
          setSelectedMedicines={setSelectedMedicines} />
        </div>
        <div className="w-4/5 p-4">
          <Display protocols={protocols} selectedMedicines={selectedMedicines} selectedSection={selectedSection}/>
        </div>
      </div>

    </div>
  );
}

export default App;
