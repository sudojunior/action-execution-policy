export class ValidationSet {
    constructor(label) {
        this.label = label;
    }

    /** @type {Record<string, { value: string, origin: string }} */
    #enum = {};

    add(keys, value) {
        for (const key of keys)
            this.#enum[key] = value;
    }

    has(key) {
        return key in this.#enum;
    }

    assert(key, message = "policy (%1) is not found within %0 for %2") {
        const vars = [this.constructor.name, key, this.label];
        console.assert(this.has(key), message.replaceAll(/%(\d+)/g, (_, match) => vars[+match]));
    }

    /**
     * 
     * @param {*} key 
     * @param {boolean} rawObject 
     * @returns 
     */
    get(key) {
        if (!this.has(key)) return null;
        return this.#enum[key];
    }

    /**
     * * PascalCase (provided/input)
     * * lowercase
     * * UPPERCASE
     * * snake_case
     * * camelCase
     * * kebab-case
     * 
     * @param input {string[]}
     */
    static create(label, input) {
        const valSet = new ValidationSet(label);

        for (const item of input)
            valSet.add(ValidationSet.#process(item), item);

        return valSet;
    }

    static #process(item) {
        const result = [];

        for (const method in ValidationSet.caseTypes) {
            if (method.at(0) === "_") continue;
            result.push(ValidationSet.caseTypes[method](item));
        }

        return result;
    }

    /** 
     * This is intended to make validation easier when writing workflows, while still ensuring runtime integrity.
     * @type {Record<string, (this:typeof this.caseTypes, str: string) => string> & { _regex: RegExp }}
     */
    static caseTypes = {
        // regex is considered the simple solution for me
        // iterating each string and finding where uppercase codepoints are positioned, and then splitting the string based on that is also a secondary option
        _regex: /([A-Z][a-z]+)/g,
        /* pascal(input) {
            const matches = [...input.matchAll(this._regex)];
            return matches.map(m => this._title(m)).join("");
        }, */
        pascal(input) { return input; }, // as-is, no change
        lower(input) { return input.toLowerCase(); },
        upper(input) { return input.toUpperCase(); },
        _title(input) { return this.upper(input.at(0)) + this.lower(input.slice(1, input.length)) },
        snake(input) {
           const matches = [...input.match(this._regex)];
           return matches.map(m => this.lower(m)).join("_")
        },
        titleSnake(input) { return this.snake(input).split("_").map(this._title).join("_"); },
        upperSnake(input) { return this.upper(this.snake(input)); },
        camel(input) {
            const matches = [...input.match(this._regex)];
            return matches.map((m, i) => i === 0 ? this.lower(m) : this._title(m)).join("");
        },
        kebab(input) {
            const matches = [...input.match(this._regex)];
            return matches.map(this.lower).join("-");
        },
        upperKebab(input) { return this.upper(this.kebab(input)); }
    }
}

export const EXECUTION_POLICY = ValidationSet.create("-ExecutionPolicy", [
    "Unrestricted",
    "RemoteSigned",
    "AllSigned",
    "Restricted",
    "Default",
    "Bypass",
    "Undefined"
]);

export const SCOPE = ValidationSet.create("-Scope", [
    "Process",
    "CurrentUser",
    "LocalMachine",
    "UserPolicy",
    "MachinePolicy"
]);