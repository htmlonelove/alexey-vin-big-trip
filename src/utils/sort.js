import { SortType } from './const';

const sort = {
  [SortType.DEFAULT]: (events) => events,
  [SortType.TIME]: (events) => events.slice().sort((a, b) => a.dateFrom - b.dateFrom),
  [SortType.PRICE]: (events) => events.slice().sort((a, b) => b.basePrice - a.basePrice),
};

export { sort };
