# keyboard

<em>used to capture keyboard input.</em>

## usage

```typescript
import keyboard from '@elonehoo/keyboard'

keyboard('f5', function(event, handler){
  event.preventDefault()
  alert('you pressed F5!')
});
```

## supported keys

HotKeys understands the following modifiers: `⇧`, `shift`, `option`,`⌥`, `alt`, `ctrl`, `control`, `command`, and `⌘`.

The following special keys can be used for shortcuts: backspace, tab, clear, enter, return, esc, escape, space, up, down, left, right, home, end, pageup, pagedown, del, delete, f1 through f19, num_0 through num_9, num_multiply, num_add, num_enter, num_subtract, num_decimal, num_divide.

 - ⌘ Command()
 - ⌃ Control
 - ⌥ Option(alt)
 - ⇧ Shift
 - ⇪ Caps Lock(Capital)
 - ↩︎ return/Enter space

## defining shortcuts

<em>One global method is exposed, key which defines shortcuts when called directly.</em>

```typescript
keyboard([keys:<String>], [option:[string|object|function]], [callback:<function>])
```

```typescript
keyboard('f5', function(event, handler) {
  event.preventDefault() // Prevent the default refresh event under WINDOWS system
  alert('you pressed F5!')
})

// Returning false stops the event and prevents default browser events
// Mac OS system defines 「command + r」 as a refresh shortcut
keyboard('ctrl+r, command+r', function() {
  alert('stopped reload!')
  return false
})

// Single key
keyboard('a', function(event,handler){
  //event.srcElement: input
  //event.target: input
  if(event.target === "input"){
      alert('you pressed a!')
  }
  alert('you pressed a!')
})

keyboard('ctrl+a,ctrl+b,r,f', function (event, handler){
  switch (handler.key) {
    case 'ctrl+a': alert('you pressed ctrl+a!')
      break;
    case 'ctrl+b': alert('you pressed ctrl+b!')
      break;
    case 'r': alert('you pressed r!')
      break;
    case 'f': alert('you pressed f!')
      break;
    default: alert(event)
  }
})

keyboard('ctrl+a+s', function() {
    alert('you pressed ctrl+a+s!')
})

// Using a scope
keyboard('*','wcj', function(event){
  console.log('do something', event)
})
```

### option

- `scope<string>`
- `element<HTMLElement>`
- `keyup<boolean>`
- `keydown<boolean>`
- `splitKey<string>` (default is +)
- `capture<boolean>`

```typescript
keyboard('o, enter', {
  scope: 'wcj',
  element: document.getElementById('wrapper'),
}, function(){
  console.log('do something else')
})

keyboard('ctrl-+', { splitKey: '-' }, function(e) {
  console.log('you pressed ctrl and +')
})

keyboard('+', { splitKey: '-' }, function(e){
  console.log('you pressed +')
})
```

### keyup

**keyup** and **keydown** both perform callback events.

```typescript
keyboard('ctrl+a,alt+a+s', {keyup: true}, function(event, handler) {
  if (event.type === 'keydown') {
    console.log('keydown:', event.type, handler, handler.key)
  }

  if (event.type === 'keyup') {
    console.log('keyup:', event.type, handler, handler.key)
  }
})
```

## api reference

### Asterisk「*」

*Modifier key judgments*

```typescript
keyboard('*', function() {
  if (keyboard.shift) {
    console.log('shift is pressed!')
  }

  if (keyboard.ctrl) {
    console.log('ctrl is pressed!')
  }

  if (keyboard.alt) {
    console.log('alt is pressed!')
  }

  if (keyboard.option) {
    console.log('option is pressed!')
  }

  if (keyboard.control) {
    console.log('control is pressed!')
  }

  if (keyboard.cmd) {
    console.log('cmd is pressed!')
  }

  if (keyboard.command) {
    console.log('command is pressed!')
  }
})
```

### setScope
Use the keyboard. setScope method to set scope. There can only be one active scope besides 'all'. By default 'all' is always active.

```typescript
// Define shortcuts with a scope
keyboard('ctrl+o, ctrl+alt+enter', 'issues', function(){
  console.log('do something')
});
keyboard('o, enter', 'files', function(){
  console.log('do something else')
});

// Set the scope (only 'all' and 'issues' shortcuts will be honored)
keyboard.setScope('issues') // default scope is 'all'
```

### getScope

Use the `keyboard.getScope` method to get scope.

```typescript
keyboard.getScope()
```

### deleteScope

Use the `keyboard.deleteScope` method to delete a scope. This will also remove all associated keyboard with it.

```typescript
keyboard.deleteScope('issues')
```

You can use second argument, if need set new scope after deleting.

```typescript
keyboard.deleteScope('issues', 'newScopeName')
```

### unbind

Similar to defining shortcuts, they can be unbound using `keyboard.unbind`.

```typescript
// unbind 'a' handler
keyboard.unbind('a');

// Unbind a keyboard only for a single scope
// If no scope is specified it defaults to the current scope (keyboard.getScope())
keyboard.unbind('o, enter', 'issues');
keyboard.unbind('o, enter', 'files');
```

Unbind events through functions.

```typescript
function example() {
  keyboard('a', example);
  keyboard.unbind('a', example);

  keyboard('a', 'issues', example);
  keyboard.unbind('a', 'issues', example);
}
```

To unbind everything.

```typescript
keyboard.unbind()
```

### isPressed

For example, `keyboard.isPressed(77)` is true if the M key is currently pressed.

```typescript
keyboard('a', function() {
  console.log(keyboard.isPressed('a')) //=> true
  console.log(keyboard.isPressed('A')) //=> true
  console.log(keyboard.isPressed(65)) //=> true
})
```

### trigger

```typescript
keyboard.trigger('ctrl+o')
keyboard.trigger('ctrl+o', 'scope2')
```

### getPressedKeyCodes

Returns an array of key codes currently pressed.

```typescript
keyboard('command+ctrl+shift+a,f', function(){
  console.log(keyboard.getPressedKeyCodes()) //=> [17, 65] or [70]
})
```

### filter

By default keyboard are not enabled for `INPUT` `SELECT` `TEXTAREA` elements. `Hotkeys.filter` to return to the `true` shortcut keys set to play a role, `false` shortcut keys set up failure.

```typescript
keyboard.filter = function(event){
  return true;
}
//How to add the filter to edit labels. <div contentEditable="true"></div>
//"contentEditable" Older browsers that do not support drops
keyboard.filter = function(event) {
  var target = event.target || event.srcElement;
  var tagName = target.tagName;
  return !(target.isContentEditable || tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
}

keyboard.filter = function(event){
  var tagName = (event.target || event.srcElement).tagName;
  keyboard.setScope(/^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? 'input' : 'other');
  return true;
}
```

### noConflict

Relinquish HotKeys’s control of the `keyboard` variable.

```typescript
var k = keyboard.noConflict();
k('a', function() {
  console.log("do something")
});

keyboard()
```

## license

[MIT](./LICENSE) © [Elone Hoo](https://github.com/elonehoo)
