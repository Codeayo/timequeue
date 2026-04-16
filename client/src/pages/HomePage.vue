<template>
  <div class="home">
    <!-- Cinematic Hero -->
    <div class="hero" ref="heroRef">
      <div class="hero-overlay"></div>
      <div class="hero-center">
        <!-- Live Availability Teaser -->
        <div class="availability-pill fade-up">
          <template v-if="nextSlotLoading">
            <span class="avail-dot loading"></span>
            <span>Checking availability...</span>
          </template>
          <template v-else-if="nextSlot">
            <span class="avail-dot"></span>
            <span>Next available:</span>
            <strong>{{ nextSlotLabel }}</strong>
            <span class="avail-seats">{{ nextSlot.available_capacity }} seat{{ nextSlot.available_capacity !== 1 ? 's' : '' }} left</span>
            <RouterLink :to="authStore.isAuthenticated ? '/slots' : '/login'" class="avail-cta">Reserve →</RouterLink>
          </template>
          <template v-else>
            <span class="avail-dot full"></span>
            <span>No tables available tonight — check back soon</span>
          </template>
        </div>

        <p class="hero-eyebrow fade-up delay-100">Fine Dining · Effortlessly Reserved</p>
        <h1 class="hero-headline fade-up delay-200">Your Table<br><em>Awaits.</em></h1>
        <p class="hero-sub fade-up delay-200">
          DineQueue makes securing your next dining experience completely seamless.<br>
          Choose a time. Book instantly. Let us handle the rest.
        </p>
        <div class="hero-actions fade-up delay-300">
          <RouterLink :to="authStore.isAuthenticated ? '/slots' : '/login'" class="btn-primary-lg">Reserve a Table</RouterLink>
          <a href="#features" class="btn-ghost-lg">Learn More</a>
        </div>
      </div>
      <div class="hero-scroll-hint fade-up delay-300">
        <span>↓</span>
      </div>
    </div>

    <!-- Food Gallery Section -->
    <section class="gallery-section reveal">
      <div class="gallery-header text-center">
        <p class="gallery-eyebrow">A Feast for the Senses</p>
        <h2>Every Dish, a Masterpiece</h2>
        <p class="text-muted">Our kitchen crafts each plate with intention — seasonal ingredients, precise technique, and artful presentation.</p>
      </div>
      <div class="gallery-grid">
        <div class="gallery-item tall" @click="openLightbox(0)">
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format&fit=crop&q=80" alt="Elegant restaurant dining" loading="lazy" />
          <div class="gallery-label">Signature Main</div>
          <div class="gallery-zoom-hint">🔍</div>
        </div>
        <div class="gallery-col">
          <div class="gallery-item" @click="openLightbox(1)">
            <img src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80" alt="Appetizer plating" loading="lazy" />
            <div class="gallery-label">Starter</div>
            <div class="gallery-zoom-hint">🔍</div>
          </div>
          <div class="gallery-item" @click="openLightbox(2)">
            <img src="https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&auto=format&fit=crop&q=80" alt="Dessert" loading="lazy" />
            <div class="gallery-label">Dessert</div>
            <div class="gallery-zoom-hint">🔍</div>
          </div>
        </div>
        <div class="gallery-col">
          <div class="gallery-item" @click="openLightbox(3)">
            <img src="https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800&auto=format&fit=crop&q=80" alt="Pasta dish" loading="lazy" />
            <div class="gallery-label">House Pasta</div>
            <div class="gallery-zoom-hint">🔍</div>
          </div>
          <div class="gallery-item" @click="openLightbox(4)">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80" alt="Fine dining plate" loading="lazy" />
            <div class="gallery-label">Chef's Selection</div>
            <div class="gallery-zoom-hint">🔍</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lightbox -->
    <teleport to="body">
      <transition name="lb-fade">
        <div v-if="lightbox.open" class="lightbox-overlay" @click.self="closeLightbox" @keydown.esc="closeLightbox">
          <button class="lb-close" @click="closeLightbox" aria-label="Close">✕</button>
          <button class="lb-nav lb-prev" @click.stop="prevImage" aria-label="Previous">‹</button>
          <button class="lb-nav lb-next" @click.stop="nextImage" aria-label="Next">›</button>

          <div class="lb-content">
            <transition name="lb-img" mode="out-in">
              <img
                :key="lightbox.index"
                :src="galleryImages[lightbox.index].src"
                :alt="galleryImages[lightbox.index].label"
                class="lb-image"
              />
            </transition>
            <div class="lb-footer">
              <span class="lb-label">{{ galleryImages[lightbox.index].label }}</span>
              <span class="lb-counter">{{ lightbox.index + 1 }} / {{ galleryImages.length }}</span>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Menu Teaser Section -->
    <section class="menu-section reveal">
      <div class="container">
        <div class="menu-header text-center">
          <p class="menu-eyebrow">Our Menu</p>
          <h2>A Selection Worth Savoring</h2>
          <p class="text-muted">A preview of the culinary experience awaiting you. Every ingredient chosen. Every dish perfected.</p>
        </div>
        <div class="menu-grid">
          <div class="menu-card" v-for="dish in dishes" :key="dish.name">
            <div class="menu-card-img">
              <img :src="dish.img" :alt="dish.name" loading="lazy" />
              <span class="menu-tag">{{ dish.tag }}</span>
              <span class="menu-price">{{ dish.price }}</span>
            </div>
            <div class="menu-card-body">
              <div class="menu-card-top">
                <h3>{{ dish.name }}</h3>
                <div class="menu-badges">
                  <span v-for="badge in dish.badges" :key="badge" class="menu-badge">{{ badge }}</span>
                </div>
              </div>
              <p class="menu-card-desc">{{ dish.desc }}</p>
            </div>
            <div class="menu-card-hover">
              <span>🍴 Part of tonight's menu</span>
              <RouterLink :to="authStore.isAuthenticated ? '/slots' : '/login'" class="menu-hover-cta">Reserve →</RouterLink>
            </div>
          </div>
        </div>
        <div class="menu-cta text-center">
          <RouterLink :to="authStore.isAuthenticated ? '/slots' : '/login'" class="btn-primary-lg">Reserve to Experience It</RouterLink>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useScrollReveal } from '../composables/useScrollReveal';
import api from '../api/api';

const authStore = useAuthStore();
useScrollReveal();

// ── Hero Parallax ────────────────────────────────────────
const heroRef = ref(null);
let rafPending = false;

const onScroll = () => {
  if (rafPending) return;
  rafPending = true;
  requestAnimationFrame(() => {
    if (heroRef.value) {
      const offset = window.scrollY * 0.4; // 40% speed = depth feel
      heroRef.value.style.backgroundPositionY = `calc(50% + ${offset}px)`;
    }
    rafPending = false;
  });
};

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener('scroll', onScroll));

// ── Gallery Lightbox ─────────────────────────────────────
const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&auto=format&fit=crop&q=85', label: 'Signature Main' },
  { src: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1400&auto=format&fit=crop&q=85', label: 'Starter' },
  { src: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=1400&auto=format&fit=crop&q=85', label: 'Dessert' },
  { src: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1400&auto=format&fit=crop&q=85', label: 'House Pasta' },
  { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1400&auto=format&fit=crop&q=85', label: "Chef's Selection" },
];

const lightbox = ref({ open: false, index: 0 });

const openLightbox = (i) => {
  lightbox.value = { open: true, index: i };
  document.body.style.overflow = 'hidden';
};
const closeLightbox = () => {
  lightbox.value.open = false;
  document.body.style.overflow = '';
};
const prevImage = () => {
  lightbox.value.index = (lightbox.value.index - 1 + galleryImages.length) % galleryImages.length;
};
const nextImage = () => {
  lightbox.value.index = (lightbox.value.index + 1) % galleryImages.length;
};

const onKeydown = (e) => {
  if (!lightbox.value.open) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  prevImage();
  if (e.key === 'ArrowRight') nextImage();
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));


// Live availability teaser
const nextSlot = ref(null);
const nextSlotLoading = ref(true);

const nextSlotLabel = computed(() => {
  if (!nextSlot.value) return '';
  const d = new Date(nextSlot.value.start_time);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today · ${time}`;
  if (isTomorrow) return `Tomorrow · ${time}`;
  return d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
});

onMounted(async () => {
  try {
    const res = await api.get('slots');
    // find the soonest slot with available capacity
    const available = res.data
      .filter(s => s.available_capacity > 0 && new Date(s.start_time) > new Date())
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    nextSlot.value = available[0] || null;
  } catch {
    nextSlot.value = null;
  } finally {
    nextSlotLoading.value = false;
  }
});

const dishes = [
  {
    tag: 'Starter',
    name: 'Seared Scallops',
    price: '$28',
    badges: ['GF'],
    desc: 'Pan-seared sea scallops with cauliflower purée, crispy capers, and a brown butter vinaigrette.',
    img: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop&q=80'
  },
  {
    tag: 'Main',
    name: 'Filet au Poivre',
    price: '$58',
    badges: ['GF'],
    desc: 'Prime beef tenderloin with a classic peppercorn crust, served with pommes dauphinoise and haricots verts.',
    img: 'https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=600&auto=format&fit=crop&q=80'
  },
  {
    tag: 'Pasta',
    name: 'Black Truffle Tagliatelle',
    price: '$42',
    badges: ['V'],
    desc: 'Hand-rolled egg pasta tossed in a rich Parmigiano cream sauce, shaved with fresh black truffle.',
    img: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&auto=format&fit=crop&q=80'
  },
  {
    tag: 'Dessert',
    name: 'Chocolate Fondant',
    price: '$18',
    badges: ['V', 'GF'],
    desc: 'Warm dark chocolate fondant with a molten centre, paired with Tahitian vanilla ice cream and gold leaf.',
    img: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&auto=format&fit=crop&q=80'
  }
];

</script>

<style scoped>
.home { width: 100%; }

/* Hero */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background-image: url('/hero-image.png');
  background-size: cover;
  background-position: center;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(10, 14, 24, 0.55) 0%, rgba(10, 14, 24, 0.80) 100%);
}
.hero-center {
  position: relative;
  z-index: 2;
  max-width: 820px;
  padding: 2rem;
}

/* Availability Pill */
.availability-pill {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 100px;
  padding: 0.5rem 1.1rem;
  margin-bottom: 2rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}
.avail-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #48BB78;
  box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.5);
  animation: pulse-dot 2s infinite;
  flex-shrink: 0;
}
.avail-dot.loading { background: rgba(255,255,255,0.4); animation: none; }
.avail-dot.full    { background: #FC8181; animation: none; }

@keyframes pulse-dot {
  0%   { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.6); }
  70%  { box-shadow: 0 0 0 7px rgba(72, 187, 120, 0); }
  100% { box-shadow: 0 0 0 0 rgba(72, 187, 120, 0); }
}

.avail-seats {
  background: rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 0.15em 0.6em;
  font-size: 0.78rem;
  font-weight: 600;
  color: #fff;
}
.avail-cta {
  color: #F6E05E;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-decoration: none;
  border-left: 1px solid rgba(255,255,255,0.25);
  padding-left: 0.6rem;
  margin-left: 0.1rem;
  transition: color 0.2s;
}
.avail-cta:hover { color: #fff; }

.hero-eyebrow {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  margin-bottom: 1.5rem;
}
.hero-headline {
  font-size: clamp(3.5rem, 8vw, 6rem);
  color: #fff;
  line-height: 1.05;
  margin-bottom: 1.5rem;
  font-weight: 700;
}
.hero-headline em { font-style: italic; color: #e0c9a6; }

.hero-sub {
  font-size: 1.2rem;
  color: rgba(255,255,255,0.75);
  line-height: 1.7;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.hero-actions { display: flex; gap: 1.25rem; justify-content: center; flex-wrap: wrap; }

.btn-primary-lg {
  background: var(--primary);
  color: #fff;
  padding: 1rem 2.5rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: 0 6px 20px rgba(142,35,35,0.4);
  transition: all 0.3s;
}
.btn-primary-lg:hover { background: var(--primary-hover); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(142,35,35,0.5); }
.btn-primary-lg:visited { color: #fff; }

.btn-ghost-lg {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  color: #fff;
  padding: 1rem 2.5rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  border: 1px solid rgba(255,255,255,0.25);
  transition: all 0.3s;
}
.btn-ghost-lg:hover { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.5); color: #fff; }

.hero-scroll-hint {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.4);
  font-size: 1.5rem;
  animation: bounce 2s infinite;
  z-index: 2;
}
@keyframes bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }

/* Food Gallery */
.gallery-section {
  background: var(--secondary);
  background-image: linear-gradient(135deg, #1A2030 0%, #2A3649 100%);
  padding: 6rem 0 0;
  overflow: hidden;
}

.gallery-header {
  padding: 0 2rem 4rem;
}
.gallery-eyebrow {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  margin-bottom: 1rem;
}
.gallery-header h2 {
  color: #FDFBF7;
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}
.gallery-header .text-muted {
  color: rgba(255,255,255,0.5);
  font-size: 1.05rem;
  max-width: 560px;
  margin: 0 auto;
}

.gallery-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 4px;
  max-height: 680px;
}
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: 1fr 1fr;
    max-height: none;
  }
  .gallery-item.tall { grid-row: auto; }
}

.gallery-col { display: flex; flex-direction: column; gap: 4px; }

.gallery-item {
  position: relative;
  overflow: hidden;
  flex: 1;
  cursor: pointer;
}
.gallery-item.tall { grid-row: span 2; }

.gallery-item img {
  width: 100%;
  height: 100%;
  min-height: 200px;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.4s ease;
  filter: brightness(0.85) saturate(1.1);
}
.gallery-item:hover img {
  transform: scale(1.06);
  filter: brightness(1) saturate(1.2);
}

.gallery-label {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(to top, rgba(10,14,24,0.85), transparent);
  padding: 2rem 1.25rem 1rem;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.gallery-item:hover .gallery-label { opacity: 1; }

/* Gallery clickable + zoom hint */
.gallery-item { cursor: pointer; }
.gallery-zoom-hint {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(0.7);
  font-size: 1.75rem;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}
.gallery-item:hover .gallery-zoom-hint { opacity: 1; transform: translate(-50%, -50%) scale(1); }

/* Lightbox */
.lightbox-overlay {
  position: fixed; inset: 0;
  background: rgba(5, 8, 18, 0.95);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lb-content {
  display: flex; flex-direction: column;
  align-items: center;
  max-width: 90vw; max-height: 90vh;
}
.lb-image {
  max-width: 90vw; max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  display: block;
}
.lb-footer {
  display: flex; justify-content: space-between; align-items: center;
  width: 100%; margin-top: 1rem; padding: 0 0.25rem;
}
.lb-label { color: rgba(255,255,255,0.85); font-size: 0.95rem; font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase; }
.lb-counter { color: rgba(255,255,255,0.4); font-size: 0.85rem; }

.lb-close {
  position: fixed; top: 1.5rem; right: 1.75rem;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; border-radius: 8px;
  width: 44px; height: 44px; font-size: 1rem;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s; box-shadow: none; padding: 0;
}
.lb-close:hover { background: rgba(255,255,255,0.2); transform: none; box-shadow: none; }
.lb-close:hover:not(:disabled) { transform: none; }

.lb-nav {
  position: fixed; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
  color: #fff; border-radius: 50%;
  width: 52px; height: 52px; font-size: 1.8rem; line-height: 1;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s; box-shadow: none; padding: 0;
}
.lb-nav:hover { background: rgba(255,255,255,0.18); transform: translateY(-50%); box-shadow: none; }
.lb-nav:hover:not(:disabled) { transform: translateY(-50%); }
.lb-prev { left: 1.5rem; }
.lb-next { right: 1.5rem; }

/* Lightbox transitions */
.lb-fade-enter-active { transition: opacity 0.3s ease; }
.lb-fade-leave-active { transition: opacity 0.25s ease; }
.lb-fade-enter-from, .lb-fade-leave-to { opacity: 0; }

.lb-img-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.lb-img-leave-active { transition: opacity 0.2s ease; }
.lb-img-enter-from { opacity: 0; transform: scale(0.97); }
.lb-img-leave-to   { opacity: 0; }

/* Testimonials */
.testimonials-section {
  background: var(--background);
  padding: 8rem 0;
  border-top: 1px solid var(--border-soft);
}
.testimonials-header { margin-bottom: 4rem; }
.testimonials-eyebrow {
  font-size: 0.8rem; font-weight: 600; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--primary); margin-bottom: 0.75rem;
}
.testimonials-header h2 { font-size: 2.5rem; margin-bottom: 0.75rem; }

.testimonials-carousel {
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
}
.testi-card {
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: 20px;
  padding: 3.5rem 3rem;
  box-shadow: var(--shadow-lg);
  position: relative;
}
.testi-card::before {
  content: '\201C';
  font-family: var(--font-heading);
  font-size: 8rem;
  line-height: 0;
  position: absolute;
  top: 3.5rem; left: 2.5rem;
  color: var(--primary-light);
  pointer-events: none;
}
.testi-stars { margin-bottom: 1.5rem; }
.star { color: #E8B94F; font-size: 1.1rem; }
.testi-quote {
  font-family: var(--font-heading);
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  font-style: italic;
  color: var(--secondary);
  line-height: 1.7;
  margin-bottom: 2rem;
  font-weight: 400;
}
.testi-author {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}
.testi-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-heading);
  font-size: 1.2rem; font-weight: 700; flex-shrink: 0;
}
.testi-name { font-weight: 600; font-size: 0.95rem; color: var(--secondary); text-align: left; }
.testi-occasion { font-size: 0.82rem; color: var(--text-muted); text-align: left; margin-top: 0.15rem; }

/* Dot nav */
.testi-dots {
  display: flex; justify-content: center; gap: 0.5rem;
  margin-top: 2rem;
}
.testi-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--border);
  border: none; padding: 0;
  box-shadow: none; cursor: pointer;
  transition: background 0.3s, transform 0.3s, width 0.3s;
}
.testi-dot:hover:not(:disabled) { transform: scale(1.3); background: var(--text-muted); }
.testi-dot.active { background: var(--primary); width: 24px; border-radius: 4px; }

/* Testimonial fade transition */
.testi-fade-enter-active { transition: opacity 0.45s ease, transform 0.45s ease; }
.testi-fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.testi-fade-enter-from   { opacity: 0; transform: translateY(12px); }
.testi-fade-leave-to     { opacity: 0; transform: translateY(-8px); }

/* Features */
.features {
  padding: 8rem 0;
  background: var(--background);
}
.features-header { margin-bottom: 5rem; }
.features-header h2 { font-size: 2.5rem; margin-bottom: 0.75rem; }

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
}
.feature-card {
  background: var(--surface);
  border-radius: 16px;
  padding: 3rem 2.5rem;
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-md);
  transition: transform 0.3s, box-shadow 0.3s;
  text-align: center;
}
.feature-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-xl); }

.icon-box {
  width: 72px; height: 72px;
  background: var(--primary-light);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 2.2rem;
  margin: 0 auto 1.75rem;
}
.feature-card h3 { font-size: 1.5rem; margin-bottom: 0.75rem; }
.feature-card p { color: var(--text-muted); line-height: 1.75; }

/* Our Story */
.story-section {
  background: var(--surface);
  padding: 8rem 0;
  border-top: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
}

.story-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4rem;
  align-items: center;
}
@media (min-width: 900px) {
  .story-grid { grid-template-columns: 1fr 1fr; }
}

/* Image Side */
.story-img-wrap {
  position: relative;
}
.story-img {
  width: 100%;
  height: 520px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: var(--shadow-xl);
  display: block;
}
.story-since-badge {
  position: absolute;
  bottom: -1.5rem;
  right: -1.5rem;
  background: var(--primary);
  color: #fff;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(142,35,35,0.35);
  border: 4px solid var(--surface);
}
.since-label { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.75; }
.since-year { font-family: var(--font-heading); font-size: 1.7rem; font-weight: 700; line-height: 1; }

/* Text Side */
.story-content { padding: 1rem 0; }
.story-eyebrow {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 1rem;
}
.story-content h2 {
  font-size: clamp(2rem, 4vw, 2.75rem);
  margin-bottom: 1.5rem;
  line-height: 1.15;
}
.story-content h2 em { font-style: italic; color: var(--primary); }
.story-body {
  color: var(--text-muted);
  font-size: 1.05rem;
  line-height: 1.8;
  margin-bottom: 1.25rem;
}

/* Stats Row */
.story-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}
.stat { display: flex; flex-direction: column; gap: 0.25rem; }
.stat-num {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}
.stat-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; }
.stat-divider { width: 1px; height: 48px; background: var(--border); flex-shrink: 0; }

/* Menu Teaser */
.menu-section {
  background: var(--background);
  padding: 8rem 0;
}
.menu-header {
  margin-bottom: 4.5rem;
}
.menu-eyebrow {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary);
  margin-bottom: 0.75rem;
}
.menu-header h2 { font-size: 2.5rem; margin-bottom: 0.75rem; }
.menu-header .text-muted { font-size: 1.05rem; max-width: 550px; margin: 0 auto; }

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.menu-card {
  background: var(--surface);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-md);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.menu-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.menu-card-img {
  position: relative;
  height: 220px;
  overflow: hidden;
}
.menu-card-img img {
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.menu-card:hover .menu-card-img img { transform: scale(1.08); }
.menu-card { position: relative; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; }
.menu-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

.menu-tag {
  position: absolute;
  top: 1rem; left: 1rem;
  background: rgba(28, 35, 49, 0.85);
  backdrop-filter: blur(6px);
  color: #fff;
  padding: 0.3em 0.85em;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Price pill */
.menu-price {
  position: absolute;
  top: 1rem; right: 1rem;
  background: linear-gradient(135deg, #b7882d, #d4a24c);
  color: #fff;
  padding: 0.3em 0.8em;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
}

.menu-card-body { padding: 1.5rem 1.5rem 1rem; }
.menu-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.menu-card-body h3 {
  font-size: 1.2rem;
  color: var(--secondary);
  flex: 1;
}
.menu-badges { display: flex; gap: 0.4rem; flex-shrink: 0; margin-top: 0.2rem; }
.menu-badge {
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.2em 0.55em;
  border-radius: 4px;
  background: var(--primary-light); color: var(--primary);
  border: 1px solid rgba(139,90,43,0.2);
}
.menu-card-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.65;
}

/* Hover-reveal strip */
.menu-card-hover {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.5rem;
  background: var(--primary-light);
  border-top: 1px solid rgba(139,90,43,0.12);
  font-size: 0.83rem;
  color: var(--primary);
  font-weight: 500;
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.menu-card:hover .menu-card-hover { transform: translateY(0); }
.menu-hover-cta {
  color: var(--primary);
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  border-left: 1px solid rgba(139,90,43,0.3);
  padding-left: 0.75rem;
}
.menu-hover-cta:hover { color: var(--primary-hover); }

.menu-cta { margin-top: 1rem; }
.menu-cta .btn-primary-lg { display: inline-block; }

/* CTA Banner */
.cta-banner {
  background: var(--secondary);
  background-image: linear-gradient(135deg, #1A2030 0%, #2A3649 100%);
  padding: 6rem 2rem;
  color: #fff;
}

.cta-inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3.5rem;
  align-items: center;
}
@media (min-width: 900px) {
  .cta-inner { grid-template-columns: 1fr 1fr; gap: 5rem; }
}

/* Left side */
.cta-left { }
.cta-eyebrow {
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.2em;
  text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 1rem;
}
.cta-banner h2 { color: #fff; font-size: clamp(2rem, 4vw, 2.75rem); margin-bottom: 1rem; line-height: 1.15; }
.cta-banner h2 em { color: #e0c9a6; font-style: italic; }
.cta-sub { color: rgba(255,255,255,0.6); font-size: 1.05rem; margin-bottom: 2rem; line-height: 1.65; }
.light-cta { display: inline-block; box-shadow: 0 6px 20px rgba(0,0,0,0.3); }

/* Right side: newsletter box */
.newsletter-box {
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 20px;
  padding: 2.5rem;
}
.newsletter-label {
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.18em;
  text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 0.75rem;
}
.newsletter-title {
  font-family: var(--font-heading);
  font-size: 1.3rem; font-weight: 600;
  color: #FDFBF7; line-height: 1.4; margin-bottom: 1.75rem;
}

/* Form row */
.newsletter-form { }
.nl-input-row {
  display: flex;
  gap: 0;
  border-radius: 10px;
  overflow: hidden;
  border: 1.5px solid rgba(255,255,255,0.18);
  transition: border-color 0.25s;
}
.nl-input-row:focus-within { border-color: rgba(255,255,255,0.45); }
.nl-input {
  flex: 1; padding: 0.9rem 1.25rem;
  background: rgba(255,255,255,0.08);
  border: none; outline: none;
  font-family: var(--font-body); font-size: 0.95rem;
  color: #fff;
  border-radius: 0;
}
.nl-input::placeholder { color: rgba(255,255,255,0.35); }
.nl-input:disabled { opacity: 0.6; }
.nl-btn {
  background: var(--primary);
  color: #fff; border: none;
  padding: 0.9rem 1.5rem;
  font-size: 0.9rem; font-weight: 600;
  letter-spacing: 0.04em; text-transform: uppercase;
  border-radius: 0; box-shadow: none; flex-shrink: 0;
  transition: background 0.2s;
}
.nl-btn:hover:not(:disabled) { background: var(--primary-hover); transform: none; box-shadow: none; }
.nl-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.nl-error { color: #FC8181; font-size: 0.85rem; margin-top: 0.75rem; }
.nl-disclaimer { color: rgba(255,255,255,0.3); font-size: 0.78rem; margin-top: 0.85rem; }

/* Success state */
.newsletter-success {
  display: flex; align-items: center; gap: 1rem;
  padding: 1.5rem; background: rgba(56,161,105,0.15);
  border: 1px solid rgba(56,161,105,0.3);
  border-radius: 10px;
}
.nl-check {
  width: 44px; height: 44px; border-radius: 50%;
  background: #38A169; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; font-weight: 700; flex-shrink: 0;
}
.nl-success-title { font-weight: 600; color: #fff; font-size: 0.95rem; }
.nl-success-sub { color: rgba(255,255,255,0.55); font-size: 0.85rem; margin-top: 0.2rem; }

/* Newsletter fade transition */
.nl-fade-enter-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.nl-fade-leave-active { transition: opacity 0.2s ease; }
.nl-fade-enter-from   { opacity: 0; transform: translateY(8px); }
.nl-fade-leave-to     { opacity: 0; }
</style>
