export const getInt = (value: string | number): number => {
  if (typeof value === 'number') return value;
  return parseInt(value);
};
