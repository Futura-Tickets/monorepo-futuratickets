/**
 * Utility functions for user feedback (audio, vibration, etc.)
 */

/**
 * Play success sound when ticket is granted
 */
export const playSuccessSound = (): void => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure success sound (two quick beeps, higher pitch)
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

    // Second beep
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      oscillator2.frequency.value = 1000;
      oscillator2.type = 'sine';

      gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.1);
    }, 100);

  } catch (error) {
    console.error('Error playing success sound:', error);
  }
};

/**
 * Play error sound when ticket is denied
 */
export const playErrorSound = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure error sound (lower pitch, longer duration)
    oscillator.frequency.value = 200; // Hz (lower = more serious)
    oscillator.type = 'sawtooth'; // Harsher sound

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

  } catch (error) {
    console.error('Error playing error sound:', error);
  }
};

/**
 * Vibrate device for success (short vibration)
 */
export const vibrateSuccess = (): void => {
  try {
    if ('vibrate' in navigator) {
      // Two short vibrations for success
      navigator.vibrate([50, 50, 50]);
    }
  } catch (error) {
    console.error('Error vibrating device:', error);
  }
};

/**
 * Vibrate device for error (longer vibration)
 */
export const vibrateError = (): void => {
  try {
    if ('vibrate' in navigator) {
      // One longer vibration for error
      navigator.vibrate(300);
    }
  } catch (error) {
    console.error('Error vibrating device:', error);
  }
};

/**
 * Vibrate device for processing (very short)
 */
export const vibrateProcessing = (): void => {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  } catch (error) {
    console.error('Error vibrating device:', error);
  }
};

/**
 * Combined feedback for success
 */
export const feedbackSuccess = (): void => {
  playSuccessSound();
  vibrateSuccess();
};

/**
 * Combined feedback for error
 */
export const feedbackError = (): void => {
  playErrorSound();
  vibrateError();
};

/**
 * Combined feedback for processing
 */
export const feedbackProcessing = (): void => {
  vibrateProcessing();
};
