import { FLAG, MODULE_ID } from "./constants.mjs";
import { ScriptModel } from "./data/script-model.mjs";

export function registerModuleApi() {
  const moduleObj = game.modules.get(MODULE_ID);
  const api = {};
  moduleObj.api = api;
  globalThis[MODULE_ID.replace("-", "").toCamelCase()] = api;
}
