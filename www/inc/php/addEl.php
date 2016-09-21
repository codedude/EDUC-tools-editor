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
        if(!isset($_POST['action'])) {
            return error('Paramètre action manquant');
        }
        $action = (secVar($_POST['action']) == 'add')?true:false;

        if(!isset($_POST['project'])) {
            return error('Paramètre project manquant');
        }
        $project = secVar($_POST['project']);

        if(isset($_POST['part'])) {
            $fields = array('nom', 'description', 'type', 'numero');
            $part = secVar($_POST['part']);
            if(isset($_POST['chap'])) {
                $fields = array('nom', 'description', 'numero');
                $chap = secVar($_POST['chap']);
            }
        }else { //Projet
            $fields = array('nom', 'description', 'type');

        }


//Vérifie les paramètres
        $params = array();
        foreach($fields as $value) {
            //Valeur ?
            if(isset($_POST[$value])) {
                $params[$value] = secVar($_POST[$value]);
                    //Regex côté serveur ?
                    //return error('Paramètre '.$value.' invalide');
            //Manquant
            }else {
                return error('Paramètre '.$value.' manquant');
            }
        }

//Il faut trouver un id pour le projet
        if($project == '0') {
            $new_id = 1;
            $nodes = scandir($rootPath);
            for(; $new_id<100; $new_id++) {
                if(!in_array('projet_'.$new_id, $nodes))
                    break;
            }
            if($new_id == 100) {
                return error('Nombre maximal de projets atteint');
            }
            $project = $new_id;
            $params['numero'] = $new_id; //Juste pour add
        }else if($project != '0' && !isset($part)) {
            $params['numero'] = $project;
        }

        $old_path = $rootPath.'/projet_'.$project;
        $new_path = $rootPath.'/projet_'.$project;
        $idRet = $project.'';

        //Création des chemins et id de retour

        if(isset($part)) {
            $old_path = $old_path.'/partie_'.$part;
            $new_path = $new_path.'/partie_';
            if(isset($chap)) {
                $idRet = $idRet.'#'.$part.'#'.$params['numero'];
                $old_path = $old_path.'/chapitre_'.$chap;
                $new_path = $new_path.$part.'/chapitre_'.$params['numero'];
            }
        }


//Récup l'ancien json
        if($action) {
            $json = array();
        }else {
            $json = file_get_contents($old_path.'/config.json');
            if(!$json) {
                return error('Impossible de lire le fichier '.$old_path
                    .'/config.json');
            }
            if(($json = json_decode($json, true)) == null) {
                return error('Impossible de décoder le fichier '.$old_path
                    .'/config.json');
            }
        }

//Part généralités
        if(isset($part) && !isset($chap)) { //Add/edit part
            if($params['type'] == 'general') { //Que sur généralités
                if(file_exists($old_path.'/partie_0')) { //En ajout
                    if($action)
                        return error('Le dossier généralités est unique (Partie 0)');
                }
                //En edit
                else {
                    //Peu importe le numéro entré, le type est plus fort
                    $params['numero'] = 0;

                    //Passage d'une partie classique à généralité
                    if(!$action) {
                        if(file_exists($old_path.'/'.$json['image'])  && strlen($json['image']) > 0) {
                            unlink($old_path.'/'.$json['image']);
                        }
                        $json['image'] = '';
                    }
                }
            }else {
                if($params['numero'] <= 0) {
                    return error('Numéro 0 réservé à la partie Généralités');
                }
            }
            $idRet = $idRet.'#'.$params['numero'];
            $new_path = $new_path.$params['numero'];
        }else {
            if($params['numero'] < 1 || $params['numero'] > 99) {
                return error('Numéro invalide');
            }
        }

//Fichier ?
        if(isset($_FILES['__file'])) {
            if(!is_uploaded_file($_FILES['__file']['tmp_name']))
                return error('Image '.secVar($_FILES[$value]['tmp_name'])
                    .' non uploadée');

            //Pas d'image pour part généralité
            if(isset($chap)) {
                $params['img'] = $_FILES['__file'];
            }else if(isset($part)) { //Parties
                //Pas d'image pour généralité
                if($params['type'] != 'general')
                    $params['img'] = $_FILES['__file'];
            }else { //Projets
                $params['img'] = $_FILES['__file'];
            }
        }else {

        }

/**************

    RIEN N'EST MODIFIE JUSQU'ICI !!!

***************/
        function CLEAN ($ACT, $old, $new) {
            if(gettype($ACT) == 'boolean') {
                if($ACT) {
                    rename($old, $new);
                }else {
                    my_rmdir($old);
                }
            }else {
                //Rien à faire
            }
        }

//Création de l'arborescence
        if($action) {
            if(file_exists($new_path)) { //On n'écrase rien !
                return error('Le dossier '.$new_path.' existe déjà');
            }
            if(($ret = my_mkdir($new_path)) != false)
                return error($ret);
            $renamed = false;
            if(isset($chap)) {
                //On crée les dossier d'un chapitre
                $arbo = array('image', 'video', 'son', 'objet', 'html');
                foreach($arbo as $dir) {
                    if(($ret = my_mkdir($new_path.'/'.$dir)) != false) {
                        CLEAN($renamed, $new_path);
                        return error($ret);
                    }
                }
                $tp = '{"tp":{}}';
                if(($ret = writeToFile($new_path.'/tp.json', $tp)) !== false) {
                    CLEAN($renamed, $new_path);
                    return error($ret);
                }
            }
            if(!isset($part)) {
                //On crée le dossier res (logos des partenaires, info.json...)
                if(($ret = my_mkdir($new_path.'/res')) != false)
                    return error($ret);
                //On crée le fichier res/info.json d'un projet
                $info = '{"contact":{},"source":{},"author":{}}';
                if(($ret = writeToFile($new_path.'/res/info.json', $info)) !== false) {
                    CLEAN($renamed, $new_path);
                    return error($ret);
                }
            }
        }else { //modification
            if(!file_exists($old_path)) { //On n'écrase pas en ajout !
                return error('Le dossier '.$old_path.' n\'existe pas');
            }
            //On renomme le dossier
            if(strcmp($old_path, $new_path) != 0) {
                if(!rename($old_path, $new_path)) {
                    CLEAN($renamed, $new_path);
                    return error('Impossible de renommer le dossier '.$old_path
                        .' en '.$new_path);
                }
                $renamed = true;
            }
        }
        $path = $new_path;

//Crée le nouveau json

        foreach($params as $key=>$value) {
            if($key == 'img')
                continue;
            $json[$key] = $value;
        }


        //Upload de l'image
        //Test du nom/taille/type
        //Envoi + renommage
            //On écrase l'ancienne
            //$params['img'] contient l'image
        if(array_key_exists('img', $params)) {
            //Supprime l'ancienne icône
            if(!$action) {
                if(file_exists($path.'/'.$json['image'])  && strlen($json['image']) > 0) {
                    unlink($path.'/'.$json['image']);
                }
            }

            $imgName = my_uploadFile($params['img'], $path, 'icone');
            //erreur
            if(preg_match('/^(\[ERROR\])/', $imgName) == 1) {
                CLEAN($renamed, $path, $old_path);
                return error($imgName);
            }
            $imgName = explode('.', $imgName);
            $json['image'] = $imgName[1].'.'.$imgName[2];
        }else {
            if(!array_key_exists('image', $json)) {
                $json['image'] = ''; //Présent par défaut
            }
            else {
                //On demande à supprimer le fond d'écran d'un projet
                if(isset($_POST['check'])) {
                    if(file_exists($path.'/'.$json['image']) && strlen($json['image']) > 0) {
                        unlink($path.'/'.$json['image']);
                    }
                    $json['image'] = '';
                }
            }
        }

        $json = json_encode($json);

//Ecrit le nouveau json
        if(($ret = writeToFile($path.'/config.json', $json)) !== false) {
            CLEAN($renamed, $path, $old_path);
            return error($ret);
        }

//Retourner le numéro associé à l'élément créer
        return $idRet;
    }
?>