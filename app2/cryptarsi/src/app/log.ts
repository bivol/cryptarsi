//export function log {
//
//}

export function log(...argv) {
    console.log.apply(this, argv);
}
