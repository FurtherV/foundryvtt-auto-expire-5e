/**
 * Main Module File
 */

import { getSetting, registerModuleSettings } from "./settings.mjs";
import { registerModuleApi } from "./api.mjs";

Hooks.once("init", () => {
  registerModuleSettings();
  registerModuleApi();
});
