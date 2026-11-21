const loader = document.querySelector("#loader");
const memorial = document.querySelector("#memorial");
const progress = document.querySelector("#loader-progress");
const enterButton = document.querySelector("#enter-button");
const loaderStatus = document.querySelector("#loader-status");
const slidesHost = document.querySelector("#slides");
const emptyState = document.querySelector("#empty-state");
const galleryCaption = document.querySelector("#gallery-caption");
const memoryLabel = document.querySelector("#memory-label");
const memoryDescription = document.querySelector("#memory-description");
const galleryControls = document.querySelector("#gallery-controls");
const slideCount = document.querySelector("#slide-count");
const localPreviewBanner = document.querySelector("#local-preview-banner");
const mediaUpload = document.querySelector("#media-upload");
const captionsUpload = document.querySelector("#captions-upload");
const englishCaption = document.querySelector("#english-caption");
const spanishCaption = document.querySelector("#spanish-caption");
const audio = document.querySelector("#song-audio");
const playButton = document.querySelector("#play-button");
const playerStatus = document.querySelector("#player-status");
const timeline = document.querySelector("#timeline");
const currentTime = document.querySelector("#current-time");
const duration = document.querySelector("#duration");

let memories = [];
let activeMemory = 0;
let playbackTimeline = [];
let captionCues = [];
let temporaryUrls = [];
let previewIsTemporary = false;

function enterHommage() {
  if (memorial.hidden) {
    memorial.hidden = false;
    loader.classList.add("is-leaving");
    window.setTimeout(() => loader.remove(), 900);
  }
}

window.requestAnimationFrame(() => {
  progress.style.width = "100%";
});
window.setTimeout(() => {
  loaderStatus.textContent = "El recuerdo está listo.";
  enterButton.classList.add("is-visible");
}, 1050);
window.setTimeout(enterHommage, 2050);
enterButton.addEventListener("click", enterHommage);

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function showCaptionForTime() {
  const cue = captionCues.find((item) => audio.currentTime >= item.start && audio.currentTime < item.end);
  if (!cue) {
    englishCaption.textContent = captionCues.length
      ? ""
      : "English captions will appear here when an authorized transcript is added.";
    spanishCaption.textContent = captionCues.length
      ? ""
      : "Aquí aparecerá la traducción sincronizada cuando agregues una letra autorizada.";
    return;
  }
  englishCaption.textContent = cue.en;
  spanishCaption.textContent = cue.es;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${rest}`;
}

function validateCues(value) {
  if (!value || !Array.isArray(value.cues)) throw new Error("El archivo debe tener una lista «cues».");
  return value.cues
    .filter((cue) => Number.isFinite(cue.start) && Number.isFinite(cue.end) && cue.end > cue.start)
    .map((cue) => ({ start: cue.start, end: cue.end, en: safeText(cue.en), es: safeText(cue.es) }))
    .filter((cue) => cue.en || cue.es)
    .sort((a, b) => a.start - b.start);
}

async function loadBundledCaptions() {
  try {
    const response = await fetch("./captions.json", { cache: "no-store" });
    if (!response.ok) return;
    captionCues = validateCues(await response.json());
    showCaptionForTime();
  } catch {
    // Empty cues keep the bilingual placeholder visible until a caption file is provided.
  }
}

captionsUpload.addEventListener("change", async () => {
  const file = captionsUpload.files?.[0];
  if (!file) return;
  try {
    captionCues = validateCues(JSON.parse(await file.text()));
    playerStatus.textContent = captionCues.length ? "SUBTÍTULOS CARGADOS" : "SIN LÍNEAS DE SUBTÍTULO";
    showCaptionForTime();
  } catch (error) {
    playerStatus.textContent = "ARCHIVO NO VÁLIDO";
    englishCaption.textContent = "Choose a JSON caption file with timed English and Spanish lines.";
    spanishCaption.textContent = "Revisa que el archivo tenga el formato indicado en captions.json.";
    console.warn("Could not read caption file:", error);
  }
  captionsUpload.value = "";
});

function mediaKind(item) {
  if (item.type === "video" || /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(item.src)) return "video";
  return "image";
}

function buildPlaybackTimeline() {
  if (memories.length === 0 || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    playbackTimeline = [];
    return;
  }

  const totalDuration = audio.duration;
  const videoLength = memories.reduce((sum, item) => {
    if (mediaKind(item) !== "video") return sum;
    return sum + Math.max(0, Number(item.durationSec) || 0);
  }, 0);
  const videoScale = videoLength > totalDuration ? totalDuration / videoLength : 1;
  const stillCount = memories.filter((item) => mediaKind(item) !== "video").length;
  const stillDuration = stillCount
    ? Math.max(0, totalDuration - videoLength * videoScale) / stillCount
    : 0;
  let cursor = 0;

  playbackTimeline = memories.map((item) => {
    const itemDuration = mediaKind(item) === "video"
      ? (Math.max(0, Number(item.durationSec) || 0) * videoScale)
      : stillDuration;
    const segment = { start: cursor, end: cursor + itemDuration, duration: itemDuration };
    cursor = segment.end;
    return segment;
  });

  if (playbackTimeline.length > 0) {
    playbackTimeline[playbackTimeline.length - 1].end = totalDuration;
    playbackTimeline[playbackTimeline.length - 1].duration = totalDuration - playbackTimeline[playbackTimeline.length - 1].start;
  }
}

function syncActiveVideo(video, index) {
  const segment = playbackTimeline[index];
  if (!segment || !(video instanceof HTMLVideoElement)) return;

  const offset = Math.max(0, audio.currentTime - segment.start);
  if (Number.isFinite(video.duration) && video.duration > 0) {
    const boundedOffset = Math.min(offset, Math.max(0, video.duration - 0.04));
    if (Math.abs(video.currentTime - boundedOffset) > 0.7) video.currentTime = boundedOffset;
  }

  if (audio.paused || audio.ended || index !== activeMemory) {
    video.pause();
  } else {
    const playback = video.play();
    if (playback && typeof playback.catch === "function") playback.catch(() => {});
  }
}

function syncSlideshow() {
  if (memories.length === 0) return;
  if (playbackTimeline.length !== memories.length) buildPlaybackTimeline();
  if (playbackTimeline.length !== memories.length) return;

  const time = Math.max(0, audio.currentTime);
  let index = playbackTimeline.findIndex((segment) => time >= segment.start && time < segment.end);
  if (index < 0) index = time >= audio.duration ? memories.length - 1 : 0;
  if (activeMemory !== index) {
    activeMemory = index;
    renderMemory();
  }

  const video = slidesHost.querySelector("video.slide-video");
  if (video) syncActiveVideo(video, activeMemory);
}

function selectMemory(index) {
  if (memories.length === 0) return;
  activeMemory = (index + memories.length) % memories.length;
  const segment = playbackTimeline[activeMemory];
  if (segment && Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = Math.min(segment.start + 0.02, Math.max(0, audio.duration - 0.02));
    syncSlideshow();
  } else {
    renderMemory();
  }
}

function clearRenderedMedia() {
  slidesHost.querySelectorAll(".slide-media").forEach((element) => element.remove());
}

function renderMemory() {
  clearRenderedMedia();
  if (memories.length === 0) {
    emptyState.hidden = false;
    galleryCaption.hidden = true;
    galleryControls.hidden = true;
    localPreviewBanner.hidden = true;
    return;
  }

  emptyState.hidden = true;
  galleryCaption.hidden = false;
  galleryControls.hidden = memories.length < 2;
  localPreviewBanner.hidden = !previewIsTemporary;
  const item = memories[activeMemory];
  const media = document.createElement(mediaKind(item) === "video" ? "video" : "img");
  media.className = `slide-media ${mediaKind(item) === "video" ? "slide-video" : ""}`;
  media.src = item.src;
  if (media instanceof HTMLImageElement) {
    media.alt = safeText(item.alt) || "Recuerdo de Tzolkin";
    media.decoding = "async";
  } else {
    media.playsInline = true;
    media.controls = false;
    media.preload = "auto";
    media.muted = true;
    media.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(media.duration) && media.duration > 0) {
        item.durationSec = media.duration;
        buildPlaybackTimeline();
        syncSlideshow();
      }
    }, { once: true });
  }
  slidesHost.prepend(media);
  memoryLabel.textContent = item.label || "RECUERDO DE TZOLKIN";
  memoryDescription.textContent = safeText(item.caption);
  slideCount.textContent = `${String(activeMemory + 1).padStart(2, "0")} / ${String(memories.length).padStart(2, "0")}`;
}

async function loadBundledMedia() {
  try {
    const response = await fetch("./media/manifest.json", { cache: "no-store" });
    if (!response.ok) return;
    const manifest = await response.json();
    if (Array.isArray(manifest.items)) memories = manifest.items.filter((item) => item && typeof item.src === "string");
  } catch {
    // The empty memorial screen is the intended first-run state.
  }
  renderMemory();
  buildPlaybackTimeline();
  syncSlideshow();
}

function openMediaPicker() {
  mediaUpload.click();
}

document.querySelector("#choose-media-empty").addEventListener("click", openMediaPicker);
document.querySelector("#choose-media-top").addEventListener("click", openMediaPicker);

mediaUpload.addEventListener("change", () => {
  const files = Array.from(mediaUpload.files || []);
  if (files.length === 0) return;
  temporaryUrls.forEach((url) => URL.revokeObjectURL(url));
  temporaryUrls = files.map((file) => URL.createObjectURL(file));
  memories = files.map((file, index) => ({
    type: file.type.startsWith("video/") ? "video" : "image",
    src: temporaryUrls[index],
    alt: file.name,
    label: file.type.startsWith("video/") ? "VIDEO DE TZOLKIN" : "FOTOGRAFÍA DE TZOLKIN",
    caption: "",
    durationSec: 0,
  }));
  activeMemory = 0;
  previewIsTemporary = true;
  buildPlaybackTimeline();
  renderMemory();
  mediaUpload.value = "";
});

document.querySelector("#previous-memory").addEventListener("click", () => {
  selectMemory(activeMemory - 1);
});
document.querySelector("#next-memory").addEventListener("click", () => {
  selectMemory(activeMemory + 1);
});

document.addEventListener("keydown", (event) => {
  if (memorial.hidden || memories.length < 2 || event.target instanceof HTMLInputElement) return;
  if (event.key === "ArrowLeft") document.querySelector("#previous-memory").click();
  if (event.key === "ArrowRight") document.querySelector("#next-memory").click();
});

audio.addEventListener("loadedmetadata", () => {
  duration.textContent = formatTime(audio.duration);
  timeline.disabled = false;
  playerStatus.textContent = "PISTA DISPONIBLE";
  buildPlaybackTimeline();
  syncSlideshow();
});
audio.addEventListener("timeupdate", () => {
  currentTime.textContent = formatTime(audio.currentTime);
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    timeline.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
  }
  showCaptionForTime();
  syncSlideshow();
});
audio.addEventListener("play", () => {
  playButton.classList.add("is-playing");
  playButton.setAttribute("aria-label", "Pausar");
  syncSlideshow();
});
audio.addEventListener("pause", () => {
  playButton.classList.remove("is-playing");
  playButton.setAttribute("aria-label", "Reproducir");
  syncSlideshow();
});
audio.addEventListener("seeked", syncSlideshow);
audio.addEventListener("error", () => {
  playButton.disabled = true;
  playerStatus.textContent = "AUDIO NO DISPONIBLE";
  englishCaption.textContent = "The audio file could not be opened on this device.";
  spanishCaption.textContent = "No se pudo abrir la pista de audio en este dispositivo.";
});

playButton.addEventListener("click", async () => {
  if (audio.paused) {
    try {
      await audio.play();
    } catch {
      playerStatus.textContent = "NO SE PUDO INICIAR EL AUDIO";
    }
  } else {
    audio.pause();
  }
});

timeline.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(timeline.value) / 1000) * audio.duration;
    syncSlideshow();
  }
});

loadBundledMedia();
loadBundledCaptions();
