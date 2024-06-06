import TripInfoView from '../view/trip-info-view';
import { remove, render, RenderPosition } from '../framework/render';

export default class TripInfoPresenter {
  #container = null;
  #eventsModel = null;
  #tripInfoView = null;

  constructor({container, eventsModel}) {
    this.#container = container;
    this.#eventsModel = eventsModel;
  }

  init() {
    this.#render();
  }

  #render() {
    if (this.#tripInfoView) {
      remove(this.#tripInfoView);
      this.#tripInfoView = null;
    }

    if (this.#eventsModel.events.length === 0) {
      return;
    }

    this.#tripInfoView = new TripInfoView({
      route: this.#calcRoute(),
      dates: this.#calcDates(),
      totalPrice: this.#calcTotalPrice(),
    });
    render(this.#tripInfoView, this.#container.querySelector('.trip-main'), RenderPosition.AFTERBEGIN);
  }

  #calcRoute() {
    const events = this.#eventsModel.events;

    if (events.length === 0) {
      return '';
    }

    if (events.length <= 3) {
      return events.map((event) => this.#eventsModel.getDestinationById(event.destination).name).join(' — ');
    }

    const firstPoint = this.#eventsModel.getDestinationById(events[0].destination).name;
    const lastPoint = this.#eventsModel.getDestinationById(events[events.length - 1].destination).name;
    return `${firstPoint} — ... — ${lastPoint}`;
  }

  #calcDates() {
    const events = this.#eventsModel.events;

    if (events.length === 0) {
      return '';
    }

    const firstDate = events[0].dateFrom;
    const lastDate = events[events.length - 1].dateTo;
    let firstMonth = firstDate.toLocaleString('en', { month: 'short' });
    const lastMonth = lastDate.toLocaleString('en', { month: 'short' });
    firstMonth = firstMonth === lastMonth ? '' : firstMonth;

    return `${firstDate.getDate()} ${firstMonth}&nbsp;&mdash;&nbsp;${lastDate.getDate()} ${lastMonth}`;
  }

  #calcTotalPrice() {
    return this.#eventsModel.events.reduce((total, event) => {
      const offers = this.#eventsModel.getOffersForEvent(event);
      const offersPrice = offers.reduce((offersTotal, offer) => offersTotal + offer.price, 0);
      return total + event.basePrice + offersPrice;
    }, 0);
  }
}
