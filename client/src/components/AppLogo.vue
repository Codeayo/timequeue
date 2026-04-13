<template>
  <span class="app-logo" :class="variant">
    <!-- Clock + cutlery icon -->
    <svg
      class="logo-icon"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <!-- Clock circle -->
      <circle cx="18" cy="18" r="15.5" stroke="currentColor" stroke-width="2"/>
      <!-- Clock hands -->
      <line x1="18" y1="18" x2="18" y2="9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="18" y1="18" x2="24" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <!-- Fork (left of center) -->
      <line x1="13" y1="10" x2="13" y2="26" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <line x1="11" y1="10" x2="11" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="15" y1="10" x2="15" y2="15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M11 15 Q13 17 15 15" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      <!-- Knife (right of center - subtle) -->
      <line x1="23" y1="10" x2="23" y2="26" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M21 10 Q23 14 23 17" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    </svg>

    <!-- Wordmark -->
    <span class="logo-wordmark">
      <span class="logo-time">Time</span><span class="logo-queue">Queue</span>
    </span>
  </span>
</template>

<script setup>
defineProps({
  // 'default' | 'light' | 'dark'
  variant: {
    type: String,
    default: 'default'
  }
});
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--primary);
  text-decoration: none;
  line-height: 1;
}

/* When inside .hero-nav the parent applies color: #fff via CSS cascade */
.app-logo.light {
  color: #fff;
}
.app-logo.dark {
  color: var(--secondary);
}

.logo-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: inherit;
}

.logo-wordmark {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  white-space: nowrap;
  color: inherit;
}

.logo-time {
  opacity: 1;
}

.logo-queue {
  opacity: 0.75;
  font-weight: 500;
}
</style>
