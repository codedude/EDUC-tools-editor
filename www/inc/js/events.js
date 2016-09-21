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
	eventsApp = (function() {
	var self = {};

/************
PRIVATE VAR
*************/
    //arg[0] = nom du module
    //Pour select -> arg[1] = numero
    var _clickFuns = {
        'add' : clickAdd,
        'edit' : clickEdit,
        'del' : clickDel,
        'import' : clickImport,
        'export' : clickExport,
        'select' : clickSelect,
        'up' : clickMove,
        'down' : clickMove
    };

    var _module = {
        'project' : projectApp,
        'part' : partApp,
        'chap' : chapApp,
        'tp' : tpApp
    }


/*************
PRIVATE FUN
**************/
    function clickAdd(mod) {
        //r = titre
        //arg[1] = type de module
        var r = _module[mod].addEl(arguments[1]);
        if(r === false) {
            return false;
        }
        var n_id = mod+'_add';
        if(arguments[1] !== undefined)
            n_id = n_id+'_'+arguments[1];

        if(formApp.setButt(n_id) === false) {
            utils.addERR('Element ('+mod+') inconnnu ou id invalide');
            return false;
        }

        jQueryUtils.goTo(r[0], function () {
            dialogApp.upEdit(r[1]);
            dialogApp.showEdit(true);
        });
    }
    function clickEdit(mod) {
        //r = titre
        var r = _module[mod].editEl(arguments[1], arguments[2]);
        if(r === false) {
            utils.addERR('Aucun élément ('+mod+') selectionné');
            return false;
        }
        var n_id = mod+'_edit';

        //1 -> mod, 2 -> num
        if(arguments[1] !== undefined)
            n_id = n_id+'_'+arguments[1]+'_'+arguments[2];
        if(formApp.setButt(n_id) === false) {
            return false;
        }

        jQueryUtils.goTo(r[0], function () {
            dialogApp.upEdit(r[1]);
            dialogApp.showEdit(true);
        });
    }
    function clickDel(mod) {
        var r = _module[mod].delEl(arguments[1], arguments[2]);
        if(r === false) {
            utils.addERR('Aucun élément ('+mod+') selectionné');
            return false;
        }

        jQueryUtils.goTo(r['ancre'], function () {
            dialogApp.upDel(r);
            dialogApp.showDel(true);
        });
    }
    function clickExport(mod) {
        var r = _module[mod].exportEl();
        if(r === false) {
            utils.addERR('Aucun élément ('+mod+') selectionné');
            return false;
        }
        dialogApp.upInfo('Exporter : '+r['titre'], false);

        var lien = jQueryUtils.ajax(utils.script('exportEl'), 'GET', r['data']);
        if(lien === false) {
            return false;
        }
        //Ajoute le lien au dialog
        r['success'](encodeURIComponent(lien));
        dialogApp.showInfo(true);
    }
    function clickImport (mod) {
        var r = _module[mod].importEl();
        if(r === false) {
            utils.addERR('Aucun élément ('+mod+') selectionné');
            return false;
        }

        var n_id = mod+'_import';
        if(formApp.setButt(n_id) === false) {
            utils.addERR('Id du formulaire ('+n_id+') invalide');
            return false;
        }

        jQueryUtils.goTo(r[0], function () {
            dialogApp.upEdit(r[1]);
            dialogApp.showEdit(true);
        });
    }
    function clickSelect(mod, num) {
        var r = _module[mod].selectEl(num);
        if (r == false)
            return ;
        jQueryUtils.goTo(r);
    }
    function clickMove(mod, type, num, sens) {
        var r = _module[mod].moveEl(type, num, sens);
        if(r === false) {
            utils.addERR('Aucun module selectionné');
            return false;
        }
    }



/*****************
PUBLIC FUN & VAR
******************/
    //Clic sur un li quelconque (projet, partie, chapitre)
    self.clickEl = function (e) {
        e = e.target;

        if(e.nodeName != 'LI') {
            if(e.parentElement.nodeName == 'LI') {
                e = e.parentElement;
            }else if(e.nodeName != 'SPAN') {
                return false;
            }

        }
        var id = e.id;

        //Si c'est un span -> pas d'id ! on prends la 1ère class
        if(id.length == 0) {
            id = e.className.split(' ');
            id = id[0]; //class du span (listeTitle ou span d'action)

            //On reconstruit un id compatible avec l'élément parent
            var par = e.parentNode.id.split('_');
            //id = action, par[0] = mod
            if(id == 'listeTitle') { //span des li
                id = par;
            }else {
                id = id.split('_');
                id = par[0]+'_'+id[0];
            }


        }
        id = id.split('_');
        /*
            0 => module,
            1 => action,
            2 => élément sélectionné, (que pour mod tp)
            3 => option (que move pour sens)
        */
        //TP
        if(id.length > 2) {
            if(_clickFuns[id[1]](id[0], id[2], id[3], id[1]) === false) {
                dialogApp.errorPopup();
            }
            return ;
        }

        //A revoir pour ES6
        //Renvoi true si c'est une chaîne de caractère
        if(isNaN(id[1]) == false) {
            if(_clickFuns['select'](id[0], id[1]) === false) {
                dialogApp.errorPopup();
                return false;
            }
        }
        else {
            if(_clickFuns[id[1]](id[0]) === false) {
                dialogApp.errorPopup();
                return false;
            }
        }
    };

    self.clickForm = function (e) {
        e.preventDefault();
        e = e.target;
        if(e.nodeName != 'FORM')
            return false;

        //Appel
        var id = formApp.getButt();
        if(id === false) {
            utils.addERR('Id du formulaire inconnu');
            dialogApp.errorPopup();
            return false;
        }

        //id[2] et id[3] : module si TP
        //2 -> type, 3 -> num si edit
        id = id.split('_');
        if(id[1] != 'import') {
            var data = _module[id[0]].submitEl(id[2], id[3]);
        }else {
            var data = _module[id[0]].submitImportEl();
        }
        if(data === false) {
            utils.addERR('Corrigez les champs invalides');
            dialogApp.errorPopup();
            return false;
        }

        var form = new FormData();
        for(var c in data) {
            if(c == '__CBFUN__') //Fonction callback
                continue;
            form.append(c, data[c]);
        }

        form.append('action', id[1]); //edit ou add, ou import

        var r;
        if(id[0] === 'tp')
            r = jQueryUtils.ajax(utils.script('addMod'), 'POST', form);
        else {
            if(id[1] == 'import')
                r = jQueryUtils.ajax(utils.script('importEl'), 'POST', form);
            else
                r = jQueryUtils.ajax(utils.script('addEl'), 'POST', form);
        }
        if(r === false) {
            dialogApp.errorPopup();
            return false;
        }

        if(data['__CBFUN__'](r, id[2], id[3]) === false) {
            dialogApp.errorPopup();
        }

        //Formulaire valide et envoyé, on peut fermer le dialog
        dialogApp.showEdit(false);
    };

    self.formatButts = function (e) {
        e.preventDefault();
        e = e.target;

        if(e.nodeName != 'BUTTON')
            return false;

        var id = e.id.split('_')[1];
        var tags = getTags(id);

        var txt = $('#dialog_edit_form #ftexte');
        var start = txt[0].selectionStart;
        var end = txt[0].selectionEnd;

        if(tags.type == 'self') {
            txt.insertAt(end, tags.first);
        }else if(tags.type == 'couple') {
            txt.insertAt(start, tags.first);
            if(start != end) {
                end += tags.first.length;
                txt.insertAt(end, tags.last);
            }else {
                start += tags.first.length;
                txt.insertAt(start, tags.last);
            }
        }

        if(tags.first == '<nl/>') {
            end += tags.first.length;
            txt.insertAt(end, '\n');
        }
    }

    function getTags (id) {
        var tags = {};
        tags.type = 'couple'; //Default
        var tag;

        switch(id) {
            case 'bold':
                tag = 'g';
                break;
            case 'italic':
                tag = 'i';
                break;
            case 'underline':
                tag = 's';
                break;

            case 'bigger':
                tag = 'grand';
                break;
            case 'smaller':
                tag = 'petit';
                break;

            case 'sup':
                tag = 'exp';
                break;
            case 'sub':
                tag = 'ind';
                break;

            case 'red':
                tag = 'rouge';
                break;
            case 'green':
                tag = 'vert';
                break;
            case 'blue':
                tag = 'bleu';
                break;

            case 'item':
                tag = 'item';
                break;
            case 'uitem':
                tag = 'uitem';
                break;

            case 'nl':
                tag = 'nl';
                tags.type = 'self';
                break;

            default:
                tags.type = 'blank';
                break;
        }

        if(tags.type == 'self') {
            tags.first = '<'+tag+'/>';
            tags.last = '';
        }
        else if(tags.type == 'couple'){
            tags.first = '<'+tag+'>';
            tags.last = '</'+tag+'>';
        }
        else {}

        return tags;
    }

	//Return publics funs and vars
	return self;
})();
});
