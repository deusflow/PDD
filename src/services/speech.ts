type SpeechListener = (speakingId: string | null) => void;

class DanishSpeechService {
  private currentId: string | null = null;
  private listeners = new Set<SpeechListener>();

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public getCurrentId(): string | null {
    return this.currentId;
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

  public stop(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.currentId = null;
    this.notify();
  }

  public speak(text: string, id: string): void {
    if (!this.isSupported() || !text.trim()) return;

    if (this.currentId === id) {
      this.stop();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'da-DK';
    utterance.rate = 0.94;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const danishVoice =
      voices.find((v) => v.lang.toLowerCase() === 'da-dk') ??
      voices.find((v) => v.lang.toLowerCase().startsWith('da'));

    if (danishVoice) {
      utterance.voice = danishVoice;
    }

    this.currentId = id;
    this.notify();

    utterance.onend = () => {
      if (this.currentId === id) {
        this.currentId = null;
        this.notify();
      }
    };

    utterance.onerror = () => {
      if (this.currentId === id) {
        this.currentId = null;
        this.notify();
      }
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const danishSpeech = new DanishSpeechService();
