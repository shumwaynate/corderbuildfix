document.addEventListener("DOMContentLoaded", () => {
  // ----- Favorite Works (KeyPictures) -----
  initKeyPicturesGallery({
    manifestUrl: "images/KeyPictures/index.json",
    basePath: "images/KeyPictures/"
  });

  // ----- Existing portfolio jobs section (unchanged from your version) -----
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

/* ========= KeyPictures Gallery ========= */
function initKeyPicturesGallery({ manifestUrl, basePath }) {
  const stage = document.getElementById("keyStage");
  const dotsWrap = document.getElementById("keyDots");
  const btnPrev = document.querySelector(".key-gallery .prev");
  const btnNext = document.querySelector(".key-gallery .next");

  if (!stage || !btnPrev || !btnNext) return;

  let files = [];
  let order = [];
  let idx = 0;

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
      order = shuffle([...files]); // randomize order
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
    const prev = order[(idx - 1 + n) % n];
    const next = order[(idx + 1) % n];

    stage.innerHTML = "";

    const prevEl = makeFrame("prev", prev);
    const heroEl = makeFrame("hero", cur);
    const nextEl = makeFrame("next", next);

    prevEl.addEventListener("click", goPrev);
    nextEl.addEventListener("click", goNext);

    stage.appendChild(prevEl);
    stage.appendChild(heroEl);
    stage.appendChild(nextEl);

    buildDots();
  }

  function makeFrame(role, fileName) {
    const frame = document.createElement("figure");
    frame.className = "key-frame " + role;
    const img = document.createElement("img");
    img.src = basePath + fileName;
    img.alt = "Finished product";
    img.loading = "lazy";
    img.decoding = "async";
    frame.appendChild(img);
    return frame;
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

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
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

function shuffle(arr) {
  return arr
    .map(v => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(o => o.v);
}
