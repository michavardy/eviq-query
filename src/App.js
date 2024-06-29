
import './App.css';
import TopBar from './components/TopBar.jsx';
import useData from './components/useData'; // Import the custom hook
import Form from './components/Form.jsx';
import Display from './components/Display.jsx';
import React, { useState} from 'react';
import { ToastProvider } from 'react-toast-notifications';


function App() {
  const { sections, medications, protocols, translation, comments, reLoadCommentsData } = useData();
  const [selectedProtocolID, setSelectedProtocolID] = useState("")
  const [selectedSection, setSelectedSection] = useState('');
  const [isMetaStatic, setIsMetaStatic] = useState(false)
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("H");

  function translate(keyword) {
    if (selectedLanguage === 'H' && translation[keyword]) {
      return translation[keyword];
    } else {
      return keyword;
    }
  }

  return (
    <div className="App">
        <TopBar setSelectedLanguage={setSelectedLanguage} selectedLanguage={selectedLanguage} translation={translation}/>
        <div className="flex flex-col justify-start">
          <div className="text-4xl font-bold m-4 text-gray-700">{translate("Protocol Data Table")}</div>
        <div className="p-4">
          <Form 
          selectedProtocolID = {selectedProtocolID}
          setSelectedProtocolID = {setSelectedProtocolID}
          sections={sections} 
          selectedSection={selectedSection} 
          setSelectedSection={setSelectedSection} 
          medications={medications} 
          selectedMedicines={selectedMedicines} 
          setSelectedMedicines={setSelectedMedicines} 
          protocols={protocols}
          translation={translation}
          selectedLanguage={selectedLanguage}
          isMetaStatic={isMetaStatic}
          setIsMetaStatic={setIsMetaStatic}
          />
        </div>
        <div className="p-4">
        <ToastProvider>
          <Display 
          selectedProtocolID = {selectedProtocolID}
          setSelectedProtocolID = {setSelectedProtocolID}
          protocols={protocols} 
          selectedMedicines={selectedMedicines} 
          selectedSection={selectedSection} 
          selectedLanguage={selectedLanguage} 
          translation={translation}
          comments={comments}
          reLoadCommentsData={reLoadCommentsData}
          isMetaStatic={isMetaStatic}
          />
          </ToastProvider>
        </div>
      </div>

    </div>
  );
}

export default App;
