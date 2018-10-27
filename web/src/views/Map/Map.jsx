import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { withRouter } from 'react-router-dom';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import Leaflet from 'leaflet';

import Icon from 'components/Icon.jsx';
import Modal from 'components/Modal/Modal.jsx';

import dragZoom from './dragZoom.js';

import './Map.css';
import 'leaflet/dist/leaflet.css';

const $app = document.getElementById('app');

const opts = {
	startZoom: 16,
	zoomTreshold: 15,
	startLat: 59.436,
	startLng: 24.753,
	minZoom: 8,
	maxZoom: 18,
	accuracyTreshold: 512,
	panTimeout: 1500
};

@withRouter
@inject('storeCoords')
@observer
export default class Map extends Component {
	
	state = {
		message: '',
		showModal: false,
		isLocating: false
	}
	
	tileLayer = ''
	dispose = null
	markers = []
	
	modalHide = () => {
		this.setState({ showModal: false });
	}
	
	// Update start location.
	modalConfirm = () => {
		this.modalHide();
		
		const map = window.map;
		const center = map.getCenter();
		
		localStorage.setItem('start', JSON.stringify({
			lat: center.lat,
			lng: center.lng,
			zoom: map.getZoom()
		}));
		
	}
	
	// Start locating.
	locate = () => {
		
		const map = window.map;
		
		this.setState({ isLocating: true }, () => {
			map.flyTo([ this.props.storeCoords.lat, this.props.storeCoords.lng ], Math.max(opts.zoomTreshold, map.getZoom()));
		});
		
	}
	
	// Redraw stops and update message based on bounds.
	fetchStops = async () => {
		
		const map = window.map;
		const { _southWest: { lat: lat_min, lng: lng_min }, _northEast: { lat: lat_max, lng: lng_max } } = map.getBounds();
		
		// Remove markers depending on bounds and zoom.
		if (map.getZoom() < opts.zoomTreshold) { // Remove all markers.
			for (const marker of this.markers) marker.remove();
			return void (this.markers = []);
		} else { // Remove out of bounds markers.
			
			for (const i in this.markers) {
				const marker = this.markers[i];
				
				if (marker._latlng.lat > lat_min && marker._latlng.lat < lat_max && marker._latlng.lng > lng_min && marker._latlng.lng < lng_max) continue;
				
				marker.remove();
				this.markers.splice(i, 1);
				
			}
			
		}
		
		// Add needed new markers.
		fetch(`${process.env['REACT_APP_API']}/stops?lat_min=${lat_min}&lat_max=${lat_max}&lng_min=${lng_min}&lng_max=${lng_max}`).then(async (res) => {
			
			for (const stop of await res.json()) {
				
				if (this.markers.find((marker) => marker.options.id === stop.id)) continue;
				
				this.markers.push((new Leaflet.Marker([ stop.lat, stop.lng ], {
					id: stop.id,
					icon: new Leaflet.Icon({
						iconSize: [ 26, 26 ],
						iconAnchor: [ 13, 13 ],
						iconUrl: `data:image/svg+xml;base64,${btoa(renderToStaticMarkup(Icon({ shape: 'stop', type: stop.type })))}`
					})
				})).addTo(map).on('click', () => {
					this.props.history.push(`/stop?id=${stop.id}`);
				}));
				
			}
			
		});
		
		// Handle message cases.
		if (!(new Leaflet.LatLngBounds([ 57.57, 21.84 ], [ 59.7, 28 ])).contains(map.getCenter())) {
			this.setState({ message: 'Bussiaeg.ee ei toimi väljaspool Eestit' });
		} else if (map.getZoom() < opts.zoomTreshold) {
			this.setState({ message: 'Suumige sisse, et näha peatusi' });
		} else {
			if (this.state.message) this.setState({ message: '' });
		}
		
	}
	
	// Replace old tile layer with a new styled one.
	updateTileLayer = () => {
		if (this.tileLayer) this.tileLayer.remove();
		this.tileLayer = Leaflet.tileLayer(process.env['REACT_APP_MAP_' + $app.className.slice(6).toUpperCase()]).addTo(window.map);
	}
	
	componentDidMount() {
		
		const start = JSON.parse(localStorage.getItem('start') || '{}');
		
		const map = window.map = new Leaflet.Map('map', {
			center: [
				start.lat || opts.startLat,
				start.lng || opts.startLng
			],
			zoom: start.zoom || opts.startZoom,
			minZoom: opts.minZoom,
			maxZoom: opts.maxZoom,
			preferCanvas: true,
			zoomControl: false,
			bounceAtZoomLimits: false,
			attributionControl: false,
			boxZoom: false,
			keyboard: false
		});
		
		const $map = map._container;
		
		const marker = new Leaflet.Marker([ 0, 0 ], {
			interactive: false,
			icon: new Leaflet.Icon({
				iconSize: [ 20, 20 ],
				iconAnchor: [ 10, 10 ],
				iconUrl: `data:image/svg+xml;base64,${btoa(renderToStaticMarkup(
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
						<circle fill="#fff" cx="512" cy="512" r="512" />
						<circle fill="#00e6ad" cx="512" cy="512" r="350" />
					</svg>
				))}`
			}),
		}).addTo(map);
		
		const circle = new Leaflet.Circle([ 0, 0 ], {
			renderer: new Leaflet.Canvas({ padding: 1 }),
			interactive: false,
			fillColor: '#00e6ad',
			fillOpacity: .15,
			color: '#00e6ad',
			weight: 2
		}).addTo(map);
		
		// Add and update third-party tile layer from configuration when needed.
		this.updateTileLayer();
		(new MutationObserver(this.updateTileLayer)).observe($app, { attributes: true });
		
		// Redraw stops when available and on bounds change.
		this.fetchStops();
		map.on('moveend', this.fetchStops);
		
		// Open modal on right click (desktop) or hold (mobile).
		map.on('contextmenu', () => {
			this.setState({ showModal: true });
		});
		
		// Cancel locating on user interaction.
		$map.addEventListener('pointerdown', () => {
			if (this.state.isLocating) this.setState({ isLocating: false });
		}, { passive: true });
		
		// Update location marker and accuracy circle.
		
		const timestamp = new Date();
		
		this.dispose = reaction(() => ({
			lat: this.props.storeCoords.lat,
			lng: this.props.storeCoords.lng,
			accuracy: this.props.storeCoords.accuracy
		}), ({ lat, lng, accuracy }) => {
			
			// Overlay accuracy cases.
			if (accuracy < opts.accuracyTreshold) { // Show overlay on high accuracy.
				
				marker.setLatLng([ lat, lng ]);
				circle.setLatLng([ lat, lng ]);
				circle.setRadius(accuracy);
				
			} else { // Hide overlay on low accuracy.
				
				marker.setLatLng([ 0, 0 ]);
				circle.setLatLng([ 0, 0 ]);
				circle.setRadius(0);
				
			}
			
			// Pan map if GPS found on load within timeout.
			if (new Date() - timestamp < opts.panTimeout) map.panTo([ lat, lng ]);
			
			// Pan map if locating.
			if (accuracy < opts.accuracyTreshold && this.state.isLocating) map.flyTo([ lat, lng ]);
			
		}, { fireImmediately: true });
		
		// Register drag zoom handler (for mobile).
		dragZoom(map);
		
		// Setup attribution.
		
		const attribution = Leaflet.control.attribution({
			position: 'topright',
			prefix: ''
		});
		
		attribution.addAttribution('<a href="https://openstreetmap.org" target="_blank" rel="noreferrer">OpenStreetMap</a>');
		attribution.addAttribution('<a href="https://mapbox.com/about/maps" target="_blank" rel="noreferrer">Mapbox</a>');
		attribution.addAttribution('<a href="https://mapbox.com/feedback" target="_blank" rel="noreferrer">Improve this map</a>');
		
		map.addControl(attribution);
		
	}
	
	componentWillUnmount() {
		this.dispose();
	}
	
	render() {
		return (
			<div id="map-container" className="view">
				<div id="map"></div>
				<span id="map-message">{this.state.message}</span>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id="map-locate" className={(this.props.storeCoords.accuracy < 512 ? 'is-visible' : '') + (this.state.isLocating ? ' is-active' : '')} onMouseDown={this.locate}>
					<path fill="#00e6ad" d="M512 .1C246.2.1 172.6 219.7 172.6 344.7c0 274.6 270 679.3 339.4 679.3s339.4-404.6 339.4-679.3C851.4 219.6 777.8.1 512 .1zm0 471.1c-71.3 0-129-57.8-129-129s57.7-129.1 129-129.1 129 57.8 129 129-57.7 129.1-129 129.1z" />
				</svg>
				<Modal isVisible={this.state.showModal} title="Kinnita alguskoht" text="Asukoha mitteleidmisel kuvatav koht" onCancel={this.modalHide} onConfirm={this.modalConfirm} />
			</div>
		);
	}
	
};
