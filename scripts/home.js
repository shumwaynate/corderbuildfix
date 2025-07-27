document.addEventListener("DOMContentLoaded", () => {
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
