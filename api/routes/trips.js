const got = require('got');

const db = require('../db.js');

// Get trips.
async function getTrips(req, res) {
	
	const id = req.query['id'];
	
	try {
		
		const trips = await db.query(`
			SELECT TIME_TO_SEC(time) AS time, route.name, terminus, wheelchair, route.type, route.region FROM stops AS stop
				JOIN stop_times ON stop_id = id
				JOIN trips AS trip ON trip.id = trip_id
				JOIN routes AS route ON route.id = route_id
			WHERE
				stop.id = ?
				AND time BETWEEN CURTIME() AND ADDTIME(CURTIME(), '01:00:00')
				AND service_id IN (
					SELECT service_id FROM services
					WHERE
						CURDATE() BETWEEN start AND end
						AND SUBSTR(days, WEEKDAY(CURDATE()) + 1, 1) = '1'
						AND service_id NOT IN (
							SELECT service_id FROM service_Exceptions WHERE type = 0 AND date = CURDATE()
						)
					UNION
						SELECT service_id FROM service_exceptions WHERE type = 1 AND date = CURDATE()
				)
			ORDER BY time
		`, [ id ]);
		
		const data = (await got(`https://transport.tallinn.ee/siri-stop-departures.php?stopid=${id}`)).body;
		
		console.log(data);
		
		
		
		res.send(trips);
		
	} catch (ex) {
		res.code(500).send(ex);
	}
	
}

module.exports = (fastify, opts, next) => {
	fastify.get('/trips', getTrips);
	next();
};
