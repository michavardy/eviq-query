import React, { useState, useEffect } from 'react';
import clsx from 'clsx'; // For conditional class names

export default function EditModal({ isOpen, initialValue, onSave, onCancel }) {
  const [inputValue, setInputValue] = useState(initialValue);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSave = () => {
    onSave(inputValue);
    setInputValue(''); // Clear input after save
  };

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  return (
    <div className={clsx('fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex justify-center items-center', { 'hidden': !isOpen })}>
      <div className="bg-white rounded-lg p-6 w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-4">Edit Protocol</h2>
        <textarea
          value={inputValue}
          onChange={handleInputChange}
          className="border border-gray-300 rounded-md px-3 py-2 mb-4 w-full h-32 resize-none"
          placeholder="Enter text..."
        />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mr-2"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
