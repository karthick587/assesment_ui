import reducers from "./reducers";
import { createStore, combineReducers, applyMiddleware } from "redux";
import {composeWithDevTools} from 'redux-devtools-extension';
import reduxSaga from "redux-saga";
import rootSaga from "./sagas";

const reduxSagaMiddleware = reduxSaga();

const rootReducers = combineReducers({ ...reducers });

export const store = createStore(
  rootReducers, 
  composeWithDevTools(applyMiddleware(reduxSagaMiddleware))
);

reduxSagaMiddleware.run(rootSaga);
