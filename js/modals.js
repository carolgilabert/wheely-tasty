Modals = function(_opt) {

}

Modals.prototype.renderPostcodeModal = function (_opt) {
	var opt = {
		referer: 	false
	};

	opt = $.extend({}, opt, _opt);
	var modalClose = function() {
		$('.overlay').remove();
		$('.modal').remove();

		if (typeof opt !== 'undefined' && opt.referer && opt.referer == 'no-location') {
			wheel.renderLoading('Your location could no be determined. Please click Search by Postcode to continue.', false);
		}
	};

	var dialogAction = 	function() { 
		googleGeocoding.codePostcode($('#postcode').val()); 
		wheel.closeInfo();
		$(wheel.canvas).hide();
	}

	var modalOpt = {
		title: 'Search by Postcode',
		close: modalClose,
		buttonText: 'Search',
		action: dialogAction
	};

	var modalBody = $('<div>', {class: 'modal-body'});
	if (typeof opt !== 'undefined' && opt.referer && opt.referer == 'no-location') {
		modalBody.append($('<p>', {class: 'text-danger', text: 'There was issue determining your location.'}));	
	}
	modalBody.append($('<p>', {text: 'Please enter your postcode below:'}));
	modalBody.append($('<input>', {type: 'text', id: 'postcode'}));
	modalBody.append($('<span>', {class: 'help-block', text: 'If the postcode is from outside the UK, please also include your city name for accurate results.'}));
	modalOpt.body = modalBody;

	this.renderModal(modalOpt);
}

Modals.prototype.renderCreateGroupModal = function (_opt) {
	var opt = {
		group: 	false
	};
	
	opt = $.extend(opt, _opt);

	var modalClose = function() {
		$('.overlay').remove();
		$('.modal').remove();
	};

	var modalOpt = {
		title: 'Create a voting group',
		close: modalClose,
		buttonText: 'OK',
		action: modalClose
	};

	var modalBody = $('<div>', {class: 'modal-body'});
	modalBody.append($('<p>', {text: 'The token for your group is:'}));
	modalBody.append($('<div>', {class: 'well', text: opt.group}));
	modalBody.append($('<span>', {class: 'help-block', text: 'To vote in this group, please select the Vote in a Group option from the menu and enter this token.'}));
	modalBody.append($('<span>', {class: 'help-block', text: 'Groups expire in 24 hours.'}));
	modalOpt.body = modalBody;

	this.renderModal(modalOpt);
}

Modals.prototype.renderVoteGroupModal = function () {
	var modalClose = function() {
		$('.overlay').remove();
		$('.modal').remove();
	};

	var modalAction = function() {
		var data = {
			group_token: $('#group_token').val(),
			name: $('#name').val()
		};

		wheel.loadRestaurants({
			method: $('input[name=use]:checked').val(),
			postcode: $('#postcode_val').val(),
			return_fn: group.processVoteGroup,
			return_data: data
		});

		modalClose();
	};

	var modalOpt = {
		title: 'Vote in a group',
		close: modalClose,
		buttonText: 'Vote',
		action: modalAction
	};

	var modalBody = $('<div>', {class: 'modal-body'});
	modalBody.append($('<p>', {text: 'Please enter the following details:'}));
	modalBody.append($('<div>', {class: 'form-group clearfix'}) .append($('<label>', {for: 'group_token', class: "col-lg-4 control-label", text: 'Group token:'})) .append($('<div>', {class: 'col-lg-8'}) .append($('<input>', {type: 'text', class: 'form-control', id: 'group_token'}))));
	modalBody.append($('<div>', {class: 'form-group  clearfix'}) .append($('<label>', {for: 'name', class: "col-lg-4 control-label", text: 'Name:'})) .append($('<div>', {class: 'col-lg-8'}) .append($('<input>', {type: 'text', class: 'form-control', id: 'name'}))));
	modalBody.append($('<p>', {text: 'Choose the search method:'}));
	modalBody.append(
		$('<div>', {class: 'form-group  clearfix'}) 
			.append(
				$('<div>') 
					.append($('<label>', {for: 'location', text: 'Location:', class: 'col-lg-2 control-label'}))
					.append(
						$('<div>', {class: 'col-lg-2'}) 
						.append($('<input>', {type: 'radio', name: 'use', id: 'location', value: 'location'}))
					)
					.append($('<label>', {for: 'location', text: 'Postcode:', class: 'col-lg-2 control-label'}))
					.append(
						$('<div>', {class: 'col-lg-2'}) 
						.append($('<input>', {type: 'radio', name: 'use', id: 'postcode', value: 'postcode'}))
					)
					.append(
						$('<div>', {class: 'col-lg-4'}) 
						.append($('<input>', {type: 'text', class: 'form-control', id: 'postcode_val', placeholder: 'Postcode'}))
					)
			)  
	);
	modalOpt.body = modalBody;

	this.renderModal(modalOpt);
}

Modals.prototype.renderGetResultsGroupModal = function (_opt) {
	var modalClose = function() {
		$('.overlay').remove();
		$('.modal').remove();
	};

	var modalOpt = {
		title: 'View group results',
		close: modalClose,
		buttonText: 'OK',
		action: function() {
			group.getResults($('#group_token').val());
		}
	};

	var modalBody = $('<div>', {class: 'modal-body'});
	modalBody.append($('<p>', {text: 'Please enter your group token:'}));
	modalBody.append($('<input>', {type: 'text', id: 'group_token'}));
	modalOpt.body = modalBody;

	this.renderModal(modalOpt);
}

Modals.prototype.renderResultsGroupModal = function (_opt) {
	var _this = this;
	var opt = {
		votes: 		false,
		restaurant: false
	};

	opt = $.extend({}, opt, _opt);

	var modalClose = function() {
		$('.overlay').remove();
		$('.modal').remove();
	};

	var breakTie = function () {
		var winner = Math.floor(Math.random() * ((opt.restaurant.length-1) - 0 + 1)) + 0;
		modalClose();
		_this.renderResultsGroupModal({
			votes: opt.votes,
			restaurant: [opt.restaurant[winner]]
		});
	};

	var modalOpt = {
		title: 'View group results',
		close: modalClose,
		buttonText: 'OK',
		action: modalClose
	};

	var modalBody = $('<div>', {class: 'modal-body'});
	modalBody.append($('<p>', {text: 'The chosen restaurant for your group is:'}));
	var rest_name = opt.restaurant.length === 1 ? '' : "It's a tie! Click here to break the tie.";
	var well = $('<div>', {class: 'well', text: rest_name});
	if (opt.restaurant.length > 1) {
		well.click(breakTie);
	}
	modalBody.append(well);
	var table = $('<table>', {class: "table table-striped table-hover "})
		.append(
			$('<tr>') 
				.append($('<th>') .append('Name')) 
				.append($('<th>') .append('Restaurant'))
		);
	modalBody.append(table);

	for (var i = 0; i < opt.votes.length; i++) {
		var class_row;
		if (opt.restaurant.indexOf(opt.votes[i].restaurant_id) !== -1) {
			if (opt.restaurant.length === 1) {
				well.text(opt.votes[i].restaurant_name);
				class_row = 'success';	
			} else {
				class_row = 'warning';	
			}
		} else {
			class_row = 'danger';
		}

		table.append(
			$('<tr>', {class: class_row}) 
				.append($('<td>') .append(opt.votes[i].name)) 
				.append($('<td>') .append(opt.votes[i].restaurant_name))
		);

	};
	modalOpt.body = modalBody;

	modalClose();
	this.renderModal(modalOpt);
}

Modals.prototype.renderModal = function (_opt) {
	wheel.closeInfo();

	var opt = {
		title: 			false,
		close: 			function() { $('.overlay').remove(); $('.modal').remove(); },
		buttonText: 	'Submit',
		action: 		false,
		body: 			false
	};
	
	opt = $.extend(opt, _opt);

	var _this = this;
	$('body').append($('<div>', {class: 'overlay'}));
	var modal = $('<div>', {class: 'modal'});
	var modalDialog = $('<div>', {class: 'modal-dialog'});
	var modalContent = $('<div>', {class: 'modal-content'});

	//Header
	var modalHeader = $('<div>', {class: 'modal-header'});
	modalHeader.append($('<button>', {class: 'close', type: 'button', text: 'x'}) .attr('data-dismiss', 'modal') .attr('aria-hidden', 'true') .click(opt.close));
	modalHeader.append($('<h4>', {class: 'modal-title', text: opt.title}));
	//Body
	var modalBody = opt.body;
	//Footer
	var modalFooter = $('<div>', {class: 'modal-footer'});
	modalFooter.append($('<button>', {type: 'button', class: 'btn btn-primary', text: opt.buttonText}) .click(opt.action));

	modalContent.append(modalHeader);
	modalContent.append(modalBody);
	modalContent.append(modalFooter);
	modalDialog.append(modalContent);
	modal.append(modalDialog);
	$('body').append(modal);
	$('modal').show();	
}

modals = new Modals();