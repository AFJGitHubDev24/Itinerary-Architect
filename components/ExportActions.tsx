import React, { useState, useEffect, useRef } from 'react';
import { Itinerary } from '../types';
import { exportAsPdf, exportAsPptx, exportAsDocx } from '../lib/exportUtils';
import { ExportIcon, PdfIcon, PptIcon, DocIcon, BookmarkIcon, MapIcon } from './Icons';

interface ExportActionsProps {
  itinerary: Itinerary;
  onSave: () => void;
  isSaved: boolean;
  isMapViewable: boolean;
  isMapVisible: boolean;
  onToggleMap: () => void;
}

const ExportActions: React.FC<ExportActionsProps> = ({ itinerary, onSave, isSaved, isMapViewable, isMapVisible, onToggleMap }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'pdf' | 'pptx' | 'docx') => {
    setIsExporting(true);
    setIsDropdownOpen(false);
    try {
      switch (format) {
        case 'pdf':
          exportAsPdf(itinerary);
          break;
        case 'pptx':
          await exportAsPptx(itinerary);
          break;
        case 'docx':
          await exportAsDocx(itinerary);
          break;
      }
    } catch (error) {
      console.error(`Failed to export as ${format}:`, error);
      alert(`Sorry, there was an error creating the ${format.toUpperCase()} file.`);
    } finally {
      setIsExporting(false);
    }
  };

  const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean; ariaLabel: string; className?: string }> = ({ onClick, children, disabled, ariaLabel, className = '' }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`flex items-center gap-2 bg-white text-[#0B2545] font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-[#EAECEE] ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
      <ActionButton
        onClick={onSave}
        disabled={isSaved}
        ariaLabel={isSaved ? "Itinerary is saved" : "Save this itinerary"}
        className={isSaved ? 'bg-teal-50 !text-[#13A89E]' : ''}
      >
        <div className="w-5 h-5"><BookmarkIcon filled={isSaved} /></div>
        {isSaved ? 'Saved' : 'Save Trip'}
      </ActionButton>
      
      {isMapViewable && (
          <ActionButton
            onClick={onToggleMap}
            ariaLabel={isMapVisible ? "Hide map" : "Show map"}
            className={isMapVisible ? 'bg-teal-50 !text-[#13A89E]' : ''}
          >
            <div className="w-5 h-5"><MapIcon /></div>
            {isMapVisible ? 'Hide Map' : 'View Map'}
          </ActionButton>
      )}

      <div className="relative" ref={dropdownRef}>
        <ActionButton
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isExporting}
          ariaLabel="Export itinerary"
        >
          <div className="w-5 h-5"><ExportIcon /></div>
          {isExporting ? 'Exporting...' : 'Export'}
        </ActionButton>
        {isDropdownOpen && (
          <div className="absolute top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-[#EAECEE] z-20 animate-fade-in-up origin-top">
            <ul className="py-1">
                <li className="flex items-center gap-3 px-4 py-2 text-sm text-[#4A4A4A] hover:bg-[#F5F5F7] cursor-pointer" onClick={() => handleExport('pdf')}><div className="w-5 h-5 text-[#13A89E]"><PdfIcon/></div>Save as PDF</li>
                <li className="flex items-center gap-3 px-4 py-2 text-sm text-[#4A4A4A] hover:bg-[#F5F5F7] cursor-pointer" onClick={() => handleExport('pptx')}><div className="w-5 h-5 text-[#13A89E]"><PptIcon/></div>Save as PPTX</li>
                <li className="flex items-center gap-3 px-4 py-2 text-sm text-[#4A4A4A] hover:bg-[#F5F5F7] cursor-pointer" onClick={() => handleExport('docx')}><div className="w-5 h-5 text-[#13A89E]"><DocIcon/></div>Save as DOCX</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportActions;
