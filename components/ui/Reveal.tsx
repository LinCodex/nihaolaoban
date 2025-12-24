import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children?: React.ReactNode;
  delay?: number;
  width?: "fit-content" | "100%";
  className?: string;
}

export const Reveal: React.FC<RevealProps> = ({ children, delay = 0, width = "fit-content", className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add a small delay for staggering
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [delay]);

  return (
    <div ref={ref} style={{ width }} className={`${isVisible ? 'fade-up-enter-active' : 'fade-up-enter'} ${className}`}>
      {children}
    </div>
  );
};