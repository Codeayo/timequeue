import { ref, watch, onMounted } from 'vue';

const isDark = ref(false);

export function useTheme() {
  const applyTheme = (dark) => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('dinequeue-theme', dark ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    isDark.value = !isDark.value;
  };

  onMounted(() => {
    const saved = localStorage.getItem('dinequeue-theme');
    if (saved) {
      isDark.value = saved === 'dark';
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme(isDark.value);
  });

  watch(isDark, (val) => applyTheme(val));

  return { isDark, toggleTheme };
}
