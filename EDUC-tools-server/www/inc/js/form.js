/*
This file is part of EDUC-tools-editor.
    EDUC-tools-editor is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    EDUC-tools-editor is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with EDUC-tools-editor. If not, see <http://www.gnu.org/licenses/>.
*/
$(window).load(function() {
	formApp = (function() {
	var self = {};

/************
PRIVATE VAR
*************/
	var $form = $('#dialog_edit_form');
	var $formButt = $form.find('input[type=submit]');

	var _reg = {
		'nom' : /.{2,30}/,
		'nom_projet' :/.{2,30}/,
		//[ a-zA-Z0-9_\-éèçàöüäôûâêëùîï+ÄÂÀÈÉÇÔÛÎÊÖÜÏË\#\€\$\%()]
		'numero' : /^[0-9]{1,2}$/,
		'phone' : /^[0-9]{3,10}$/,
		'email' : /.{5,}/,
		'url' : /.{0,150}$/,
		'version' : /^[0-9]{1,3}$/,
		'titre' : /.{2,100}$/,
		'description' : /.{0,150}$/,
		'texte' : /.{5,4096}/,
		'ftexte' : /.{5,4096}/,
		'select' : /.{1,30}/,
		'authors' : /.{3,100}$/,
		'file_id' : /^(__file)/
	};

	var _tip = {
		'nom' : '2 à 30 caractères',
		'numero' : '1 à 99',
		'description' : '5 à 150 caractères'
	};

/*************
PRIVATE FUN
**************/
	function _colorInput(el, sens) {
		if(typeof sens != 'boolean' || typeof el != 'object')
			return false;

		if(sens == true) {
			el.removeClass('invalidInput').addClass('validInput');
		}else {
			el.removeClass('validInput').addClass('invalidInput');
		}
	}

	function _getInput (id) {
		var el = $form.find('#'+id);
		if(el.length == 0 || el.length > 1)
			return false;

		return el;
	}
	function _getInputData (el) {
		if(typeof el != 'object')
			return false;

		return el.val();
	}

/************
PUBLIC FUN
*************/
	self.init = function () {
		$form.bind('submit', eventsApp.clickForm);
	};

	self.getButt = function () {
		var id = $formButt.prop('id');
		if(id.length == 0)
			return false;

		return id;
	};
	self.setButt = function (id) {
		if(typeof id != 'string')
			return false;
		if(id.length == 0)
			return false;

		$formButt.prop('id', id);
	};

	self.checkData = function (data) {
		if(typeof data == 'undefined')
			return false;

		var r = true, el;
		for(var input in data) {
			if(_reg['file_id'].test(input) == true) {
				data['__file'] = document.querySelector('#dialog_edit_form #__file')
					.files[0];
				continue;
			}
			if(data[input][0] == 'checkbox') {
				if(_getInput(input).prop('checked') == true) {
					data[input] = 'yes';
				}else {
					delete data[input];
				}
				continue;
			}
			//Le type existe bien : erreur mais false ???
			if(typeof _reg[data[input][0]] == 'undefined') {
				continue;
			}
			el = _getInput(input);
			if(el === false) {
				utils.addERR('Champs '+input+' inconnu');
				return false;
			}
			var txt = _getInputData(el);
			if(_reg[data[input][0]].test(txt) == false) {
				_colorInput(el, false);
				//Obligatoire
				if(data[input][1] == true)
					r = false;
			}else {
				_colorInput(el, true);
			}
			data[input] = txt;
			delete el;
		}
		if(r === false)
			return false;

		return data;
	};

	self.newInput = function (type, label, id, value, tooltip, require, options) {
		if(value !== undefined)
			value = utils.htmlToText(value);

		var input;
		if(type == 'textarea'){
			input = $('<textarea>', {id:id, name:id});
			input.val(value);
			if(options === true) {
				input.addClass('bigTextarea');
			}
		}
		else if(type == 'select'){
			if(options === undefined) //options
				return false;

			input = $('<select>', {id:id, name:id});
			var option;
			for(var opt in options) {
				//options[opt] = text, opt = value
				option = $('<option>', {value:opt});
				if(value == opt)
					option.attr('selected', 'true');
				option.text(options[opt]);
				input.append(option);
				delete option;
			}

		}
		else if(type == 'checkbox') {
			input = $('<input>', {id:id, name:id, type:type});
			if(value == 'false')
				input.removeAttr('checked');
			else
				input.attr('checked', 'checked');
		}
		else if(type == 'gap') {//Séparation
			dialogApp.getEdit().append($('<hr>'));
		}
		else { //Autres : text, number, file, url, hidden etc...
			input = $('<input>', {id:id, name:id, type:type});
			input.val(value);
		}

		var $label = '', req = '';
		if(require === true) {
			req = '<span class="require">*</span>';
		}
		if(type != 'hidden' && type != 'gap')
			$label = $('<label>', {for:id, html: label+req+' :'});

		if(tooltip !== undefined) {
			input.prop('title', tooltip);
		}else {
			if(_tip[id] !== undefined) {
				input.prop('title', _tip[id]);
			}
		}

		dialogApp.getEdit().append($label).append(input);
		delete $label; delete input;
	}

	//Return publics funs and vars
	return self;
})();
});