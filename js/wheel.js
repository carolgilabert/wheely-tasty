//-- Constructs a Wheel object
Wheel = function(_opt) {
	
	var opt = {
		loading: 	false,
		info: 		false,
		canvas: 	false,
		size: 		500
	};
	
	opt = $.extend(opt, _opt);
	
	//-- Init external properties
	this.canvas = opt.canvas;
	this.button = opt.button;
	this.loading = opt.loading;
	this.info = opt.info;
	
	//-- Init main properties	
	this.restaurants = [];
	this.colours = ['#D6BC38', '#2093B7', '#2E8B5C', '#D73728'];
	this.size = opt.size;
	
	this.init();
} 

//-- Initialises some aspects of the application
Wheel.prototype.init = function () {
	this.initFacebookSDK();
	this.loadRestaurants(); 
	//once the restaurants have been loaded the wheel will be rendered on a callback
	
	//Bind the spin button
	if (this.button !== false) {
		$(this.canvas).click(
			(function(_this){ return function() { 
				_this.spin.call(_this); 
			} })(this)
		);
	}
}

//-- Initialises the mathematical values for the wheel calculations once the other data has been loaded
Wheel.prototype.initWheelValues = function () {
	var slots = (this.restaurants.length > 20) ? 20 : this.restaurants.length;

	this.startAngle = 0;
	this.arc = (2*Math.PI) / slots;
	this.spinTimeout = null;
	this.spinArcStart = 10;
	this.spinTime = 0;
	this.spinTimeTotal = 0; 
	this.ctx;
	
	this.drawRouletteWheel();
}

//-- Obtains the user's location and fetches the restaurant data from Facebook
Wheel.prototype.loadRestaurants = function () {
	//First we show a loading screen
	this.renderLoading('Determining your location');

	//First we get the user's location
	if(navigator.geolocation){ 
		navigator.geolocation.getCurrentPosition(
			(function(_this){ return function(data) { 
				_this.fetchData.call(_this, data); 
			} })(this), (function(_this){ return function() { 
				_this.renderPostcodeModal.call(_this, {referer: 'no-location'}); 
			} })(this), {
		         enableHighAccuracy: true,
		         timeout : 5000
		    }
		);
	} else {
		this.renderPostcodeModal.call(_this); 
	}
}
  
Wheel.prototype.drawRouletteWheel = function() {
  if (this.canvas === false) { return false; }
  if (this.canvas.getContext) {
  	var slots = (this.restaurants.length > 20) ? 20 : this.restaurants.length;

    var outsideRadius = this.size*0.4;
    var textRadius = this.size*0.32;
    var insideRadius = this.size*0.25;
    
    this.ctx = this.canvas.getContext("2d");
    this.ctx.clearRect(0,0,this.size,this.size);
    
    
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 1;
    
    this.ctx.font = '48px sans-serif';
        
    for(var i = 0; i < slots; i++) {
      var angle = this.startAngle + i * this.arc;
      this.ctx.fillStyle = this.colours[i%this.colours.length];
      
      this.ctx.beginPath();
      this.ctx.arc(this.size/2, this.size/2, outsideRadius, angle, angle + this.arc, false);
      this.ctx.arc(this.size/2, this.size/2, insideRadius, angle + this.arc, angle, true);
      this.ctx.stroke();
      this.ctx.fill();
      
      this.ctx.save();
      this.ctx.shadowOffsetX = -1;
      this.ctx.shadowOffsetY = -1;
      this.ctx.shadowBlur    = 0;
      this.ctx.shadowColor   = "rgb(220,220,220)";
      this.ctx.fillStyle = "black";
      this.ctx.translate(this.size/2 + Math.cos(angle + this.arc / 2) * textRadius, this.size/2 + Math.sin(angle + this.arc / 2) * textRadius);
      this.ctx.rotate(angle + this.arc / 2 + Math.PI / 2);
      var text = this.restaurants[i].name;
      if (text.length > 20) {
      	text = text.substr(0, 14);
      } 
      text = '?';
      this.ctx.fillText(text, -this.ctx.measureText(text).width / 2, 0);
      this.ctx.restore();
    } 
    
    //Arrow
    this.ctx.fillStyle = "black";
    this.ctx.beginPath();
    this.ctx.moveTo(this.size/2 - 4, this.size/2 - (outsideRadius + 5));
    this.ctx.lineTo(this.size/2 + 4, this.size/2 - (outsideRadius + 5));
    this.ctx.lineTo(this.size/2 + 4, this.size/2 - (outsideRadius - 5));
    this.ctx.lineTo(this.size/2 + 9, this.size/2 - (outsideRadius - 5));
    this.ctx.lineTo(this.size/2 + 0, this.size/2 - (outsideRadius - 13));
    this.ctx.lineTo(this.size/2 - 9, this.size/2 - (outsideRadius - 5));
    this.ctx.lineTo(this.size/2 - 4, this.size/2 - (outsideRadius - 5));
    this.ctx.lineTo(this.size/2 - 4, this.size/2 - (outsideRadius + 5));
    this.ctx.fill();

    this.loading.empty();
    $(this.canvas).show();
  }
}
  
Wheel.prototype.spin =  function() {
	if (this.info.outerWidth() > 0) {
		this.closeInfo();
	}
	spinAngleStart = Math.random() * 10 + 10;
	spinTime = 0;
	spinTimeTotal = Math.random() * 3 + 4 * 1000;
	this.rotateWheel();
}
  
Wheel.prototype.rotateWheel = function() {
	spinTime += 30;
	if(spinTime >= spinTimeTotal) {
		this.stopRotateWheel();
		return;
	}
	
	var spinAngle = spinAngleStart - this.easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
	this.startAngle += (spinAngle * Math.PI / 180);
	this.drawRouletteWheel();
	spinTimeout = setTimeout((function(_this){ return function() { 
		_this.rotateWheel.call(_this); 
	} })(this), 30);
}
  
Wheel.prototype.stopRotateWheel = function() {
  clearTimeout(spinTimeout);
  var degrees = this.startAngle * 180 / Math.PI + 90;
  var arcd = this.arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  this.renderCard(index);

  this.ctx.save();
  this.ctx.font = 'bold 30px sans-serif';
  var text = this.restaurants[index].name;
  var textWidth = this.ctx.measureText(text).width > 400 ? 400 : this.ctx.measureText(text).width;
  this.ctx.fillText(text, this.size/2 - textWidth / 2, this.size/2 + 10, textWidth);
  this.ctx.restore();
}
  
Wheel.prototype.easeOut = function(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}

//----- HELPER FUNCTIONS

Wheel.prototype.initFacebookSDK = function () {
	//Loading Facebook SDK  
	window.fbAsyncInit = function() {
	FB.init({
	  appId      : '421905431315751',
	  xfbml      : true,
	  version    : 'v2.3'
	});
	};
	
	(function(d, s, id){
	 var js, fjs = d.getElementsByTagName(s)[0];
	 if (d.getElementById(id)) {return;}
	 js = d.createElement(s); js.id = id;
	 js.src = "//connect.facebook.net/en_US/sdk.js";
	 fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
}

Wheel.prototype.fetchData = function (_opt) {
	//If the coords come from postcode, remove modal
	$('.overlay').remove();
	$('.modal').remove();

	var _this = this;

	var opt = {
		coords: false,
		clear: 	false,
		url: 	false
	};
	
	opt = $.extend(opt, _opt);

	if (opt.clear !== false) {
		this.restaurants = [];
	}

	if (opt.coords !== false) {
		var data = {
		    lat: opt.coords.latitude,
		    lon: opt.coords.longitude
		};

		this.position = data;

		//Change loading screen
		this.renderLoading('Fetching restaurants');
	} else if (opt.url !== false) {
		var data = {
			url: opt.url
		}	
	}
	
	$.ajax({
	    url: 'ajax/getPlaceList.php',
	    data: data,
	    dataType: 'json',
	    method: 'POST',
	    success: function(data) {
		    if (data.data !== undefined) {
			    _this.formatData(data);
		    } else if (data.error !== undefined) {
			    //TODO - add some error handling
			    console.log(data);
		    } else {
			    //TODO - add some error handling
			    console.log(data);
		    }
	    },
	    error: function(data) {
		    //TODO - add some error handling
		    console.log(data);
	    }
	});
}

Wheel.prototype.formatData = function (data) {
	var result = data.data;
	var restaurants = [];
	for (var i = 0; i < result.length; i++) { 
		if (result[i].category.toLowerCase().indexOf('restaurant') != -1) {
			result[i].distance = this.getDistance(result[i].location.latitude, result[i].location.longitude);
			restaurants.push(result[i]);
		} else {
			for (var j = 0; j < result[i].category_list.length; j++) {
				if (result[i].category_list[j].name.toLowerCase().indexOf('restaurant') != -1) {
					result[i].distance = this.getDistance(result[i].location.latitude, result[i].location.longitude);
					restaurants.push(result[i]);
					break;
				}
			}
		}
	}
	//If we have less than 20 restaurants and data.paging.next is defined, call it and keep filling the array
	this.restaurants = this.restaurants.concat(restaurants);
	if (this.restaurants.length < 20 && data.paging !== undefined && data.paging.next !== undefined) {
		this.fetchData({url: data.paging.next});
	} else {
		this.sortData();
		this.initWheelValues();
	}
}

Wheel.prototype.renderLoading = function (message, showGif) {
	this.loading.empty();

	this.loading.append($('<h3>', {class: 'title', text: message, style: 'width: 400px; text-align: center; margin: 50px auto;'}));
	if (!(typeof showGif !== 'undefined' && showGif === false)) {
		this.loading.append($('<div>', {class: 'loadingImage', style: 'margin: 50px auto; width: 128px; height: 85px; background-image: url(img/loading.gif); background-size: contain; background-repeat: no-repeat; background-position: 50% 50%;'}));
	}
}

Wheel.prototype.renderCard = function (index) {
	var _this = this;

	var info = this.getCardInfo(index);
	this.info.empty();

	info.done(function (data) {
		var info_container = $('<div>');

		var info_close = $('<button>', {class: 'close', type: 'button', text: 'x'});
		info_close.click(
			(function(_this){ return function() { 
				_this.closeInfo.call(_this); 
			} })(_this)
		);
		info_container.append(info_close);

		//Picture
		if (data.picture && data.picture.data && !data.picture.data.is_silhouette) { info_container.append($('<img>', {src: data.picture.data.url, width: '60px', height: '60px'})); }
		//Name
		if (data.name) { info_container.append($('<h3>', {class: 'card_title', text: data.name})); }
		//Description
		if (data.description) { info_container.append($('<p>', {class: 'card_description', text: data.description})); } else if (data.about) {info_container.append($('<p>', {class: 'card_description', text: data.about}));}
		//Phone
		if (data.phone) { 
			info_container.append($('<h4>', {class: 'card_property', text: 'Phone number:'}));
			info_container.append($('<p>', {class: 'card_phone', text: data.phone})); 
		}
		//Hours
		if (data.hours) { 
			info_container.append($('<h4>', {class: 'card_property', text: 'Opening times:'}));
			var week = {}; week['mon'] = 'Monday'; week['tue'] = 'Tuesday'; week['wed'] = 'Wednesday'; week['thu'] = 'Thursday'; week['fri'] = 'Friday'; week['sat'] = 'Saturday'; week['sun'] = 'Sunday';

			for (day in week) {
				var string = '';
				if (data.hours[day+'_1_open'] && data.hours[day+'_1_close']) {
					string += week[day] + ': ' + data.hours[day+'_1_open'] + ' - ' + data.hours[day+'_1_close'];
				}
				if (data.hours[day+'_2_open'] && data.hours[day+'_2_close']) {
					string += week[day] + ': ' + data.hours[day+'_2_open'] + ' - ' + data.hours[day+'_2_close'];
				}
				info_container.append($('<p>', {class: 'card_hours', text: string}))
			}
		}
		//Address
		if (data.location) {
			info_container.append($('<h4>', {class: 'card_property', text: 'Address:'}));
			if (data.location.street) { info_container.append($('<p>', {class: 'card_location', text: data.location.street})); }
			if (data.location.city) { info_container.append($('<p>', {class: 'card_location', text: data.location.city})); }
			if (data.location.zip) { info_container.append($('<p>', {class: 'card_location', text: data.location.zip})); }
			if (data.location.country) { info_container.append($('<p>', {class: 'card_location', text: data.location.country})); }
		} 
		//Website
		if (data.website) { 
			info_container.append($('<h4>', {class: 'card_property', text: 'Website:'}));
			info_container.append($('<p>', {class: 'card_website', text: data.website}))
		}

		_this.info.append(info_container);
		_this.info.css('width', '400px');
		$(_this.canvas).parent().css('marginLeft', '400px');
	});

	info.fail(function (data) {
		//TODO - add some error handling
	    console.log(data);
	});
}

Wheel.prototype.renderPostcodeModal = function (opt) {
	var _this = this;
	$('body').append($('<div>', {class: 'overlay'}));
	var modal = $('<div>', {class: 'modal'});
	var modalDialog = $('<div>', {class: 'modal-dialog'});
	var modalContent = $('<div>', {class: 'modal-content'});

	//Header
	var modalHeader = $('<div>', {class: 'modal-header'});
	modalHeader.append($('<button>', {class: 'close', type: 'button', text: 'x'}) .attr('data-dismiss', 'modal') .attr('aria-hidden', 'true') .click(function() {
		$('.overlay').remove();
		$('.modal').remove();

		if (typeof opt !== 'undefined' && opt.referer && opt.referer == 'no-location') {
			_this.renderLoading('Your location could no be determined. Please click Search by Postcode to continue.', false);
		}
	}));
	modalHeader.append($('<h4>', {class: 'modal-title', text: 'Search by Postcode'}));
	//Body
	var modalBody = $('<div>', {class: 'modal-body'});
	if (typeof opt !== 'undefined' && opt.referer && opt.referer == 'no-location') {
		modalBody.append($('<p>', {class: 'text-danger', text: 'There was issue determining your location.'}));	
	}
	modalBody.append($('<p>', {text: 'Please enter your postcode below:'}));
	modalBody.append($('<input>', {type: 'text', id: 'postcode'}));
	modalBody.append($('<span>', {class: 'help-block', text: 'If the postcode is from outside the UK, please also include your city name for accurate results.'}));
	//Footer
	var modalFooter = $('<div>', {class: 'modal-footer'});
	modalFooter.append($('<button>', {type: 'button', class: 'btn btn-primary', text: 'Search'}) .click(
		function() { 
			googleGeocoding.codePostcode($('#postcode').val()); 
			_this.closeInfo();
			$(_this.canvas).hide();
		}
	));

	modalContent.append(modalHeader);
	modalContent.append(modalBody);
	modalContent.append(modalFooter);
	modalDialog.append(modalContent);
	modal.append(modalDialog);
	$('body').append(modal);
	$('modal').show();
}

Wheel.prototype.getCardInfo = function (index) {
	return $.ajax({
	    url: 'ajax/getPlaceInfo.php',
	    data: {id: this.restaurants[index].id},
	    dataType: 'json',
	    method: 'POST'
	});
}

Wheel.prototype.closeInfo = function () {
	$(this.canvas).parent().css('margin', '0px auto');
	this.info.empty();
	this.info.css('width', '0px');
}


Wheel.prototype.sortData = function () {
	this.restaurants.sort(function(a, b) {
	    return parseFloat(a.distance) - parseFloat(b.distance);
	});
}

Wheel.prototype.getDistance = function (lat2,lon2) {
	var lat1 = this.position.lat;
	var lon1 = this.position.lon;

	var R = 6371; // Radius of the earth in km
	var dLat = this.deg2rad(lat2-lat1);
	var dLon = this.deg2rad(lon2-lon1); 
	var a = 
	Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
	Math.sin(dLon/2) * Math.sin(dLon/2)
	; 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c; // Distance in km
	return d;
}

//-- Aux function that converts degrees to radians
Wheel.prototype.deg2rad = function (deg) {
	return deg * (Math.PI/180)
}

//-- Aux function that returns a random hex colour
Wheel.prototype.getColour = function() {
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}