var asset = function (id) {
    if (window.lucifyAssetManifest != null
        && window.lucifyAssetManifest[id] != null) {
        return window.lucifyAssetManifest[id];
    }
    return id;
};

var getAssetPath = function () {
    if (window.lucifyAssetPath != null) {
        return window.lucifyAssetPath;
    }
    return '';
};

var getPrefix = function () {
    return '/' + getAssetPath();
};

var img = function (id) {
    return getPrefix() + 'images/' + asset(id);
};

var data = function (id) {
    return getPrefix() + 'data/' + asset(id);
};


module.exports.img = img;
module.exports.data = data;
