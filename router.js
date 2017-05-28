module.exports = (app, s, l, wss) => {
	
	app.get('/getstops', (req, res) => {
		res.json(s.getStops(req.query.lat_min, req.query.lat_max, req.query.lng_min, req.query.lng_max));
	});
	
	app.get('/getstop', (req, res) => {
		
		var stop = s.getStop(req.query.id);
		
		if (stop == null) return res.status(404).end();
		
		res.json(stop);
		
	});
	
	app.get('/gettrips', (req, res) => {
		
		var id = req.query.id;
		
		wss.clients.forEach((ws) => {
			ws.send(JSON.stringify(s.getStop(id)));
		});
		
		l.getSiri(id, (siri) => {
			
			if (siri !== null) {
				
				var trips = s.getTrips(id, true);
				
				trips = trips.concat(siri);
				
				trips = trips.sort((a, b) => {
					return a.sort - b.sort;
				});
				
				res.json(trips.splice(0, 15));
				
			} else {
				
				l.getElron(id, (elron) => {
					
					if (elron !== null) {
						
						res.json(elron);
						
					} else {
						
						var trips = s.getTrips(id, false);
						
						if (trips !== null) {
							
							res.json(trips);
							
						} else {
							
							res.status(503).end();
							
						}
						
					}
					
				});
				
			}
			
		});
		
	});
	
	app.get('/version', (req, res) => {
		res.send(JSON.parse(require('fs').readFileSync('package.json').toString()).version);
	});
	
}