import React from 'react';

const AcademicCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-1.07-1.07a50.57 50.57 0 013.728-3.728L12 3.493l8.78 8.78a50.57 50.57 0 013.728 3.728l-1.07 1.07-3.728-3.728A50.57 50.57 0 0112 6.313a50.57 50.57 0 01-5.242 3.834L4.26 10.147z" 
    />
  </svg>
);

export default AcademicCapIcon;