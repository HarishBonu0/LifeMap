// Web Speech Recognition Wrapper for DreamLife AI Voice Input

export interface SpeechRecognitionHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (errorMessage: string) => void;
  onStateChange: (isListening: boolean) => void;
}

export class BrowserSpeechController {
  private recognition: any = null;
  private isListening: boolean = false;
  private durationSeconds: number = 0;
  private timerInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-IN'; // Indian English default, also captures Hindi/Hinglish terms
      }
    }
  }

  isSupported(): boolean {
    return Boolean(this.recognition);
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  start(
    handlers: SpeechRecognitionHandlers,
    onTick?: (seconds: number) => void
  ): boolean {
    if (!this.recognition) {
      handlers.onError(
        'Speech recognition is not supported in this browser. Please type your goals into the text box below, or try Google Chrome / Microsoft Edge.'
      );
      return false;
    }

    if (this.isListening) {
      this.stop();
    }

    this.durationSeconds = 0;
    this.recognition.onstart = () => {
      this.isListening = true;
      handlers.onStateChange(true);

      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.durationSeconds += 1;
        onTick?.(this.durationSeconds);
      }, 1000);
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const combined = finalTranscript || interimTranscript;
      handlers.onResult(combined, Boolean(finalTranscript));
    };

    this.recognition.onerror = (event: any) => {
      let friendlyMessage = 'Microphone input error. Please type your dreams directly.';
      if (event.error === 'not-allowed') {
        friendlyMessage =
          'Microphone permission was denied by your browser. Please allow microphone access in your browser settings or use the text box below.';
      } else if (event.error === 'no-speech') {
        friendlyMessage =
          'No speech was detected. Please check your microphone or enter your goals using text.';
      } else if (event.error === 'audio-capture') {
        friendlyMessage =
          'No microphone was found on this device. Please plug in a microphone or type directly.';
      } else if (event.error === 'network') {
        friendlyMessage =
          'Speech recognition network request failed. You can type your goals directly.';
      }

      handlers.onError(friendlyMessage);
      this.stop();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      handlers.onStateChange(false);
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    };

    try {
      this.recognition.start();
      return true;
    } catch (err: any) {
      handlers.onError(
        'Could not initiate speech recording. Please use text entry.'
      );
      this.isListening = false;
      handlers.onStateChange(false);
      return false;
    }
  }

  stop(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
    }
    this.isListening = false;
  }
}
