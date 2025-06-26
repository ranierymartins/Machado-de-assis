
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const MicrophoneIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 14q.825 0 1.413-.587T14 12V6q0-.825-.587-1.412T12 4q-.825 0-1.412.588T10 6v6q0 .825.588 1.413T12 14Zm-1 7v-3.075q-2.6-.35-4.3-2.325T5 11H7q0 2.075 1.463 3.538T12 16q2.075 0 3.538-1.463T17 11h2q0 2.25-1.7 4.225T13 17.925V21h-2Z"/>
  </svg>
);
export default MicrophoneIcon;