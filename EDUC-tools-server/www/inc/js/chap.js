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
	chapApp = (function() {
	var self = {};

/************
PRIVATE VAR
*************/
	var $chap = {
		div : $('#chap'),
		liste : $('#chap_list'),
		action : $('#chap_action'),
		rap : $('#chap_rap')
	}

	//Chapitre actuellement sélectionnée (0 = aucun)
	var _currChap = 0;


/*************
PRIVATE FUN
**************/
	function _addChapToHTML(json) {
		var $li, $span;

		//On crée l'élément html
		$li = $('<li>', {id:'chap_'+json.numero, class:'elems'});
		$span = $('<span>', {class:'listeTitle'});
		$span.text(utils.htmlToText(json.nom))
		$li.append($span);
		$li.prop('title', utils.htmlToText(json.description));

		if(json.image == undefined || json.image.length == 0) {
			if(json.numero == 0) {
				$li.css('background-image',
				'url(\'img/icons/general_part.png\')');
			}else { //Ne doit jamais arriver
				$li.css('background-image',
				'url(\'img/icons/folder_part.png\')');
			}

			$li.css('background-size', '40%');
		}else {
			$li.css('background-image',
				'url(\''+utils.path('root')+'/projet_'+projectApp.getNum()
					+'/partie_'+partApp.getNum()+'/chapitre_'+json.numero
					+'/'+json.image+'?d='
					+new Date().getTime()+'\')');
			$li.css('background-size', '80%');
		}

		var nb_new = utils.cleanInt(json.numero);

		//Tri selon numéro
		$chap.liste.find('li').each(function () {
			var $el = $(this);

			//Vide
			if($el.prop('id').indexOf('_add') !== -1) {
				if($el.next().length == 0) {
					$el.after($li);
					return false; //break
				}else {
					//Sinon saute add
					return true;
				}
			}

			//Bonne place ?
			var nb_curr = utils.cleanInt(jQueryUtils.getID($el));
			if(nb_new <= nb_curr) {
				$el.before($li);
				return false; //break
			}

			//Dernier
			if($el.next().length == 0) { //Dernier
				$el.after($li);
				return false;
			}

			return true;
		});


		delete $span, $li;
	}

	function _initChapListeHTML(dirs) {
		if(typeof dirs != 'string')
			return false;

		dirs = dirs.split('#');

		$chap.liste.find('li').each(function () {
			if(($(this).prop('id')).indexOf('_add') !== -1 ||
				($(this).prop('id')).indexOf('_import') !== -1)
				return;
			$(this).remove();
		});

		var r;
		for(var dir in dirs) {
			if(dirs[dir].length == 0)
				continue;
			//On récupère le fichier json
			r = jQueryUtils.getJSON('EDUC-tools/projet_'+projectApp.getNum()
				+'/partie_'+partApp.getNum()
				+'/'+dirs[dir]+'/config.json');
			if(r === false)
				break;

			_addChapToHTML(r);
		}
		if(r === false)
			return false;

		return true;
	}

	function _setNum (num) {
		if(typeof num != 'number')
			return false;
		if(num % 1 != 0 || num < 0 || num > 99)
			return false;

		_currChap = num;
	}

	function _showAction () {
		$chap.action.show();
	}
	function _hideAction () {
		$chap.action.hide();
	}

	function _delChapHTML () {
		var data = 'project='+projectApp.getNum()
			+'&part='+partApp.getNum()
			+'&chap='+_currChap;
		var r = jQueryUtils.ajax(utils.script('delEl'), 'GET', data);
		//Erreur
		if(r === false) {
			utils.addERR('Impossible de supprimer le chapitre '+_currChap);
			dialogApp.errorPopup();
			return false;
		}


		$('#chap_'+_currChap).remove();
		self.unselectEl();
	}

	function _exportChap (lien) {
		$el = $('<p>');

		$el.html('Rappel : un chapitre ne peut pas être directement utilisé \
			dans l\'application. Lié le à un projet, ou exportez le projet \
			en entier.\
			<br /><br />Lien de téléchargement : ');

		$el.append($('<a>', {href:'tmp/'+lien}).text(lien));

		dialogApp.getInfo().html($el);
		delete $el;
	}

	function _editForm () {
		if(_currChap == 0){
			return false;
		}

		var r = jQueryUtils.getJSON('EDUC-tools/projet_'+projectApp.getNum()
			+'/partie_'+partApp.getNum()
			+'/chapitre_'+_currChap+'/config.json');
		if(r === false) {
			utils.addERR('Impossible de récupérer les données du chapitre '
				+_currChap);
			return false;
		}

		_makeForm(r);
	}

	function _makeForm (options) {
		var form = dialogApp.getEdit();
		//Vide la div
		form.empty();
		$('#format_butts').addClass('hide');

		options = options || {};
        _makeForm.defaults = {
            'nom' : '',
            'numero' : 1,
            'description' : '',
            'check' : 'false'
        };
        for(var opt in _makeForm.defaults) {
            if(options[opt] === undefined)
                options[opt] = _makeForm.defaults[opt];
        };

        formApp.newInput('text', 'Nom', 'nom', options['nom'], '', true);
        formApp.newInput('number', 'Numéro', 'numero', options['numero'], '', true);
        formApp.newInput('textarea', 'Description', 'description',
        	options['description']);
        formApp.newInput('file', 'Icône', '__file', '',
        	'Petite image carrée (jpg, png, gif)');
        formApp.newInput('checkbox', 'Supprimer le fond ?', 'check',
        	options['check'],
        	'Cocher pour supprimer le fond (un fond par défaut sera affiché)');
	}

	/*	Vérifie le formulaire d'envoi, retourne :
	*		Si invalide -> false
	*		Si valide -> tab des valeurs à envoyer
	*/
	function _checkForm () {
		//data -> key = id de l'input, value = type de regex
		var data = {
			'nom' : ['nom', true],
			'description' : ['description', false],
			'numero' : ['numero', true],
			'check' : ['checkbox', false],
			'__file' : ['__file', false]
		};
		if((data = formApp.checkData(data)) !== false) {
			data['project'] = projectApp.getNum();
			data['part'] = partApp.getNum();
			data['chap'] = _currChap;
			return data;
		}

		return false;
	}

	function _editChapHTML (id) {
		if(typeof id != 'string')
			return false;
		id = id.split('#');
		if(id.length <= 0 || id.length > 3)
			return false;

		var el = 'project_'+id[0];
		var path = 'projet_'+id[0];
		if(id[1] != undefined) {
			el = 'part_'+id[1];
			path = path+'/partie_'+id[1];
			if(id[2] != undefined) {
				el = 'chap_'+id[2];
				path = path+'/chapitre_'+id[2];

			}
		}

		var r = jQueryUtils.getJSON('EDUC-tools/'+path+'/config.json');
		if(r === false) {
			return false;
		}

		//edit !
		if(_currChap > 0) {
			$el = $('#chap_'+_currChap);
			self.unselectEl();
			$el.remove();
			delete $el;
		}
		_addChapToHTML(r);

		self.selectEl(utils.cleanInt(id[2]));
	}

/************
PUBLIC FUN
*************/
	self.init = function (dir) {
		if(typeof dir == 'undefined')
			return false;

		$chap.liste.unbind();
		self.unselectEl();
		//Cache l'onglet
		if(dir === false) {
			self.show(false);
			return false;
		}
		//Sinon init classique

		self.show(true);
		_setNum(0); //A chaque clic de projet on réinit

		if(dir == 0)
			dir = '0';

		var data = 'dir=projet_'+projectApp.getNum()+'/partie_'+dir
			+'&type=chapitre';

		var r = jQueryUtils.ajax(utils.script('scanDir'), 'GET', data);
		if(r === false) {
			dialogApp.errorPopup();
			return false;
		}

		//r = liste des dossiers séparés par #
		r = _initChapListeHTML(r);
		if(r === false) {
			utils.addERR('Tous les chapitres n\'ont pas pu être initialisés');
			dialogApp.errorPopup();
			return false;
		}

		//Event délégué sur les li (li = 1 project ou Créer)
		$chap.liste.bind('click', 'li', eventsApp.clickEl);
	};
	self.getNum = function () {
		return _currChap;
	};
	self.show = function (sens) {
		if(typeof sens != 'boolean')
			return false;

		if(sens === true)
			$chap.div.show();
		else
			$chap.div.hide();
	};
	self.selectEl = function (num) {
		num = utils.cleanInt(num);
		if(num == _currChap || num === undefined) {
			return false;
		}
		_setNum(num);

		$('#chap_'+num).addClass('elSelected')
			.siblings().removeClass('elSelected');

		_showAction();

		$chap.rap.text(
			$('#chap_'+num).text()
		);

		tpApp.init(_currChap);

		return 'chap';
	};
	self.unselectEl = function () {
		tpApp.init(false);
		_setNum(0);
		_hideAction();
		$chap.rap.text('');
		$('#chap_add').siblings().removeClass('elSelected');
	}
	self.delEl = function () {
		if(_currChap == 0)
			return false;

		return {
			ancre : 'chap',
			fun : _delChapHTML,
			titre : 'le chapitre '+_currChap
		};
	};
	self.exportEl = function () {
		if(_currChap == 0) {
			return false;
		}

		return {
			titre : 'Chapitre '+_currChap,
			data : 'project='+projectApp.getNum()
				+'&part='+partApp.getNum()
				+'&chap='+_currChap,
			success : _exportChap,
		};
	}
	self.addEl = function () {
		self.unselectEl();
		_makeForm();
		return ['chap', 'Créer un chapitre'];
	};
	self.editEl = function () {
		if(_editForm() === false)
			return false;
		return ['chap', 'Éditer un chapitre'];
	}
	self.submitEl = function () {
		//Vérifier le formulaire en js
		var data = _checkForm();
		if(data === false) {
			return false;
		}

		data['__CBFUN__'] = _editChapHTML;

		return data;
	};

	function _makeImportForm (options) {
		var form = dialogApp.getEdit();
		//Vide la div
		form.empty();
		$('#format_butts').addClass('hide');

		options = options || {};
        _makeForm.defaults = {
        	'num' : ''
        };
        for(var opt in _makeForm.defaults) {
            if(options[opt] === undefined)
                options[opt] = _makeForm.defaults[opt];
        };

        formApp.newInput('number', 'Nouveau numéro', 'num', options['num'],
        	'Renommer si besoin le chapitre à importer. \
        	Laisser vide pour garder le numéro d\'origine (facultatif)');
        formApp.newInput('file', 'Chapitre à importer', '__file', '',
        	'Fichier EDUC-tools en .zip');
	}
	function _checkSubmitForm () {
		//data -> key = id de l'input, value = type de regex
		var data = {
			'num' : ['numero', false],
			'__file' : ['__file', true]
		};

		if((data = formApp.checkData(data)) !== false) {
			data['project'] = projectApp.getNum();
			data['part'] = partApp.getNum();
			return data;
		}

		return false;
	}
	self.importEl = function () {
		self.unselectEl();
		_makeImportForm();
		return ['chap', 'Importer un chapitre'];
	};
	self.submitImportEl = function () {
		var data = _checkSubmitForm();
		if(data === false) {
			return false;
		}

		data['__CBFUN__'] = _editChapHTML;

		return data;
	};

	//Return publics funs and vars
	return self;
})();
});