import RoutePresenter from './presenter/route-presenter';
import EventsModel from './model/events-model';
import FilterModel from './model/filter-model';
import FilterPresenter from './presenter/filter-presenter';
import RouteApiService from './net_utils/route-api-service';

const AUTHORIZATION = 'Basic mjLnjniUUKn86';
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

const container = document.querySelector('.page-body');
const filtersContainer = container.querySelector('.trip-controls__filters');
const eventsModel = new EventsModel({
  routeApiService: new RouteApiService(END_POINT, AUTHORIZATION),
});
const filterModel = new FilterModel();

const routePresenter = new RoutePresenter({container, eventsModel, filterModel});
const filterPresenter = new FilterPresenter({container: filtersContainer, filterModel, eventsModel});

routePresenter.init();
eventsModel.init()
  .finally(() => {
    filterPresenter.init();
    routePresenter.initNewEventPresenter();
  });
