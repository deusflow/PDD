import { SPEECH_AUDIO_HASHES } from '../data/speechManifest';
import {
  hashSpeechKey,
  normalizeSpeechKey,
  prepareDanishSpeechText,
  splitNumberedSpeechItem,
} from '../utils/speechUtils';

type SpeechListener = (speakingId: string | null) => void;

const MANIFEST_SET = new Set<string>(SPEECH_AUDIO_HASHES);

interface QueueSegment {
  raw: string;
  audioUrl: string | null;
  pauseBeforeMs: number;
}

class DanishSpeechService {
  private currentId: string | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private pauseTimer: ReturnType<typeof setTimeout> | null = null;
  private sequenceToken = 0;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private listeners = new Set<SpeechListener>();

  constructor() {
    if (this.isSpeechSynthesisSupported()) {
      this.loadVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        this.loadVoices();
      });
    }
  }

  private loadVoices(): void {
    if (!this.isSpeechSynthesisSupported()) return;
    this.cachedVoices = window.speechSynthesis.getVoices();
  }

  private isAudioSupported(): boolean {
    return typeof window !== 'undefined' && typeof Audio !== 'undefined';
  }

  private isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSupported(): boolean {
    return this.isAudioSupported() || this.isSpeechSynthesisSupported();
  }

  public hasPreGeneratedAudio(): boolean {
    return MANIFEST_SET.size > 0 && this.isAudioSupported();
  }

  public getCurrentId(): string | null {
    return this.currentId;
  }

  public getVoiceStatus(): 'ready' | 'missing_da' | 'loading' {
    if (this.hasPreGeneratedAudio()) {
      return 'ready';
    }
    if (!this.isSpeechSynthesisSupported()) return 'missing_da';
    const voices =
      this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
    if (voices.length === 0) return 'loading';
    return this.getDanishVoice() ? 'ready' : 'missing_da';
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.currentId);
    }
  }

  private clearActiveAudio(): void {
    if (this.audioEl) {
      this.audioEl.onended = null;
      this.audioEl.onerror = null;
      try {
        this.audioEl.pause();
        this.audioEl.removeAttribute('src');
        this.audioEl.load();
      } catch {
        // Ignore cleanup errors in non-DOM or restricted environments
      }
    }
  }

  private clearActiveUtterance(): void {
    if (this.activeUtterance) {
      this.activeUtterance.onend = null;
      this.activeUtterance.onerror = null;
      this.activeUtterance = null;
    }
  }

  private clearPauseTimer(): void {
    if (this.pauseTimer !== null) {
      clearTimeout(this.pauseTimer);
      this.pauseTimer = null;
    }
  }

  private resetPlayback(clearId: boolean): void {
    this.sequenceToken += 1;
    this.clearPauseTimer();
    this.clearActiveAudio();
    this.clearActiveUtterance();
    if (this.isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
    if (clearId && this.currentId !== null) {
      this.currentId = null;
      this.notify();
    }
  }

  public stop(): void {
    this.resetPlayback(true);
  }

  private getDanishVoice(): SpeechSynthesisVoice | undefined {
    const voices =
      this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
    const danish = voices.filter((v) => v.lang.toLowerCase().startsWith('da'));
    if (danish.length === 0) return undefined;

    const scoreVoice = (v: SpeechSynthesisVoice): number => {
      let score = v.lang.toLowerCase() === 'da-dk' ? 10 : 0;
      const name = v.name.toLowerCase();
      if (name.includes('neural') || name.includes('natural')) score += 40;
      if (name.includes('enhanced') || name.includes('premium') || name.includes('siri')) score += 30;
      if (!v.localService) score += 15;
      if (name.includes('christel') || name.includes('sara') || name.includes('magnus')) score += 5;
      return score;
    };

    return [...danish].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
  }

  private createUtterance(rawText: string): SpeechSynthesisUtterance {
    const spoken = prepareDanishSpeechText(rawText) || rawText;
    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.lang = 'da-DK';
    utterance.rate = 0.94;
    utterance.pitch = 1.0;
    const voice = this.getDanishVoice();
    if (voice) utterance.voice = voice;
    return utterance;
  }

  private resolveAudioUrl(rawText: string): string | null {
    if (!this.hasPreGeneratedAudio()) return null;
    const hash = hashSpeechKey(rawText);
    if (!MANIFEST_SET.has(hash)) return null;
    return `./audio/${hash}.mp3`;
  }

  private expandSegments(texts: string[]): QueueSegment[] {
    const segments: QueueSegment[] = [];

    for (let i = 0; i < texts.length; i += 1) {
      const normalized = normalizeSpeechKey(texts[i]);
      if (!normalized) continue;

      const pauseBetweenItems = i === 0 ? 0 : 180;
      const directUrl = this.resolveAudioUrl(normalized);
      if (directUrl) {
        segments.push({ raw: normalized, audioUrl: directUrl, pauseBeforeMs: pauseBetweenItems });
        continue;
      }

      const split = splitNumberedSpeechItem(normalized);
      if (split) {
        const prefixUrl = this.resolveAudioUrl(split.prefix);
        const bodyUrl = this.resolveAudioUrl(split.body);
        if (prefixUrl && bodyUrl) {
          segments.push({ raw: split.prefix, audioUrl: prefixUrl, pauseBeforeMs: pauseBetweenItems });
          segments.push({ raw: split.body, audioUrl: bodyUrl, pauseBeforeMs: 90 });
          continue;
        }
      }

      segments.push({ raw: normalized, audioUrl: null, pauseBeforeMs: pauseBetweenItems });
    }

    return segments;
  }

  private getOrCreateAudio(): HTMLAudioElement | null {
    if (!this.isAudioSupported()) return null;
    if (!this.audioEl) {
      this.audioEl = new Audio();
      this.audioEl.preload = 'auto';
    }
    return this.audioEl;
  }

  private playUtteranceFallback(
    rawText: string,
    token: number,
    id: string,
    onDone: () => void,
    onFail: () => void
  ): void {
    if (!this.isSpeechSynthesisSupported()) {
      onFail();
      return;
    }

    const utterance = this.createUtterance(rawText);
    this.activeUtterance = utterance;

    utterance.onend = () => {
      if (this.sequenceToken === token && this.currentId === id) {
        this.activeUtterance = null;
        onDone();
      }
    };

    utterance.onerror = () => {
      if (this.sequenceToken === token && this.currentId === id) {
        this.activeUtterance = null;
        onFail();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  private startPlayback(segments: QueueSegment[], id: string): void {
    if (segments.length === 0 || !this.isSupported()) return;

    this.resetPlayback(false);
    const token = this.sequenceToken;
    this.currentId = id;
    this.notify();

    // Prime a single shared Audio element synchronously inside click gesture when available
    const audio = segments.some((s) => s.audioUrl !== null) ? this.getOrCreateAudio() : null;

    const finish = () => {
      if (this.sequenceToken === token && this.currentId === id) {
        this.clearPauseTimer();
        this.clearActiveUtterance();
        this.currentId = null;
        this.notify();
      }
    };

    const playAt = (idx: number) => {
      if (this.sequenceToken !== token || this.currentId !== id) return;
      if (idx >= segments.length) {
        finish();
        return;
      }

      const seg = segments[idx];

      const runSegment = () => {
        if (this.sequenceToken !== token || this.currentId !== id) return;

        if (seg.audioUrl && audio) {
          audio.onended = null;
          audio.onerror = null;
          audio.src = seg.audioUrl;

          audio.onended = () => {
            if (this.sequenceToken === token && this.currentId === id) {
              playAt(idx + 1);
            }
          };

          audio.onerror = () => {
            if (this.sequenceToken !== token || this.currentId !== id) return;
            this.playUtteranceFallback(seg.raw, token, id, () => playAt(idx + 1), finish);
          };

          const playPromise = audio.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch((err: unknown) => {
              if (this.sequenceToken !== token || this.currentId !== id) return;
              const name = (err as { name?: string } | null)?.name ?? '';
              // Do not fall back on browser autoplay block; stop cleanly instead
              if (name === 'NotAllowedError' || name === 'AbortError') {
                finish();
                return;
              }
              this.playUtteranceFallback(seg.raw, token, id, () => playAt(idx + 1), finish);
            });
          }
          return;
        }

        this.playUtteranceFallback(seg.raw, token, id, () => playAt(idx + 1), finish);
      };

      if (seg.pauseBeforeMs > 0) {
        this.pauseTimer = setTimeout(runSegment, seg.pauseBeforeMs);
      } else {
        runSegment();
      }
    };

    playAt(0);
  }

  public speak(text: string, id: string): void {
    const normalized = normalizeSpeechKey(text);
    if (!this.isSupported() || !normalized) return;

    if (this.currentId === id) {
      this.stop();
      return;
    }

    const segments = this.expandSegments([normalized]);
    this.startPlayback(segments, id);
  }

  public speakSequence(texts: string[], id: string): void {
    const clean = texts.map((t) => normalizeSpeechKey(t)).filter(Boolean);
    if (!this.isSupported() || clean.length === 0) return;

    if (this.currentId === id) {
      this.stop();
      return;
    }

    const segments = this.expandSegments(clean);
    this.startPlayback(segments, id);
  }
}

export const danishSpeech = new DanishSpeechService();
