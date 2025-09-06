
import React, { useState, useEffect } from 'react';

const messages = [
  "Architecting your adventure...",
  "Consulting local guides...",
  "Finding hidden gems...",
  "Checking opening times...",
  "Packing your virtual bags...",
  "Finalizing your masterpiece..."
];

const LoadingAnimation: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 2800); // Sync with animation duration

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-48 h-48">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 10,10 L 90,50 L 10,90 L 25,50 Z"
            fill="#13A89E"
            className="animate-fly"
          />
        </svg>
        <style>{`
          @keyframes fly {
            0% {
              transform: translateX(-120px) translateY(80px) rotate(-25deg);
              opacity: 0;
            }
            30%, 70% {
              transform: translateX(0) translateY(0) rotate(15deg);
              opacity: 1;
            }
            100% {
              transform: translateX(120px) translateY(-80px) rotate(55deg);
              opacity: 0;
            }
          }
          .animate-fly {
            animation: fly 2.8s ease-in-out infinite;
            transform-origin: 50% 50%;
          }
        `}</style>
      </div>
      <h2 className="text-2xl font-semibold text-[#0B2545] mt-8">
        Crafting Your Perfect Itinerary
      </h2>
      <div className="h-6 mt-2">
         <p key={messageIndex} className="text-[#A9A9A9] animate-fade-in-out">
            {messages[messageIndex]}
          </p>
      </div>
        <style>{`
          @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateY(10px); }
            20%, 80% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-out {
            animation: fadeInOut 2.8s ease-in-out forwards;
          }
           @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
           @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
           @keyframes scale-in {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
          .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
          .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default LoadingAnimation;