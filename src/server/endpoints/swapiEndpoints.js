const { sequelize: { models: { swPeople, swPlanet } } } = require('../../app/db');

const applySwapiEndpoints = (server, app) => {

    server.get('/hfswapi/test', async (req, res) => {
        const data = await app.swapiFunctions.genericRequest('https://swapi.dev/api/', 'GET', null, true);
        res.send(data);
    });

    server.get('/hfswapi/getPeople/:id', async (req, res) => {

        const url = `https://swapi.dev/api/people/${req.params.id}`;
        const person = await swPeople.findByPk(req.params.id);

        if (person === null) {
            const data = await app.swapiFunctions.genericRequest(url, 'GET', null);
            if (data.detail === 'Not found') {
                return res.status(404).json({ message: 'No se encontró informacíon del personaje' })
            }
            const {
                name, mass, height, homeworld,
            } = data
            const { name: homeworld_name } = await app.swapiFunctions.genericRequest(homeworld, 'GET', null);
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

        const url = `https://swapi.dev/api/planets/${req.params.id}`;
        const planet = await swPlanet.findByPk(req.params.id);

        if (planet === null) {
            const data = await app.swapiFunctions.genericRequest(url, 'GET', null);
            if (data.detail === 'Not found') {
                return res.status(404).json({ message: 'No se encontró informacíon del planeta' })
            }
            const {
                name, gravity,
            } = data
            return res.json({
                name, gravity: gravity.split(' ')[0],
            });
        }

        const {
            name, gravity,
        } = planet;

        return res.json({
            name, gravity,
        });
    });

    server.get('/hfswapi/getWeightOnPlanetRandom', async (req, res) => {

        const ranPersonId = Math.floor(Math.random() * (82 - 1) + 1);
        const ranPlanetId = Math.floor(Math.random() * (60 - 1) + 1);

        const urlPeople = `https://swapi.dev/api/people/${ranPersonId}`;
        const urlPlanets = `https://swapi.dev/api/planets/${ranPlanetId}`;

        let mass = null;
        let homeworld_id = null;
        let gravity = null;
        let personName = null;
        let planetName = null;

        const person = await swPeople.findByPk(ranPersonId);

        if (person === null) {
            const data = await app.swapiFunctions.genericRequest(urlPeople, 'GET', null);
            if (data.detail === 'Not found') {
                return res.status(404).json({ message: 'No se encontró informacíon del personaje' })
            }
            mass = parseInt(data.mass.replace(/[^0-9]/g, ''), 10);
            personName = data.name;
            homeworld_id = parseInt(data.homeworld.replace(/[^0-9]/g, ''));
        } else {
            mass = person.mass;
            personName = person.name;
            homeworld_id = person.homeworld_id;
        }

        if (mass === 'unknown' || !mass) {
            return res.status(400).json({ message: `No se encontró información sobre la masa del personaje ${personName}` });
        }

        if (homeworld_id === ranPlanetId) {
            return res.status(400).json({ message: 'Personaje en su planeta natal' });
        }

        const planet = await swPlanet.findByPk(ranPlanetId);

        if (planet === null) {
            const data = await app.swapiFunctions.genericRequest(urlPlanets, 'GET', null);
            if (data.detail === 'Not found') {
                return res.status(404).json({ message: 'No se encontró informacíon del planeta' })
            }
            gravity = parseFloat(data.gravity.split(' ')[0]);
            planetName = data.name;
        } else {
            gravity = planet.gravity;
            planetName = planet.name;
        }

        if (gravity === 'unknown' || isNaN(gravity)) {
            return res.status(400).json({ message: `No se encontró información sobre la gravedad del planeta ${planetName}` });
        }

        return res.json({ weight: app.swapiFunctions.getWeightOnPlanet(mass, gravity) });
    });

    server.get('/hfswapi/getLogs', async (req, res) => {
        const data = await app.db.logging.findAll();
        res.send(data);
    });

}

module.exports = applySwapiEndpoints;