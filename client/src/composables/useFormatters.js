/**
 * Shared date formatting composable for DineQueue
 */
export function useFormatters() {
  const formatDateTime = (timeString) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  };

  const formatTimeOnly = (timeString) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleString('en-US', {
      hour: 'numeric', minute: '2-digit'
    });
  };

  const formatDate = (timeString) => {
    if (!timeString) return '';
    return new Date(timeString).toLocaleString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const formatDayMonth = (timeString) => {
    if (!timeString) return { day: '', month: '' };
    const d = new Date(timeString);
    return {
      day: d.toLocaleString('en-US', { day: '2-digit' }),
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      weekday: d.toLocaleString('en-US', { weekday: 'short' })
    };
  };

  return { formatDateTime, formatTimeOnly, formatDate, formatDayMonth };
}
