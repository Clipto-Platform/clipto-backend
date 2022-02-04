import * as moment from 'moment';

export const isRequestExpired = (created: Date, deadline: number): boolean => {
  const currentDate = moment().utc();
  const deadlineDate = moment(created).add(deadline, 'days');
  return currentDate.isSameOrAfter(deadlineDate);
};
