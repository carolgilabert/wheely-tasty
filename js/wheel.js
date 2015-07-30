//-- Constructs a Wheel object
Wheel = function(_opt) {
	//stores the context of the wheel object
	_this = this;
	
	var opt = {
		canvas: false,
		button: false
	};
	
	opt = $.extend(opt, _opt);
	
	//-- Init external properties
	this.canvas = opt.canvas;
	this.button = opt.button;
	
	//-- Init main properties	
	this.restaurants = false;
	this.colours = false;
	
	this.init();
} 

//-- Initialises some aspects of the application
Wheel.prototype.init = function () {
	this.initFacebookSDK();
	this.loadRestaurants(); 
	//once the restaurants have been loaded the wheel will be rendered on a callback
	
	//Bind the spin button
	if (this.button !== false) {
		$(this.button).click(this.spin);
	}
}

//-- Initialises the mathematical values for the wheel calculations once the other data has been loaded
Wheel.prototype.initWheelValues = function () {
	var slots = this.restaurants.length;

	this.startAngle = 0;
	this.arc = (2*Math.PI) / slots;
	this.spinTimeout = null;
	this.spinArcStart = 10;
	this.spinTime = 0;
	this.spinTimeTotal = 0; 
	this.ctx;
	
	this.colours = [];
	for (var i = 0; i < slots; i++) {
		_this.colours.push(_this.getColour());
	}
	
	_this.drawRouletteWheel();
}

//-- Obtains the user's location and fetches the restaurant data from Facebook
Wheel.prototype.loadRestaurants = function () {
	//First we get the user's location
	if(navigator.geolocation){ 
		navigator.geolocation.getCurrentPosition(_this.fetchData);
	} else {
		console.log("no location");
		//TODO - prompt the user for his postcode and get location from there (google geocoding API)
	}
}

//-- Aux function that returns a random hex colour
Wheel.prototype.getColour = function() {
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

  
Wheel.prototype.drawRouletteWheel = function() {
  if (_this.canvas === false) { return false; }
  if (_this.canvas.getContext) {
  	var slots = this.restaurants.length;

    var outsideRadius = 200;
    var textRadius = 160;
    var insideRadius = 125;
    
    _this.ctx = _this.canvas.getContext("2d");
    _this.ctx.clearRect(0,0,500,500);
    
    
    _this.ctx.strokeStyle = "black";
    _this.ctx.lineWidth = 2;
    
    _this.ctx.font = 'bold 12px sans-serif';
        
    for(var i = 0; i < slots; i++) {
      var angle = _this.startAngle + i * _this.arc;
      _this.ctx.fillStyle = _this.colours[i];
      
      _this.ctx.beginPath();
      _this.ctx.arc(250, 250, outsideRadius, angle, angle + _this.arc, false);
      _this.ctx.arc(250, 250, insideRadius, angle + _this.arc, angle, true);
      _this.ctx.stroke();
      _this.ctx.fill();
      
      _this.ctx.save();
      _this.ctx.shadowOffsetX = -1;
      _this.ctx.shadowOffsetY = -1;
      _this.ctx.shadowBlur    = 0;
      _this.ctx.shadowColor   = "rgb(220,220,220)";
      _this.ctx.fillStyle = "black";
      _this.ctx.translate(250 + Math.cos(angle + _this.arc / 2) * textRadius, 250 + Math.sin(angle + _this.arc / 2) * textRadius);
      _this.ctx.rotate(angle + _this.arc / 2 + Math.PI / 2);
      var text = _this.restaurants[i].name;
      _this.ctx.fillText(text, -_this.ctx.measureText(text).width / 2, 0);
      _this.ctx.restore();
    } 
    
    //Arrow
    _this.ctx.fillStyle = "black";
    _this.ctx.beginPath();
    _this.ctx.moveTo(250 - 4, 250 - (outsideRadius + 5));
    _this.ctx.lineTo(250 + 4, 250 - (outsideRadius + 5));
    _this.ctx.lineTo(250 + 4, 250 - (outsideRadius - 5));
    _this.ctx.lineTo(250 + 9, 250 - (outsideRadius - 5));
    _this.ctx.lineTo(250 + 0, 250 - (outsideRadius - 13));
    _this.ctx.lineTo(250 - 9, 250 - (outsideRadius - 5));
    _this.ctx.lineTo(250 - 4, 250 - (outsideRadius - 5));
    _this.ctx.lineTo(250 - 4, 250 - (outsideRadius + 5));
    _this.ctx.fill();
  }
}
  
Wheel.prototype.spin =  function() {
  spinAngleStart = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = Math.random() * 3 + 4 * 1000;
  _this.rotateWheel();
}
  
Wheel.prototype.rotateWheel = function() {
  spinTime += 30;
  if(spinTime >= spinTimeTotal) {
    _this.stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - _this.easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  _this.startAngle += (spinAngle * Math.PI / 180);
  _this.drawRouletteWheel();
  spinTimeout = setTimeout('_this.rotateWheel()', 30);
}
  
Wheel.prototype.stopRotateWheel = function() {
  clearTimeout(spinTimeout);
  var degrees = _this.startAngle * 180 / Math.PI + 90;
  var arcd = _this.arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  _this.ctx.save();
  _this.ctx.font = 'bold 30px sans-serif';
  var text = _this.restaurants[index].name;
  _this.ctx.fillText(text, 250 - _this.ctx.measureText(text).width / 2, 250 + 10);
  _this.ctx.restore();
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

Wheel.prototype.fetchData = function (position, url) {
	var data = {
	    lat: position.coords.latitude,
	    lon: position.coords.longitude
	};
	
	if (url !== undefined) { data.url = url; }
	
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
			restaurants.push(result[i]);
		} else {
			for (var j = 0; j < result[i].category_list.length; j++) {
				if (result[i].category_list[j].name.toLowerCase().indexOf('restaurant') != -1) {
					restaurants.push(result[i]);
					break;
				}
			}
		}
	}
	//TODO - if we have less than 20 restaurants and data.paging.next is defined, call it and keep filling the array
	_this.restaurants = restaurants;
	_this.initWheelValues();
}