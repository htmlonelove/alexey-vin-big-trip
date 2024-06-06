import { remove, render } from '../framework/render';
import UiBlocker from '../framework/ui-blocker/ui-blocker';
import SortEventsView from '../view/sort-events-view';
import EventsListView from '../view/events-list-view';
import NoEventsView from '../view/no-events-views';
import LoadingView from '../view/loading-view';
import EventPresenter, { EventMode } from './event-presenter';
import { SortType, FilterType } from '../utils/const';
import { sortByTime, sortByPrice, sortByDefault } from '../utils/event';
import { UserAction, UpdateType } from '../utils/const';
import { filter } from '../utils/filter';
import NewEventPresenter from './new-event-presenter';
import TripInfoPresenter from './trip-info-presenter';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class RoutePresenter {
  #container = null;
  #eventsModel = null;
  #filterModel = null;
  #eventsContainer = null;
  #eventsListView = null;
  #sortEventsView = null;
  #noEventsView = null;
  #loadingView = new LoadingView();
  #eventPresenters = new Map();
  #newEventPresenter = null;
  #tripInfoPresenter = null;
  #currentSortType = SortType.DEFAULT;
  #filterType = FilterType.EVERYTHING;
  #isLoading = true;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT,
  });

  constructor({container, eventsModel, filterModel}) {
    this.#container = container;
    this.#eventsModel = eventsModel;
    this.#filterModel = filterModel;
    this.#eventsContainer = this.#container.querySelector('.trip-events');

    this.#eventsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);

    this.#newEventPresenter = new NewEventPresenter({
      container,
      eventModel: this.#eventsModel,
      onAddButtonClick: this.#handleNewEventButtonClick,
      onDataChange: this.#handleViewAction,
      onCanceled: this.#handleAddEventCancled,
    });

    this.#tripInfoPresenter = new TripInfoPresenter({
      container,
      eventsModel: this.#eventsModel,
    });
  }

  init() {
    this.#render();
  }

  initNewEventPresenter() {
    this.#newEventPresenter.init();
  }

  get events() {
    this.#filterType = this.#filterModel.filter;
    const events = this.#eventsModel.events;
    const filteredEvents = filter[this.#filterType](events);
    switch (this.#currentSortType) {
      case SortType.TIME:
        return filteredEvents.sort(sortByTime);
      case SortType.PRICE:
        return filteredEvents.sort(sortByPrice);
    }

    return filteredEvents.sort(sortByDefault);
  }

  #render() {
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }

    if (this.events.length === 0) {
      this.#renderNoEvents();
      return;
    }

    this.#tripInfoPresenter.init();
    this.#renderSortEvents();
    this.#renderEvents();
  }

  #renderNoEvents() {
    this.#noEventsView = new NoEventsView({filterType: this.#filterType});
    render(this.#noEventsView, this.#eventsContainer);
  }

  #renderLoading() {
    render(this.#loadingView, this.#eventsContainer);
  }

  #renderSortEvents() {
    this.#sortEventsView = new SortEventsView({
      currentSortType: this.#currentSortType,
      onSortTypeChanged: this.#handleSortTypeChanged });
    render(this.#sortEventsView, this.#eventsContainer);
  }

  #renderEvents() {
    if (!this.#eventsListView) {
      this.#eventsListView = new EventsListView();
      render(this.#eventsListView, this.#eventsContainer);
    }

    for(const event of this.events) {
      this.#renderEvent(event);
    }
  }

  #renderEvent(event) {
    const eventPresenter = new EventPresenter({
      parentContainer: this.#eventsListView,
      model: this.#eventsModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleEventModeChange,
    });

    eventPresenter.init(event);
    this.#eventPresenters.set(event.id, eventPresenter);
  }

  #clear({resetSortType = false} = {}) {
    this.#eventPresenters.forEach((presenter) => presenter.destroy());
    this.#eventPresenters.clear();
    this.#newEventPresenter.destroy();

    remove(this.#eventsListView);
    remove(this.#sortEventsView);
    remove(this.#loadingView);

    this.#eventsListView = null;
    this.#sortEventsView = null;

    if (this.#noEventsView) {
      remove(this.#noEventsView);
      this.#noEventsView = null;
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DEFAULT;
    }
  }

  #handleEventChange = (updatedEvent) => {
    this.#eventsModel.updateEvent(updatedEvent);
    this.#eventPresenters.get(updatedEvent.id).init(updatedEvent);
  };

  #handleEventModeChange = () => {
    this.#eventPresenters.forEach((presenter) => presenter.mode !== EventMode.DEFAULT && presenter.resetView());
  };

  #handleSortTypeChanged = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clear();
    this.#render();
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();

    switch (actionType) {
      case UserAction.UPDATE_EVENT:
        this.#eventPresenters.get(update.id).setSaving();
        try {
          await this.#eventsModel.updateEvent(update, updateType);
        } catch (error) {
          this.#eventPresenters.get(update.id).setAborting();
        }
        break;
      case UserAction.ADD_EVENT:
        this.#newEventPresenter.setSaving();
        try {
          await this.#eventsModel.addEvent(update, updateType);
        } catch (error) {
          this.#newEventPresenter.setAborting();
        }
        break;
      case UserAction.DELETE_EVENT:
        this.#eventPresenters.get(update.id).setDeleting();
        try {
          await this.#eventsModel.deleteEvent(update, updateType);
        } catch (error) {
          this.#eventPresenters.get(update.id).setAborting();
        }
        break;
    }

    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#eventPresenters.get(data.id).init(data);
        this.#tripInfoPresenter.init();
        break;
      case UpdateType.MINOR:
        this.#clear();
        this.#render();
        break;
      case UpdateType.MAJOR:
        this.#clear({resetSortType: true});
        this.#render();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingView);
        this.#render();
        break;
    }
  };

  #handleNewEventButtonClick = () => {
    this.#currentSortType = SortType.DEFAULT;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    if (!this.#eventsListView) {
      this.#clear();
      this.#eventsListView = new EventsListView();
      render(this.#eventsListView, this.#eventsContainer);
    }
  };

  #handleAddEventCancled = () => {
    this.#clear();
    this.#render();
  };
}
