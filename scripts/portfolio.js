document.addEventListener("DOMContentLoaded", () => {
  // ----- Favorite Works (KeyPictures) -----
  initKeyPicturesGallery({
    manifestUrl: "images/KeyPictures/index.json",
    basePath: "images/KeyPictures/"
  });

  // ----- Existing portfolio jobs section (unchanged) -----
  const container = document.getElementById("portfolio-jobs");

  jobs.forEach(job => {
    const card = document.createElement("div");
    card.className = "job-card full-width";

    const title = document.createElement("h3");
    title.textContent = job.name;

    const galleryWrapper = document.createElement("div");
    galleryWrapper.className = "gallery-wrapper";

    const imageContainer = document.createElement("div");
    imageContainer.className = "image-container";

    // Create image element and set to first image
    const img = document.createElement("img");
    img.className = "gallery-image";
    let currentIndex = 0;
    img.src = `images/${job.folder}/${job.images[currentIndex]}`;

    // Create buttons
    const prev = document.createElement("button");
    prev.className = "gallery-nav left";
    prev.textContent = "◀";

    const next = document.createElement("button");
    next.className = "gallery-nav right";
    next.textContent = "▶";

    // Button event handlers
    prev.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + job.images.length) % job.images.length;
      img.src = `images/${job.folder}/${job.images[currentIndex]}`;
    });

    next.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % job.images.length;
      img.src = `images/${job.folder}/${job.images[currentIndex]}`;
    });

    imageContainer.appendChild(prev);
    imageContainer.appendChild(img);
    imageContainer.appendChild(next);

    galleryWrapper.appendChild(imageContainer);

    const desc = document.createElement("p");
    desc.textContent = job.description;

    // Append to card
    card.appendChild(title);
    card.appendChild(galleryWrapper);
    card.appendChild(desc);

    // Append card to container
    container.appendChild(card);
  });
});

/* ========= KeyPictures Gallery (hero contain, blurred sides, rounded) ========= */
function initKeyPicturesGallery({ manifestUrl, basePath }) {
  const stage = document.getElementById("keyStage");
  const dotsWrap = document.getElementById("keyDots");
  const btnPrev = document.querySelector(".key-gallery .prev");
  const btnNext = document.querySelector(".key-gallery .next");

  if (!stage || !btnPrev || !btnNext) return;

  let files = [];
  let order = [];
  let idx = 0;
  let frames = { prev: null, hero: null, next: null };

  fetch(manifestUrl, { cache: "no-store" })
    .then(r => {
      if (!r.ok) throw new Error("Failed to fetch manifest " + r.status);
      return r.json();
    })
    .then(data => {
      files = Array.isArray(data) ? data : Array.isArray(data.files) ? data.files : [];
      files = files.filter(n => /\.(jpe?g|png|webp|gif)$/i.test(n));
      if (files.length === 0) {
        stage.innerHTML = "<p>Gallery coming soon.</p>";
        btnPrev.disabled = btnNext.disabled = true;
        return;
      }
      order = shuffle([...files]); // randomize
      idx = 0;
      render();
    })
    .catch(err => {
      console.error(err);
      stage.innerHTML = "<p>Gallery unavailable right now.</p>";
      btnPrev.disabled = btnNext.disabled = true;
    });

  function render() {
    const n = order.length;
    const cur = order[idx];
    const prv = order[(idx - 1 + n) % n];
    const nxt = order[(idx + 1) % n];

    stage.innerHTML = "";

    const prevEl = makeFrame("prev", prv);
    const heroEl = makeFrame("hero", cur);
    const nextEl = makeFrame("next", nxt);

    prevEl.addEventListener("click", goPrev);
    nextEl.addEventListener("click", goNext);

    stage.appendChild(prevEl);
    stage.appendChild(heroEl);
    stage.appendChild(nextEl);

    frames = { prev: prevEl, hero: heroEl, next: nextEl };

    layoutFrames();
    buildDots();
  }

  function makeFrame(role, fileName) {
    const frame = document.createElement("figure");
    frame.className = "key-frame " + role;

    frame.style.position = "absolute";
    frame.style.top = "0";
    // anchor prev/hero from left 50%, next from right 50%
    if (role === "next") {
      frame.style.right = "50%";
      frame.style.left = "auto";
      frame.style.transform = "translateX(50%)";
    } else {
      frame.style.left = "50%";
      frame.style.right = "auto";
      frame.style.transform = "translateX(-50%)";
    }
    frame.style.margin = "0";
    frame.style.overflow = "hidden";              // clip image to rounded frame
    frame.style.borderRadius = "12px";
    frame.style.willChange = "transform,width,height";

    const img = document.createElement("img");
    img.alt = "Finished product";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = joinURL(basePath, fileName);

    // HERO shows the whole image; SIDES fill and get blurred/dimmed
    img.style.objectFit = (role === "hero") ? "contain" : "cover";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.display = "block";
    img.style.borderRadius = "12px";             // ensure corners render even if GPU compositing
    img.style.opacity = "0";
    img.style.transition = "opacity 180ms ease";

    if (role !== "hero") {
      // subtle blur & dim on the side images
      img.style.filter = "blur(1.5px) brightness(0.92)";
    }

    img.addEventListener("load", () => (img.style.opacity = "1"));
    frame.appendChild(img);
    return frame;
  }

  function layoutFrames() {
    if (!frames.hero) return;

    const stageW = stage.clientWidth;
    const stageH = stage.clientHeight; // from CSS

    // Tunables (bigger gutter so sides never visually cover the hero)
    const DESIRED_HERO_RATIO = 0.78;
    const MAX_HERO_W = 950;
    const SIDE_SCALE = 0.68;     // a hair smaller so rounded corners are clear
    const GUTTER = 36;           // more space around hero

    // Start width & cap so both sides fit
    let heroW = Math.min(Math.round(stageW * DESIRED_HERO_RATIO), MAX_HERO_W);
    const visibilityCap = Math.floor((stageW - 2 * GUTTER) / (1 + SIDE_SCALE));
    heroW = Math.min(heroW, visibilityCap);

    const sideW = Math.round(heroW * SIDE_SCALE);
    const heroH = stageH;
    const sideH = stageH;

    // Size hero
    frames.hero.style.width = heroW + "px";
    frames.hero.style.height = heroH + "px";
    frames.hero.style.zIndex = 3;
    frames.hero.style.opacity = 1;

    // Size sides
    frames.prev.style.width = sideW + "px";
    frames.prev.style.height = sideH + "px";
    frames.next.style.width = sideW + "px";
    frames.next.style.height = sideH + "px";

    // Offsets from the anchor (left:50% for prev/hero, right:50% for next)
    const offset = Math.round(heroW / 2 + GUTTER + sideW / 2);

    // Position:
    // - hero stays centered on left:50% with translateX(-50%) (already set in makeFrame)
    // - prev shifts left by `offset`
    // - next shifts right by `offset` (anchored on right:50%)
    frames.prev.style.transform = `translateX(${-offset}px)`;
    frames.next.style.transform = `translateX(${offset}px)`;

    frames.prev.style.zIndex = 2;
    frames.next.style.zIndex = 2;
    frames.prev.style.cursor = "pointer";
    frames.next.style.cursor = "pointer";
    frames.prev.style.display = "";
    frames.next.style.display = "";
    frames.prev.style.opacity = 1;
    frames.next.style.opacity = 1;
  }

  function goPrev() {
    idx = (idx - 1 + order.length) % order.length;
    render();
  }
  function goNext() {
    idx = (idx + 1) % order.length;
    render();
  }

  btnPrev.addEventListener("click", goPrev);
  btnNext.addEventListener("click", goNext);

  // Keyboard support
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  });

  // Re-layout on resize (debounced via rAF)
  let resizeRAF;
  window.addEventListener("resize", () => {
    if (resizeRAF) cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(layoutFrames);
  });

  function buildDots() {
    dotsWrap.innerHTML = "";
    if (order.length <= 1) return;
    order.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "key-dot" + (i === idx ? " active" : "");
      dot.type = "button";
      dot.addEventListener("click", () => {
        idx = i;
        render();
      });
      dotsWrap.appendChild(dot);
    });
  }
}

/* ===== Helpers ===== */
function shuffle(arr) {
  return arr
    .map(v => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(o => o.v);
}

function joinURL(base, name) {
  if (!base.endsWith("/")) base += "/";
  return base + name.split("/").map(encodeURIComponent).join("/");
}
