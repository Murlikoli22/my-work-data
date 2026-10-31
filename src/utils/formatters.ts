export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateString;
  }
};

export const getStatusColor = (status: string): { bg: string; text: string; border: string } => {
  switch (status) {
    case 'Received':
      return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' };
    case 'Dismantling & Inspection':
      return { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' };
    case 'Stripped & Core Cleaned':
      return { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' };
    case 'Coil Rewinding':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700' };
    case 'Connection & Taping':
      return { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700' };
    case 'Varnishing & Baking':
      return { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-700' };
    case 'Assembly & Testing':
      return { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-700' };
    case 'Ready for Delivery':
      return { bg: 'bg-emerald-100 dark:bg-emerald-950/50', text: 'text-emerald-800 dark:text-emerald-400 font-semibold', border: 'border-emerald-400 dark:border-emerald-600' };
    case 'Delivered':
      return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
  }
};

export const generateWhatsAppLink = (phone: string, text: string): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  // If Indian 10-digit number without country code, add 91
  const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
};
