var http = require("https");

const getContent = function(url) {
	// return new pending promise
	return new Promise((resolve, reject) => {
	// select http or https module, depending on reqested url
	const lib = url.startsWith('https') ? require('https') : require('http');
	const request = lib.get(url, (response) => {
		// handle http errors
		if (response.statusCode < 200 || response.statusCode > 299) {
			reject(new Error('Failed to load page, status code: ' + response.statusCode));
		}
		// temporary data holder
		const body = [];
		// on every content chunk, push it to the data array
		response.on('data', (chunk) => body.push(chunk));
		// we are done, resolve promise with those joined chunks
		response.on('end', () => resolve(body.join('')));
	});
	// handle connection errors of the request
	request.on('error', (err) => reject(err))
	})
};


getContent('https://freegeoip.app/json/107.242.120.43').then((html) => console.log(html)).catch((err) => console.error(err));



function geolocate(address) {
	var country = "unknown";
	var options = {
		"method": "GET",
		"hostname": "freegeoip.app",
		"port": null,
		"path": "/json/" + address,
		"headers": {
			"accept": "application/json",
			"content-type": "application/json"
		}
	};
	var req = http.request(options, function (res) {
		var chunks = [];
		res.on("data", function (chunk) {
			chunks.push(chunk);
			var locationData = JSON.parse(chunks);
			console.log(locationData.country_name);
			country = locationData.country_name;
		});
	});
	req.end();
	return country;
}
//var country = geolocate('107.242.120.43');
//console.log('country: ' + country);