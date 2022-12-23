const { sequelize: { models: { swPeople } } } = require('../../app/db');

const applySwapiEndpoints = (server, app) => {

    server.get('/hfswapi/test', async (req, res) => {
        const data = await app.swapiFunctions.genericRequest('https://swapi.dev/api/', 'GET', null, true);
        res.send(data);
    });

    server.get('/hfswapi/getPeople/:id', async (req, res) => {

        const url = `https://swapi.dev/api/people/${req.params.id}`;
        const person = await swPeople.findByPk(req.params.id);

        if (person === null) {
            const {
                name, mass, height, homeworld,
            } = await app.swapiFunctions.genericRequest(url, 'GET', null);

            const {  name: homeworld_name } = await app.swapiFunctions.genericRequest(homeworld, 'GET', null);
            return res.json({
                name, mass, height, homeworld_name, homeworld_id: homeworld.replace(/[^0-9]/g, ''),
            });
        }

        const {
            name, mass, height, homeworld_name, homeworld_id,
        } = person;

        return res.json({
            name, mass, height, homeworld_name, homeworld_id,
        });
    });

    server.get('/hfswapi/getPlanet/:id', async (req, res) => {
        res.sendStatus(501);
    });

    server.get('/hfswapi/getWeightOnPlanetRandom', async (req, res) => {
        res.sendStatus(501);
    });

    server.get('/hfswapi/getLogs',async (req, res) => {
        const data = await app.db.logging.findAll();
        res.send(data);
    });

}

module.exports = applySwapiEndpoints;