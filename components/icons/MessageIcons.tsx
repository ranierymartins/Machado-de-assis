
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

export const UserIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12Zm0 8q-3.325 0-5.662-2.337T4 12q0-3.325 2.338-5.663T12 4q3.325 0 5.663 2.337T20 12q0 3.325-2.337 5.663T12 20Z"/>
  </svg>
);

export const BotIcon: React.FC<IconProps> = (props) => (
  // A simple quill or book icon for Machado
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm2-2h10V5H7v14Zm2-2h6v-2H9v2Zm0-4h6v-2H9v2Z"/>
  </svg>
);

export const SystemIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11 15h2v2h-2v-2Zm0-8h2v6h-2V7Zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Z"/>
    </svg>
);