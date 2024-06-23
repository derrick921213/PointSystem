// src/components/LoadScript.tsx
import React, { useEffect } from 'react';

const LoadScript: React.FC<{ src: string }> = ({ src }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [src]);

  return null;
};

export default LoadScript;
