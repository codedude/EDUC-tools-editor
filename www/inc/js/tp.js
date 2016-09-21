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
	tpApp = (function() {
	var self = {};

/************
PRIVATE VAR
*************/
	var $tp = {
		div : $('#tp'),
		mod : $('#tp_mod'),
		core : $('#tp_core'),
		contact : $('#tp_contact'),
		contact_list : $('#tp_contact_list'),
		source : $('#tp_source'),
		source_list : $('#tp_source_list'),
		author : $('#tp_author'),
		author_list : $('#tp_author_list')
	}

	//FIX : tableau d'équivalence pour les modules (move)
	var equiv = {};

	function _getEquiv(num) {
		if(equiv[num])
			return equiv[num];
	}
	function _setEquiv(num, pNew) {
		equiv[num] = pNew;
	}

	//Récupère les fonctions pour gérer les modules
	var _formFuns = inputTP().funs;
	const MAKE = 0, CHECK = 1, PRINT = 2;

/*************
PRIVATE FUN
**************/
	function _makeBlocHTML (json, num) {
		num = num.substring(1);

		var $el = _formFuns[json.type][PRINT](json);
		var $div = $('<div>', {id:'tp_'+json.type+'_'+num});
		$div.append(($('<section>').append($el)));

		var $header = $('<header>');
		$header.append($('<h3>', {text:'Module '+json.type+'('+num+')'}));
		var $butts = $('<div>', {class:'mod_span'});
		$butts.append($('<span>', {id:'tp_up_'+json.type+'_'+num}))
			.append($('<span>', {id:'tp_down_'+json.type+'_'+num}))
			.append($('<span>', {id:'tp_edit_'+json.type+'_'+num}))
			.append($('<span>', {id:'tp_del_'+json.type+'_'+num}));
		$butts.bind('click', 'span', eventsApp.clickEl);

		$header.append($butts);

		$div.prepend($header);

		delete $el, $header, $butts;
		return $div;
	}

	function _makeContactHTML (json, num) {
		num = num.substring(1);

		var $el = _formFuns[json.type][PRINT](json);
		var $li = $('<li>', {id:'tp_'+json.type+'_'+num});

		var $header = $('<header>');
		var $butts = $('<div>', {class:'mod_span'});
		$butts.append($('<span>', {id:'tp_edit_'+json.type+'_'+num}))
			.append($('<span>', {id:'tp_del_'+json.type+'_'+num}));
		$butts.bind('click', 'span', eventsApp.clickEl);

		$header.append($('<h3>', {text:'Contact('+num+')'}))
			.append($butts);

		$li.append($header);
		$li.append($el);

		delete $butts, $header, $el;
		return $li;
	}
	function _makeSourceHTML (json, num) {
		num = num.substring(1);

		var $el = _formFuns[json.type][PRINT](json);
		var $li = $('<li>', {id:'tp_'+json.type+'_'+num});

		var $header = $('<header>');
		var $butts = $('<div>', {class:'mod_span'});
		$butts.append($('<span>', {id:'tp_edit_'+json.type+'_'+num}))
			.append($('<span>', {id:'tp_del_'+json.type+'_'+num}));
		$butts.bind('click', 'span', eventsApp.clickEl);

		$header.append($('<h3>', {text:'Source('+num+')'}))
			.append($butts);

		$li.append($header);
		$li.append($el);

		delete $butts, $header, $el;
		return $li;
	}
	function _makeAuthorHTML (json, num) {
		num = num.substring(1);

		var $el = _formFuns[json.type][PRINT](json);
		var $li = $('<li>', {id:'tp_'+json.type+'_'+num});

		var $header = $('<header>');
		var $butts = $('<div>', {class:'mod_span'});
		$butts.append($('<span>', {id:'tp_edit_'+json.type+'_'+num}))
			.append($('<span>', {id:'tp_del_'+json.type+'_'+num}));
		$butts.bind('click', 'span', eventsApp.clickEl);

		$header.append($('<h3>', {text:'Auteur('+num+')'}))
			.append($butts);

		$li.append($header);
		$li.append($el);

		delete $butts, $header, $el;
		return $li;
	}

	function _addModToHTML(json, num) {
		if(_formFuns[json.type] === undefined) {
			utils.addERR('Tentative d\'ajout de module inconnu');
			return false;
		}

		//Créer l'élément à ajouter
		var $bloc, $toAppend;
		switch(json.type) {
			case 'contact':
				$bloc = _makeContactHTML(json, num);
				$toAppend = $tp.contact_list;
				break;
			case 'source':
				$bloc = _makeSourceHTML(json, num);
				$toAppend = $tp.source_list;
				break;
			case 'author':
				$bloc = _makeAuthorHTML(json, num);
				$toAppend = $tp.author_list;
				break;

			//modules classiques
			default:
				$bloc = _makeBlocHTML(json, num);
				$toAppend = $tp.core;
				break;
		}

		//Vérifie si il existe (ajout ou remplacement)
		var id = 'tp_'+json.type+'_'+num.substring(1);
		var $old = $('#'+id);
		if($old.length == 0) {
			$toAppend.append($bloc);
			if(json.type != 'contact' && json.type != 'author' && json.type != 'source')
				_setEquiv(num, num); //Nouveau
		}else {
			$old.after($bloc).remove();
		}
		delete $old;
		delete $bloc;
	}

	function _initTpHTML(json) {
		if(typeof json == 'undefined')
			return false;

		//Vide les div/ul
		$tp.contact_list.empty();
		$tp.core.empty();

		var ret = true;
		//Affiche les mod de tp
		for(var mod in json.tp) {
			if(_addModToHTML(json.tp[mod], mod) === false)
				ret = false;
		}
		//Affiche info.json
		var url = utils.path('root')+'/projet_'+projectApp.getNum()
			+'/res/info.json';
		var r = jQueryUtils.getJSON(url);
		if(r === false) {
			return false;
		}

		var mods = ['contact', 'source', 'author'];
		for(var mod in mods) {
			var mod = mods[mod];
			for(var field in r[mod]) {
				if(_addModToHTML(r[mod][field], field) === false)
					ret = false;
			}
		}
		if(ret === false) {
			return false;
		}

		return true;
	}

	function _CURRY_delTpHTML(type, num) {
		return (function () {
			var mod_equiv = _getEquiv('k'+num).substring(1);
			var data = 'project='+projectApp.getNum()
			+'&part='+partApp.getNum()
			+'&chap='+chapApp.getNum()
			+'&type='+type+'&mod='+mod_equiv;
			var r = jQueryUtils.ajax(utils.script('delMod'), 'GET', data);
			if(r === false) {
				utils.addERR('Impossible de supprimer le module '
					+type+'('+num+')');
				dialogApp.errorPopup();
				return false;
			}

			equiv[_getEquiv('k'+num)] = undefined;
			delete equiv[_getEquiv('k'+num)];
			$('#tp_'+type+'_'+num).remove();
		});
	}

	function _editTpHTML (id, type, num) {
		id = id.split('_');

		if(id.length != 2) {
			return false;
		}

		if(id[0] == 'contact' || id[0] == 'source' || id[0] == 'author') {
			var jPath = 'EDUC-tools/projet_'+projectApp.getNum()+'/res/info.json';
		}else if(id[0] == 'tp'){
			var jPath = 'EDUC-tools/projet_'+projectApp.getNum()
			+'/partie_'+partApp.getNum()
			+'/chapitre_'+chapApp.getNum()+'/tp.json';
		}
		else { //ne doit pas arriver
			return false;
		}
		var r = jQueryUtils.getJSON(jPath);
		if(r === false) {
			return false;
		}
		//Attention ! le num est celui du serveur, pas du js !!!
		var j_equiv;
		if(_getEquiv(id[1]) == undefined) {
			j_equiv = id[1];
		}else {
			for(var el in equiv) {
				j_equiv = id[1];
				if(equiv[el] == id[1]) {
					id[1] = el;
					break;
				}
			}
		}

		r = r[id[0]];
		//contient juste l'élément à afficher
		//pas d'équiv pour la 1ere fois !!!
		_addModToHTML(r[j_equiv], id[1]);
	}

	function _moveEl (type, num, sens) {
		var $old_el = $('#tp_'+type+'_'+num);
		var $new_el;
		switch(sens) {
			case 'up':
				$new_el = $old_el.prev();
				break;

			case 'down':
				$new_el = $old_el.next();
				break;

			default:
				return false;
		}

		//Extrémités
		var id = $new_el.prop('id');
		if(id === undefined) {
			return true;
		}

		id = id.split('_');
		if(id.length != 3) {
			return false;
		}
		var mod_equiv = _getEquiv('k'+num).substring(1);
		var new_equiv = _getEquiv('k'+id[2]).substring(1);
		var data = 'project='+projectApp.getNum()
			+'&part='+partApp.getNum()
			+'&chap='+chapApp.getNum()
			+'&type='+type+'&mod='+mod_equiv+'&new='+new_equiv;

		var r = jQueryUtils.ajax(utils.script('moveMod'), 'GET', data);
		if(r === false) {
			utils.addERR('Impossible de déplacer le module '+type+'('+num+')');
			return false;
		}
		//Echange dans equiv
		var tmp = _getEquiv('k'+num);
		_setEquiv('k'+num, _getEquiv('k'+id[2]));
		_setEquiv('k'+id[2], tmp);

		$old_el.remove();
		if(sens == 'up') {
			$new_el.before($old_el);
		}
		else {
			$new_el.after($old_el);
		}

		$old_el.find('.mod_span').bind('click', 'span', eventsApp.clickEl);

		delete $old_el, $new_el;
	}

/******
FORM
*******/
	/*	Vérifie le formulaire d'envoi, retourne :
	*		Si invalide -> false
	*		Si valide -> tab des valeurs à envoyer
	*/
	function _checkForm (type) {
		if(typeof _formFuns[type] == 'undefined')
			return false;

		//data = tableau des inputs [id_input => type_regex]
		var data = _formFuns[type][CHECK]();
		if((data = formApp.checkData(data)) !== false) {
			data['project'] = projectApp.getNum();
			data['part'] = partApp.getNum();
			data['chap'] = chapApp.getNum();
			data['type'] = type;
			if(arguments[1] === undefined) {
				data['mod'] = '0'; //add
			}
			else {
				data['mod'] = _getEquiv('k'+arguments[1]).substring(1); //edit
			}
			return data;
		}

		return false;
	}

	function _editForm (type, num) {
		if(type == 'contact' || type == 'source' || type == 'author') {
			var jPath = 'EDUC-tools/projet_'+projectApp.getNum()+'/res/info.json';
			var jKey = type;
		}else {
			var jPath = 'EDUC-tools/projet_'+projectApp.getNum()
			+'/partie_'+partApp.getNum()
			+'/chapitre_'+chapApp.getNum()+'/tp.json';
			var jKey = 'tp';
		}

		var r = jQueryUtils.getJSON(jPath);
		if(r === false) {
			return false;
		}
		r = r[jKey];
		//1ère arg !!!!
		_makeForm(type, r[_getEquiv('k'+num)]);
	}
	function _makeForm (type, options) {
		//Vide le formulaire
		var form = dialogApp.getEdit();
		form.empty();
		$('#format_butts').addClass('hide');

		//Récupère les options et la fonciton
		options = options || {};
		if(typeof _formFuns[type] == 'undefined')
			return false;

		//Appelle le module correspodnant
		_formFuns[type][MAKE](options);

		return true;
	}

/************
PUBLIC FUN
*************/
	self.init = function (dir) {
		if(typeof dir == 'undefined')
			return false;

		$tp.mod.unbind();
		//Cache l'onglet
		if(dir === false) {
			self.show(false);
			return false;
		}
		//Sinon init classique

		self.show(true);

	//Init le tp
		var url = utils.path('root')+'/projet_'+projectApp.getNum()
			+'/partie_'+partApp.getNum()+'/chapitre_'+dir
			+'/tp.json';
		var r = jQueryUtils.getJSON(url);
		if(r === false) {
			dialogApp.errorPopup();
			return false;
		}

		//r = json tp + contact
		r = _initTpHTML(r);
		if(r === false) {
			utils.addERR('Tous les modules n\'ont pas pu être initialisés');
			dialogApp.errorPopup();
			return false;
		}

		//Event délégué sur les li (li = add mod)
		$tp.mod.bind('click', 'li', eventsApp.clickEl);
	};
	self.show = function (sens) {
		if(typeof sens != 'boolean')
			return false;

		if(sens === true)
			$tp.div.show();
		else
			$tp.div.hide();
	};
	self.moveEl = function (type, num, sens) {
		var r = _moveEl(type, num, sens);
		if(r === false) {
			dialogApp.errorPopup();
			return false;
		}
		return true;
	};
	self.delEl = function (type, num) {
		return {
			ancre : 'tp',
			fun : _CURRY_delTpHTML(type, num),
			titre : 'le module '+type+'('+num+')'
		};
	};
	self.addEl = function (type) {
		if(typeof type === 'undefined')
			return false;

		_makeForm(type);
		return ['tp', 'Ajouter un module '+type];
	};
	self.editEl = function (type, num) {
		if(typeof type === 'undefined' || typeof type === 'undefined')
			return false;
		if(_editForm(type, num) === false)
			return false;
		return ['tp', 'Éditer le module '+type+'('+num+')'];
	}
	self.submitEl = function (type) {
		//Vérifier le formulaire en js
		//args[1] = num si tp edit
		var data = _checkForm(type, arguments[1]);
		if(data === false) {
			return false;
		}

		data['__CBFUN__'] = _editTpHTML;

		return data;
	};

	//Return publics funs and vars
	return self;
})();
});