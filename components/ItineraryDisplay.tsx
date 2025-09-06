import React from 'react';
import { Itinerary, Activity, GroundingChunk } from '../types';
import { FoodIcon, SightseeingIcon, AccommodationIcon, TravelIcon, ActivityIcon, LinkIcon } from './Icons';
import ExportActions from './ExportActions';

interface ItineraryDisplayProps {
    itinerary: Itinerary;
    citations: GroundingChunk[];
    onSave: () => void;
    isSaved: boolean;
}

const ActivityCard: React.FC<{ activity: Activity, isLast: boolean }> = ({ activity, isLast }) => {
    const getIcon = (type: Activity['type']) => {
        switch (type) {
            case 'Food': return <FoodIcon />;
            case 'Sightseeing': return <SightseeingIcon />;
            case 'Accommodation': return <AccommodationIcon />;
            case 'Travel': return <TravelIcon />;
            case 'Activity': return <ActivityIcon />;
            default: return <SightseeingIcon />;
        }
    };

    const imageUrl = `https://source.unsplash.com/400x200/?${encodeURIComponent(activity.title)},${encodeURIComponent(activity.location || 'travel')}`;

    return (
        <div className="relative pl-12 pb-10 group">
             {/* Timeline line */}
            {!isLast && <div className="absolute top-5 left-5 -ml-px w-0.5 h-full bg-[#EAECEE]"></div>}

            {/* Timeline icon */}
            <div className="absolute top-5 left-5 -ml-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-[#F5F5F7] z-10">
                <div className="w-4 h-4 text-[#13A89E] rounded-full bg-white group-hover:scale-125 transition-transform duration-300">
                   {getIcon(activity.type)}
                </div>
            </div>
            
            {/* Card Content */}
            <div className="relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-[#EAECEE] animate-fade-in-up overflow-hidden transform group-hover:-translate-y-1">
                {/* Background Image & Overlay for Hover */}
                <div className="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0 group-hover:opacity-100" aria-hidden="true">
                    <img
                        src={imageUrl}
                        alt={activity.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
                
                {/* Text content, must be relative to stack on top */}
                <div className="relative p-6">
                    <p className="text-sm font-semibold text-[#13A89E] mb-1">{activity.time}</p>
                    <h4 className="font-bold text-xl text-[#0B2545] mb-2 transition-colors duration-300 group-hover:text-white">{activity.title}</h4>
                    <p className="text-[#4A4A4A] mb-3 transition-colors duration-300 group-hover:text-gray-200">{activity.description}</p>
                    {activity.location && (
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-[#A9A9A9] transition-colors duration-300 group-hover:text-teal-300 hover:!text-[#13A89E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-teal-400 rounded"
                            aria-label={`View map for ${activity.location}`}
                        >
                            <div className="w-4 h-4 flex-shrink-0">
                                <LinkIcon />
                            </div>
                            {activity.location}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};


const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary, citations, onSave, isSaved }) => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
        <div>
            <h2 className="text-4xl font-bold text-[#0B2545] text-center mb-4">{itinerary.tripTitle}</h2>
            <p className="text-center text-[#A9A9A9] mb-8">Here is your personalized AI-generated travel plan.</p>
        </div>

        <ExportActions 
            itinerary={itinerary} 
            onSave={onSave}
            isSaved={isSaved}
        />

        {itinerary.days.map(day => (
            <div key={day.day} className="mb-12">
                <h3 className="text-3xl font-bold text-[#0B2545] mb-2 sticky top-[70px] bg-[#F5F5F7]/80 backdrop-blur-sm py-3 z-10">Day {day.day}: {day.title}</h3>
                <div className="relative">
                   {day.activities.map((activity, index) => (
                       <ActivityCard 
                            key={index} 
                            activity={activity}
                            isLast={index === day.activities.length - 1}
                       />
                   ))}
                </div>
            </div>
        ))}

        {citations && citations.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md border border-[#EAECEE] mt-12">
                <h4 className="text-xl font-bold text-[#0B2545] mb-4">Information Sources</h4>
                <p className="text-sm text-[#A9A9A9] mb-4">This itinerary was created using real-time information from the following web sources:</p>
                <ul className="space-y-2">
                    {citations.map((citation, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <div className="w-5 h-5 text-[#13A89E] flex-shrink-0 mt-0.5"><LinkIcon/></div>
                            <a 
                                href={citation.web.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[#13A89E] hover:underline"
                            >
                                {citation.web.title}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
  );
};

export default ItineraryDisplay;