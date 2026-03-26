import { ref } from 'vue';

// Module-level singleton — shared across all components
const toasts = ref([]);
let nextId = 0;

export function useToast() {
  const show = (message, type = 'success', duration = 4000) => {
    const id = ++nextId;
    toasts.value.push({ id, message, type });
    setTimeout(() => dismiss(id), duration);
  };

  const dismiss = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  };

  // Convenience helpers
  const success = (msg, duration) => show(msg, 'success', duration);
  const error   = (msg, duration) => show(msg, 'error', duration);
  const warning = (msg, duration) => show(msg, 'warning', duration);
  const info    = (msg, duration) => show(msg, 'info', duration);

  return { toasts, show, dismiss, success, error, warning, info };
}
