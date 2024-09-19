import {
  DEFAULT_EXPIRATION_TRIGGERS,
  EXPIRATION_TRIGGER,
  FLAG,
  LANG_ID,
  MODULE_ID,
} from "../constants.mjs";

export class ExpirationConfigModel extends foundry.abstract.DataModel {
  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;

    const triggerFields = {};
    for (const trigger of Object.values(EXPIRATION_TRIGGER)) {
      triggerFields[trigger] = new fields.BooleanField({
        label: `${LANG_ID}.expirationTrigger.${trigger}`,
        required: false,
        initial: DEFAULT_EXPIRATION_TRIGGERS.includes(trigger),
      });
    }

    return {
      triggers: new fields.SchemaField(triggerFields),
    };
  }

  /** @inheritdoc */
  static fromEffect(effect) {
    const flagData = effect.getFlag(MODULE_ID, FLAG.EXPIRATION_CONFIG) ?? {};
    return new ExpirationConfigModel(flagData, {
      parent: effect,
      strict: true,
    });
  }

  /** @type {ActiveEffect} */
  get effect() {
    return this.parent;
  }

  /**
   * #TODO
   * @param {string} trigger
   * @returns {boolean}
   */
  hasTrigger(trigger) {
    return this.triggers[trigger] === true;
  }

  /**
   * #TODO
   * @param {object} changes New values which should be applied to the data model
   * @param {object} [options={}] Options which determine how the new data is merged
   * @returns {object} An object containing the changed keys and values
   */
  async update(changes = {}, options = {}) {
    if (this.effect == null) {
      logger.error(
        `${this.constructor.name}#${this.update.name} requires the data model to have a parent.`,
      );
      return {};
    }

    const diff = this.updateSource(changes, options);

    await this.effect.setFlag(
      MODULE_ID,
      FLAG.EXPIRATION_CONFIG,
      this.toObject(),
    );

    return diff;
  }

  /**
   * #TODO
   * @returns {Promise<void>}
   */
  async delete() {
    if (this.effect == null) {
      logger.error(
        `${this.constructor.name}#${this.delete.name} requires the data model to have a parent.`,
      );
      return;
    }
    await this.effect.unsetFlag(MODULE_ID, FLAG.EXPIRATION_CONFIG);
  }
}
