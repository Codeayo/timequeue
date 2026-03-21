<template>
  <div class="page-wrapper fade-up">
    <!-- Rich Header Banner -->
    <div class="page-banner">
      <div class="banner-content fade-up delay-100 container">
        <h2 class="serif-title">Host Administration</h2>
        <p class="banner-subtitle">Publish seating availability and monitor incoming guests for your establishment.</p>
      </div>
    </div>

    <div class="container content-section pb-10">
      <div class="dashboard-grid fade-up delay-200">
        
        <!-- Create Slot Section -->
        <div class="admin-panel create-slot-card self-start">
          <h3 class="panel-title">Open Reservations</h3>
          <p class="text-sm text-muted mb-4">Create new dining blocks for guests.</p>
          <form @submit.prevent="handleCreateSlot">
            <div class="form-group">
              <label>Service Start Time</label>
              <input type="datetime-local" v-model="form.start_time" class="input-field" required />
            </div>
            <div class="form-group">
              <label>Service End Time</label>
              <input type="datetime-local" v-model="form.end_time" class="input-field" required />
            </div>
            <div class="form-group">
              <label>Available Tables Capacity</label>
              <input type="number" min="1" v-model="form.capacity" class="input-field" required />
            </div>
            <button type="submit" :disabled="creating" class="action-btn mt-3">
              {{ creating ? 'Publishing...' : 'Publish Availability' }}
            </button>
            <div v-if="createError" class="error-banner mt-3">{{ createError }}</div>
          </form>
        </div>

        <!-- Manage Slots Section -->
        <div class="admin-panel manage-slots-section">
          <h3 class="panel-title border-bottom pb-2">Active Service Blocks</h3>
          
          <div v-if="loadingSlots" class="text-muted mt-4 text-center py-4">Synchronizing blocks...</div>
          <div v-else-if="mySlots.length === 0" class="empty-state text-center mt-4">
            <p>No availability has been published yet.</p>
          </div>
          
          <div v-else class="slots-list mt-4">
            <div v-for="slot in mySlots" :key="slot.id" class="ticket-card mb-4" :class="{'expanded': expandedSlot === slot.id}">
              <div class="ticket-header" @click="toggleSlotDetails(slot.id)">
                <div class="slot-summary">
                  <h4>{{ formatTime(slot.start_time) }}</h4>
                  <p class="text-muted italic text-sm">Capacity: {{ slot.capacity }} Tables Available</p>
                </div>
                <button class="ghost-btn">
                  {{ expandedSlot === slot.id ? 'Hide Roster' : 'View Roster' }}
                </button>
              </div>

              <!-- Expanded Roster Details -->
              <div v-if="expandedSlot === slot.id" class="ticket-body mt-4 fade-up">
                <div v-if="loadingDetails" class="text-muted text-sm text-center py-4">Retrieving guest roster...</div>
                <div v-else>
                  <!-- Confirmations -->
                  <h5 class="detail-h5">Confirmed Guests <span class="badge success sm-badge ml-2">{{ slotDetails.bookings?.length || 0 }}</span></h5>
                  <ul class="detail-list mb-4">
                    <li v-if="slotDetails.bookings?.length === 0" class="text-muted italic text-sm py-2">No tables have been reserved.</li>
                    <li v-for="b in slotDetails.bookings" :key="b.id" class="roster-item">
                      <span class="font-medium">{{ b.name }}</span>
                      <span class="text-muted text-sm">{{ b.email }}</span>
                    </li>
                  </ul>

                  <!-- Waitlist -->
                  <h5 class="detail-h5">Waitlist <span class="badge warning sm-badge ml-2">{{ slotDetails.waitlists?.length || 0 }}</span></h5>
                  <ul class="detail-list">
                    <li v-if="slotDetails.waitlists?.length === 0" class="text-muted italic text-sm py-2">No guests currently waiting.</li>
                    <li v-for="(w, idx) in slotDetails.waitlists" :key="w.id" class="roster-item waitlist-item">
                      <div>
                        <span class="badge warning mr-2">#{{ idx + 1 }}</span>
                        <span class="font-medium">{{ w.name }}</span>
                      </div>
                      <span class="text-muted text-sm">{{ w.email }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/api';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const mySlots = ref([]);
const loadingSlots = ref(true);

const form = ref({ start_time: '', end_time: '', capacity: 1 });
const creating = ref(false);
const createError = ref('');

const expandedSlot = ref(null);
const slotDetails = ref({ bookings: [], waitlists: [] });
const loadingDetails = ref(false);

const fetchMySlots = async () => {
  try {
    const res = await api.get('slots');
    mySlots.value = res.data
      .filter(s => s.host_id === authStore.user.id)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  } catch (err) {
    console.error(err);
  } finally {
    loadingSlots.value = false;
  }
};

onMounted(fetchMySlots);

const formatTime = (timeString) => {
  if (!timeString) return '';
  const date = new Date(timeString);
  return date.toLocaleString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric', 
    hour: 'numeric', minute: '2-digit' 
  });
};

const handleCreateSlot = async () => {
  createError.value = '';
  creating.value = true;
  try {
    const payload = { ...form.value };
    payload.start_time = new Date(payload.start_time).toISOString();
    payload.end_time = new Date(payload.end_time).toISOString();
    
    await api.post('slots', payload);
    form.value = { start_time: '', end_time: '', capacity: 1 };
    await fetchMySlots();
  } catch (err) {
    createError.value = err.response?.data?.error || 'Failed to publish slot.';
  } finally {
    creating.value = false;
  }
};

const toggleSlotDetails = async (slotId) => {
  if (expandedSlot.value === slotId) {
    expandedSlot.value = null;
    return;
  }
  
  expandedSlot.value = slotId;
  loadingDetails.value = true;
  slotDetails.value = { bookings: [], waitlists: [] };
  
  try {
    const res = await api.get(`slots/${slotId}/bookings`);
    slotDetails.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loadingDetails.value = false;
  }
};
</script>

<style scoped>
.page-wrapper { background-color: var(--background); min-height: 100vh; }
.page-banner {
  background-color: var(--secondary); background-image: radial-gradient(circle at left 20%, #2A3649 0%, var(--secondary) 100%);
  color: #fff; padding: 5rem 0 7rem 0; border-bottom: 4px solid var(--primary);
}
.serif-title { color: #fff; font-size: 2.5rem; margin-bottom: 1rem; }
.banner-subtitle { font-size: 1.15rem; color: #CBD5E0; max-width: 600px; }
.content-section { margin-top: -3rem; position: relative; z-index: 10; }

.dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 3rem; }
@media (min-width: 900px) { .dashboard-grid { grid-template-columns: 380px 1fr; } }

.admin-panel {
  background: var(--surface); border-radius: 12px; padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.04); border: 1px solid var(--border);
}

.self-start { align-self: start; }
.panel-title { font-size: 1.6rem; color: var(--secondary); margin-bottom: 0.5rem; font-family: var(--font-heading); }
.border-bottom { border-bottom: 1px solid var(--border); }
.pb-2 { padding-bottom: 0.75rem; }

.action-btn { width: 100%; letter-spacing: 0.05em; text-transform: uppercase; border-radius: 6px; padding: 0.9em; }
.ghost-btn { background: transparent; color: var(--primary); border: 1px solid var(--primary); padding: 0.5em 1em; border-radius: 4px; font-size: 0.85rem; font-weight: 600;}
.ghost-btn:hover { background: var(--primary); color: #fff; }

.empty-state { padding: 3rem; background-color: #fafbfc; border: 1px dashed var(--border); border-radius: 8px; color: var(--text-muted); }

/* Ticket Card Styling */
.ticket-card {
  background: #fff; border-radius: 8px; border: 1px solid var(--border); border-left: 4px solid var(--primary);
  transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.02);
}
.ticket-card.expanded { box-shadow: 0 12px 25px rgba(0,0,0,0.08); border-left-color: var(--secondary); }

.ticket-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding: 1.5rem 2rem; }
.slot-summary h4 { margin-bottom: 0.2rem; font-size: 1.25rem; color: var(--secondary); }

.ticket-body { border-top: 1px dashed var(--border); padding: 1.5rem 2rem 2rem; background: #fdfdfd; }

.text-sm { font-size: 0.9rem; }
.italic { font-style: italic; }
.font-medium { font-weight: 500; }
.py-4 { padding: 1.5rem 0; }
.py-2 { padding: 0.5rem 0; }

.detail-h5 { display: flex; align-items: center; margin-bottom: 0.5rem; font-size: 1.1rem; color: var(--secondary); }
.sm-badge { padding: 0.1em 0.5em; font-size: 0.75rem; border-radius: 4px; }
.ml-2 { margin-left: 0.5rem; }
.mr-2 { margin-right: 0.5rem; }

.detail-list { list-style-type: none; padding: 0; margin: 0; }
.roster-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid rgba(0,0,0,0.04); }
.roster-item:last-child { border-bottom: none; }

.mb-4 { margin-bottom: 1.5rem; }
.mt-4 { margin-top: 1.5rem; }
.mt-3 { margin-top: 1rem; }
.pb-10 { padding-bottom: 6rem; }

.error-banner { background-color: rgba(229, 62, 62, 0.1); color: #E53E3E; padding: 0.75rem; border-radius: 4px; text-align: center; font-size: 0.9rem; font-weight: 500; }
</style>