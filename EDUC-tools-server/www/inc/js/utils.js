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
/***********************
* Fonctions utilitaires
************************/
$(window).load(function() {
	utils = (function () {
	var self = {};


//liste des scripts
	var scripts = {
		'checkProject' : 'inc/php/checkProject.php',
		'scanDir' : 'inc/php/scanDir.php',
		'delEl' : 'inc/php/delEl.php',
		'exportEl' : 'inc/php/exportEl.php',
		'importEl' : 'inc/php/importEl.php',
		'addEl' : 'inc/php/addEl.php',
		'addMod' : 'inc/php/addMod.php',
		'delMod' : 'inc/php/delMod.php',
		'moveMod' : 'inc/php/moveMod.php'
	};

	var paths = {
		root : 'EDUC-tools'
	};

/***************
GESTION DES ERREURS
****************/
	//Tampon d'erreur pour les modules
	var _ERR = [];
	function _cleanERR () {
		_ERR.length = 0;
	}
	self.addERR = function (str) {
		if(typeof str != 'string'){
			return false;
		}
		_ERR.push('-> '+str);
	};
	self.getERR = function () {
		var r = _ERR.join('<br \\>');
		_cleanERR();
		return r;
	};

	/* Pour le dev */
	self.showERR = function () {
		var r = _ERR.join('\n');
		console.error(r);
	};
	self.alertERR = function () {
		var r = _ERR.join('\n');
		alert(r);
	}


	//Sécurité lors d'un changement de page quelconque (Back, F5 etc...)
	self.alertBeforeQuit = function () {
		$(window).bind('beforeunload', function() {
			return 'Confirmer la fermeture';
		});
	};

	//js-attitude : str to int (undfined si erreur)
	self.cleanInt = function (x) {
		x = Number(x);
		return Math[x>=0 ? 'floor':'ceil'](x);
	};

	//1ère lettre en majuscule (comme en php)
	self.ucfirst = function (str) {
		if(typeof(str) != 'string')
			return false;
		if(str.length == 0)
			return '';
		return str.substring(0, 1).toUpperCase()+str.substring(1, str.length);
	};

	//Converti du html (avec ;amp etc...) en texte lisible
	self.htmlToText = function (str) {
		return $('<p>', {html:str}).text();
	};

	//Liste les méthodes et attributs d'un objet
	self.OBJ = function (o) {
	    console.dir(o);
	};

	//Debug alert()
	self.BUG = function () {
		console.log('BUG');
		alert('BUG');
	};

	self.script = function (str) {
		var r = scripts[str];
		if(r == undefined)
			return false;

		return r;
	}
	self.path = function (str) {
		var r = paths[str];
		if(r == undefined)
			return false;

		return r;
	}


	return self;
})();
});