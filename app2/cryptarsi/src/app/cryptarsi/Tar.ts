// Implementation of tar archive
// Based partially on tar-js by Jameson Little

export class Tar {

    recordSize = 512;
    blockSize = this.recordSize * 20;

    buffer;

    constructor() {
        this.buffer = this.cleanBuffer(this.blockSize);
    }

    cleanBuffer(len) {
        let buffer = new Uint8Array(len);
        for (let i = len - 1; i >= 0; i--) {
            buffer[i] = 0;
        }
        return buffer;
    }



}
