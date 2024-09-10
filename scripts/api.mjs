import { MODULE_ID } from "./constants.mjs";
import { ExpirationConfigModel } from "./data/expiration-config-model.mjs";

/**
 * #TODO
 */
export function registerModuleApi() {
  const moduleObj = game.modules.get(MODULE_ID);
  const api = {
    abstract: {
      DataModels: {
        ExpirationConfigModel,
      },
    },
  };
  moduleObj.api = api;
  globalThis[MODULE_ID.replaceAll("-", " ").toCamelCase()] = api;
}
