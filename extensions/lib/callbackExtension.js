import isPlainObject from 'is-plain-object'

export default function(callback) {
  return duck => {
    const callbackResult = callback(duck)
    if (!isPlainObject(callbackResult)) {
      throw new TypeError('Provided callback must return a plain object.')
    }
    return callbackResult
  }
}
