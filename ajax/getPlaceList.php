<?php

	define('FACEBOOK_ACCESS_TOKEN', '***REMOVED***');
	
	if (isset($_POST['url'])) {
		$url = $_POST['url'];
	} else {
		$lat = $_POST['lat'];
		$lon = $_POST['lon'];
				
		$url = "https://graph.facebook.com/v2.3/search?q=";
		$url .= "&type=place";
		$url .= "&center=$lat,$lon";
		$url .= "&distance=5000";
		$url .= "&limit=5000";
		$url .= "&access_token=" . FACEBOOK_ACCESS_TOKEN;
	}

	$ch = curl_init();
	//set the url, number of POST vars, POST data
    curl_setopt($ch, CURLOPT_URL, $url);
    
    
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10); # timeout after 10 seconds
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); # Set curl to return the data instead of printing it to the browser.
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)"); 
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    //execute post
    $result = curl_exec($ch);
    
    //close connection
    curl_close($ch);
    
	echo $result;

?>