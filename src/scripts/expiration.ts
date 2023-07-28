import { MODULE_ID } from "./constants.js";
import { ModuleSetting, getSetting } from "./settings.js";
import { recordToArray } from "./utils.js";

/*
 * Listener for an "worldTimeUpdate" hook.
 */
export function onWorldTimeUpdate(
    newWorldTime: number,
    timeDelta: number,
    options: any,
    userId: string
) {
    if (!isLocalUserFirstActiveGM()) return;
    const expiredEffects = findExpiredEffects();
    processExpiredEffects(expiredEffects);
}

/*
 * Listener for a "updateCombat" hook.
 */
export function onUpdateCombat(
    combat: Combat,
    updateData: any,
    options: any,
    userId: string
) {
    if (!isLocalUserFirstActiveGM()) return;
    const expiredEffects = findExpiredEffects(combat);
    processExpiredEffects(expiredEffects);
}

/*
 * Listener for a "deleteCombat" hook.
 */
export function onDeleteCombat(combat: Combat) {
    if (!isLocalUserFirstActiveGM()) return;
    const specialDurationEffects = Array.from(combat.combatants)
        .flatMap((x) => {
            const actor = x.actor;
            if (actor == null) return [];
            return actor.appliedEffects;
        })
        .filter((x) => hasSpecialDuration(x));
    processExpiredEffects(specialDurationEffects);
}

/**
 * Checks if the local user is the first active Game Master (GM).
 *
 * @returns {boolean} True if the local user is the first active GM, otherwise false.
 */
function isLocalUserFirstActiveGM(): boolean {
    if (game.user == null || game.users == null) return false;
    return game.user === game.users.activeGM;
}

/**
 * Checks if an ActiveEffect has any special durations defined.
 * Special durations are custom conditions that affect when an effect expires.
 *
 * @param {ActiveEffect} effect - The ActiveEffect to check for special durations.
 * @returns {boolean} Returns true if the effect has special durations, otherwise false.
 */
function hasSpecialDuration(effect: ActiveEffect): boolean {
    const flagData = effect.getFlag(MODULE_ID, "specialDurations");
    return flagData != null && Object.keys(flagData).length !== 0;
}

/**
 * Finds and returns an array of ActiveEffects that are expired.
 * An ActiveEffect is considered expired if it meets one of the following conditions:
 * 1. It has a special duration and the special duration condition is fulfilled in the given combat.
 * 2. It has a non-special duration, is temporary, and its remaining duration is less than or equal to 0.
 *
 * @param {Combat | null} [combat=null] - Optional. The Combat instance to check special durations against. If not provided, special durations will be ignored.
 * @returns {ActiveEffect[]} Returns an array of expired ActiveEffects.
 */
function findExpiredEffects(combat: Combat | null = null): ActiveEffect[] {
    return Array.from(game.scenes?.active?.tokens ?? [])
        .flatMap((x) => {
            const actor = x.actor;
            if (actor == null) return [];
            return actor.appliedEffects;
        })
        .filter((x) => isExpired(x, combat));
}

/**
 * Checks if a special duration condition for an ActiveEffect is fulfilled in the given Combat.
 *
 * @param {ActiveEffect} effect - The ActiveEffect with a special duration to check.
 * @param {Combat} combat - The Combat instance to check special durations against.
 * @returns {boolean} Returns true if the special duration condition is fulfilled, otherwise false.
 */
function isSpecialDurationFulfilled(
    effect: ActiveEffect,
    combat: Combat
): boolean {
    // Honestly, I do not know if an target actor (the actor who has the effect) always exist...
    const targetActor: Actor | undefined = effect.target;
    const targetCombatant =
        combat.getCombatantByActor(targetActor?.id ?? "") ?? null;

    // A source does not always exist. For example, effects applied using DFred's CE have no origin.
    const effectHasOrigin: boolean = effect.origin != null;
    let sourceCombatant: Combatant | null = null;
    if (effectHasOrigin) {
        const source = fromUuidSync(effect.origin) as Actor | Item | null;
        const sourceActor = source instanceof Actor ? source : source?.actor;
        sourceCombatant =
            combat.getCombatantByActor(sourceActor?.id ?? "") ?? null;
    }

    // Should make a utility function for this...
    const specialDurations = effect.getFlag(
        MODULE_ID,
        "specialDurations"
    ) as Record<number, string>;

    const currentCombatantId = combat.current.combatantId;
    const previousCombatantId = combat.previous.combatantId;

    // We return true of any of the special durations condition is fulfilled.
    for (const specialDuration of recordToArray(specialDurations)) {
        if (effectHasOrigin && sourceCombatant != null) {
            switch (specialDuration) {
                case "sourceTurnStart":
                    if (currentCombatantId === sourceCombatant.id) return true;
                    break;
                case "sourceTurnEnd":
                    if (previousCombatantId === sourceCombatant.id) return true;
                    break;
                default:
                    break;
            }
        }
        if (targetCombatant != null) {
            switch (specialDuration) {
                case "targetTurnStart":
                    if (currentCombatantId === targetCombatant.id) return true;
                    break;
                case "targetTurnEnd":
                    if (previousCombatantId === targetCombatant.id) return true;
                    break;
                default:
                    break;
            }
        }
    }

    return false;
}

/**
 * Checks if an ActiveEffect is expired.
 * An ActiveEffect is considered expired if it meets one of the following conditions:
 * 1. It has a special duration and the special duration condition is fulfilled in the given combat.
 * 2. It has a non-special duration, is temporary, and its remaining duration is less than or equal to 0.
 *
 * @param {ActiveEffect} effect - The ActiveEffect to check for expiration.
 * @param {Combat | null} [combat=null] - Optional. The Combat instance to check special durations against. If not provided, special durations will be ignored.
 * @returns {boolean} Returns true if the effect is expired, otherwise false.
 */
function isExpired(
    effect: ActiveEffect,
    combat: Combat | null = null
): boolean {
    if (hasSpecialDuration(effect)) {
        if (combat != null) {
            return isSpecialDurationFulfilled(effect, combat);
        }
        return false;
    } else {
        return (
            effect.isTemporary &&
            effect.duration.remaining != null &&
            effect.duration.remaining <= 0
        );
    }
}

/**
 * Processes an array of expired active effects and updates them to be disabled.
 *
 * @param {ActiveEffect[]} expiredEffects - An array of expired active effects to process.
 * @returns {Promise<void>} A Promise that resolves when all the effects have been disabled.
 */
async function processExpiredEffects(
    expiredEffects: ActiveEffect[]
): Promise<void> {
    let promises: Promise<ActiveEffect | undefined>[] = [];

    if (getSetting(ModuleSetting.ExpirationHandling) == "disable") {
        expiredEffects.forEach((x) =>
            promises.push(x.update({ disabled: true }))
        );
    } else if (getSetting(ModuleSetting.ExpirationHandling) == "delete") {
        expiredEffects.forEach((x) => promises.push(x.delete()));
    }

    await Promise.all(promises);
}
