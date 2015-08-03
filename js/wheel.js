//-- Constructs a Wheel object
Wheel = function(_opt) {
	
	var opt = {
		canvas: false,
		button: false,
		size: 	500
	};
	
	opt = $.extend(opt, _opt);
	
	//-- Init external properties
	this.canvas = opt.canvas;
	this.button = opt.button;
	
	//-- Init main properties	
	this.restaurants = [];
	this.colours = false;
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
		$(this.button).click(
			(function(_this){ return function() { 
				_this.spin.call(_this); 
			} })(this)
		);
	}
}

//-- Initialises the mathematical values for the wheel calculations once the other data has been loaded
Wheel.prototype.initWheelValues = function () {
	var slots = (this.restaurants.length > 20) ? 20 : this.restaurants.length > 20;

	this.startAngle = 0;
	this.arc = (2*Math.PI) / slots;
	this.spinTimeout = null;
	this.spinArcStart = 10;
	this.spinTime = 0;
	this.spinTimeTotal = 0; 
	this.ctx;
	
	this.colours = [];
	for (var i = 0; i < slots; i++) {
		this.colours.push(this.getColour());
	}
	
	this.drawRouletteWheel();
}

//-- Obtains the user's location and fetches the restaurant data from Facebook
Wheel.prototype.loadRestaurants = function () {
	//First we get the user's location
	if(navigator.geolocation){ 
		navigator.geolocation.getCurrentPosition(
			(function(_this){ return function(data) { 
				_this.fetchData.call(_this, data); 
			} })(this)
		);
	} else {
		console.log("no location");
		//TODO - prompt the user for his postcode and get location from there (google geocoding API)
	}
}
  
Wheel.prototype.drawRouletteWheel = function() {
  if (this.canvas === false) { return false; }
  if (this.canvas.getContext) {
  	var slots = (this.restaurants.length > 20) ? 20 : this.restaurants.length > 20;

    var outsideRadius = this.size*0.4;
    var textRadius = this.size*0.32;
    var insideRadius = this.size*0.25;
    
    this.ctx = this.canvas.getContext("2d");
    this.ctx.clearRect(0,0,this.size,this.size);
    
    
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 2;
    
    this.ctx.font = 'bold 12px sans-serif';
        
    for(var i = 0; i < slots; i++) {
      var angle = this.startAngle + i * this.arc;
      this.ctx.fillStyle = this.colours[i];
      
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
  }
}
  
Wheel.prototype.spin =  function() {
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
  this.ctx.save();
  this.ctx.font = 'bold 30px sans-serif';
  var text = this.restaurants[index].name;
  this.ctx.fillText(text, this.size/2 - this.ctx.measureText(text).width / 2, this.size/2 + 10);
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
	var _this = this;

	var opt = {
		coords: false,
		url: 	false
	};
	
	opt = $.extend(opt, _opt);

	if (opt.coords !== false) {
		var data = {
		    lat: opt.coords.latitude,
		    lon: opt.coords.longitude
		};

		this.position = data;
	} else if (opt.url !== false) {
		var data = {
			url: opt.url
		}	
	}
	
	$.ajax({
	    url: '/ajax/getPlaceList.php',
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