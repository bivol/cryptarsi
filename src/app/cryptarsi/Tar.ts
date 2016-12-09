// Implementation of tar archive
// Based partially on tar-js by Jameson Little

interface IHeaderField {
    fileName?;
    fileMode?;
    uid?;
    gid?;
    fileSize?;
    mtime?;
    checksum?;
    type?;
    linkName?;
    ustar?;
    owner?;
    group?;
    majorNumber?;
    minorNumber?;
    filenamePrefix?;
    padding?;
};

export class TarTools {
    static cleanBuffer(len) {
        let buffer = new Uint8Array(len);
        for (let i = len - 1; i >= 0; i--) {
            buffer[i] = 0;
        }
        return buffer;
    }
    static stringToUint8(input, out?, offset = 0) {
        out = out || TarTools.cleanBuffer(input.length);
        let o = offset + input.length - 1;
        for (let i = input.length - 1 ; i >= 0; i--) {
            out[o--] = input.charCodeAt(i);
        }
        return out;
    }
}

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

        console.log('Extend Buffer org:', orig.length,
            'to:', (parseInt((newSize / multipleOf).toString()) + 1) * multipleOf,
            'result:', buffer.length,
            'length', length,
            'addLength', addLength
        );

        buffer.set(orig);
        return buffer;
    }

    private pad(num, bytes, base = 8) {
        num = num.toString(base);
        return '000000000000'.substr(num.length + 12 - bytes) + num;
    }

    private stringToUint8(input, out?, offset = 0) {
        out = out || this.cleanBuffer(input.length);
        let o = offset + input.length - 1;
        for (let i = input.length - 1 ; i >= 0; i--) {
            out[o--] = input.charCodeAt(i);
        }
        return out;
    }

    private format(data, cb?) {
        let buffer = this.cleanBuffer(512),
            offset = 0;

        this.headerFormat.forEach((value) => {
            let str = data[value.field] || '';
            this.stringToUint8(str, buffer, offset);
            offset += value.length; // space it out with nulls
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
        if (name.length > 99) {
            console.error('Error: name length larger than 99 charactgers!', name);
        }
        let data = content;
        if (typeof data === 'string') {
            data = this.stringToUint8(content);
        }

        let header: IHeaderField = {
            fileName: name,
            fileMode: this.pad(mode, 7),
            uid: this.pad(uid, 7),
            gid: this.pad(gid, 7),
            fileSize: this.pad(data.length, 11),
            mtime: this.pad(mtime, 11),
            checksum: '        ',
            type: '0', // just a file
            ustar: 'ustar  ',
            owner: owner || '',
            group: group || ''
        };

        let checksum = 0;

        Object.keys(header).forEach((key) => {
            let value = header[key];
            for (let i = value.length - 1; i >= 0; i --) {
                checksum += value.charCodeAt(i);
            }
        });

        header.checksum = this.pad(checksum, 6) + '\u0000';

 //       console.log('Header', header, header.fileSize, data.length);
        let headerArr = this.format(header);
        //console.log('HeaderArr', headerArr, headerArr.length);
        this.buffer.set(headerArr, this.writen);
        this.writen += headerArr.length;

        if (this.writen + data.length > this.buffer.length) {
            // Extend the buffer
            this.buffer = this.extendBuffer(this.buffer,
                this.writen,
                data.length,
                this.blockSize
            );
        }

        console.log('Tar buf.len', this.buffer.length, 'cont.len', data.length, 'pos', this.writen);
        this.buffer.set(data, this.writen);
        // TODO: probably the line bellow is having a bug and sometimes adding two extra blocks
        // this.written += input.length + (recordSize - (input.length % recordSize || recordSize));
        let roundToRecord = this.recordSize - (data.length % this.recordSize || this.recordSize);
        this.writen += (data.length + roundToRecord);
        console.log('rounding', name, 'data length', data.length,
           'recordSize', this.recordSize,
           'lefover', (data.length % this.recordSize),
           'how much we add', roundToRecord,
           'where we are after adding', this.writen);

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

    private readHeader(buffer, pos): IHeaderField {
        let data: IHeaderField = {};

        this.headerFormat.forEach(function (value) {
            let str = '';
            for (let i = 0; i < value.length; i++) {
                if (buffer[pos + i] == 0) {
                    break;
                }
                str += String.fromCharCode(buffer[pos + i]);
            }
            data[value.field] = str;
            pos += value.length;
        });

        return data;
    };

    readTar(iBuffer, cb = (header, content, pos, total) => {
        return new Promise((resolve, reject) => {
            return resolve();
        });
    }) {
        let buffer;
        if (iBuffer instanceof Uint8Array) {
            buffer = Uint8Array;
        } else {
            buffer = new Uint8Array(iBuffer.length);
            for (let i = iBuffer.length - 1; i >= 0; i--) {
                buffer[i] = iBuffer.charCodeAt(i);
            }
        }

        // One file has 512 bytes of header + variable length data
        console.log('I have data in buffer', buffer, buffer.length);
        let pos = 0;
        while (pos < buffer.length - 512) {
            console.log('POS', pos, buffer.length);
            let data = this.readHeader(buffer, pos);
            if (buffer[pos] === 0
                && data.fileName === ''
                && data.fileSize === ''
            ) {
                console.log('Trimming block is reached. Reading is complete!');
                break;
            }
            console.log('Return data', data);
            pos += 512;
            let content = '';
            let len = parseInt(data.fileSize, 8);
            if (isNaN(len)) {
                console.error('Wrong length');
                break;
            }
            let roundToRecord = this.recordSize - (len % this.recordSize || this.recordSize);
            console.log('data.fileSize', len, roundToRecord, len + roundToRecord);
            for (let i = 0; i < len; i++) {
                content += String.fromCharCode(buffer[pos + i]);
              //  console.log('pos', i, pos, pos + i, String.fromCharCode(buffer[pos + i]));
            }
            console.log('Return content', content.length/*, content*/);
            pos += len + roundToRecord;
            console.log('new pos is', pos, buffer.length);
            cb(data, content, pos, buffer.length).then(() => {}).catch((e) => {
                console.log('Error');
            });
        }
        console.log('reading is completed');
    }
}
