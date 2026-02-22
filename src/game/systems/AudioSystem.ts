import { SaveManager, SaveData } from './SaveManager';

export class AudioSystem {
  private static instance: AudioSystem;
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  // BGM State
  private bgmIntervalId: number | null = null;
  private isBgmPlaying = false;
  private bgmStep = 0;
  private nextNoteTime = 0;
  private currentTempoMultiplier = 1;

  // Cache for noise buffer to avoid reallocation on mobile
  private noiseBuffer: AudioBuffer | null = null;

  // Catchy chiptune melody (C minor pentatonic + driving bass)
  // 0 means rest
  private bgmSequence = [
    // Measure 1
    261.63, 0, 261.63, 311.13, 0, 392.0, 0, 311.13,
    // Measure 2
    349.23, 0, 349.23, 392.0, 0, 261.63, 0, 0,
    // Measure 3
    261.63, 0, 261.63, 311.13, 0, 392.0, 0, 311.13,
    // Measure 4
    466.16, 0, 466.16, 392.0, 0, 349.23, 311.13, 0
  ];

  private constructor() {
    this.isMuted = !SaveManager.getSaveData().audioEnabled;
  }

  public static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  public init(): void {
    if (this.audioCtx) return;

    const initAudio = () => {
      if (!this.audioCtx) {
        const AudioCtxClass = (window as any).AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx!.state === 'suspended') {
        this.audioCtx!.resume();
      }

      // Prime iOS audio with a silent buffer
      const buffer = this.audioCtx!.createBuffer(1, 1, 22050);
      const source = this.audioCtx!.createBufferSource();
      source.buffer = buffer;
      source.connect(this.audioCtx!.destination);
      source.start(0);

      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('keydown', initAudio);
    };

    window.addEventListener('click', initAudio);
    window.addEventListener('touchstart', initAudio);
    window.addEventListener('keydown', initAudio);

    // Pre-generate noise buffer for performance
    this.prepareNoiseBuffer();
  }

  public resume(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private prepareNoiseBuffer() {
    if (!this.audioCtx) return;
    const bufferSize = this.audioCtx.sampleRate * 2; // 2 seconds of noise
    this.noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    // Save via SaveManager
    const data = SaveManager.getSaveData();
    data.audioEnabled = !this.isMuted;
    SaveManager.save(data);

    return this.isMuted;
  }

  public setBGMTempo(multiplier: number) {
    this.currentTempoMultiplier = Math.max(0.5, multiplier);
  }

  public startBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.isBgmPlaying = true;

    const checkCtx = () => {
      if (!this.isBgmPlaying) return;
      if (this.audioCtx && this.audioCtx.state === 'running') {
        this.bgmStep = 0;
        this.nextNoteTime = this.audioCtx.currentTime + 0.1;
        this.bgmIntervalId = window.setInterval(() => this.scheduleBGM(), 100);
      } else {
        setTimeout(checkCtx, 200);
      }
    };
    checkCtx();
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      window.clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  private scheduleBGM() {
    if (!this.isBgmPlaying || !this.audioCtx || this.isMuted) return;

    const scheduleAheadTime = 0.5;
    const baseNoteLength = 0.115;

    while (this.nextNoteTime < this.audioCtx.currentTime + scheduleAheadTime) {
      const freq = this.bgmSequence[this.bgmStep];

      if (freq > 0) {
        this.playBGMNote(freq, this.nextNoteTime, baseNoteLength / this.currentTempoMultiplier);
      }

      this.nextNoteTime += baseNoteLength / this.currentTempoMultiplier;
      this.bgmStep = (this.bgmStep + 1) % this.bgmSequence.length;
    }
  }

  private playBGMNote(freq: number, time: number, duration: number) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    // Use square wave for chiptune feel
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq / 2, time); // Lower octave for bassline feel

    // Pluck envelope
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.05, time + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration - 0.01);

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  public playJump() {
    if (this.isMuted || !this.audioCtx) return;
    this.playTone(300, 600, 0.1, 'sine');
  }

  public playSlide() {
    if (this.isMuted || !this.audioCtx) return;
    this.playNoise(0.3);
  }

  public playCoin() {
    if (this.isMuted || !this.audioCtx) return;
    this.playMultipleTones(
      [
        { freqStart: 880, freqEnd: 880, duration: 0.05 },
        { freqStart: 1200, freqEnd: 1200, duration: 0.1 }
      ],
      'square'
    );
  }

  public playPowerup() {
    if (this.isMuted || !this.audioCtx) return;
    this.playTone(400, 800, 0.5, 'sine');
  }

  public playHit() {
    if (this.isMuted || !this.audioCtx) return;
    this.playTone(150, 50, 0.2, 'sawtooth');
    this.playNoise(0.2);
  }

  public playPeto(type: 'start' | 'end' | 'gameover' | 'default' = 'default') {
    if (this.isMuted || !this.audioCtx) return;

    switch (type) {
      case 'start':
        this.playTone(60, 100, 0.5, 'sawtooth');
        this.playNoise(0.2);
        break;
      case 'end':
        this.playMultipleTones(
          [
            { freqStart: 440, freqEnd: 660, duration: 0.1 },
            { freqStart: 660, freqEnd: 880, duration: 0.1 }
          ],
          'sine'
        );
        this.playNoise(0.1);
        break;
      case 'gameover':
        this.playTone(80, 40, 0.6, 'sawtooth');
        this.playNoise(0.2);
        break;
      default:
        this.playTone(80, 40, 0.3, 'sawtooth');
        this.playNoise(0.1);
    }
  }

  public playCheer(intensity: number = 0.5) {
    if (this.isMuted || !this.audioCtx || intensity <= 0) return;

    if (!this.noiseBuffer) this.prepareNoiseBuffer();
    if (!this.noiseBuffer) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;

    const bandpass = this.audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1000 + intensity * 500;
    bandpass.Q.value = 1;

    const gainNode = this.audioCtx.createGain();
    const vol = Math.min(intensity * 0.15, 0.2); // Cap at 0.2
    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(vol, this.audioCtx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 1.5);

    source.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    source.start();
    source.stop(this.audioCtx.currentTime + 1.5);
  }

  // Helper to play simple synthesized tones
  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'sine'
  ) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.type = type;

    // Envelope
    osc.frequency.setValueAtTime(freqStart, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(freqEnd, 1),
      this.audioCtx.currentTime + duration
    );

    gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  private playMultipleTones(
    notes: { freqStart: number; freqEnd: number; duration: number }[],
    type: OscillatorType = 'sine'
  ) {
    if (!this.audioCtx) return;
    let timeOffset = 0;

    notes.forEach((note) => {
      const osc = this.audioCtx!.createOscillator();
      const gainNode = this.audioCtx!.createGain();

      osc.type = type;

      // Envelope
      osc.frequency.setValueAtTime(note.freqStart, this.audioCtx!.currentTime + timeOffset);
      if (note.freqEnd !== note.freqStart) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(note.freqEnd, 1),
          this.audioCtx!.currentTime + timeOffset + note.duration
        );
      }

      gainNode.gain.setValueAtTime(0.2, this.audioCtx!.currentTime + timeOffset);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioCtx!.currentTime + timeOffset + note.duration
      );

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx!.destination);

      osc.start(this.audioCtx!.currentTime + timeOffset);
      osc.stop(this.audioCtx!.currentTime + timeOffset + note.duration);

      timeOffset += note.duration;
    });
  }

  // White noise generator for slides/hits
  private playNoise(duration: number) {
    if (!this.audioCtx) return;

    if (!this.noiseBuffer) {
      this.prepareNoiseBuffer();
    }
    if (!this.noiseBuffer) return;

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;

    // Filter noise
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    const gainNode = this.audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    noise.start();
    noise.stop(this.audioCtx.currentTime + duration);
  }
}
