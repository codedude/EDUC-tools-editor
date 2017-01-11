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
//une fois la page bien chargée
$(window).load(function() {
	$.fn.extend({
	insertAt: function(pos, myValue){
	  return this.each(function(i) {
	    if (document.selection) {
	      //For browsers like Internet Explorer
	      this.focus();
	      var sel = document.selection.createRange();
	      sel.text = myValue;
	      this.focus();
	    }
	    else if (this.selectionStart || this.selectionStart == '0') {
	      //For browsers like Firefox and Webkit based
	      var startPos = pos;
	      var endPos = pos;
	      var scrollTop = this.scrollTop;
	      this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
	      this.focus();
	      this.selectionStart = startPos + myValue.length;
	      this.selectionEnd = startPos + myValue.length;
	      this.scrollTop = scrollTop;
	    } else {
	      this.value += myValue;
	      this.focus();
	    }
	  });
	}
	});

	window.version = '1.0.0';
	window.date = '11/01/2017';

	var App = (function() {
		var self = {};

/*************
PRIVATE VAR
**************/
		var $_version = $('#version');
		var $_date = $('#date');

		var $_loader = {
			div : $('#pageLoader'),
			img : $('#pageLoader img'),
			txt : $('#pageLoader p')
		}


/*************
PRIVATE FUN
**************/
		function _initError() {
			$_loader.img.attr('src', 'img/icons/error.png');
			$_loader.txt.text('Essayez de recharger la page !');

			dialogApp.errorPopup();
		}

		function _firstUsePopup() {
			var el = $('<p>');
			el.text('Bienvenue sur EDUC-tools !');
			dialogApp.getInfo().html(el);

			dialogApp.upInfo('Bienvenue');
			dialogApp.showInfo(true);
		}


/*************
PUBLIC FUN
**************/
		self.new = function () {
			$_version.html(window.version);
			$_date.html(window.date);

			//Init des modules complémentaires
			dialogApp.init();
			formApp.init();

			var r = jQueryUtils.ajax(utils.script('checkProject'), 'GET');
			//Erreur
			if(r === false) {
				_initError();
				return false;
			}

			//Le script a renvoyé une valeur valide
			$_loader.div.addClass('hide');
			//1ère utilisation
			if(r === 'new') {
				_firstUsePopup();
			}

			$('div[id$=_action]').bind('click', 'span',
				eventsApp.clickEl);

			$('#format_butts').bind('click', 'button', eventsApp.formatButts);

			var back = $('#backtop');
			back.hide();
			back.click(function () {
				$('html, body').animate({scrollTop: 0}, 'fast');
			});

			var win = $(window);
			win.scroll(function (e) {
				var tp = $('#tp');
				if(tp.css('display') == 'none')
					return ;
				var bodypos = win.scrollTop();
				var backpos = tp.offset().top;
				if(bodypos >= backpos) {
					back.show();
				}else {
					back.hide();
				}
			});

			$('#butt_infoPage').click(function () {
				dialogApp.showInfoPage(true);
			});

			//Initialisation du 1er module
			projectApp.init();
			//utils.alertBeforeQuit();

			//console.log("App is running fine ;)");
		};

			return self;
		})();

	//Initialise l'appli
	App.new();

	//dev rapide
	/*$('#project_1').click();
	$('#part_1').click();
	$('#chap_1').click();*/
});
