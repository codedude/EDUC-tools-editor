/*
Copyright « © » 2015-16 Valentin PARIS
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
	projectApp = (function() {
	var self = {};

/************
PRIVATE VAR
*************/
	var $project = {
		div : $('#project'),
		liste : $('#project_list'),
		action : $('#project_action'),
		rap : $('#project_rap')
	}

	//Projet actuellement sélectionné (0 = aucun)
	var _currProject = 0;


/*************
PRIVATE FUN
**************/
	function _addProjectToHTML(json) {
		var $li, $span;

		//On crée l'élément html
		$li = $('<li>', {id:'project_'+json.numero, class:'elems'});
		$span = $('<span>', {class:'listeTitle'});
		$span.text(utils.htmlToText(json.nom))
		$li.append($span);

		$li.prop('title', utils.htmlToText(json.description));

		if(json.image.length == 0) {
			$li.css('background-image',
				'url(\'img/icons/folder.png\')');
			$li.css('background-size', '30%');
		}else {
			$li.css('background-image',
				'url(\''+utils.path('root')+'/projet_'+json.numero+'/'
					+json.image+'?d='+new Date().getTime()+'\')');
			$li.css('background-size', '80%');
		}
		//Numéro arbritraire : pas de tri
		//Sauf si arg[1] existe
		if(typeof arguments[1] != 'undefined') {
			arguments[1].after($li);
		}
		else {
			$project.liste.append($li);
		}

		delete $span, $li;
	}

	function _initProjectListeHTML(dirs) {
		if(typeof dirs != 'string')
			return false;

		dirs = dirs.split('#');

		var r, ret, $li, $span;
		for(var dir in dirs) {
			if(dirs[dir].length == 0)
				continue;
			//On récupère le fichier json
			ret = jQueryUtils.getJSON('EDUC-tools/'+dirs[dir]+'/config.json');
			if(ret === false) {
				r = false;
				continue;
			}

			_addProjectToHTML(ret);
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

		_currProject = num;
	}

	function _showAction () {
		$project.action.show();
	}
	function _hideAction () {
		$project.action.hide();
	}

	function _delProjectHTML () {
		var data = 'project='+_currProject;
		var r = jQueryUtils.ajax(utils.script('delEl'), 'GET', data);
		//Erreur
		if(r === false) {
			utils.addERR('Impossible de supprimer le projet '+_currProject);
			dialogApp.errorPopup();
			return false;
		}

		_hideAction();
		partApp.init(false);
		$('#project_'+_currProject).remove();

		_setNum(0);
	}

	function _exportProject (lien) {
		$el = $('<p>');

		$el.html('Vous pouvez dézipper ce projet directement dans l\'application\
			 mobile\
			<br /><br />Lien de téléchargement : ');
		$el.append($('<a>', {href:'tmp/'+lien}).text(lien));

		dialogApp.getInfo().html($el);
		delete $el;
	}

	function _editForm () {
		if(_currProject == 0){
			return false;
		}

		var r = jQueryUtils.getJSON('EDUC-tools/projet_'+_currProject+'/config.json');
		if(r === false) {
			utils.addERR('Impossible de récupérer les données du projet '
				+_currProject);
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
            'numero' : 0,
            'description' : '',
            'check' : 'false',
            'type' : 1 //Hidden pour l'instant
        };
        for(var opt in _makeForm.defaults) {
            if(options[opt] === undefined)
                options[opt] = _makeForm.defaults[opt];
        };

        formApp.newInput('text', 'Nom', 'nom', options['nom'], '', true);
        formApp.newInput('textarea', 'Description', 'description',
        	options['description']);
        //pas utile pour l'instant, sinon select
        formApp.newInput('hidden', 'Type', 'type', options['type'], '', true);
        formApp.newInput('hidden', 'Numéro', 'numero', options['numero'], '', true);
        formApp.newInput('file', 'Fond d\'écran (facultatif)', '__file', '',
        	'Grand fond d\'écran 16:9ème (jpg, png, gif)');
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
			'nom' : ['nom_projet', true],
			'numero' : ['numero', true],
			'description' : ['description', false],
			'type' : ['numero', true],
			'check' : ['checkbox', false],
			'__file' : ['__file', false]
		};

		if((data = formApp.checkData(data)) !== false) {
			data['project'] = _currProject;
			return data;
		}

		return false;
	}

	function _editProjectHTML (id) {
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

		self.unselectEl();
		el = $('#'+el);
		if(el.length > 0) {
			_addProjectToHTML(r, el);
			el.unbind('click');
			el.remove();
		}
		else {
			_addProjectToHTML(r);
		}

		self.selectEl(utils.cleanInt(id[0]));
	}

/************
PUBLIC FUN
*************/
	self.init = function () {
		self.show(true);
		$project.liste.unbind();

		var data = 'dir=&type=projet';
		var r = jQueryUtils.ajax(utils.script('scanDir'), 'GET', data);
		if(r === false) {
			dialogApp.errorPopup();
			return false;
		}
		//r = liste des dossiers séparés par #
		r = _initProjectListeHTML(r);
		if(r === false) {
			utils.addERR('Tous les projets n\'ont pas pu être initialisés');
			dialogApp.errorPopup();
		}

		//Event délégué sur les li (li = 1 project ou Créer)
		$project.liste.bind('click', 'li', eventsApp.clickEl);
	};
	self.getNum = function () {
		return _currProject;
	};
	self.show = function (sens) {
		if(typeof sens != 'boolean')
			return false;

		if(sens === true)
			$project.div.show();
		else
			$project.div.hide();
	};
	self.selectEl = function (num) {
		num = utils.cleanInt(num);
		if(num == _currProject || num === undefined) {
			return false;
		}

		if(_setNum(num) === false)
			return false;

		$('#project_'+num).addClass('elSelected')
			.siblings().removeClass('elSelected');

		_showAction();

		$project.rap.text(
			$('#project_'+num).text()
		);

		partApp.init(_currProject);

		return 'header';
	};
	self.unselectEl = function () {
		partApp.init(false);
		_setNum(0);
		$project.rap.text('');
		_hideAction();
		$('#project_add').siblings().removeClass('elSelected');
	};
	self.delEl = function () {
		if(_currProject == 0)
			return false;

		return {
			ancre : 'header',
			fun : _delProjectHTML,
			titre : 'le projet '+_currProject
		};
	};
	self.exportEl = function () {
		if(_currProject == 0) {
			return false;
		}

		return {
			titre : 'Projet '+_currProject,
			data : 'project='+_currProject,
			success : _exportProject,
		};
	};
	self.addEl = function () {
		self.unselectEl();
		_makeForm();
		return ['header', 'Créer un projet'];
	};
	self.editEl = function () {
		if(_editForm() === false)
			return false;
		return ['header', 'Éditer un projet'];
	};
	self.submitEl = function () {
		//Vérifier le formulaire en js
		var data = _checkForm();
		if(data === false) {
			return false;
		}

		data['__CBFUN__'] = _editProjectHTML;

		return data;
	};


	function _makeImportForm (options) {
		var form = dialogApp.getEdit();
		//Vide la div
		form.empty();
		$('#format_butts').addClass('hide');

		options = options || {};
        _makeForm.defaults = {
        };
        for(var opt in _makeForm.defaults) {
            if(options[opt] === undefined)
                options[opt] = _makeForm.defaults[opt];
        };

        formApp.newInput('file', 'Projet à importer', '__file', '',
        	'Fichier EDUC-tools en .zip');
	}
	function _checkSubmitForm () {
		//data -> key = id de l'input, value = type de regex
		var data = {
			'__file' : ['__file', true]
		};

		if((data = formApp.checkData(data)) !== false) {
			return data;
		}

		return false;
	}
	self.importEl = function () {
		self.unselectEl();
		_makeImportForm();
		return ['header', 'Importer un projet'];
	};
	self.submitImportEl = function () {
		var data = _checkSubmitForm();
		if(data === false) {
			return false;
		}

		data['__CBFUN__'] = _editProjectHTML;

		return data;
	};

	//Return publics funs and vars
	return self;
})();
});