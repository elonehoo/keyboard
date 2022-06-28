<script setup lang="ts">
import keyboard from '@elonehoo/keyboard'
import macKeyboard, { KeyCodeData } from '@elonehoo/vue-mac-keyboard'

const keycode: number[] = $ref([])

document.addEventListener('keyup',onKeyUpEvent)

function onKeyUpEvent(){
  keycode.splice(0,keycode.length)
}

keyboard('*',(event:any)=>{
  event.preventDefault()
  keycode.push(event.keyCode)
})

function macMousedown(el: HTMLLIElement, item: KeyCodeData) {
  if (item.keycode > -1)
    keycode.push(item.keycode)
}

function macMouseup(el: HTMLLIElement, item: KeyCodeData) {
  keycode.splice(0, keycode.length)
}
</script>

<template>
  <div>
    <macKeyboard :key-code="keycode" @mac-mousedown="macMousedown" @mac-mouseup="macMouseup" />
  </div>
</template>

<style scoped>
</style>
