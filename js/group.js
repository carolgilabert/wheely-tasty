Group = function(_opt) {

}

Group.prototype.createGroup = function () {
	$.ajax({
	    url: 'ajax/createGroup.php',
	    dataType: 'json',
	    method: 'POST',
	    success: function(data) {
		    if (data.group !== undefined) {
			    modals.renderCreateGroupModal({group: data.group});
		    } else if (data.error !== undefined) {
		    	notifications.renderError(data.error);
		    } else {
			    notifications.renderError('An error has ocurred. Please try again');
		    }
	    },
	    error: function(data) {
		    notifications.renderError('An error has ocurred. Please try again');
	    }
	});
}

Group.prototype.voteGroup = function () {
	modals.renderVoteGroupModal();
}

Group.prototype.processVoteGroup = function (restaurant, _opt) {
	var opt = {
		group_token: 	false,
		name: 			false
	};
	
	opt = $.extend(opt, _opt);

	opt.restaurant_id = restaurant.id;
	opt.restaurant_name = restaurant.name;

	// console.log(opt);

	$.ajax({
	    url: 'ajax/voteGroup.php',
	    data: opt,
	    dataType: 'json',
	    method: 'POST',
	    success: function(data) {
		    if (data.success !== undefined) {
			    notifications.renderNotification('Your vote was registered correctly.');
		    } else if (data.error !== undefined) {
		    	notifications.renderError(data.error);
		    } else {
			    notifications.renderError('An error has ocurred. Please try again');
		    }
	    },
	    error: function(data) {
		    notifications.renderError('An error has ocurred. Please try again');
	    }
	});

}

Group.prototype.resultsGroup = function () {
	modals.renderGetResultsGroupModal();
}

Group.prototype.getResults = function (token) {
	var _this = this;
	$.ajax({
	    url: 'ajax/getGroupResults.php',
	    data: {group_token: token},
	    dataType: 'json',
	    method: 'POST',
	    success: function(data) {
		    if (data.success !== undefined) {
			    _this.processResults(data.success);
		    } else if (data.error !== undefined) {
		    	notifications.renderError(data.error);
		    } else {
			    notifications.renderError('An error has ocurred. Please try again');
		    }
	    },
	    error: function(data) {
		    notifications.renderError('An error has ocurred. Please try again');
	    }
	});
}

Group.prototype.processResults = function (votes) {
	var restaurants = [];
	//first we create an array of restaurant ids and their frequencies
	var found = false;
	for (var i = 0; i < votes.length; i++) {
		for (var j = 0; j < restaurants.length; j++) {
			if (restaurants[j].restaurant_id == votes[i].restaurant_id) {
				restaurants[j].frequency++;
				found = true;
			}
		};

		if (!found) {
			restaurants.push({
				restaurant_id: votes[i].restaurant_id,
				restaurant_name: votes[i].restaurant_name,
				frequency: 1
			});
		}
	};

	//then we sort this array by frequency
	restaurants.sort(function(a, b) {
	    return parseFloat(b.frequency) - parseFloat(a.frequency);
	});

	//then we get the maximum frequency
	var max_freq = restaurants[0].frequency;

	//then we make the first restaurant the winner
	var winners = [];
	for (var i = 0; i < restaurants.length; i++) {
		if (restaurants[i].frequency == max_freq) {
			winners.push(restaurants[i].restaurant_id);
		}
	};

	modals.renderResultsGroupModal({
		votes: votes,
		restaurant: winners
	});
}

group = new Group();