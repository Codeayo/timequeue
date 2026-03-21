<template>
  <div class="home-page fade-up">
    <div class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content fade-up delay-100">
        <h1 class="hero-title">A Taste of Perfection</h1>
        <p class="hero-subtitle">
          Secure your table at DineQueue. Experience an unforgettable atmosphere and exceptional flavors.
        </p>
        <div class="hero-actions fade-up delay-200">
          <RouterLink to="/slots" class="primary-btn">Reserve a Table</RouterLink>
          <RouterLink to="/login" class="secondary-btn light">Customer Portal</RouterLink>
        </div>
      </div>
    </div>
    
    <div class="features-section container">
      <div class="feature text-center fade-up delay-100">
        <div class="icon-wrapper">
          <span class="icon">🥂</span>
        </div>
        <h3>Effortless Booking</h3>
        <p>Find your ideal dining slot in seconds. We make reserving your evening completely frictionless.</p>
      </div>
      <div class="feature text-center fade-up delay-200">
        <div class="icon-wrapper">
          <span class="icon">⏳</span>
        </div>
        <h3>Auto-Advancing Waitlist</h3>
        <p>If our dining room is fully committed, join our intelligent waitlist. You'll be promoted automatically if a spot opens up.</p>
      </div>
      <div class="feature text-center fade-up delay-300">
        <div class="icon-wrapper">
          <span class="icon">🍽️</span>
        </div>
        <h3>An Exquisite Setting</h3>
        <p>We pride ourselves on providing a breathtaking ambiance for your most cherished occasions.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.home-page {
  /* Offset for sticky nav to make background seamless */
  margin-top: -80px; 
  width: 100%;
}

.hero-section {
  position: relative;
  height: 80vh;
  min-height: 600px;
  background-image: url('/hero-image.png');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.hero-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(28, 35, 49, 0.4), rgba(28, 35, 49, 0.8));
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 800px;
  padding: 3rem 2rem;
  color: #fff;
  background: rgba(28, 35, 49, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.hero-title {
  font-size: 4.5rem;
  color: #FDFBF7;
  margin-bottom: 1rem;
  text-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  color: #E2E8F0;
  font-weight: 400;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}

.primary-btn {
  background-color: var(--primary);
  color: white;
  padding: 1em 2.5em;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(142, 35, 35, 0.3);
  transition: all 0.3s ease;
}
.primary-btn:hover {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(142, 35, 35, 0.4);
}

.secondary-btn.light {
  background-color: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.8);
  padding: 1em 2.5em;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 1rem;
  transition: all 0.3s ease;
}
.secondary-btn.light:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}

.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 4rem;
  padding: 8rem 2rem;
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: #fff;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  border: 1px solid var(--border);
}

.feature .icon {
  font-size: 2.5rem;
}

.feature h3 {
  font-size: 1.6rem;
  margin-bottom: 1rem;
}

.feature p {
  font-size: 1.05rem;
}
</style>
