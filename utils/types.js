import { argType, splitArgs } from "@onflow/flow-cadut";
import { resolveType } from "@onflow/flow-cadut/src/args";
import { isComplexType } from "@onflow/flow-cadut/src/type-checker";

export const validateArgTypes = (args) => {
    const schema = args.map(argType);
    try {
        for (let type of schema) {
            resolveType(type);
        }
    } catch (err) {
        return false;
    }
    return true;
};

const startsWith = (value, prefix) => {
    return (
        value && (value.startsWith(prefix) || value.startsWith("U" + prefix))
    );
};

const mapToSchema = (type) => {
    switch (true) {
        // Strings
        // Address
        // Words
        // Maps
        // Arrays
        // Paths
        case type.startsWith("String") ||
            type.startsWith("Address") ||
            type.startsWith("Word") ||
            isComplexType(type): {
            return { type: "string" };
        }

        // Integers
        case startsWith(type, "Int"): {
            return {
                type: "integer",
                minimum: type.startsWith("U") ? 0 : undefined,
            };
        }

        // Fixed Point
        case startsWith(type, "Fix"): {
            return {
                type: "number",
                minimum: type.startsWith("U") ? 0 : undefined,
            };
        }

        // Booleans
        case type.startsWith("Bool"): {
            return {
                type: "boolean",
            };
        }

        default: {
            throw new Error(`Unsupported type: ${type}`);
        }
    }
};

export const generateSchema = (args) => {
    return {
        type: "object",
        properties: args.reduce((obj, item) => {
            const split = splitArgs(item);
            return {
                ...obj,
                [split[0]]: mapToSchema(split[1]),
            };
        }, {}),
    };
};

export const isJSON = (value) => {
    try {
        JSON.parse(value);
        return true;
    } catch (e) {
        return false;
    }
};

const checkJSON = (value, type) => {
    if (isJSON(value)) {
        return null;
    } else {
        return `Not a valid argument of type ${type}`;
    }
};

export const getOrderedArgValues = (args, finalArgs) => {
    const argValues = [];
    for (let arg of args.map((a) => splitArgs(a)[0])) {
        let value = finalArgs[arg];
        if (isJSON(value)) {
            argValues.push(JSON.parse(value));
        } else {
            argValues.push(value);
        }
    }
    return argValues;
};

export const validateByType = (value, type) => {
    if (!type) {
        return null;
    }
    switch (true) {
        // Strings
        case type.startsWith("String"): {
            return null; // no need to validate String for now
        }

        // Integers
        case startsWith(type, "Int"): {
            if (isNaN(value) || value === "") {
                return "Should be a valid Integer number";
            }
            return null;
        }

        // Words
        case startsWith(type, "Word"): {
            if (isNaN(value) || value === "") {
                return "Should be a valid Word number";
            }
            return null;
        }

        // Fixed Point
        case startsWith(type, "Fix"): {
            if (isNaN(value) || value === "") {
                return "Should be a valid fixed point number";
            }
            return null;
        }

        case isComplexType(type): {
            // This case it to catch complex arguments like Dictionaries
            return checkJSON(value, type);
        }

        // Address
        case type.startsWith("Address"): {
            if (!value.match(/(^0x[\w\d]{16})|(^0x[\w\d]{1,4})/)) {
                return "Not a valid Address";
            }
            return null;
        }

        // Booleans
        case type.startsWith("Bool"): {
            if (value !== "true" && value !== "false") {
                return "Boolean values can be either true or false";
            }
            return null;
        }

        default: {
            return null;
        }
    }
};
