# Spin Art Project Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder project-card grid on `projects.html` with a full-page, swipeable carousel navigated by a centered wrapping thumbnail tab strip, starting with a real Spin Art slide.

**Architecture:** A data-driven vanilla JS module (`projects.js`) renders both the tab strip and the slide deck from one `PROJECTS` array. The slide deck is a CSS `scroll-snap` horizontal container (native swipe/trackpad panning, no drag library), with an `IntersectionObserver` syncing the active tab and `scrollIntoView()` handling click-to-jump. `projects.html` plays a one-time CSS entrance animation on load to sell the "pan" from the homepage click.

**Tech Stack:** Plain HTML/CSS/JS, no build step, no dependencies (matches the rest of the site).

**Spec:** [docs/superpowers/specs/2026-08-21-spinart-project-carousel-design.md](../specs/2026-08-21-spinart-project-carousel-design.md)

## Global Constraints

- No external libraries/dependencies — vanilla HTML/CSS/JS only.
- No build step — all files must work opened directly (`file://`) or via a static server; no ES module `import`/bundler syntax.
- No test framework exists in this repo — every task's "test" step is a manual check (browser + devtools console), not an automated test run.
- Reuse the existing color tokens in `style.css`'s `:root` (`--ink`, `--paper`, `--muted`, `--line`, `--accent-code`, `--accent-photo`) where a new rule needs one of these colors; introduce new hex values only for the dark carousel surface (matching the existing `.half-code` dark palette already in `style.css`, e.g. `#101614`, `#e9e7e1`, `#9a9a94`).
- Preserve `.callout` markup/CSS as-is (shared with `photography.html`) — do not rename or remove it.

---

### Task 1: Add the Spin Art hero media asset

**Files:**
- Create: `Project Media/spin-art/hero.png`

**Interfaces:**
- Produces: a file at repo-relative path `Project Media/spin-art/hero.png`, which Task 2's `PROJECTS` data array references via `media.src`.

- [ ] **Step 1: Create the destination folder and copy the temporary hero image**

```bash
mkdir -p "/c/Users/Carte/Desktop/carterhk-site/Project Media/spin-art"
cp "/c/Users/Carte/Documents/Coding/Spin Art/images/Monroe_Spinboard.png" "/c/Users/Carte/Desktop/carterhk-site/Project Media/spin-art/hero.png"
```

- [ ] **Step 2: Verify the file was copied correctly**

```bash
ls -la "/c/Users/Carte/Desktop/carterhk-site/Project Media/spin-art/hero.png"
```

Expected: file exists, size matches the source (`Monroe_Spinboard.png`, ~524KB) — confirms it's not empty or truncated.

- [ ] **Step 3: Commit**

```bash
cd "/c/Users/Carte/Desktop/carterhk-site"
git add "Project Media/spin-art/hero.png"
git commit -m "Add temporary Spin Art hero image"
```

---

### Task 2: Project data model and DOM rendering

**Files:**
- Create: `projects.js`
- Modify: `projects.html` (full rewrite)

**Interfaces:**
- Consumes: `Project Media/spin-art/hero.png` (Task 1).
- Produces: global `PROJECTS` array; `renderTabs(projects)` and `renderSlides(projects)` functions. After rendering, the DOM contains:
  - `#project-tabs` filled with `button.project-tab[data-index="N"]` (plus `.placeholder` class on placeholder entries)
  - `#project-slides` filled with `section.project-slide[data-index="N"]` (plus `.placeholder` class on placeholder entries), each real slide containing a `.slide-content` div with `.slide-tags`, `h2`, `p`, and `a.github-link`.
  - These exact class/data-index names are relied on by Task 3 (CSS) and Task 4 (interactivity).

- [ ] **Step 1: Write `projects.js`**

```js
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
      link.textContent = "GitHub \u2192";
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
```

- [ ] **Step 2: Rewrite `projects.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Code & projects — CarterHK</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body class="project-page-enter">
  <div class="page">
    <div class="page-nav">
      <a class="home" href="index.html">CarterHK</a>
      <a href="photography.html">Photography &amp; art &rarr;</a>
    </div>

    <h1>Code &amp; projects</h1>
    <p class="lede">A few things I've built. Swipe, scroll, or tap a tab below to look through them.</p>
  </div>

  <div id="project-tabs" class="project-tabs"></div>
  <div id="project-slides" class="project-slides"></div>

  <div class="page">
    <div class="callout">
      More on GitHub: <a href="https://github.com/Carterhk" target="_blank" rel="noopener">github.com/Carterhk &rarr;</a>
    </div>
  </div>

  <script src="projects.js"></script>
</body>
</html>
```

- [ ] **Step 3: Verify the DOM renders correctly**

Open `projects.html` directly in a browser (double-click the file, or run `start "" "c:\Users\Carte\Desktop\carterhk-site\projects.html"` from PowerShell). Open devtools console and run:

```js
document.querySelectorAll('.project-tab').length === 3
document.querySelectorAll('.project-slide').length === 3
document.querySelector('.project-slide[data-index="0"]').querySelector('.github-link').href
document.querySelectorAll('.project-tab.placeholder').length === 2
```

Expected: first three checks are `true`; the `href` check prints `"https://github.com/Koehnc/Spin-Art"`. There's no styling yet, so the page will look like unstyled blocks — that's expected at this step.

- [ ] **Step 4: Commit**

```bash
cd "/c/Users/Carte/Desktop/carterhk-site"
git add projects.html projects.js
git commit -m "Render project carousel markup from a data-driven array"
```

---

### Task 3: Carousel and tab-strip styling, entrance animation

**Files:**
- Modify: `style.css`

**Interfaces:**
- Consumes: the exact class names produced by Task 2 (`project-tabs`, `project-tab`, `project-slides`, `project-slide`, `slide-content`, `slide-tags`, `github-link`, `placeholder`, and the `project-page-enter` class on `<body>`).
- Produces: no new interface — this task is purely visual, verified by eye.

- [ ] **Step 1: Remove the now-unused placeholder-grid rules**

In `style.css`, delete these rules (originally lines 162-194): `.projects`, `.project-card`, `.project-card h3`, `.project-card p`, `.tag`. Use the Edit tool with this exact old text:

```css
.projects {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.project-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  background: #fff;
}

.project-card h3 {
  margin: 0 0 0.35rem;
  font-size: 1.1rem;
}

.project-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

.tag {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--muted);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.15rem 0.6rem;
  margin-top: 0.6rem;
}
```

replaced with nothing (delete the block).

- [ ] **Step 2: Append the carousel, tab-strip, and entrance-animation rules to the end of `style.css`**

```css
.project-page-enter {
  animation: slide-in-right 0.5s ease-out;
}

@keyframes slide-in-right {
  from { transform: translateX(40px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.project-tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #0b0f0e;
}

.project-tab {
  width: 56px;
  height: 40px;
  border-radius: 4px;
  border: 2px solid transparent;
  background-color: #3a3f3c;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  padding: 0;
}

.project-tab.active {
  border-color: #7fd9b6;
}

.project-tab.placeholder {
  opacity: 0.6;
  cursor: default;
}

.project-slides {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.project-slides::-webkit-scrollbar {
  display: none;
}

.project-slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
  min-height: 70vh;
  position: relative;
  display: flex;
  align-items: flex-end;
  background-color: #101614;
  background-size: cover;
  background-position: center;
  box-sizing: border-box;
}

.project-slide.placeholder {
  align-items: center;
  justify-content: center;
  color: #6b6a64;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.slide-content {
  position: relative;
  width: 100%;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
  color: #e9e7e1;
  box-sizing: border-box;
}

.slide-tags {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9a9a94;
}

.project-slide h2 {
  margin: 0.4rem 0 0.5rem;
  font-size: 1.6rem;
}

.project-slide p {
  margin: 0 0 0.75rem;
  max-width: 60ch;
  color: #c9c7c1;
  font-size: 0.95rem;
}

.github-link {
  display: inline-block;
  border: 1px solid #4a5551;
  border-radius: 999px;
  padding: 0.35rem 1rem;
  font-size: 0.85rem;
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 3: Verify visually**

Reload `projects.html` in the browser at a desktop width (~1200px). Confirm: the tab strip is centered with a dark background, the first tab shows the Monroe/Spin Art thumbnail, the two placeholder tabs look muted, and the Spin Art slide fills most of the viewport with the image as a background and the title/description/GitHub link readable over a dark gradient at the bottom. Then resize the browser to ~375px wide (or use devtools device toolbar) and confirm the tab strip wraps to a second row instead of overflowing or shrinking unreadably. Reload the page once more and confirm it visibly slides in from the right on load.

- [ ] **Step 4: Commit**

```bash
cd "/c/Users/Carte/Desktop/carterhk-site"
git add style.css
git commit -m "Style the project carousel, tab strip, and page entrance animation"
```

---

### Task 4: Carousel interactivity — active-tab sync and click-to-jump

**Files:**
- Modify: `projects.js`

**Interfaces:**
- Consumes: `.project-tab[data-index]` and `.project-slide[data-index]` DOM contract from Task 2; `.active` class styling from Task 3.
- Produces: `setupActiveTabSync()` (reads tabs/slides from the DOM directly, no parameters), wired into the existing `DOMContentLoaded` listener. No further tasks depend on this.

- [ ] **Step 1: Add the active-tab-sync and click-to-jump function to `projects.js`**

Add this function above the `document.addEventListener("DOMContentLoaded", ...)` block:

```js
function setupActiveTabSync() {
  const slidesContainer = document.getElementById("project-slides");
  const tabs = document.querySelectorAll(".project-tab");
  const slides = document.querySelectorAll(".project-slide");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = entry.target.dataset.index;
          tabs.forEach((tab) => tab.classList.remove("active"));
          const activeTab = document.querySelector(`.project-tab[data-index="${index}"]`);
          if (activeTab) {
            activeTab.classList.add("active");
          }
        }
      });
    },
    { root: slidesContainer, threshold: 0.6 }
  );

  slides.forEach((slide) => observer.observe(slide));

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const index = tab.dataset.index;
      const targetSlide = document.querySelector(`.project-slide[data-index="${index}"]`);
      if (targetSlide) {
        targetSlide.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      }
    });
  });

  if (tabs.length > 0) {
    tabs[0].classList.add("active");
  }
}
```

- [ ] **Step 2: Wire it into the `DOMContentLoaded` listener**

Replace:

```js
document.addEventListener("DOMContentLoaded", () => {
  renderTabs(PROJECTS);
  renderSlides(PROJECTS);
});
```

with:

```js
document.addEventListener("DOMContentLoaded", () => {
  renderTabs(PROJECTS);
  renderSlides(PROJECTS);
  setupActiveTabSync();
});
```

- [ ] **Step 3: Verify interactivity manually**

Reload `projects.html`. Confirm:
- The first (Spin Art) tab shows as active (accent border) on load.
- Scrolling/trackpad-panning or swiping the slide area snaps between the three slides.
- Clicking the second or third tab smoothly scrolls to that placeholder slide, and its tab becomes the active one while the others lose the active border.
- Clicking back to the first tab returns to the Spin Art slide and re-activates it.

- [ ] **Step 4: Full spec verification pass**

With everything in place, re-check the full list from the spec's testing plan at both a desktop width (~1200px) and a mobile width (~375px, via devtools device toolbar):
- Entrance animation plays when navigating from `index.html` to `projects.html` (click "Code & projects" on the homepage).
- Swipe / trackpad / scroll panning moves between slides.
- Clicking a tab jumps to the right slide and updates the active tab.
- Tab strip wraps correctly to a second row at the narrow width.
- Placeholder slides are visibly distinct (muted, "Coming soon", no media/link) from the real Spin Art slide.

- [ ] **Step 5: Commit**

```bash
cd "/c/Users/Carte/Desktop/carterhk-site"
git add projects.js
git commit -m "Add active-tab sync and click-to-jump to the project carousel"
```
