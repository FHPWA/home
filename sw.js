﻿const CACHE = "Home";
const precacheFiles = [
	"/home/",
	"/home/index.html",
	"/home/info.html",
	"/home/settings.html",

	"/home/images/appicons/squircle-256.png",

	"/home/images/page/android.png",
	"/home/images/page/blackc4t.png",
	"/home/images/page/brainf.png",
	"/home/images/page/happyshibe.png",
	"/home/images/page/passwordgen.png",

	"/home/images/page/browsers/browser.png",
	"/home/images/page/browsers/chrome.png",
	"/home/images/page/browsers/chromium.png",
	"/home/images/page/browsers/firefox.png",
	"/home/images/page/browsers/ie.png",
	"/home/images/page/browsers/ms-edge.png",
	"/home/images/page/browsers/safari.png",
	"/home/images/page/browsers/tor.png",

	"/css/main.css",
	"/css/settings.css",
	"/scripts/navbar.js",
	"/scripts/script.js",
	"/scripts/settings.js",
	"/fonts/FiraSansNF.woff2",
];

self.addEventListener("install", function(event) {
	self.skipWaiting();
	event.waitUntil(
		caches.open(CACHE).then(function(cache) {
			return cache.addAll(precacheFiles);
		}),
	);
});

// Allow sw to control of current page
self.addEventListener("activate", function(event) {
	event.waitUntil(self.clients.claim());
});

// If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener("fetch", function(event) {
	if (event.request.method !== "GET") return;
	event.respondWith(
		fromCache(event.request).then(
			function(response) {
				// The response was found in the cache so we respond with it and update the entry
				// This is where we call the server to get the newest version of the
				// file to use the next time we show view
				event.waitUntil(
					fetch(event.request).then(function(response) {
						return updateCache(event.request, response);
					}),
				);
				return response;
			},
			function() {
				// The response was not found in the cache so we look for it on the server
				return fetch(event.request)
					.then(function(response) {
						// If request was success, add or update it in the cache
						event.waitUntil(updateCache(event.request, response.clone()));
						return response;
					})
					.catch(function(error) {
					});
			},
		),
	);
});

function fromCache(request) {
	// Check to see if you have it in the cache
	// Return response
	// If not in the cache, then return
	return caches.open(CACHE).then(function(cache) {
		return cache.match(request).then(function(matching) {
			if (!matching || matching.status === 404) {
				return Promise.reject("no-match");
			}
			return matching;
		});
	});
}

function updateCache(request, response) {
	return caches.open(CACHE).then(function(cache) {
		return cache.put(request, response);
	});
}
