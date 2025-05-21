import React from 'react';

export const ChatBubbleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-5 h-5"
  >
    <path
      fillRule="evenodd"
      d="M4.804 21.644A6.707 6.707 0 006 21.75a6.75 6.75 0 006.75-6.75V9.75a.75.75 0 011.5 0v5.25A8.25 8.25 0 016 23.25a8.187 8.187 0 01-1.472-.244l-1.088-.544a.75.75 0 01-.44-1.369l2.808-1.404zM18.75 9.75V15A6.75 6.75 0 0112 21.75h-.252c.002-.017.002-.034.002-.051V15a.75.75 0 00-1.5 0v6.75A6.75 6.75 0 0018 21.75a6.707 6.707 0 001.196-.106l2.808 1.404a.75.75 0 01-.44 1.369l-1.088.544A8.187 8.187 0 0118 23.25a8.25 8.25 0 01-8.25-8.25V9.75a.75.75 0 011.5 0v5.25a6.75 6.75 0 005.25-6.638V9.75a.75.75 0 011.5 0z"
      clipRule="evenodd"
    />
    <path d="M12.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

export const MicrophoneIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 14c1.657 0 3-1.343 3-3V5c0-1.657-1.343-3-3-3S9 3.343 9 5v6c0 1.657 1.343 3 3 3zm-1-9a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0V5z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2c0 3.527 2.613 6.437 6 6.92V21H7v2h10v-2h-2v-2.08c3.387-.483 6-3.393 6-6.92v-2h-2z" />
  </svg>
);

export const PlayIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
      clipRule="evenodd"
    />
  </svg>
);

export const StopIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M7 7h10v10H7z" />
  </svg>
);

export const BotIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
    <path d="M12 7c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3zm0 4c-.551 0-1-.449-1-1s.449-1 1-1 1 .449 1 1-.449 1-1 1z" />
    <path d="M12 14c-2.757 0-5 2.243-5 5h10c0-2.757-2.243-5-5-5zm0 1c2.206 0 4 1.794 4 4H8c0-2.206 1.794-4 4-4z" />
    <circle cx="8.5" cy="10.5" r="1.5" />
    <circle cx="15.5" cy="10.5" r="1.5" />
  </svg>
);

export const StopCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
      clipRule="evenodd"
    />
  </svg>
);