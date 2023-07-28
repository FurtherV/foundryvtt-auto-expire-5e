class Actor extends ClientDocumentMixin(foundry.documents.BaseActor) {
    appliedEffects: ActiveEffect[];
}

interface Users {
    activeGM: User | null;
}

interface SettingConfig {
    requiresReload?: boolean;
}

interface ActiveEffect
    extends ClientDocumentMixin(foundry.documents.BaseActiveEffect) {
    origin?: string;
    target?: Actor;
}

function fromUuidSync(
    uuid: string | null | undefined
): foundry.abstract.Document<any, any> | null;
