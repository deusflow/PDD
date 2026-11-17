import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { danishSpeech } from '../../services/speech';

interface SpeakButtonProps {
  text: string;
  id: string;
  size?: 'sm' | 'md';
  className?: string;
  title?: string;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  text,
  id,
  size = 'sm',
  className = '',
  title = 'Озвучить по-датски (da-DK)',
}) => {
  const [speakingId, setSpeakingId] = useState<string | null>(() => danishSpeech.getCurrentId());
  const supported = danishSpeech.isSupported();

  useEffect(() => {
    return danishSpeech.subscribe(setSpeakingId);
  }, []);

  if (!supported) {
    return null;
  }

  const isSpeaking = speakingId === id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    danishSpeech.speak(text, id);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isSpeaking ? 'Остановить озвучку' : title}
      aria-label={isSpeaking ? 'Stop dansk oplæsning' : 'Læs op på dansk'}
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border transition-all ${
        size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'
      } ${
        isSpeaking
          ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-sm dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse-soft'
          : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100'
      } ${className}`}
    >
      {isSpeaking ? (
        <VolumeX className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      ) : (
        <Volume2 className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      )}
    </button>
  );
};
