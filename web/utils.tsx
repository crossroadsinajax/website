import { Maybe } from "./types"

function isDefined<TValue>(value: Maybe<TValue>): value is TValue {
  if (value === null || value === undefined) return false
  return true
}

export { isDefined }
