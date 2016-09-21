<?php
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
    header('Content-Type: text/plain; charset=utf-8');

    require_once('fun.php');

    $ret = fun();
    echo $ret;

    function fun() {
        global $rootPath;

//Récupère les paramètres et les sécurise
        //paramètres communs et obligatoires !
        $params = array('action', 'project', 'part', 'chap', 'type', 'mod');

        foreach($params as $param) {
            if(!isset($_POST[$param]))
                return error('Paramètre '.$param.' manquant');

            $params[$param] = secVar($_POST[$param]);
        }
        $params['action'] = ($params['action'] == 'add')?true:false;
        $path = $rootPath.'/projet_'.$params['project']
            .'/partie_'.$params['part'].'/chapitre_'.$params['chap'];


        $modList = [
            'texte' => 'addMod_texte',
            'note' => 'addMod_note',
            'titre' => 'addMod_titre',
            'lien' => 'addMod_lien',
            'contact' => 'addMod_contact',
            'source' => 'addMod_source',
            'author' => 'addMod_author',
            'separ' => 'addMod_separ',
            'image' => 'addMod_file',
            'video' => 'addMod_file',
            'son' => 'addMod_file',
            'html' => 'addMod_file',
            'objet' => 'addMod_file'
        ];


        //Choix du fichier json selon le mod
        if(in_array($params['type'], array('contact', 'source', 'author'))) {
            $pj = $params['type'];
            $path = $rootPath.'/projet_'.$params['project'].'/res';
            $toOpen = $path.'/info.json';
        }else {
            $pj = 'tp';
            $toOpen = $path.'/tp.json';
        }

        if(!($json = file_get_contents($toOpen)))
            return error('Impossible de récupérer le fichier '.$toOpen);
        if(($json = json_decode($json, true)) === NULL)
            return error('Impossible de décoder le fichier '.$toOpen);


        //Nouvel id ?
        //id = kX
        if($params['mod'] == '0') {
            $n_key = 0;
            foreach($json[$pj] as $key=>$value) {
                $val = intval(substr($key, 1));
                if($val > $n_key)
                    $n_key = $val;
            }
            $n_key++;
            $params['mod'] = 'k'.$n_key;
        }else {
            $params['mod'] = 'k'.$params['mod'];
        }

        if(array_key_exists($params['mod'], $json[$pj])) {
            $s_mod = $json[$pj][$params['mod']];
        }
        else {
            $s_mod = null;
        }

        $ret = $modList[$params['type']]($path, $s_mod, $params['type']);
        //erreur ?
        if(gettype($ret) == 'string')
            return error($ret);

        $json[$pj][$params['mod']] = $ret;

        $json = json_encode($json);
        if($json == false)
            return error('Impossible d\'encoder le nouveau fichier '.$path.'/tp.json');

        $ret = writeToFile($toOpen, $json);
        if($ret !== false)
            return error($ret);

//Retourner le numéro associé à l'élément créé/modifié
        return $pj.'_'.$params['mod'];
    }

    function addMod_texte () {
        $json = array();

        if(!isset($_POST['ftexte']))
            return 'Paramètre ftexte manquant !';
        $texte = secVar($_POST['ftexte']);

        $json['type'] = 'texte';
        $json['texte'] = $texte;

        return $json;
    }

    function addMod_note () {
        $json = array();

        if(!isset($_POST['texte']))
            return 'Paramètre texte manquant !';
        $texte = secVar($_POST['texte']);
        if(!isset($_POST['note']))
            return 'Paramètre note manquant !';
        $note = secVar($_POST['note']);

        $json['type'] = 'note';
        $json['texte'] = $texte;
        $json['note'] = $note;

        return $json;
    }

    function addMod_separ () {
        $json = array();

        if(!isset($_POST['separ']))
            return 'Paramètre separ manquant !';
        $separ = secVar($_POST['separ']);

        $json['type'] = 'separ';
        $json['separ'] = $separ;

        return $json;
    }

    function addMod_titre() {
        $json = array();

        if(!isset($_POST['titre']))
            return 'Paramètre titre manquant !';
        $titre = secVar($_POST['titre']);
        if(!isset($_POST['taille']))
            return 'Paramètre taille manquant !';
        $taille = secVar($_POST['taille']);

        $json['type'] = 'titre';
        $json['taille'] = $taille;
        $json['titre'] = $titre;

        return $json;
    }

    function addMod_lien() {
        $json = array();

        $params = array('titre', 'lien');
        $values = array();
        foreach($params as $param) {
            if(!isset($_POST[$param])){
                return 'Paramètre '.$param.' manquant';
            }
            $values[$param] = secVar($_POST[$param]);
        }
        foreach($params as $param) {
            $json[$param] = $values[$param];
        }

        $json['type'] = 'lien';

        return $json;
    }

    function addMod_contact () {
        $json = array();

        $params = array('nom', 'structure', 'lieu', 'url', 'phone', 'email',
            'description');
        $values = array();
        foreach($params as $param) {
            if(!isset($_POST[$param])){
                return 'Paramètre '.$param.' manquant';
            }
            $values[$param] = secVar($_POST[$param]);
        }
        if(isset($_POST['partner'])) {
            $json['partner'] = 'true';
        }else {
            $json['partner'] = 'false';
        }

        foreach($params as $param) {
            $json[$param] = $values[$param];
        }

        $json['type'] = 'contact';

        return $json;
    }
    function addMod_source ($path, $mod) {
        $json = array();

        $params = array('nom', 'ressource', 'description');
        $values = array();
        foreach($params as $param) {
            if(!isset($_POST[$param])){
                return 'Paramètre '.$param.' manquant';
            }
            $values[$param] = secVar($_POST[$param]);
        }

        if(isset($_FILES['__file']['tmp_name'])) {
            if(!is_uploaded_file($_FILES['__file']['tmp_name'])) {
                return 'Fichier '.secVar($_FILES['__file']['name']).
                    ' non uploadé';
            }

            $imgName = my_uploadFile($_FILES['__file'],  $path, '');
            //erreur
            if(preg_match('/^(\[ERROR\])/', $imgName) == 1) {
                return $imgName;
            }
            $imgName = explode('.', $imgName);
            //On supprime ensuite l'ancien fichier !
            if($mod != null) {
                if($mod['src'] != $imgName[1].'.'.$imgName[2]) { //Que si l'ancien était différent
                    if(!unlink($path.'/'.$mod['src'])) {

                    }
                        //return 'Impossible de supprimer l\'ancien icône, \
                        //    veuillez le faire manuellement';
                }
            }
        }//Fichier facultatif

        //modif mais pas l'image
        if(!isset($imgName)) {
            if($mod['src'] == null)
                $json['src'] = '';
            else
                $json['src'] = $mod['src'];
        }
        //ajout ou modif de l'image
        else {
            $json['src'] = $imgName[1].'.'.$imgName[2];
        }

        foreach($params as $param) {
            $json[$param] = $values[$param];
        }

        $json['type'] = 'source';

        return $json;
    }
    function addMod_author () {
        $json = array();

        $params = array('nom', 'email', 'description');
        $values = array();
        foreach($params as $param) {
            if(!isset($_POST[$param])){
                return 'Paramètre '.$param.' manquant';
            }
            $values[$param] = secVar($_POST[$param]);
        }

        foreach($params as $param) {
            $json[$param] = $values[$param];
        }

        $json['type'] = 'author';

        return $json;
    }

    function addMod_file ($path, $mod, $type) {
        $json = array();

        $params = array('nom', 'legende', 'source');
        $values = array();
        foreach($params as $param) {
            if(!isset($_POST[$param])){
                return 'Paramètre '.$param.' manquant';
            }
            $values[$param] = secVar($_POST[$param]);
        }

        //Rétrocompatibilité : création du dossier html
        if($type == 'html') {
            if(file_exists($path.'/'.$type) == false) { //On n'écrase rien !
                if(($ret = my_mkdir($path.'/'.$type)) != false) {
                    return error($ret);
                }
            }
        }

        if(isset($_FILES['__file']['tmp_name'])) {
            if(!is_uploaded_file($_FILES['__file']['tmp_name'])) {
                return 'Fichier '.secVar($_FILES['__file']['name']).
                    ' non uploadé';
            }

            $imgName = my_uploadFile($_FILES['__file'],  $path.'/'.$type, false);
            //erreur
            if(preg_match('/^(\[ERROR\])/', $imgName) == 1) {
                return $imgName;
            }
            $imgName = explode('.', $imgName);
            //On supprime ensuite l'ancien fichier !
            if($mod != null) {
                if($mod['src']  != $imgName[1].'.'.$imgName[2]) { //Que si l'ancien était différent
                    if(!unlink($path.'/'.$type.'/'.$mod['src'] )) {

                    }
                        //return 'Impossible de supprimer l\'ancien icône, \
                        //    veuillez le faire manuellement';
                }
            }
        }else if($mod == null) {
            return 'Fichier '.$type.' manquant';
        }

        //modif mais pas l'image
        if(!isset($imgName)) {
            $json['src'] = $mod['src'];
            if($mod['mime'] == null) { //Rétro-compatibilité
                $json['mime'] = 'application/octet-stream';
            }else {
                $json['mime'] = $mod['mime'];
            }
        }
        //ajout ou modif de l'image
        else {
            $json['src'] = $imgName[1].'.'.$imgName[2];
            $json['mime'] = $imgName[0];
        }

        foreach($params as $param) {
            $json[$param] = $values[$param];
        }
        $json['type'] = $type;


        return $json;
    }
?>