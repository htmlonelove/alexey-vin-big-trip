import AbstractView from '../framework/view/abstract-view';

const createAddButtonTemplate = () => (
  '<button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">New event</button>'
);

export default class AddButtonView extends AbstractView {
  #clickHandler = null;

  constructor({onButtonClick}) {
    super();
    this.#clickHandler = onButtonClick;

    this.element.addEventListener('click', this.onButtonClick);
  }

  get template() {
    return createAddButtonTemplate();
  }

  onButtonClick = () => {
    this.#clickHandler();
  };
}
