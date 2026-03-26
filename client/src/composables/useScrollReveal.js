import { onMounted, onUnmounted } from 'vue';

/**
 * Attaches an IntersectionObserver to all elements with class `.reveal`
 * inside the given root element (defaults to document).
 * When an element enters the viewport it gets the `.visible` class added,
 * triggering the CSS transition defined in style.css.
 *
 * Usage in a page component:
 *   import { useScrollReveal } from '../composables/useScrollReveal';
 *   useScrollReveal();
 */
export function useScrollReveal(selector = '.reveal') {
  let observer = null;

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll(selector).forEach((el) => observer.observe(el));
  });

  onUnmounted(() => {
    if (observer) observer.disconnect();
  });
}
