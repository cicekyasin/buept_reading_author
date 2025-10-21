import React from 'react';

const LoadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 17l-1.88-4.69a2 2 0 0 0-3.74 0L12 17" />
    <path d="M16 17h4" />
    <path d="M12 12v3" />
    <path d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
    <path d="M10 2v6h6" />
  </svg>
);

export default LoadIcon;