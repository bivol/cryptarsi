(function (global) {
// systemjs loading map
var map = {
'app': 'app', // 'dist',
'rxjs': 'node_modules/rxjs',
'angular2-in-memory-web-api': 'node_modules/angular2-in-memory-web-a\
pi',
'@angular': 'node_modules/@angular'
};
// systemjs packages to load
var packages = {
'app': { main: 'boot.js', defaultExtension: 'js' },
'rxjs': { defaultExtension: 'js' },
'angular2-in-memory-web-api': { defaultExtension: 'js' },
};
//angular packages
var packageNames = [
'@angular/common',
'@angular/compiler',
'@angular/core',
'@angular/http',
'@angular/platform-browser',
'@angular/platform-browser-dynamic',
'@angular/router',
'@angular/router-deprecated',
'@angular/testing',
'@angular/upgrade',
];
// map angular packages
packageNames.forEach(function (pkgName) {
packages[pkgName] = { main: 'index.js', defaultExtension: 'js' };
});
var config = {
map: map,
packages: packages
}
if (global.filterSystemConfig) { global.filterSystemConfig(config); }
System.config(config);
})(this);
