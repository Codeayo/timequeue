<template>
  <div>
    <!-- Rich Host Hero Banner -->
    <div class="host-hero">
      <div class="host-hero-bg"></div>
      <div class="host-hero-overlay"></div>
      <div class="container host-hero-content">
        <div class="host-hero-text">
          <p class="host-eyebrow fade-up">🔑 Staff Portal · Host Mode</p>
          <h1 class="host-hero-title fade-up delay-100">Host <em>Dashboard</em></h1>
          <p class="host-hero-sub fade-up delay-200">Manage your restaurant's availability and monitor your full guest roster in real time.</p>
        </div>
        <div class="host-name-badge fade-up delay-300">
          <span class="host-avatar">{{ authStore.user?.name?.charAt(0) }}</span>
          <div>
            <p class="host-label">Signed in as</p>
            <p class="host-name">{{ authStore.user?.name }}</p>
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
                    <div class="slot-mini-bar" :style="{ width: ((slot.total_capacity - slot.available_capacity) / slot.total_capacity * 100) + '%' }" :class="slot.available_capacity === 0 ? 'full' : ''"></div>
                  </div>
                </div>
                <button class="toggle-btn">
                  <span>{{ expandedSlot === slot.id ? '▲ Hide' : '▼ Roster' }}</span>
                </button>
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
                      <thead><tr><th>Guest</th><th>Email</th><th>Status</th></tr></thead>
                      <tbody>
                        <tr v-for="b in slotDetails.bookings" :key="b.id">
                          <td><span class="guest-avatar">{{ b.name?.charAt(0) }}</span> {{ b.name }}</td>
                          <td class="text-muted">{{ b.email }}</td>
                          <td><span class="badge success">Confirmed</span></td>
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
                      <thead><tr><th>#</th><th>Guest</th><th>Email</th><th>Status</th></tr></thead>
                      <tbody>
                        <tr v-for="(w, idx) in slotDetails.waitlists" :key="w.id">
                          <td class="pos-num">#{{ idx + 1 }}</td>
                          <td><span class="guest-avatar wait">{{ w.name?.charAt(0) }}</span> {{ w.name }}</td>
                          <td class="text-muted">{{ w.email }}</td>
                          <td><span class="badge warning">Waiting</span></td>
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
const totalConfirmed  = computed(() => mySlots.value.reduce((s, sl) => s + (sl.bookings_count   ?? 0), 0));
const totalWaitlisted = computed(() => mySlots.value.reduce((s, sl) => s + (sl.waitlist_count   ?? 0), 0));
const totalCapacity   = computed(() => mySlots.value.reduce((s, sl) => s + (sl.total_capacity   ?? 0), 0));

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
</script>

<style scoped>
.py-lg { padding: 3rem 0; }
.py-sm { padding: 1.5rem 0; }
.mt-lg { margin-top: 2rem; }
.ml-auto { margin-left: auto; }

/* ── Host Hero ── */
.host-hero {
  position: relative;
  overflow: hidden;
  min-height: 40vh;
  display: flex;
  align-items: center;
  padding-bottom: 4rem;
}
.host-hero-bg {
  position: absolute; inset: 0;
  background-image: url('https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1400&auto=format&fit=crop&q=80');
  background-size: cover;
  background-position: center 40%;
  opacity: 0.3;
}
.host-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(120deg, rgba(8,12,22,0.96) 40%, rgba(20,10,5,0.82) 100%);
  z-index: 1;
}
.host-hero-content {
  position: relative; z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  padding-top: 4rem;
}
.host-eyebrow {
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.2em;
  text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 1rem;
}
.host-hero-title {
  font-family: var(--font-heading); font-size: clamp(2rem, 4.5vw, 3.5rem);
  font-weight: 700; color: #FDFBF7; line-height: 1.1; margin-bottom: 0.75rem;
}
.host-hero-title em { font-style: italic; color: #e0c9a6; }
.host-hero-sub { color: rgba(255,255,255,0.6); font-size: 1rem; max-width: 500px; line-height: 1.65; }

.host-name-badge {
  display: flex; align-items: center; gap: 0.85rem;
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 0.85rem 1.25rem;
  flex-shrink: 0;
}
.host-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #c9922a);
  color: #fff; font-size: 1.1rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-heading);
}
.host-label { font-size: 0.68rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.15rem; }
.host-name  { font-size: 0.9rem; color: rgba(255,255,255,0.88); font-weight: 600; }

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
.toggle-btn {
  margin-left: auto; background: transparent; color: var(--text-muted);
  border: 1px solid var(--border); font-size: 0.8rem; padding: 0.35em 0.85em;
  border-radius: 4px; box-shadow: none;
}
.toggle-btn:hover { background: var(--secondary); color: #fff; border-color: var(--secondary); transform: none; box-shadow: none; }

/* Roster */
.roster { border-top: 1px dashed var(--border); background: #f9f8f6; }
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
</style>