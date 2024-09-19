/**
 * Main Module File
 */

import { getSetting, registerModuleSettings } from "./settings.mjs";
import { registerModuleApi } from "./api.mjs";
import {
  EXPIRATION_TRIGGER,
  LANG_ID,
  MODULE_ID,
  SETTING,
  TEMPLATES_FOLDER,
} from "./constants.mjs";
import { ExpirationConfigModel } from "./data/expiration-config-model.mjs";

const { DialogV2 } = foundry.applications.api;

Hooks.once("init", () => {
  registerModuleSettings();
  registerModuleApi();
});

/**
 * Processes an expired active effect by handling it according to the configured action.
 * @param {ActiveEffect} effect The expired active effect
 * @returns {Promise<void>}
 * @private
 */
async function _processExpiredEffect(effect) {
  // Do nothing if effect is null or parent is null
  if (effect?.parent == null) return;

  const expiryAction = getSetting(SETTING.EXPIRY_ACTION);
  switch (expiryAction) {
    case "delete": {
      await effect.delete();
      break;
    }
    case "disable": {
      await effect.update({
        disabled: true,
      });
      break;
    }
    case "prompt": {
      const effectAnchorHTML = effect.toAnchor().outerHTML;
      const parentAnchorHTML = effect.parent.toAnchor().outerHTML;
      const shouldDelete = await DialogV2.confirm({
        window: {
          title: `Expired Effect: ${effect.name}`,
        },
        content: `<p>Should the expired effect ${effectAnchorHTML} on ${parentAnchorHTML} be deleted?</p>`,
        modal: false,
        rejectClose: false,
      });
      if (shouldDelete) {
        await effect?.delete();
      }
      break;
    }
    default: {
      ui.notifications.error(`${expiryAction} is not valid.`);
      break;
    }
  }

  return;
}

/**
 * #TODO
 * @param {Actor[]} actors
 * @private
 */
function _processActors(actors) {
  for (const actor of actors) {
    const effects = actor.effects.contents;
    for (const effect of effects) {
      if (!effect.isTemporary) return;
      if (effect.duration?.remaining == null) return;
      if (effect.duration.remaining > 0) return;

      // Effect is temporary and expired...
      _processExpiredEffect(effect);
    }
  }
}

Hooks.on("updateWorldTime", (newTime, delta, options, userId) => {
  console.debug("updateWorldTime", [newTime, delta, options, userId]);

  // Only the GM shall handle expiration
  if (!game.users.activeGM.isSelf) return;

  if (delta == 0) return;

  const activeScene = game.scenes.active;

  /** @type {TokenDocument[]} */
  const tokenDocuments = activeScene.tokens.contents;

  /** @type {Actor[]} */
  const uniqueActors = tokenDocuments
    .filter((x, index) => {
      if (x?.actor == null) return false;

      if (!x.actorLink) return true;
      return (
        tokenDocuments.findIndex((y) => y.actor.uuid === x.actor.uuid) === index
      );
    })
    .map((x) => x.actor);

  _processActors(uniqueActors);
});

Hooks.on("renderActiveEffectConfig", async (app, [html], data) => {
  console.debug([app, html, data]);

  // Inject HTML extension into active effect config sheet
  /** @type {ActiveEffect} */
  const effect = data.effect;

  const durationTabSection = html.querySelector("section[data-tab='duration']");

  const model = ExpirationConfigModel.fromEffect(effect);

  const renderData = {};
  renderData.moduleTitle = game.modules.get(MODULE_ID).title;

  const extensionHTML = await renderTemplate(
    `${TEMPLATES_FOLDER}/duration-tab-extension.hbs`,
    renderData,
  );

  durationTabSection.insertAdjacentHTML("beforeend", extensionHTML);

  app.setPosition({ height: "auto" });
});
