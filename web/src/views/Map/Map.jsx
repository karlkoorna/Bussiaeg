import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { withRouter } from 'react-router-dom';
import { reaction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
import Leaflet from 'leaflet';
import KDBush from 'kdbush';

import Icon from 'components/Icon.jsx';
import Modal from 'components/Modal/Modal.jsx';
import Fab from 'components/Fab/Fab.jsx';
import { colors as viewColors } from 'components/NavBar/NavBar.jsx';

import storeSettings from 'stores/settings.js';
import { withTheme } from 'utils.js';
import dragZoom from './dragZoom.js';

import './Map.css';
import 'leaflet/dist/leaflet.css';

export const opts = {
	startZoom: 15,
	stopZoom: 15,
	startLat: 59.436,
	startLng: 24.753,
	minZoom: 8,
	maxZoom: 18,
	accuracyTreshold: 512,
	panTimeout: 1500
};

const markers = {
	bus: btoa(renderToStaticMarkup(Icon({ shape: 'stop', type: 'bus' }))),
	trol: btoa(renderToStaticMarkup(Icon({ shape: 'stop', type: 'trol' }))),
	tram: btoa(renderToStaticMarkup(Icon({ shape: 'stop', type: 'tram' }))),
	train: btoa(renderToStaticMarkup(Icon({ shape: 'stop', type: 'train' }))),
	'coach-c': btoa(renderToStaticMarkup(Icon({ shape: 'stop', type: 'coach-c' }))),
	'coach-cc': btoa(renderToStaticMarkup(Icon({ shape: 'stop', type: 'coach-cc' }))),
	location: btoa(renderToStaticMarkup((
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
			<circle fill="#fff" cx="512" cy="512" r="512" />
			<circle fill="#00e6ad" cx="512" cy="512" r="350" />
		</svg>
	)))
};

class ViewMap extends Component {
	
	state = {
		message: '',
		showModal: false,
		isLocating: false
	}
	
	dispose = null
	debounce = 0
	tileLayer = null
	
	stops = []
	spatial = []
	markers = {} // new Leaflet.LayerGroup()
	
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
	
	// Start locating at zoom where stops are visible.
	startLocating = () => {
		const map = window.map;
		
		this.setState({ isLocating: true }, () => {
			map.setView([ this.props.storeCoords.lat, this.props.storeCoords.lng ], Math.max(opts.stopZoom, map.getZoom()));
		});
	}
	
	// Stop locating.
	stopLocating = () => {
		if (this.state.isLocating) this.setState({ isLocating: false });
	}
	
	// Update message based on bounds and redraw stops.
	fetchStops = () => {
		const map = window.map;
		const { t } = this.props;
		const { _southWest: { lat: latMin, lng: lngMin }, _northEast: { lat: latMax, lng: lngMax } } = map.getBounds();
		const zoom = map.getZoom();
		
		// Handle message cases.
		if (!(new Leaflet.LatLngBounds([ 57.57, 21.84 ], [ 59.7, 28 ])).contains(map.getCenter())) this.setState({ message: t('map.zoom') });
		else if (zoom < opts.stopZoom) this.setState({ message: t('map.bounds') });
		else if (this.state.message) this.setState({ message: '' });
		
		// Remove all markers if zoomed below threshold.
		if (zoom < opts.stopZoom) {
			for (const marker of Object.values(this.markers)) marker.remove();
			return void (this.markers = {});
		}
		
		// Remove out of bounds markers.
		for (const id in this.markers) {
			const marker = this.markers[id];
			
			if (marker._latlng.lat > latMin && marker._latlng.lat < latMax && marker._latlng.lng > lngMin && marker._latlng.lng < lngMax) continue;
			
			marker.remove();
			delete this.markers[id];
		}
		
		// Add new stop markers.
		for (const stop of this.spatial.range(latMin, lngMin, latMax, lngMax).map((id) => this.stops[id])) if (!this.markers.hasOwnProperty(stop.id)) this.markers[stop.id] = (new Leaflet.Marker([ stop.lat, stop.lng ], {
			id: stop.id,
			icon: new Leaflet.Icon({
				iconSize: [ 26, 26 ],
				iconAnchor: [ 13, 13 ],
				iconUrl: 'data:image/svg+xml;base64,' + markers[stop.type]
			})
		})).addTo(map).on('click', () => {
			this.props.history.push(`/stop?id=${stop.id}`);
		});
	}
	
	// Update map tile layer.
	onThemeChange = () => {
		if (this.tileLayer) this.tileLayer.remove();
		this.tileLayer = Leaflet.tileLayer(process.env['REACT_APP_MAP_' + storeSettings.data.theme.toUpperCase()]).addTo(window.map);
	}
	
	async componentDidMount() {
		const start = JSON.parse(localStorage.getItem('start') || '{}');
		window.test = this.markers;
		const map = window.map = new Leaflet.Map('map', {
			center: [
				start.lat || opts.startLat,
				start.lng || opts.startLng
			],
			zoom: start.zoom || opts.startZoom,
			minZoom: opts.minZoom,
			maxZoom: opts.maxZoom,
			zoomControl: false,
			bounceAtZoomLimits: false,
			attributionControl: false,
			boxZoom: false,
			keyboard: false,
			zoomSnap: 0.1,
			zoomDelta: .1
		});
		
		const $map = map._container;
		
		this.stops = await (await fetch(`${process.env['REACT_APP_API']}/stops`)).json();
		this.spatial = new KDBush(this.stops, (stop) => stop.lat, (stop) => stop.lng, 64, Float32Array);
		
		const marker = new Leaflet.Marker([ 0, 0 ], {
			interactive: false,
			icon: new Leaflet.Icon({
				iconSize: [ 20, 20 ],
				iconAnchor: [ 10, 10 ],
				iconUrl: 'data:image/svg+xml;base64,' + markers['location']
			})
		}).addTo(map);
		
		const circle = new Leaflet.Circle([ 0, 0 ], {
			interactive: false,
			renderer: new Leaflet.SVG({ padding: 1 }),
			fillColor: '#00e6ad',
			fillOpacity: .15,
			color: '#00e6ad',
			weight: 2
		}).addTo(map);
		
		// Load tile layer.
		this.onThemeChange();
		
		// (Re)draw stops.
		map.whenReady(() => {
			map.on('zoomend', this.fetchStops);
			map.on('moveend', this.fetchStops);
			map.on('move', () => {
				this.debounce++;
				if (this.debounce < 3) return;
				this.debounce = 0;
				this.fetchStops();
			});
		});
		
		// Open modal on right click (desktop) or hold (mobile).
		map.on('mousedown contextmenu', (e) => {
			if (e.type !== 'contextmenu' && e.originalEvent.button !== 2) return;
			
			map.dragging.disable();
			map.dragging.enable();
			this.setState({ showModal: true });
		});
		
		// Register drag zoom handler (mobile).
		dragZoom(map);
		
		// Cancel locating on user interaction.
		$map.addEventListener('mousedown', this.stopLocating, { passive: true });
		$map.addEventListener('touchstart', this.stopLocating, { passive: true });
		
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
				circle.setRadius(accuracy <= 10 ? 0 : accuracy); // Hide accuracy circle on very high accuracy.
			} else { // Hide overlay on low accuracy.
				marker.setLatLng([ 0, 0 ]);
				circle.setRadius(0);
			}
			
			// Pan map if GPS found on load within timeout.
			if (new Date() - timestamp < opts.panTimeout) map.setView([ lat, lng ]);
			
			// Pan map if locating.
			if (accuracy < opts.accuracyTreshold && this.state.isLocating) map.panTo([ lat, lng ], { duration: .5 });
		}, { fireImmediately: true });
		
		// Setup attribution.
		
		const attribution = Leaflet.control.attribution({
			position: 'topright',
			prefix: ''
		});
		
		attribution.addAttribution('<a target="_blank" rel="noopener noreferrer" href="https://openstreetmap.org">OpenStreetMap</a>');
		attribution.addAttribution('<a target="_blank" rel="noopener noreferrer" href="https://mapbox.com/about/maps">Mapbox</a>');
		attribution.addAttribution('<a target="_blank" rel="noopener noreferrer" href="https://mapbox.com/feedback">Improve this map</a>');
		
		map.addControl(attribution);
	}
	
	componentWillUnmount() {
		this.dispose();
	}
	
	render() {
		const { t } = this.props;
		const { accuracy } = this.props.storeCoords;
		const { isLocating } = this.state;
		
		return (
			<>
				<Helmet>
					<meta name="theme-color" content={viewColors.map[0]} />
				</Helmet>
				<div id="map-container" className="view">
					<div id="map" />
					<span id="map-message">{this.state.message}</span>
					<Fab icon="location_on" color={viewColors.map[0]} isVisible={accuracy < 512} isActive={isLocating} onClick={this.startLocating} />
					<Modal isVisible={this.state.showModal} title={t('map.start.title')} text={t('map.start.text')} showCancel onCancel={this.modalHide} onConfirm={this.modalConfirm} />
				</div>
			</>
		);
	}
	
}

export default withTranslation()(withRouter(withTheme(inject('storeCoords')(observer(ViewMap)))));
