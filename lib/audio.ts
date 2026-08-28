export type Sfx =
  | "submit"
  | "reject"
  | "tierline"
  | "sink"
  | "land_small"
  | "land_big"
  | "krillion"
  | "miss"
  | "tick"
  | "surface"
  | "blub"
  | "descend";

type ToneOpts = {
  type?: OscillatorType;
  f0: number;
  f1?: number;
  dur: number;
  peak?: number;
  a?: number;
  lp?: number;
  hp?: number;
  delay?: number;
};

type NoiseOpts = {
  dur: number;
  lp?: number;
  hp?: number;
  sweepTo?: number;
  peak?: number;
  delay?: number;
};

class DescentAudio {
  private ac: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  muted = false;

  private ensure(): boolean {
    if (this.muted) return false;
    if (!this.ac) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return false;
      this.ac = new Ctor();
      this.sfxGain = this.ac.createGain();
      this.sfxGain.gain.value = 0.9;
      this.sfxGain.connect(this.ac.destination);
    }
    if (this.ac.state === "suspended") void this.ac.resume();
    return true;
  }

  private env(g: GainNode, t: number, peak: number, attack: number, dur: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  private tone({
    type = "sine",
    f0,
    f1,
    dur,
    peak = 0.2,
    a = 0.006,
    lp,
    delay = 0,
  }: ToneOpts) {
    if (!this.ac || !this.sfxGain) return;
    const t = this.ac.currentTime + delay;
    const osc = this.ac.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    if (f1 !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);

    let node: AudioNode = osc;
    if (lp) {
      const filter = this.ac.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = lp;
      osc.connect(filter);
      node = filter;
    }
    const gain = this.ac.createGain();
    this.env(gain, t, peak, a, dur);
    node.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + dur + 0.1);
  }

  private noise({ dur, lp, hp, sweepTo, peak = 0.15, delay = 0 }: NoiseOpts) {
    if (!this.ac || !this.sfxGain) return;
    const t = this.ac.currentTime + delay;
    const frames = Math.ceil(this.ac.sampleRate * dur);
    const buffer = this.ac.createBuffer(1, frames, this.ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    const src = this.ac.createBufferSource();
    src.buffer = buffer;

    const low = this.ac.createBiquadFilter();
    low.type = "lowpass";
    low.frequency.setValueAtTime(lp ?? 1200, t);
    if (sweepTo) low.frequency.exponentialRampToValueAtTime(Math.max(sweepTo, 20), t + dur);

    let node: AudioNode = low;
    src.connect(low);
    if (hp) {
      const high = this.ac.createBiquadFilter();
      high.type = "highpass";
      high.frequency.value = hp;
      low.connect(high);
      node = high;
    }
    const gain = this.ac.createGain();
    this.env(gain, t, peak, 0.01, dur);
    node.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
    src.stop(t + dur + 0.1);
  }

  private arp(freqs: number[], step: number, dur: number, peak: number, lp?: number) {
    freqs.forEach((f, i) =>
      this.tone({ type: "triangle", f0: f, dur, peak, lp, delay: i * step }),
    );
  }

  play(event: Sfx): void {
    if (!this.ensure()) return;
    switch (event) {
      case "submit":
        this.tone({ f0: 1150, dur: 0.16, a: 0.003, peak: 0.16 });
        break;
      case "reject":
        this.noise({ dur: 0.22, lp: 420, peak: 0.2 });
        this.tone({ f0: 150, f1: 62, dur: 0.36, peak: 0.22, lp: 700 });
        break;
      case "tierline":
        this.tone({ type: "triangle", f0: 780, f1: 1560, dur: 0.07, peak: 0.13, lp: 2500 });
        break;
      case "sink":
        this.tone({ f0: 1150, dur: 0.7, a: 0.01, peak: 0.1 });
        this.noise({ dur: 1.3, lp: 1400, sweepTo: 180, peak: 0.16 });
        this.tone({ f0: 300, f1: 60, dur: 1.3, peak: 0.1 });
        break;
      case "land_small":
        this.tone({ f0: 140, f1: 70, dur: 0.25, peak: 0.28, lp: 600 });
        this.noise({ dur: 0.14, lp: 500, peak: 0.1 });
        break;
      case "land_big":
        this.tone({ f0: 80, f1: 45, dur: 0.6, peak: 0.38 });
        this.noise({ dur: 0.7, lp: 900, sweepTo: 200, peak: 0.18, delay: 0.02 });
        this.tone({ type: "triangle", f0: 523, dur: 0.4, peak: 0.09, delay: 0.15 });
        break;
      case "krillion":
        this.tone({ f0: 60, f1: 40, dur: 1.2, peak: 0.34 });
        this.arp([784, 988, 1175, 1568], 0.13, 0.7, 0.15, 3000);
        this.noise({ dur: 1.4, lp: 2500, hp: 1200, peak: 0.05, delay: 0.3 });
        break;
      case "miss":
        this.tone({ f0: 220, f1: 52, dur: 0.7, peak: 0.24 });
        this.noise({ dur: 0.5, lp: 400, peak: 0.14, delay: 0.05 });
        break;
      case "tick":
        this.tone({ f0: 880, dur: 0.07, peak: 0.16 });
        this.tone({ f0: 880, dur: 0.05, peak: 0.06, delay: 0.12 });
        break;
      case "surface":
        this.noise({ dur: 1.6, lp: 300, sweepTo: 3000, peak: 0.16 });
        this.tone({ f0: 80, f1: 600, dur: 1.5, peak: 0.08 });
        break;
      case "blub": {
        const k = 0.85 + 0.45 * Math.random();
        this.tone({ f0: 260 * k, f1: 720 * k, dur: 0.13, peak: 0.22, lp: 2200 });
        this.noise({ dur: 0.05, lp: 1800, hp: 700, peak: 0.05 });
        break;
      }
      case "descend":
        this.noise({ dur: 1.1, lp: 2000, sweepTo: 240, peak: 0.15 });
        this.tone({ f0: 110, f1: 48, dur: 1.2, peak: 0.32 });
        this.tone({ type: "triangle", f0: 784, dur: 0.5, peak: 0.12, lp: 3000 });
        this.tone({ type: "triangle", f0: 523, dur: 0.75, peak: 0.12, lp: 3000, delay: 0.22 });
        break;
    }
  }
}

let instance: DescentAudio | null = null;

export function getAudio(): DescentAudio {
  return (instance ??= new DescentAudio());
}

export function playSfx(event: Sfx): void {
  getAudio().play(event);
}

export function setMuted(muted: boolean): void {
  getAudio().muted = muted;
}
