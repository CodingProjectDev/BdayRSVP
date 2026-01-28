// Minimal, comment-light, keeps 100% UI/functionality.
// Assumes firebase + db are initialized globally by index.html/admin.html

const $ = (id) => document.getElementById(id);
const pad = (v) => String(v).padStart(2, "0");

// --- MUSIC CONTROLS ---
const bgMusic = $("bgMusic");
const musicControl = $("musicControl");
let isPlaying = false;
async function playMusic() {
  if (!bgMusic || !musicControl) return;
  try {
    await bgMusic.play();
    isPlaying = true;
    musicControl.classList.add("playing");
    musicControl.classList.remove("paused");
  } catch {}
}
function pauseMusic() {
  if (!bgMusic || !musicControl) return;
  bgMusic.pause();
  isPlaying = false;
  musicControl.classList.remove("playing");
  musicControl.classList.add("paused");
}
function toggleMusic(e) {
  if (e) e.stopPropagation();
  isPlaying ? pauseMusic() : playMusic();
}
document.body.addEventListener(
  "click",
  function autoPlayOnce() {
    playMusic();
    document.body.removeEventListener("click", autoPlayOnce);
  },
  { passive: true },
);
if (musicControl) musicControl.addEventListener("click", toggleMusic);

// --- PAGE SCROLLS ---
const openInviteBtn = $("openInviteBtn"),
  partySection = $("party-section");
if (openInviteBtn && partySection)
  openInviteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    partySection.scrollIntoView({ behavior: "smooth", block: "start" });
    playMusic();
  });

// --- CAROUSEL ---
const carouselTrack = $("carouselTrack"),
  prevBtn = $("carouselPrev"),
  nextBtn = $("carouselNext");
if (carouselTrack && prevBtn && nextBtn) {
  const imgs = Array.from(carouselTrack.querySelectorAll(".carousel-img"));
  let idx = 0,
    autoTimer = null,
    INTERVAL = 3000;
  function show() {
    imgs.forEach((img, i) => (img.style.display = i === idx ? "" : "none"));
  }
  function next() {
    idx = (idx + 1) % imgs.length;
    show();
  }
  function prev() {
    idx = (idx - 1 + imgs.length) % imgs.length;
    show();
  }
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, INTERVAL);
  }
  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }
  if (imgs.length > 0) {
    show();
    startAuto();
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      stopAuto();
      prev();
      startAuto();
    });
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      stopAuto();
      next();
      startAuto();
    });
  }
}

// --- COUNTDOWN ---
const cdDays = $("cd-days"),
  cdHours = $("cd-hours"),
  cdMinutes = $("cd-minutes"),
  cdSeconds = $("cd-seconds");
const eventDate = new Date("2026-12-12T15:00:00");
function updateCountdown() {
  if (!cdDays || !cdHours || !cdMinutes || !cdSeconds) return;
  const now = new Date(),
    diff = Math.max(0, eventDate - now),
    days = Math.floor(diff / 8.64e7),
    hours = Math.floor((diff / 3.6e6) % 24),
    minutes = Math.floor((diff / 6e4) % 60),
    seconds = Math.floor((diff / 1e3) % 60);
  cdDays.textContent = pad(days);
  cdHours.textContent = pad(hours);
  cdMinutes.textContent = pad(minutes);
  cdSeconds.textContent = pad(seconds);
}
updateCountdown();
setInterval(updateCountdown, 1e3);

// --- RSVP FORM (Firebase) ---
const rsvpForm = $("rsvpForm"),
  rsvpName = $("rsvpName"),
  rsvpGuests = $("rsvpGuests"),
  rsvpAtt = $("rsvpAtt"),
  rsvpWish = $("rsvpWish"),
  rsvpSuccess = $("rsvpSuccess");
if (typeof firebase !== "undefined" && typeof db !== "undefined" && rsvpForm)
  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (rsvpName?.value || "").trim(),
      guests = rsvpGuests?.value || "",
      attendance = rsvpAtt?.value || "",
      wish = (rsvpWish?.value || "").trim();
    if (!name) return;
    try {
      await db
        .collection("rsvps")
        .add({
          name,
          guests,
          attendance,
          wish,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      rsvpForm.reset();
      if (rsvpSuccess) {
        rsvpSuccess.textContent = "✅ RSVP sent!";
        setTimeout(() => {
          rsvpSuccess.textContent = "";
        }, 2500);
      }
      playMusic();
    } catch {
      if (rsvpSuccess) {
        rsvpSuccess.textContent = "❌ Error sending RSVP. Please try again!";
        setTimeout(() => {
          rsvpSuccess.textContent = "";
        }, 3500);
      }
    }
  });

// --- PAGE 2→3 SCROLL ---
const goEventBtn = $("goEventBtn"),
  eventSection = $("event-section");
if (goEventBtn && eventSection)
  goEventBtn.addEventListener("click", (e) => {
    e.preventDefault();
    eventSection.scrollIntoView({ behavior: "smooth", block: "start" });
    playMusic();
  });

// --- PETALS BG ---
(function () {
  const bg = document.querySelector(".bg");
  if (!bg) return;
  const layer = document.createElement("div");
  layer.className = "petals-layer";
  layer.setAttribute("aria-hidden", "true");
  bg.insertAdjacentElement("afterend", layer);
  const count = 46,
    rand = (a, b) => Math.random() * (b - a) + a;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    const w = rand(10, 22),
      h = w * rand(1.2, 1.8),
      x = rand(0, 100),
      drift = rand(-14, 14),
      sway = rand(8, 26),
      d = rand(8, 15),
      s = rand(2.8, 5.0),
      delay = -rand(0, d),
      o = rand(0.22, 0.6),
      r = rand(-180, 180),
      blur = rand(0, 1.2);
    p.style.setProperty("--w", `${w}px`);
    p.style.setProperty("--h", `${h}px`);
    p.style.setProperty("--x", `${x}vw`);
    p.style.setProperty("--drift", `${drift}vw`);
    p.style.setProperty("--sway", `${sway}px`);
    p.style.setProperty("--d", `${d}s`);
    p.style.setProperty("--s", `${s}s`);
    p.style.setProperty("--delay", `${delay}s`);
    p.style.setProperty("--o", o.toFixed(2));
    p.style.setProperty("--r", `${r}deg`);
    p.style.setProperty("--b", `${blur}px`);
    layer.appendChild(p);
  }
})();
// --- BALLOONS & HEARTS BG ---
(function () {
  const bg = document.querySelector(".bg");
  if (!bg) return;
  const layer = document.createElement("div");
  layer.className = "fx-layer";
  layer.setAttribute("aria-hidden", "true");
  bg.insertAdjacentElement("afterend", layer);
  const rand = (a, b) => Math.random() * (b - a) + a;
  let balloonCount = 10,
    heartCount = 18;
  for (let i = 0; i < balloonCount; i++) {
    const el = document.createElement("span");
    el.className = "fx-balloon";
    const w = rand(46, 90),
      x = rand(-5, 105),
      drift = rand(-10, 10),
      sway = rand(14, 34),
      d = rand(12, 22),
      s = rand(3.5, 6.5),
      delay = -rand(0, d),
      o = rand(0.3, 0.55);
    el.style.setProperty("--w", `${w}px`);
    el.style.setProperty("--x", `${x}vw`);
    el.style.setProperty("--drift", `${drift}vw`);
    el.style.setProperty("--sway", `${sway}px`);
    el.style.setProperty("--d", `${d}s`);
    el.style.setProperty("--s", `${s}s`);
    el.style.setProperty("--delay", `${delay}s`);
    el.style.setProperty("--o", o.toFixed(2));
    el.style.setProperty("--b", "0px");
    layer.appendChild(el);
  }
  for (let i = 0; i < heartCount; i++) {
    const el = document.createElement("span");
    el.className = "fx-heart";
    const w = rand(16, 34),
      x = rand(-5, 105),
      drift = rand(-14, 14),
      sway = rand(10, 26),
      d = rand(10, 18),
      s = rand(3.0, 5.5),
      delay = -rand(0, d),
      o = rand(0.22, 0.45),
      r = rand(-25, 25);
    el.style.setProperty("--w", `${w}px`);
    el.style.setProperty("--x", `${x}vw`);
    el.style.setProperty("--drift", `${drift}vw`);
    el.style.setProperty("--sway", `${sway}px`);
    el.style.setProperty("--d", `${d}s`);
    el.style.setProperty("--s", `${s}s`);
    el.style.setProperty("--delay", `${delay}s`);
    el.style.setProperty("--o", o.toFixed(2));
    el.style.setProperty("--r", `${r}deg`);
    el.style.setProperty("--b", "0px");
    layer.appendChild(el);
  }
})();
