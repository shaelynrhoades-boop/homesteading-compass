const safeParseDate = (value: string) => {
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }
  const normalized = value.includes('T') ? value : `${value}T00:00:00`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDisplayDate = (value: string) => {
  const parsed = safeParseDate(value);
  if (!parsed) {
    return value;
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatMonthDay = (value: string) => {
  const parsed = safeParseDate(value);
  if (!parsed) {
    return value;
  }
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};
