<template>
  <div>
    <!-- Rich Hero Banner -->
    <div class="bookings-hero">
      <div class="bookings-hero-overlay"></div>
      <div class="bookings-hero-bg"></div>
      <div class="container bookings-hero-inner">
        <div class="bookings-hero-text">
          <p class="hero-eyebrow fade-up">🍷 Your Dining Journey</p>
          <h1 class="bookings-hero-title fade-up delay-100">My <em>Reservations</em></h1>
          <p class="bookings-hero-sub fade-up delay-200">Manage your upcoming dining times and track your waitlist position.</p>
          <div class="bookings-hero-stats fade-up delay-300">
            <div class="hero-stat">
              <span class="hero-stat-num">{{ bookings.length }}</span>
              <span class="hero-stat-label">Confirmed</span>
            </div>
            <div class="hero-stat-div"></div>
            <div class="hero-stat">
              <span class="hero-stat-num">{{ waitlists.length }}</span>
              <span class="hero-stat-label">On Waitlist</span>
            </div>
          </div>
        </div>
        <div class="bookings-hero-photo">
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop&q=80"
            alt="Fine dining table setting"
          />
        </div>
      </div>
    </div>

    <div class="container content-section">
      <div v-if="loading" class="text-center py-lg fade-up">
        <div class="spinner"></div>
        <p class="text-muted">Loading your itinerary...</p>
      </div>

      <div v-else-if="error" class="inline-error fade-up">{{ error }}</div>

      <div v-else class="two-col-layout fade-up delay-100">
        <!-- Confirmed Reservations -->
        <section class="section">
          <div class="section-header">
            <div class="section-header-left">
              <span class="section-icon">🍽️</span>
              <h3>Confirmed Reservations</h3>
            </div>
            <span v-if="bookings.length" class="badge success">{{ bookings.length }} Upcoming</span>
          </div>

          <div v-if="bookings.length === 0" class="empty-card">
            <span class="empty-card-icon">📅</span>
            <div>
              <p class="empty-card-title">No upcoming reservations</p>
              <p class="empty-card-sub">You haven't booked a table yet.</p>
            </div>
            <RouterLink to="/slots" class="empty-card-cta">Browse Tables →</RouterLink>
          </div>

          <div v-else class="reservation-list">
            <div v-for="b in bookings" :key="b.booking_id" class="reservation-item confirmed-item">
              <!-- Watermark -->
              <span class="res-watermark">🍷</span>
              <!-- Left accent -->
              <div class="res-accent confirmed-accent"></div>
              <!-- Date badge -->
              <div class="res-date-badge">
                <span class="bd">{{ formatDayMonth(b.start_time).day }}</span>
                <span class="bm">{{ formatDayMonth(b.start_time).month }}</span>
              </div>
              <div class="res-info">
                <h4>{{ formatDateTime(b.start_time) }}</h4>
                <p class="text-muted text-sm">{{ formatDayMonth(b.start_time).weekday }} · Dining until {{ formatTimeOnly(b.end_time) }}</p>
                <div class="res-countdown" v-if="countdown(b.start_time)">⏱ {{ countdown(b.start_time) }}</div>
                <div class="res-status confirmed">
                  <span class="status-dot pulse"></span> Confirmed
                </div>
              </div>
              <div class="res-action">
                <button @click="cancelBooking(b.booking_id)" :disabled="actionLoading === b.booking_id" class="cancel-btn secondary">
                  {{ actionLoading === b.booking_id ? 'Canceling...' : 'Cancel' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Waitlist Entries -->
        <section class="section">
          <div class="section-header">
            <div class="section-header-left">
              <span class="section-icon">⏳</span>
              <h3>Waitlist</h3>
            </div>
            <span v-if="waitlists.length" class="badge warning">{{ waitlists.length }} Waiting</span>
          </div>

          <div v-if="waitlists.length === 0" class="empty-card">
            <span class="empty-card-icon">✅</span>
            <div>
              <p class="empty-card-title">No waitlist entries</p>
              <p class="empty-card-sub">You're not waiting on any full slots.</p>
            </div>
          </div>

          <div v-else class="reservation-list">
            <div v-for="w in waitlists" :key="w.waitlist_id" class="reservation-item waitlist-item">
              <span class="res-watermark">⏰</span>
              <div class="res-accent waitlist-accent"></div>
              <div class="res-date-badge waitlist-badge">
                <span class="bd">{{ formatDayMonth(w.start_time).day }}</span>
                <span class="bm">{{ formatDayMonth(w.start_time).month }}</span>
              </div>
              <div class="res-info">
                <h4>{{ formatDateTime(w.start_time) }}</h4>
                <p class="text-muted text-sm">{{ formatDayMonth(w.start_time).weekday }} · Until {{ formatTimeOnly(w.end_time) }}</p>
                <div class="res-status waiting">
                  <span class="status-dot"></span> Waiting for availability
                </div>
              </div>
              <div class="res-action">
                <span class="waitlist-note text-sm">You'll be auto-promoted if a seat opens</span>
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
import { useFormatters } from '../composables/useFormatters';
import { useScrollReveal } from '../composables/useScrollReveal';
import { useToast } from '../composables/useToast';

const { formatDateTime, formatTimeOnly, formatDayMonth } = useFormatters();
const { error: toastError, success: toastSuccess } = useToast();
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
    error.value = 'Failed to load your reservations. Please try again.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

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
  if (!confirm('Are you sure you want to cancel this reservation?')) return;
  actionLoading.value = bookingId;
  try {
    await api.post(`bookings/${bookingId}/cancel`);
    bookings.value = bookings.value.filter(b => b.booking_id !== bookingId);
    toastSuccess('Reservation cancelled successfully.');
  } catch (err) {
    toastError(err.response?.data?.error || 'Failed to cancel reservation.');
  } finally {
    actionLoading.value = null;
  }
};
</script>

<style scoped>
.py-lg { padding: 4rem 0; }

/* ── Bookings Hero ── */
.bookings-hero {
  position: relative;
  background: #0d1117;
  overflow: hidden;
  min-height: 44vh;
  display: flex;
  align-items: center;
  padding-bottom: 4rem;
}
.bookings-hero-bg {
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1400&auto=format&fit=crop&q=80');
  background-size: cover;
  background-position: center;
  opacity: 0.28;
}
.bookings-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(100deg, rgba(8,12,22,0.95) 45%, rgba(8,12,22,0.5) 100%);
  z-index: 1;
}
.bookings-hero-inner {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  align-items: center;
  padding-top: 4rem;
}
@media (min-width: 860px) {
  .bookings-hero-inner { grid-template-columns: 1fr 380px; }
}
.hero-eyebrow {
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.2em;
  text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 1rem;
}
.bookings-hero-title {
  font-family: var(--font-heading);
  font-size: clamp(2.2rem, 4.5vw, 3.5rem);
  font-weight: 700; color: #FDFBF7; line-height: 1.1; margin-bottom: 0.85rem;
}
.bookings-hero-title em { font-style: italic; color: #e0c9a6; }
.bookings-hero-sub {
  color: rgba(255,255,255,0.62); font-size: 1rem; line-height: 1.7; margin-bottom: 2rem; max-width: 480px;
}
.bookings-hero-stats { display: flex; align-items: center; gap: 1.5rem; }
.hero-stat { text-align: center; }
.hero-stat-num {
  display: block; font-size: 2rem; font-weight: 700;
  font-family: var(--font-heading); color: #e0c9a6; line-height: 1;
}
.hero-stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.1em; }
.hero-stat-div { width: 1px; height: 40px; background: rgba(255,255,255,0.15); }

.bookings-hero-photo {
  display: none;
}
@media (min-width: 860px) {
  .bookings-hero-photo {
    display: block;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08);
  }
  .bookings-hero-photo img {
    width: 100%; height: 300px;
    object-fit: cover; display: block;
    filter: brightness(0.88) saturate(1.1);
  }
}

/* Sections */
.section { margin-bottom: 4rem; }
.section-header {
  display: flex; align-items: center; gap: 1rem;
  margin-bottom: 1.75rem; padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
}
.section-header h3 { font-size: 1.6rem; }

.reservation-list { display: flex; flex-direction: column; gap: 1rem; }

.reservation-item {
  display: flex; align-items: center; gap: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 1.5rem 2rem 1.5rem 1.75rem;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.25s, transform 0.25s;
  position: relative;
  overflow: hidden;
}
.reservation-item:hover { box-shadow: var(--shadow-md); transform: translateX(4px); }

/* Left accent bar */
.res-accent {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 4px;
  border-radius: 12px 0 0 12px;
}
.confirmed-accent { background: linear-gradient(180deg, #276749, #48BB78); }
.waitlist-accent  { background: linear-gradient(180deg, #975A16, #E8A44A); }

/* Ambient watermark */
.res-watermark {
  position: absolute;
  top: 50%; right: 1.25rem;
  transform: translateY(-50%);
  font-size: 3.5rem;
  opacity: 0.05;
  pointer-events: none;
  user-select: none;
}

.res-date-badge {
  display: flex; flex-direction: column; align-items: center;
  background: var(--primary); color: #fff;
  border-radius: 8px; padding: 0.5rem 0.75rem;
  min-width: 50px; text-align: center; flex-shrink: 0;
}
.res-date-badge.waitlist-badge { background: var(--warning); }
.bd { font-family: var(--font-heading); font-size: 1.5rem; font-weight: 700; line-height: 1; }
.bm { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.85; }

.res-info { flex: 1; min-width: 0; }
.res-info h4 { font-size: 1.1rem; margin-bottom: 0.2rem; }

.res-status { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.83rem; margin-top: 0.5rem; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.status-dot.pulse { animation: dot-pulse 2s ease-in-out infinite; }
.res-status.confirmed { color: var(--success); }
.res-status.confirmed .status-dot { background: var(--success); }
.res-status.waiting { color: var(--warning); }
.res-status.waiting .status-dot { background: var(--warning); }

@keyframes dot-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(39,103,73,0.5); }
  50%       { box-shadow: 0 0 0 5px rgba(39,103,73,0); }
}

.res-action { margin-left: auto; flex-shrink: 0; }
.cancel-btn { font-size: 0.85rem; padding: 0.45em 1em; }
.waitlist-note { max-width: 180px; text-align: right; line-height: 1.4; display: block; color: var(--text-muted); font-size: 0.82rem; }

/* Section header */
/* Two-column desktop layout */
.two-col-layout { display: grid; grid-template-columns: 1fr; gap: 0; }
@media (min-width: 900px) {
  .two-col-layout { grid-template-columns: 1fr 1fr; gap: 2rem; }
}

/* Countdown chip */
.res-countdown {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-size: 0.75rem; font-weight: 700;
  background: var(--primary-light); color: var(--primary);
  border: 1px solid rgba(139,90,43,0.2);
  padding: 0.2em 0.65em; border-radius: 20px;
  margin-top: 0.35rem; margin-bottom: 0.25rem;
}

.section-header-left { display: flex; align-items: center; gap: 0.6rem; }
.section-icon { font-size: 1.1rem; }

/* Empty card (inline horizontal layout) */
.empty-card {
  display: flex; align-items: center; gap: 1.25rem;
  background: var(--surface);
  border: 1.5px dashed var(--border);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  color: var(--text-muted);
}
.empty-card-icon { font-size: 2rem; flex-shrink: 0; }
.empty-card-title { font-weight: 600; color: var(--text-main); font-size: 0.95rem; margin-bottom: 0.25rem; }
.empty-card-sub { font-size: 0.85rem; color: var(--text-muted); }
.empty-card-cta {
  margin-left: auto; flex-shrink: 0;
  background: var(--primary); color: #fff;
  padding: 0.55rem 1.25rem; border-radius: 8px;
  font-size: 0.85rem; font-weight: 600; text-decoration: none;
  white-space: nowrap;
  transition: background 0.2s, transform 0.2s;
}
.empty-card-cta:hover { background: var(--primary-hover); transform: translateY(-1px); }

.inline-error { padding: 1rem 1.5rem; border-radius: 8px; background: var(--error-light); color: var(--error); border: 1px solid rgba(197,48,48,0.2); max-width: 520px; margin: 3rem auto; text-align: center; }
</style>
