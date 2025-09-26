(function () {
  const slide = document.getElementById('moxie-slidein');
  const btnClose = slide.querySelector('.moxie-card__close');
  const LS_KEY = 'moxie_slidein_dismissed_at';
  const COOLDOWN_HOURS = 24;

  function hoursSince(ts) {
    return (Date.now() - ts) / (1000 * 60 * 60);
  }

  function shouldShow() {
    try {
      const ts = Number(localStorage.getItem(LS_KEY) || 0);
      if (!ts) return true;
      return hoursSince(ts) >= COOLDOWN_HOURS;
    } catch (e) {
      return true;
    }
  }

  function openSlide() {
    slide.classList.add('moxie--open');
    slide.setAttribute('aria-hidden', 'false');
  }

  function closeSlide() {
    slide.classList.remove('moxie--open');
    slide.setAttribute('aria-hidden', 'true');
    try { localStorage.setItem(LS_KEY, String(Date.now())); } catch (e) {}
  }

  // Show after 8s or after scrolling halfway
  const delayTimer = setTimeout(() => {
    if (shouldShow()) openSlide();
  }, 8000);

  function onScroll() {
    if (!shouldShow()) return window.removeEventListener('scroll', onScroll);
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH > 0 && scrolled / docH > 0.5) {
      openSlide();
      window.removeEventListener('scroll', onScroll);
      clearTimeout(delayTimer);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Close events
  btnClose.addEventListener('click', closeSlide);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSlide();
  });

  // Watch for form injection
  const obs = new MutationObserver(() => {
    const form = slide.querySelector('form');
    if (form && !form.dataset._moxieBound) {
      form.dataset._moxieBound = '1';
      form.addEventListener('submit', function () {
        setTimeout(closeSlide, 500);
      });
    }
  });
  obs.observe(slide, { childList: true, subtree: true });
})();
