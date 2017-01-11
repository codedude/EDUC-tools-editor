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

        //Le seul obligatoire
        if(!isset($_GET['project'])) {
        	return error('Paramètre project manquant');
        }
        $project = secVar($_GET['project']);

        $path = $rootPath.'/projet_'.$project;
        $rootName = 'projet_'.$project;
        $name = 'EDUC-tools-'.$project;
        if(isset($_GET['part'])) {
        	$part = secVar($_GET['part']);
        	$path = $path.'/partie_'.$part;
            $rootName = 'partie_'.$part;
            $name = $name.'-P'.$part;
        	if(isset($_GET['chap'])) {
        		$chap = secVar($_GET['chap']);
        		$path = $path.'/chapitre_'.$chap;
                $rootName = 'chapitre_'.$chap;
                $name = $name.'-C'.$chap;
    		}
        }

        $toOpen = $path.'/config.json';
        if(!($json = file_get_contents($toOpen)))
            return error('Impossible de récupérer le fichier '.$toOpen);
        if(($json = json_decode($json, true)) === NULL)
            return error('Impossible de décoder le fichier '.$toOpen);

        $zip_name = '_'.purifyString($json['nom']);
        $name .= $zip_name;


        if(zipFile($path, $rootName, $name) == false) {
        	return error('Impossible de ziper le dossier '.$path);
        }

        //On retourne l'adresse du zip
        return $name.'.zip';
    }

?>
