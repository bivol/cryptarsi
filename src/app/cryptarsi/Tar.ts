// Implementation of tar archive
// Based partially on tar-js by Jameson Little but extended with support for reading as well

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

    static extendBuffer(orig, length: number, addLength: number, multipleOf: number) {
        let newSize = length + addLength,
            buffer = TarTools.cleanBuffer((parseInt((newSize / multipleOf).toString()) + 1) * multipleOf);

        /*console.log('Extend Buffer org:', orig.length,
            'to:', (parseInt((newSize / multipleOf).toString()) + 1) * multipleOf,
            'result:', buffer.length,
            'length', length,
            'addLength', addLength
        );
        */
        buffer.set(orig);
        return buffer;
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
        this.buffer = TarTools.cleanBuffer(this.blockSize);
    }

    private pad(num, bytes, base = 8) {
        num = num.toString(base);
        return '000000000000'.substr(num.length + 12 - bytes) + num;
    }

    private format(data, cb?) {
        let buffer = TarTools.cleanBuffer(512),
            offset = 0;

        this.headerFormat.forEach((value) => {
            let str = data[value.field] || '';
            TarTools.stringToUint8(str, buffer, offset);
            offset += value.length; // space it out with nulls
        });

        if (typeof cb === 'function') {
            return cb(buffer, offset);
        }
        return buffer;
    };

    addToBuffer(data) {
        if (this.writen + data.length > this.buffer.length) {
            // Extend the buffer
            this.buffer = TarTools.extendBuffer(this.buffer,
                this.writen,
                data.length,
                this.blockSize
            );
        }
        //console.log('Tar buf.len', this.buffer.length, 'cont.len', data.length, 'pos', this.writen);
        this.buffer.set(data, this.writen);
        this.writen += data.length;
        /*
        let roundToRecord = this.recordSize - (data.length % this.recordSize || this.recordSize);
        this.writen += (data.length + roundToRecord);
        console.log('rounding', name, 'data length', data.length,
           'recordSize', this.recordSize,
           'lefover', (data.length % this.recordSize),
           'how much we add', roundToRecord,
           'where we are after adding', this.writen);
        */
    }

    roundToRecord() {
        let roundToRecord = this.recordSize - (this.writen % this.recordSize || this.recordSize);
        this.writen += roundToRecord;
    }

    closeTarInBuffer() {
        // Always add 2 extra records, for compatibility with GNU Tar
        if (this.buffer.length - this.writen < this.recordSize * 2) {
            this.buffer = TarTools.extendBuffer(this.buffer, this.writen, this.recordSize * 2, this.blockSize);
        }
    }

    addHeader(name, length, mode = 511, mtime = Math.floor(+new Date() / 1000), uid = 0, gid = 0, owner = '', group = '') {
        if (name.length > 99) {
            console.error('Error: name length larger than 99 charactgers!', name);
        }

        let header: IHeaderField = {
            fileName: name,
            fileMode: this.pad(mode, 7),
            uid: this.pad(uid, 7),
            gid: this.pad(gid, 7),
            fileSize: this.pad(length, 11),
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

        //console.log('Header', header, header.fileSize, data.length);
        let headerArr = this.format(header);
        //console.log('HeaderArr', headerArr, headerArr.length);
        this.addToBuffer(headerArr);
        //this.buffer.set(headerArr, this.writen);
        //this.writen += headerArr.length;
    }

    addFile(name, content,
        mode = 511,
        mtime = Math.floor(+new Date() / 1000),
        uid = 0,
        gid = 0,
        owner = '',
        group = ''
    ) {
        let data = content;
        if (typeof data === 'string') {
            data = TarTools.stringToUint8(content);
        }
        this.addHeader(name, data.length, mode, mtime, uid, gid, owner, group);
        this.addToBuffer(data);
        this.roundToRecord(); // Every file must round to a block
        this.closeTarInBuffer();
        return this.buffer;
    }

    resetBuffer() { // Retrieve a buffer with the current content and reset it to zero
        let buffer = this.buffer.slice(0, this.writen);
        this.clear();
        return buffer;
    }

    closingBuffer() {
        return TarTools.cleanBuffer(this.recordSize * 2);
    }

    clear() {
        this.writen = 0;
        this.buffer = TarTools.cleanBuffer(this.blockSize);
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
    }): Promise<any> {
        return new Promise((resolve, reject) => {
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
            //console.log('I have data in buffer', buffer, buffer.length);
            let pos = 0;

            let procTarChunk = () => {
                if (pos >= buffer.length - 512) {
                    return resolve();
                }
                let data = this.readHeader(buffer, pos);
                if (buffer[pos] === 0
                    && data.fileName === ''
                    && data.fileSize === ''
                ) {
                    //console.log('Trimming block is reached. Reading is complete!');
                    return resolve();
                }
                //console.log('Return data', data);
                pos += 512;
                let content = '';
                let len = parseInt(data.fileSize, 8);
                if (isNaN(len)) {
                    console.error('Wrong length');
                    return reject(new Error('Wrong length'));
                }
                let roundToRecord = this.recordSize - (len % this.recordSize || this.recordSize);
                //console.log('data.fileSize', len, roundToRecord, len + roundToRecord);
                for (let i = 0; i < len; i++) {
                    content += String.fromCharCode(buffer[pos + i]);
                //  console.log('pos', i, pos, pos + i, String.fromCharCode(buffer[pos + i]));
                }
                //console.log('Return content', content.length/*, content*/);
                pos += len + roundToRecord;
                //console.log('new pos is', pos, buffer.length);
                cb(data, content, pos, buffer.length).then(() => {
                    procTarChunk();
                }).catch((e) => {
                    //console.log('Something is wrong', e);
                    reject(e);
                });
            };

            procTarChunk();

            //console.log('reading is completed');
        });
    }
}
