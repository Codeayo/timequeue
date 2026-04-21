<template>
  <div>
    <!-- Professional Dashboard Header -->
    <div class="host-header">
      <div class="host-header-bg"></div>
      <div class="host-header-overlay"></div>
      <div class="container host-header-inner">
        <div class="host-header-left">
          <div class="host-breadcrumb">
            <span class="breadcrumb-tag">Staff Portal</span>
            <span class="breadcrumb-sep">/</span>
            <span class="breadcrumb-current">Dashboard</span>
          </div>
          <h1 class="host-header-title">Host Dashboard</h1>
          <p class="host-header-sub">Manage availability &amp; monitor your full guest roster in real time.</p>
        </div>
        <div class="host-header-right">
          <div class="host-name-badge">
            <span class="host-avatar">{{ authStore.user?.name?.charAt(0) }}</span>
            <div>
              <p class="host-label">Signed in as</p>
              <p class="host-name">{{ authStore.user?.name }}</p>
            </div>
          </div>
          <div class="host-date-badge">
            <span class="date-icon">📅</span>
            <span>{{ todayLabel }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container content-section">
      <!-- KPI Cards -->
      <div class="kpi-row fade-up">
        <div class="kpi-card">
          <span class="kpi-icon">🗓️</span>
          <div class="kpi-body">
            <span class="kpi-num">{{ mySlots.length }}</span>
            <span class="kpi-label">Active Slots</span>
          </div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon">✅</span>
          <div class="kpi-body">
            <span class="kpi-num">{{ totalConfirmed }}</span>
            <span class="kpi-label">Confirmed Bookings</span>
          </div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon">⏳</span>
          <div class="kpi-body">
            <span class="kpi-num">{{ totalWaitlisted }}</span>
            <span class="kpi-label">On Waitlist</span>
          </div>
        </div>
        <div class="kpi-card">
          <span class="kpi-icon">💺</span>
          <div class="kpi-body">
            <span class="kpi-num">{{ totalCapacity }}</span>
            <span class="kpi-label">Total Seats</span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid fade-up delay-100">

        <!-- Create Slot Panel -->
        <aside class="panel create-panel">
          <h3 class="panel-h">Publish Availability</h3>
          <p class="text-muted text-sm">Open a new dining block for guest reservations.</p>

          <form @submit.prevent="handleCreateSlot" class="create-form">
            <div class="field">
              <label>Start Time</label>
              <input type="datetime-local" v-model="form.start_time" class="input-field" required />
            </div>
            <div class="field">
              <label>End Time</label>
              <input type="datetime-local" v-model="form.end_time" class="input-field" required />
            </div>
            <div class="field">
              <label>Table Capacity</label>
              <input type="number" min="1" v-model="form.capacity" class="input-field" required />
            </div>
            <button type="submit" :disabled="creating" class="create-btn">
              {{ creating ? 'Publishing...' : 'Publish Availability' }}
            </button>
            <div v-if="createError" class="field-error">{{ createError }}</div>
          </form>
        </aside>

        <!-- Slots Panel -->
        <div class="panel slots-panel">
          <div class="panel-header">
            <h3 class="panel-h">Active Service Blocks</h3>
            <span v-if="mySlots.length" class="badge success">{{ mySlots.length }} Active</span>
          </div>

          <div v-if="loadingSlots" class="text-center text-muted py-lg">
            <div class="spinner"></div>
            <p>Loading blocks...</p>
          </div>
          <div v-else-if="mySlots.length === 0" class="empty-state text-center mt-lg">
            <span class="empty-icon">📋</span>
            <h3>No Blocks Published</h3>
            <p>Use the form to publish your first availability slot.</p>
          </div>

          <div v-else class="slot-list">
            <div
              v-for="slot in mySlots"
              :key="slot.id"
              class="slot-row"
              :class="{ expanded: expandedSlot === slot.id }"
            >
              <div class="slot-row-head" @click="toggleSlotDetails(slot.id)">
                <div class="slot-date-badge">
                  <span class="bd">{{ formatDayMonth(slot.start_time).day }}</span>
                  <span class="bm">{{ formatDayMonth(slot.start_time).month }}</span>
                </div>
                <div class="slot-info">
                  <h4>{{ formatDateTime(slot.start_time) }}</h4>
                  <p class="text-muted text-sm italic">{{ slot.available_capacity }} seat{{ slot.available_capacity !== 1 ? 's' : '' }} left of {{ slot.total_capacity }}</p>
                  <div class="slot-mini-bar-wrap">
                    <div 
                      class="slot-mini-bar" 
                      :style="{ width: slot.available_capacity === 0 ? '100%' : ((slot.available_capacity / slot.total_capacity) * 100) + '%' }" 
                      :class="slot.available_capacity === 0 ? 'full' : ''"
                    ></div>
                  </div>
                </div>
                <div class="slot-actions-group">
                  <button class="delete-btn" @click.stop="deleteSlot(slot.id)" title="Delete Slot">✕</button>
                  <button class="toggle-btn" @click="toggleSlotDetails(slot.id)">
                    <span>{{ expandedSlot === slot.id ? '▲ Hide' : '▼ Roster' }}</span>
                  </button>
                </div>
              </div>

              <!-- Roster -->
              <div v-if="expandedSlot === slot.id" class="roster fade-up">
                <div v-if="loadingDetails" class="text-center text-muted py-sm">
                  <div class="spinner sm-spinner"></div>
                </div>
                <div v-else class="roster-inner">
                  <!-- Confirmed Table -->
                  <div class="roster-section">
                    <div class="roster-header">
                      <span>✅ Confirmed Guests</span>
                      <span class="badge success">{{ slotDetails.bookings?.length || 0 }}</span>
                    </div>
                    <p v-if="!slotDetails.bookings?.length" class="roster-empty text-muted italic text-sm">No confirmed reservations yet</p>
                    <table v-else class="roster-table">
                      <thead><tr><th>Guest</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        <tr v-for="b in slotDetails.bookings" :key="b.id">
                          <td><span class="guest-avatar">{{ b.name?.charAt(0) }}</span> {{ b.name }}</td>
                          <td class="text-muted">{{ b.email }}</td>
                          <td><span class="badge success">Confirmed</span></td>
                          <td>
                            <button class="remove-btn" @click="cancelBooking(slot.id, b.id)">Drop</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!-- Waitlist Table -->
                  <div class="roster-section">
                    <div class="roster-header">
                      <span>⏳ Waitlist</span>
                      <span class="badge warning">{{ slotDetails.waitlists?.length || 0 }}</span>
                    </div>
                    <p v-if="!slotDetails.waitlists?.length" class="roster-empty text-muted italic text-sm">No one on the waitlist</p>
                    <table v-else class="roster-table">
                      <thead><tr><th>#</th><th>Guest</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        <tr v-for="(w, idx) in slotDetails.waitlists" :key="w.id">
                          <td class="pos-num">#{{ idx + 1 }}</td>
                          <td><span class="guest-avatar wait">{{ w.name?.charAt(0) }}</span> {{ w.name }}</td>
                          <td class="text-muted">{{ w.email }}</td>
                          <td><span class="badge warning">Waiting</span></td>
                          <td>
                            <button class="remove-btn" @click="cancelWaitlist(slot.id, w.id)">Drop</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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
import { ref, computed, onMounted } from 'vue';
import api from '../api/api';
import { useFormatters } from '../composables/useFormatters';
import { useScrollReveal } from '../composables/useScrollReveal';
import { useToast } from '../composables/useToast';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const { formatDateTime, formatDayMonth } = useFormatters();
const { success: toastSuccess, error: toastError } = useToast();
useScrollReveal();

const mySlots = ref([]);
const loadingSlots = ref(true);
const form = ref({ start_time: '', end_time: '', capacity: 1 });
const creating = ref(false);
const createError = ref('');
const expandedSlot = ref(null);
const slotDetails = ref({ bookings: [], waitlists: [] });
const loadingDetails = ref(false);

// KPI computed values
const totalConfirmed  = computed(() => mySlots.value.reduce((s, sl) => s + ((sl.total_capacity ?? 0) - (sl.available_capacity ?? 0)), 0));
const totalWaitlisted = computed(() => mySlots.value.reduce((s, sl) => s + (sl.waitlist_count ?? 0), 0));
const totalCapacity   = computed(() => mySlots.value.reduce((s, sl) => s + (sl.total_capacity ?? 0), 0));
const todayLabel = computed(() => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));

const fetchMySlots = async () => {
  try {
    const res = await api.get('slots/mine');
    mySlots.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loadingSlots.value = false;
  }
};

onMounted(fetchMySlots);

const handleCreateSlot = async () => {
  createError.value = '';
  creating.value = true;
  try {
    const payload = {
      start_time: new Date(form.value.start_time).toISOString(),
      end_time: new Date(form.value.end_time).toISOString(),
      capacity: form.value.capacity
    };
    await api.post('slots', payload);
    form.value = { start_time: '', end_time: '', capacity: 1 };
    toastSuccess('Availability slot published successfully!');
    await fetchMySlots();
  } catch (err) {
    createError.value = err.response?.data?.error || 'Failed to publish slot.';
    toastError(createError.value);
  } finally {
    creating.value = false;
  }
};

const toggleSlotDetails = async (slotId) => {
  if (expandedSlot.value === slotId) { expandedSlot.value = null; return; }
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

const deleteSlot = async (slotId) => {
  if (!confirm('Are you sure you want to delete this slot? All registered bookings and waitlists will be cancelled.')) return;
  try {
    await api.delete(`slots/${slotId}`);
    toastSuccess('Slot deleted successfully.');
    if (expandedSlot.value === slotId) expandedSlot.value = null;
    await fetchMySlots();
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to delete slot.');
  }
};

const cancelBooking = async (slotId, bookingId) => {
  if (!confirm('Cancel this confirmed guest?')) return;
  try {
    await api.post(`bookings/${bookingId}/cancel`);
    toastSuccess('Booking cancelled.');
    await toggleSlotDetails(slotId); // close
    await toggleSlotDetails(slotId); // reopen to refresh roster
    await fetchMySlots();
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to drop booking.');
  }
};

const cancelWaitlist = async (slotId, waitlistId) => {
  if (!confirm('Remove this person from the waitlist?')) return;
  try {
    await api.post(`waitlist/${waitlistId}/cancel`);
    toastSuccess('Removed from waitlist.');
    await toggleSlotDetails(slotId); // close
    await toggleSlotDetails(slotId); // reopen to refresh roster
    await fetchMySlots();
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to drop waitlist.');
  }
};
</script>

<style scoped>
.py-lg { padding: 3rem 0; }
.py-sm { padding: 1.5rem 0; }
.mt-lg { margin-top: 2rem; }
.ml-auto { margin-left: auto; }

/* ── Professional Dashboard Header ── */
.host-header {
  position: relative;
  overflow: hidden;
  padding: 3rem 0 2.5rem;
  min-height: 200px;
  display: flex;
  align-items: center;
}
.host-header-bg {
  position: absolute; inset: 0;
  background-image: url('https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1400&auto=format&fit=crop&q=80');
  background-size: cover;
  background-position: center 30%;
}
.host-header-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(100deg, rgba(6,10,18,0.88) 0%, rgba(20,12,4,0.80) 60%, rgba(6,10,18,0.70) 100%);
  z-index: 1;
}
.host-header-inner {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  width: 100%;
}
.host-breadcrumb {
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 0.7rem;
}
.breadcrumb-tag {
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.14em; color: #fff;
  background: var(--primary);
  padding: 0.22em 0.85em; border-radius: 20px;
}
.breadcrumb-sep { color: rgba(255,255,255,0.35); font-size: 0.78rem; }
.breadcrumb-current { font-size: 0.8rem; color: rgba(255,255,255,0.55); font-weight: 500; }

.host-header-title {
  font-family: var(--font-heading);
  font-size: clamp(1.7rem, 3vw, 2.3rem);
  font-weight: 700;
  color: #FDFBF7;
  line-height: 1.15;
  margin-bottom: 0.4rem;
}
.host-header-sub {
  font-size: 0.9rem; color: rgba(255,255,255,0.58); max-width: 440px; line-height: 1.55;
}
.host-header-right {
  display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap;
}
.host-name-badge {
  display: flex; align-items: center; gap: 0.7rem;
  background: rgba(255,255,255,0.09);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 12px;
  padding: 0.65rem 1rem;
  flex-shrink: 0;
}
.host-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #c9922a);
  color: #fff; font-size: 1rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-heading);
}
.host-label { font-size: 0.65rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.1rem; }
.host-name  { font-size: 0.88rem; color: rgba(255,255,255,0.9); font-weight: 600; }

.host-date-badge {
  display: flex; align-items: center; gap: 0.45rem;
  font-size: 0.82rem; font-weight: 500; color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.09);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  padding: 0.55rem 0.9rem;
  white-space: nowrap;
}
.date-icon { font-size: 0.88rem; }

/* ── KPI Cards ── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}
.kpi-card {
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s, box-shadow 0.25s;
}
.kpi-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.kpi-icon { font-size: 1.75rem; flex-shrink: 0; }
.kpi-body { display: flex; flex-direction: column; }
.kpi-num { font-size: 1.85rem; font-weight: 700; font-family: var(--font-heading); color: var(--secondary); line-height: 1; }
.kpi-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.2rem; }

/* Dashboard Layout */
.dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
@media (min-width: 960px) { .dashboard-grid { grid-template-columns: 360px 1fr; } }

.panel {
  background: var(--surface);
  border-radius: 14px;
  padding: 2rem;
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-md);
}
.create-panel { align-self: start; }
.panel-h { font-size: 1.5rem; margin-bottom: 0.5rem; }

.create-form { margin-top: 1.75rem; }
.field { margin-bottom: 1rem; }
label { display: block; font-size: 0.85rem; font-weight: 500; color: var(--secondary); margin-bottom: 0.4rem; }
.create-btn { width: 100%; padding: 0.85rem; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 0.5rem; }

.field-error { margin-top: 0.75rem; font-size: 0.88rem; color: var(--error); font-weight: 500; }
.field-success { margin-top: 0.75rem; font-size: 0.88rem; color: var(--success); font-weight: 500; }

/* Slot List */
.panel-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
.slot-list { display: flex; flex-direction: column; gap: 0.75rem; }

.slot-row {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition: box-shadow 0.25s;
}
.slot-row:hover { box-shadow: var(--shadow-md); }
.slot-row.expanded { border-color: var(--secondary); }

.slot-row-head {
  display: flex; align-items: center; gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  cursor: pointer;
  background: var(--surface);
  transition: background 0.2s;
}
.slot-row-head:hover { background: var(--secondary-light); }

.slot-date-badge {
  display: flex; flex-direction: column; align-items: center;
  background: var(--secondary); color: #fff;
  border-radius: 8px; padding: 0.4rem 0.65rem;
  min-width: 46px; text-align: center; flex-shrink: 0;
}
.bd { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; line-height: 1; }
.bm { font-size: 0.6rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8; }

.slot-info h4 { font-size: 1.05rem; margin-bottom: 0.1rem; }
.slot-actions-group { display: flex; align-items: center; gap: 0.5rem; margin-left: auto; }
.toggle-btn {
  background: transparent; color: var(--text-muted);
  border: 1px solid var(--border); font-size: 0.8rem; padding: 0.35em 0.85em;
  border-radius: 4px; box-shadow: none;
}
.toggle-btn:hover { background: var(--secondary); color: #fff; border-color: var(--secondary); transform: none; box-shadow: none; }
.delete-btn {
  background: transparent; border: 1px solid transparent; color: var(--text-muted);
  font-size: 1rem; padding: 0.35rem 0.6rem; border-radius: 4px; cursor: pointer; transition: all 0.2s;
}
.delete-btn:hover { background: var(--error-light); color: var(--error); border-color: rgba(197,48,48,0.2); }

/* Roster */
.roster { border-top: 1px dashed var(--border); background: var(--surface-raised); }
.roster-inner { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
/* Capacity mini-bar */
.slot-mini-bar-wrap {
  height: 5px; background: var(--border-soft); border-radius: 4px;
  overflow: hidden; margin-top: 0.5rem; width: 160px;
}
.slot-mini-bar {
  height: 100%; background: linear-gradient(90deg, #276749, #48BB78);
  border-radius: 4px; transition: width 0.5s ease;
}
.slot-mini-bar.full { background: linear-gradient(90deg, #975A16, #E8A44A); }

.roster-section { display: flex; flex-direction: column; gap: 0.65rem; }
.roster-header { display: flex; align-items: center; gap: 0.75rem; font-weight: 600; font-size: 0.88rem; color: var(--secondary); text-transform: uppercase; letter-spacing: 0.06em; }
.roster-empty { padding: 0.5rem 0; }

/* Roster mini-table */
.roster-table {
  width: 100%; border-collapse: collapse; font-size: 0.85rem;
}
.roster-table thead th {
  text-align: left; padding: 0.5rem 0.75rem;
  font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text-light);
  border-bottom: 1px solid var(--border-soft);
}
.roster-table tbody tr { border-bottom: 1px solid var(--border-soft); }
.roster-table tbody tr:last-child { border-bottom: none; }
.roster-table tbody td { padding: 0.6rem 0.75rem; vertical-align: middle; color: var(--text-main); }
.roster-table tbody td.text-muted { color: var(--text-muted); font-size: 0.82rem; }
.roster-table tbody td.pos-num { font-weight: 700; color: var(--warning); font-size: 0.85rem; }

.guest-avatar {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 50%;
  background: var(--primary); color: #fff;
  font-weight: 700; font-size: 0.75rem;
  font-family: var(--font-heading);
  vertical-align: middle; margin-right: 0.4rem;
}
.guest-avatar.wait { background: var(--warning); }


.sm-spinner {
  width: 28px; height: 28px; margin: 0 auto;
  border: 2px solid rgba(142,35,35,0.1); border-top-color: var(--primary);
  border-radius: 50%; animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.remove-btn {
  background: transparent; border: 1px solid var(--error); color: var(--error); font-size: 0.75rem;
  padding: 0.2rem 0.6rem; border-radius: 4px; cursor: pointer; transition: all 0.2s;
  text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;
}
.remove-btn:hover { background: var(--error); color: #fff; }
</style>