const MODULE_ID = "auto-expire-5e";
const LANG_ID = MODULE_ID.toUpperCase();
const TEMPLATES_FOLDER = `modules/${MODULE_ID}/templates`;
const FLAG = {
  EXPIRATION_CONFIG: "expirationConfig",
  LEGACY_SPECIAL_DURATIONS: "specialDurations",
};

const SETTING = {
  EXPIRY_ACTION: "expiryAction",
};

const EXPIRY_ACTION = {
  DELETE: "delete",
  DISABLE: "disable",
  PROMPT: "prompt",
};

const EXPIRATION_TRIGGER = {
  TIME: "time",
};

const DEFAULT_EXPIRATION_TRIGGERS = [EXPIRATION_TRIGGER.TIME];

export {
  MODULE_ID,
  LANG_ID,
  TEMPLATES_FOLDER,
  FLAG,
  SETTING,
  EXPIRY_ACTION,
  EXPIRATION_TRIGGER,
  DEFAULT_EXPIRATION_TRIGGERS,
};
