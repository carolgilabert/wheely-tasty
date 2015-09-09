<?php

	$dsn = 'mysql:dbname=wheely-tasty;host=127.0.0.1';
	$user = 'root';
	$password = '***REMOVED***';

    $dbh = new PDO($dsn, $user, $password);

    if (isset($_REQUEST['group_token']) && $_REQUEST['group_token'] != '') { 

    	$group_token = $_REQUEST['group_token'];

    } else {
    	echo '{"error":"Could not get results. Missing parameters."}'; 
    }

    //first we check if the group exists and is active
    $sql = "SELECT `id` FROM `group` WHERE `token` = '$group_token' AND `active` = 1;";
    $stmt = $dbh->prepare($sql);
	$stmt->execute();
	if (!$stmt->fetch(PDO::FETCH_OBJ)) {
		echo '{"error":"Could not get results. Group does not exist."}'; exit();
	}

	//then we get the votes
	$stmt = $dbh->prepare("SELECT * FROM `group_vote` WHERE `group_token` = '$group_token';");
	$stmt->execute();
	if ($a = $stmt->fetchAll()) {
		echo json_encode(array('success'=>$a)); 
	} else {
		echo '{"error":"Could not register vote. Please try again."}'; 
	}

?>