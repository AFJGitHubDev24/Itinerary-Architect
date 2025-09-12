import React from 'react';

const Logo: React.FC = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/*
      This logo is a vector recreation based on the image provided by the user.
      It features a top-down view of an airplane over an open book.
      Colors are sampled from the source image to match the user's request.
    */}

    {/* Book Icon - Outline */}
    <path
      d="M3 18.5C7 16, 17 16, 21 18.5V13.5C17.5 11, 6.5 11, 3 13.5V18.5Z"
      stroke="#264983"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />

    {/* Airplane Icon - Solid fill */}
    <path
      d="M12 4L10.5 8.5L3 10.5L5.5 11.5L10.5 11V16.5L7 18.5L8 19.5L12 17.5L16 19.5L17 18.5L13.5 16.5V11L18.5 11.5L21 10.5L13.5 8.5L12 4Z"
      fill="#4EBCF7"
    />
  </svg>
);

export default Logo;
