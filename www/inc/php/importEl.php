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
        global $rootPath, $tmpPath;

//Récupère les paramètres et les sécurise
    //paramètres obligatoires !
        $params = array();
        if(!isset($_POST['action'])) {
            return error('Paramètre action manquant');
        }
        $params['action'] = secVar($_POST['action']);
        $params['action'] = ($params['action'] == 'import')?true:false;
        if($params['action'] == false) {
            return error('Paramètre action invalide');
        }

        $params['path'] = $rootPath;
        $retid = '';
    //Path d'import (facultatif)
        /* Import depuis racine, projet ou partie */
        if(isset($_POST['project'])) {
            $params['project'] = secVar($_POST['project']);
            $retid = $params['project'].'#';
            $params['path'] = $params['path'].'/projet_'.$params['project'];
            if(isset($_POST['part'])) {
                $params['part'] = secVar($_POST['part']);
                $retid = $retid.$params['part'].'#';
                $params['path'] = $params['path'].'/partie_'.$params['part'];
            }
        }

    //Vérif du fichier (obligatoire)
        if(!isset($_FILES['__file'])) {
            return error('Paramètre __file manquant');
        }
        if(!is_uploaded_file($_FILES['__file']['tmp_name'])) {
            return error('Archive '.secVar($_FILES['__file']['tmp_name'])
                .' non uploadée');
        }
        $params['file'] = $_FILES['__file'];


        if(!is_dir($params['path']))
            return error('Le dossier de destination '.$params['path']
                .' est invalide');

        $zip = new ZipArchive();

        if($zip->open($params['file']['tmp_name']) !== true)
            return error('Impossible d\'ouvrir l\'archive');


    /* On vérifie si on importe une bonne archie
        (pas de partie dans un chapitre par exemple)
    */
        $dir = trim($zip->getNameIndex(0), '/');
        $ret = explode('_', $dir);

        //chapitre
        if(array_key_exists('part', $params)) {
            if($ret[0] != 'chapitre')
                return error('Impossible d\'importer autre chose que
                    des chapitres');
        }
        //partie
        elseif(array_key_exists('project', $params)) {
            if($ret[0] != 'partie')
                return error('Impossible d\'importer autre chose que
                    des parties');
        }
        //projet
        else {
            if($ret[0] != 'projet')
                return error('Impossible d\'importer autre chose que
                    des projets');
        }


        // Si il existe déjà
        if(is_dir($params['path'].'/'.$dir)) {
            //Pour import projet, on cherche un nouvel id valide
            if(!array_key_exists('project', $params)) {
                $new_id = 1;
                $nodes = scandir($rootPath);
                for(; $new_id<100; $new_id++) {
                    if(!in_array('projet_'.$new_id, $nodes))
                        break;
                }
                if($new_id == 100) {
                    return error('Nombre maximal de projets atteint');
                }
                $n_dir = $ret[0].'_'.$new_id;
                $ret[1] = $new_id;
            }
            //Partie ou chapitre
            else {
                if(isset($_POST['num']) && strlen($_POST['num']) > 0) {
                    $params['num'] = intval(secVar($_POST['num']));

                    $verif = true;
                    //Vérif la borne inférieur, ! aux parties
                    if(array_key_exists('project', $params) &&
                        !array_key_exists('part', $params)) {
                        if($params['num'] < 0)
                            $verif = false;
                        $checkType = true;
                    }else {
                        if($params['num'] <= 0)
                            $verif = false;
                    }
                    if($params['num'] > 99)
                        $verif = false;

                    if($verif == false) {
                        return error('Paramètre numéro invalide');
                    }

                    //Si le num est valide
                    if(preg_match('/^[0-9]{1,2}$/', $params['num']) != 1) {
                        return error('Paramètre num invalide');
                    }

                    $n_dir = $ret[0].'_'.$params['num'];
                    $ret[1] = $params['num'];
                }else {
                    return error('Le dossier à importer ('.$dir.') existe déjà !
                        Vous pouvez éventuellement le renommer');
                }
            }
            //Renommage impossible
            if(is_dir($params['path'].'/'.$n_dir)) {
                return error('Impossible de renommer le dossier '.$dir.' en
                    '.$n_dir.'. Il existe déjà');
            }
            //Extraction dans tmp, rename puis déplacement
            if(!$zip->extractTo($tmpPath)) {
                $zip->close();
                return error('Impossible d\'extraire l\'archive dans le dossier '
                    .$tmpPath);
            }
            //$tmpPath.'/'.$n_dir déplacement
            if(!rename($tmpPath.'/'.$dir, $params['path'].'/'.$n_dir)) {
                return error('Impossible de renommer le dossier '
                    .$tmpPath.'/'.$dir);
            }
            $dir = $n_dir;

            //Il faut modifier le config.json maintenant !
            $json = file_get_contents($params['path'].'/'.$n_dir.'/config.json');
            if(!$json) {
                return error('Impossible de lire le fichier '
                .$params['path'].'/'.$n_dir.'/config.json');
            }
            if(($json = json_decode($json, true)) == null) {
                return error('Impossible de décoder le fichier '
                    .$params['path'].'/'.$n_dir.'/config.json');
            }

            //Modif part general to classic !
            if(isset($checkType)) {
                //classic to general
                if(''.$ret[1] == '0') {
                    $json['type'] = 'general';
                    $json['image'] = '';
                }
                //general to classic
                else {
                    $json['type'] = 'classic';
                }

            }
            $json['numero'] = $ret[1];

            $json = json_encode($json);
            if(($err = writeToFile($params['path'].'/'.$n_dir.'/config.json',
                $json)) !== false) {
                return error($err);
            }
        }else {
            if(!$zip->extractTo($params['path'])) {
                $zip->close();
                return error('Impossible d\'extraire l\'archive dans le dossier '
                    .$params['path']);
            }
        }

        $zip->close();

        my_chmod($params['path'].'/'.$dir);
        $retid = $retid.''.$ret[1];

        return $retid;
    }
?>