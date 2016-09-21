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

    $r = fun();
    echo $r;

    function fun() {
        global $rootPath, $tmpPath;
        $r;

        //Fichier racine inexistant -> on le crée
        if(!is_dir($rootPath)) {
            $r = my_mkdir($rootPath);
            if($r != false) {
                return error($r);
            }
            $new = true;
        }
        //Fichier tmp inexistant -> on le crée
        if(!is_dir($tmpPath)) {
            $r = my_mkdir($tmpPath);
            if($r != false) {
                return error($r);
            }
        }

        //1ère connexion -> aucun projet
        if(isset($new)) {
            $r = 'new';
        }
        else {
            $r = 'old';
        }

        return $r;
    }
?>