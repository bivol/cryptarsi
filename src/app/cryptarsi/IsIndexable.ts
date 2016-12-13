import { WordHash } from './Hash';

let indexableList = [
    'text/plain',
    'text/xml',
    'text/html'
];

export function isIndexable(type) {
    return indexableList.indexOf(type) >= 0 ? true : false;
}

export function getHashList(file, content) {
    if (!isIndexable(file.type)) {
        return [];
    }

    // The follwing code is made for text/plain only
    let hashMap = {};
    WordHash.cbPerHash(content, (hash) => {
        hashMap[hash] = 1;
    });
    return Object.keys(hashMap);
}
