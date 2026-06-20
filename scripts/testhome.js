document.addEventListener("DOMContentLoaded", async () => {
  const projectData = getProjectData();

  initNavigation();

  await initHeroFromKeyPictures({
    manifestUrl: "images/KeyPictures/index.json",
    basePath: "images/KeyPictures/"
  });

  renderScrollingProjects(projectData);
  setIntroImage(projectData);
  setCurrentYear();
});

/**
 * Uses the jobs array created by jobList.js.
 */
function getProjectData() {
  if (
    typeof jobs !== "undefined" &&
    Array.isArray(jobs) &&
    jobs.length > 0
  ) {
    return jobs;
  }

  console.warn("No projects were found in jobList.js.");
  return [];
}

/**
 * Builds a safe URL for a project image.
 */
function projectImagePath(job, imageName) {
  const encodedFolder = String(job.folder || "")
    .split("/")
    .map(part => encodeURIComponent(part))
    .join("/");

  return `images/${encodedFolder}/${encodeURIComponent(imageName)}`;
}

/**
 * Builds a safe URL for an image listed in a manifest.
 */
function joinImageUrl(basePath, fileName) {
  const normalizedBase = basePath.endsWith("/")
    ? basePath
    : `${basePath}/`;

  const encodedFileName = String(fileName)
    .split("/")
    .map(part => encodeURIComponent(part))
    .join("/");

  return `${normalizedBase}${encodedFileName}`;
}

/**
 * Controls the mobile navigation.
 */
function initNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    toggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });

  nav.addEventListener("click", event => {
    const link = event.target.closest("a");

    if (!link) {
      return;
    }

    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

/**
 * Loads the hero images only from:
 * images/KeyPictures/index.json
 *
 * The number of slides is completely dynamic.
 */
async function initHeroFromKeyPictures({
  manifestUrl,
  basePath
}) {
  const hero = document.querySelector(".hero");
  const slidesWrap = document.getElementById("hero-slides");
  const dotsWrap = document.getElementById("hero-dots");
  const previousButton = document.getElementById("hero-prev");
  const nextButton = document.getElementById("hero-next");
  const controls = document.querySelector(".hero-controls");

  if (
    !hero ||
    !slidesWrap ||
    !dotsWrap ||
    !previousButton ||
    !nextButton ||
    !controls
  ) {
    return;
  }

  slidesWrap.innerHTML = "";
  dotsWrap.innerHTML = "";

  let imageFiles = [];

  try {
    const response = await fetch(manifestUrl, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        `Could not load KeyPictures manifest: ${response.status}`
      );
    }

    const manifest = await response.json();

    const files = Array.isArray(manifest)
      ? manifest
      : Array.isArray(manifest.files)
        ? manifest.files
        : [];

    imageFiles = files.filter(fileName => {
      return /\.(jpe?g|png|webp|gif)$/i.test(fileName);
    });
  } catch (error) {
    console.error(error);
  }

  if (imageFiles.length === 0) {
    controls.hidden = true;
    hero.classList.add("hero-without-images");
    return;
  }

  hero.classList.remove("hero-without-images");

  let currentIndex = 0;
  let timerId = null;

  imageFiles.forEach((fileName, index) => {
    const slide = document.createElement("div");

    slide.className =
      index === 0
        ? "hero-slide active"
        : "hero-slide";

    const image = document.createElement("img");
    image.src = joinImageUrl(basePath, fileName);
    image.alt = `Featured Corder Build & Fix project ${index + 1}`;
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = "async";

    slide.appendChild(image);
    slidesWrap.appendChild(slide);

    const dot = document.createElement("button");

    dot.type = "button";
    dot.className =
      index === 0
        ? "hero-dot active"
        : "hero-dot";

    dot.setAttribute(
      "aria-label",
      `Show featured image ${index + 1}`
    );

    dot.addEventListener("click", () => {
      showSlide(index);
      restartTimer();
    });

    dotsWrap.appendChild(dot);
  });

  const slides = [
    ...slidesWrap.querySelectorAll(".hero-slide")
  ];

  const dots = [
    ...dotsWrap.querySelectorAll(".hero-dot")
  ];

  /*
   * When there is only one image, there is no need
   * to show navigation controls or start a timer.
   */
  controls.hidden = slides.length <= 1;

  function showSlide(index) {
    currentIndex =
      (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle(
        "active",
        slideIndex === currentIndex
      );
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle(
        "active",
        dotIndex === currentIndex
      );
    });
  }

  function stopTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer() {
    stopTimer();

    if (slides.length <= 1) {
      return;
    }

    timerId = window.setInterval(() => {
      showSlide(currentIndex + 1);
    }, 6500);
  }

  function restartTimer() {
    startTimer();
  }

  previousButton.addEventListener("click", () => {
    showSlide(currentIndex - 1);
    restartTimer();
  });

  nextButton.addEventListener("click", () => {
    showSlide(currentIndex + 1);
    restartTimer();
  });

  /*
   * Pause the rotation while someone is looking
   * closely at the hero or using its controls.
   */
  hero.addEventListener("mouseenter", stopTimer);
  hero.addEventListener("mouseleave", startTimer);

  hero.addEventListener("focusin", stopTimer);
  hero.addEventListener("focusout", startTimer);

  startTimer();
}

/**
 * Creates a continuously moving project gallery.
 *
 * Every project is included, but only the first
 * image listed for each project is shown.
 */
function renderScrollingProjects(projectData) {
  const viewport = document.getElementById("project-grid");

  if (!viewport) {
    return;
  }

  viewport.innerHTML = "";
  viewport.classList.add("project-marquee");

  const visibleProjects = projectData.filter(job => {
    return (
      Array.isArray(job.images) &&
      job.images.length > 0
    );
  });

  if (visibleProjects.length === 0) {
    const message = document.createElement("p");
    message.textContent = "Project photos are coming soon.";
    viewport.appendChild(message);
    return;
  }

  const track = document.createElement("div");
  track.className = "project-track";

  /*
   * More projects create a longer animation duration,
   * keeping the movement at a comfortable speed.
   */
  const animationSeconds = Math.max(
    36,
    visibleProjects.length * 10
  );

  track.style.setProperty(
    "--project-scroll-time",
    `${animationSeconds}s`
  );

  const firstSet = createProjectSet(
    visibleProjects,
    false
  );

  /*
   * A duplicate set is needed to make the movement
   * loop without showing an empty space.
   */
  const duplicateSet = createProjectSet(
    visibleProjects,
    true
  );

  track.append(
    firstSet,
    duplicateSet
  );

  viewport.appendChild(track);
}

/**
 * Builds one complete row of project cards.
 */
function createProjectSet(projectData, isDuplicate) {
  const set = document.createElement("div");
  set.className = "project-set";

  if (isDuplicate) {
    set.setAttribute("aria-hidden", "true");
  }

  projectData.forEach(job => {
    const card = document.createElement("article");
    card.className = "project-card scrolling-project-card";

    const image = document.createElement("img");

    /*
     * Only the first image from each project is used.
     */
    image.src = projectImagePath(
      job,
      job.images[0]
    );

    image.alt = isDuplicate
      ? ""
      : `${job.name} completed project`;

    image.loading = "lazy";
    image.decoding = "async";

    const content = document.createElement("div");
    content.className = "project-card-content";

    const label = document.createElement("span");
    label.textContent = "Completed Project";

    const title = document.createElement("h3");
    title.textContent = job.name;

    content.append(
      label,
      title
    );

    card.append(
      image,
      content
    );

    set.appendChild(card);
  });

  return set;
}

/**
 * Uses the kitchen project for the About image
 * when a kitchen project exists.
 */
function setIntroImage(projectData) {
  const image = document.getElementById("intro-image");

  if (!image) {
    return;
  }

  const preferredProject = projectData.find(job => {
    return (
      String(job.name)
        .toLowerCase()
        .includes("kitchen") &&
      Array.isArray(job.images) &&
      job.images.length > 0
    );
  });

  const fallbackProject = projectData.find(job => {
    return (
      Array.isArray(job.images) &&
      job.images.length > 0
    );
  });

  const selectedProject =
    preferredProject || fallbackProject;

  if (!selectedProject) {
    return;
  }

  image.src = projectImagePath(
    selectedProject,
    selectedProject.images[0]
  );

  image.alt =
    `${selectedProject.name} project by Corder Build & Fix`;
}

/**
 * Updates the footer year automatically.
 */
function setCurrentYear() {
  const year = document.getElementById("current-year");

  if (year) {
    year.textContent =
      String(new Date().getFullYear());
  }
}