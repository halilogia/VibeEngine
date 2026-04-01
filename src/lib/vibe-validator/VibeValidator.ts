/**
 * VibeValidator - Ultra-lightweight schema validation engine
 * Provides basic type checking and structure validation for engine data.
 * Zero external dependencies (No Zod, No Yup).
 */

export type SchemaValue = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface SchemaDefinition {
    [key: string]: SchemaValue | SchemaDefinition;
}

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: string[];
}

export class VibeValidator {
    /**
     * Light-speed structure validation
     */
    public static validate<T>(data: any, schema: SchemaDefinition): ValidationResult<T> {
        const errors: string[] = [];

        Object.entries(schema).forEach(([key, expectedType]) => {
            const actualValue = data[key];

            if (actualValue === undefined || actualValue === null) {
                errors.push(`Missing field: ${key}`);
                return;
            }

            const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;

            if (typeof expectedType === 'string') {
                if (actualType !== expectedType) {
                    errors.push(`Type mismatch on "${key}": Expected ${expectedType}, got ${actualType}`);
                }
            } else {
                // Nested object validation
                if (actualType !== 'object') {
                    errors.push(`Expected object for "${key}", got ${actualType}`);
                } else {
                    const nestedResult = this.validate(actualValue, expectedType);
                    if (!nestedResult.success) {
                        nestedResult.errors?.forEach((e) => errors.push(`${key}.${e}`));
                    }
                }
            }
        });

        return {
            success: errors.length === 0,
            data: errors.length === 0 ? (data as T) : undefined,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    /**
     * Simplified parse (throws if invalid)
     */
    public static parse<T>(data: any, schema: SchemaDefinition): T {
        const result = this.validate<T>(data, schema);
        if (!result.success) {
            throw new Error(`❌ [VibeValidator] Schema violation: ${result.errors?.join(', ')}`);
        }
        return result.data!;
    }
}
