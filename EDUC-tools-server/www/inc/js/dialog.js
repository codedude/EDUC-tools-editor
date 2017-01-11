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
    dialogApp = (function() {
    var self = {};

    var $infoPage = {
            div : $('#dialog_infoPage')
        };
    var $edit = {
            div : $('#dialog_edit'),
            form : $('#dialog_edit_form_in')
        };
    var $del = {
            div : $('#dialog_del'),
            txt : $('#dialog_del_txt'),
        };
    var $info = {
            div : $('#dialog_info'),
            bloc : $('#dialog_info_in')
        };

    //Dialog de confirmation suppression
    function _initInfoPage() {
        $infoPage.div.dialog({
            autoOpen: false,
            modal: true,
            resizable: false
        });
    }

    function _initDel() {
        $del.div.dialog({
            autoOpen: false,
            modal: true,
            resizable: false
        });
    }
    //Dialog d'info
    function _initInfo() {
        $info.div.dialog({
            autoOpen: false,
            modal: true,
            resizable: false
        });
    }
    //Dialog d'édition
    function _initEdit() {
        $edit.div.dialog({
            autoOpen: false,
            modal: true,
            resizable: false
        });
    }

    //Affiche ou cache le dialog
    function _showDialog(el, sens) {
        switch(el) {
            case 'edit':
                el = $edit;
                break;
            case 'del':
                el = $del;
                break;
            case 'info':
                el = $info;
                break;
            case 'infoPage':
                el = $infoPage;
                break;
            default:
                return false;
        }
        sens = (sens)?'open':'close';
        el.div.dialog(sens);
    }

    //PUBLIC
    self.init = function () {
        _initDel();
        _initEdit();
        _initInfo();
        _initInfoPage();
    };

    self.showEdit = function (sens) {
        _showDialog('edit', sens);
    };
    self.showDel = function (sens) {
        _showDialog('del', sens);
    };
    self.showInfo = function (sens) {
        _showDialog('info', sens);
    };
    self.showInfoPage = function (sens) {
        _showDialog('infoPage', sens);
    };

    self.getEdit = function () {
        return $edit.form;
    };
    self.getInfo = function () {
        return $info.bloc;
    };
    self.getInfoPage = function () {
        return $infoPage.div;
    };

    self.upEdit = function (titre) {
        if(typeof titre != 'string')
            return false;

        $edit.div.dialog('option', 'title', titre);
    };
    self.upDel = function (options) {
        if(typeof options == undefined)
            return false;

        options = options || {};
        self.upDel.defaults = {
            titre : '',
            fun : function () {},
            args : undefined
        };
        for(var opt in self.upDel.defaults) {
            if(typeof options[opt] == undefined)
                options[opt] = self.upDel.defaults[opt];
        };


        $del.txt.text(options['titre']);
        $del.div.dialog('option', 'buttons', {
            'Supprimer' : function () {
                options['fun'](options['args']);
                $(this).dialog('close');
            },
            'Annuler' : function () {
                $(this).dialog('close');
            }
        });
    };
    self.upInfo = function (titre, butts) {
        if(typeof titre != 'string')
            return false;

        $info.div.dialog('option', 'title', titre);

        if(butts === false) {
            $butts = {};
        }else {
            $butts = {
                'J\'ai compris' : function () {
                    $(this).dialog('close');
                }
            };
        }

        $info.div.dialog('option', 'buttons', $butts);
    }
    self.errorPopup = function () {
        self.getInfo().html(utils.getERR());

        self.upInfo('Erreur');
        self.showInfo(true);
    };

    return self;
})();
});