const PROJECTS = [
  {
    id: "spin-art",
    title: "Spin Art",
    tags: ["Python", "OpenCV"],
    description: "Generates string-art by greedily threading a single line across nails around a circle to approximate a source image — includes a weighted-image mode and a Tkinter UI.",
    media: { src: "Project Media/spin-art/hero.png", type: "image" },
    github: "https://github.com/Koehnc/Spin-Art",
    placeholder: false,
  },
  { id: "project-two", title: "Project two", placeholder: true },
  { id: "project-three", title: "Project three", placeholder: true },
];

function renderTabs(projects) {
  const container = document.getElementById("project-tabs");
  projects.forEach((project, index) => {
    const tab = document.createElement("button");
    tab.className = "project-tab" + (project.placeholder ? " placeholder" : "");
    tab.dataset.index = String(index);
    tab.type = "button";
    tab.setAttribute("aria-label", project.title);
    if (!project.placeholder) {
      tab.style.backgroundImage = `url("${project.media.src}")`;
    }
    container.appendChild(tab);
  });
}

function renderSlides(projects) {
  const container = document.getElementById("project-slides");
  projects.forEach((project, index) => {
    const slide = document.createElement("section");
    slide.className = "project-slide" + (project.placeholder ? " placeholder" : "");
    slide.dataset.index = String(index);

    if (project.placeholder) {
      slide.textContent = "Coming soon";
    } else {
      slide.style.backgroundImage = `url("${project.media.src}")`;

      const content = document.createElement("div");
      content.className = "slide-content";

      const tags = document.createElement("span");
      tags.className = "slide-tags";
      tags.textContent = project.tags.join(" · ");
      content.appendChild(tags);

      const heading = document.createElement("h2");
      heading.textContent = project.title;
      content.appendChild(heading);

      const description = document.createElement("p");
      description.textContent = project.description;
      content.appendChild(description);

      const link = document.createElement("a");
      link.className = "github-link";
      link.href = project.github;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "GitHub →";
      content.appendChild(link);

      slide.appendChild(content);
    }

    container.appendChild(slide);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderTabs(PROJECTS);
  renderSlides(PROJECTS);
});
