<template>
  <div class="split-layout fade-up">
    <!-- Left: Image Showcase -->
    <div class="image-side">
      <div class="image-overlay">
        <h2 class="fade-up delay-100">Your Table Awaits.</h2>
        <p class="fade-up delay-200">Join DineQueue to effortlessly book and manage your fine dining experiences.</p>
      </div>
    </div>

    <!-- Right: Auth Form -->
    <div class="form-side">
      <div class="auth-card">
        <div class="auth-header text-center">
          <h2 class="serif-heading">{{ isRegistering ? 'Join DineQueue' : 'Welcome Back' }}</h2>
          <p class="text-muted">
            {{ isRegistering ? 'Create an account to reserve your table.' : 'Please enter your credentials to continue.' }}
          </p>
        </div>

        <div v-if="error" class="error-banner fade-up">{{ error }}</div>

        <form @submit.prevent="handleSubmit" class="mt-4">
          <div v-if="isRegistering" class="form-group fade-up delay-100">
            <label for="name">Full Name</label>
            <input type="text" id="name" v-model="form.name" class="input-field" placeholder="Jane Doe" required />
          </div>

          <div class="form-group fade-up" :class="isRegistering ? 'delay-200' : 'delay-100'">
            <label for="email">Email Address</label>
            <input type="email" id="email" v-model="form.email" class="input-field" placeholder="jane@example.com" required />
          </div>

          <div class="form-group fade-up" :class="isRegistering ? 'delay-300' : 'delay-200'">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="form.password" class="input-field" placeholder="••••••••" required />
          </div>

          <div v-if="isRegistering" class="form-group fade-up delay-300">
            <label for="role">Select Your Role</label>
            <select id="role" v-model="form.role" class="input-field">
              <option value="USER">Customer</option>
              <option value="HOST">Restaurant Staff</option>
            </select>
          </div>

          <button type="submit" :disabled="loading" class="submit-btn fade-up" :class="isRegistering ? 'delay-300' : 'delay-200'">
            {{ loading ? 'Authenticating...' : (isRegistering ? 'Register Account' : 'Sign In') }}
          </button>
        </form>

        <div class="toggle-section text-center fade-up delay-300">
          <p>
            {{ isRegistering ? 'Already a member?' : "New to DineQueue?" }}
            <a href="#" @click.prevent="toggleMode" class="toggle-link">
              {{ isRegistering ? 'Sign in here' : 'Create an account' }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../api/api';

const router = useRouter();
const authStore = useAuthStore();

const isRegistering = ref(false);
const error = ref('');
const loading = ref(false);

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'USER'
});

const toggleMode = () => {
  isRegistering.value = !isRegistering.value;
  error.value = '';
};

const handleSubmit = async () => {
  error.value = '';
  loading.value = true;
  try {
    const endpoint = isRegistering.value ? '/auth/register' : '/auth/login';
    const payload = isRegistering.value 
      ? { name: form.name, email: form.email, password: form.password, role: form.role }
      : { email: form.email, password: form.password };
      
    const res = await api.post(endpoint, payload);
    const { user, token } = res.data;
    authStore.setAuth(user, token);
    
    if (user.role === 'HOST') {
      router.push('/host');
    } else {
      router.push('/slots');
    }
  } catch (err) {
    if (err.response && err.response.data.error) {
      error.value = err.response.data.error;
    } else {
      error.value = 'An unexpected error occurred. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.split-layout {
  display: flex;
  min-height: calc(100vh - 75px); /* Subtract sticky nav height */
  width: 100%;
}

.image-side {
  display: none;
}

/* On larger screens, activate split layout */
@media (min-width: 900px) {
  .image-side {
    display: flex;
    flex: 1;
    background-image: url('/hero-image.png');
    background-size: cover;
    background-position: center;
    position: relative;
    align-items: flex-end;
  }

  .image-overlay {
    background: linear-gradient(to top, rgba(28, 35, 49, 0.95), rgba(28, 35, 49, 0.1));
    width: 100%;
    padding: 6rem 4rem 4rem 4rem;
    color: #fff;
  }
  
  .image-overlay h2 {
    color: #FDFBF7;
    font-size: 3rem;
    margin-bottom: 0.5rem;
    font-family: var(--font-heading);
  }
  
  .image-overlay p {
    font-size: 1.2rem;
    color: #E2E8F0;
    max-width: 400px;
  }

  .form-side {
    flex: 1;
    max-width: 600px;
  }
}

.form-side {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 2rem;
  background-color: var(--background);
}

.auth-card {
  width: 100%;
  max-width: 420px;
}

.serif-heading {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  color: var(--secondary);
  margin-bottom: 0.5rem;
}

.auth-header {
  margin-bottom: 2.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.input-field {
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid var(--border);
  padding: 0.85rem 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.01);
}

.submit-btn {
  width: 100%;
  margin-top: 1.5rem;
  padding: 1rem;
  font-size: 1.05rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 6px;
}

.error-banner {
  background-color: rgba(229, 62, 62, 0.1);
  color: #E53E3E;
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid rgba(229, 62, 62, 0.2);
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  font-weight: 500;
}

.toggle-section {
  margin-top: 2.5rem;
  font-size: 1rem;
}

.toggle-link {
  font-weight: 600;
  color: var(--primary);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.toggle-link:hover {
  color: var(--primary-hover);
}
</style>