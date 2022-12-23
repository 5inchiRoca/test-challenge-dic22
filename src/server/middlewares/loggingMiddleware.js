const { sequelize: { models: { logging } } } = require('../../app/db');

const loggingMiddleware = (db) =>
    (req, res, next) => {

        const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
        const headers = JSON.stringify(req.headers);
        const originalUrl = req.originalUrl;
        // Persist this info on DB

        const endpoints =['getPeople', 'getPlanet', 'getWeightOnPlanetRandom']

        let persist = false;

        endpoints.forEach(e => {
            if( req.originalUrl.includes(e) ){
                persist = true;
            }
        })

        if( persist ){
            logging.create({
                action: originalUrl,
                header: headers,
                ip,
            })
        }

        next();
    }

module.exports = loggingMiddleware;