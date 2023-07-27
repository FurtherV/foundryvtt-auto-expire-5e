import { MODULE_ID, SPECIAL_DURATIONS, TEMPLATE_FOLDER } from "./constants.js";
import { arrayToRecord, recordToArray } from "./utils.js";

export async function onRenderActiveEffectConfig(
    app: Application,
    html: JQuery,
    options: any
) {
    const additionalHTML = await renderTemplate(
        `${TEMPLATE_FOLDER}/active-effect-config-extension.hbs`,
        {
            moduleId: MODULE_ID,
            specialDurationOptions: SPECIAL_DURATIONS.reduce((acc: any, x) => {
                acc[x] = game.i18n.localize(
                    `${MODULE_ID}.specialDurations.${x}`
                );
                return acc;
            }, {}),
            effect: options.effect as ActiveEffect,
        }
    );

    // Extend duration tab
    html.find(`section.tab[data-tab="duration"]`).append(additionalHTML);

    // Add listeners
    html.find(".special-duration-control").on("click", async function (event) {
        await onClick(event, app, options.effect);
    });

    app.setPosition({ height: "auto" });
}

async function onClick(
    event: JQuery.ClickEvent,
    app: Application,
    effect: ActiveEffect
) {
    if (event.target == null || effect == null) return;

    const target = $(event.target);
    const control = target.closest(".special-duration-control");
    const action = control.data("action");

    const flagData = getSpecialDurations(effect);

    if (action == "add") {
        // Add a special duration

        const flagDataArray = recordToArray(flagData);
        flagDataArray.push(SPECIAL_DURATIONS[0]);
        await setSpecialDurations(effect, arrayToRecord(flagDataArray));
    } else if (action == "delete") {
        // Remove a special duration

        const index = control.data("index") as number | undefined;
        if (index == null) return;
        const flagDataArray = recordToArray(flagData);
        flagDataArray.splice(index, 1);
        await setSpecialDurations(effect, arrayToRecord(flagDataArray));
    } else {
        return;
    }

    event.preventDefault();
}

function getSpecialDurations(effect: ActiveEffect): Record<number, string> {
    return (effect.getFlag(MODULE_ID, "specialDurations") || {}) as Record<
        number,
        string
    >;
}

async function setSpecialDurations(
    effect: ActiveEffect,
    specialDurations: Record<number, string>
) {
    // Remove flag first (due to setFlag being an update operation with no options)
    const updateObject: any = {};
    updateObject[`flags.${MODULE_ID}.-=specialDurations`] = null;
    await effect.update(updateObject, { render: false, noHook: true });

    return effect.setFlag(MODULE_ID, "specialDurations", specialDurations);
}
