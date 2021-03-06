import * as ts from "typescript";
import { NodeParser, Context } from "../NodeParser";
import { SubNodeParser } from "../SubNodeParser";
import { BaseType } from "../Type/BaseType";
import { ObjectType, ObjectProperty } from "../Type/ObjectType";
import { symbolAtNode } from "../Utils/symbolAtNode";
import { assertDefined } from "../Utils/assert";

export class TypeLiteralNodeParser implements SubNodeParser {
    public constructor(
        private childNodeParser: NodeParser,
    ) {
    }

    public supportsNode(node: ts.TypeLiteralNode): boolean {
        return node.kind === ts.SyntaxKind.TypeLiteral;
    }
    public createType(node: ts.TypeLiteralNode, context: Context): BaseType {
        return new ObjectType(
            this.getTypeId(node, context),
            [],
            this.getProperties(node, context),
            this.getAdditionalProperties(node, context),
        );
    }

    private getProperties(node: ts.TypeLiteralNode, context: Context): ObjectProperty[] {
        return node.members
            .filter(ts.isPropertySignature)
            .reduce((result: ObjectProperty[], propertyNode) => {
                const propertyType = assertDefined(propertyNode.type);
                const propertySymbol = assertDefined(symbolAtNode(propertyNode));

                const objectProperty = new ObjectProperty(
                    propertySymbol.getName(),
                    this.childNodeParser.createType(propertyType, context),
                    !propertyNode.questionToken,
                );

                result.push(objectProperty);
                return result;
            }, []);
    }
    private getAdditionalProperties(node: ts.TypeLiteralNode, context: Context): BaseType | undefined {
        const indexSignature = node.members.find(ts.isIndexSignatureDeclaration);
        if (!indexSignature) {
            return undefined;
        }

        const indexType = assertDefined(indexSignature.type);
        return this.childNodeParser.createType(indexType, context);
    }

    private getTypeId(node: ts.Node, context: Context): string {
        const fullName = `structure-${node.getFullStart()}`;
        const argumentIds = context.getArguments().map((arg) => arg.getId());

        return argumentIds.length ? `${fullName}<${argumentIds.join(",")}>` : fullName;
    }
}
