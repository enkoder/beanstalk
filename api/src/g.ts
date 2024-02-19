import { AsyncLocalStorage } from "node:async_hooks";
import type { G } from "./types.js";

export const ALS = new AsyncLocalStorage<G>();
export let _testG: G;

export function g(): G {
  if (_testG) return _testG;
  return ALS.getStore();
}

export function initTestG({ db, mf }: G): G {
  _testG = { db: db, mf: mf };
  return _testG;
}
