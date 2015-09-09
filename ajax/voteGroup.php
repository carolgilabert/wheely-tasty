<?php

	$dsn = 'mysql:dbname=wheely-tasty;host=127.0.0.1';
	$user = 'root';
	$password = '***REMOVED***';

    $dbh = new PDO($dsn, $user, $password);

    if (isset($_REQUEST['group_token']) && $_REQUEST['group_token'] != '' && 
    	isset($_REQUEST['name']) && $_REQUEST['name'] != '' && 
    	isset($_REQUEST['restaurant_id']) && $_REQUEST['restaurant_id'] != '' &&
    	isset($_REQUEST['restaurant_name']) && $_REQUEST['restaurant_name'] != '') { 

    	$group_token = $_REQUEST['group_token'];
    	$name = $_REQUEST['name'];
    	$restaurant_id = $_REQUEST['restaurant_id'];
    	$restaurant_name = $_REQUEST['restaurant_name'];

    } else {
    	echo '{"error":"Could not register vote. Missing parameters."}'; 
    }

    //first we check if the group exists and is active
    $sql = "SELECT `id` FROM `group` WHERE `token` = '$group_token' AND `active` = 1;";
    $stmt = $dbh->prepare($sql);
	$stmt->execute();
	if (!$stmt->fetch(PDO::FETCH_OBJ)) {
		echo '{"error":"Could not register vote. Group does not exist."}'; exit();
	}

	//then we check if the group + name combo is already in use
	$stmt = $dbh->prepare("SELECT `count(*)` AS `count` FROM `group` WHERE `token` = '$group_token' AND `name` = '$name';");
	$stmt->execute();
	if ($obj = $stmt->fetch(PDO::FETCH_OBJ) && $obj->count > 0) {
		echo '{"error":"Could not register vote. Name is already in use in the group."}'; exit();
	}	

	//now we register the vote in the DB
	$sql = "INSERT INTO `group_vote` (`group_token`, `name`, `restaurant_id`, `restaurant_name`) VALUES ('$group_token', '$name', '$restaurant_id', '$restaurant_name');";
    $stmt = $dbh->prepare($sql);
	if ($stmt->execute()) {
		echo '{"success":"true"}'; 
	} else {
		echo '{"error":"Could not register vote. Please try again."}'; 
	}

?>