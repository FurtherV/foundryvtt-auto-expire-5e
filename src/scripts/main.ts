/**
 * @file Initial script executed by FoundryVTT on world load.
 * The source code in this file is transpiled from TypeScript to JavaScript.
 */

import { onRenderActiveEffectConfig } from "./active-effect-config.js";
import { MODULE_ID } from "./constants.js";
import {
    onDeleteCombat,
    onUpdateCombat,
    onWorldTimeUpdate as onUpdateWorldTime,
} from "./expiration.js";
import { registerSettings } from "./settings.js";

function onInit() {
    registerSettings();
}

// Register hooks
Hooks.once("init", onInit);

Hooks.on("updateWorldTime", onUpdateWorldTime);
Hooks.on("updateCombat", onUpdateCombat);
Hooks.on("deleteCombat", onDeleteCombat);
Hooks.on("renderActiveEffectConfig", onRenderActiveEffectConfig);

Hooks.on("hotReload", () => console.log(`${MODULE_ID} | Hot Reload`));
