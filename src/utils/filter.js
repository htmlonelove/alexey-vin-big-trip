import { FilterType } from './const';
import { isFutureEvent, isPresentEvent, isPastEvent } from '../utils/event';

const filter = {
  [FilterType.EVERYTHING]: (events) => events,
  [FilterType.FUTURE]: (events) => events.filter((event) => isFutureEvent(event)),
  [FilterType.PRESENT]: (events) => events.filter((event) => isPresentEvent(event)),
  [FilterType.PAST]: (events) => events.filter((event) => isPastEvent(event)),
};

export { filter };
