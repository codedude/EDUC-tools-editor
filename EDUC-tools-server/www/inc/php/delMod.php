<?php
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
	header('Content-Type: text/plain; charset=utf-8');

	require_once('fun.php');

    $ret = fun();
    echo $ret;

    function fun() {
        global $rootPath;

//Récupère les paramètres et les sécurise
        //paramètres communs et obligatoires !
        $params = array('project', 'part', 'chap', 'type', 'mod');
        foreach($params as $param) {
            if(!isset($_GET[$param]))
                return error('Paramètre '.$param.' manquant');

            $params[$param] = secVar($_GET[$param]);
        }
        $path = $rootPath.'/projet_'.$params['project']
            .'/partie_'.$params['part'].'/chapitre_'.$params['chap'];


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
        if(($json = json_decode($json)) === NULL)
            return error('Impossible de décoder le fichier '.$toOpen);

        $params['mod'] = 'k'.$params['mod'];

        //Fichier à supprimer
        $toDel = $json->{$pj}->{$params['mod']}->{'src'};

        unset($json->{$pj}->{$params['mod']});

        $json = json_encode($json);
        if($json == false)
            return error('Impossible d\'encoder le nouveau fichier '.$toOpen);

        $ret = writeToFile($toOpen, $json);
        if($ret !== false)
            return error($ret);

        //Supprimer le fichier une fois le json modifié
        if($toDel != null) {
            if($params['type'] == 'source') {
                if(!unlink($path.'/'.$toDel)){
                    //pas grave
                }
            }else {
                if(!unlink($path.'/'.$params['type'].'/'.$toDel)){
                    //pas grave
                }
            }

        }
//Retourner le numéro associé à l'élément supprimé
        return $pj.'_'.$params['mod'];
    }
?>