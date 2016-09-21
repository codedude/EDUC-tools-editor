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
        $params = array('project', 'part', 'chap', 'type', 'mod', 'new');
        foreach($params as $param) {
            if(!isset($_GET[$param]))
                return error('Paramètre '.$param.' manquant');

            $params[$param] = secVar($_GET[$param]);
        }
        $path = $rootPath.'/projet_'.$params['project']
            .'/partie_'.$params['part'].'/chapitre_'.$params['chap'];


        if(!($json = file_get_contents($path.'/tp.json')))
            return error('Impossible de récupérer le fichier '.$path.'/tp.json');
        if(($json = json_decode($json)) === NULL)
            return error('Impossible de décoder le fichier '.$path.'/tp.json');

        //Quelle partie du json ?
        $pj = 'tp';

        $params['mod'] = 'k'.$params['mod'];
        $params['new'] = 'k'.$params['new'];

        //Echange des lignes
        $tmp = $json->{$pj}->{$params['mod']};
        $json->{$pj}->{$params['mod']} = $json->{$pj}->{$params['new']};
        $json->{$pj}->{$params['new']} = $tmp;

        $json = json_encode($json);
        if($json == false)
            return error('Impossible d\'encoder le nouveau fichier '.$path.'/tp.json');

        $ret = writeToFile($path.'/tp.json', $json);
        if($ret !== false)
            return error($ret);

//Retourner le numéro associé à l'élément supprimé
        return $pj.'_'.$params['mod'];
    }
?>