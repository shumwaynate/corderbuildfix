// scanProjects.js
const fs = require("fs");
const path = require("path");

const projectsPath = path.join(__dirname, "images", "Projects");
const outputPath = path.join(__dirname, "scripts", "jobList.js");

let existingJobs = [];

try {
  const existing = fs.readFileSync(outputPath, "utf-8");
  const match = existing.match(/const jobs = (.+);/s);
  if (match) {
    existingJobs = JSON.parse(match[1]);
  }
} catch (err) {
  console.warn("No existing jobList.js found. Creating fresh.");
}

const folders = fs.readdirSync(projectsPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

const jobs = folders.map(folder => {
  const folderPath = path.join(projectsPath, folder);
  const images = fs.readdirSync(folderPath)
    .filter(file => file.toLowerCase().endsWith(".jpg"))
    .sort(); // Alphabetical order for consistent first image

  // Check if there's an existing job for this folder
  const existing = existingJobs.find(j => j.folder === `Projects/${folder}`);

  return {
    name: folder,
    description: existing ? existing.description : `Description for ${folder}`,
    folder: `Projects/${folder}`,
    images
  };
});

const output = `const jobs = ${JSON.stringify(jobs, null, 2)};`;

fs.writeFileSync(outputPath, output);
console.log("✅ jobList.js updated with", jobs.length, "projects.");
