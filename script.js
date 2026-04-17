function shopNow() {
  const collection = document.getElementById('collection');
  if (collection) {
    collection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function subscribe(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector('input');
  const button = form.querySelector('button');
  if (!input || !input.value) return;

  button.textContent = '✓';
  input.value = '';
  input.placeholder = 'thank you — a note is on its way';

  setTimeout(() => {
    button.textContent = '→';
    input.placeholder = 'your address';
  }, 3200);
}

document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll(
    '.hero__stage, .hero__body, .products__heading, .card, .about__label, .about__copy, .about__pull'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(i * 80, 520)}ms`;
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('is-visible'));
  }

  document.querySelectorAll('.card__cta').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const label = btn.textContent.trim();
      btn.textContent = 'Added';
      setTimeout(() => { btn.textContent = label; }, 1600);
    });
  });

  const city = document.querySelector('.topbar__city');
  if (city) {
    const cities = [
      'Milano · 14°',
      'Mumbai · 31°',
      'Kyoto · 11°',
      'Paris · 9°',
      'New York · 6°'
    ];
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % cities.length;
      city.style.opacity = '0';
      setTimeout(() => {
        city.textContent = cities[idx];
        city.style.opacity = '1';
      }, 280);
    }, 4200);
    city.style.transition = 'opacity 0.3s ease';
  }
});
