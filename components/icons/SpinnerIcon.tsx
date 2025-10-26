
import React from 'react';

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
        className={`animate-spin ${props.className || ''}`}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 12v3m9-9h-3m-12 0H3m16.03-6.03L16.5 7.5M7.5 16.5 4.97 19.03M19.03 4.97 16.5 7.5M7.5 7.5 4.97 4.97" />
    </svg>
);

export default SpinnerIcon;
