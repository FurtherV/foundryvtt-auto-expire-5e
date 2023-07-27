class Actor extends ClientDocumentMixin(foundry.documents.BaseActor) {
    appliedEffects: ActiveEffect[];
}

class Users {
    activeGM: User | null;
}

class SettingConfig {
    requiresReload?: boolean;
}

declare function fromUuidSync(
    uuid: string
): foundry.abstract.Document<any, any> | null;
