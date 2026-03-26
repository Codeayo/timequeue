import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import LoginPage from "../pages/LoginPage.vue";
import SlotsPage from "../pages/SlotsPage.vue";
import MyBookingsPage from "../pages/MyBookingsPage.vue";
import HostDashboardPage from "../pages/HostDashboardPage.vue";

const routes = [
  { path: "/", name: "home", component: HomePage },
  { path: "/login", name: "login", component: LoginPage },
  { path: "/slots", name: "slots", component: SlotsPage, meta: { requiresAuth: true, requiresUser: true } },
  { path: "/bookings", name: "bookings", component: MyBookingsPage, meta: { requiresAuth: true, requiresUser: true } },
  { path: "/host", name: "host", component: HostDashboardPage, meta: { requiresAuth: true, requiresHost: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }
  if (to.meta.requiresHost && user?.role !== "HOST") {
    return next("/slots");
  }
  if (to.meta.requiresUser && user?.role === "HOST") {
    return next("/host");
  }
  next();
});

export default router;