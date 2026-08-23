function setupCodeParticles() {
  const canvas = document.querySelector(".code-particles");
  const container = canvas && canvas.closest(".half-code");
  if (!canvas || !container) return;

  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const PARTICLE_COUNT = 45;
  const LINK_DISTANCE = 120;
  const DOT_COLOR = "127, 217, 182";

  let width = 0;
  let height = 0;
  let particles = [];

  function makeParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
    };
  }

  function resize(newWidth, newHeight) {
    // Reallocating the canvas backing store is expensive; the hover-sway
    // transition fires many resize notifications per animation, most with
    // a sub-pixel or zero-width change, so skip reallocating when the size
    // hasn't meaningfully moved.
    if (Math.abs(newWidth - width) < 1 && Math.abs(newHeight - height) < 1) return;

    width = newWidth;
    height = newHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles.forEach((p) => {
      p.x = Math.min(p.x, width);
      p.y = Math.min(p.y, height);
    });
    while (particles.length < PARTICLE_COUNT) particles.push(makeParticle());
    particles.length = PARTICLE_COUNT;
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          ctx.strokeStyle = `rgba(${DOT_COLOR}, ${0.18 * (1 - dist / LINK_DISTANCE)})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    particles.forEach((p) => {
      ctx.fillStyle = `rgba(${DOT_COLOR}, 0.5)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    if (!reduceMotion) requestAnimationFrame(step);
  }

  // ResizeObserver hands us the new size directly (computed as part of the
  // browser's own layout pass). Using that instead of calling
  // getBoundingClientRect() avoids forcing a synchronous layout read while
  // the hover-sway flex transition is running, which was otherwise
  // flushing pending style/paint work for the whole page (including the
  // photo side's animated glow) into that single frame and causing
  // multi-hundred-ms stalls.
  let resizeScheduled = false;
  let pendingWidth = 0;
  let pendingHeight = 0;

  function handleResize(entries) {
    const entry = entries[0];
    const box = entry.contentBoxSize && entry.contentBoxSize[0];
    pendingWidth = box ? box.inlineSize : entry.contentRect.width;
    pendingHeight = box ? box.blockSize : entry.contentRect.height;

    if (resizeScheduled) return;
    resizeScheduled = true;
    requestAnimationFrame(() => {
      resizeScheduled = false;
      resize(pendingWidth, pendingHeight);
      // Resizing the canvas backing store always clears it. When motion is
      // reduced there's no rAF loop left running to redraw on the next
      // frame, so force one here; the animated loop redraws on its own.
      if (reduceMotion) step();
    });
  }

  const initialRect = container.getBoundingClientRect();
  resize(initialRect.width, initialRect.height);
  new ResizeObserver(handleResize).observe(container);
  step();
}

document.addEventListener("DOMContentLoaded", setupCodeParticles);
