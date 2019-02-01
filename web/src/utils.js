const $app = document.getElementById('app');

// Notify React component of theme change.
export function withTheme(C) {
	return class extends C {
		
		componentDidMount() {
			
			(new MutationObserver(() => {
				if (this.onThemeChange) this.onThemeChange(); else this.wrappedInstance.onThemeChange();
			})).observe($app, { attributes: true });
			
		}
		
	};
};

// Format meters to appropriate distance units.
export function formatDistance(meters) {
	return meters ? meters >= 100000 ? `${Math.round(meters / 10000) * 10}km` : meters >= 10000 ? `${(meters / 1000).toFixed()}km` : meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters / 10) * 10}m` : '';
}

// Converts seconds to sign, raw hour, minute and second values.
function secondsToShms(seconds) {
	const absSeconds = Math.abs(seconds);
	const hours = Math.floor(absSeconds / 3600);
	const minutes = Math.floor((absSeconds % 3600) / 60);
	return [ seconds < 0, hours, minutes, absSeconds - (minutes * 60) - (hours * 3600) ];
}

// Convert HMS to time format.
export function formatTime(seconds) {
	const shms = secondsToShms(seconds);
	return shms[1].toString().padStart(2, '0') + ':' + shms[2].toString().padStart(2, '0');
}

// Convert HMS to countdown format.
export function formatCountdown(seconds) {
	const shms = secondsToShms(seconds);
	return (shms[0] ? '-' : '') + (shms[1] ? `${shms[1]}h ` : '') + (shms[2] ? `${shms[2]}m ` : '') + (seconds < 300 ? `${shms[3]}s` : '');
}
