document.addEventListener("DOMContentLoaded", () => {
  // Load Finished Products from GitHub Contents API (public repo required)
  loadFinishedProductsFromGitHub({
    owner: "shumwaynate",
    repo: "corderbuildfix",
    dirPath: "images/KeyPictures",
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
 * Fetches file list from GitHub Contents API and renders up to maxToShow random images
 * from the given directory. Works with any filenames (e.g., "door.jpg", "big room.jpg").
 * Requires the repository to be public.
 */
async function loadFinishedProductsFromGitHub({ owner, repo, dirPath, maxToShow = 4 }) {
  const finishedGrid = document.querySelector(".finished-grid");
  if (!finishedGrid) return;

  finishedGrid.innerHTML = ""; // clear

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(dirPath)}`;

  try {
    const res = await fetch(apiUrl, {
      headers: { "Accept": "application/vnd.github+json" },
      cache: "no-store"
    });

    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const items = await res.json();
    // Filter for image files
    const images = (Array.isArray(items) ? items : [])
      .filter(it => it.type === "file" && /\.(jpe?g|png|webp|gif)$/i.test(it.name));

    if (images.length === 0) {
      const msg = document.createElement("p");
      msg.textContent = "Finished product photos coming soon.";
      finishedGrid.appendChild(msg);
      return;
    }

    // Shuffle and take up to maxToShow
    const selected = shuffle(images).slice(0, Math.min(maxToShow, images.length));

    selected.forEach(file => {
      const img = document.createElement("img");
      // Prefer download_url from API
      img.src = file.download_url;
      img.alt = "Finished product";
      img.loading = "lazy";
      img.decoding = "async";
      finishedGrid.appendChild(img);
    });
  } catch (err) {
    console.error("Failed to load KeyPictures:", err);
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
