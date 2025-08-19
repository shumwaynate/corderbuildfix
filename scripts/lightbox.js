// Simple site-wide image lightbox
document.addEventListener("DOMContentLoaded", () => {
  // Build the overlay once
  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close">×</button>
    <img class="lightbox-img" alt="">
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector(".lightbox-img");
  const closeBtn = overlay.querySelector(".lightbox-close");

  function openLightbox(src, alt = "") {
    imgEl.src = src;
    imgEl.alt = alt || "";
    overlay.classList.add("open");
    document.documentElement.style.overflow = "hidden"; // lock page scroll
  }
  function closeLightbox() {
    overlay.classList.remove("open");
    imgEl.src = "";
    document.documentElement.style.overflow = ""; // unlock scroll
  }

  // Close handlers
  overlay.addEventListener("click", (e) => {
    // click outside image or on the × closes
    if (e.target === overlay || e.target === closeBtn) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeLightbox();
  });

  // Delegate clicks for *any* image except the header logo
  document.addEventListener("click", (e) => {
    const img = e.target.closest("img");
    if (!img) return;

    // skip the header logo explicitly
    if (img.classList.contains("logo")) return;

    // In the key gallery: only zoom the center (hero) image, not side thumbs
    const keyFrame = img.closest(".key-frame");
    if (keyFrame && !keyFrame.classList.contains("hero")) return;

    // If a nav button was clicked, ignore
    if (e.target.closest(".gallery-nav") || e.target.closest(".key-gallery .nav")) return;

    // Open!
    openLightbox(img.currentSrc || img.src, img.alt || "");
  });
});
