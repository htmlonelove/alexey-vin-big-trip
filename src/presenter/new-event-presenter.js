import { RenderPosition, remove, render } from '../framework/render.js';
import EditEventView from '../view/edit-event-view.js';
import AddButtonView from '../view/add-button-view.js';
import { UserAction, UpdateType } from '../utils/const.js';

export default class NewEventPresenter {
  #newEventButtonView = null;
  #addButtonContainer = null;
  #newEventAddView = null;
  #container = null;
  #addButtonClickHandler = null;
  #handleDataChange = null;
  #handleCanceled = null;
  #eventModel = null;

  constructor({container, eventModel, onAddButtonClick, onDataChange, onCanceled}) {
    this.#addButtonContainer = container.querySelector('.trip-main');
    this.#container = container;
    this.#eventModel = eventModel;
    this.#addButtonClickHandler = onAddButtonClick;
    this.#handleDataChange = onDataChange;
    this.#handleCanceled = onCanceled;
  }

  init() {
    this.renderAddButton();
  }

  renderAddButton() {
    if (this.#newEventButtonView) {
      return;
    }

    this.#newEventButtonView = new AddButtonView({onButtonClick: this.#handleNewEventButtonClick});

    render(this.#newEventButtonView, this.#addButtonContainer, RenderPosition.BEFOREEND);
  }

  renderAddView() {
    if (this.#newEventAddView) {
      return;
    }

    this.#newEventAddView = new EditEventView({
      event: this.#createNewEvent(),
      offers: this.#eventModel.offers,
      destinations: this.#eventModel.destinations,
      onFormSubmit: this.#handleFormSubmit,
      onFormClose: this.#handleDeleteClick,
      onDeleteClick: this.#handleDeleteClick
    });

    render(this.#newEventAddView, this.#container.querySelector('.trip-events__list'), RenderPosition.AFTERBEGIN);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  destroy() {
    if (this.#newEventAddView) {
      remove(this.#newEventAddView);
      this.#newEventAddView = null;
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }

    this.#newEventButtonView.element.disabled = false;
  }

  setSaving() {
    this.#newEventAddView.updateElement({
      isDisabled: true,
      isSaving: true
    });
  }

  setAborting() {
    const resetFormState = () => {
      this.#newEventAddView.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#newEventAddView.shake(resetFormState);
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.destroy();
    }
  };

  #handleNewEventButtonClick = () => {
    this.#addButtonClickHandler();
    this.#newEventButtonView.element.disabled = true;
    this.renderAddView();
  };

  #handleFormSubmit = (event) => {
    this.#handleDataChange(
      UserAction.ADD_EVENT,
      UpdateType.MINOR,
      event
    );
  };

  #handleDeleteClick = () => {
    this.destroy();
    this.#handleCanceled();
  };

  #createNewEvent() {
    return {
      type: 'taxi',
      destination: '1',
      dateFrom: new Date(),
      dateTo: new Date(),
      basePrice: 0,
      offers: [],
      isFavorite: false
    };
  }
}
