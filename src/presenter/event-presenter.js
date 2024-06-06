import EventView from '../view/event-view';
import EditEventView from '../view/edit-event-view';
import { remove, render, replace } from '../framework/render';
import { UserAction, UpdateType } from '../utils/const';
import { isDatesEqual } from '../utils/common';

const EventMode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class EventPresenter {
  #parentContainer = null;
  #eventsModel = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #event = null;
  #eventComponent = null;
  #eventEditComponent = null;
  #mode = EventMode.DEFAULT;

  constructor({ parentContainer, model, onDataChange, onModeChange }) {
    this.#parentContainer = parentContainer;
    this.#eventsModel = model;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(event) {
    this.#event = event;

    const prevEventComponent = this.#eventComponent;
    const prevEventEditComponent = this.#eventEditComponent;

    this.#eventComponent = new EventView({
      event: this.#event,
      offers: this.#eventsModel.getOffersForEvent(this.#event),
      destination: this.#eventsModel.getDestinationById(this.#event.destination),
      onRollUpBtnClick: this.#replaceCardToForm,
      onFavoriteClick: this.#handleFavouriteClick,
    });

    this.#eventEditComponent = new EditEventView({
      event: this.#event,
      offers: this.#eventsModel.offers,
      destinations: this.#eventsModel.destinations,
      onFormSubmit: this.#handleFormSubmit,
      onFormClose: this.#replaceFormToCard,
      onDeleteClick: this.#handleDeleteClick,
    });

    if (prevEventComponent === null || prevEventEditComponent === null) {
      render(this.#eventComponent, this.#parentContainer.element);
      return;
    }

    if (this.#mode === EventMode.DEFAULT) {
      replace(this.#eventComponent, prevEventComponent);
    }

    if (this.#mode === EventMode.EDITING) {
      replace(this.#eventComponent, prevEventEditComponent);
      this.#mode = EventMode.DEFAULT;
    }

    remove(prevEventComponent);
    remove(prevEventEditComponent);
  }

  destroy() {
    remove(this.#eventComponent);
    remove(this.#eventEditComponent);
  }

  resetView() {
    this.#eventEditComponent.reset(this.#event);
    this.#replaceFormToCard();
  }

  setSaving() {
    if (this.#mode === EventMode.EDITING) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === EventMode.EDITING) {
      this.#eventEditComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === EventMode.DEFAULT) {
      this.#eventComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#eventEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#eventEditComponent.shake(resetFormState);
  }

  get mode() {
    return this.#mode;
  }

  #escKeydownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#eventEditComponent.reset(this.#event);
      this.#replaceFormToCard();
    }
  };

  #replaceCardToForm = () => {
    replace(this.#eventEditComponent, this.#eventComponent);
    document.addEventListener('keydown', this.#escKeydownHandler);
    this.#handleModeChange();
    this.#mode = EventMode.EDITING;
  };

  #replaceFormToCard = () => {
    replace(this.#eventComponent, this.#eventEditComponent);
    document.removeEventListener('keydown', this.#escKeydownHandler);
    this.#mode = EventMode.DEFAULT;
  };

  #handleFavouriteClick = () => {
    this.#handleDataChange(UserAction.UPDATE_EVENT, UpdateType.PATCH, {...this.#event, isFavorite: !this.#event.isFavorite});
  };

  #handleFormSubmit = (event) => {
    const isPatchUpdate = isDatesEqual(this.#event.dateFrom, event.dateFrom) &&
    isDatesEqual(this.#event.dateTo, event.dateTo) &&
    this.#event.basePrice === event.basePrice;

    this.#handleDataChange(
      UserAction.UPDATE_EVENT,
      isPatchUpdate ? UpdateType.PATCH : UpdateType.MINOR,
      event);
  };

  #handleDeleteClick = (event) => {
    this.#handleDataChange(UserAction.DELETE_EVENT, UpdateType.MINOR, event);
  };
}

export { EventMode };
