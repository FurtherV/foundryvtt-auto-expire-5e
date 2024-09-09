import { LANG_ID, MODULE_ID, SETTING } from "./constants.mjs";

/**
 * Get the value of the specified setting from this module
 * @param {string} key The setting key to retrieve
 */
export function getSetting(key) {
  return game.settings.get(MODULE_ID, key);
}

/**
 * Registers this module's settings
 */
export function registerModuleSettings() {}

/**
 *
 * @param key
 * @param data
 */
function _registerSetting(key, data) {
  game.settings.register(
    MODULE_ID,
    key,
    foundry.utils.mergeObject(
      {
        name: `${LANG_ID}.Setting.${key}.Name`,
        hint: `${LANG_ID}.Setting.${key}.Hint`,
      },
      data,
    ),
  );
}
