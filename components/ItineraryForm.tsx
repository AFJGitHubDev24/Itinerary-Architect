import React, { useState, KeyboardEvent, useRef, useEffect, useMemo } from 'react';
import type { UserPreferences } from '../types';
import { HistoryIcon, StarIcon, XCircleIcon } from './Icons';

interface ItineraryFormProps {
  onGenerate: (preferences: UserPreferences) => void;
  searchHistory: UserPreferences[];
  onTogglePin: (preferenceId: string) => void;
  onClearHistory: () => void;
}

const InputField: React.FC<{id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string}> = ({ id, label, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-white/90 mb-2">{label}</label>
        <input
            type="text"
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-white/10 backdrop-blur-sm text-white placeholder-white/50 border border-white/30 rounded-lg py-2 px-4 focus:ring-2 focus:ring-[#13A89E] focus:border-[#13A89E] outline-none transition-all duration-300"
            required
        />
    </div>
);

const SelectField: React.FC<{id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode}> = ({ id, label, value, onChange, children }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-white/90 mb-2">{label}</label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="w-full bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-lg py-2 px-4 focus:ring-2 focus:ring-[#13A89E] focus:border-[#13A89E] outline-none transition-all duration-300 appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
            }}
        >
            {children}
        </select>
    </div>
);


const ItineraryForm: React.FC<ItineraryFormProps> = ({ onGenerate, searchHistory, onTogglePin, onClearHistory }) => {
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState('');
  const [budget, setBudget] = useState('Moderate');
  const [travelStyle, setTravelStyle] = useState('Balanced');
  const [tone, setTone] = useState('Friendly');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const sortedHistory = useMemo(() => {
    return [...searchHistory].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [searchHistory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInterestKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentInterest.trim() !== '') {
      e.preventDefault();
      if (!interests.includes(currentInterest.trim())) {
        setInterests([...interests, currentInterest.trim()]);
      }
      setCurrentInterest('');
    }
  };

  const removeInterest = (indexToRemove: number) => {
    setInterests(interests.filter((_, index) => index !== indexToRemove));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (interests.length === 0) {
        alert("Please add at least one interest.");
        return;
    }
    onGenerate({ destination, dates, interests, budget, travelStyle, tone });
  };

  const handleSelectHistory = (prefs: UserPreferences) => {
    setDestination(prefs.destination);
    setDates(prefs.dates);
    setInterests(prefs.interests);
    setBudget(prefs.budget);
    setTravelStyle(prefs.travelStyle);
    setTone(prefs.tone || 'Friendly');
    setIsHistoryOpen(false);
  };

  const handleTogglePin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent the history item from being selected
    onTogglePin(id);
  };

  const handleClearHistory = () => {
    onClearHistory();
    setIsHistoryOpen(false); // Close dropdown after clearing
  };


  return (
    <div className="relative isolate overflow-hidden rounded-2xl max-w-2xl mx-auto shadow-2xl">
        <img src="https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1024&q=80" alt="Vibrant cityscape at dusk" className="absolute inset-0 h-full w-full object-cover"/>
        <div className="absolute inset-0 bg-black/60 dark:bg-black/70"></div>
        <div className="relative p-8 text-white">
            <h2 className="text-3xl font-bold text-center mb-1">Build Your Next Adventure</h2>
            <p className="text-center text-white/80 mb-8">Tell us your travel dreams, and our AI will do the rest.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField id="destination" label="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., Kyoto, Japan"/>
                <InputField id="dates" label="Travel Dates" value={dates} onChange={(e) => setDates(e.target.value)} placeholder="e.g., October 10th - 17th"/>
                
                <div>
                    <label htmlFor="interests" className="block text-sm font-medium text-white/90 mb-2">Interests (press Enter to add)</label>
                    <div className="flex flex-wrap items-center gap-2 p-2 bg-white/10 border border-white/30 rounded-lg">
                        {interests.map((interest, index) => (
                            <div key={index} className="bg-[#13A89E] text-white text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2 animate-scale-in">
                                {interest}
                                <button type="button" onClick={() => removeInterest(index)} className="font-bold text-teal-100 hover:text-white">
                                    &times;
                                </button>
                            </div>
                        ))}
                        <input
                            type="text"
                            id="interests"
                            value={currentInterest}
                            onChange={(e) => setCurrentInterest(e.target.value)}
                            onKeyDown={handleInterestKeyDown}
                            placeholder="e.g., Museums, Hiking..."
                            className="flex-grow bg-transparent text-white placeholder-white/50 outline-none p-1"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SelectField id="budget" label="Budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Budget-friendly</option>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Moderate</option>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Luxury</option>
                    </SelectField>

                    <SelectField id="travelStyle" label="Travel Style" value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)}>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Balanced</option>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Relaxed</option>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Adventurous</option>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Cultural</option>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Packed</option>
                    </SelectField>
                    
                    <SelectField id="tone" label="Tone of Voice" value={tone} onChange={(e) => setTone(e.target.value)}>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Friendly</option>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Formal</option>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Enthusiastic</option>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Professional</option>
                        <option className="bg-[#0B2545] dark:bg-gray-800">Humorous</option>
                    </SelectField>
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                    <button type="submit" className="flex-grow bg-[#13A89E] text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[#13A89E]">
                        BUILD MY TRIP
                    </button>
                    {searchHistory && searchHistory.length > 0 && (
                        <div className="relative" ref={historyRef}>
                            <button
                                type="button"
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                className="h-full bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-lg px-4 hover:bg-white/20 transition-all duration-300 transform active:scale-95"
                                aria-label="Show recent searches"
                            >
                                <div className="w-6 h-6"><HistoryIcon /></div>
                            </button>
                            {isHistoryOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-[#EAECEE] dark:border-gray-700 z-20 animate-fade-in-up origin-bottom-right">
                                    <ul className="py-1 max-h-80 overflow-y-auto">
                                        <li className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Recent Searches</li>
                                        {sortedHistory.map((historyItem) => (
                                            <li key={historyItem.id} 
                                                className="flex items-center justify-between px-4 py-3 text-sm text-[#4A4A4A] dark:text-gray-200 hover:bg-[#F5F5F7] dark:hover:bg-gray-700 cursor-pointer group"
                                                onClick={() => handleSelectHistory(historyItem)}
                                            >
                                                <div className="flex-grow overflow-hidden pr-2">
                                                    <p className="font-semibold truncate">{historyItem.destination}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{historyItem.interests.join(', ')}</p>
                                                </div>
                                                <button 
                                                    onClick={(e) => handleTogglePin(e, historyItem.id!)}
                                                    className={`p-1 rounded-full ml-2 flex-shrink-0 transition-all duration-200 ${historyItem.pinned ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 dark:text-gray-500 opacity-0 group-hover:opacity-100 hover:text-yellow-500'}`}
                                                    aria-label={historyItem.pinned ? 'Unpin search' : 'Pin search'}
                                                >
                                                    <div className="w-5 h-5"><StarIcon filled={!!historyItem.pinned} /></div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    {searchHistory.length > 0 && (
                                        <div className="border-t border-[#EAECEE] dark:border-gray-700 p-2">
                                            <button
                                                onClick={handleClearHistory}
                                                className="w-full flex items-center justify-center gap-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md py-2 font-semibold transition-colors"
                                            >
                                                <div className="w-4 h-4"><XCircleIcon/></div>
                                                Clear All Searches
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </form>
        </div>
    </div>
  );
};

export default ItineraryForm;