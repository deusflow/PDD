type SpeechListener = (speakingId: string | null) => void;

class DanishSpeechService {
  private currentId: string | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private sequenceToken = 0;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private listeners = new Set<SpeechListener>();

  constructor() {
    if (this.isSupported()) {
      this.loadVoices();
      window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        this.loadVoices();
      });
    }
  }

  private loadVoices(): void {
    if (!this.isSupported()) return;
    this.cachedVoices = window.speechSynthesis.getVoices();
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getCurrentId(): string | null {
    return this.currentId;
  }

  public getVoiceStatus(): 'ready' | 'missing_da' | 'loading' {
    if (!this.isSupported()) return 'missing_da';
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

  private notify() {
    for (const listener of this.listeners) {
      listener(this.currentId);
    }
  }

  private clearActiveUtterance(): void {
    if (this.activeUtterance) {
      this.activeUtterance.onend = null;
      this.activeUtterance.onerror = null;
      this.activeUtterance = null;
    }
  }

  public stop(): void {
    this.sequenceToken += 1;
    if (!this.isSupported()) return;
    this.clearActiveUtterance();
    window.speechSynthesis.cancel();
    this.currentId = null;
    this.notify();
  }

  private getDanishVoice(): SpeechSynthesisVoice | undefined {
    const voices =
      this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang.toLowerCase() === 'da-dk') ??
      voices.find((v) => v.lang.toLowerCase().startsWith('da'))
    );
  }

  private createUtterance(text: string): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'da-DK';
    utterance.rate = 0.94;
    utterance.pitch = 1.0;
    const voice = this.getDanishVoice();
    if (voice) utterance.voice = voice;
    return utterance;
  }

  public speak(text: string, id: string): void {
    if (!this.isSupported() || !text.trim()) return;

    if (this.currentId === id) {
      this.stop();
      return;
    }

    this.sequenceToken += 1;
    const token = this.sequenceToken;
    this.clearActiveUtterance();
    window.speechSynthesis.cancel();

    const utterance = this.createUtterance(text);
    this.activeUtterance = utterance;
    this.currentId = id;
    this.notify();

    utterance.onend = () => {
      if (this.sequenceToken === token && this.currentId === id) {
        this.activeUtterance = null;
        this.currentId = null;
        this.notify();
      }
    };

    utterance.onerror = () => {
      if (this.sequenceToken === token && this.currentId === id) {
        this.activeUtterance = null;
        this.currentId = null;
        this.notify();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  public speakSequence(texts: string[], id: string): void {
    const clean = texts.map((t) => t.trim()).filter(Boolean);
    if (!this.isSupported() || clean.length === 0) return;

    if (this.currentId === id) {
      this.stop();
      return;
    }

    this.sequenceToken += 1;
    const token = this.sequenceToken;
    this.clearActiveUtterance();
    window.speechSynthesis.cancel();

    this.currentId = id;
    this.notify();

    const playNext = (idx: number) => {
      if (this.sequenceToken !== token || this.currentId !== id) return;
      if (idx >= clean.length) {
        this.activeUtterance = null;
        this.currentId = null;
        this.notify();
        return;
      }

      const utterance = this.createUtterance(clean[idx]);
      this.activeUtterance = utterance;

      utterance.onend = () => {
        if (this.sequenceToken === token && this.currentId === id) {
          playNext(idx + 1);
        }
      };

      utterance.onerror = () => {
        if (this.sequenceToken === token && this.currentId === id) {
          this.activeUtterance = null;
          this.currentId = null;
          this.notify();
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    playNext(0);
  }
}

export const danishSpeech = new DanishSpeechService();
