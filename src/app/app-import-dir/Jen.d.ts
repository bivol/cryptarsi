/// <amd-module name="Jen" path="node-jen/Jen.js"/>

export declare module Jen {

    var _serverSide: boolean;

    interface JenFailsafe {
        getRandomValues(buffer?: Uint8Array): Uint8Array;
    }

    export class Jen {
        mode: string;
        dump: Uint8Array;
        version: string;
        hardened: boolean;
        _time: Date;

        constructor(hardened?: boolean);
        engine(): string;
        fill(): void;
        randomBytes(size: number): Uint8Array;
        random(size: number): number;
        randomBetween(min: number, max: number): number;
        hardening(bool: boolean): void;
        password(min: number, max: number, regex: RegExp): string;
        stats(min: number, max: number, regex: RegExp): Date;
    }

}

//export default Jen;
