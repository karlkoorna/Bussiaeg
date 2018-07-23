import React, { Fragment } from 'react';

// Colors for vehicle and stop icons.
export const colors = {
	bus: [ '#66BB6A', '#4CAF50' ],
	trol: [ '#0091ea', '#0277bd' ],
	tram: [ '#ff3d00', '#d84315' ],
	train: [ '#ff6d00', '#e65100' ],
	coach: [ '#7e57c2', '#673ab7' ]
};

export default function VehicleIcon({ id, className, type }) {
	
	const [ primaryColor, secondaryColor ] = colors[type];
	
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" id={id} className={className}>
			{{
				bus: (
					<Fragment>
						<path fill={secondaryColor} d="M285.5 826.2c0 43.3-18.3 104.7 52.7 104.7s59.3-57.3 59.3-100.7m341-4c0 43.3 18.3 104.7-52.7 104.7s-59.3-57.3-59.3-100.7" />
						<path fill={primaryColor} d="M823.4 259.8c-3.4-34.2-3.9-91.8-21.2-111.4-17.3-19.6-233.3-22.8-290.2-22.8s-272.8 3.2-290.2 22.8c-17.3 19.6-17.8 77.2-21.2 111.4s-4.6 255.4-3.1 290.4 4 152.5 8 184 6.5 83.2 16.3 92c9.8 8.8 58.4 14.2 84.8 15.3s121.7 6.8 205.5 6.8 179.1-5.7 205.5-6.8 75-6.4 84.8-15.3c9.8-8.8 12.3-60.5 16.3-92s6.5-149 8-184 .1-256.2-3.3-290.4zM343.1 775.9c-32 0-58-26-58-58s26-58 58-58 58 26 58 58-25.9 58-58 58zm337.8 0c-32 0-58-26-58-58s26-58 58-58 58 26 58 58-26 58-58 58zM764.5 585c-12 17.5-96.5 34-252.5 34s-240.5-16.5-252.5-34-6-127 5-189.5 61-187 247.5-187 236.5 124.5 247.5 187 17 172 5 189.5z" />
					</Fragment>
				),
				trol: (
					<Fragment>
						<path fill={secondaryColor} d="M444.4 184.7s-80.5-139.5-89-144.5-60.3-8.7-63.3 3.3 52.8 91.3 92.3 146m206.5-4.8s80.5-139.5 89-144.5 60.3-8.7 63.3 3.3-52.8 91.3-92.3 146" />
						<path fill={secondaryColor} d="M285.5 883.9c0 43.3-18.3 104.7 52.7 104.7s59.3-57.3 59.3-100.7m341-4c0 43.3 18.3 104.7-52.7 104.7s-59.3-57.3-59.3-100.7" />
						<path fill={primaryColor} d="M823.4 317.5c-3.4-34.2-3.9-91.8-21.2-111.4-17.3-19.6-233.3-22.8-290.2-22.8s-272.8 3.2-290.2 22.8c-17.3 19.6-17.8 77.2-21.2 111.4s-4.6 255.4-3.1 290.4 4 152.5 8 184 6.5 83.2 16.3 92c9.8 8.8 58.4 14.2 84.8 15.3s121.7 6.8 205.5 6.8 179.1-5.7 205.5-6.8 75-6.4 84.8-15.3c9.8-8.8 12.3-60.5 16.3-92s6.5-149 8-184 .1-256.2-3.3-290.4zM343.1 833.7c-32 0-58-26-58-58s26-58 58-58 58 26 58 58-25.9 58-58 58zm337.8 0c-32 0-58-26-58-58s26-58 58-58 58 26 58 58-26 58-58 58zm83.6-190.9c-12 17.5-96.5 34-252.5 34s-240.5-16.5-252.5-34-6-127 5-189.5 61-187 247.5-187 236.5 124.5 247.5 187 17 172 5 189.5z" />
					</Fragment>
				),
				tram: (
					<Fragment>
						<path fill={secondaryColor} d="M637.2 838.8H386.8s-106 90.3-106 107 22.3 39.3 32.7 38 35.7-44.3 46.7-48 151.8-4.7 151.8-4.7h.1s140.8 1 151.8 4.7 36.3 46.7 46.7 48 32.7-21.3 32.7-38-106.1-107-106.1-107zm-31.9 40.7c-3.3 7.5-93.2 4.8-93.2 4.8h-.1s-89.9 2.8-93.2-4.8 41-39.3 41-39.3h104.5c0 .1 44.2 31.8 41 39.3zM512 80s-121.7.5-128.7 11.7 54.8 72.5 54.8 72.5-9 35-38.3 9.5S311 73.5 314.8 63 424.3 44.3 512 44.3 705.5 52.5 709.3 63s-55.8 85.3-85 110.8-38.3-9.5-38.3-9.5 61.8-61.3 54.8-72.5S512 80 512 80z" />
						<path fill={primaryColor} d="M817.4 501.3C814.9 399.7 794 290.5 762 217.5s-154.3-61.7-250-61.7-218-11.3-250 61.7-52.9 182.2-55.4 283.8C204 603 182.3 799 224.2 818.5s227.3 22.7 287.8 22.7 246-3.2 287.8-22.7C841.7 799 820 603 817.4 501.3zM392.8 792.9c-32 0-58-26-58-58s26-58 58-58 58 26 58 58-25.9 58-58 58zm238.4 0c-32 0-58-26-58-58s26-58 58-58 58 26 58 58-26 58-58 58zm133.3-181.4c-12 17.5-96.5 34-252.5 34s-240.5-16.5-252.5-34-6-127 5-189.5 61-187 247.5-187 236.5 124.5 247.5 187 17 172 5 189.5z" />
					</Fragment>
				),
				train: (
					<Fragment>
						<path fill={secondaryColor} d="M637.2 813.8H386.8s-106 90.3-106 107 22.3 39.3 32.7 38c10.3-1.3 35.7-44.3 46.7-48s151.8-4.7 151.8-4.7h.1s140.8 1 151.8 4.7 36.3 46.7 46.7 48 32.7-21.3 32.7-38-106.1-107-106.1-107zm-31.9 40.7c-3.3 7.5-93.2 4.8-93.2 4.8h-.1s-89.9 2.8-93.2-4.8 41-39.3 41-39.3h104.5c0 .1 44.2 31.8 41 39.3z" />
						<path fill={primaryColor} d="M827.4 373c-.4-133-10.8-233.5-24-249.9S677.6 100.3 512 100.3s-278.1 6.4-291.4 22.8c-13.2 16.4-23.6 117-24 249.9s4.4 407.8 24.8 427.4c20.4 19.6 213.4 22.8 290.6 22.8s270.1-3.2 290.6-22.8C823 780.8 827.8 506 827.4 373zM343.5 752.5c-33.4 0-60.5-27.1-60.5-60.5s27.1-60.5 60.5-60.5S404 658.6 404 692s-27.1 60.5-60.5 60.5zm337 0c-33.4 0-60.5-27.1-60.5-60.5s27.1-60.5 60.5-60.5S741 658.6 741 692s-27.1 60.5-60.5 60.5zm55.7-383.3c-10.7 88-19 191.7-43 206-24 14.3-104.3 22.3-181.2 22.3s-157.2-8-181.2-22.3-32.3-118-43-206c-10.7-88-17.7-157.9-1.6-174s107.6-8.3 225.8-8.3 209.7-7.8 225.8 8.3 9 86-1.6 174z" />
					</Fragment>
				),
				coach: (
					<Fragment>
						<path fill={secondaryColor} d="M285.5 826.2c0 43.3-18.3 104.7 52.7 104.7s59.3-57.3 59.3-100.7m341-4c0 43.3 18.3 104.7-52.7 104.7s-59.3-57.3-59.3-100.7" />
						<path fill={primaryColor} d="M823.4 259.8c-3.4-34.2-3.9-91.8-21.2-111.4-17.3-19.6-233.3-22.8-290.2-22.8s-272.8 3.2-290.2 22.8c-17.3 19.6-17.8 77.2-21.2 111.4s-4.6 255.4-3.1 290.4 4 152.5 8 184 6.5 83.2 16.3 92c9.8 8.8 58.4 14.2 84.8 15.3s121.7 6.8 205.5 6.8 179.1-5.7 205.5-6.8 75-6.4 84.8-15.3c9.8-8.8 12.3-60.5 16.3-92s6.5-149 8-184 .1-256.2-3.3-290.4zM343.1 775.9c-32 0-58-26-58-58s26-58 58-58 58 26 58 58-25.9 58-58 58zm337.8 0c-32 0-58-26-58-58s26-58 58-58 58 26 58 58-26 58-58 58zM764.5 585c-12 17.5-96.5 34-252.5 34s-240.5-16.5-252.5-34-6-127 5-189.5 61-187 247.5-187 236.5 124.5 247.5 187 17 172 5 189.5z" />
					</Fragment>
				)
			}[type]}
		</svg>
	);
	
}
