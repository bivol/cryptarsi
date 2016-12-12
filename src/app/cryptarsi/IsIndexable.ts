let indexableList = [
    'text/plain',
    'text/xml',
    'text/html'
];

export function isIndexable(type) {
    return indexableList.indexOf(type) >= 0 ? true : false;
}
