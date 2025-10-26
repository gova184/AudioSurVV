
import React from 'react';
import KeywordManager from './KeywordManager';
import Dashboard from './Dashboard';
import XIcon from './icons/XIcon';
import { Keyword, Alert } from '../types';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    keywords: Keyword[];
    onAddKeyword: (keyword: Keyword) => void;
    onDeleteKeyword: (id: string) => void;
    alerts: Alert[];
    onDeleteAlert: (id: string) => void;
    sortOrder: 'newest' | 'oldest' | 'threat';
    onSortOrderChange: (order: 'newest' | 'oldest' | 'threat') => void;
    filterKeyword: string;
    onFilterKeywordChange: (keyword: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    keywords,
    onAddKeyword,
    onDeleteKeyword,
    alerts,
    onDeleteAlert,
    sortOrder,
    onSortOrderChange,
    filterKeyword,
    onFilterKeywordChange,
}) => {
    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 z-20 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-full max-w-lg bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 shadow-xl z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`} role="dialog" aria-modal="true">
                <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">Threat Intelligence</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700 transition-colors" aria-label="Close sidebar">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-grow space-y-8">
                    <KeywordManager
                        keywords={keywords}
                        onAddKeyword={onAddKeyword}
                        onDeleteKeyword={onDeleteKeyword}
                    />
                    <Dashboard
                        alerts={alerts}
                        onDeleteAlert={onDeleteAlert}
                        sortOrder={sortOrder}
                        onSortOrderChange={onSortOrderChange}
                        filterKeyword={filterKeyword}
                        onFilterKeywordChange={onFilterKeywordChange}
                    />
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
