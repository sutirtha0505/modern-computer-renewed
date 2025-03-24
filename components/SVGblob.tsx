import React from 'react';

const SVGblob = () => {
  return (
    <div className=' w-full h-full blur-3xl'>
      <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" width="100%" id="blobSvg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(252, 3, 223)" />
            <stop offset="100%" stopColor="rgb(3, 7, 252)" />
          </linearGradient>
        </defs>
        <path fill="url(#gradient)" d="M436,304.5Q419,359,384,412.5Q349,466,284.5,464Q220,462,165.5,436Q111,410,65.5,363.5Q20,317,22,250.5Q24,184,61.5,130Q99,76,158,49.5Q217,23,275.5,45Q334,67,384,99.5Q434,132,443.5,191Q453,250,436,304.5Z">
          <animate 
            attributeName="d" 
            dur="10s" 
            repeatCount="indefinite" 
            values="
              M436,304.5Q419,359,384,412.5Q349,466,284.5,464Q220,462,165.5,436Q111,410,65.5,363.5Q20,317,22,250.5Q24,184,61.5,130Q99,76,158,49.5Q217,23,275.5,45Q334,67,384,99.5Q434,132,443.5,191Q453,250,436,304.5Z; 
            " />
        </path>
      </svg>
    </div>
  );
};

export default SVGblob;
