
import React from 'react';

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path 
      fillRule="evenodd" 
      d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-7.19c0-.496.342-.942.825-1.065Z" 
      clipRule="evenodd" 
    />
    <path 
      d="M6.035 18.368a.75.75 0 01-.75.75 6.75 6.75 0 01-5.64-3.432.75.75 0 011.06-1.06 5.25 5.25 0 004.58 2.682.75.75 0 01.75.75Z" 
    />
    <path 
      d="M2.057 11.082a.75.75 0 01.368.642 6.75 6.75 0 01-1.282 4.453.75.75 0 11-1.061-1.06 5.25 5.25 0 001.002-3.613.75.75 0 01.973-.422Z" 
    />
  </svg>
);

export default SparklesIcon;
