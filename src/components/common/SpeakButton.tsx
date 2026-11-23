import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useUiLang } from '../../i18n/UiLangContext';
import { danishSpeech } from '../../services/speech';

interface SpeakButtonProps {
  text: string;
  sequence?: string[];
  id: string;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
  title?: string;
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  text,
  sequence,
  id,
  size = 'sm',
  label,
  className = '',
  title,
}) => {
  const { pick } = useUiLang();
  const [speakingId, setSpeakingId] = useState<string | null>(() => danishSpeech.getCurrentId());
  const supported = danishSpeech.isSupported();

  useEffect(() => {
    return danishSpeech.subscribe(setSpeakingId);
  }, []);

  if (!supported) {
    return null;
  }

  const baseTitle = title ?? pick('Озвучить по-датски (da-DK)', 'Озвучити данською (da-DK)');
  const isSpeaking = speakingId === id;
  const voiceStatus = danishSpeech.getVoiceStatus();
  const computedTitle = isSpeaking
    ? pick('Остановить озвучку', 'Зупинити озвучку')
    : voiceStatus === 'missing_da'
      ? `${baseTitle} (${pick('датский системный голос не найден — читается базовым голосом ОС', 'данський системний голос не знайдено — читається базовим голосом ОС')})`
      : baseTitle;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sequence && sequence.length > 0) {
      danishSpeech.speakSequence(sequence, id);
    } else {
      danishSpeech.speak(text, id);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={computedTitle}
      aria-label={isSpeaking ? 'Stop dansk oplæsning' : 'Læs op på dansk'}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border transition-all ${
        label
          ? 'h-8 px-2.5 text-xs font-semibold'
          : size === 'sm'
            ? 'h-7 w-7'
            : 'h-8 w-8'
      } ${
        isSpeaking
          ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-sm dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse-soft'
          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:text-zinc-100'
      } ${className}`}
    >
      {isSpeaking ? (
        <VolumeX className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      ) : (
        <Volume2 className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      )}
      {label && <span>{isSpeaking ? pick('Стоп', 'Стоп') : label}</span>}
    </button>
  );
};
