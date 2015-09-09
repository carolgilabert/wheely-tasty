Notifications = function() {

}

Notifications.prototype.renderNotification = function (message) {
	var div = $('<div>', {class: "alert alert-dismissible alert-success"});
	div.append($('<button>', {type: 'button', class: 'close', text: 'x'}) .attr('data-dismiss', 'alert'));
	div.append($('<p>', {text: message}));

	$('body').append(div);
}

Notifications.prototype.renderError = function (message) {
	var div = $('<div>', {class: "alert alert-dismissible alert-danger"});
	div.append($('<button>', {type: 'button', class: 'close', text: 'x'}) .attr('data-dismiss', 'alert'));
	div.append($('<p>', {text: message}));

	$('body').append(div);
}

notifications = new Notifications();