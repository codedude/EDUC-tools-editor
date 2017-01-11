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

    $rootPath = '../../EDUC-tools';
    $tmpPath = '../../tmp';

    $maxFileSize = 210000000; //200Mo

    //Minuscule ou majuscule
    $types = [
    	'image' => [
            'pjpeg', 'jpeg', 'png', 'gif', 'bmp', 'x-ms-bmp'
        ],
    	'video' => [
            'mp4'
        ],
    	'audio' => [
            'mp3', 'mpeg3', 'x-mpeg3', 'mpeg', 'ogg'
        ],
    	'text' => [
            'plain', 'html'
        ],
    	'application' => [
            'ifc', 'pdf', 'tbp', 'octet-stream', 'zip',
            'msword', 'vnd.openxmlformats-officedocument.wordprocessingml.document',
            'vnd.ms-excel', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'vnd.ms-powerpoint', 'vnd.openxmlformats-officedocument.presentationml.presentation',

        ]
    ];

    function my_chmod($dir) {
    	if (is_dir($dir)) {
			$objects = scandir($dir);
			foreach ($objects as $object) {
				if ($object != '.' && $object != '..') {
					if (filetype($dir.'/'.$object) == 'dir') {
						my_chmod($dir.'/'.$object);
					}
					else{
						chmod($dir.'/'.$object, 0775);
					}
				}
			}

			reset($objects);
			chmod($dir, 0775);
		}
		chmod($dir, 0775);
    }

    function error($str) {
    	return '[ERROR] '.$str;
    }

	function my_uploadFile($file, $path, $name) {
		global $types, $maxFileSize;

		$imgName = secVar($file['name']);
		if(preg_match('/^[0-9a-zA-Z_\- éèçàöüäôûâêëùîï+ÄÂÀÈÉÇÔÛÎÊÖÜÏË]+.[a-zA-Z0-9]{2,5}$/', $imgName) != 1){
            return error('Nom de fichier invalide');
		}
		$mime = explode('/', $file['type']);
		if(!array_key_exists($mime[0], $types)) {
			return error('Type mime inconnu ('.$mime[0].')');
		}
		if(!in_array($mime[1], $types[$mime[0]])) {
            //Cas de l'ogg qui est repéré comme une vidéo !
            if($mime[1] == 'ogg' && strpos($path, 'son')) {
                $mime[0] = 'audio';
            }else {
                /*
                    On autorise tous les fichier pour objet !
                */
                if(!strpos($path, 'objet')) {
                    return error('Type mime inconnu ('.
                        $mime[0].'/'.$mime[1].')');
                }
            }
		}

        if($file['size'] > $maxFileSize) {
            return error('Fichier trop volumineux (100Mo maximum)');
        }

		$imgName = explode('.', $imgName);
		$ext = strtolower($imgName[1]);

		//On prend le nom d'origine si rien n'est spécifié !
		if(gettype($name) != 'string') {
			$name = $imgName[0];
		}

        if(!move_uploaded_file($file['tmp_name'], $path.'/'.$name.'.'.$ext)) {
			return error('Erreur lors de l\'upload du fichier '
				.$path.'/'.$name.'.'.$ext);
		}

		my_chmod($path.'/'.$name.'.'.$ext);

		return $mime[0].'/'.$mime[1].'.'.$name.'.'.$ext;
	}

    function my_scandir($path, $separ, $type) {
    	global $rootPath;

    	$nodes = scandir($path);
    	if(!$nodes) {
    		return false;
    	}
        unset($nodes[0], $nodes[1]);

        $n_nodes = array();
        foreach($nodes as $node) {
        	//On ajoute que les dossiers
            if(is_dir($path.'/'.$node) && strpos($node, $type) !== false)
                $n_nodes[] = $node;
        }

        $ret = '';
        foreach($n_nodes as $node)
            $ret = $ret.$separ.$node;

        return $ret;
    }
    function my_mkdir($dir) {
    	if(is_dir($dir)) {
    		return 'Le dossier '.$dir.' existe déjà';
    	}
    	if(!mkdir($dir)) {
    		return 'Impossible de créer le dossier '.$dir;
    	}
    	my_chmod($dir);

    	return false;
    }

	function my_rmdir($dir) {
		if (is_dir($dir)) {
			$objects = scandir($dir);
			foreach ($objects as $object) {
				if ($object != '.' && $object != '..') {
					if (filetype($dir.'/'.$object) == 'dir') {
						if(!my_rmdir($dir.'/'.$object))
							return false;
					}
					else{
						if(!unlink($dir.'/'.$object))
							return false;
					}
				}
			}

			reset($objects);
			if(!rmdir($dir))
				return false;

			return true;
		}

		return false;
	}

	function secVar($var) {
		return trim(stripslashes(htmlspecialchars($var, ENT_QUOTES)));
	}

	function unZip($file, $path) {
		$zip = new ZipArchive();

		if($zip->open($file) !== true)
			return false;
		if(!is_dir($path))
			return false;

		$dir = trim($zip->getNameIndex(0), '/');

		if(!$zip->extractTo($path)) {
			return false;
		}

		$zip->close();

		return $dir;
	}
	//Zip tout un dossier et ses sous-dossiers en gardant l'arboressence
	function zipFile($path, $root, $name) {
		global $tmpPath;

		$zip = new ZipArchive();

		if(!is_dir($path))
			return false;

		if($zip->open($tmpPath.'/'.$name.'.zip',
			ZIPARCHIVE::CREATE | ZIPARCHIVE::OVERWRITE) !== true)
			return false;

		$zip->addEmptyDir($root);
		__zipFile($zip, $path, $root.'/');

		$zip->close();

		my_chmod('../../tmp/'.$name.'.zip');

		return true;
	}
	function __zipFile($zip, $path, $current) {
		$nodes = scandir($path);
		unset($nodes[0], $nodes[1]);

		$file;
		foreach($nodes as $node) {
			$file = $path.'/'.$node;
			if(is_file($file)) {
	            $zip->addFile($file, $current.$node);
	        }
	        else if(is_dir($file)) {
	        	$zip->addEmptyDir($current.$node);
	        	__zipFile($zip, $file, $current.$node.'/');
	        }
		}
	}

	function writeToFile($path, $data) {
		$config = fopen($path, 'w');

		if($config == false) {
			return 'Impossible d\'ouvrir le fichier '.$path;
		}
		if(fwrite($config, $data) == false) {
			fclose($config);
			return 'Impossible d\'écrire dans le fichier '.$path;
		}
		fclose($config);

		my_chmod($path);

		return false;
	}

    function purifyString($text) {
        $text = iconv("UTF-8", "UTF-8//IGNORE", $text);
        $text = preg_replace('/\s+/', '_', $text);

        return $text;
    }
?>
