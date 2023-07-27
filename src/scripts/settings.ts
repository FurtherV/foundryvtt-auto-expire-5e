import { MODULE_ID } from "./constants.js";

export enum ModuleSetting {
    ExpirationHandling = "expirationHandling",
}

/**
 * Registers all settings of this module.
 */
export function registerSettings() {
    registerModuleSetting(ModuleSetting.ExpirationHandling, {
        type: String,
        choices: {
            disable: "Disable",
            delete: "Delete",
        } as Record<string, string>,
        default: "disable",
        config: true,
        requiresReload: false,
    });
}

export function getSetting<T>(id: ModuleSetting) {
    return game.settings.get(MODULE_ID, id) as T;
}

export function setSetting<T>(id: ModuleSetting, value: T) {
    return game.settings.set(MODULE_ID, id, value);
}

function registerModuleSetting<T>(
    id: ModuleSetting,
    settingsConfig: ClientSettings.PartialSettingConfig<T>
) {
    game.settings.register(MODULE_ID, id, {
        name: `${MODULE_ID}.settings.${id}.name`,
        hint: `${MODULE_ID}.settings.${id}.hint`,
        ...settingsConfig,
    });
}
