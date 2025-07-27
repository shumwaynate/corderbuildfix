document.addEventListener("DOMContentLoaded", () => {
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
