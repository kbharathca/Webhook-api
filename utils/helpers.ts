export const generateId = () => Math.random().toString(36).substr(2, 9);

export const formatDate = (timestamp: number) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3
  } as any).format(new Date(timestamp));
};

export const formatRelativeTime = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  if (diff < 1000) return 'Just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return formatDate(timestamp);
};

export const getStatusColor = (method: string) => {
  switch (method) {
    case 'POST': return 'text-emerald-400';
    case 'GET': return 'text-blue-400';
    case 'DELETE': return 'text-red-400';
    case 'PUT': return 'text-amber-400';
    default: return 'text-gray-400';
  }
};

export const safeJsonParse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};