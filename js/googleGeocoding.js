//-- Constructs a googleGeocoding object
GoogleGeocoding = function() {

	//-- Properties
	this.geocoder = false;
} 

GoogleGeocoding.prototype.init = function () {
	this.geocoder = new google.maps.Geocoder();
    // var latlng = new google.maps.LatLng(-34.397, 150.644);
    // var mapOptions = {
    //   zoom: 8,
    //   center: latlng
    // }
    // map = new google.maps.Map(document.getElementById("map"), mapOptions);
}

GoogleGeocoding.prototype.codePostcode = function (postCode) {
	geocoder.geocode( { 'address': postCode}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			if (results[0].geometry) {
				wheel.fetchData( 
					{
						coords: {
							latitude: results[0].geometry.location.G,
							longitude: results[0].geometry.location.K
						},
						clear: true
					}
				);
			}
		} else {
			return false;
		}
	});
}

GoogleGeocoding.prototype.initMap = function (location) {
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: location.lat, lng: location.lng},
		zoom: 20
	});

	var marker = new google.maps.Marker({
		position: location,
		map: map
	});
}

googleGeocoding = new GoogleGeocoding();