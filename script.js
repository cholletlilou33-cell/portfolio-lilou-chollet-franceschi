const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
const header = document.querySelector('.header');

menuButton?.addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(opened));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const revealSelector = [
  '.section-label', '.intro-grid', '.interests', '.event-passion-heading',
  '.event-mosaic', '.event-quote', '.journey-heading', '.timeline-item',
  '.project-intro', '.gala-details', '.gala-gallery', '.gala-takeaway', '.alternance-heading',
  '.alternance-subnav', '.venue-card', '.future-project', '.alternance-afterword',
  '.press-heading', '.press-body', '.press-card', '.press-solera-gallery', '.press-links',
  '.experience-intro', '.experience-card', '.experience-photo-carousel', '.bijoux-gallery',
  '.gala-steps li', '.first-jobs', '.contact-grid', '.media-reel-heading',
  '.campaign-wall-heading'
].join(', ');

const revealItems = [...document.querySelectorAll(revealSelector)];
document.querySelectorAll('.venue-grid, .press-cards, .timeline, .experience-list').forEach((group) => {
  [...group.children].forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 75}ms`);
  });
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  revealItems.forEach((item) => {
    item.dataset.reveal = '';
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const updateScrollChrome = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
  document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
  header?.classList.toggle('is-scrolled', window.scrollY > 36);
};

document.querySelectorAll('.campaign-lane-track').forEach((track) => {
  const firstSet = track.querySelector('.campaign-lane-set');
  if (!firstSet || track.querySelector('[aria-hidden="true"]')) return;
  const clone = firstSet.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  clone.querySelectorAll('img').forEach((img) => img.setAttribute('alt', ''));
  track.append(clone);
});

const horizontalReel = document.querySelector('[data-horizontal-reel]');
let reelDistance = 0;
let reelStart = 0;
let reelEnabled = false;
const updateHorizontalReel = () => {
  if (!horizontalReel || !reelEnabled) return;
  const reelTrack = horizontalReel.querySelector('[data-reel-track]');
  if (!reelTrack) return;
  const progress = Math.max(0, Math.min(reelDistance, window.scrollY - reelStart));
  reelTrack.style.transform = `translate3d(${-progress}px, 0, 0)`;
  horizontalReel.style.setProperty('--reel-progress', `${reelDistance ? (progress / reelDistance) * 100 : 0}%`);
};

const configureHorizontalReel = () => {
  if (!horizontalReel) return;
  const reelIntro = horizontalReel.querySelector('.media-reel-intro');
  const reelSticky = horizontalReel.querySelector('.media-reel-sticky');
  const reelTrack = horizontalReel.querySelector('[data-reel-track]');
  const desktop = window.matchMedia('(min-width: 761px)').matches && !reduceMotion;
  if (!reelIntro || !reelSticky || !reelTrack || !desktop) {
    reelEnabled = false;
    horizontalReel.classList.remove('reel-ready');
    horizontalReel.style.height = '';
    reelTrack && (reelTrack.style.transform = '');
    return;
  }
  horizontalReel.classList.add('reel-ready');
  reelTrack.style.transform = 'translate3d(0,0,0)';
  reelDistance = Math.max(0, reelTrack.scrollWidth - reelSticky.clientWidth);
  const stickyTop = Number.parseFloat(getComputedStyle(reelSticky).top) || 76;
  horizontalReel.style.height = `${reelIntro.offsetHeight + reelSticky.offsetHeight + reelDistance}px`;
  reelStart = window.scrollY + horizontalReel.getBoundingClientRect().top + reelIntro.offsetHeight - stickyTop;
  reelEnabled = reelDistance > 0;
  updateHorizontalReel();
};

const tiltTargets = document.querySelectorAll('.reel-card, .campaign-frame, .linkedin-cover');
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  tiltTargets.forEach((target) => {
    target.addEventListener('pointermove', (event) => {
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      target.style.setProperty('--tilt-x', `${-y * 4}deg`);
      target.style.setProperty('--tilt-y', `${x * 6}deg`);
    });
    target.addEventListener('pointerleave', () => {
      target.style.setProperty('--tilt-x', '0deg');
      target.style.setProperty('--tilt-y', '0deg');
    });
  });
}

let scrollFrame = 0;
window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    updateScrollChrome();
    updateHorizontalReel();
    scrollFrame = 0;
  });
}, { passive: true });
updateScrollChrome();
configureHorizontalReel();
window.addEventListener('resize', configureHorizontalReel, { passive: true });

document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const counter = carousel.querySelector('[data-carousel-count]');
  if (!track || !counter) return;

  const updateCounter = () => {
    const slides = [...track.children];
    const current = Math.min(slides.length, Math.round(track.scrollLeft / track.clientWidth) + 1);
    counter.textContent = `${String(current).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  };

  carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', () => {
    track.scrollBy({ left: -track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  carousel.querySelector('[data-carousel-next]')?.addEventListener('click', () => {
    track.scrollBy({ left: track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  track.addEventListener('scroll', updateCounter, { passive: true });
  window.addEventListener('resize', updateCounter, { passive: true });
  updateCounter();
});

const anchoredLinks = [...document.querySelectorAll('.nav a[href^="#"], .alternance-subnav a[href^="#"]')];
const linkTargets = [...new Set(anchoredLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean))];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      anchoredLinks.forEach((link) => {
        if (document.querySelector(link.getAttribute('href')) === entry.target) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });
  }, { rootMargin: '-38% 0px -52% 0px' });
  linkTargets.forEach((section) => sectionObserver.observe(section));
}
