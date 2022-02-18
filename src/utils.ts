import * as moment from 'moment';

export const isRequestExpired = (created: Date, deadline: number): boolean => {
  const currentDate = moment().utc();
  const deadlineDate = moment(created).add(deadline, 'days');
  return currentDate.isSameOrAfter(deadlineDate);
};

export const getInt = (value: string | number): number => {
  if (typeof value === 'number') return value;
  return parseInt(value);
};
