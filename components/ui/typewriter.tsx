"use client";

import { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export const Typewriter = ({ text, speed = 15, onComplete, className = "" }: TypewriterProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Jika teks sudah lengkap (misal dari history lama), langsung tampilkan
    // Kita gunakan trik sederhana: jika teks pendek, ketik. Jika panjang dan ini render ulang, mungkin skip (opsional)
    // Tapi untuk chat effect terbaik, kita reset setiap kali text prop berubah (yang seharusnya unik per pesan baru)
    setDisplayedText('');
    setIsComplete(false);
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <p className={`whitespace-pre-wrap ${className}`}>
      {displayedText}
      {!isComplete && <span className="animate-pulse">▍</span>}
    </p>
  );
};
