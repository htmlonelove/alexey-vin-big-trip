import { FilterType } from '../utils/const';
import { render, replace, remove } from '../framework/render';
import FiltersView from '../view/filters-view';
import { UpdateType } from '../utils/const';
import { filter } from '../utils/filter';

export default class FilterPresenter {
  #filtersContainer = null;
  #filterModel = null;
  #eventsModel = null;
  #filterView = null;
  #filtersStates = new Map();

  constructor({container, filterModel, eventsModel}) {
    this.#filtersContainer = container;
    this.#filterModel = filterModel;
    this.#eventsModel = eventsModel;

    this.#filterModel.addObserver(this.#handleModelEvent);
    this.#eventsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    const prevFilterView = this.#filterView;

    for (const filterType of Object.values(FilterType)) {
      this.#filtersStates.set(filterType, filter[filterType](this.#eventsModel.events).length !== 0);
    }

    this.#filterView = new FiltersView({
      filters: Object.values(FilterType),
      currentFilter: this.#filterModel.filter,
      filterStates: this.#filtersStates,
      onFilterTypeChange: this.#handleFilterTypeChange,
    });

    if (prevFilterView === null) {
      render(this.#filterView, this.#filtersContainer);
      return;
    }

    replace(this.#filterView, prevFilterView);
    remove(prevFilterView);
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
