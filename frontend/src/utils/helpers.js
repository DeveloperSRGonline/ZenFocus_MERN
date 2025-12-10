import { useRef } from 'react';

// --- Time Utilities ---
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const parseTime = (input) => {
  if (!input) return null;
  const clean = input.toString().toLowerCase().trim();
  const match = clean.match(/^(\d{1,2})(?::(\d{1,2}))?\s*([ap]m)?$/);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  let m = match[2] ? parseInt(match[2], 10) : 0;
  const mod = match[3];
  if (h > 23 || m > 59) return null;
  if (mod) {
    if (mod === 'pm' && h < 12) h += 12;
    if (mod === 'am' && h === 12) h = 0;
  }
  return { h, m };
};

export const formatTimeToString = (h, m) => {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

export const calculateDuration = (startStr, endStr) => {
  const start = parseTime(startStr);
  const end = parseTime(endStr);
  if (!start || !end) return 0;
  let diffInMinutes = (end.h * 60 + end.m) - (start.h * 60 + start.m);
  if (diffInMinutes < 0) diffInMinutes += 24 * 60;
  return diffInMinutes / 60;
};

// --- Mobile Drag Utility ---
export const useMobileDrag = (onDrop) => {
  const timeoutRef = useRef(null);
  const ghostRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e, taskId, data) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    const target = e.currentTarget;

    timeoutRef.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);

      const rect = target.getBoundingClientRect();
      const ghost = target.cloneNode(true);
      ghost.style.position = 'fixed';
      ghost.style.left = `${rect.left}px`;
      ghost.style.top = `${rect.top}px`;
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      ghost.style.opacity = '0.9';
      ghost.style.zIndex = '9999';
      ghost.style.pointerEvents = 'none';
      ghost.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
      ghost.style.transform = 'scale(1.05)';
      ghost.style.transition = 'none';
      ghost.classList.add('dragging-ghost');

      document.body.appendChild(ghost);
      ghostRef.current = ghost;

      const handleTouchMove = (moveEvent) => {
        if (moveEvent.cancelable) moveEvent.preventDefault();
        const t = moveEvent.touches[0];
        ghost.style.left = `${t.clientX - (rect.width / 2)}px`;
        ghost.style.top = `${t.clientY - (rect.height / 2)}px`;
      };

      const handleTouchEnd = (endEvent) => {
        const t = endEvent.changedTouches[0];
        ghost.style.display = 'none';
        const dropTarget = document.elementFromPoint(t.clientX, t.clientY);
        ghost.remove();

        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        ghostRef.current = null;

        const dropZone = dropTarget?.closest('[data-drop-zone]');
        if (dropZone) {
          onDrop(taskId, dropZone.dataset.dropValue, dropZone.dataset.dropZone);
        }
      };

      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);

    }, 300);
  };

  const handleTouchEndOrMove = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchEndOrMove,
    onTouchEnd: handleTouchEndOrMove
  };
};
// --- Custom Sound Utility (IndexedDB) ---
const DB_NAME = 'zenfocus_db';
const STORE_NAME = 'custom_sounds';

export const saveCustomSound = (file) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(file, 'timer_end_sound');
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject('Save failed');
    };
    request.onerror = () => reject('DB Error');
  });
};

export const getCustomSound = () => {
  return new Promise((resolve) => { // resolving null on error is fine for our use case
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('timer_end_sound');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    };
    request.onerror = () => resolve(null);
  });
};

export const deleteCustomSound = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete('timer_end_sound');
      tx.oncomplete = () => resolve(true);
    };
  });
};

// --- Audio Engine ---
export const AudioEngine = {
  ctx: null,
  node: null,
  init: () => {
    if (!AudioEngine.ctx) {
      AudioEngine.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  toggleNoise: (isPlaying) => {
    if (!AudioEngine.ctx) AudioEngine.init();
    const ctx = AudioEngine.ctx;
    if (isPlaying) {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (0 + white * 0.02) / 1.02;
        output[i] *= 3.5;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.5;
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();
      AudioEngine.node = { source: noise, gain: gainNode };
    } else {
      if (AudioEngine.node) {
        AudioEngine.node.source.stop();
        AudioEngine.node.source.disconnect();
        AudioEngine.node = null;
      }
    }
  },
  playPing: async () => {
    // Try custom sound first
    try {
      const customFile = await getCustomSound();
      if (customFile) {
        const audioURL = URL.createObjectURL(customFile);
        const audio = new Audio(audioURL);
        audio.play().catch(e => console.error("Audio play failed", e));
        return;
      }
    } catch (e) {
      console.error("Custom sound check failed", e);
    }

    // Fallback to oscillator
    if (!AudioEngine.ctx) AudioEngine.init();
    const ctx = AudioEngine.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 1);
    osc.stop(ctx.currentTime + 1);
  }
};

export const sendNotification = async (title, body) => {
  AudioEngine.playPing();

  if (Notification.permission === "granted") {
    try {
      // Try using Service Worker for better mobile support
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, {
          body,
          icon: '/favicon.ico',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          tag: 'timer-notification'
        });
        return;
      }
    } catch (e) {
      console.warn("Service Worker notification failed, falling back to basic API", e);
    }

    // Fallback
    try {
      new Notification(title, { body, icon: '/favicon.ico' });
    } catch (e) {
      console.error("Notification API failed", e);
    }
  }
};