<template>
  <div class="page-wrapper fade-up">
    <!-- Rich Header Banner -->
    <div class="page-banner">
      <div class="banner-content fade-up delay-100 container">
        <h2 class="serif-title">Curated Availability</h2>
        <p class="banner-subtitle">Select a time that suits your evening. If our dining room is fully committed, join the waitlist.</p>
      </div>
    </div>

    <div class="container content-section pb-10">
      <div v-if="loading" class="loading-state text-center fade-up delay-200">
        <div class="spinner"></div>
        <p>Curating availability...</p>
      </div>
      <div v-else-if="error" class="error-banner fade-up delay-200 text-center">{{ error }}</div>
      <div v-else-if="slots.length === 0" class="empty-state text-center fade-up delay-200">
        <span class="icon mb-3">🍽️</span>
        <h3>No Tables Available</h3>
        <p>There are currently no reservations open. Please check back later.</p>
      </div>
      
      <div v-else class="slots-grid fade-up delay-200">
        <div v-for="slot in slots" :key="slot.id" class="ticket-card">
          <div class="ticket-header">
            <h3>{{ formatTime(slot.start_time) }}</h3>
            <span class="duration">Until {{ formatTimeOnly(slot.end_time) }}</span>
          </div>
          <div class="ticket-body">
            <div class="capacity-status" :class="slot.capacity > 0 ? 'available' : 'waitlist'">
              <span class="dot"></span>
              {{ slot.capacity > 0 ? `${slot.capacity} Table${slot.capacity > 1 ? 's' : ''} Remaining` : 'Waitlist Only' }}
            </div>
            
            <button 
              @click="bookSlot(slot.id)" 
              :disabled="actionLoading === slot.id"
              :class="{'secondary outline': slot.capacity === 0}"
              class="action-btn"
            >
              <span v-if="actionLoading === slot.id">Processing...</span>
              <span v-else>{{ slot.capacity > 0 ? 'Reserve Table' : 'Join Waitlist' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="message" class="toast text-center" :class="messageType">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/api';

const slots = ref([]);
const loading = ref(true);
const error = ref('');
const actionLoading = ref(null);
const message = ref('');
const messageType = ref('');

const fetchSlots = async () => {
  try {
    const res = await api.get('slots');
    slots.value = res.data.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  } catch (err) {
    error.value = 'Failed to load reservations. Please try again.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchSlots);

const formatTime = (timeString) => {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric', 
    hour: 'numeric', minute: '2-digit' 
  });
};

const formatTimeOnly = (timeString) => {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const showMessage = (msg, type) => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
    messageType.value = '';
  }, 4000);
};

const bookSlot = async (slotId) => {
  error.value = '';
  actionLoading.value = slotId;
  try {
    const res = await api.post(`slots/${slotId}/book`);
    if (res.data.type === 'WAITLISTED') {
      showMessage('You have been added to the waitlist.', 'warning');
      const slot = slots.value.find(s => s.id === slotId);
      if (slot) slot.capacity = 0;
    } else {
      showMessage('Reservation confirmed. We look forward to serving you.', 'success');
      const slot = slots.value.find(s => s.id === slotId);
      if (slot) slot.capacity -= 1;
    }
  } catch (err) {
    const errorMsg = err.response?.data?.error || 'Failed to process request.';
    showMessage(errorMsg, 'error');
  } finally {
    actionLoading.value = null;
  }
};
</script>

<style scoped>
.page-wrapper {
  background-color: var(--background);
  min-height: 100vh;
}

.page-banner {
  background-color: var(--secondary);
  background-image: radial-gradient(circle at right 20%, #2A3649 0%, var(--secondary) 100%);
  color: #fff;
  padding: 5rem 0 7rem 0; /* Extra bottom padding for overlap effect */
  border-bottom: 4px solid var(--primary);
}

.serif-title {
  color: #fff;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.banner-subtitle {
  font-size: 1.15rem;
  color: #CBD5E0;
  max-width: 600px;
}

.content-section {
  margin-top: -3rem; /* Overlap the banner */
  position: relative;
  z-index: 10;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

/* Ticket Design */
.ticket-card {
  background: var(--surface);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.ticket-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.1);
}

.ticket-header {
  background: #f8fafc;
  padding: 1.5rem 2rem;
  border-bottom: 1px dashed #cbd5e0;
}

.ticket-header h3 {
  color: var(--secondary);
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
}

.ticket-header .duration {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-style: italic;
}

.ticket-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  background: #fff;
}

.capacity-status {
  display: flex;
  align-items: center;
  font-weight: 500;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 0.75rem;
}

.capacity-status.available .dot { background-color: var(--success); box-shadow: 0 0 8px rgba(39, 103, 73, 0.5); }
.capacity-status.available { color: var(--success); }

.capacity-status.waitlist .dot { background-color: var(--warning); box-shadow: 0 0 8px rgba(151, 90, 22, 0.5); }
.capacity-status.waitlist { color: var(--warning); }

.action-btn {
  margin-top: auto;
  width: 100%;
  font-size: 1rem;
  padding: 1rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.outline {
  background-color: transparent !important;
  color: var(--secondary) !important;
  border: 2px solid var(--border) !important;
  box-shadow: none !important;
}
.outline:hover {
  border-color: var(--secondary) !important;
}

/* Empty State */
.empty-state {
  background: var(--surface);
  padding: 4rem;
  border-radius: 12px;
  border: 1px dashed var(--border);
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}
.empty-state .icon { font-size: 3rem; display: block; }
.empty-state h3 { font-family: var(--font-heading); font-size: 2rem; margin-bottom: 0.5rem; }

.loading-state { margin-top: 4rem; color: var(--text-muted); }
.spinner {
  width: 40px; height: 40px; margin: 0 auto 1rem;
  border: 3px solid rgba(142,35,35,0.1); border-top-color: var(--primary); border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.toast {
  position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
  padding: 1rem 2.5rem; border-radius: 30px; font-weight: 500; color: white;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15); animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1000; letter-spacing: 0.02em;
}
.toast.success { background-color: var(--success); }
.toast.warning { background-color: var(--warning); color: #fff; }
.toast.error { background-color: #E53E3E; }
@keyframes slideUp { from { transform: translate(-50%, 100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

.pb-10 { padding-bottom: 6rem; }
.mt-2 { margin-top: 0.75rem; }
.mb-3 { margin-bottom: 1.5rem; }
</style>