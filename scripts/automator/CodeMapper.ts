import { Project, SyntaxKind } from 'ts-morph';

/**
 * Vibe CodeMapper - AST Analysis Engine 🛠️🧬
 * Reads code not as text, but as a logical tree of classes, functions, and properties.
 */

export class CodeMapper {
    private project: Project;

    constructor() {
        this.project = new Project();
    }

    /**
     * Map a file to its logical AST components
     */
    public mapFile(filePath: string) {
        const sourceFile = this.project.addSourceFileAtPath(filePath);
        const map: any = {
            classes: [],
            functions: [],
            interfaces: [],
            variables: []
        };

        // Extract Classes and their methods
        sourceFile.getClasses().forEach(cls => {
            map.classes.push({
                name: cls.getName(),
                methods: cls.getMethods().map(m => m.getName()),
                properties: cls.getProperties().map(p => p.getName()),
                source: cls.getText() // The full code of the class
            });
        });

        // Extract Functions
        sourceFile.getFunctions().forEach(fn => {
            map.functions.push({
                name: fn.getName(),
                parameters: fn.getParameters().map(p => p.getName()),
                source: fn.getText()
            });
        });

        // Extract Interfaces
        sourceFile.getInterfaces().forEach(itf => {
            map.interfaces.push({
                name: itf.getName(),
                source: itf.getText()
            });
        });

        return map;
    }

    /**
     * Log the dependency graph (simplified)
     */
    public getDependencies(filePath: string) {
        const sourceFile = this.project.addSourceFileAtPath(filePath);
        return sourceFile.getImportDeclarations().map(imp => imp.getModuleSpecifierValue());
    }
}

// Example usage log:
// const mapper = new CodeMapper();
// const analysis = mapper.mapFile('src/engine/core/Physics.ts');
// console.log(JSON.stringify(analysis, null, 2));
