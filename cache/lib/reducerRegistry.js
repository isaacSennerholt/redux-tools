let reducers = {}
let changeListener = null

export function getReducers() {
  return { ...reducers }
}

export function mountReducer(name, reducer) {
  reducers = { ...reducers, [name]: reducer }
  if (changeListener) changeListener(getReducers())
}

export function setChangeListener(listener) {
  changeListener = listener
}
