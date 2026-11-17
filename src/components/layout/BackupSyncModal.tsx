import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { StorageManager } from '../../services/storage';
import { UserAppState } from '../../types';

interface BackupSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: UserAppState;
  onRestoreState: (next: UserAppState) => void;
  onResetAll: () => void;
}

export const BackupSyncModal: React.FC<BackupSyncModalProps> = ({
  isOpen,
  onClose,
  appState,
  onRestoreState,
  onResetAll,
}) => {
  const [syncInput, setSyncInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatedSyncCode = useMemo(() => {
    if (!isOpen) return '';
    return StorageManager.encodeSyncString(appState);
  }, [appState, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedSyncCode);
      setCopied(true);
      setStatusMessage({ type: 'ok', text: 'Код синхронизации скопирован в буфер обмена.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setStatusMessage({ type: 'err', text: 'Не удалось скопировать автоматически — выделите строку вручную.' });
    }
  };

  const handleApplySyncCode = () => {
    try {
      const next = StorageManager.decodeSyncString(syncInput);
      onRestoreState(next);
      setSyncInput('');
      setStatusMessage({ type: 'ok', text: 'Прогресс успешно перенесён из кода синхронизации!' });
    } catch (err) {
      setStatusMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Ошибка чтения кода синхронизации.',
      });
    }
  };

  const handleDownloadJson = () => {
    const json = StorageManager.exportToJson(appState);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dk-korekort-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'ok', text: 'Файл резервной копии .json скачан.' });
  };

  const handleUploadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const next = StorageManager.importFromJson(text);
        onRestoreState(next);
        setStatusMessage({ type: 'ok', text: 'Прогресс восстановлен из файла .json!' });
      } catch (err) {
        setStatusMessage({
          type: 'err',
          text: err instanceof Error ? err.message : 'Некорректный файл .json.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    onResetAll();
    setConfirmReset(false);
    setStatusMessage({ type: 'ok', text: 'Весь прогресс сброшен.' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Бэкап и перенос прогресса"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl animate-slide-up dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Бэкап и перенос прогресса
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Все ответы автоматически сохраняются в localStorage. Здесь можно перенести прогресс на телефон или сохранить файл.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-xl p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 rounded-xl border px-3 py-2 text-xs font-medium ${
              statusMessage.type === 'ok'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Section 1: Base64 Sync String */}
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Быстрый код синхронизации (Base64 Sync)
            </h3>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Скопировано' : 'Копировать код'}
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Скопируйте эту строку и вставьте на другом устройстве (телефоне или ноутбуке).
          </p>
          <textarea
            readOnly
            value={generatedSyncCode}
            rows={2}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            className="mt-2.5 w-full resize-none rounded-xl border border-zinc-200 bg-white p-2.5 font-mono text-[11px] text-zinc-700 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          />

          <div className="mt-3 border-t border-zinc-200/80 pt-3 dark:border-zinc-800">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Вставить код с другого устройства:
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={syncInput}
                onChange={(e) => setSyncInput(e.target.value)}
                placeholder="DKK1:..."
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <button
                type="button"
                disabled={!syncInput.trim()}
                onClick={handleApplySyncCode}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-500 disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Применить
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: JSON File */}
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/50">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Резервная копия файлом (.json)
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Download className="h-4 w-4" />
              Скачать .json
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Upload className="h-4 w-4" />
              Загрузить .json
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleUploadJson}
              className="hidden"
            />
          </div>
        </div>

        {/* Section 3: Reset */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-rose-200/70 bg-rose-50/40 p-4 dark:border-rose-900/50 dark:bg-rose-950/20">
          <div>
            <div className="text-xs font-semibold text-rose-800 dark:text-rose-300">
              Сбросить весь прогресс
            </div>
            <div className="text-[11px] text-rose-600/80 dark:text-rose-400/70">
              Обнулит все 5 коробок Лейтнера и историю экзаменов
            </div>
          </div>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-800 dark:bg-zinc-900 dark:text-rose-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Сбросить
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
              >
                Подтвердить
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-xl px-2 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                Отмена
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
