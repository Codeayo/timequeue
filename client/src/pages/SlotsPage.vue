<template>
  <div>
    <!-- Rich Page Hero -->
    <div class="slots-hero">
      <div class="slots-hero-overlay"></div>
      <div class="slots-hero-img"></div>
      <div class="container slots-hero-content">
        <p class="banner-eyebrow fade-up">🍽️ Fine Dining · Reserve Your Seat</p>
        <h1 class="slots-hero-title fade-up delay-100">Available <em>Tonight</em></h1>
        <p class="slots-hero-sub fade-up delay-200">All times are open for reservation. Book instantly — or join the waitlist if we're full.</p>
        <div class="slots-hero-pills fade-up delay-300">
          <span class="hero-pill">✔ Instant confirmation</span>
          <span class="hero-pill">📞 No phone calls needed</span>
          <span class="hero-pill">⏰ Book in under 60 seconds</span>
        </div>
      </div>
      <div class="slots-hero-scroll">↓</div>
    </div>

    <div class="container content-section">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-lg fade-up">
        <div class="spinner"></div>
        <p class="text-muted">Checking availability...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="inline-error fade-up">{{ error }}</div>

      <!-- Empty -->
      <div v-else-if="slots.length === 0" class="empty-state fade-up">
        <div class="empty-icon-wrap">
          <span class="empty-icon-main">🍽️</span>
          <span class="empty-ring"></span>
        </div>
        <h3>No Available Slots</h3>
        <p>There are no upcoming reservation slots at this time.<br>Our host will publish new availability soon.</p>
        <RouterLink to="/login" class="empty-cta">Sign In to Explore</RouterLink>
      </div>

      <!-- Slots grouped by date -->
      <div v-else>
        <!-- Toolbar -->
        <div class="slots-toolbar fade-up">
          <p class="slots-count">{{ slots.length }} session{{ slots.length !== 1 ? 's' : '' }} available</p>
        </div>

        <!-- Date Sections -->
        <div
          v-for="group in groupedSlots"
          :key="group.label"
          class="date-section fade-up"
        >
          <!-- Section header -->
          <div class="date-section-header">
            <div class="date-section-label">
              <span class="date-section-tag">{{ group.label }}</span>
              <span class="date-section-full">{{ group.fullDate }}</span>
            </div>
            <div class="date-section-rule"></div>
            <span class="date-section-count">{{ group.slots.length }} session{{ group.slots.length !== 1 ? 's' : '' }}</span>
          </div>

          <!-- Slot cards -->
          <div class="slots-grid">
            <div
              v-for="slot in group.slots"
              :key="slot.id"
              class="slot-card card"
              :class="slot.available_capacity === 0 ? 'slot-full' : 'slot-avail'"
            >
              <!-- Top accent -->
              <div class="slot-accent"></div>

              <!-- Session type badge -->
              <div class="session-type-row">
                <span class="session-badge" :class="sessionClass(slot)">{{ sessionLabel(slot) }}</span>
                <span class="duration-chip">🕒 {{ slotDuration(slot) }}</span>
              </div>

              <!-- Time display -->
              <div class="slot-time-block">
                <div class="time-main">{{ formatTimeOnly(slot.start_time) }} <span class="time-sep">–</span> {{ formatTimeOnly(slot.end_time) }}</div>
              </div>

              <!-- Capacity + progress -->
              <div class="slot-divider">
                <div class="capacity-row" :class="slot.available_capacity > 0 ? 'avail' : 'full'">
                  <span class="cap-dot"></span>
                  <span>{{ slot.available_capacity > 0 ? `${slot.available_capacity} seat${slot.available_capacity > 1 ? 's' : ''} available` : 'Waitlist only' }}</span>
                  <span class="cap-total">of {{ slot.total_capacity }}</span>
                </div>
                <div class="progress-bar-wrap">
                  <div
                    class="progress-fill"
                    :class="{ 'full': slot.available_capacity === 0 }"
                    :style="{ width: ((slot.total_capacity - slot.available_capacity) / slot.total_capacity * 100) + '%' }"
                  ></div>
                </div>
              </div>

              <!-- Action -->
              <div class="slot-action">
                <button
                  v-if="!alreadyBooked(slot.id)"
                  @click="$router.push('/book/' + slot.id)"
                  :class="slot.available_capacity === 0 ? 'secondary full-btn' : 'full-btn'"
                >
                  <span>{{ slot.available_capacity > 0 ? 'Select Time' : 'Join Waitlist' }}</span>
                </button>
                <div v-else class="already-booked-notice">
                  <span>✓</span> Reserved
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
import { RouterLink } from 'vue-router';
import api from '../api/api';
import { useFormatters } from '../composables/useFormatters';
import { useAuthStore } from '../stores/auth';
import { useScrollReveal } from '../composables/useScrollReveal';
import { useToast } from '../composables/useToast';

const { formatTimeOnly, formatDayMonth } = useFormatters();
const authStore = useAuthStore();
const { error: toastError } = useToast();
useScrollReveal();

// Session label by time of day
const sessionLabel = (slot) => {
  const h = new Date(slot.start_time).getHours();
  if (h < 11) return 'Breakfast';
  if (h < 13) return 'Brunch';
  if (h < 16) return 'Lunch';
  if (h < 18) return 'Early Dinner';
  if (h < 20) return 'Dinner';
  return 'Late Dining';
};

const sessionClass = (slot) => {
  const l = sessionLabel(slot);
  if (l === 'Breakfast') return 'sb-breakfast';
  if (l === 'Brunch')    return 'sb-brunch';
  if (l === 'Lunch')     return 'sb-lunch';
  if (l === 'Early Dinner') return 'sb-early';
  if (l === 'Dinner')    return 'sb-dinner';
  return 'sb-late';
};

const slotDuration = (slot) => {
  const mins = Math.round((new Date(slot.end_time) - new Date(slot.start_time)) / 60000);
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const slots = ref([]);
const listView = ref(false);
const myBookingSlotIds = ref(new Set());
const loading = ref(true);
const error = ref('');

const fetchAll = async () => {
  try {
    const [slotsRes, bookingsRes] = await Promise.all([
      api.get('slots'),
      authStore.isAuthenticated ? api.get('bookings') : Promise.resolve({ data: { bookings: [] } })
    ]);
    slots.value = slotsRes.data;
    myBookingSlotIds.value = new Set(
      bookingsRes.data.bookings.map(b => b.slot_id)
    );
  } catch (err) {
    error.value = 'Failed to load availability. Please try again.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAll);

// Group slots by calendar day
const groupedSlots = computed(() => {
  const map = {};
  const now = new Date();
  for (const slot of slots.value) {
    const d = new Date(slot.start_time);
    const key = d.toDateString();
    if (!map[key]) {
      const diff = Math.floor((d - now) / 86400000);
      const isToday = d.toDateString() === now.toDateString();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const isTomorrow = d.toDateString() === tomorrow.toDateString();
      let label = isToday ? 'Today' : isTomorrow ? 'Tomorrow'
        : d.toLocaleString('en-US', { weekday: 'long' });
      map[key] = {
        label,
        fullDate: d.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        slots: [],
      };
    }
    map[key].slots.push(slot);
  }
  return Object.values(map);
});

const alreadyBooked = (slotId) => myBookingSlotIds.value.has(slotId);

// Booking is now handled by BookAppointmentPage.vue
</script>

<style scoped>
/* ── Slots Hero ── */
.slots-hero {
  position: relative;
  min-height: 48vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding-bottom: 4rem;
}

.slots-hero-img {
  position: absolute;
  inset: 0;
  background-image: url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop&q=80');
  background-size: cover;
  background-position: center 30%;
  transform: scale(1.05);
  transition: transform 8s ease;
}
.slots-hero:hover .slots-hero-img { transform: scale(1); }

.slots-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 14, 24, 0.82) 0%,
    rgba(26, 18, 10, 0.75) 60%,
    rgba(139, 90, 43, 0.35) 100%
  );
  z-index: 1;
}

.slots-hero-content {
  position: relative;
  z-index: 2;
  padding-top: 4rem;
}

.slots-hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-family: var(--font-heading);
  font-weight: 700;
  color: #FDFBF7;
  line-height: 1.1;
  margin-bottom: 1rem;
}
.slots-hero-title em {
  font-style: italic;
  color: #e0c9a6;
}

.banner-eyebrow {
  font-size: 0.8rem; font-weight: 600; letter-spacing: 0.2em;
  text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 1rem;
}

.slots-hero-sub {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.05rem;
  max-width: 560px;
  line-height: 1.7;
  margin-bottom: 2rem;
  font-weight: 400;
}

.slots-hero-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}
.hero-pill {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.88);
  padding: 0.4em 1em;
  border-radius: 100px;
  font-size: 0.82rem;
  font-weight: 500;
}

.slots-hero-scroll {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255,255,255,0.4);
  font-size: 1.1rem;
  animation: bounce-hint 2.5s ease-in-out infinite;
  z-index: 2;
}
@keyframes bounce-hint {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%       { transform: translateX(-50%) translateY(6px); }
}

/* ── Toolbar ── */
.slots-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}
.slots-count {
  font-size: 0.88rem;
  color: var(--text-muted);
  font-weight: 500;
}
.view-toggle {
  display: flex;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.view-btn {
  background: transparent;
  border: none;
  padding: 0.45rem 0.85rem;
  font-size: 1.1rem;
  color: var(--text-muted);
  box-shadow: none;
  border-radius: 0;
  transition: background 0.2s, color 0.2s;
  line-height: 1;
}
.view-btn:hover:not(:disabled) { background: var(--surface-raised); color: var(--text-main); transform: none; box-shadow: none; }
.view-btn.active { background: var(--primary-light); color: var(--primary); }

/* ── Grid ── */
.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

/* ── List ── */
.slots-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

/* List-mode card overrides */
.slot-card-list {
  flex-direction: row;
  align-items: stretch;
  border-radius: 12px;
}
.slot-card-list .slot-accent {
  width: 4px;
  height: auto;
  flex-shrink: 0;
  border-radius: 0;
}
.slot-avail.slot-card-list .slot-accent { background: linear-gradient(180deg, #276749, #48BB78); }
.slot-full.slot-card-list  .slot-accent { background: linear-gradient(180deg, #975A16, #E8A44A); }
.slot-card-list .slot-top {
  flex: 1;
  padding: 1rem 1.25rem;
  border-top: none;
}
.slot-card-list .slot-divider {
  display: none;
}
.slot-card-list .slot-action {
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  border-top: none;
  border-left: 1px solid var(--border-soft);
  min-width: 170px;
}
.slot-card-list .full-btn {
  padding: 0.65rem 1rem;
  font-size: 0.82rem;
}
.slot-card-list .already-booked-notice {
  font-size: 0.82rem;
  padding: 0.5rem 0.75rem;
}


/* ── Card ── */
.slot-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  border-radius: 14px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.slot-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-xl); }

/* Top accent bar */
.slot-accent {
  height: 4px;
  width: 100%;
  flex-shrink: 0;
}
.slot-avail .slot-accent { background: linear-gradient(90deg, #276749, #48BB78); }
.slot-full  .slot-accent { background: linear-gradient(90deg, #975A16, #E8A44A); }

/* ── Card Top ── */
.slot-top {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem 1.75rem;
  background: var(--surface);
}

.date-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 52px;
  background: var(--primary);
  color: #fff;
  border-radius: 10px;
  padding: 0.5rem;
  line-height: 1.1;
  text-align: center;
  flex-shrink: 0;
}
.badge-day   { font-size: 1.6rem; font-weight: 700; font-family: var(--font-heading); }
.badge-month { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.85; }

.slot-time-info { flex: 1; min-width: 0; }
.slot-time-info h3 { font-size: 1.2rem; color: var(--secondary); margin-bottom: 0.15rem; white-space: nowrap; }
.time-sep { color: var(--text-muted); font-style: normal; }

.duration-chip {
  flex-shrink: 0;
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--surface-raised);
  border: 1px solid var(--border-soft);
  color: var(--text-muted);
  padding: 0.3em 0.7em;
  border-radius: 20px;
  white-space: nowrap;
}

/* ── Capacity / Progress ── */
.slot-divider {
  border-top: 1px dashed var(--border);
  padding: 1rem 1.75rem;
  background: var(--surface-raised);
}

.capacity-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}
.cap-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}
.cap-total {
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--text-light);
}
.capacity-row.avail { color: var(--success); }
.capacity-row.avail .cap-dot { background: var(--success); box-shadow: 0 0 6px rgba(39,103,73,0.45); animation: pulse-cap 2s infinite; }
.capacity-row.full  { color: var(--warning); }
.capacity-row.full  .cap-dot { background: var(--warning); }

@keyframes pulse-cap {
  0%   { box-shadow: 0 0 0 0 rgba(39,103,73,0.5); }
  70%  { box-shadow: 0 0 0 6px rgba(39,103,73,0); }
  100% { box-shadow: 0 0 0 0 rgba(39,103,73,0); }
}

.progress-bar-wrap {
  height: 8px;
  background: var(--border-soft);
  border-radius: 6px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #276749, #48BB78);
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.progress-fill.full {
  background: linear-gradient(90deg, #975A16, #E8A44A);
}

/* ── Action ── */
.slot-action { padding: 1.25rem 1.75rem 1.75rem; background: var(--surface); margin-top: auto; }
.full-btn { width: 100%; padding: 0.85rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.06em; }

.already-booked-notice {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.9rem; font-weight: 600; color: var(--success);
  padding: 0.75rem 1rem; background: var(--success-light); border-radius: 8px;
  border: 1px solid rgba(39,103,73,0.2);
}

/* ── Empty State ── */
.empty-state {
  text-align: center;
  max-width: 420px;
  margin: 5rem auto;
  padding: 2rem;
}
.empty-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px; height: 100px;
  margin-bottom: 2rem;
}
.empty-icon-main { font-size: 3.5rem; position: relative; z-index: 1; }
.empty-ring {
  position: absolute; inset: 0;
  border: 2px solid var(--primary-light);
  border-radius: 50%;
  animation: ring-pulse 3s ease-in-out infinite;
}
@keyframes ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50%       { transform: scale(1.15); opacity: 0.9; }
}
.empty-state h3 { font-size: 1.5rem; color: var(--secondary); margin-bottom: 0.75rem; }
.empty-state p  { color: var(--text-muted); line-height: 1.65; margin-bottom: 1.75rem; }
.empty-cta {
  display: inline-block;
  background: var(--primary);
  color: #fff;
  padding: 0.75rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
}
.empty-cta:hover { background: var(--primary-hover); transform: translateY(-2px); }

/* ── Error ── */
.inline-error {
  padding: 1rem 1.5rem; border-radius: 8px;
  background: var(--error-light); color: var(--error); font-weight: 500;
  border: 1px solid rgba(197,48,48,0.2); text-align: center; max-width: 500px; margin: 3rem auto;
}

/* ── Date section headers ── */
.date-section { margin-bottom: 3rem; }

.date-section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.date-section-label {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  flex-shrink: 0;
}

.date-section-tag {
  font-size: 1.2rem;
  font-weight: 800;
  font-family: var(--font-heading);
  color: var(--secondary);
}

.date-section-full {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 400;
}

.date-section-rule {
  flex: 1;
  height: 1px;
  background: var(--border-soft);
}

.date-section-count {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border-soft);
  border-radius: 20px;
  padding: 0.2em 0.7em;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Session type badge ── */
.session-type-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
}

.session-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25em 0.75em;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.sb-breakfast { background: rgba(154,230,180,0.15); color: #2F855A; border: 1px solid rgba(47,133,90,0.2); }
.sb-brunch    { background: rgba(246,173,85,0.15);  color: #C05621; border: 1px solid rgba(192,86,33,0.2); }
.sb-lunch     { background: rgba(99,179,237,0.15);  color: #2B6CB0; border: 1px solid rgba(43,108,176,0.2); }
.sb-early     { background: rgba(183,148,244,0.15); color: #6B46C1; border: 1px solid rgba(107,70,193,0.2); }
.sb-dinner    { background: rgba(252,129,74,0.15);  color: #C05621; border: 1px solid rgba(192,86,33,0.2); }
.sb-late      { background: rgba(90,103,216,0.15);  color: #434190; border: 1px solid rgba(67,65,144,0.2); }

/* ── Time block ── */
.slot-time-block { margin-bottom: 1rem; }
.time-main {
  font-size: 1.35rem;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--secondary);
  letter-spacing: -0.01em;
}
</style>
