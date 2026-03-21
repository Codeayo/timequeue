<template>
  <div class="page-wrapper fade-up">
    <!-- Rich Header Banner -->
    <div class="page-banner">
      <div class="banner-content fade-up delay-100 container">
        <h2 class="serif-title">Your Itinerary</h2>
        <p class="banner-subtitle">Review your upcoming reservations and manage your waitlist status.</p>
      </div>
    </div>

    <div class="container content-section pb-10">
      <div v-if="loading" class="text-center mt-5 text-muted fade-up delay-200">Loading your itinerary...</div>
      <div v-else-if="error" class="error-banner mb-5 text-center fade-up delay-200">{{ error }}</div>
      <div v-else class="fade-up delay-200">
        
        <!-- Confirmed Bookings -->
        <section class="mb-5">
          <h3 class="section-title">Confirmed Reservations</h3>
          <div v-if="bookings.length === 0" class="empty-layout text-center">
            <p>You have no upcoming dining reservations.</p>
            <RouterLink to="/slots" class="primary-btn mt-3 inline-btn">Find a Table</RouterLink>
          </div>
          <div v-else class="list-grid">
            <div v-for="b in bookings" :key="b.booking_id" class="ticket-card dash-card">
              <div class="info">
                <h4>{{ formatTime(b.start_time) }}</h4>
                <p class="text-muted italic text-sm">Dining until {{ formatTimeOnly(b.end_time) }}</p>
                <div class="status-indicator success mt-3">
                  <span class="dot"></span> Confirmed
                </div>
              </div>
              <button @click="cancelBooking(b.booking_id)" :disabled="actionLoading === b.booking_id" class="cancel-link">
                {{ actionLoading === b.booking_id ? 'Canceling...' : 'Cancel Reservation' }}
              </button>
            </div>
          </div>
        </section>

        <!-- Waitlist -->
        <section>
          <h3 class="section-title">Waitlist Status</h3>
          <div v-if="waitlists.length === 0" class="empty-layout text-center">
            <p>You are not currently on any waitlists.</p>
          </div>
          <div v-else class="list-grid">
            <div v-for="w in waitlists" :key="w.waitlist_id" class="ticket-card dash-card waitlist-card">
              <div class="info">
                <h4>{{ formatTime(w.start_time) }}</h4>
                <p class="text-muted italic text-sm">Dining until {{ formatTimeOnly(w.end_time) }}</p>
                <div class="status-indicator warning mt-3">
                  <span class="dot"></span> Waiting for Availability
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../api/api';

const loading = ref(true);
const error = ref('');
const actionLoading = ref(null);

const bookings = ref([]);
const waitlists = ref([]);

const fetchData = async () => {
  try {
    const res = await api.get('bookings');
    const sortFn = (a, b) => new Date(a.start_time) - new Date(b.start_time);
    bookings.value = res.data.bookings.sort(sortFn);
    waitlists.value = res.data.waitlists.sort(sortFn);
  } catch (err) {
    error.value = 'Failed to load reservations.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const formatTime = (timeString) => {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric', 
    hour: 'numeric', minute: '2-digit' 
  });
};

const formatTimeOnly = (timeString) => {
  return new Date(timeString).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const cancelBooking = async (bookingId) => {
  if (!confirm("Are you sure you wish to cancel this reservation?")) return;
  actionLoading.value = bookingId;
  try {
    await api.post(`bookings/${bookingId}/cancel`);
    bookings.value = bookings.value.filter(b => b.booking_id !== bookingId);
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to cancel reservation');
  } finally {
    actionLoading.value = null;
  }
};
</script>

<style scoped>
.page-wrapper { background-color: var(--background); min-height: 100vh; }
.page-banner {
  background-color: var(--secondary); background-image: radial-gradient(circle at right 20%, #2A3649 0%, var(--secondary) 100%);
  color: #fff; padding: 5rem 0 7rem 0; border-bottom: 4px solid var(--primary);
}
.serif-title { color: #fff; font-size: 2.5rem; margin-bottom: 1rem; }
.banner-subtitle { font-size: 1.15rem; color: #CBD5E0; max-width: 600px; }
.content-section { margin-top: -3rem; position: relative; z-index: 10; }

.section-title { 
  border-bottom: 1px solid var(--border); 
  padding-bottom: 0.75rem; 
  margin-bottom: 2.5rem; 
  font-size: 1.5rem;
  color: var(--secondary);
}

.empty-layout {
  padding: 4rem; background-color: var(--surface);
  border: 1px dashed var(--border); border-radius: 12px; color: var(--text-muted); box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}
.inline-btn { display: inline-block; padding: 0.8em 1.5em; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 0.05em; border-radius: 6px; }

.list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; }

.ticket-card {
  background: var(--surface); border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.04);
  border: 1px solid var(--border); border-top: 4px solid var(--success); padding: 2rem;
  display: flex; justify-content: space-between; align-items: flex-end; transition: transform 0.3s ease;
}
.ticket-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }

.waitlist-card { border-top-color: var(--warning); }

.info h4 { font-size: 1.35rem; margin-bottom: 0.2rem; }
.italic { font-style: italic; }
.text-sm { font-size: 0.95rem; }

.status-indicator { display: flex; align-items: center; font-weight: 500; font-size: 0.9rem; }
.status-indicator .dot { width: 8px; height: 8px; border-radius: 50%; margin-right: 0.5rem; }
.status-indicator.success { color: var(--success); }
.status-indicator.success .dot { background-color: var(--success); }
.status-indicator.warning { color: var(--warning); }
.status-indicator.warning .dot { background-color: var(--warning); box-shadow: 0 0 6px rgba(151, 90, 22, 0.4);}

.cancel-link {
  background: transparent; color: #E53E3E; border: none; padding: 0; font-size: 0.9rem;
  font-weight: 500; text-decoration: underline; box-shadow: none; cursor: pointer; transition: opacity 0.2s;
}
.cancel-link:hover { opacity: 0.7; transform: none; box-shadow:none; border-color:transparent; background: transparent; }

.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-5 { margin-top: 3rem; }
.mb-5 { margin-bottom: 4rem; }
.pb-10 { padding-bottom: 6rem; }
</style>