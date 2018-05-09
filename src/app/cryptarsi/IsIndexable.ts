import { WordHash } from './Hash';

let indexableList = {
    'text/plain': {
      binary: false,
      cb: WordHash.cbPerHash
    },
    'text/xml': {
      binary: false,
      cb: WordHash.cbPerHash
    },
    'text/html': {
      binary: false,
      cb: WordHash.cbPerHash
    },
    'application/pdf': {
      binary: true,
      cb: WordHash.cbPerHash
    },
    'application/msword': {
      binary: true,
      cb: WordHash.cbPerHash
    },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      binary: false,
      cb: WordHash.cbPerHash
    }
};

export function isBinary(type) {
  if (indexableList[type]) {
    return indexableList[type].binary;
  }
  return true;
}

export function isIndexable(type) {
    return indexableList[type] ? true : false;
};

export function getHashList(file, content): Promise<any[]> {
  return new Promise((resolve, reject) => {
    if (!isIndexable(file.type)) {
      return resolve([]);
    }

    // The follwing code is made for text/plain only
    let hashMap = {};
    indexableList[file.type].cb(content, (hash) => {
      hashMap[hash] = 1;
    })
    .then(() => resolve(Object.keys(hashMap)))
    .catch(reject);
  });
};
