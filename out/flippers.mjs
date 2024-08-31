class StatsTracker {
    stats = {};
    get_total() {
        let t = 0;
        Object.keys(this.stats).forEach(k => {
            t += this.stats[k].count;
        });
        return t;
    }
    track_stat(key) {
        this.stats[key] = { count: 0, percentage: 0 };
    }
    increment(k) {
        if (!Object.keys(this.stats).includes(k)) {
            this.track_stat(k);
        }
        ;
        this.stats[k].count += 1;
        const total = this.get_total();
        Object.keys(this.stats).forEach(key => {
            this.stats[key].percentage = this.stats[key].count / total;
        });
    }
    get data() {
        return this.stats;
    }
}
export function is_flip_result(arg) {
    return arg && typeof arg.label === "string";
}
export function is_flip_sequence_result(arg) {
    return arg && Array.isArray(arg.sequence);
}
export class Flipper {
    _weights;
    _labels;
    constructor(weights, labels) {
        if (weights.reduce((s, v) => s + v) !== 1.0)
            throw new Error("Weights must sum to 1.0");
        if (weights.length !== labels.length)
            throw new Error("Weights and labels must have same length");
        this._weights = weights;
        this._labels = labels;
    }
    get weights() {
        return this._weights;
    }
    get labels() {
        return this._labels;
    }
    flip_sequence(seq_length) {
        const sequence = [];
        const stats = new StatsTracker();
        for (let i = 0; i < seq_length; i++) {
            const r = this.flip();
            sequence.push(r);
            stats.increment(r.label);
        }
        return {
            sequence,
            stats
        };
    }
}
export class Coin extends Flipper {
    constructor(weights) {
        super(weights, ["H", "T"]);
    }
    flip() {
        const r = Math.random();
        let s = 0;
        for (const [i, w] of this._weights.entries()) {
            s += w;
            if (r <= s) {
                return { weight_index: i, label: this._labels[i] };
            }
        }
        return { weight_index: this._weights[this._weights.length - 1], label: this._labels[this._weights.length - 1] };
    }
}
export class FairCoin extends Coin {
    constructor() {
        super([0.5, 0.5]);
    }
}
export class AlwaysHeadsCoin extends Coin {
    constructor() {
        super([1.0, 0.0]);
    }
}
export class AlwaysTailsCoin extends Coin {
    constructor() {
        super([0.0, 1.0]);
    }
}
export class FlipperContainer {
    _flippers;
    constructor() {
        this._flippers = [];
    }
    get flippers() {
        return this._flippers;
    }
    push(flipper) {
        this._flippers.push(flipper);
    }
    pop() {
        this._flippers.pop();
    }
    clear() {
        this._flippers = [];
    }
    flip_all(num_flips = 1) {
        const res = [];
        this._flippers.forEach(flipper => {
            res.push(flipper.flip_sequence(num_flips));
        });
        return res;
    }
    choose_random() {
        const r = Math.random();
        const increment = 1.0 / this._flippers.length;
        let s = 0;
        for (const flipper of this._flippers) {
            s += increment;
            if (r <= s) {
                return flipper;
            }
        }
        return this._flippers[this._flippers.length - 1];
    }
    /**
     * choose a random coin from the container and flip it n times
     */
    flip_random(num_flips = 1, with_replacement = false) {
        if (this._flippers.length === 0)
            return null;
        if (num_flips === 1) {
            const flipper = this.choose_random();
            return flipper.flip();
        }
        if (with_replacement) {
            const res = { sequence: [], stats: new StatsTracker() };
            for (let i = 0; i < num_flips; i++) {
                const flipper = this.choose_random();
                const r = flipper.flip();
                res.sequence.push(r);
                res.stats.increment(r.label);
            }
            return res;
        }
        else {
            const flipper = this.choose_random();
            return flipper.flip_sequence(num_flips);
        }
    }
    summarize() {
        const num_flippers = this._flippers.length;
        const weight_buckets = {};
        this._flippers.forEach(flipper => {
            const flipper_bucket_key = `[${flipper.weights.map(v => v.toPrecision(2))}]`;
            if (!Object.keys(weight_buckets).includes(flipper_bucket_key)) {
                weight_buckets[flipper_bucket_key] = 1;
            }
            else
                weight_buckets[flipper_bucket_key] += 1;
        });
        return { num_flippers, weight_buckets };
    }
}
