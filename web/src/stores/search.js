import { decorate, observable, action, reaction } from 'mobx';

import { opts as mapOpts } from 'views/Map/Map.jsx';
import storeCoords from 'stores/coords.js';

class StoreSearch {
	
	query = ''
	type = 'stops'
	results = {
		stops: [],
		routes: []
	}
	
	dispose = null
	isLoading = true
	hasErrored = false
	
	// Start fetching nearby search results on location update.
	startScanning() {
		this.dispose = reaction(() => ({
			lat: storeCoords.lat,
			lng: storeCoords.lng
		}), () => {
			this.fetchResults();
		}, { fireImmediately: true });
	}
	
	// Stop fetching nearby search results on location update.
	stopScanning() {
		this.dispose();
	}
	
	// Update search query.
	updateQuery(query) {
		this.query = query;
	}
	
	// Update search type.
	updateType(type) {
		this.type = type;
	}
	
	// Fetch search results.
	async fetchResults(isManual) {
		const [ query, lat, lng ] = [ this.query, storeCoords.lat, storeCoords.lng ];
		
		// Clear results if no query or coords.
		if (!query && lat === mapOpts.startLat) {
			this.results = { stops: [], routes: [] };
			this.isLoading = false;
			return;
		}
		
		if (isManual) this.isLoading = true;
		try {
			this.results = await (await fetch(`${process.env['REACT_APP_API']}/search?${query ? `&query=${query}` : ''}&lat=${lat}&lng=${lng}`)).json();
			this.isLoading = false;
			this.hasErrored = false;
		} catch {
			if (!isManual && this.results.stops.length) return;
			
			this.isLoading = false;
			this.hasErrored = true;
		}
	}
	
}

decorate(StoreSearch, {
	query: observable,
	type: observable,
	results: observable.struct,
	isLoading: observable,
	hasErrored: observable,
	updateQuery: action,
	updateType: action,
	fetchResults: action.bound
});

export default new StoreSearch();
