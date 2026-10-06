// Web Audio API Synthesized Examination Bell & Sound Chimes
// Fully offline, no external audio file dependencies

class AudioBellService {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound(enabled) {
    this.soundEnabled = enabled !== undefined ? enabled : !this.soundEnabled;
    return this.soundEnabled;
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  // Double examination bell chime for station change ("Rotate Now!")
  playRotationBell() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    // Chime 1 (High tone - 880 Hz / A5)
    this._playBellNote(880, now, 1.8);
    // Chime 2 (Harmonic note - 659.25 Hz / E5, delayed by 0.35s)
    this._playBellNote(659.25, now + 0.35, 2.2);
    // Chime 3 (Root resolution - 1046.5 Hz / C6, delayed by 0.7s)
    this._playBellNote(1046.5, now + 0.7, 2.5);
  }

  // 1-minute warning tone (soft double beep)
  playWarningAlert() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    this._playPureTone(587.33, now, 0.18);
    this._playPureTone(587.33, now + 0.25, 0.25);
  }

  // Red Flag Safety Violation Alert
  playRedFlagAlert() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.4);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Score Submit Success Chime
  playSuccessSound() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    this._playPureTone(523.25, now, 0.12);
    this._playPureTone(659.25, now + 0.12, 0.12);
    this._playPureTone(783.99, now + 0.24, 0.35);
  }

  _playBellNote(freq, startTime, duration) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Exponential decay mimicking a cast bronze bell
    gain.gain.setValueAtTime(0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  _playPureTone(freq, startTime, duration) {
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const audioBell = new AudioBellService();
