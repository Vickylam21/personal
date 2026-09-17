(() => {
  const data = window.LIN_DATA || { languageStorageKey: 'lin-language', languages: { zh: '繁中 / EN', en: 'EN / 繁中' } };
  const languageSwitch = document.querySelector('.language-switch');
  const translatableItems = document.querySelectorAll('[data-zh][data-en]');
  let currentLanguage = localStorage.getItem(data.languageStorageKey) || 'zh';

  const applyLanguage = (language) => {
    currentLanguage = language;
    translatableItems.forEach((item) => {
      item.innerHTML = item.dataset[language];
    });
    if (languageSwitch) languageSwitch.textContent = data.languages[language];
    document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en';
    localStorage.setItem(data.languageStorageKey, language);
  };

  if (languageSwitch) {
    languageSwitch.addEventListener('click', () => applyLanguage(currentLanguage === 'zh' ? 'en' : 'zh'));
    applyLanguage(currentLanguage);
  }

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const parallaxItems = document.querySelectorAll('.parallax');
  const namePop = document.querySelector('.name-pop');
  const scrollBook = document.querySelector('.scroll-book');
  const bookPages = document.querySelectorAll('.scroll-book__page');
  const bookPageNumber = document.querySelector('.book-page-number');
  const pageSections = ['#services', '#about', '#contact']
    .map((selector) => document.querySelector(selector))
    .filter(Boolean);
  let ticking = false;

  const updateBook = () => {
    if (!scrollBook) return;
    const scrollDistance = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = window.scrollY / scrollDistance;
    const currentPage = Math.min(3, Math.max(1, Math.ceil(progress * 3)));
    bookPages.forEach((page) => page.classList.toggle('is-current', Number(page.dataset.page) === currentPage));
    if (bookPageNumber) bookPageNumber.textContent = `${String(currentPage).padStart(2, '0')} / 03`;
    scrollBook.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.65);
    if (namePop) namePop.classList.toggle('is-active', pageSections.some((section) => Math.abs(section.getBoundingClientRect().top) < window.innerHeight * 0.16));
  };

  const updateParallax = () => {
    const offset = Math.min(window.scrollY * 0.08, 40);
    parallaxItems.forEach((item) => {
      item.style.transform = item.classList.contains('is-visible') ? `translateY(${offset}px)` : '';
    });
    updateBook();
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
  updateParallax();

  const rainCanvas = document.querySelector('.rain-layer');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!rainCanvas || reducedMotion.matches) return;

  const rainContext = rainCanvas.getContext('2d');
  const rainDrops = [];
  let lastRainTime = 0;

  const resizeRainCanvas = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    rainCanvas.width = window.innerWidth * pixelRatio;
    rainCanvas.height = window.innerHeight * 0.24 * pixelRatio;
    rainCanvas.style.height = `${window.innerHeight * 0.24}px`;
    rainContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const animateRain = (now) => {
    const width = window.innerWidth;
    const height = window.innerHeight * 0.24;
    rainContext.clearRect(0, 0, width, height);
    if (now - lastRainTime > 180) {
      rainDrops.push({
        x: Math.random() * width,
        y: -12,
        length: 18 + Math.random() * 30,
        speed: 0.08 + Math.random() * 0.1,
        born: now,
        life: 1200 + Math.random() * 700,
        lastFrame: now,
      });
      lastRainTime = now;
    }

    rainDrops.forEach((drop) => {
      const age = now - drop.born;
      const progress = age / drop.life;
      drop.y += drop.speed * (now - drop.lastFrame);
      drop.lastFrame = now;
      const opacity = Math.sin(Math.PI * Math.min(progress, 1)) * 0.35;
      const trail = rainContext.createLinearGradient(drop.x, drop.y - drop.length, drop.x, drop.y);
      trail.addColorStop(0, 'rgba(242, 236, 210, 0)');
      trail.addColorStop(1, `rgba(242, 236, 210, ${opacity})`);
      rainContext.beginPath();
      rainContext.strokeStyle = trail;
      rainContext.lineWidth = 0.6;
      rainContext.moveTo(drop.x, drop.y - drop.length);
      rainContext.lineTo(drop.x, drop.y);
      rainContext.stroke();
    });

    for (let index = rainDrops.length - 1; index >= 0; index -= 1) {
      if (now - rainDrops[index].born > rainDrops[index].life || rainDrops[index].y > height + 10) rainDrops.splice(index, 1);
    }
    window.requestAnimationFrame(animateRain);
  };

  resizeRainCanvas();
  window.addEventListener('resize', resizeRainCanvas);
  window.requestAnimationFrame(animateRain);
})();
