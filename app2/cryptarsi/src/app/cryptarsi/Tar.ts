// Implementation of tar archive
// Based partially on tar-js by Jameson Little

export class Tar {

    recordSize = 512;
    blockSize = this.recordSize * 20;

    buffer;

    headerFormat = [
        {
            'field': 'fileName',
            'length': 100
        },
        {
            'field': 'fileMode',
            'length': 8
        },
        {
            'field': 'uid',
            'length': 8
        },
        {
            'field': 'gid',
            'length': 8
        },
        {
            'field': 'fileSize',
            'length': 12
        },
        {
            'field': 'mtime',
            'length': 12
        },
        {
            'field': 'checksum',
            'length': 8
        },
        {
            'field': 'type',
            'length': 1
        },
        {
            'field': 'linkName',
            'length': 100
        },
        {
            'field': 'ustar',
            'length': 8
        },
        {
            'field': 'owner',
            'length': 32
        },
        {
            'field': 'group',
            'length': 32
        },
        {
            'field': 'majorNumber',
            'length': 8
        },
        {
            'field': 'minorNumber',
            'length': 8
        },
        {
            'field': 'filenamePrefix',
            'length': 155
        },
        {
            'field': 'padding',
            'length': 12
        }
    ];

    writen = 0;

    constructor() {
        this.buffer = this.cleanBuffer(this.blockSize);
    }

    private cleanBuffer(len) {
        let buffer = new Uint8Array(len);
        for (let i = len - 1; i >= 0; i--) {
            buffer[i] = 0;
        }
        return buffer;
    }

    private extendBuffer(orig, length: number, addLength: number, multipleOf: number) {
        let newSize = length + addLength,
            buffer = this.cleanBuffer((parseInt((newSize / multipleOf).toString()) + 1) * multipleOf);
        buffer.set(orig);
        return buffer;
}
    private pad(num, bytes, base = 8) {
        num = num.toString(base);
        return '000000000000'.substr(num.length + 12 - bytes) + num;
    }

    private format(data, cb?) {
        let buffer = this.cleanBuffer(512),
            offset = 0;

        this.headerFormat.forEach(function (value) {
            let str = data[value.field] || '',
                i, length;

            for (i = 0, length = str.length; i < length; i += 1) {
                buffer[offset] = str.charCodeAt(i);
                offset += 1;
            }

            offset += value.length - i; // space it out with nulls
        });

        if (typeof cb === 'function') {
            return cb(buffer, offset);
        }
        return buffer;
    };

    addFile(name, content,
        mode = 511,
        mtime = Math.floor(+new Date() / 1000),
        uid = 0,
        gid = 0,
        owner = '',
        group = ''
    ) {
        let data = {
            fileName: name,
            fileMode: this.pad(mode, 7),
            uid: this.pad(uid, 7),
            gid: this.pad(gid, 7),
            fileSize: this.pad(content.length, 11),
            mtime: this.pad(mtime, 11),
            checksum: '        ',
            type: '0', // just a file
            ustar: 'ustar  ',
            owner: owner || '',
            group: group || ''
        };
        let checksum = 0;

        Object.keys(data).forEach((key) => {
            let value = data[key];
            let length = value.length;
            for (let i = length - 1; i >= 0; i --) {
                checksum += value.charCodeAt(i);
            }
        });

        data.checksum = this.pad(checksum, 6) + '\u0000';
        let headerArr = this.format(data);
        this.buffer.set(headerArr, this.writen);
        this.writen += headerArr.length;

        if (this.writen + content.length > this.buffer.length) {
            // Extend the buffer
            this.buffer = this.extendBuffer(this.buffer, this.writen, this.recordSize * 2, this.blockSize);
        }

        this.buffer.set(content, this.writen);
        this.writen += content.length + (this.recordSize - (content.length % this.recordSize || this.recordSize));

        // Always add 2 extra records, for compatibility with GNU Tar
        if (this.buffer.length - this.writen < this.recordSize * 2) {
            this.buffer = this.extendBuffer(this.buffer, this.writen, this.recordSize * 2, this.blockSize);
        }

        return this.buffer;
    }

    clear() {
        this.writen = 0;
        this.buffer = this.cleanBuffer(this.blockSize);
    }

    readTar(buffer) {
        // TODO: implement reading a tar file
    }
}
