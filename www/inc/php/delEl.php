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

        //Le seul obligatoire
        if(!isset($_GET['project'])) {
        	return error('Paramètre project manquant');
        }
        $project = secVar($_GET['project']);

        $path = $rootPath.'/projet_'.$project;
        if(isset($_GET['part'])) {
        	$part = secVar($_GET['part']);
        	$path = $path.'/partie_'.$part;
        	if(isset($_GET['chap'])) {
        		$chap = secVar($_GET['chap']);
        		$path = $path.'/chapitre_'.$chap;
    		}
        }

        if(my_rmdir($path) == false) {
        	return error('Impossible de supprimer le dossier '.$path);
        }

        return 'OK';
    }
?>