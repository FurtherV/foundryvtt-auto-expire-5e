/**
 * Main Module File
 */

import { getSetting, registerModuleSettings } from "./settings.mjs";
import { registerModuleApi } from "./api.mjs";
import { SETTING } from "./constants.mjs";

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

/**
 * #TODO
 * @param {Actor[]} actors
 * @private
 */
const _debouncedProcessActors = foundry.utils.debounce(
  (actors) => _processActors(actors),
  250,
);

Hooks.on("combatTurnChange", (combat, prior, current) => {
  console.debug("combatTurnChange", [combat, prior, current]);

  // Only the GM shall handle expiration
  if (!game.users.activeGM.isSelf) return;

  if (!combat.active) return;

  /** @type {Combatant[]} */
  const combatants = combat.combatants.contents;

  /** @type {Actor[]} */
  const actors = combatants.map((x) => x.actor).filter((x) => x != null);

  _debouncedProcessActors(actors);
});

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

  _debouncedProcessActors(uniqueActors);
});
