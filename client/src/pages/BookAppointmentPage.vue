<template>
  <div class="book-page fade-up">
    <!-- Header -->
    <div class="book-header">
      <div class="container text-center">
        <h1 class="book-title">Complete Your Reservation</h1>
        <p class="text-muted">Confirm details to secure your table</p>
      </div>
    </div>

    <div class="container book-container">
      <div v-if="loading" class="text-center py-lg">
        <div class="spinner"></div>
      </div>
      <div v-else-if="error" class="inline-error">{{ error }}</div>
      
      <div v-else-if="slot" class="book-form-card shadow">
        <!-- Slot Summary -->
        <div class="slot-summary">
          <div class="date-badge-wrap">
            <div class="date-badge">
              <span class="badge-day">{{ formatDayMonth(slot.start_time).day }}</span>
              <span class="badge-month">{{ formatDayMonth(slot.start_time).month }}</span>
            </div>
            <div>
              <p class="text-muted text-sm">{{ formatDayMonth(slot.start_time).weekday }}</p>
              <h3 class="time-main">{{ formatTimeOnly(slot.start_time) }}</h3>
            </div>
          </div>
          <div class="status-badge" :class="isFull ? 'full' : 'avail'">
            {{ isFull ? 'Waitlist Only' : `${slot.available_capacity} Seats Available` }}
          </div>
        </div>

        <form @submit.prevent="submitBooking">
          <div class="field">
            <label>Party Size</label>
            <input type="number" v-model.number="form.partySize" class="input-field" min="1" :max="Math.max(1, slot.capacity)" required />
            <small class="text-muted" v-if="!isFull">Cannot exceed total table capacity ({{ slot.capacity }}).</small>
          </div>



          <div class="action-wrap">
            <button type="submit" class="submit-btn" :disabled="submitting" :class="isFull ? 'warning' : 'primary'">
              {{ submitting ? 'Processing...' : (isFull ? 'Join the Waitlist' : 'Confirm Reservation') }}
            </button>
            <RouterLink to="/slots" class="cancel-link">Cancel</RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../api/api';
import { useFormatters } from '../composables/useFormatters';
import { useToast } from '../composables/useToast';
import { useScrollReveal } from '../composables/useScrollReveal';

const route = useRoute();
const router = useRouter();
const { formatTimeOnly, formatDayMonth } = useFormatters();
const { error: toastError, success: toastSuccess } = useToast();
useScrollReveal();

const slot = ref(null);
const loading = ref(true);
const error = ref('');
const submitting = ref(false);

const form = ref({
  partySize: 1,
  specialRequests: ''
});

const isFull = computed(() => slot.value && slot.value.available_capacity <= 0);

onMounted(async () => {
  try {
    const slotId = route.params.id;
    const res = await api.get(`slots/${slotId}`);
    slot.value = res.data;
  } catch (err) {
    error.value = 'Failed to load slot details. It may be no longer available.';
  } finally {
    loading.value = false;
  }
});

const submitBooking = async () => {
  submitting.value = true;
  try {
    const slotId = route.params.id;
    const res = await api.post(`slots/${slotId}/book`, {
      party_size: form.value.partySize,
      special_requests: form.value.specialRequests
    });
    
    if (res.data.type === 'WAITLISTED') {
      toastSuccess('Added to the waitlist!');
    } else {
      toastSuccess('Reservation confirmed!');
    }
    
    // Redirect to bookings dashboard
    router.push('/bookings');
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to process request.');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.book-page {
  padding-bottom: 4rem;
}
.book-header {
  padding: 3rem 0;
  background: var(--surface);
  border-bottom: 1px solid var(--border-soft);
  margin-bottom: 3rem;
}
.book-title {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  color: var(--secondary);
  margin-bottom: 0.5rem;
}

.book-container {
  max-width: 600px;
  margin: 0 auto;
}

.book-form-card {
  background: var(--surface);
  border-radius: 16px;
  padding: 2.5rem;
  border: 1px solid var(--border-soft);
}

.slot-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-soft);
  margin-bottom: 2rem;
}

.date-badge-wrap {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}
.date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 65px;
  background: var(--primary);
  color: #fff;
  border-radius: 12px;
  padding: 0.75rem;
  line-height: 1.1;
  text-align: center;
}
.badge-day { font-size: 1.8rem; font-weight: 700; font-family: var(--font-heading); }
.badge-month { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.85; }
.time-main {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--secondary);
  margin-top: 0.1rem;
}

.status-badge {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.status-badge.avail { background: rgba(72,187,120,0.15); color: #276749; border: 1px solid rgba(72,187,120,0.3); }
.status-badge.full { background: rgba(236,143,106,0.15); color: #975A16; border: 1px solid rgba(236,143,106,0.3); }

.field label {
  display: block;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--secondary);
  margin-bottom: 0.5rem;
}
.text-area {
  min-height: 120px;
  resize: vertical;
  padding-top: 1rem !important;
  border-radius: 12px !important;
}

.mt-md { margin-top: 1.5rem; }

.action-wrap {
  margin-top: 2.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}
.submit-btn {
  display: block;
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  color: #ffffff !important;
  transition: transform 0.2s, filter 0.2s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.submit-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}
.submit-btn.primary { background: #8E2323 !important; background-color: #8E2323 !important; }
.submit-btn.warning { background: #975A16 !important; background-color: #975A16 !important; }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

.cancel-link {
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: underline;
}

.inline-error {
  padding: 1.5rem;
  background: var(--error-light);
  color: var(--error);
  border: 1px solid rgba(197,48,48,0.2);
  border-radius: 12px;
  text-align: center;
  font-weight: 500;
}
</style>
