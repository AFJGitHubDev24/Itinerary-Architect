import React from 'react';

const Logo: React.FC = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Compass / AI Spark Element */}
    <g transform="translate(14.5, 4.5) rotate(15)">
      <path
        d="M3 0L3.75 2.25L6 3L3.75 3.75L3 6L2.25 3.75L0 3L2.25 2.25L3 0Z"
        fill="#13A89E"
      />
    </g>

    {/* Paper Airplane Body */}
    <path
      d="M3.5 20.5L20 4L13 21L11 14L3.5 20.5Z"
      stroke="#0B2545"
      fill="#0B2545"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 4L11 14L13 21"
      stroke="#13A89E"
      fill="#13A89E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Itinerary Book on Wing */}
    <g transform="translate(6.5, 12.5) rotate(-40)">
      <rect x="0" y="0" width="4" height="3" rx="0.5" fill="white" fillOpacity="0.85" />
      <path d="M0 1.5H4" stroke="#0B2545" strokeWidth="0.5" strokeOpacity="0.6" />
      <path d="M2 0V3" stroke="#0B2545" strokeWidth="0.5" strokeOpacity="0.6" />
    </g>
  </svg>
);

export default Logo;