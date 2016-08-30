/**
 * Created by delian on 8/19/16.
 */

export class Storage {
    constructor() {

    }

    clear() {
        localStorage.clear();
    }

    loadFromURI(uri) {
        this.clear();

    }
}
