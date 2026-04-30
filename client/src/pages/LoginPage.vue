<template>
  <div class="login-page fade-up">
    <div class="form-card">
      <!-- Logo + heading -->
      <div class="form-header text-center">
        <AppLogo class="login-logo" />
        <h2>{{ isRegistering ? 'Create Account' : 'Welcome Back' }}</h2>
        <p class="form-subtitle">
          {{ isRegistering ? 'Join to book your perfect dining experience.' : 'Sign in to manage your reservations.' }}
        </p>
      </div>

      <div v-if="error" class="error-alert fade-up">{{ error }}</div>

      <form @submit.prevent="handleSubmit">
        <div v-if="isRegistering" class="field fade-up delay-100">
          <label>Full Name</label>
          <input type="text" v-model="form.name" class="input-field" placeholder="Jane Doe" required />
        </div>
        <div class="field fade-up" :class="isRegistering ? 'delay-200' : 'delay-100'">
          <label>Email Address</label>
          <input type="email" v-model="form.email" class="input-field" placeholder="jane@example.com" required />
        </div>
        <div class="field fade-up" :class="isRegistering ? 'delay-300' : 'delay-200'">
          <label>Password</label>
          <div class="password-wrap">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              class="input-field"
              placeholder="••••••••"
              required
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword" tabindex="-1">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        <div v-if="isRegistering" class="field fade-up delay-300">
          <label>Account Type</label>
          <select v-model="form.role" class="input-field">
            <option value="USER">Customer — I want to book tables</option>
            <option value="HOST">Restaurant Staff — I manage reservations</option>
          </select>
        </div>
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Please wait...' : (isRegistering ? 'Create My Account' : 'Sign In') }}
        </button>
      </form>

      <div class="toggle text-center">
        {{ isRegistering ? 'Already have an account?' : "Don't have an account?" }}
        <a href="#" @click.prevent="toggleMode">
          {{ isRegistering ? 'Sign in' : 'Register' }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../api/api';
import AppLogo from '../components/AppLogo.vue';

const router = useRouter();
const authStore = useAuthStore();

// Redirect if already logged in
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push(authStore.isHost ? '/host' : '/bookings');
  }
});

const isRegistering = ref(false);
const showPassword = ref(false);
const error = ref('');
const loading = ref(false);
const form = reactive({ name: '', email: '', password: '', role: 'USER' });

const toggleMode = () => { isRegistering.value = !isRegistering.value; error.value = ''; };

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    error.value = 'Please enter a valid email address (e.g., user@example.com).';
    loading.value = false;
    return;
  }

  try {
    const endpoint = isRegistering.value ? '/auth/register' : '/auth/login';
    const payload = isRegistering.value
      ? { name: form.name, email: form.email, password: form.password, role: form.role }
      : { email: form.email, password: form.password };
    const res = await api.post(endpoint, payload);
    authStore.setAuth(res.data.user, res.data.token);
    router.push(res.data.user.role === 'HOST' ? '/host' : '/bookings');
  } catch (err) {
    error.value = err.response?.data?.error || 'An unexpected error occurred.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ── Centered page ── */
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--nav-height));
  padding: 2rem 1rem;
  background: var(--background);
}

.form-card {
  width: 100%;
  max-width: 460px;
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: 20px;
  padding: 2.75rem 2.5rem 2.25rem;
  box-shadow: 0 8px 40px rgba(0,0,0,0.08);
}

.image-panel {
  display: none;
  position: relative;
  overflow: hidden;
}
@media (min-width: 900px) {
  .image-panel { display: flex; flex: 1; }
}

.image-bg {
  position: absolute; inset: 0;
  background-image: url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&auto=format&fit=crop&q=85');
  background-size: cover;
  background-position: center;
  animation: ken-burns 18s ease-in-out infinite alternate;
}
@keyframes ken-burns {
  0%   { transform: scale(1)    translateX(0); }
  100% { transform: scale(1.08) translateX(-2%); }
}

.image-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    160deg,
    rgba(6,10,18,0.6) 0%,
    rgba(10,14,24,0.88) 55%,
    rgba(26,18,10,0.96) 100%
  );
  display: flex; align-items: flex-end;
  z-index: 1;
}

.image-text { padding: 3.5rem; color: #fff; position: relative; z-index: 2; }
.eyebrow {
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.2em;
  text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 1.25rem;
}
.image-text h2 { font-size: clamp(2.2rem, 3vw, 3rem); color: #FDFBF7; margin-bottom: 0.75rem; font-family: var(--font-heading); line-height: 1.1; }
.image-text h2 em { color: #e0c9a6; font-style: italic; }
.image-sub { color: rgba(255,255,255,0.58); font-size: 1rem; max-width: 340px; line-height: 1.65; margin-bottom: 1.75rem; }

.image-features { display: flex; flex-direction: column; gap: 0.55rem; margin-bottom: 2rem; }
.img-feat {
  display: flex; align-items: center; gap: 0.6rem;
  font-size: 0.85rem; color: rgba(255,255,255,0.7);
}
.img-feat span { color: #48BB78; font-weight: 700; font-size: 0.9rem; }

.image-quote {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px;
  padding: 1.1rem 1.4rem;
  max-width: 360px;
}
.quote-text { font-size: 0.88rem; color: rgba(255,255,255,0.8); line-height: 1.6; font-style: italic; margin-bottom: 0.5rem; }
.quote-author { font-size: 0.75rem; color: rgba(255,255,255,0.4); font-weight: 600; }

/* ── Right Form Panel ── */
.form-panel {
  display: flex; align-items: center; justify-content: center;
  flex: 1; max-width: 100%; padding: 2.5rem 2rem;
  background: var(--background);
}
@media (min-width: 900px) { .form-panel { max-width: 580px; } }

.form-box { width: 420px; max-width: 100%; }

.form-header { margin-bottom: 2rem; }

.login-logo {
  margin: 0 auto 1rem;
  font-size: 1.05rem;
}
.form-header h2 { font-size: 1.85rem; margin-bottom: 0.35rem; color: var(--secondary); }
.form-subtitle { font-size: 0.88rem; color: var(--text-muted); }

/* Fields */
.field { margin-bottom: 1rem; }
label { display: block; font-weight: 500; font-size: 0.82rem; color: var(--secondary); margin-bottom: 0.4rem; letter-spacing: 0.02em; }

/* Pill-shaped inputs */
.input-field {
  border-radius: 999px !important;
  padding-left: 1.1rem !important;
  padding-right: 1.1rem !important;
}

/* Focus glow */
.input-field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(139,90,43,0.15);
  outline: none;
}

/* Password show/hide */
.password-wrap { position: relative; display: flex; align-items: center; }
.password-wrap .input-field { width: 100%; padding-right: 2.75rem !important; }
.eye-btn {
  position: absolute; right: 1rem;
  background: none; border: none; box-shadow: none;
  font-size: 1rem; padding: 0; line-height: 1; cursor: pointer;
  color: var(--text-muted);
  display: flex; align-items: center;
}
.eye-btn:hover { background: none; transform: none; box-shadow: none; opacity: 0.7; }

/* Pill submit button */
.submit-btn {
  width: 100%; margin-top: 1.25rem;
  padding: 0.9rem; font-size: 1rem;
  text-transform: uppercase; letter-spacing: 0.06em;
  border-radius: 999px;
}

.error-alert {
  background: var(--error-light); color: var(--error);
  padding: 0.85rem 1.1rem; border-radius: 12px;
  border: 1px solid rgba(197,48,48,0.2);
  font-size: 0.9rem; font-weight: 500;
  text-align: center; margin-bottom: 1.5rem;
}

.toggle {
  margin-top: 1.75rem; font-size: 0.9rem; color: var(--text-muted);
  padding-top: 1.5rem; border-top: 1px solid var(--border-soft);
}
.toggle a { font-weight: 600; margin-left: 0.35rem; }
</style>