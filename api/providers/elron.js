const got = require('got');

const cache = require('../utils/cache.js');
const time = require('../utils/time.js');

// Get trips for stop.
async function getTrips(id) {
	
	const now = time.getSeconds();
	const data = JSON.parse((await got(`http://elron.ee/api/v1/stop?stop=${encodeURIComponent(id)}`)).body).data;
	
	if (!data) throw new Error("Provider 'Elron' is not returning data");
	if (data.text) throw new Error(data.text);
	
	const trips = [];
	
	for (const trip of data) if (time.toSeconds(trip.plaaniline_aeg) > now) trips.push({
		time: time.toSeconds(trip.plaaniline_aeg),
		countdown: time.toSeconds(trip.plaaniline_aeg) - now,
		name: trip.reis,
		destination: trip.liin,
		type: 'train',
		live: false,
		provider: 'elron'
	});
	
	return trips.slice(0, 15);
	
}

module.exports = {
	getTrips
};
