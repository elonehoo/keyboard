/// <reference types="vite/client" />

declare interface Window extends Window, Document {
  keyboard: any;
  attachEvent?: any
}
declare interface Hotkeys extends Function{
  (key: any, option: any, method?: any): void;
  [key: string]: any;
}
declare interface Document extends Document, Window {attachEvent?: any}
declare interface Event extends KeyboardEvent, Event {
  srcElement: any,keyCode: number,which: number,charCode: number,
  ctrlKey: any, altKey: any, shiftKey: any, metaKey: any,
  getModifierState?: (params: string)=>unknown,
}
