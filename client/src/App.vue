<template>
  <div class="app-wrapper">
    <nav class="navbar" :class="{ scrolled }">
      <div class="nav-container">
        <RouterLink :to="authStore.isAuthenticated ? (authStore.isHost ? '/host' : '/bookings') : '/login'" class="logo">
          <AppLogo />
        </RouterLink>

        <!-- Desktop nav links -->
        <div class="nav-links desktop-nav">
          <template v-if="authStore.isAuthenticated">
            <template v-if="authStore.isHost">
              <RouterLink to="/host" class="nav-link">Dashboard</RouterLink>
            </template>
            <template v-else>
              <RouterLink to="/slots" class="nav-link">Reservations</RouterLink>
              <RouterLink to="/bookings" class="nav-link">My Dashboard</RouterLink>
            </template>
            <div class="user-pill">
              <span class="user-name">{{ authStore.user?.name }}</span>
              <button @click="handleLogout" class="logout-btn secondary">Sign Out</button>
            </div>
          </template>
          <template v-else>
            <RouterLink to="/login" class="nav-cta">Sign In</RouterLink>
          </template>
        </div>

        <!-- Mobile hamburger -->
        <div class="mobile-nav-controls">
          <button
            class="hamburger"
            :class="{ open: drawerOpen }"
            @click="drawerOpen = !drawerOpen"
            aria-label="Open menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Drawer Overlay -->
    <transition name="overlay">
      <div v-if="drawerOpen" class="drawer-overlay" @click="drawerOpen = false"></div>
    </transition>

    <!-- Mobile Drawer -->
    <transition name="drawer">
      <div v-if="drawerOpen" class="drawer">
        <div class="drawer-header">
          <AppLogo />
          <button class="drawer-close" @click="drawerOpen = false" aria-label="Close menu">✕</button>
        </div>

        <nav class="drawer-nav">
          <template v-if="authStore.isAuthenticated">
            <div class="drawer-user">
              <div class="drawer-avatar">{{ authStore.user?.name?.charAt(0) }}</div>
              <div>
                <p class="drawer-user-name">{{ authStore.user?.name }}</p>
                <p class="drawer-user-role">{{ authStore.isHost ? 'Restaurant Staff' : 'Guest' }}</p>
              </div>
            </div>
            <div class="drawer-divider"></div>

            <template v-if="authStore.isHost">
              <RouterLink to="/host" class="drawer-link" @click="drawerOpen = false">
                <span class="drawer-icon">🗓️</span> Dashboard
              </RouterLink>
            </template>
            <template v-else>
              <RouterLink to="/slots" class="drawer-link" @click="drawerOpen = false">
                <span class="drawer-icon">🍽️</span> Reserve a Table
              </RouterLink>
              <RouterLink to="/bookings" class="drawer-link" @click="drawerOpen = false">
                <span class="drawer-icon">📊</span> My Dashboard
              </RouterLink>
            </template>

            <div class="drawer-divider"></div>
            <button @click="handleLogout" class="drawer-logout">Sign Out</button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="drawer-link" @click="drawerOpen = false">
              <span class="drawer-icon">🔐</span> Sign In
            </RouterLink>
            <RouterLink to="/login" class="drawer-cta" @click="drawerOpen = false">
              Create Account
            </RouterLink>
          </template>
        </nav>
      </div>
    </transition>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="route" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="footer">
      <div class="footer-inner">
        <AppLogo />
        <span class="footer-copy">&copy; 2026 · Fine Dining Reservations</span>
      </div>
    </footer>

    <!-- Global Toast Stack -->
    <teleport to="body">
      <div class="toast-stack" aria-live="polite">
        <transition-group name="toast-anim" tag="div">
          <div
            v-for="t in toasts"
            :key="t.id"
            class="toast-item"
            :class="t.type"
          >
            <span class="toast-icon">
              {{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ' }}
            </span>
            <span class="toast-msg">{{ t.message }}</span>
            <button class="toast-dismiss" @click="dismiss(t.id)" aria-label="Dismiss">✕</button>
          </div>
        </transition-group>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { RouterView, RouterLink, useRouter, useRoute } from "vue-router";
import { useAuthStore } from "./stores/auth";
import { useToast } from "./composables/useToast";
import AppLogo from "./components/AppLogo.vue";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { toasts, dismiss } = useToast();

// Always dark mode
onMounted(() => document.documentElement.setAttribute('data-theme', 'dark'));

const drawerOpen = ref(false);
const scrolled = ref(false);

// Close drawer on route change
watch(() => route.path, () => { drawerOpen.value = false; });

const handleNavScroll = () => { scrolled.value = window.scrollY > 60; };
onMounted(() => {
  authStore.init();
  window.addEventListener('scroll', handleNavScroll, { passive: true });
});
onUnmounted(() => window.removeEventListener('scroll', handleNavScroll));

const handleLogout = async () => {
  drawerOpen.value = false;
  authStore.logout();
  await router.push("/login");
};
</script>

<style scoped>
.app-wrapper { display: flex; flex-direction: column; min-height: 100vh; }

/* ── Navbar ───────────────────────────────────────────────── */
.navbar {
  height: var(--nav-height);
  background: #6b7280;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-soft);
  position: sticky;
  top: 0;
  z-index: 200;
  transition: height 0.3s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
/* Transparent dark mode when over the homepage hero */
.navbar.hero-nav {
  background: rgba(10, 14, 24, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom-color: rgba(255,255,255,0.08);
}
.navbar.hero-nav .logo { color: #fff; }
.navbar.hero-nav .nav-link { color: rgba(255,255,255,0.75); }
.navbar.hero-nav .nav-link:hover { color: #fff; background: rgba(255,255,255,0.08); }
.navbar.hero-nav .nav-link.router-link-active { color: #fff; background: rgba(255,255,255,0.12); }
.navbar.hero-nav .nav-cta { background: rgba(255,255,255,0.15); color: #fff !important; border: 1px solid rgba(255,255,255,0.3); }
.navbar.hero-nav .nav-cta:hover { background: rgba(255,255,255,0.25); }
.navbar.hero-nav .user-name { color: rgba(255,255,255,0.9); }
.navbar.hero-nav .logout-btn { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.2); }
.navbar.hero-nav .theme-toggle { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
.navbar.scrolled {
  height: 58px;
  background: var(--surface);
  border-bottom-color: var(--border);
  box-shadow: 0 2px 20px rgba(0,0,0,0.08);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  color: #000;
}
.logo:hover { opacity: 0.85; }
/* Turn logo white when over the transparent hero navbar */
.navbar.hero-nav .logo { color: #fff; }

/* Desktop nav */
.desktop-nav { display: flex; align-items: center; gap: 1rem; }

/* Mobile controls (theme + hamburger) — hidden on desktop */
.mobile-nav-controls {
  display: none;
  align-items: center;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .desktop-nav { display: none; }
  .mobile-nav-controls { display: flex; }
}

/* ── Theme Toggle ────────────────────────────────────────── */
.theme-toggle {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  padding: 0;
  box-shadow: var(--shadow-sm);
  transition: background 0.25s, border-color 0.25s, transform 0.2s;
  flex-shrink: 0;
}
.theme-toggle:hover { background: var(--surface-raised); box-shadow: var(--shadow-md); }
.theme-toggle:hover:not(:disabled) { transform: rotate(20deg) scale(1.1); }
.theme-icon { font-size: 1.05rem; line-height: 1; display: block; }

/* ── Hamburger Button ────────────────────────────────────── */
.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 10px;
  width: 42px; height: 42px;
  box-shadow: none;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.hamburger:hover { background: var(--primary-light); border-color: var(--primary); box-shadow: none; transform: none; }
.hamburger:hover:not(:disabled) { transform: none; }
.hamburger span {
  display: block;
  height: 2px;
  background: var(--text-main);
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease, width 0.3s ease;
  transform-origin: center;
}
/* Morph to X when open */
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ── Drawer Overlay ─────────────────────────────────────── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 24, 0.55);
  backdrop-filter: blur(3px);
  z-index: 300;
}
.overlay-enter-active, .overlay-leave-active { transition: opacity 0.3s ease; }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

/* ── Drawer Panel ────────────────────────────────────────── */
.drawer {
  position: fixed;
  top: 0; right: 0;
  width: min(320px, 88vw);
  height: 100dvh;
  background: var(--surface);
  border-left: 1px solid var(--border-soft);
  box-shadow: -8px 0 40px rgba(0,0,0,0.18);
  z-index: 400;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.drawer-enter-active, .drawer-leave-active { transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-soft);
}
/* drawer logo uses AppLogo component — no extra styles needed */
.drawer-close {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  font-size: 1rem;
  padding: 0.35em 0.65em;
  box-shadow: none;
}
.drawer-close:hover { background: var(--primary-light); color: var(--primary); box-shadow: none; transform: none; }
.drawer-close:hover:not(:disabled) { transform: none; }

/* Drawer User Info */
.drawer-user {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.25rem 1.5rem;
}
.drawer-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-heading);
  font-size: 1.1rem; font-weight: 700;
  flex-shrink: 0;
}
.drawer-user-name { font-weight: 600; font-size: 0.95rem; color: var(--text-main); }
.drawer-user-role { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.1rem; }

.drawer-divider { height: 1px; background: var(--border-soft); margin: 0.5rem 0; }

/* Drawer Links */
.drawer-nav { display: flex; flex-direction: column; padding: 0.5rem 0; flex: 1; }

.drawer-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1.5rem;
  color: var(--text-main);
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0;
  transition: background 0.2s, color 0.2s;
}
.drawer-link:hover { background: var(--primary-light); color: var(--primary); }
.drawer-link.router-link-active { color: var(--primary); background: var(--primary-light); font-weight: 600; }
.drawer-icon { font-size: 1.1rem; flex-shrink: 0; }

.drawer-cta {
  display: block;
  margin: 1rem 1.5rem;
  padding: 0.9rem;
  background: var(--primary);
  color: #fff;
  text-align: center;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s;
  text-decoration: none;
}
.drawer-cta:hover { background: var(--primary-hover); color: #fff; }

.drawer-logout {
  margin: 0.5rem 1.5rem;
  padding: 0.75rem;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 8px;
  font-size: 0.9rem;
  box-shadow: none;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.drawer-logout:hover { background: var(--error-light); color: var(--error); border-color: var(--error); box-shadow: none; transform: none; }
.drawer-logout:hover:not(:disabled) { transform: none; }

/* ── Desktop Nav Links ───────────────────────────────────── */
.nav-link {
  color: var(--text-muted);
  font-size: 0.9rem; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.07em;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  transition: all 0.2s;
}
.nav-link:hover { color: var(--secondary); background: var(--secondary-light); }
.nav-link.router-link-active { color: var(--primary); background: var(--primary-light); }

.user-pill {
  display: flex; align-items: center;
  gap: 1rem; margin-left: 0.5rem;
  padding-left: 1.25rem;
  border-left: 1px solid var(--border);
}
.user-name {
  font-family: var(--font-heading);
  font-style: italic; font-weight: 600;
  font-size: 0.95rem; color: var(--secondary);
}
.logout-btn { padding: 0.4em 0.9em; font-size: 0.85rem; }

.nav-cta {
  background: var(--primary);
  color: #fff;
  padding: 0.5em 1.25em;
  border-radius: 6px;
  font-size: 0.9rem; font-weight: 600;
  transition: background 0.2s, transform 0.2s;
  border: 1px solid transparent;
}
.nav-cta:hover { background: var(--primary-hover); transform: translateY(-1px); }

/* ── Content & Footer ───────────────────────────────────── */
.main-content { flex: 1; display: flex; flex-direction: column; }

.footer {
  border-top: 1px solid var(--border-soft);
  background: var(--surface);
  padding: 1.5rem 2rem;
}
.footer-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; justify-content: space-between; align-items: center;
}
/* footer logo uses AppLogo component — no extra styles needed */
.footer-copy { font-size: 0.85rem; color: var(--text-light); }

/* ── Global Toast Stack ─────────────────────────────────── */
.toast-stack {
  position: fixed;
  bottom: 1.75rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  align-items: center;
  z-index: 9999;
  pointer-events: none;
  width: max-content;
  max-width: calc(100vw - 2rem);
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem 0.85rem 1rem;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12);
  pointer-events: all;
  min-width: 240px;
  max-width: 440px;
  backdrop-filter: blur(8px);
}
.toast-item.success { background: linear-gradient(135deg, #276749, #2f8057); }
.toast-item.error   { background: linear-gradient(135deg, #C53030, #a82828); }
.toast-item.warning { background: linear-gradient(135deg, #975A16, #b86e1c); }
.toast-item.info    { background: linear-gradient(135deg, #2b6cb0, #3a7ec4); }

.toast-icon {
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  background: rgba(255,255,255,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}
.toast-msg { flex: 1; line-height: 1.4; }
.toast-dismiss {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  border-radius: 6px;
  padding: 0.2em 0.5em;
  font-size: 0.75rem;
  box-shadow: none;
  flex-shrink: 0;
  opacity: 0.75;
  transition: opacity 0.2s, background 0.2s;
}
.toast-dismiss:hover { opacity: 1; background: rgba(255,255,255,0.3); transform: none; box-shadow: none; }
.toast-dismiss:hover:not(:disabled) { transform: none; }

/* Toast animation */
.toast-anim-enter-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-anim-leave-active { transition: all 0.25s ease; }
.toast-anim-enter-from { opacity: 0; transform: translateY(20px) scale(0.95); }
.toast-anim-leave-to   { opacity: 0; transform: translateY(10px) scale(0.95); }
</style>