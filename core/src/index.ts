import { addEvent, compareArray, getKeys, getMods } from './util'
import { _handlers, _keyMap, _modifier, _mods, modifierMap } from './var'
import type Hotkeys from './type'

type KeyMap = keyof typeof _keyMap
type Modifier = keyof typeof _modifier
type ModifierMap = keyof typeof modifierMap
type Mods = keyof typeof _mods

// record the binding key pressed
let _downKeys: Array<number> = []
// default hotkey range
let _scope = 'all'
// node records for bound events
const elementHasBindEvent: Array<Document> = []

// return key code
const code = (x: KeyMap | Modifier | string) => {
  return _keyMap[x.toLowerCase() as KeyMap] || _modifier[x.toLowerCase() as Modifier] || x.toUpperCase().charCodeAt(0)
}

// set get current scope (defaults to 'all')
function setScope(scope: string): void {
  _scope = scope || 'all'
}

// get current scope
function getScope(): string {
  return _scope || 'all'
}

// get the key value of the bound key pressed
function getPressedKeyCodes(): number[] {
  return _downKeys.slice(0)
}

// hotkey is effective only when filter return true
function filter(event: Event & { srcElement: any }): boolean {
  const target = event.target || event.srcElement
  const { tagName } = target
  let flag = true
  if (
    target.isContentEditable
    || ((tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') && !target.readOnly)
  )
    flag = false

  return flag
}

// determine whether the pressed key is a certain key, return true or false
function isPressed(keyCode: string|number): boolean {
  if (typeof keyCode === 'string')
    keyCode = code(keyCode)

  return _downKeys.includes(keyCode)
}

// loop through all scopes in handlers
function deleteScope(scope: string, newScope: string): void {
  let handlers
  let i

  if (!scope)
    scope = getScope()

  for (const key in _handlers) {
    if (Object.prototype.hasOwnProperty.call(_handlers, key)) {
      handlers = _handlers[key]
      for (i = 0; i < handlers.length;) {
        if (handlers[i].scope === scope)
          handlers.splice(i, 1)
        else i++
      }
    }
  }

  if (getScope() === scope)
    setScope(newScope || 'all')
}

// clear modifier keys
function clearModifier(event: any): void {
  let key = event.keyCode || event.which || event.charCode
  const i = _downKeys.indexOf(key)

  if (i >= 0)
    _downKeys.splice(i, 1)

  if (event.key && event.key.toLowerCase() === 'meta')
    _downKeys.splice(0, _downKeys.length)

  if (key === 93 || key === 224)
    key = 91
  if (key in _mods) {
    _mods[key as Mods] = false

    for (const k in _modifier) {
      if (_modifier[k as Modifier] === key)
        keyboard[k] = false
    }
  }
}

function unbind(keysInfo: any, ...args: any): void {
  // unbind(), unbind all keys
  if (!keysInfo) {
    Object.keys(_handlers).forEach(key => delete _handlers[key])
  }
  else if (Array.isArray(keysInfo)) {
    // support like : unbind([{key: 'ctrl+a', scope: 's1'}, {key: 'ctrl-a', scope: 's2', splitKey: '-'}])
    keysInfo.forEach((info) => {
      if (info.key)
        eachUnbind(info)
    })
  }
  else if (typeof keysInfo === 'object') {
    // support like unbind({key: 'ctrl+a, ctrl+b', scope:'abc'})
    if (keysInfo.key)
      eachUnbind(keysInfo)
  }
  else if (typeof keysInfo === 'string') {
    // support old method
    // eslint-disable-line
    let [scope, method] = args
    if (typeof scope === 'function') {
      method = scope
      scope = ''
    }
    eachUnbind({
      key: keysInfo,
      scope,
      method,
      splitKey: '+',
    })
  }
}

// 解除绑定某个范围的快捷键
const eachUnbind = ({
  key, scope, method, splitKey = '+',
}: {
  key?: string
  scope?: string
  method?: Function
  splitKey?: string
}) => {
  const multipleKeys: Array<string> = getKeys(key)
  multipleKeys.forEach((originKey) => {
    const unbindKeys = originKey.split(splitKey)
    const len = unbindKeys.length
    const lastKey = unbindKeys[len - 1]
    const keyCode = lastKey === '*' ? '*' : code(lastKey)
    if (!_handlers[keyCode])
      return
    if (!scope)
      scope = getScope()
    const mods = len > 1 ? getMods(_modifier, unbindKeys) : []
    _handlers[keyCode] = _handlers[keyCode].map((record: any) => {
      const isMatchingMethod = method ? record.method === method : true
      if (
        isMatchingMethod
        && record.scope === scope
        && compareArray(record.mods, mods)
      )
        return {}

      return record
    })
  })
}

// 对监听对应快捷键的回调函数进行处理
function eventHandler(event: Event, handler: any, scope: string) {
  let modifiersMatch
  if (handler.scope === scope || handler.scope === 'all') {
    modifiersMatch = handler.mods.length > 0

    for (const y in _mods) {
      if (Object.prototype.hasOwnProperty.call(_mods, y)) {
        if (
          (!_mods[y as Mods] && handler.mods.includes(+y))
          || (_mods[y as Mods] && !handler.mods.includes(+y))
        )
          modifiersMatch = false
      }
    }
    if (
      (handler.mods.length === 0
        && !_mods[16]
        && !_mods[18]
        && !_mods[17]
        && !_mods[91])
      || modifiersMatch
      || handler.shortcut === '*'
    ) {
      if (handler.method(event, handler) === false) {
        if (event.preventDefault)
          event.preventDefault()
        else event.returnValue = false
        if (event.stopPropagation)
          event.stopPropagation()
        if (event.cancelBubble)
          event.cancelBubble = true
      }
    }
  }
}

// 处理keydown事件
function dispatch(this: any, event: any) {
  const asterisk = _handlers['*']
  let key = event.keyCode || event.which || event.charCode

  // 表单控件过滤 默认表单控件不触发快捷键
  if (!keyboard.filter.call(this, event))
    return

  // Gecko(Firefox)的command键值224，在Webkit(Chrome)中保持一致
  // Webkit左右 command 键值不一样
  if (key === 93 || key === 224)
    key = 91

  /**
   * Collect bound keys
   * If an Input Method Editor is processing key input and the event is keydown, return 229.
   * https://stackoverflow.com/questions/25043934/is-it-ok-to-ignore-keydown-events-with-keycode-229
   * http://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html
   */
  if (!_downKeys.includes(key) && key !== 229)
    _downKeys.push(key);
  /**
   * Jest test cases are required.
   * ===============================
   */
  ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'].forEach((keyName) => {
    const keyNum = modifierMap[keyName as ModifierMap]
    if (event[keyName as keyof typeof event] && !_downKeys.includes(keyNum as number)) {
      _downKeys.push(keyNum as number)
    }
    else if (!event[keyName as keyof typeof event] && _downKeys.includes(keyNum as number)) {
      _downKeys.splice(_downKeys.indexOf(keyNum as number), 1)
    }
    else if (keyName === 'metaKey' && event[keyName] && _downKeys.length === 3) {
      /**
       * Fix if Command is pressed:
       * ===============================
       */
      if (!(event.ctrlKey || event.shiftKey || event.altKey))
        _downKeys = _downKeys.slice(_downKeys.indexOf(keyNum as number))
    }
  })
  /**
   * -------------------------------
   */

  if (key in _mods) {
    _mods[key as Mods] = true

    // 将特殊字符的key注册到 keyboard 上
    for (const k in _modifier) {
      if (_modifier[k as Modifier] === key)
        keyboard[k] = true
    }

    if (!asterisk)
      return
  }

  // 将 modifierMap 里面的修饰键绑定到 event 中
  for (const e in _mods) {
    if (Object.prototype.hasOwnProperty.call(_mods, e))
      _mods[e as Mods] = (event[modifierMap[e as ModifierMap] as keyof typeof event] as boolean)
  }
  if (event.getModifierState && (!(event.altKey && !event.ctrlKey) && event.getModifierState('AltGraph'))) {
    if (!_downKeys.includes(17))
      _downKeys.push(17)

    if (!_downKeys.includes(18))
      _downKeys.push(18)

    _mods[17] = true
    _mods[18] = true
  }

  // 获取范围 默认为 `all`
  const scope = getScope()
  // 对任何快捷键都需要做的处理
  if (asterisk) {
    for (let i = 0; i < asterisk.length; i++) {
      if (
        asterisk[i].scope === scope
        && ((event.type === 'keydown' && asterisk[i].keydown)
        || (event.type === 'keyup' && asterisk[i].keyup))
      )
        eventHandler(event, asterisk[i], scope)
    }
  }
  // key 不在 _handlers 中返回
  if (!(key in _handlers))
    return

  for (let i = 0; i < _handlers[key].length; i++) {
    if (
      (event.type === 'keydown' && _handlers[key][i].keydown)
      || (event.type === 'keyup' && _handlers[key][i].keyup)
    ) {
      if (_handlers[key][i].key) {
        const record = _handlers[key][i]
        const { splitKey } = record
        const keyShortcut = record.key.split(splitKey)
        const _downKeysCurrent = [] // 记录当前按键键值
        for (let a = 0; a < keyShortcut.length; a++)
          _downKeysCurrent.push(code(keyShortcut[a]))

        if (_downKeysCurrent.sort().join('') === _downKeys.sort().join('')) {
          // 找到处理内容
          eventHandler(event, record, scope)
        }
      }
    }
  }
}

// 判断 element 是否已经绑定事件
function isElementBind(element: Document) {
  return elementHasBindEvent.includes(element)
}

const keyboard: Hotkeys = (key: any, option:any, method?: any) => {
  _downKeys = []
  const keys = getKeys(key as string) // 需要处理的快捷键列表
  let mods = []
  let scope = 'all' // scope默认为all，所有范围都有效
  let element = document // 快捷键事件绑定节点
  let i = 0
  let keyup = false
  let keydown = true
  let splitKey = '+'

  // 对为设定范围的判断
  if (method === undefined && typeof option === 'function')
    method = option

  if (Object.prototype.toString.call(option) === '[object Object]') {
    if (option.scope) scope = option.scope; // eslint-disable-line
    if (option.element) element = option.element; // eslint-disable-line
    if (option.keyup) keyup = option.keyup; // eslint-disable-line
    if (option.keydown !== undefined) keydown = option.keydown; // eslint-disable-line
    if (typeof option.splitKey === 'string') splitKey = option.splitKey; // eslint-disable-line
  }

  if (typeof option === 'string')
    scope = option

  // 对于每个快捷键进行处理
  for (; i < keys.length; i++) {
    key = keys[i].split(splitKey) // 按键列表
    mods = []

    // 如果是组合快捷键取得组合快捷键
    if (key.length > 1)
      mods = getMods(_modifier, key)

    // 将非修饰键转化为键码
    key = key[key.length - 1]
    key = key === '*' ? '*' : code(key as string) // *表示匹配所有快捷键

    // 判断key是否在_handlers中，不在就赋一个空数组
    if (!(key in _handlers))
      _handlers[key] = []
    _handlers[key].push({
      keyup,
      keydown,
      scope,
      mods,
      shortcut: keys[i],
      method,
      key: keys[i],
      splitKey,
    })
  }
  // 在全局document上设置快捷键
  if (typeof element !== 'undefined' && !isElementBind(element) && window) {
    elementHasBindEvent.push(element)
    addEvent(element, 'keydown', (e: Event | undefined) => {
      dispatch(e)
    })
    addEvent(window, 'focus', () => {
      _downKeys = []
    })
    addEvent(element, 'keyup', (e: Event | undefined) => {
      dispatch(e)
      clearModifier(e)
    })
  }
}

const _api = {
  setScope,
  getScope,
  deleteScope,
  getPressedKeyCodes,
  isPressed,
  filter,
  unbind,
}

for (const a in _api) {
  if (Object.prototype.hasOwnProperty.call(_api, a))
    keyboard[a] = _api[a as keyof typeof _api]
}

if (typeof window !== 'undefined') {
  const _hotkeys = window.keyboard
  keyboard.noConflict = (deep: any) => {
    if (deep && window.keyboard === keyboard)
      window.keyboard = _hotkeys

    return keyboard
  }
  window.keyboard = keyboard
}

export default keyboard
