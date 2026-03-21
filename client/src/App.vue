<template>
  <div class="app-wrapper">
    <!-- Navbar with Glassmorphism -->
    <nav class="navbar text-center">
      <div class="nav-container">
        <div class="brand">
          <RouterLink to="/" class="logo">DineQueue</RouterLink>
        </div>
        
        <div class="nav-links">
          <template v-if="authStore.isAuthenticated">
            <template v-if="authStore.isHost">
              <RouterLink to="/host" class="nav-link">Host Dashboard</RouterLink>
            </template>
            <template v-else>
              <RouterLink to="/slots" class="nav-link">Reservations</RouterLink>
              <RouterLink to="/bookings" class="nav-link">My Bookings</RouterLink>
            </template>
            <div class="user-menu">
              <span class="user-name">{{ authStore.user?.name }}</span>
              <button @click="handleLogout" class="secondary small-btn">Log Out</button>
            </div>
          </template>
          <template v-else>
            <RouterLink to="/login" class="nav-link">Sign In</RouterLink>
          </template>
        </div>
      </div>
    </nav>

    <!-- Main Content Route with Transition -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="route" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- Optional Footer -->
    <footer class="footer">
      <p>&copy; 2026 DineQueue. Fine Dining Reservations.</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { RouterView, RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  authStore.init();
});

const handleLogout = () => {
  authStore.logout();
  router.push("/");
};
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: var(--font-heading);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: -0.02em;
}

.logo:hover {
  opacity: 0.9;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -4px;
  left: 0;
  background-color: var(--primary);
  transition: width 0.3s ease;
}

.nav-link:hover { color: var(--secondary); }
.nav-link:hover::after { width: 100%; }
.nav-link.router-link-active { color: var(--primary); }
.nav-link.router-link-active::after { width: 100%; }

.user-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border-left: 1px solid var(--border);
  padding-left: 1.5rem;
}

.user-name {
  font-weight: 600;
  color: var(--secondary);
  font-family: var(--font-heading);
  font-style: italic;
}

.small-btn {
  padding: 0.4em 1em;
  font-size: 0.85rem;
  border-radius: 4px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  border-top: 1px solid var(--border);
  background-color: var(--surface);
  margin-top: auto;
}
</style>