# Spin Art project carousel — design

Date: 2026-08-21
Status: approved (pending implementation plan)

## Summary

Replace the static placeholder-card grid on `projects.html` with a full-page,
swipeable carousel of project slides, navigable via a centered wrapping
thumbnail tab strip. First real slide: Spin Art (Python string-art generator,
`github.com/Koehnc/Spin-Art`). Two existing placeholder projects stay as
"coming soon" slides, untouched otherwise.

## Motivation

The current `projects.html` is a plain list of three placeholder cards. The
site's owner wants each project to get a full, visually rich showcase page —
photos/GIFs, a short writeup, a GitHub link — reachable by panning or by
clicking a thumbnail tab, similar in spirit to how `index.html` already
splits into `photography.html` and `projects.html`.

## Navigation & transition

- Clicking "Code & projects" on `index.html` still does a normal browser
  navigation to `projects.html` (no SPA/client-side router — out of scope).
- `projects.html` plays a one-time CSS entrance animation on load (slide in
  from the right) so the click feels like a continuation of the pan, without
  restructuring the site's multi-page architecture.

## Carousel mechanics

- Horizontal scroll container with `scroll-snap-type: x mandatory`; each
  slide is `scroll-snap-align: start`, full viewport width.
- Browser handles swipe/trackpad/momentum natively — no hand-rolled drag
  physics.
- A `IntersectionObserver` watches which slide is in view and syncs the
  active state on the tab strip.
- Clicking a tab calls `scrollIntoView({behavior:'smooth', inline:'start'})`
  on the corresponding slide.
- Rejected alternatives: manual `translateX` + pointer-event dragging (more
  code, re-implements momentum/touch handling by hand); a carousel library
  like Swiper.js (adds the site's first external dependency for something
  CSS already does well at this scale).

## Data model

New `projects.js`, a single array of project objects:

```js
const PROJECTS = [
  {
    id: "spin-art",
    title: "Spin Art",
    tags: ["Python", "OpenCV"],
    description: "Generates string-art by greedily threading a single line "
      + "across nails around a circle to approximate a source image — "
      + "includes a weighted-image mode and a Tkinter UI.",
    media: { src: "Project Media/spin-art/hero.png", type: "image" },
    github: "https://github.com/Koehnc/Spin-Art",
    placeholder: false,
  },
  { id: "project-two", title: "Project two", placeholder: true },
  { id: "project-three", title: "Project three", placeholder: true },
];
```

`projects.js` renders both the tab strip and the slide container from this
array on page load. Adding a future project is one object; no markup
changes needed. `media.type` distinguishes image vs. GIF only for future
use (e.g. autoplay controls) — today both render via a plain `<img>`,
which handles either format identically.

## Markup & styling

- `projects.html` keeps its existing shell (page-nav, `<h1>`, lede) and adds
  two empty containers (`#project-tabs`, `#project-slides`) populated by
  `projects.js`.
- Tab strip: centered, `flex-wrap: wrap`, one small thumbnail per real
  project (cropped from its hero media) or a plain muted swatch for
  placeholders; active tab gets an accent-colored border.
- Real slide: full-bleed hero `<img>` background, bottom gradient scrim,
  overlaid eyebrow tag / title / description / "GitHub →" link — matches
  the approved mockup (Option A: thumbnail tabs, centered + wrapping;
  overlay-on-image hero treatment).
- Placeholder slide: muted full-page card, "coming soon" label, no media,
  no GitHub link, distinct styling from real slides.
- `style.css`: remove the now-unused `.projects` / `.project-card` / `.tag`
  grid rules — confirmed none are referenced outside `projects.html`
  (`.callout` is shared with `photography.html` and stays); add tab-strip,
  slide, scrim, and entrance-animation rules.

## Spin Art content specifics

- Description: adapted from the project's `README.md` (see summary above).
- Hero media: temporary placeholder is `Monroe_Spinboard.png` from the
  Spin Art project's `images/` folder, copied into this repo at
  `Project Media/spin-art/hero.png` (mirrors the existing `Home Page
  Media/` convention). The site owner is designing a custom hero
  image/GIF per project separately; this file is swappable later by
  replacing the asset and, if the format changes, updating `media.src`/
  `media.type` in `projects.js`.
- Link: `https://github.com/Koehnc/Spin-Art`.

## Out of scope

- Any change to `photography.html` or `index.html` beyond what's needed for
  the entrance-animation feel.
- Building out "Project two" / "Project three" with real content.
- A true single-page-app pan (no page reload) — explicitly deferred; the
  animated-page-load approach was chosen instead.
- An in-page gallery/thumbnail-swap for multiple images per project (one
  hero image/GIF per project for now).

## Testing / verification plan

No test framework in this static site; verification is manual, via the
`run` skill's dev server, checked at both a desktop and a mobile-width
viewport:

- Entrance animation plays on navigating from `index.html`.
- Swipe / trackpad / scroll panning moves between slides.
- Clicking a tab jumps to the right slide and updates the active tab.
- Tab strip wraps correctly to a second row at narrow widths.
- Placeholder slides render visibly distinct from the real Spin Art slide.
