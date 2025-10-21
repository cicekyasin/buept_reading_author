import React from 'react';

const ClipboardCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M10.125 2.25h-4.5c-1.125 0-2.062.938-2.062 2.063v15.374c0 1.125.937 2.063 2.062 2.063h12.75c1.125 0 2.063-.938 2.063-2.063V4.313c0-1.125-.938-2.063-2.063-2.063h-4.5m-6.75 0a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75m-6 0v.75c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.75m-6 0h6m-5.25 6h4.5m-4.5 3h4.5m-4.5 3h4.5m1.5-6l-1.5 1.5-1.5-1.5m1.5 6l-1.5-1.5-1.5 1.5"
    />
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.375 10.5l1.5 1.5 3-3"
     />

  </svg>
);

export default ClipboardCheckIcon;
