import type { EventLevel, SimEvent } from "@/types/auth";
import { generateId } from "./challenge";

export function makeEvent(level: EventLevel, tag: string, msg: string): SimEvent {
  return { id: generateId("ev", 4), ts: Date.now(), level, tag, msg };
}

export class AbortedError extends Error {
  constructor() {
    super("simulation aborted");
    this.name = "AbortedError";
  }
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
