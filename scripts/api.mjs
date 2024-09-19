import { EXPIRATION_TRIGGER, MODULE_ID } from "./constants.mjs";
import { ExpirationConfigModel } from "./data/expiration-config-model.mjs";
import { camelize } from "./utils.mjs";

/**
 * #TODO
 */
export function registerModuleApi() {
  const moduleObj = game.modules.get(MODULE_ID);
  const api = {
    abstract: {
      EXPIRATION_TRIGGER,
      DataModels: {
        ExpirationConfigModel,
      },
    },
  };
  moduleObj.api = api;
  globalThis[camelize(MODULE_ID.replaceAll("-", " "))] = api;
}
