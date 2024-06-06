const FilterType = {
  'EVERYTHING': 'everything',
  'FUTURE': 'future',
  'PRESENT': 'present',
  'PAST': 'past',
};

const SortType = {
  'DEFAULT': 'sort-day',
  'TIME': 'sort-time',
  'PRICE': 'sort-price',
};

const UserAction = {
  UPDATE_EVENT: 'UPDATE_EVENT',
  ADD_EVENT: 'ADD_EVENT',
  DELETE_EVENT: 'DELETE_EVENT',
};

const UpdateType = {
  PATCH: 'PATCH',
  MINOR: 'MINOR',
  MAJOR: 'MAJOR',
  INIT: 'INIT',
};

const OfferType = {
  'TAXI': 'Taxi',
  'BUS': 'Bus',
  'TRAIN': 'Train',
  'SHIP': 'Ship',
  'TRANSPORT': 'Transport',
  'DRIVE': 'Drive',
  'FLIGHT': 'Flight',
  'CHECK-IN': 'Check-in',
  'SIGHTSEEING': 'Sightseeing',
  'RESTAURANT': 'Restaurant',
};

const TypesViewData = {
  'taxi': {
    title: 'Taxi',
    icon: 'taxi.png',
  },
  'bus': {
    title: 'Bus',
    icon: 'bus.png',
  },
  'train': {
    title: 'Train',
    icon: 'train.png',
  },
  'ship': {
    title: 'Ship',
    icon: 'ship.png',
  },
  'drive': {
    title: 'Drive',
    icon: 'drive.png',
  },
  'flight': {
    title: 'Flight',
    icon: 'flight.png',
  },
  'check-in': {
    title: 'Check-in',
    icon: 'check-in.png',
  },
  'sightseeing': {
    title: 'Sightseeing',
    icon: 'sightseeing.png',
  },
  'restaurant': {
    title: 'Restaurant',
    icon: 'restaurant.png',
  },
};

export { FilterType, SortType, UserAction, UpdateType, OfferType, TypesViewData };
