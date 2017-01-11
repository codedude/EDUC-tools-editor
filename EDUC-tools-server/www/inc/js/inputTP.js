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
	inputTP = (function() {
	var self = {};

/************
PUBLIC VARS
*************/
    self.funs = {
        'titre' : [_makeTitre, _checkTitre, _printTitre],
        'note' : [_makeNote, _checkNote, _printNote],
        'texte' : [_makeTexte, _checkTexte, _printTexte],
        'lien' : [_makeLien, _checkLien, _printLien],
        'contact' : [_makeContact, _checkContact, _printContact],
        'source' : [_makeSource, _checkSource, _printSource],
        'author' : [_makeAuthor, _checkAuthor, _printAuthor],
        'separ' : [_makeSepar, _checkSepar, _printSepar],
        'image' : [_makeImage, _checkImage, _printImage],
        'video' : [_makeVideo, _checkVideo, _printVideo],
        'son' : [_makeSon, _checkSon, _printSon],
        'objet' : [_makeObjet, _checkObjet, _printObjet],
        'html' : [_makeHtml, _checkHtml, _printHtml]
    };
    //data -> key = id de l'input, value = type de regex

    function _makeTitre (options) {
        _makeTitre.defaults = {
            'titre' : '',
            'taille' : 'grand'
        };
        for(var opt in _makeTitre.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeTitre.defaults[opt];


        formApp.newInput('text', 'Titre', 'titre', options['titre']);
        formApp.newInput('select', 'Taille', 'taille', options['taille'],
            '2 tailles de titre', false,
            {'grand':'Titre principal', 'petit':'Sous-titre'});
    }
    function _checkTitre () {
        var data = {
            'titre' : ['titre', true],
            'taille' : ['select', true]
        };
        return data;
    }
    function _printTitre (json) {
        var el = $('<p>');
        el.text(utils.htmlToText(json.titre));
        el.addClass('titre-'+json.taille);
        return el;
    }

    function _makeNote (options) {
        _makeNote.defaults = {
            'note' : 'info',
            'texte' : ''
        };
        for(var opt in _makeNote.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeNote.defaults[opt];


        formApp.newInput('textarea', 'Texte', 'texte', options['texte'], '', false, true);
        formApp.newInput('select', 'Type', 'note', options['note'],
            '3 types note', false,
            {'info':'Information', 'tip':'Conseil', 'warning':'Avertissement'});
    }
    function _checkNote () {
        var data = {
            'texte' : ['texte', true],
            'note' : ['select', true]
        };
        return data;
    }
    function _printNote (json) {
        var el = $('<div>');
        el.addClass('note-'+json.note).addClass('note');
        var txt = $('<p>');
        txt.text(utils.htmlToText(json.texte));
        el.append($('<span>')).append(txt);

        return el;
    }

    function _makeTexte (options) {
        _makeTexte.defaults = {
            'texte' : ''
        };
        for(var opt in _makeTexte.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeTexte.defaults[opt];

        $('#format_butts').removeClass('hide');
        formApp.newInput('textarea', 'Texte', 'ftexte', options['texte'],
            '', false, true);
    }
    function _checkTexte () {
        var data = {
            'ftexte' : ['texte', true]
        };
        return data;
    }
    function _printTexte (json) {
        var el = $('<p>');

        var txt = utils.htmlToText(json.texte);

        el.html(formatText(txt));

        return el;
    }

    var tags = {
        'g': 'bold',
        'i': 'italic',
        's': 'underline',
        'grand': 'bigger',
        'petit': 'smaller',
        'exp': 'sup',
        'ind': 'sub',
        'item': 'item',
        'uitem': 'uitem',
        'rouge': 'red',
        'vert': 'green',
        'bleu': 'blue'
    };
    function formatText(txt) {
        var re = new RegExp('<nl/>', 'g');
        txt = txt.replace(re, '<br />');

        for(var tag in tags) {
            re = new RegExp('<'+tag+'>', 'g');
            txt = txt.replace(re, '<span class="tp_'+tags[tag]+'">');
            re = new RegExp('</'+tag+'>', 'g');
            txt = txt.replace(re, '</span>');
        }

        return txt;
    }

    function _makeLien (options) {
        _makeLien.defaults = {
            'titre' : '',
            'lien' : ''
        };
        for(var opt in _makeLien.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeLien.defaults[opt];

        formApp.newInput('text', 'Titre', 'titre', options['titre']);
        formApp.newInput('url', 'Lien', 'lien', options['lien']);
    }
    function _checkLien () {
        var data = {
            'titre' : ['description', true],
            'lien'  : ['description', true]
        };
        return data;
    }
    function _printLien (json) {
        var el = $('<p>');
        el.append(utils.htmlToText(json.titre)+' : ');
        el.append($('<a>', {href:utils.htmlToText(json.lien),
            text:utils.htmlToText(json.lien)}));
        return el;
    }

    function _makeContact (options) {
        _makeContact.defaults = {
            'nom' : '',
            'structure' : '',
            'lieu' : '',
            'partner': 'false',
            'url' : '',
            'email' : '',
            'phone' : '',
            'description' : ''
        };
        for(var opt in _makeContact.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeContact.defaults[opt];

        formApp.newInput('text', 'Société', 'nom', options['nom'],
            'Nom de l\'entreprise ou de l\'institution', true);
        formApp.newInput('text', 'Structure', 'structure', options['structure'],
            'Nom de la structure', true);
        formApp.newInput('text', 'Lieu', 'lieu', options['lieu'],
            'Ville et/ou code postal', true);
        formApp.newInput('checkbox', 'Contactable ?', 'partner',
            options['partner'],
            'Cocher pour indiquer qu\'un partenariat existe');
        formApp.newInput('url', 'Site web', 'url', options['url']);
        formApp.newInput('email', 'Courriel', 'email', options['email']);
        formApp.newInput('tel', 'Téléphone', 'phone', options['phone']);
        formApp.newInput('textarea', 'Infos', 'description',
            options['description'], 'Informations complémentaires');
    }
    function _checkContact () {
        var data = {
            'nom' : ['nom', true],
            'structure' : ['nom', true],
            'lieu' : ['description', true],
            'partner' : ['checkbox', true],
            'url' : ['url', false],
            'phone' : ['phone', false],
            'email' : ['email', false],
            'description' : ['description', false]
        };
        return data;
    }
    function _printContact (json) {
        var $tab = $('<table>');
        var $tr = [];
        for(var i=0; i<8; i++) {
            $tr[i] = $('<tr>');
        }

        $tr[0].append($('<td>').text('Nom'))
            .append($('<td>').text(utils.htmlToText(json.nom)));
        $tr[1].append($('<td>').text('Structure'))
            .append($('<td>').text(utils.htmlToText(json.structure)));
        $tr[2].append($('<td>').text('Lieu'))
            .append($('<td>').text(utils.htmlToText(json.lieu)));
        $tr[3].append($('<td>').text('Contactable'))
            .append($('<td>').text((function () {
                    var l = (json.partner == 'true')?'Oui':'Non';
                    return utils.htmlToText(l);
                })()));
        $tr[4].append($('<td>').text('Lien'))
            .append($('<td>').append($('<a>', {
                'text':utils.htmlToText(json.url), 'href':utils.htmlToText(json.url)
                })));
        $tr[5].append($('<td>').text('Courriel'))
            .append($('<td>').text(utils.htmlToText(json.email)));
        $tr[6].append($('<td>').text('Téléphone'))
            .append($('<td>').text(utils.htmlToText(json.phone)));
        $tr[7].append($('<td>').text('Description'))
            .append($('<td>').text(utils.htmlToText(json.description)));


        for(var r in $tr) {
            $tab.append($tr[r]);
            delete $tr[r];
        }

        return $tab;
    }

    function _makeAuthor (options) {
        _makeContact.defaults = {
            'nom' : '',
            'email' : '',
            'infos' : ''
        };
        for(var opt in _makeContact.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeContact.defaults[opt];

        formApp.newInput('text', 'Nom', 'nom', options['nom'],
            'Nom et/ou prénom de l\'auteur ou du groupe', true);
        formApp.newInput('email', 'Courriel', 'email', options['email']);
        formApp.newInput('textarea', 'Infos', 'description',
            options['description'], 'Informations complémentaires');
    }
    function _checkAuthor () {
        var data = {
            'nom' : ['nom', true],
            'email' : ['description', false],
            'description' : ['description', false]
        };
        return data;
    }
    function _printAuthor (json) {
        var $tab = $('<table>');
        var $tr = [];
        for(var i=0; i<3; i++) {
            $tr[i] = $('<tr>');
        }

        $tr[0].append($('<td>').text('Nom'))
            .append($('<td>').text(utils.htmlToText(json.nom)));
        $tr[1].append($('<td>').text('Courriel'))
            .append($('<td>').text(utils.htmlToText(json.email)));
        $tr[2].append($('<td>').text('Description'))
            .append($('<td>').text(utils.htmlToText(json.description)));

        for(var r in $tr) {
            $tab.append($tr[r]);
            delete $tr[r];
        }

        return $tab;
    }

    function _makeSource (options) {
        _makeContact.defaults = {
            'nom' : '',
            'ressource' : '',
            '__file' : '',
            'description' : ''
        };
        for(var opt in _makeContact.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeContact.defaults[opt];

        formApp.newInput('text', 'Nom', 'nom', options['nom'],
            'Nom de l\entreprise ou de la personne', true);
        formApp.newInput('textarea', 'Ressources', 'ressource',
            options['ressource'], 'Quelles ressources ?', true);
        formApp.newInput('file', 'Logo', '__file', '',
            'Logo de la source (petite image jpg, png, gif)');
        formApp.newInput('textarea', 'Infos', 'description',
            options['description'], 'Informations complémentaires');
    }
    function _checkSource () {
        var data = {
            'nom' : ['nom', true],
            'ressource' : ['description', true],
            '__file' : ['description', false],
            'description' : ['description', false]
        };
        return data;
    }
    function _printSource (json) {
        var $tab = $('<table>');
        var $tr = [];
        for(var i=0; i<4; i++) {
            $tr[i] = $('<tr>');
        }

        $tr[0].append($('<td>').text('Logo'))
            .append($('<td>').append((function () {
                    if(json.src == null)
                        return '-';
                    var $fig = $('<figure>').append($('<img>', {src : utils.path('root')
                        +'/projet_'+projectApp.getNum()
                        +'/res/'+utils.htmlToText(json.src)
                        +'?date='+new Date().getTime()
                    }));

                    return $fig;
                }) () ));
        $tr[1].append($('<td>').text('Entreprise/Nom'))
            .append($('<td>').text(utils.htmlToText(json.nom)));
        $tr[2].append($('<td>').text('Ressources'))
            .append($('<td>').text(utils.htmlToText(json.ressource)));
        $tr[3].append($('<td>').text('Description'))
            .append($('<td>').text(utils.htmlToText(json.description)));

        delete $fig;
        for(var r in $tr) {
            $tab.append($tr[r]);
            delete $tr[r];
        }


        return $tab;
    }

    function _makeSepar (options) {
        _makeSepar.defaults = {
            'separ' : 'mineure'
        };
        for(var opt in _makeSepar.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeSepar.defaults[opt];

        formApp.newInput('select', 'Type de séparation', 'separ',
            options['separ'], '3 tailles de séparation', false,
            {'space':'Espace', 'mineure':'Mineure', 'majeure':'Majeure'});
    }
    function _checkSepar () {
        var data = {
            'separ' : ['description', true]
        };
        return data;
    }
    function _printSepar (json) {
        var el = $('<hr>');

        el.addClass('separ_'+json.separ);

        return el;
    }

    function _makeImage (options) {
        _makeImage.defaults = {
            'nom' : '',
            'legende' : '',
            'source' : '',
            '__file' : ''
        };
        for(var opt in _makeImage.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeImage.defaults[opt];

        formApp.newInput('text', 'Nom', 'nom', options['nom'], '', true);
        formApp.newInput('textarea', 'Légende', 'legende', options['legende']);
        formApp.newInput('file', 'Image', '__file', '',
            'jpg, png, gif, bmp  (100Mo maxi)', true);
        formApp.newInput('text', 'Source', 'source', options['source']);
    }
    function _checkImage () {
        var data = {
            'nom' : ['nom', true],
            'legende' : ['description', false],
            'source' : ['description', false],
            '__file' : ['description', true] //src
        };
        return data;
    }
    function _printImage (json) {
        var $div = $('<div>');

        var $fig = $('<figure>');
        $fig.append($('<img>', {src:utils.path('root')
            +'/projet_'+projectApp.getNum()
            +'/partie_'+partApp.getNum()
            +'/chapitre_'+chapApp.getNum()
            +'/image/'+utils.htmlToText(json.src)
            +'?date='+new Date().getTime()
        }));
        $fig.append($('<figcaption>', {text:utils.htmlToText(json.nom)+' : '
            +utils.htmlToText(json.legende)}));

        $div.append($fig);
        var $info = $('<p>');
        var txt = '';
        if(json.source != false) {
            txt += 'Source : '+utils.htmlToText(json.source);
            txt += '<br />';
        }
        txt += 'Format : '+json.mime;
        $div.append($info.html(txt));

        delete $fig, $info;

        return $div;
    }

    function _makeVideo (options) {
        _makeVideo.defaults = {
            'nom' : '',
            'legende' : '',
            'source' : '',
            '__file' : ''
        };
        for(var opt in _makeVideo.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeVideo.defaults[opt];

        formApp.newInput('text', 'Nom', 'nom', options['nom'], '', true);
        formApp.newInput('textarea', 'Légende', 'legende', options['legende']);
        formApp.newInput('file', 'Vidéo', '__file', '',
            'mp4 uniquement (encodage H.264/AAC ou MP3) (100Mo maxi)', true);
        formApp.newInput('text', 'Source', 'source', options['source']);
    }
    function _checkVideo () {
        var data = {
            'nom' : ['nom', true],
            'legende' : ['description', false],
            'source' : ['description', false],
            '__file' : ['description', true] //src
        };
        return data;
    }
    function _printVideo (json) {
        var $div = $('<div>');
        var $video = $('<video>', {controls:true});
        $video.append($('<source>', {src:utils.path('root')
            +'/projet_'+projectApp.getNum()
            +'/partie_'+partApp.getNum()
            +'/chapitre_'+chapApp.getNum()
            +'/video/'+utils.htmlToText(json.src)
            +'?date='+new Date().getTime(),
            type:json.mime}));
        $video.append('Le navigateur ne peut pas lire les vidéos ! Mettez le à jour.');

        var $fig = $('<figure>');
        $fig.append($video);
        $fig.append($('<figcaption>', {text:utils.htmlToText(json.nom)+' : '
            +utils.htmlToText(json.leg)}));

        $div.append($fig);
        var $info = $('<p>');
        var txt = '';
        if(json.source != false) {
            txt += 'Source : '+utils.htmlToText(json.source);
            txt += '<br />';
        }
        txt += 'Format : '+json.mime;
        $div.append($info.html(txt));

        delete $fig, $info, $video;

        return $div;
    }

    function _makeSon (options) {
        _makeSon.defaults = {
            'nom' : '',
            'legende' : '',
            'source' : '',
            '__file' : ''
        };
        for(var opt in _makeSon.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeSon.defaults[opt];

        formApp.newInput('text', 'Nom', 'nom', options['nom'], '', true);
        formApp.newInput('textarea', 'Légende', 'legende', options['legende']);
        formApp.newInput('file', 'Extrait sonore', '__file', '',
            'mp3, ogg (100Mo maxi)', true);
        formApp.newInput('text', 'Source', 'source', options['source']);
    }
    function _checkSon () {
        var data = {
            'nom' : ['nom', true],
            'legende' : ['description', false],
            'source' : ['description', false],
            '__file' : ['description', true] //src
        };
        return data;
    }
    function _printSon (json) {
        var $div = $('<div>');

        var $son = $('<audio>', {controls:true});
        $son.append($('<source>', {src:utils.path('root')
            +'/projet_'+projectApp.getNum()
            +'/partie_'+partApp.getNum()
            +'/chapitre_'+chapApp.getNum()
            +'/son/'+utils.htmlToText(json.src)
            +'?date='+new Date().getTime(),
            type:json.mime}));
        $son.append('Le navigateur ne peut pas lire les sons ! Mettez le à jour.');

        var $fig = $('<figure>');
        $fig.append($son);
        $fig.append($('<figcaption>', {text:utils.htmlToText(json.nom)+' : '
            +utils.htmlToText(json.leg)}));

        $div.append($fig);
        var $info = $('<p>');
        var txt = '';
        if(json.source != false) {
            txt += 'Source : '+utils.htmlToText(json.source);
            txt += '<br />';
        }
        txt += 'Format : '+json.mime;
        $div.append($info.html(txt));

        delete $fig, $info, $son;

        return $div;
    }

    function _makeObjet (options) {
        _makeObjet.defaults = {
            'nom' : '',
            'legende' : '',
            'source' : '',
            '__file' : ''
        };
        for(var opt in _makeObjet.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeObjet.defaults[opt];

        formApp.newInput('text', 'Nom', 'nom', options['nom'], '', true);
        formApp.newInput('textarea', 'Légende', 'legende', options['legende']);
        formApp.newInput('file', 'Objet', '__file', '',
            'Un fichier à ouvrir avec le périphérique (100Mo maxi)', false);
        formApp.newInput('text', 'Source', 'source', options['source']);
    }
    function _checkObjet () {
        var data = {
            'nom' : ['nom', true],
            'legende' : ['description', false],
            'source' : ['description', false],
            '__file' : ['description', true] //src
        };
        return data;
    }
    function _printObjet (json) {
        var $div = $('<div>');

        var file = utils.htmlToText(json.src);
        var logo = file.split('.');
        switch(logo[1]) {
            case 'ifc':
                logo='ifc';
                break;
            case 'tbp':
                logo='teklabim';
                break;

            case 'pdf':
                logo='pdf';
                break;

            case 'xls':case 'xlsx':
                logo='excel';
                break;
            case 'doc':case 'docx':
                logo='word';
                break;
            case 'ppt':case 'pptx':
                logo='powerpoint';
                break;

            case 'jpeg':
            case 'jpg':
            case 'png':
            case 'gif':
            case 'bmp':
                logo = 'image';
                break;

            case 'mp4':
                logo = 'video';
                break;

            case 'mp3':
            case 'ogg':
                logo = 'son';
                break;

            default:
                logo = 'defaut';
                break;
        }

        var $fig = $('<figure>');
        $fig.append($('<img>', {src:'img/icons/logo_'+logo+'.png'}))
            .append($('<figcaption>', {text:utils.htmlToText(json.nom)+' : '
            +utils.htmlToText(json.legende)}));

        $div.append($fig);

        var $info = $('<p>');
        var txt = '';
        if(json.source != false) {
            txt += 'Source : '+utils.htmlToText(json.source);
            txt += '<br />';
        }
        txt += 'Format : '+json.mime;
        $div.append($info.html(txt));

        delete $fig, $info;

        return $div;
    }

    function _makeHtml (options) {
        _makeHtml.defaults = {
            'nom' : '',
            'legende' : '',
            'source' : '',
            '__file' : ''
        };
        for(var opt in _makeHtml.defaults)
            if(options[opt] === undefined)
                options[opt] = _makeHtml.defaults[opt];

        formApp.newInput('text', 'Nom', 'nom', options['nom'], '', true);
        formApp.newInput('textarea', 'Légende', 'legende', options['legende']);
        formApp.newInput('file', 'Html', '__file', '',
            'Fichier zip contenant le module html (index.html requis à la racine', false);
        formApp.newInput('text', 'Source', 'source', options['source']);
    }
    function _checkHtml () {
        var data = {
            'nom' : ['nom', true],
            'legende' : ['description', false],
            'source' : ['description', false],
            '__file' : ['description', true] //src
        };
        return data;
    }
    function _printHtml (json) {
        var $div = $('<div>');

        var $fig = $('<figure>');
        $fig.append($('<img>', {src:'img/icons/logo_html.png'}))
            .append($('<figcaption>', {text:utils.htmlToText(json.nom)+' : '
            +utils.htmlToText(json.legende)}));

        $div.append($fig);

        var $info = $('<p>');
        var txt = '';
        if(json.source != false) {
            txt += 'Source : '+utils.htmlToText(json.source);
            txt += '<br />';
        }
        txt += 'Format : '+json.mime;
        $div.append($info.html(txt));

        delete $fig, $info;

        return $div;
    }

    //Return publics funs and vars
    return self;
});
});