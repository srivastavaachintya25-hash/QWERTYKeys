const soundFiles = {
  /* ── Octave 4 ── */
  "C4":  "sounds/C.mp3",
  "C#4": "sounds/Cs.mp3",
  "D4":  "sounds/D.mp3",
  "D#4": "sounds/Ds.mp3",
  "E4":  "sounds/E.mp3",
  "F4":  "sounds/F.mp3",
  "F#4": "sounds/Fs.mp3",
  "G4":  "sounds/G.mp3",
  "G#4": "sounds/Gs.mp3",
  "A4":  "sounds/A.mp3",
  "A#4": "sounds/As.mp3",
  "B4":  "sounds/B.mp3",

    /* ── Octave 5 ── */

"C5": "sounds/C5.mp3",
"C#5": "sounds/Cs5.mp3",
"D5": "sounds/D5.mp3",
"D#5": "sounds/Ds5.mp3",
"E5": "sounds/E5.mp3",
"F5": "sounds/F5.mp3",
"F#5": "sounds/Fs5.mp3",
"G5": "sounds/G5.mp3",
"G#5": "sounds/Gs5.mp3",
"A5": "sounds/A5.mp3",
"A#5": "sounds/As5.mp3",
"B5": "sounds/B5.mp3",
};

const sounds = {};
for (const [note, path] of Object.entries(soundFiles)) {
  const audio = new Audio(path);
  sounds[note] = audio;
}

let masterVolume = 1.0;

const noteLabel = document.getElementById("noteLabel");
let noteLabelTimer = null;

function playSound(note) {
  const audio = sounds[note];
  if (!audio) return;

  audio.volume = masterVolume;
  audio.currentTime = 0;
  audio.play().catch(() => {}); // catch autoplay policy silently

  // Show note name in the display
  noteLabel.textContent = note.replace("#", "♯").replace("4","").replace("5","ₒ");
  noteLabel.classList.add("visible");
  clearTimeout(noteLabelTimer);
  noteLabelTimer = setTimeout(() => noteLabel.classList.remove("visible"), 700);
}

function activateKey(element) {
  element.classList.add("active");
  setTimeout(() => element.classList.remove("active"), 150);
}

const keys = document.querySelectorAll(".key");

keys.forEach(key => {
  key.addEventListener("mousedown", () => {
    const note = key.dataset.note;
    playSound(note);
    activateKey(key);
    if (isRecording) recordNote(note);
  });
});

const heldKeys = new Set();

document.addEventListener("keydown", event => {
  if (event.repeat) return;                         // ignore held-key repeats
  const pressedKey = event.key.toLowerCase();
  if (heldKeys.has(pressedKey)) return;
  heldKeys.add(pressedKey);

  const keyElement = document.querySelector(`[data-key="${pressedKey}"]`);
  if (!keyElement) return;

  const note = keyElement.dataset.note;
  playSound(note);
  activateKey(keyElement);
  if (isRecording) recordNote(note);
});

document.addEventListener("keyup", event => {
  heldKeys.delete(event.key.toLowerCase());
});

document.getElementById("volumeSlider").addEventListener("input", e => {
  masterVolume = parseFloat(e.target.value);
});

const toggleLabelsBtn = document.getElementById("toggleLabels");
const piano           = document.querySelector(".piano");
let labelsVisible     = true;

toggleLabelsBtn.addEventListener("click", () => {
  labelsVisible = !labelsVisible;
  piano.classList.toggle("labels-hidden", !labelsVisible);
  toggleLabelsBtn.textContent = labelsVisible ? "Hide Labels" : "Show Labels";
});

let isRecording     = false;
let recordingStart  = null;
let recordedNotes   = [];          // array of { note, time }
let playbackTimers  = [];          // kept so we can cancel if needed

const recordBtn = document.getElementById("recordBtn");
const stopBtn   = document.getElementById("stopBtn");
const playBtn   = document.getElementById("playBtn");
const clearBtn  = document.getElementById("clearBtn");
const recStatus = document.getElementById("recStatus");

recordBtn.addEventListener("click", () => {
  isRecording    = true;
  recordingStart = performance.now();
  recordedNotes  = [];

  recordBtn.disabled = true;
  stopBtn.disabled   = false;
  playBtn.disabled   = true;
  clearBtn.disabled  = true;

  recordBtn.classList.add("recording");
  recStatus.textContent = "● REC";
});

stopBtn.addEventListener("click", () => {
  isRecording = false;

  recordBtn.disabled = false;
  recordBtn.classList.remove("recording");
  stopBtn.disabled   = true;
  playBtn.disabled   = recordedNotes.length === 0;
  clearBtn.disabled  = recordedNotes.length === 0;

  recStatus.textContent = recordedNotes.length > 0
    ? `${recordedNotes.length} notes saved`
    : "Nothing recorded";
});

function recordNote(note) {
  recordedNotes.push({
    note,
    time: performance.now() - recordingStart
  });
}

playBtn.addEventListener("click", () => {
  if (recordedNotes.length === 0) return;

  // Disable controls during playback
  playBtn.disabled   = true;
  recordBtn.disabled = true;
  clearBtn.disabled  = true;
  recStatus.textContent = "▶ Playing…";

  playbackTimers = recordedNotes.map(({ note, time }) =>
    setTimeout(() => {
      playSound(note);
      // Find the key element and animate it
      const keyEl = document.querySelector(`[data-note="${note}"]`);
      if (keyEl) activateKey(keyEl);
    }, time)
  );

  const totalDuration = recordedNotes[recordedNotes.length - 1].time + 800;
  setTimeout(() => {
    playBtn.disabled   = false;
    recordBtn.disabled = false;
    clearBtn.disabled  = false;
    recStatus.textContent = `${recordedNotes.length} notes saved`;
  }, totalDuration);
});

clearBtn.addEventListener("click", () => {
  recordedNotes  = [];
  playbackTimers.forEach(clearTimeout);
  playbackTimers = [];

  playBtn.disabled  = true;
  clearBtn.disabled = true;
  recStatus.textContent = "";
});

const hamburger  = document.getElementById("hamburger");
const navDrawer  = document.getElementById("navDrawer");
const navOverlay = document.getElementById("navOverlay");

hamburger.addEventListener("click", () => {
  navDrawer.classList.toggle("open");
  navOverlay.classList.toggle("show");
});

function closeDrawer() {
  navDrawer.classList.remove("open");
  navOverlay.classList.remove("show");
}

const sections  = document.querySelectorAll("section[id], div[id]");
const navLinks  = document.querySelectorAll(".nav-link");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove("active"));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add("active");
    }
  });
}, { threshold: 0.3 });

sections.forEach(sec => observer.observe(sec));