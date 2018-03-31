import React, { Component } from 'react';
import { renderToString } from 'react-dom/server';
import { withRouter } from 'react-router-dom';

import IconStop from '../components/IconStop';

const googleMaps = window.google.maps;

@withRouter
export default class Map extends Component {
	
	map = null
	markers = []
	
	update = this.update.bind(this)
	
	update() {
		
		const { map, markers } = this;
		
		if (map.getZoom() < 16) {
			
			for (const marker of markers) marker.setMap(null);
			
			return void (this.markers = []);
			
		}
		
		const bounds = map.getBounds();
		
		for (const i in markers) {
			const marker = markers[i];
			
			if (bounds.f.b < marker.position.lat() < bounds.f.f) continue;
			if (bounds.b.f > marker.position.lng() > bounds.b.b) continue;
			
			marker.setMap(null);
			this.markers.splice(i, 1);
			
		}
		
		nextstop:
		for (const stop of window.stops) {
			
			if (stop.lat > bounds.f.f || stop.lat < bounds.f.b) continue;
			if (stop.lng > bounds.b.f || stop.lng < bounds.b.b) continue;
			
			for (const marker of markers) if (marker.id === stop.id) continue nextstop;
			
			const marker = new googleMaps.Marker({
				id: stop.id,
				position: { lat: stop.lat, lng: stop.lng },
				optimized: true,
				icon: {
					url: `data:image/svg+xml;base64,${btoa(renderToString(IconStop({ type: stop.type, map: true })))}`
				},
				map
			});
			
			marker.addListener('click', () => {
				this.props.history.push(`/stop?id=${stop.id}`);
			});
			
			this.markers.push(marker);
			
		}
		
	}
	
	componentDidMount() {
		
		const map = new googleMaps.Map(this.refs.map, {
			center: {
				lat: 59.388,
				lng: 24.685
			},
			zoom: 16,
			minZoom: 7,
			maxZoom: 18,
			disableDefaultUI: true,
			styles: [
				{
					featureType: 'transit.station',
					elementType: 'all',
					stylers: [
						{
							visibility: 'off'
						}
					]
				}
			]
		});
		
		map.addListener('bounds_changed', this.update);
		this.map = map;
		
	}
	
	render() {
		return <div id="map" ref="map"></div>;
	}
	
}
