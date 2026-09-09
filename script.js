const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");
const navLinks = [...document.querySelectorAll("nav a")];
const sections = [...document.querySelectorAll("main > section")];

menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.textContent = open ? "Close" : "Menu";
});

navLinks.forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.textContent = "Menu";
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.13 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-42% 0px -48%", threshold: 0 });

sections.forEach(section => sectionObserver.observe(section));

const glow = document.querySelector(".cursor-glow");
window.addEventListener("pointermove", event => {
  glow.animate({ left: `${event.clientX}px`, top: `${event.clientY}px` }, { duration: 850, fill: "forwards" });
});

// React Bits SplitText-inspired entrance, adapted to this site's dependency-free stack.
const splitHeading = document.querySelector(".split-heading");
if (splitHeading && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const textNodes = [];
  const collectTextNodes = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) textNodes.push(child);
      else if (child.nodeName !== "BR") collectTextNodes(child);
    });
  };
  collectTextNodes(splitHeading);
  const chars = [];
  textNodes.forEach(textNode => {
    const fragment = document.createDocumentFragment();
    [...textNode.textContent].forEach(character => {
      if (character === " ") {
        fragment.appendChild(document.createTextNode(" "));
        return;
      }
      const span = document.createElement("span");
      span.className = "split-char";
      span.textContent = character;
      chars.push(span);
      fragment.appendChild(span);
    });
    textNode.replaceWith(fragment);
  });
  requestAnimationFrame(() => chars.forEach((char, index) => {
    window.setTimeout(() => char.classList.add("in"), index * 70);
  }));
}

const noteStage = document.querySelector(".project-notes-stage");
const distributeNotes = () => {
  if (!noteStage) return;
  const rect = noteStage.getBoundingClientRect();
  const start = window.innerHeight * .78;
  const end = window.innerHeight * .18;
  const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
  const gap = 10 + progress * (window.innerWidth <= 800 ? 8 : 16);
  noteStage.style.columnGap = `${gap}px`;
  noteStage.style.rowGap = `${gap}px`;
  const cards = [...noteStage.querySelectorAll(".project-note")];
  const stageCenterX = rect.left + rect.width / 2;
  const stageCenterY = rect.top + rect.height / 2;
  const rotations = [-6, 4, -3, 6];
  cards.forEach((card, index) => {
    const cardCenterX = rect.left + card.offsetLeft + card.offsetWidth / 2;
    const cardCenterY = rect.top + card.offsetTop + card.offsetHeight / 2;
    const x = (stageCenterX - cardCenterX) * (1 - progress);
    const y = (stageCenterY - cardCenterY) * (1 - progress);
    const rotation = (1 - progress) * rotations[index];
    const scale = .88 + progress * .12;
    card.style.zIndex = String(progress < .92 ? index + 1 : 1);
    card.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;
  });
};
window.addEventListener("scroll", distributeNotes, { passive: true });
window.addEventListener("resize", distributeNotes);
distributeNotes();

const caseButtons = [...document.querySelectorAll(".case-nav-card")];
const casePanels = [...document.querySelectorAll(".case-panel")];
const closeCasePanel = panel => {
  if (!panel) return;
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("case-open");
};
caseButtons.forEach(button => button.addEventListener("click", () => {
  const panel = document.getElementById(button.dataset.case);
  if (!panel) return;
  casePanels.forEach(otherPanel => closeCasePanel(otherPanel));
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("case-open");
  panel.scrollTop = 0;
  panel.querySelector(".case-close")?.focus();
}));
document.querySelectorAll(".case-close").forEach(button => {
  button.addEventListener("click", () => closeCasePanel(button.closest(".case-panel")));
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeCasePanel(document.querySelector(".case-panel.open"));
});

const circularGallery = document.querySelector(".hobby-carousel");
if (circularGallery) {
  const galleryCards = [...circularGallery.querySelectorAll(".hobby-card")];
  let galleryCurrent = 0;
  let galleryTarget = 0;
  let galleryDragging = false;
  let galleryStartX = 0;
  let galleryStartTarget = 0;
  const renderGallery = () => {
    galleryCurrent += (galleryTarget - galleryCurrent) * .055;
    const spacing = window.innerWidth <= 800 ? 286 : 382;
    const total = spacing * galleryCards.length;
    galleryCards.forEach((card, index) => {
      let x = index * spacing - galleryCurrent;
      x = ((x + total / 2) % total + total) % total - total / 2;
      const normalized = Math.min(1, Math.abs(x) / Math.max(1, circularGallery.clientWidth * .58));
      const y = normalized * normalized * 88;
      const z = -Math.abs(x) * .2;
      const rotate = -x * .035;
      const scale = 1 - normalized * .16;
      card.style.transform = `translate3d(${x}px,${y}px,${z}px) rotateY(${rotate}deg) scale(${scale})`;
      card.style.opacity = String(1 - normalized * .34);
    });
    requestAnimationFrame(renderGallery);
  };
  circularGallery.addEventListener("wheel", event => {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey) {
      event.preventDefault();
      galleryTarget += (event.deltaX || event.deltaY) * .65;
    }
  }, { passive: false });
  circularGallery.addEventListener("pointerdown", event => {
    galleryDragging = true;
    galleryStartX = event.clientX;
    galleryStartTarget = galleryTarget;
    circularGallery.setPointerCapture(event.pointerId);
  });
  circularGallery.addEventListener("pointermove", event => {
    if (!galleryDragging) return;
    galleryTarget = galleryStartTarget + (galleryStartX - event.clientX) * 1.25;
  });
  circularGallery.addEventListener("pointerup", () => { galleryDragging = false; });
  circularGallery.addEventListener("pointercancel", () => { galleryDragging = false; });
  renderGallery();
}

const logoCursor = document.querySelector(".logo-cursor");
const butterflyLayer = document.querySelector(".butterfly-layer");
if (logoCursor && butterflyLayer && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
  let cursorX = -200;
  let cursorY = -200;
  let cursorFrame = 0;
  let lastButterflyX = -200;
  let lastButterflyY = -200;
  let lastButterflyAt = 0;
  const paintCursor = () => {
    logoCursor.style.left = `${cursorX}px`;
    logoCursor.style.top = `${cursorY}px`;
    cursorFrame = 0;
  };
  window.addEventListener("pointermove", event => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    if (!cursorFrame) cursorFrame = requestAnimationFrame(paintCursor);
    const distance = Math.hypot(cursorX - lastButterflyX, cursorY - lastButterflyY);
    const now = performance.now();
    if (distance > 34 && now - lastButterflyAt > 65) {
      const butterfly = document.createElement("span");
      butterfly.className = "butterfly";
      butterfly.style.left = `${cursorX - 10 + Math.random() * 20}px`;
      butterfly.style.top = `${cursorY - 6 + Math.random() * 12}px`;
      butterfly.style.fontSize = `${12 + Math.random() * 9}px`;
      butterflyLayer.appendChild(butterfly);
      window.setTimeout(() => butterfly.remove(), 950);
      lastButterflyX = cursorX;
      lastButterflyY = cursorY;
      lastButterflyAt = now;
    }
  });
}

const hobbyImages = {
  photography: ["photography-01.jpg", "photography-02.jpg"],
  handmade: ["handmade-01.jpg", "handmade-02.jpg", "handmade-03.jpg", "handmade-04.jpg"],
  travel: ["travel-01.jpg", "travel-02.jpg", "travel-03.jpg", "travel-04.jpg"]
};
Object.entries(hobbyImages).forEach(([name, images]) => {
  let imageIndex = 0;
  const targets = [...document.querySelectorAll(`[data-hobby="${name}"] img`)];
  if (!targets.length) return;
  window.setInterval(() => {
    imageIndex = (imageIndex + 1) % images.length;
    targets.forEach(image => image.classList.add("changing"));
    window.setTimeout(() => targets.forEach(image => {
      image.src = `assets/hobbies/${images[imageIndex]}`;
      image.classList.remove("changing");
    }), 260);
  }, 2000);
});

const eventArchive = [
  { title: "新品发布 / 新品鉴赏会", images: ["launch.jpg", "preview-01.jpg", "preview-02.jpg", "preview-03.jpg", "preview-04.jpg", "preview-05.jpg", "preview-06.jpg"] },
  { title: "观影活动", images: ["movie-01.jpg", "movie-02.jpg", "movie-03.jpg"] },
  { title: "锅盖面活动", images: ["noodle-01.jpg", "noodle-02.jpg", "noodle-03.jpg", "noodle-04.jpg", "noodle-05.jpg", "noodle-06.jpg"] },
  { title: "开业活动", images: ["opening-01.jpg", "opening-02.jpg", "opening-03.jpg", "opening-04.jpg"] },
  { title: "年会", images: ["annual-01.png", "annual-02.png"] },
  { title: "圣诞活动", images: ["christmas.jpg"] },
  { title: "小区活动", images: ["community.jpg"] },
  { title: "新年活动", images: ["newyear-01.jpg", "newyear-02.jpg", "newyear-03.jpg"] },
  { title: "活动报价方案", images: ["quotation.png"] }
];
const eventThemeGrid = document.querySelector(".event-theme-grid");
if (eventThemeGrid) {
  eventThemeGrid.innerHTML = eventArchive.map((event, eventIndex) => `
    <article class="event-theme-card" data-event-index="${eventIndex}" data-image-index="0">
      <div class="event-theme-media">
        <img src="assets/events/${event.images[0]}" alt="${event.title} 1" loading="${eventIndex < 3 ? "eager" : "lazy"}">
        ${event.images.length > 1 ? `
          <button class="event-image-prev" type="button" aria-label="${event.title}上一张图片">←</button>
          <button class="event-image-next" type="button" aria-label="${event.title}下一张图片">→</button>` : ""}
      </div>
      <div class="event-theme-caption">
        <b>${event.title}</b>
        <span>${event.images.length > 1 ? `01 / ${String(event.images.length).padStart(2, "0")}` : "单张记录"}</span>
      </div>
    </article>`).join("");

  eventThemeGrid.addEventListener("click", event => {
    const button = event.target.closest(".event-image-prev, .event-image-next");
    if (!button) return;
    const card = button.closest(".event-theme-card");
    const archive = eventArchive[Number(card.dataset.eventIndex)];
    let imageIndex = Number(card.dataset.imageIndex);
    imageIndex = (imageIndex + (button.classList.contains("event-image-next") ? 1 : -1) + archive.images.length) % archive.images.length;
    card.dataset.imageIndex = imageIndex;
    const image = card.querySelector("img");
    image.classList.add("changing");
    window.setTimeout(() => {
      image.src = `assets/events/${archive.images[imageIndex]}`;
      image.alt = `${archive.title} ${imageIndex + 1}`;
      card.querySelector(".event-theme-caption span").textContent = `${String(imageIndex + 1).padStart(2, "0")} / ${String(archive.images.length).padStart(2, "0")}`;
      image.classList.remove("changing");
    }, 130);
  });
}

const designWorks = [
  "product-intro-01.jpg", "coupon-01.jpg", "product-promo-01.jpg",
  "flyer-01.jpg", "collaboration-01.jpg", "event-promo-01.png",
  "event-promo-02.jpg", "event-promo-03.jpg", "offline-ad-01.jpg",
  "offline-ad-02.jpg", "invitation-01.jpg", "invitation-02.jpg",
  "product-intro-02.jpg", "product-intro-03.jpg", "coupon-02a.jpg",
  "coupon-02b.jpg", "flyer-02.jpg", "flyer-03.jpg",
  "collaboration-02.jpg", "event-promo-04.jpg"
];
const designCollage = document.querySelector(".design-collage");
const designBoard = document.querySelector(".design-board");
if (designCollage && designBoard) {
  designCollage.innerHTML = designWorks.map((source, index) =>
    `<button class="design-piece design-piece-${(index % 6) + 1}" type="button" aria-label="查看平面设计作品 ${index + 1}" style="--delay:${index * .045}s"><img src="assets/design/${source}" alt="平面设计作品 ${index + 1}" loading="lazy"></button>`
  ).join("");
  const boardObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        designBoard.classList.add("in-view");
        boardObserver.unobserve(designBoard);
      }
    });
  }, { threshold:.2 });
  boardObserver.observe(designBoard);
  const pieces = [...designCollage.querySelectorAll(".design-piece")];
  pieces.forEach(piece => piece.addEventListener("click", event => {
    event.stopPropagation();
    const willActivate = !piece.classList.contains("is-active");
    pieces.forEach(other => other.classList.remove("is-active"));
    piece.classList.toggle("is-active", willActivate);
  }));
  document.addEventListener("click", event => {
    if (!event.target.closest(".design-piece")) pieces.forEach(piece => piece.classList.remove("is-active"));
  });
}
