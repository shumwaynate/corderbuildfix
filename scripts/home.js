document.addEventListener("DOMContentLoaded", () => {
  // Load Finished Products from a local manifest JSON (served by your site)
  loadFinishedProductsFromManifest({
    manifestUrl: "images/KeyPictures/index.json", // same-origin file
    basePath: "images/KeyPictures/",
    maxToShow: 4
  });

  // ----- Existing random jobs section (unchanged) -----
  const container = document.getElementById("random-jobs");
  const shuffled = [...jobs].sort(() => 0.5 - Math.random()).slice(0, 2);

  shuffled.forEach(job => {
    const jobDiv = document.createElement("div");
    jobDiv.className = "job-card";

    // Use the first image in alphabetical order (already sorted in jobList.js)
    const keyImage = job.images.length > 0 ? job.images[0] : null;
    const imagePath = keyImage ? `images/${job.folder}/${keyImage}` : "";

    jobDiv.innerHTML = `
      ${imagePath ? `<img src="${imagePath}" alt="${job.name}" />` : ""}
      <h3>${job.name}</h3>
      <p>${job.description}</p>
    `;

    container.appendChild(jobDiv);
  });
});

/**
 * Loads filenames from a local JSON manifest and renders up to maxToShow random images.
 * Manifest shape:
 * { "files": ["door.jpg", "big room.jpg", "kitchen.png", ...] }
 */
async function loadFinishedProductsFromManifest({ manifestUrl, basePath, maxToShow = 4 }) {
  const finishedGrid = document.querySelector(".finished-grid");
  if (!finishedGrid) return;

  finishedGrid.innerHTML = "";

  try {
    const res = await fetch(manifestUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
    const data = await res.json();

    const files = Array.isArray(data)
      ? data // support plain array too
      : Array.isArray(data.files) ? data.files : [];

    // Filter image-ish files
    const images = files.filter(name => /\.(jpe?g|png|webp|gif)$/i.test(name));

    if (images.length === 0) {
      const msg = document.createElement("p");
      msg.textContent = "Finished product photos coming soon.";
      finishedGrid.appendChild(msg);
      return;
    }

    const selected = shuffle(images).slice(0, Math.min(maxToShow, images.length));

    selected.forEach(name => {
      const img = document.createElement("img");
      img.src = `${basePath}${name}`;
      img.alt = "Finished product";
      img.loading = "lazy";
      img.decoding = "async";
      finishedGrid.appendChild(img);
    });
  } catch (err) {
    console.error("Failed to load Finished Products manifest:", err);
    const msg = document.createElement("p");
    msg.textContent = "Finished product photos unavailable right now.";
    finishedGrid.appendChild(msg);
  }
}

function shuffle(arr) {
  return arr
    .map(v => ({ v, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(o => o.v);
}
