const dayjs = require('dayjs');

function addDays(startDate, days) {
  return dayjs(startDate).add(days, 'day').toDate();
}

function diffInDays(later, earlier) {
  return dayjs(later).startOf('day').diff(
    dayjs(earlier).startOf('day'),
    'day'
  );
}

module.exports = {
  addDays,
  diffInDays
};
