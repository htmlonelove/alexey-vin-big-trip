import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import { TypesViewData } from '../utils/const';
import { getCalendarDateTime, compareDates, isDatesEqual } from '../utils/common';
import flatpickr from 'flatpickr';
import he from 'he';

import 'flatpickr/dist/flatpickr.min.css';

const createTypesList = (checkedType, eventId) => Object.entries(TypesViewData).map(([key, value]) => {
  const { title } = value;
  const checked = key === checkedType ? 'checked' : '';
  return (`
    <div class="event__type-item">
      <input id="event-type-${key}-${eventId}" class="event__type-input  visually-hidden" type="radio" name="event-type-${eventId}" value="${key}" ${checked}>
      <label class="event__type-label event__type-label--${key}" for="event-type-${key}-${eventId}">${title}</label>
    </div>`);
}).join('');

const createOffersList = (offers, checkedOffers, eventId, isDisabled) => {
  const offersList = offers.map((offer) => {
    const { id: offerId, title, price } = offer;
    const checked = checkedOffers.has(offerId) ? 'checked' : '';
    return (`
      <div class="event__offer-selector">
        <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offerId}-${eventId}" type="checkbox" name="event-offer-${offerId}-${eventId}" ${checked} data-offer-id=${offerId} ${isDisabled ? 'disabled' : ''}>
        <label class="event__offer-label" for="event-offer-${offerId}-${eventId}">
          <span class="event__offer-title">${title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${price}</span>
        </label>
      </div>
    `);
  }).join('');

  return offersList.length ? `
  <section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>

    <div class="event__available-offers">${offersList}</div>
  </section>
  ` : '';
};

const createDates = (dateFrom, dateTo, eventId, isDisabled) =>
  `<div class="event__field-group  event__field-group--time">
    <label class="visually-hidden" for="event-start-time-${eventId}">From</label>
    <input class="event__input  event__input--time" id="event-start-time-${eventId}" type="text" name="event-start-time-${eventId}" value="${getCalendarDateTime(dateFrom)}" ${isDisabled ? 'disabled' : ''}>
    &mdash;
    <label class="visually-hidden" for="event-end-time-${eventId}">To</label>
    <input class="event__input  event__input--time" id="event-end-time-${eventId}" type="text" name="event-end-time-${eventId}" value="${getCalendarDateTime(dateTo)}" ${isDisabled ? 'disabled' : ''}>
  </div>
`;

const createDestinations = (destinations, chosenDestination, chosenTypeTitle, eventId, isDisabled) =>
  `<div class="event__field-group  event__field-group--destination">
    <label class="event__label event__type-output" for="event-destination-${eventId}">
      ${chosenTypeTitle}
    </label>
    <input class="event__input event__input--destination" id="event-destination-${eventId}" type="text" name="event-destination" value="${he.encode(chosenDestination)}" list="destination-list-1" ${isDisabled ? 'disabled' : ''}>
    <datalist id="destination-list-1">
      ${destinations.map((destination) => `<option value=${he.encode(destination.name)}></option>`).join('')}
    </datalist>
  </div>`;

const createDescription = ({description, pictures}) => {
  if (!description && !pictures.length) {
    return '';
  }

  const picturesList = pictures.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('');
  const picturesNode = picturesList.length ? `
    <div class="event__photos-container">
      <div class="event__photos-tape">
        ${picturesList}
      </div>
    </div>` : '';

  return (
    `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      <p class="event__destination-description">${description}</p>
      ${picturesNode}
    </section>`
  );
};

const isSubmitDisabled = (data) => {
  const { destination, type, offers, offersList, destinationId, typeId } = data;
  return destinationId === destination &&
  typeId === type && offersList.length === offers.length &&
  offers.every((value) => offersList.includes(value)) &&
  data.dateFrom === data.prevDateFrom &&
  data.dateTo === data.prevDateTo &&
  data.basePrice === data.prevPrice ||
  data.basePrice === 0 ||
  isDatesEqual(data.dateFrom, data.dateTo) ||
  data.isDisabled;
};

const createControls = (data) => {
  const cancelButtonText = data.id ? 'Delete' : 'Cancel';
  return (
    `<button class="event__save-btn  btn  btn--blue" type="submit"
      ${isSubmitDisabled(data) ? 'disabled' : ''}
      >${data.isSaving ? 'Saving...' : 'Save'}</button>
      <button class="event__reset-btn" type="reset" ${data.isDisabled ? 'disable' : ''}>${data.isDeleting ? 'Deleting...' : cancelButtonText}</button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>`
  );
};

const createEditEventTemplate = ({data, offers, destinations}) => {
  const { id: eventId, type: eventType, dateFrom, dateTo, basePrice, offers: eventOffers, isDisabled } = data;
  const { icon: typeIcon, title: typeTitle } = TypesViewData[eventType] ?? {};
  const { name: destinationName = '', description = '', pictures = [] } = destinations.find((destination) => destination.id === data.destination) ?? {};
  const typeOffers = offers.find((offer) => offer.type === eventType)?.offers ?? [];

  const typesList = createTypesList(eventType, eventId);
  const destinationsNode = createDestinations(destinations, destinationName, typeTitle, eventId, isDisabled);
  const dates = createDates(dateFrom, dateTo, eventId, isDisabled);
  const offersNode = createOffersList(typeOffers, new Set(eventOffers), eventId, isDisabled);
  const descriptionNode = createDescription({description, pictures});
  const controls = createControls(data);

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-${eventId}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${typeIcon}" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${eventId}" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${typesList}
              </fieldset>
            </div>
          </div>

          ${destinationsNode}

          ${dates}

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-${eventId}">
              <span class="visually-hidden">${basePrice}</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-${eventId}" type="text" name="event-price" value="${basePrice}">
          </div>

          ${controls}
        </header>
        <section class="event__details">
          ${offersNode}
          ${descriptionNode}
        </section>
      </form>
    </li>`
  );
};

export default class EditEventView extends AbstractStatefulView {
  #event = null;
  #offers = null;
  #destinations = null;
  #form = null;
  #rollUpBtn = null;
  #handlerFormSubmit = null;
  #handlerFormClose = null;
  #handleDeleteClick = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  constructor({ event, offers, destinations, onFormSubmit, onFormClose, onDeleteClick }) {
    super();
    this.#event = event;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handlerFormSubmit = onFormSubmit;
    this.#handlerFormClose = onFormClose;
    this.#handleDeleteClick = onDeleteClick;
    this._setState(EditEventView.parseEventToState(event));

    this._restoreHandlers();
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
      this.#datepickerStart = null;
    }

    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
      this.#datepickerEnd = null;
    }
  }

  reset(event) {
    this.updateElement(EditEventView.parseEventToState(event));
  }

  _restoreHandlers() {
    this.element.querySelector('.event__save-btn').addEventListener('click', this.#onFormSubmit);
    this.rollUpBtn.addEventListener('click', this.#onRollUpBtnClick);
    this.element.querySelector('.event__input--destination').addEventListener('blur', this.#destinationHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formDeleteClickHandler);
    this.element.querySelector('.event__input--price').addEventListener('blur', this.#priceChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#inputPriceHandler);

    const offers = this.element.querySelector('.event__available-offers');
    if (offers) {
      offers.addEventListener('change', this.#offersHandler);
    }

    this.#setDatepickers();
  }

  get template() {
    return createEditEventTemplate({data: this._state, offers: this.#offers, destinations: this.#destinations});
  }

  get form() {
    if (!this.#form) {
      this.#form = this.element.querySelector('form.event');
    }
    return this.#form;
  }

  get rollUpBtn() {
    this.#rollUpBtn = this.element.querySelector('.event__rollup-btn');
    return this.#rollUpBtn;
  }

  static parseEventToState(event) {
    return {...event,
      offersList: event.offers.map((offer) => offer),
      destinationId: event.destination,
      typeId: event.type,
      prevDateFrom: event.dateFrom,
      prevDateTo: event.dateTo,
      prevPrice: event.basePrice,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToEvent(state) {
    const event = {...state};
    delete event.offersList;
    delete event.destinationId;
    delete event.typeId;
    delete event.prevDateFrom;
    delete event.prevDateTo;
    delete event.prevPrice;
    delete event.isDisabled;
    delete event.isSaving;
    delete event.isDeleting;

    return event;
  }

  #onFormSubmit = (evt) => {
    evt.preventDefault();
    this.#handlerFormSubmit(EditEventView.parseStateToEvent(this._state));
  };

  #onRollUpBtnClick = (evt) => {
    evt.preventDefault();
    this.#handlerFormClose();
  };

  #destinationHandler = (evt) => {
    evt.preventDefault();
    const destinationId = this.#destinations.find((destination) => destination.name.includes(evt.target.value))?.id;
    if (destinationId) {
      this.updateElement({destination: destinationId});
    } else {
      evt.target.value = this.#destinations.length ? this.#destinations[0].name : '';
    }
  };

  #typeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({type: evt.target.value, offers: []});
  };

  #offersHandler = (evt) => {
    evt.preventDefault();
    const offerId = evt.target.dataset.offerId;
    const offers = new Set(this._state.offers);

    if (evt.target.checked) {
      offers.add(offerId);
    } else {
      offers.delete(offerId);
    }

    this.updateElement({offers: [...offers]});
  };

  #setDatepickers = () => {
    const dateInputFrom = this.element.querySelector('[id^="event-start-time"]');
    const dateInputTo = this.element.querySelector('[id^="event-end-time"]');

    if (dateInputFrom) {
      this.#datepickerStart = flatpickr(dateInputFrom, {
        enableTime: true,
        // eslint-disable-next-line camelcase
        time_24hr: true,
        dateFormat: 'd/m/y H:i',
        onChange: this.#dateStartChangeHandler,
      });
    }

    if (dateInputTo) {
      this.#datepickerEnd = flatpickr(dateInputTo, {
        enableTime: true,
        // eslint-disable-next-line camelcase
        time_24hr: true,
        dateFormat: 'd/m/y H:i',
        onChange: this.#dateEndChangeHandler,
      });
    }

    this.#datepickerEnd.set('minDate', this.#datepickerStart.selectedDates[0]);
  };

  #dateStartChangeHandler = (selectedDates) => {
    let dateTo = this._state.dateTo;
    if (compareDates(this.#datepickerEnd.selectedDates[0], selectedDates[0])) {
      this.#datepickerEnd.setDate(selectedDates[0]);
      dateTo = selectedDates[0];
    }
    this.#datepickerEnd.set('minDate', selectedDates[0]);
    this.updateElement({dateFrom: selectedDates[0], dateTo: dateTo});
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({basePrice: parseInt(evt.target.value, 10)});
  };

  #dateEndChangeHandler = (selectedDates) => {
    this.updateElement({dateTo: selectedDates[0]});
  };

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(EditEventView.parseStateToEvent(this._state));
  };

  #inputPriceHandler = (evt) => {
    evt.target.value = evt.target.value.replace(/[^0-9]/g, '');
  };
}
