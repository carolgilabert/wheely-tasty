<?php

	$dsn = 'mysql:dbname=wheely-tasty;host=127.0.0.1';
	$user = 'root';
	$password = '***REMOVED***';

    $dbh = new PDO($dsn, $user, $password);

    //first we do some cleanup of groups older than 24h
    group_cleanup();

    //then we get the first available group and return it to our user
    $stmt = $dbh->prepare("SELECT * FROM `group` WHERE `active` IS NULL AND `created` IS NULL LIMIT 1;");
	$stmt->execute();
	$group = $stmt->fetch(PDO::FETCH_OBJ);
	if ($group) {
		//now we need to set a creation date for the group
		$stmt = $dbh->prepare("UPDATE `group` SET `active` = 1, `created` = NOW() WHERE `id` = ".$group->id." ;");
		$stmt->execute();
		echo '{"group":"'.$group->token.'"}'; 
	} else {
		echo '{"error":"Could not retrieve a group"}'; 
	}

    function group_cleanup() {
    	global $dbh;

	    $cutting_date = date_create('now');
	    $cutting_date = date_sub($cutting_date, date_interval_create_from_date_string('1 day'));
		$stmt = $dbh->prepare("SELECT * FROM `group`;");
		$stmt->execute();
		$groups = $stmt->fetchAll(PDO::FETCH_OBJ);
		$ids_to_clear = array();
		for ($i = 0; $i < count($groups); $i++) {
			$group = $groups[$i];
			if ($group->active == 1 && $group->created != NULL) {
				if (strtotime($group->created) < $cutting_date->getTimestamp()) {
					$ids_to_clear[] = ++$i;
				}
			}
		}
		//first we deactivate the groups
		$stmt = $dbh->prepare("UPDATE `group` SET `active` = NULL, `created` = NULL WHERE `id` IN (".implode(',',$ids_to_clear).");");
		$stmt->execute();
		
		//then we delete the votes attached to them
		$stmt = $dbh->prepare("DELETE FROM `group_vote` WHERE `id` IN (".implode(',',$ids_to_clear).");");
		$stmt->execute();
	}

?>