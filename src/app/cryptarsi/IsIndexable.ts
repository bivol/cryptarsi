import { WordHash } from './Hash';

let indexableList = {
    'text/plain': WordHash.cbPerHash,
    'text/xml': WordHash.cbPerHash,
    'text/html': WordHash.cbPerHash,
    'application/pdf': WordHash.cbPerHash,
    'application/msword': WordHash.cbPerHash,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': WordHash.cbPerHash
};

export function isIndexable(type) {
    return indexableList[type] ? true : false;
};

export function getHashList(file, content) {
    if (!isIndexable(file.type)) {
        return [];
    }

    // The follwing code is made for text/plain only
    let hashMap = {};
    indexableList[file.type](content, (hash) => {
      hashMap[hash] = 1;
    });
    return Object.keys(hashMap);
};
