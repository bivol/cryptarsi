let indexableList = [
    'text/plain'
];

export function isIndexable(type) {
    return indexableList.indexOf(type) >= 0 ? true : false;
}
