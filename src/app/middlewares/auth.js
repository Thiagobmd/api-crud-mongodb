const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    //caso o token não existir
    if(!authHeader)
        return res.status(401).send({ error: 'No Token provided' });

    const parts = authHeader.split(' ');

    //caso o token não tiver duas partes (Bearer + Hash)
    if(!parts.length === 2)
        return res.status(401).send({ error: 'Token error' });

        const [ scheme, token ] = parts;

     //caso a primeira parte não for a palavra Bearer
     if(!/^Bearer$/i.test(scheme)) 
        return res.status(401).send({ error: 'Token malformatted' });  

    //verifica se o token é o mesmo do auth.json
    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if(err) return res.status(401).send({ error: 'Token invalid' });

        req.userId = decoded.id;

        return next();

    });

};