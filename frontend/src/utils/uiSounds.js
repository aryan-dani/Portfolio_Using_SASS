function getMasterOutput(audioContext, masterRef) {
  if (masterRef.current) return masterRef.current;

  const master = audioContext.createGain();
  master.gain.value = 0.9;

  const compressor = audioContext.createDynamicsCompressor();
  compressor.threshold.value = -22;
  compressor.knee.value = 18;
  compressor.ratio.value = 2.8;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.12;

  master.connect(compressor);
  compressor.connect(audioContext.destination);
  masterRef.current = master;
  return master;
}

function playTone(audioContext, dest, {
  frequency,
  frequencyEnd,
  start = audioContext.currentTime,
  duration = 0.08,
  gain = 0.08,
  type = "sine",
  attack = 0.004,
  release = 0.06,
}) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (frequencyEnd) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(frequencyEnd, 1), start + duration);
  }

  gainNode.gain.setValueAtTime(0.0001, start);
  gainNode.gain.linearRampToValueAtTime(gain, start + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + release);

  oscillator.connect(gainNode);
  gainNode.connect(dest);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playNoiseBurst(audioContext, dest, {
  start = audioContext.currentTime,
  duration = 0.028,
  gain = 0.035,
  frequency = 2400,
  q = 1.1,
}) {
  const sampleCount = Math.floor(audioContext.sampleRate * duration);
  const buffer = audioContext.createBuffer(1, sampleCount, audioContext.sampleRate);
  const samples = buffer.getChannelData(0);

  for (let i = 0; i < sampleCount; i += 1) {
    const envelope = 1 - i / sampleCount;
    samples[i] = (Math.random() * 2 - 1) * envelope * envelope;
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = q;

  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(gain, start);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(dest);
  source.start(start);
  source.stop(start + duration + 0.01);
}

/** Tactile click - body thump + crisp transient. */
export function playClickSound(audioContext, masterRef) {
  const dest = getMasterOutput(audioContext, masterRef);
  const t = audioContext.currentTime;

  playNoiseBurst(audioContext, dest, { start: t, duration: 0.022, gain: 0.028, frequency: 3200, q: 0.9 });
  playTone(audioContext, dest, {
    frequency: 220,
    frequencyEnd: 140,
    start: t,
    duration: 0.07,
    gain: 0.11,
    type: "sine",
    attack: 0.001,
    release: 0.07,
  });
  playTone(audioContext, dest, {
    frequency: 680,
    frequencyEnd: 520,
    start: t + 0.004,
    duration: 0.035,
    gain: 0.045,
    type: "triangle",
    attack: 0.001,
    release: 0.035,
  });
}

/** Soft hover tick - airy and unobtrusive. */
export function playHoverSound(audioContext, masterRef) {
  const dest = getMasterOutput(audioContext, masterRef);
  const t = audioContext.currentTime;

  playTone(audioContext, dest, {
    frequency: 1040,
    frequencyEnd: 880,
    start: t,
    duration: 0.03,
    gain: 0.018,
    type: "sine",
    attack: 0.002,
    release: 0.028,
  });
  playTone(audioContext, dest, {
    frequency: 1560,
    start: t + 0.006,
    duration: 0.022,
    gain: 0.008,
    type: "sine",
    attack: 0.001,
    release: 0.02,
  });
}

/** Ascending chime for toggles and confirmations. */
export function playSuccessSound(audioContext, masterRef) {
  const dest = getMasterOutput(audioContext, masterRef);
  const t = audioContext.currentTime;
  const notes = [
    { frequency: 523.25, start: 0, duration: 0.14, gain: 0.07 },
    { frequency: 659.25, start: 0.07, duration: 0.16, gain: 0.065 },
    { frequency: 783.99, start: 0.14, duration: 0.2, gain: 0.06 },
  ];

  notes.forEach(({ frequency, start, duration, gain }) => {
    playTone(audioContext, dest, {
      frequency,
      start: t + start,
      duration,
      gain,
      type: "sine",
      attack: 0.006,
      release: duration,
    });
    playTone(audioContext, dest, {
      frequency: frequency * 2,
      start: t + start + 0.008,
      duration: duration * 0.65,
      gain: gain * 0.22,
      type: "sine",
      attack: 0.004,
      release: duration * 0.55,
    });
  });
}

export function playUiSound(audioContext, masterRef, kind) {
  if (kind === "hover") return playHoverSound(audioContext, masterRef);
  if (kind === "success") return playSuccessSound(audioContext, masterRef);
  return playClickSound(audioContext, masterRef);
}
