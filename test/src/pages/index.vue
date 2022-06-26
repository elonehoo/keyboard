<script setup lang="ts">
import keyboard from '@elonehoo/keyboard'

// custom activation function
const activate = (event: any, handler: any) => {
  const { key } = handler
  const elmt = document.querySelector(`.button-${key}`)
  if (elmt) {
    elmt.classList.add('active')
    setTimeout(() => { elmt.classList.remove('active') }, 350)
  }
}

// see hotkeys docs at
// https://github.com/jaywcjlove/hotkeys
keyboard('a,b,c,7', activate)
</script>

<template>
  <div class="body">
    <p>PRESS ONE OF US ON YOUR KEYBOARD 😙 <br> <small>(FOCUS THIS WINDOW FIRST)</small></p>

    <div class="keys">
      <button class="button-a">
        A
      </button>
      <button class="button-b">
        B
      </button>
      <button class="button-c">
        C
      </button>
      <button class="button-7">
        7
      </button>
    </div>
  </div>
</template>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  width: 100vw;
  height: 100vh;
  background: mediumslateblue;
}

.keys {
  margin: 0;
  display: flex;
  background: slateblue;
  padding: 2rem;
  border-radius: .66rem;
}

p {
  text-align: center;
  margin: 0 0 1rem 0;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  font-family: sans-serif;
}

a {
  text-align: center;
  margin: 1rem 0 0 0;
  color: white !important;
  font-weight: bold;
  text-transform: uppercase;
  font-family: sans-serif;
  font-size: .7em;
  text-decoration: none;
}

.keys button {
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  border: none;
  outline: none;
  background: white;
  border-radius: .33rem;
  font-size: 1em;
  padding: 1rem;
  margin-right: 1rem;
  min-width: 5rem;
  box-shadow: 0 .33rem 1rem rgba(0,0,0,.25);
  transition: all .15s linear;
  font-weight: bold;
  color: slateblue;
}

.keys button:last-child {
  margin-right: 0;
}

.keys button.active {
  opacity: .6;
  box-shadow: 0 0 0 rgba(0,0,0,0);
}
</style>
