import isPlainObject from 'is-plain-object'
import { combineReducers, createStore, applyMiddleware, compose } from 'redux'
import { getReducers, setChangeListener } from './reducerRegistry.js'

export default function createCache({ initialState = {}, middlewares = [] }) {
  if (!Array.isArray(middlewares)) {
    throw new TypeError('Middlewares must be an array.')
  }

  if (!isPlainObject(initialState)) {
    throw new TypeError('Initital state must be a plain object.')
  }

  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

  const appliedMiddlewares =
    process.env.NODE_ENV === 'development'
      ? composeEnhancers(applyMiddleware(...middlewares))
      : applyMiddleware(...middlewares)

  function combine(reducers = {}) {
    const reducerNames = Object.keys(reducers)
    if (!reducerNames.length) return (state = null) => state

    const updatedReducers = Object.keys(initialState).reduce(
      (updatedReducers, initialStateKey) => {
        if (!reducerNames.includes(initialStateKey)) {
          updatedReducers[initialStateKey] = (state = null) => state
        }
        return updatedReducers
      },
      reducers
    )

    return combineReducers(updatedReducers)
  }

  const reducer = combine(getReducers())
  const store = createStore(reducer, initialState, appliedMiddlewares)

  setChangeListener(reducers => {
    store.replaceReducer(combine(reducers))
  })

  return store
}
