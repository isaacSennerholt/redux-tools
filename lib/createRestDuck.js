export default function(namespace, name) {
  const methodNames = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  const phases = ['REQUEST', 'SUCCESS', 'ERROR']

  let actionTypes = methodNames.reduce((actionTypes, methodName) => {
    return phases.reduce((newActionTypes, phase) => {
      const actionType = `${methodName}-${phase}`
      const value = `${namespace}/${name}/${actionType}`
      newActionTypes[actionType] = value
      return newActionTypes
    }, actionTypes)
  }, {})

  const resetActionType = `${namespace}/${name}/RESET`
  actionTypes = { ...actionTypes, RESET: resetActionType }

  function dataReducer(state = {}, { type, payload } = {}) {
    const isBulk = Array.isArray(payload)
    const ids = isBulk ? payload.map(({ id }) => id) : []
    switch (type) {
      case actionTypes['GET-SUCCESS']:
      case actionTypes['POST-SUCCESS']:
      case actionTypes['PUT-SUCCESS']:
      case actionTypes['PATCH-SUCCESS']:
        if (!isBulk) return { ...state, [payload.id]: payload }
        return {
          ...state,
          ...payload.reduce((items, item) => {
            items[item.id] = item
            return items
          }, {}),
        }
      case actionTypes['DELETE-SUCCESS']:
        if (!isBulk) {
          return Object.keys(state).reduce((items, stateItemId) => {
            if (stateItemId != payload.id)
              items[stateItemId] = state[stateItemId]
            return items
          }, {})
        }
        return Object.keys(state).reduce((items, stateItemId) => {
          if (!ids.find(itemId => itemId == stateItemId)) {
            items[stateItemId] = state[stateItemId]
          }
          return items
        }, {})
      case actionTypes['RESET']:
        return {}
      default:
        return state
    }
  }

  function duckReducer(state = {}, action = {}) {
    const { data } = state
    return { ...state, data: dataReducer(data, action) }
  }

  const actionCreators = Object.keys(actionTypes).reduce(
    (actionCreators, actionType) => {
      const actionCreatorName = actionType
        .replace('-', ' ')
        .toLowerCase()
        .replace(/\W+(.)/g, (_, character) => {
          return character.toUpperCase()
        })

      const actionCreator = (payload, options = {}) => {
        let action = { ...options, type: actionTypes[actionType] }
        if (payload) action = { ...action, payload }
        return action
      }

      actionCreators[actionCreatorName] = actionCreator

      return actionCreators
    },
    {}
  )

  return {
    namespace,
    name,
    reducer: duckReducer,
    actionCreators,
  }
}
