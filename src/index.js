import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import rootReducers from './store/rootReducers'
import { watchAuth, watchBurgerBuilder, watchOrder } from './store/sagas'


const composeEnhancers = process.env.NODE_ENV === 'development' ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__  : null || compose

const sagaMiddleware = createSagaMiddleware()

const store = createStore(rootReducers, composeEnhancers(
  applyMiddleware(thunk, sagaMiddleware)
))

sagaMiddleware.run(watchAuth)
sagaMiddleware.run(watchBurgerBuilder)
sagaMiddleware.run(watchOrder)

const app = (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
)

ReactDOM.render(app, document.getElementById('root'));
registerServiceWorker();
