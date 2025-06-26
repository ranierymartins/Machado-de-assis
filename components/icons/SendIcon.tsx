
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {}

const SendIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3 20V4l19 8Zm2-3.05L16.6 12 5 7.05v3.5L9.5 12 5 13.45ZM5 16.95V7.05v9.9Z"/>
  </svg>
);
export default SendIcon;