import dayjs from 'dayjs';

/**
 *
 * @param {*} event Event object
 * @returns true if the event is in the future, false otherwise
 */
const isFutureEvent = (event) => dayjs().isBefore(dayjs(event.dateFrom));

/**
 *
 * @param {*} event Event object
 * @returns true if the event is in the present, false otherwise
 */
const isPresentEvent = (event) => dayjs().isBefore(dayjs(event.dateTo)) && dayjs().isAfter(dayjs(event.dateFrom));

/**
 *
 * @param {*} event Event object
 * @returns true if the event is in the past, false otherwise
*/
const isPastEvent = (event) => dayjs().isAfter(dayjs(event.dateTo));

const sortByDefault = (eventA, eventB) => dayjs(eventA.dateFrom).diff(dayjs(eventB.dateFrom));

const sortByTime = (eventA, eventB) => {
  const durationA = dayjs(eventA.dateTo).diff(dayjs(eventA.dateFrom));
  const durationB = dayjs(eventB.dateTo).diff(dayjs(eventB.dateFrom));

  return durationA - durationB;
};

const sortByPrice = (eventA, eventB) => eventA.basePrice - eventB.basePrice;

export { isFutureEvent, isPresentEvent, isPastEvent, sortByDefault, sortByTime, sortByPrice };
