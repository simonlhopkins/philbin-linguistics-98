export class SetHelpers {
    // Union of two sets
    static union<T>(a: Set<T>, b: Set<T>): Set<T> {
        return new Set([...a, ...b]);
    }

    // Difference of two sets (a - b)
    static difference<T>(a: Set<T>, b: Set<T>): Set<T> {
        return new Set([...a].filter(x => !b.has(x)));
    }

    // Intersection of two sets
    static intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
        return new Set([...a].filter(x => b.has(x)));
    }

    // Symmetric difference (elements in either a or b, but not both)
    static symmetricDifference<T>(a: Set<T>, b: Set<T>): Set<T> {
        return new Set([...a].filter(x => !b.has(x)).concat([...b].filter(x => !a.has(x))));
    }

    // Check if set a is a subset of set b
    static isSubset<T>(a: Set<T>, b: Set<T>): boolean {
        for (const x of a) {
            if (!b.has(x)) return false;
        }
        return true;
    }

    // Check if set a is a superset of set b
    static isSuperset<T>(a: Set<T>, b: Set<T>): boolean {
        for (const x of b) {
            if (!a.has(x)) return false;
        }
        return true;
    }

    // Check if two sets are equal
    static equals<T>(a: Set<T>, b: Set<T>): boolean {
        return a.size === b.size && SetHelpers.isSubset(a, b);
    }
}
