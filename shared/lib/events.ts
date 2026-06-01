import { EventEmitter } from "events";

const globalForEvents = global as unknown as { chatEventEmitter: EventEmitter };

export const chatEventEmitter = globalForEvents.chatEventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEvents.chatEventEmitter = chatEventEmitter;
}
