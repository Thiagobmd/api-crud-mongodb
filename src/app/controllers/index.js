const fs = require('fs');
const path = require('path');

module.exports = app => {
    
    //le todos controllers da pasta e add automaticamente no index.js raiz
    fs
        .readdirSync(__dirname)
        .filter(file => ((file.indexOf('.')) !== 0 && (file !== "index.js")))
        .forEach(file => require(path.resolve(__dirname, file))(app));
}