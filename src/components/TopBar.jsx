import React from 'react';

export default function TopBar({setSelectedLanguage, selectedLanguage, translation}) {
    const toggleLanguage = () => {
        setSelectedLanguage(selectedLanguage === 'E' ? 'H' : 'E');
    };
    return (
        <div className="w-full bg-[#23227d] text-white flex justify-start items-center p-4">
            <svg
                className="ml-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 100 100"
                stroke="currentColor"
                width="24"
                height="24"
            >
                <g transform="matrix(1.4956 0 0 1.4956 118.82 -12.672)" stroke="#f2f2f2" stroke-width=".26458">
                <path d="m-25.161 22.512-18.722 18.585 18.722 18.448 4.1554-3.8815-11.873-11.873h14.43v-5.571h-14.521l11.804-11.804z" fill="#3792c1" stop-color="#000000" />
                <path d="m-67.22 22.558 18.722 18.585-18.722 18.448-4.1554-3.8815 11.873-11.873h-14.43v-5.571h14.521l-11.804-11.804z" fill="#69b5cb" stop-color="#000000" />
                <path d="m-64.49 60.679 18.585-18.722 18.448 18.722-3.8815 4.1554-11.873-11.873v14.43h-5.571v-14.521l-11.804 11.804z" fill="#3aa6ca" stop-color="#000000" />
                <path d="m-64.843 20.869 18.722 18.631 18.859-18.448c-6.8354-5.7042-13.355-7.9294-18.859 1.0046-7.3517-10.822-14.774-3.9709-18.722-1.1873z" fill="#373676" stop-color="#000000" />
                </g>
            </svg>
            <span className="text-2xl ml-4">
                {selectedLanguage === 'H' && translation['eviQ Query'] ? translation['eviQ Query'] : 'eviQ Query'}
                </span>
            <button
                onClick={toggleLanguage}
                className="ml-4 bg-blue-500 text-white px-2 py-1 rounded"
            >
                {selectedLanguage === 'E' ? 'H' : 'E'}
            </button>
        </div>
    );
}