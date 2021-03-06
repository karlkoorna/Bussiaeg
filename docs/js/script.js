// Lazy load images.
const observer = new IntersectionObserver(((entries) => {
	for (const entry of entries) if (entry.isIntersecting) {
		const image = entry.target;
		const img = document.createElement('img');
		img.src = image.getAttribute('data-src');
		img.addEventListener('load', () => {
			image.parentElement.insertAdjacentElement('afterbegin', img);
			image.classList.add('has-loaded');
			image.addEventListener('transitionend', image.remove);
		});
		observer.unobserve(image);
	}
}));

// Observe lazy images.
for (const image of [ ...document.querySelectorAll('img.is-lazy') ]) observer.observe(image);

// Resize banner on home page.
resizeBanner();
function resizeBanner() {
	const $banner = document.getElementById('banner');
	if ($banner) $banner.style.height = $banner.nextElementSibling.style.height = innerHeight + 'px';
}

// Resize banner continuously on desktop browsers.
if (navigator.userAgent.toLowerCase().indexOf('mobi') === -1) addEventListener('resize', resizeBanner);
