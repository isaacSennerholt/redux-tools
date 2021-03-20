import isPlainObject from 'is-plain-object'
import extendDuck from './extendDuck.js'

export default function({ duck, extensions } = {}) {
  if (!isPlainObject(duck)) {
    throw new TypeError('Duck must be a plain object.')
  }

  let extendedDuck = duck

  if (Array.isArray(extensions)) {
    extensions.forEach(extension => {
      const extensionObject =
        typeof extension === 'function' ? extension(extendedDuck) : extension

      extendedDuck = extendDuck(extendedDuck, extensionObject)
    })
  }

  return extendedDuck
}
