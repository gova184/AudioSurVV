import React from 'react';
import UserIcon from './icons/UserIcon';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-900/70 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-700">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-red-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 5.636a9 9 0 0112.728 0M8.464 15.536a5 5 0 01-7.072 0" />
                        </svg>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">
                        AudioSurv
                    </h1>
                </div>
                 <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 border-l border-gray-700 pl-4">
                        <UserIcon className="w-6 h-6 text-gray-400" />
                        <div>
                            <p className="text-sm font-semibold text-white">Alex Reid</p>
                            <p className="text-xs text-indigo-400">Analyst</p>
                        </div>
                    </div>
                 </div>
            </div>
        </header>
    );
};

export default Header;