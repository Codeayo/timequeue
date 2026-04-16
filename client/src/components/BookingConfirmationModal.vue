<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-content fade-up">
        <button class="close-btn" @click="close">&times;</button>
        
        <div class="ticket">
          <!-- Ticket Header -->
          <div class="ticket-header" :class="booking.type === 'WAITLISTED' ? 'warning' : 'success'">
            <div class="status-icon">
              {{ booking.type === 'WAITLISTED' ? '⏳' : '✓' }}
            </div>
            <h2>{{ booking.type === 'WAITLISTED' ? 'Waitlist Joined' : 'Reservation Confirmed' }}</h2>
            <p>{{ authStore.user?.name }}</p>
          </div>

          <!-- Ticket Body -->
          <div class="ticket-body">
            <div class="detail-row">
              <span class="label">Establishment</span>
              <span class="value">DineQueue</span>
            </div>
            <div class="detail-row">
              <span class="label">Date</span>
              <span class="value">{{ formatDayMonth(booking.slot?.start_time).weekday }}, {{ formatDayMonth(booking.slot?.start_time).month }} {{ formatDayMonth(booking.slot?.start_time).day }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time</span>
              <span class="value">{{ formatTimeOnly(booking.slot?.start_time) }} - {{ formatTimeOnly(booking.slot?.end_time) }}</span>
            </div>
            <div class="detail-row" v-if="booking.partySize">
              <span class="label">Party Size</span>
              <span class="value">{{ booking.partySize }} Guest{{ booking.partySize > 1 ? 's' : '' }}</span>
            </div>
          </div>

          <!-- Ticket Footer / Stub -->
          <div class="ticket-stub">
            <div class="tear-line"></div>
            <div class="stub-content">
              <p class="reference">Ref #{{ Math.random().toString(36).substr(2, 9).toUpperCase() }}</p>
              <div class="barcode">|||| |||||| ||||| |||||||</div>
              <p class="instruction">
                {{ booking.type === 'WAITLISTED' 
                  ? "We'll notify you automatically if a table opens up for your party."
                  : "Please retain this confirmation. We look forward to serving you." 
                }}
              </p>
            </div>
          </div>
        </div>

        <div class="modal-actions mt-4 text-center">
           <RouterLink to="/bookings" class="primary-btn view-itinerary-btn">View My Itinerary</RouterLink>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
import { useFormatters } from '../composables/useFormatters';
import { RouterLink } from 'vue-router';

const authStore = useAuthStore();
const { formatTimeOnly, formatDayMonth } = useFormatters();

const props = defineProps({
  show: Boolean,
  booking: Object
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(10, 14, 24, 0.75);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 440px;
  animation: slideUpModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.close-btn {
  position: absolute;
  top: -2.5rem;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2.5rem;
  cursor: pointer;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s;
  box-shadow: none;
  padding: 0;
}
.close-btn:hover { opacity: 1; background: none; transform: scale(1.1); box-shadow: none; }

/* Ticket Design */
.ticket {
  background: var(--surface);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  position: relative;
}

.ticket-header {
  padding: 2.5rem 2rem 2rem;
  text-align: center;
  color: white;
}
.ticket-header.success { background: linear-gradient(135deg, var(--success), #1b4d36); }
.ticket-header.warning { background: linear-gradient(135deg, var(--warning), #6d4110); }

.status-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.ticket-header h2 {
  color: white;
  font-family: var(--font-heading);
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
  letter-spacing: 0.02em;
}
.ticket-header p {
  opacity: 0.9;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.ticket-body {
  padding: 2rem 2.5rem;
  background: var(--surface);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.25rem;
  border-bottom: 1px dotted var(--border);
  padding-bottom: 0.5rem;
}
.detail-row:last-child { margin-bottom: 0; border-bottom: none; }

.label {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}
.value {
  color: var(--secondary);
  font-weight: 600;
  font-size: 1.05rem;
  text-align: right;
}

.ticket-stub {
  background: var(--surface-raised);
  position: relative;
}

.tear-line {
  height: 20px;
  background-image: radial-gradient(circle at 10px 10px, transparent 10px, var(--surface-raised) 11px);
  background-size: 20px 20px;
  background-repeat: repeat-x;
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
}

.stub-content {
  padding: 2.5rem 2rem 2rem;
  text-align: center;
  border-top: 2px dashed rgba(0,0,0,0.1);
}

.reference {
  font-family: monospace;
  color: var(--text-muted);
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  letter-spacing: 0.1em;
}

.barcode {
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.5rem;
  letter-spacing: -2px;
  color: var(--secondary);
  opacity: 0.6;
  margin-bottom: 1rem;
}

.instruction {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
  font-style: italic;
}

.view-itinerary-btn {
  display: inline-block;
  background: var(--secondary);
  color: white;
  padding: 1rem 2rem;
  border-radius: 30px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  box-shadow: 0 4px 14px rgba(28, 35, 49, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}
.view-itinerary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(28, 35, 49, 0.3);
  color: white;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@keyframes slideUpModal {
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
