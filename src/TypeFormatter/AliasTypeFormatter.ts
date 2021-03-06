import { TypeFormatter } from "../TypeFormatter";
import { SubTypeFormatter } from "../SubTypeFormatter";
import { AliasType } from "../Type/AliasType";
import { BaseType } from "../Type/BaseType";
import { Definition } from "../Schema/Definition";

export class AliasTypeFormatter implements SubTypeFormatter {
    public constructor(
        private childTypeFormatter: TypeFormatter,
    ) {
    }

    public supportsType(type: AliasType): boolean {
        return type instanceof AliasType;
    }
    public getDefinition(type: AliasType): Definition {
        return this.childTypeFormatter.getDefinition(type.getType());
    }
    public getChildren(type: AliasType): BaseType[] {
        return this.childTypeFormatter.getChildren(type.getType());
    }
}
