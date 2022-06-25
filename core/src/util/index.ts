export const isff:boolean = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase().indexOf('firefox') > 0 : false

/**
 * bind event
 */
export function addEvent(object:any, event:any, method:any, useCapture:any) {
  if (object.addEventListener) {
    object.addEventListener(event, method, useCapture)
  } else if (object.attachEvent) {
    object.attachEvent(`on${event}`, () => { method(window.event); })
  }
}

/**
 * convert modifier keys to corresponding key codes
 */
export function getMods(modifier:any, key:any) {
  const mods = key.slice(0, key.length - 1)
  for (let i = 0; i < mods.length; i++) mods[i] = modifier[mods[i].toLowerCase()]
  return mods
}

/**
 * convert the passed key string to an array
 */
export function getKeys(key:any) {
  if (typeof key !== 'string') key = ''
  key = key.replace(/\s/g, '') // matches any whitespace character, including spaces, tabs, form feeds, etc.
  const keys = key.split(',') // Set multiple shortcut keys at the same time, separated by ','
  let index = keys.lastIndexOf('')

  // Shortcut keys may contain ',', special handling is required
  for (; index >= 0;) {
    keys[index - 1] += ','
    keys.splice(index, 1)
    index = keys.lastIndexOf('')
  }

  return keys
}

/**
 * compare arrays of modifier keys
 */
export function compareArray(a1:any, a2:any):boolean{
  const arr1 = a1.length >= a2.length ? a1 : a2
  const arr2 = a1.length >= a2.length ? a2 : a1
  let isIndex:boolean = true

  for (let i = 0; i < arr1.length; i++) {
    if (arr2.indexOf(arr1[i]) === -1) isIndex = false
  }
  return isIndex
}

