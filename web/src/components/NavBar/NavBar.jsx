import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import Ink from 'react-ink';

import getBanner from './banner.js';

import './NavBar.css';

const $app = document.getElementById('app');

// View colors.
export const colors = {
	search: [ '#ffa94d', '#ff8400' ],
	favorites: [ '#f5557e', '#f22559' ],
	map: [ '#00e6ad', '#00cc9a' ],
	settings: [ '#00bfff', '#00ace6' ]
};

// Add CSS variables for above colors.
for (const view of Object.entries(colors)) {
	$app.style.setProperty(`--color-view-${view[0]}-light`, view[1][0]);
	$app.style.setProperty(`--color-view-${view[0]}-dark`, view[1][1]);
}

class NavBarItem extends Component {
	
	state = {
		animation: ''
	}
	
	navigate = () => {
		const { to, children, history, location } = this.props;
		
		// Cancel if already active.
		if (location.pathname === to) return;
		
		// Navigate and play animation.
		history.push(to);
		this.setState({ animation: `navbar-${children.toLowerCase()} .5s ease` });
	}
	
	resetStyle = () => {
		this.setState({ animation: '' });
	}
	
	render() {
		const { to, colors: _colors, children } = this.props;
		const { theme } = this.props.storeSettings.data;
		const [ primaryColor, secondaryColor ] = window.location.pathname === to ? _colors : theme === 'light' ? [ '#bdbdbd', '#b3b3b3' ] : [ '#707070', '#606060' ];
		
		return (
			<li className="navbar-item" onMouseDown={this.navigate} onTouchStart={this.navigate}>
				<svg viewBox="0 0 1024 1024" className="navbar-item-icon" style={{ animation: this.state.animation }} onAnimationEnd={this.resetStyle}>
					{{
						search: (
							<>
								<path stroke={secondaryColor} strokeWidth="125" d="M650.7 650.7l321 321" />
								<circle fill="transparent" stroke={primaryColor} strokeWidth="100" cx="399.3" cy="399.3" r="347" />
							</>
						),
						favorites: (
							<>
								<path fill={primaryColor} stroke={secondaryColor} strokeWidth="100" d="M512 927.7l-65.7-59.8C213 656.3 58.9 516.3 58.9 345.5c0-140 109.6-249.2 249.2-249.2 78.8 0 154.5 36.7 203.9 94.2 49.4-57.5 125-94.2 203.9-94.2 139.5 0 249.2 109.2 249.2 249.2 0 170.8-154 310.8-387.4 522.4L512 927.7z" />
							</>
						),
						map: (
							<>
								<path fill={primaryColor} d="M712.5 965.7l288-48.7V74l-288 45-391-45-296 45v846l295-47z" />
								<path fill={secondaryColor} d="M712.5 119l-391-45-1 844 392 47.7z" />
							</>
						),
						settings: (
							<>
								<path fill={primaryColor} d="M512.1 683c-94.4 0-171-76.6-171-171s76.6-171 171-171 171 76.6 171 171-76.6 171-171 171m363-123.6c2-15.6 3.4-31.3 3.4-47.4s-1.5-32.2-3.4-48.9l103.1-79.6c9.3-7.3 11.7-20.5 5.9-31.3l-97.7-169.1c-5.9-10.7-19.1-15.1-29.8-10.7l-121.7 48.9c-25.4-19.1-51.8-35.7-82.6-47.9l-18-129.5c-2-11.7-12.2-20.5-24.4-20.5H414.4c-12.2 0-22.5 8.8-24.4 20.5l-18.1 129.5c-30.8 12.2-57.2 28.8-82.6 47.9l-121.7-48.9c-10.7-4.4-23.9 0-29.8 10.7L40.1 352.2c-6.4 10.7-3.4 23.9 5.9 31.3l103.1 79.6c-2 16.6-3.4 32.7-3.4 48.9s1.5 31.8 3.4 47.4L46 640.5c-9.3 7.3-12.2 20.5-5.9 31.3l97.7 169.1c5.9 10.7 19.1 14.7 29.8 10.7l121.7-49.3c25.4 19.5 51.8 36.2 82.6 48.4L390 980.1c2 11.7 12.2 20.5 24.4 20.5h195.4c12.2 0 22.5-8.8 24.4-20.5l18.1-129.5c30.8-12.7 57.2-28.8 82.6-48.4l121.7 49.3c10.7 3.9 23.9 0 29.8-10.7l97.7-169.1c5.9-10.7 3.4-23.9-5.9-31.3l-103.1-81z" />
								<circle fill="transparent" stroke={secondaryColor} strokeWidth="100" cx="512" cy="512" r="205.6" />
							</>
						)
					}[children.toLowerCase()]}
				</svg>
				<Ink hasTouch={false} background={false} opacity={.5} style={{ color: _colors[0] }} />
			</li>
		);
	}
	
}

const WrappedNavBarItem = withRouter(inject('storeSettings')(observer(NavBarItem)));

export default function NavBar() {
	const banner = getBanner();
	
	return (
		<nav id="navbar">
			{banner ? <div id="navbar-banner" style={{ backgroundImage: `url('assets/banners/${banner}.svg')` }} /> : null}
			<ul>
				<WrappedNavBarItem to="/search" colors={colors.search}>Search</WrappedNavBarItem>
				<WrappedNavBarItem to="/favorites" colors={colors.favorites}>Favorites</WrappedNavBarItem>
				<WrappedNavBarItem to="/" colors={colors.map}>Map</WrappedNavBarItem>
				<WrappedNavBarItem to="/settings" colors={colors.settings}>Settings</WrappedNavBarItem>
			</ul>
		</nav>
	);
}
