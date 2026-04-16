<template>
  <div class="dashboard-page">

    <!-- Welcome Header -->
    <div class="dash-header">
      <div class="container dash-header-inner">
        <div class="dash-welcome">
          <div class="dash-avatar">{{ authStore.user?.name?.charAt(0) }}</div>
          <div>
            <p class="dash-greeting">Welcome back,</p>
            <h1 class="dash-name">{{ authStore.user?.name }}</h1>
          </div>
        </div>
        <RouterLink to="/slots" class="dash-browse-btn">
          <span>🍽️</span> Browse Available Slots
        </RouterLink>
      </div>
    </div>

    <div class="container dash-body">

      <!-- Loading -->
      <div v-if="loading" class="text-center py-xl fade-up">
        <div class="spinner"></div>
        <p class="text-muted">Loading your dashboard...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="inline-error fade-up">{{ error }}</div>

      <template v-else>
        <!-- KPI Cards -->
        <div class="kpi-row fade-up">
          <div class="kpi-card">
            <div class="kpi-icon-wrap confirmed-bg">🍽️</div>
            <div class="kpi-info">
              <span class="kpi-num">{{ bookings.length }}</span>
              <span class="kpi-label">Confirmed</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon-wrap waitlist-bg">⏳</div>
            <div class="kpi-info">
              <span class="kpi-num">{{ waitlists.length }}</span>
              <span class="kpi-label">On Waitlist</span>
            </div>
          </div>
          <div class="kpi-card">
            <div class="kpi-icon-wrap next-bg">📅</div>
            <div class="kpi-info">
              <span class="kpi-num next-text">{{ nextBookingLabel }}</span>
              <span class="kpi-label">Next Reservation</span>
            </div>
          </div>
        </div>

        <!-- Two-column layout -->
        <div class="two-col">

          <!-- ── Confirmed Reservations ── -->
          <section class="dash-section fade-up">
            <div class="section-title-row">
              <div class="section-title-left">
                <span class="section-dot confirmed-dot"></span>
                <h2>Upcoming Reservations</h2>
              </div>
              <span v-if="bookings.length" class="pill success">{{ bookings.length }} confirmed</span>
            </div>

            <!-- Empty -->
            <div v-if="bookings.length === 0" class="empty-card">
              <span class="empty-icon">📅</span>
              <div class="empty-text">
                <p class="empty-title">No reservations yet</p>
                <p class="empty-sub">Browse available slots and book your next dining experience.</p>
              </div>
              <RouterLink to="/slots" class="empty-cta">Browse Slots →</RouterLink>
            </div>

            <!-- List -->
            <div v-else class="booking-list">
              <div
                v-for="b in bookings"
                :key="b.booking_id"
                class="booking-card confirmed-card"
              >
                <!-- Date badge -->
                <div class="date-badge confirmed-badge">
                  <span class="bd">{{ formatDayMonth(b.start_time).day }}</span>
                  <span class="bm">{{ formatDayMonth(b.start_time).month }}</span>
                </div>

                <!-- Info -->
                <div class="booking-info">
                  <div class="booking-time">{{ formatTimeOnly(b.start_time) }} – {{ formatTimeOnly(b.end_time) }}</div>
                  <div class="booking-date-str">{{ formatDayMonth(b.start_time).weekday }}, {{ formatDayMonth(b.start_time).month }} {{ formatDayMonth(b.start_time).day }}</div>
                  <div class="booking-countdown" v-if="countdown(b.start_time)">
                    <span class="cd-dot"></span> {{ countdown(b.start_time) }}
                  </div>
                </div>

                <!-- Status + Action -->
                <div class="booking-right">
                  <span class="status-chip confirmed-chip">✓ Confirmed</span>
                  <button
                    class="cancel-btn"
                    @click="cancelBooking(b.booking_id)"
                    :disabled="actionLoading === b.booking_id"
                  >
                    {{ actionLoading === b.booking_id ? 'Canceling...' : 'Cancel' }}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- ── Waitlist ── -->
          <section class="dash-section fade-up delay-100">
            <div class="section-title-row">
              <div class="section-title-left">
                <span class="section-dot waitlist-dot"></span>
                <h2>Waitlist</h2>
              </div>
              <span v-if="waitlists.length" class="pill warning">{{ waitlists.length }} waiting</span>
            </div>

            <!-- Empty -->
            <div v-if="waitlists.length === 0" class="empty-card">
              <span class="empty-icon">✅</span>
              <div class="empty-text">
                <p class="empty-title">No waitlist entries</p>
                <p class="empty-sub">You're not queued for any full slots right now.</p>
              </div>
            </div>

            <!-- List -->
            <div v-else class="booking-list">
              <div
                v-for="(w, idx) in waitlists"
                :key="w.waitlist_id"
                class="booking-card waitlist-card"
              >
                <!-- Position badge -->
                <div class="date-badge waitlist-badge">
                  <span class="pos-num">#{{ idx + 1 }}</span>
                  <span class="bm">queue</span>
                </div>

                <!-- Info -->
                <div class="booking-info">
                  <div class="booking-time">{{ formatTimeOnly(w.start_time) }} – {{ formatTimeOnly(w.end_time) }}</div>
                  <div class="booking-date-str">{{ formatDayMonth(w.start_time).weekday }}, {{ formatDayMonth(w.start_time).month }} {{ formatDayMonth(w.start_time).day }}</div>
                  <div class="waitlist-note">Auto-promoted when a seat opens</div>
                </div>

                <!-- Status -->
                <div class="booking-right">
                  <span class="status-chip waitlist-chip">⏳ Waiting</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import api from '../api/api';
import { useFormatters } from '../composables/useFormatters';
import { useScrollReveal } from '../composables/useScrollReveal';
import { useToast } from '../composables/useToast';
import { useAuthStore } from '../stores/auth';

const { formatDateTime, formatTimeOnly, formatDayMonth } = useFormatters();
const { error: toastError, success: toastSuccess } = useToast();
const authStore = useAuthStore();
useScrollReveal();

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
    error.value = 'Failed to load your dashboard. Please try again.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const nextBookingLabel = computed(() => {
  if (bookings.value.length === 0) return '—';
  const next = bookings.value[0]; // already sorted ascending
  const d = new Date(next.start_time);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today ${time}`;
  if (isTomorrow) return `Tomorrow`;
  return `${formatDayMonth(next.start_time).month} ${formatDayMonth(next.start_time).day}`;
});

const countdown = (start) => {
  const diff = new Date(start) - Date.now();
  if (diff <= 0) return '';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `In ${d}d ${h}h`;
  if (h > 0) return `In ${h}h ${m}m`;
  return `In ${m}m`;
};

const cancelBooking = async (bookingId) => {
  if (!confirm('Cancel this reservation?')) return;
  actionLoading.value = bookingId;
  try {
    await api.post(`bookings/${bookingId}/cancel`);
    bookings.value = bookings.value.filter(b => b.booking_id !== bookingId);
    toastSuccess('Reservation cancelled.');
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to cancel.');
  } finally {
    actionLoading.value = null;
  }
};
</script>

<style scoped>
/* ── Page layout ── */
.dashboard-page {
  min-height: calc(100vh - var(--nav-height));
  background: var(--background);
}

.py-xl { padding: 4rem 0; }

/* ── Welcome header ── */
.dash-header {
  background: var(--secondary);
  background-image: linear-gradient(120deg, #0f1117 0%, #1c2331 100%);
  padding: 2.5rem 0;
  border-bottom: 3px solid var(--primary);
}

.dash-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.dash-welcome {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.dash-avatar {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #c9922a);
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--font-heading);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 3px solid rgba(255,255,255,0.15);
}

.dash-greeting {
  font-size: 0.8rem;
  color: rgba(255,255,255,0.45);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 0.2rem;
}

.dash-name {
  font-size: clamp(1.4rem, 3vw, 2rem);
  color: #FDFBF7;
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.1;
}

.dash-browse-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.dash-browse-btn:hover { background: var(--primary-hover); transform: translateY(-2px); color: #fff; }

/* ── Body ── */
.dash-body {
  padding: 2rem 2rem 5rem;
}

/* ── KPI Row ── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.kpi-card {
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.1rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.25s, box-shadow 0.25s;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

.kpi-icon-wrap {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}
.confirmed-bg { background: rgba(39,103,73,0.12); }
.waitlist-bg  { background: rgba(214,158,46,0.12); }
.next-bg      { background: rgba(91,155,213,0.12); }

.kpi-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.kpi-num {
  font-size: 1.8rem;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--secondary);
  line-height: 1;
}
.next-text {
  font-size: 1.1rem;
  line-height: 1.2;
}
.kpi-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 0.25rem;
}

/* ── Two-column layout ── */
.two-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
@media (min-width: 860px) {
  .two-col { grid-template-columns: 1fr 1fr; }
}

/* ── Section ── */
.dash-section { display: flex; flex-direction: column; }

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}
.section-title-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.section-title-left h2 {
  font-size: 1.15rem;
  color: var(--secondary);
}
.section-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.confirmed-dot { background: var(--success); box-shadow: 0 0 0 3px rgba(39,103,73,0.18); }
.waitlist-dot  { background: var(--warning); box-shadow: 0 0 0 3px rgba(214,158,46,0.18); }

/* Pills */
.pill {
  display: inline-block;
  padding: 0.2em 0.7em;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.pill.success { background: var(--success-light); color: var(--success); border: 1px solid rgba(39,103,73,0.2); }
.pill.warning { background: var(--warning-light); color: var(--warning); border: 1px solid rgba(214,158,46,0.2); }

/* ── Empty card ── */
.empty-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface);
  border: 1.5px dashed var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  flex-wrap: wrap;
}
.empty-icon { font-size: 1.75rem; flex-shrink: 0; }
.empty-text { flex: 1; min-width: 0; }
.empty-title { font-weight: 600; font-size: 0.9rem; color: var(--text-main); margin-bottom: 0.2rem; }
.empty-sub   { font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; }
.empty-cta {
  margin-left: auto;
  background: var(--primary);
  color: #fff;
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s;
  flex-shrink: 0;
}
.empty-cta:hover { background: var(--primary-hover); color: #fff; }

/* ── Booking list ── */
.booking-list { display: flex; flex-direction: column; gap: 0.75rem; }

.booking-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, transform 0.2s;
  position: relative;
  overflow: hidden;
}
.booking-card:hover { box-shadow: var(--shadow-md); transform: translateX(3px); }

/* Left accent bar */
.booking-card::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 12px 0 0 12px;
}
.confirmed-card::before { background: var(--success); }
.waitlist-card::before  { background: var(--warning); }

/* Date / position badge */
.date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 8px;
  padding: 0.45rem 0.6rem;
  min-width: 44px;
  text-align: center;
  flex-shrink: 0;
}
.confirmed-badge { background: var(--success); color: #fff; }
.waitlist-badge  { background: var(--warning); color: #fff; }

.bd { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; line-height: 1; }
.bm { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.85; }
.pos-num { font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; line-height: 1; }

/* Booking info */
.booking-info { flex: 1; min-width: 0; }
.booking-time  { font-size: 1rem; font-weight: 600; color: var(--secondary); margin-bottom: 0.1rem; }
.booking-date-str { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem; }

.booking-countdown {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  background: var(--primary-light);
  color: var(--primary);
  border: 1px solid rgba(139,90,43,0.2);
  padding: 0.15em 0.55em;
  border-radius: 20px;
  margin-top: 0.15rem;
}
.cd-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--primary);
  animation: cdpulse 2s ease-in-out infinite;
}
@keyframes cdpulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(139,90,43,0.5); }
  50%      { box-shadow: 0 0 0 4px rgba(139,90,43,0); }
}

.waitlist-note {
  font-size: 0.75rem;
  color: var(--warning);
  font-style: italic;
  margin-top: 0.25rem;
}

/* Right column */
.booking-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25em 0.75em;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}
.confirmed-chip { background: var(--success-light); color: var(--success); border: 1px solid rgba(39,103,73,0.2); }
.waitlist-chip  { background: var(--warning-light);  color: var(--warning);  border: 1px solid rgba(214,158,46,0.2); }

.cancel-btn {
  font-size: 0.78rem;
  padding: 0.3em 0.85em;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 6px;
  box-shadow: none;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.cancel-btn:hover:not(:disabled) {
  background: var(--error-light);
  color: var(--error);
  border-color: var(--error);
  transform: none;
  box-shadow: none;
}
.cancel-btn:disabled { opacity: 0.5; }

/* Error */
.inline-error {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  background: var(--error-light);
  color: var(--error);
  border: 1px solid rgba(197,48,48,0.2);
  max-width: 520px;
  margin: 3rem auto;
  text-align: center;
}
</style>
