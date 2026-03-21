import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import LoginPage from "../pages/LoginPage.vue";
import SlotsPage from "../pages/SlotsPage.vue";
import MyBookingsPage from "../pages/MyBookingsPage.vue";
import HostDashboardPage from "../pages/HostDashboardPage.vue";

const routes = [
  { path: "/", name: "home", component: HomePage },
  { path: "/login", name: "login", component: LoginPage },
  { path: "/slots", name: "slots", component: SlotsPage },
  { path: "/bookings", name: "bookings", component: MyBookingsPage },
  { path: "/host", name: "host", component: HostDashboardPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;