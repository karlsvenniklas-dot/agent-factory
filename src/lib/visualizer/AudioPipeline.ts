import type { AudioAnalysis } from './types';

/**
 * Audio analysis pipeline
 * Extracts frequency and time-domain data from audio source
 * Falls back to mock data for development without audio
 */
export class AudioPipeline {
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null = null;

  // Pre-allocated buffers (no GC in render loop)
  private fftBuffer: Uint8Array;
  private waveformBuffer: Uint8Array;

  // Beat detection state
  private beatThreshold = 0.6;
  private beatDecay = 0.98;
  private beatCutoff = 0;
  private lastBeatTime = 0;

  // Mock data generation
  private mockTime = 0;
  private useMockData = true;

  constructor(fftSize = 2048) {
    this.fftBuffer = new Uint8Array(fftSize / 2);
    this.waveformBuffer = new Uint8Array(fftSize);
  }

  /**
   * Connect to an HTML audio element
   */
  connectToElement(audioElement: HTMLAudioElement): void {
    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.fftBuffer.length * 2;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      this.useMockData = false;
    } catch (error) {
      console.warn('Failed to connect audio element, using mock data:', error);
      this.useMockData = true;
    }
  }

  /**
   * Connect to a media stream (e.g., microphone)
   */
  connectToStream(stream: MediaStream): void {
    try {
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.fftBuffer.length * 2;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      this.useMockData = false;
    } catch (error) {
      console.warn('Failed to connect media stream, using mock data:', error);
      this.useMockData = true;
    }
  }

  /**
   * Analyze current audio and return analysis data
   * This is the main method called every frame
   */
  analyze(): AudioAnalysis {
    if (this.useMockData || !this.analyser) {
      return this.generateMockAnalysis();
    }

    // Get fresh data from analyser
    this.analyser.getByteFrequencyData(this.fftBuffer);
    this.analyser.getByteTimeDomainData(this.waveformBuffer);

    // Calculate frequency bands
    const bands = this.calculateBands();

    // Detect beats
    const beat = this.detectBeat(bands.bass);

    // Calculate RMS
    const rms = this.calculateRMS();

    return {
      fft: this.fftBuffer,
      waveform: this.waveformBuffer,
      bands,
      beat,
      rms,
    };
  }

  /**
   * Extract frequency band energies from FFT data
   */
  private calculateBands(): AudioAnalysis['bands'] {
    const nyquist = (this.audioContext?.sampleRate ?? 44100) / 2;
    const binWidth = nyquist / this.fftBuffer.length;

    const getBandEnergy = (minFreq: number, maxFreq: number): number => {
      const minBin = Math.floor(minFreq / binWidth);
      const maxBin = Math.ceil(maxFreq / binWidth);
      let sum = 0;
      let count = 0;

      for (let i = minBin; i < maxBin && i < this.fftBuffer.length; i++) {
        sum += this.fftBuffer[i];
        count++;
      }

      return count > 0 ? sum / count / 255 : 0;
    };

    return {
      subBass: getBandEnergy(20, 60),
      bass: getBandEnergy(60, 250),
      mids: getBandEnergy(250, 2000),
      treble: getBandEnergy(2000, nyquist),
    };
  }

  /**
   * Simple beat detection based on bass energy threshold
   */
  private detectBeat(bassEnergy: number): AudioAnalysis['beat'] {
    const now = performance.now();

    // Update threshold with decay
    this.beatCutoff *= this.beatDecay;
    this.beatCutoff = Math.max(this.beatCutoff, bassEnergy);

    // Detect beat if bass exceeds threshold
    const detected = bassEnergy > this.beatCutoff * this.beatThreshold &&
                     now - this.lastBeatTime > 100; // Minimum 100ms between beats

    if (detected) {
      this.lastBeatTime = now;
    }

    const confidence = detected ? Math.min(bassEnergy / (this.beatCutoff + 0.01), 1) : 0;

    return { detected, confidence };
  }

  /**
   * Calculate RMS (root mean square) from waveform data
   */
  private calculateRMS(): number {
    let sum = 0;
    for (let i = 0; i < this.waveformBuffer.length; i++) {
      const normalized = (this.waveformBuffer[i] - 128) / 128;
      sum += normalized * normalized;
    }
    return Math.sqrt(sum / this.waveformBuffer.length);
  }

  /**
   * Generate mock audio data for development
   */
  private generateMockAnalysis(): AudioAnalysis {
    this.mockTime += 0.016; // ~60fps

    // Generate oscillating values
    const bassFreq = 2;
    const midFreq = 3;
    const trebleFreq = 5;

    const bass = Math.abs(Math.sin(this.mockTime * bassFreq)) * 0.8;
    const mids = Math.abs(Math.sin(this.mockTime * midFreq)) * 0.6;
    const treble = Math.abs(Math.sin(this.mockTime * trebleFreq)) * 0.4;

    // Generate mock FFT data
    for (let i = 0; i < this.fftBuffer.length; i++) {
      const t = i / this.fftBuffer.length;
      let value = 0;

      if (t < 0.1) value = bass * 255;
      else if (t < 0.3) value = bass * 200 * (1 - (t - 0.1) * 5);
      else if (t < 0.5) value = mids * 150 * (1 - (t - 0.3) * 2.5);
      else value = treble * 100 * (1 - (t - 0.5) * 2);

      this.fftBuffer[i] = Math.max(0, Math.min(255, value + Math.random() * 20));
    }

    // Generate mock waveform data
    for (let i = 0; i < this.waveformBuffer.length; i++) {
      const t = (i / this.waveformBuffer.length) * Math.PI * 2;
      const sample = Math.sin(t * 4 + this.mockTime * 5) * bass * 0.5 +
                     Math.sin(t * 8 + this.mockTime * 3) * mids * 0.3 +
                     Math.sin(t * 16 + this.mockTime * 7) * treble * 0.2;
      this.waveformBuffer[i] = Math.floor((sample + 1) * 127.5);
    }

    // Mock beat detection
    const beatPhase = (this.mockTime * bassFreq) % (Math.PI * 2);
    const detected = beatPhase < 0.2;

    return {
      fft: this.fftBuffer,
      waveform: this.waveformBuffer,
      bands: {
        subBass: bass * 0.9,
        bass,
        mids,
        treble,
      },
      beat: {
        detected,
        confidence: detected ? 0.8 : 0,
      },
      rms: (bass + mids + treble) / 3,
    };
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
