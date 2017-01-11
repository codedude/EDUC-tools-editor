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

        if(!isset($_GET['dir'])) {
            return error('Paramètre dir manquant');
        }
        $dir = secVar($_GET['dir']);
        $type = secVar($_GET['type']);

        $path = (strlen($dir) == 0) ? $rootPath : $rootPath.'/'.$dir;

        $r = my_scandir($path, '#', $type);
        if($r === false) {
            return error('Impossible de lire le contenu du dossier '.$path);
        }

        return $r;
    }
?>