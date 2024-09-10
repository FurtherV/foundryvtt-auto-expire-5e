import { EXPIRY_ACTION, LANG_ID, MODULE_ID, SETTING } from "./constants.mjs";

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
export function registerModuleSettings() {
  _registerSetting(SETTING.EXPIRY_ACTION, {
    scope: "world",
    config: true,
    requiresReload: false,
    type: String,
    choices: Object.fromEntries(
      Object.entries(EXPIRY_ACTION).map(([_, v]) => [
        v,
        `${LANG_ID}.expiryAction.${v}`,
      ]),
    ),
    default: EXPIRY_ACTION.PROMPT,
  });
}

/**
 * Registers a setting with given key and configuration data for this module
 * @param {string} key The settings key
 * @param {SettingConfig} data The settings configuration data
 */
function _registerSetting(key, data) {
  game.settings.register(
    MODULE_ID,
    key,
    foundry.utils.mergeObject(
      {
        name: `${LANG_ID}.setting.${key}.name`,
        hint: `${LANG_ID}.setting.${key}.hint`,
      },
      data,
    ),
  );
}
