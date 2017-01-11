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
	jQueryUtils = (function() {
	var self = {};

	//Regexp de retour script php
	var _reg = /^\[ERROR\]./;


    self.goTo = function (ancre, cb) {
        if(typeof ancre != 'string')
            return ;
        if(ancre == 'tp') {
            if(typeof cb == 'function')
                cb();
            return ;
        }
        $('html').animate({scrollTop: $('#'+ancre).offset().top},
            'fast', function () {
            if(typeof cb == 'function')
                cb();
        });
    };
	//Retourne le numéro de l'id d'un élément jQuery (projet, partie, chapitre)
	self.getID = function (el) {
		var id = el.prop('id').split('_');
		if(typeof id[1] != 'string')
			return '';

		return id[1];
	};

	self.activeTooltip = function () {
		$(document).tooltip();
	};

	/* return false si erreur -> json object sinon
	Raccourci de getAjax -> uniquement pour le JSON en synchrone
	*/
	self.getJSON = function (url) {
		if(typeof url != 'string') {
			utils.addERR('getJSON() : paramètre url invalide');
			return false;
		}

		var r = false;
	    $.ajax({
		    timeout: 5000,
		    async: false, cache: false,
	        type: "GET",
	        contentType: "application/json; charset=utf-8",
	        dataType: "json",
	        url: url,
	        success: function(ret) {
	            r = ret;
	        },
	        error : function(xhr, error, type){
				utils.addERR('Impossible de lire le fichier '+url+' ! ('+type+')');
				r = false;
			}
		});
	    return r;
	};

	// return false si erreur, la réponse du serveur sinon
	self.ajax = function (url, method) {
		if(typeof url != 'string') {
			utils.addERR('getAjax() : paramètre url invalide');
			return false;
		}

		if(typeof method != 'string') {
			utils.addERR('getAjax() : paramètre method invalide');
			return false;
		}
		if(method != 'GET' && method != 'POST') {
			utils.addERR('getAjax() : paramètre method inconnu (utiliser GET ou POST)');
			return false;
		}

		var data = arguments[2];
		if(typeof data == 'undefined') {
			if(method == 'POST') {
				utils.addERR('getAjax() : paramètre data vide');
				return false;
			}
			data = '';
			//console.warn('getAjax() : argument data invalide (optionnel)');
		}

		var r = false;
        $.ajax({
            url : url,
            type : method,
            data : data,
            processData: false, contentType: false,
			async: false, cache: false,
            success : function(ret, statut) {
                if(_reg.test(ret) == false){
                    r = ret;
                }else {
                    utils.addERR('Script  : '+ret);
                    r = false;
                }
            },
            error : function(jxhr, statut, error) {
                utils.addERR('getAjax() : '+error+' ('+statut+')');
                r = false;
            }
        });
        return r;
	};

	return self;
})();
});