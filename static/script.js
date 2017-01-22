// Declarations

var coords, map, updater, live;

const fadeTime = 250,
	  updateTime = 2000;

// Functions

function getParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function getSecondsSinceMidnight() {
	return ~~((new Date() - new Date().setHours(0, 0, 0, 0)) / 1000);
}

function toHMS(seconds) {
	var hours   = Math.floor(seconds / 3600),
		minutes = Math.floor((seconds % 3600) / 60);
	seconds = seconds - (minutes * 60) - (hours * 3600);
	return {
		h: ('0' + hours).slice(-2),
		m: ('0' + minutes).slice(-2),
		s: ('0' + seconds).slice(-2)
	};
}

function toCountdown(seconds, showHours) {
	seconds = seconds - getSecondsSinceMidnight();
	var time = toHMS(Math.abs(seconds));
	return (seconds < 0 ? '-' : '') + (showHours ? time.h + 'h ': '') + time.m + 'm ' + (showHours ? '' : time.s + 's');
}

function toTime(seconds) {
	var time = toHMS(seconds);
	return time.h + ':' + time.m;
}

function showStop(id, settings) {
	if (updater && !live) {
		
		$('.trip-scheduled').each(function() {
			$(this).text(toCountdown($(this).attr('data-time'), true));
			
			if ($(this).attr('data-time') > getSecondsSinceMidnight()) return;
				
			$(this).parent().animate({left: window.innerWidth + 'px'}, 1000, function() {
				$(this).remove();
				
				$('.trip').each(function() {
					$(this).animate({top: (parseInt($(this).css('top')) - 80) + 'px'}, 500);
				});
				
			});
			
		});
		
		return;
	}
	
	$.get('//' + location.host + '/getstop?id=' + id).done(function(data) {
		var trips   = data.trips,
			content = '';
		
		live = data.live;
		
		for (var i = 0; i < trips.length; i++) {
			var trip = trips[i];
			
			if (live) {
				content += '<div class="trip" style="top:' + i * 80 + 'px;"><img class="trip-type" src="assets/' + trip.type + '.png"><div class="trip-number">' + trip.number + '</div><div class="trip-scheduled">' + toCountdown(trip.scheduled, false) + '</div><div class="trip-expected">' + toCountdown(trip.expected, false) + '</div></div>';
			} else {
				content += '<div class="trip" style="top:' + i * 80 + 'px;"><img class="trip-type" src="assets/' + trip.type + '.png"><div class="trip-number">' + trip.number + '</div><div class="trip-scheduled" data-time="' + trip.time + '">' + toCountdown(trip.time, true) + '</div><div class="trip-expected">' + toTime(trip.time) + '</div></div>';
			}
			
		}
		$('#stop-trips').html(content);
		
		if (settings.panMap) map.panTo({
			lat: data.lat,
			lng: data.lng
		});
		
		if (!settings.fadeIn) return;
		
		document.title = 'Bussiaeg - ' + data.name + (data.desc ? ' - ' + data.desc : '');
		history.pushState(null, document.title, '/?stop=' + data.id);
		
		$('#stop-name').text(data.name);
		$('#stop-desc').text(data.desc);
		
		$('#stop').fadeIn(fadeTime);
	});
	
}

function showStops() {
	
	if (map.getZoom() <= 15) return map.eachLayer(function(layer) { 
		if (layer._icon !== undefined) map.removeLayer(layer);
	});
	
	const bounds = map.getBounds();
	$.get('//' + location.host + '/getstops?lat_min=' + bounds._northEast.lat + '&lng_min=' + bounds._northEast.lng + '&lat_max=' + bounds._southWest.lat + '&lng_max=' + bounds._southWest.lng, function(stops) {
	
		for (var i = 0; i < stops.length; i++) {
			var stop = stops[i];
			
			L.marker([stop.lat, stop.lng], {
				icon: L.icon({
					iconUrl: 'assets/stop.png',
					iconSize: [24, 24],
					draggable: true
				})
			}).addTo(map).on('click', function() {
				if (updater) return;
				
				showStop(stop.id, {panMap: false, fadeIn: true});
				updater = setInterval(function() {
					showStop(stop.id, {panMap: false, fadeIn: false});
				}, updateTime);
				
			});
			
		}
	
	});
	
}

// Initialization

var map = L.map('map', {
	center: [
		parseFloat(getParameter('lat')) || 59.388,
		parseFloat(getParameter('lng')) || 24.684
	],
	zoom: 17,
	minZoom: 10,
	maxZoom: 18,
	maxBounds: [[59.874204, 21.396935], [57.290822, 28.838625]],
	attributionControl: false,
	bounceAtZoomLimits: false,
	doubleClickZoom: false,
	zoomControl: false,
	keyboard: false,
	boxZoom: false
});

L.tileLayer('//{s}.google.com/vt/lyrs=phl=en&x={x}&y={y}&z={z}&pbhttps://maps.googleapis.com/maps/vt?pb=!1m5!1m4!1i{z}!2i{x}!3i{y}!4i256!2m3!1e0!2sm!3i372053562!3m14!2sen-US!3sUS!5e18!12m1!1e47!12m3!1e37!2m1!1ssmartmaps!12m4!1e26!2m2!1sstyles!2zcy50OjY2fHAudjpvZmY!4e0', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

L.control.attribution({
	position: 'bottomleft',
	prefix: 'Bussiaeg.ee | <a href="https://soiduplaan.tallinn.ee/">Sõiduplaanid</a> | <a href="http://peatus.ee">Peatus</a> | <a href="https://maps.google.com">Google</a> | <a href="http://leafletjs.com">Leaflet</a>'
}).addTo(map);

showStops();
map.on('moveend', function() {
	showStops();
});

map.locate({
	enableHighAccuracy: true,
	setView: true
});

map.on('locationfound', function() {
	console.log('asd');
});

navigator.geolocation.getCurrentPosition(function(pos) {
	map.panTo([pos.coords.latitude, pos.coords.longitude]);
});

navigator.geolocation.watchPosition(function(pos) {
	coords = pos;
});

const share = parseInt(getParameter('stop'));
if (share) if (!isNaN(share)) if (!updater) {
	
	showStop(share, {panMap: true, fadeIn: true});
	updater = setInterval(function() {
		showStop(share, {panMap: false, fadeIn: false});
	}, updateTime);
	
}

// User Interface

$('#stop-top').click(function() {
	clearInterval(updater); updater = null;
	
	$(this).parent().fadeOut(fadeTime, function() {
		$('#stop-name').text('...');
		$('#stop-desc').text('...');
		$('#stop-trips').html('');
	});
	
});

map.on('click', function() {
	$('#bookmarks').animate({left: '-240px'}, fadeTime);
});

$('#btn-bookmarks').click(function() {
	$(this).addClass('bounce');
	
	$('#bookmarks').animate({left: '0px'}, fadeTime);
});

$('#bookmarks-add').click(function() {
	var bookmarks = localStorage.getItem('bookmarks') || [],
		name = swal({
			type: 'input',
			title: 'Anna asukohale nimi',
			confirmButtonColor: 'deepskyblue',
			showCancelButton: true,
			inputPlaceholder: 'Minu kodu'
		});
	
	
	
	localStorage.setItem('bookmarks', bookmarks);
});

$('#btn-help').click(function() {
	$(this).addClass('bounce');
	
	$('#help').fadeIn(fadeTime, function() {
		$('#btn-help').removeClass('bounce');
	});
	
});

$('#help').click(function() {
	$(this).fadeOut(fadeTime);
});

$('#btn-locate').click(function() {
	$(this).addClass('bounce');
	
	map.panTo([coords.latitude, coords.longitude]);
});

$('#btn-locate').on('animationend', function() {
	$(this).removeClass('bounce');
});