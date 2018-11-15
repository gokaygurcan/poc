<?php
class Compression {
    static $huffmanTable = array(
        array(
            0x02,
            0x00,
        ),
        array(
            0x05,
            0x1F,
        ),
        array(
            0x06,
            0x22,
        ),
        array(
            0x07,
            0x34,
        ),
        array(
            0x07,
            0x75,
        ),
        array(
            0x06,
            0x28,
        ),
        array(
            0x06,
            0x3B,
        ),
        array(
            0x07,
            0x32,
        ),
        array(
            0x08,
            0xE0,
        ),
        array(
            0x08,
            0x62,
        ),
        array(
            0x07,
            0x56,
        ),
        array(
            0x08,
            0x79,
        ),
        array(
            0x09,
            0x19D,
        ),
        array(
            0x08,
            0x97,
        ),
        array(
            0x06,
            0x2A,
        ),
        array(
            0x07,
            0x57,
        ),
        array(
            0x08,
            0x71,
        ),
        array(
            0x08,
            0x5B,
        ),
        array(
            0x09,
            0x1CC,
        ),
        array(
            0x08,
            0xA7,
        ),
        array(
            0x07,
            0x25,
        ),
        array(
            0x07,
            0x4F,
        ),
        array(
            0x08,
            0x66,
        ),
        array(
            0x08,
            0x7D,
        ),
        array(
            0x09,
            0x191,
        ),
        array(
            0x09,
            0x1CE,
        ),
        array(
            0x07,
            0x3F,
        ),
        array(
            0x09,
            0x90,
        ),
        array(
            0x08,
            0x59,
        ),
        array(
            0x08,
            0x7B,
        ),
        array(
            0x08,
            0x91,
        ),
        array(
            0x08,
            0xC6,
        ),
        array(
            0x06,
            0x2D,
        ),
        array(
            0x09,
            0x186,
        ),
        array(
            0x08,
            0x6F,
        ),
        array(
            0x09,
            0x93,
        ),
        array(
            0x0A,
            0x1CC,
        ),
        array(
            0x08,
            0x5A,
        ),
        array(
            0x0A,
            0x1AE,
        ),
        array(
            0x0A,
            0x1C0,
        ),
        array(
            0x09,
            0x148,
        ),
        array(
            0x09,
            0x14A,
        ),
        array(
            0x09,
            0x82,
        ),
        array(
            0x0A,
            0x19F,
        ),
        array(
            0x09,
            0x171,
        ),
        array(
            0x09,
            0x120,
        ),
        array(
            0x09,
            0xE7,
        ),
        array(
            0x0A,
            0x1F3,
        ),
        array(
            0x09,
            0x14B,
        ),
        array(
            0x09,
            0x100,
        ),
        array(
            0x09,
            0x190,
        ),
        array(
            0x06,
            0x13,
        ),
        array(
            0x09,
            0x161,
        ),
        array(
            0x09,
            0x125,
        ),
        array(
            0x09,
            0x133,
        ),
        array(
            0x09,
            0x195,
        ),
        array(
            0x09,
            0x173,
        ),
        array(
            0x09,
            0x1CA,
        ),
        array(
            0x09,
            0x86,
        ),
        array(
            0x09,
            0x1E9,
        ),
        array(
            0x09,
            0xDB,
        ),
        array(
            0x09,
            0x1EC,
        ),
        array(
            0x09,
            0x8B,
        ),
        array(
            0x09,
            0x85,
        ),
        array(
            0x05,
            0x0A,
        ),
        array(
            0x08,
            0x96,
        ),
        array(
            0x08,
            0x9C,
        ),
        array(
            0x09,
            0x1C3,
        ),
        array(
            0x09,
            0x19C,
        ),
        array(
            0x09,
            0x8F,
        ),
        array(
            0x09,
            0x18F,
        ),
        array(
            0x09,
            0x91,
        ),
        array(
            0x09,
            0x87,
        ),
        array(
            0x09,
            0xC6,
        ),
        array(
            0x09,
            0x177,
        ),
        array(
            0x09,
            0x89,
        ),
        array(
            0x09,
            0xD6,
        ),
        array(
            0x09,
            0x8C,
        ),
        array(
            0x09,
            0x1EE,
        ),
        array(
            0x09,
            0x1EB,
        ),
        array(
            0x09,
            0x84,
        ),
        array(
            0x09,
            0x164,
        ),
        array(
            0x09,
            0x175,
        ),
        array(
            0x09,
            0x1CD,
        ),
        array(
            0x08,
            0x5E,
        ),
        array(
            0x09,
            0x88,
        ),
        array(
            0x09,
            0x12B,
        ),
        array(
            0x09,
            0x172,
        ),
        array(
            0x09,
            0x10A,
        ),
        array(
            0x09,
            0x8D,
        ),
        array(
            0x09,
            0x13A,
        ),
        array(
            0x09,
            0x11C,
        ),
        array(
            0x0A,
            0x1E1,
        ),
        array(
            0x0A,
            0x1E0,
        ),
        array(
            0x09,
            0x187,
        ),
        array(
            0x0A,
            0x1DC,
        ),
        array(
            0x0A,
            0x1DF,
        ),
        array(
            0x07,
            0x74,
        ),
        array(
            0x09,
            0x19F,
        ),
        array(
            0x08,
            0x8D,
        ),
        array(
            0x08,
            0xE4,
        ),
        array(
            0x07,
            0x79,
        ),
        array(
            0x09,
            0xEA,
        ),
        array(
            0x09,
            0xE1,
        ),
        array(
            0x08,
            0x40,
        ),
        array(
            0x07,
            0x41,
        ),
        array(
            0x09,
            0x10B,
        ),
        array(
            0x09,
            0xB0,
        ),
        array(
            0x08,
            0x6A,
        ),
        array(
            0x08,
            0xC1,
        ),
        array(
            0x07,
            0x71,
        ),
        array(
            0x07,
            0x78,
        ),
        array(
            0x08,
            0xB1,
        ),
        array(
            0x09,
            0x14C,
        ),
        array(
            0x07,
            0x43,
        ),
        array(
            0x08,
            0x76,
        ),
        array(
            0x07,
            0x66,
        ),
        array(
            0x07,
            0x4D,
        ),
        array(
            0x09,
            0x8A,
        ),
        array(
            0x06,
            0x2F,
        ),
        array(
            0x08,
            0xC9,
        ),
        array(
            0x09,
            0xCE,
        ),
        array(
            0x09,
            0x149,
        ),
        array(
            0x09,
            0x160,
        ),
        array(
            0x0A,
            0x1BA,
        ),
        array(
            0x0A,
            0x19E,
        ),
        array(
            0x0A,
            0x39F,
        ),
        array(
            0x09,
            0xE5,
        ),
        array(
            0x09,
            0x194,
        ),
        array(
            0x09,
            0x184,
        ),
        array(
            0x09,
            0x126,
        ),
        array(
            0x07,
            0x30,
        ),
        array(
            0x08,
            0x6C,
        ),
        array(
            0x09,
            0x121,
        ),
        array(
            0x09,
            0x1E8,
        ),
        array(
            0x0A,
            0x1C1,
        ),
        array(
            0x0A,
            0x11D,
        ),
        array(
            0x0A,
            0x163,
        ),
        array(
            0x0A,
            0x385,
        ),
        array(
            0x0A,
            0x3DB,
        ),
        array(
            0x0A,
            0x17D,
        ),
        array(
            0x0A,
            0x106,
        ),
        array(
            0x0A,
            0x397,
        ),
        array(
            0x0A,
            0x24E,
        ),
        array(
            0x07,
            0x2E,
        ),
        array(
            0x08,
            0x98,
        ),
        array(
            0x0A,
            0x33C,
        ),
        array(
            0x0A,
            0x32E,
        ),
        array(
            0x0A,
            0x1E9,
        ),
        array(
            0x09,
            0xBF,
        ),
        array(
            0x0A,
            0x3DF,
        ),
        array(
            0x0A,
            0x1DD,
        ),
        array(
            0x0A,
            0x32D,
        ),
        array(
            0x0A,
            0x2ED,
        ),
        array(
            0x0A,
            0x30B,
        ),
        array(
            0x0A,
            0x107,
        ),
        array(
            0x0A,
            0x2E8,
        ),
        array(
            0x0A,
            0x3DE,
        ),
        array(
            0x0A,
            0x125,
        ),
        array(
            0x0A,
            0x1E8,
        ),
        array(
            0x09,
            0xE9,
        ),
        array(
            0x0A,
            0x1CD,
        ),
        array(
            0x0A,
            0x1B5,
        ),
        array(
            0x09,
            0x165,
        ),
        array(
            0x0A,
            0x232,
        ),
        array(
            0x0A,
            0x2E1,
        ),
        array(
            0x0B,
            0x3AE,
        ),
        array(
            0x0B,
            0x3C6,
        ),
        array(
            0x0B,
            0x3E2,
        ),
        array(
            0x0A,
            0x205,
        ),
        array(
            0x0A,
            0x29A,
        ),
        array(
            0x0A,
            0x248,
        ),
        array(
            0x0A,
            0x2CD,
        ),
        array(
            0x0A,
            0x23B,
        ),
        array(
            0x0B,
            0x3C5,
        ),
        array(
            0x0A,
            0x251,
        ),
        array(
            0x0A,
            0x2E9,
        ),
        array(
            0x0A,
            0x252,
        ),
        array(
            0x09,
            0x1EA,
        ),
        array(
            0x0B,
            0x3A0,
        ),
        array(
            0x0B,
            0x391,
        ),
        array(
            0x0A,
            0x23C,
        ),
        array(
            0x0B,
            0x392,
        ),
        array(
            0x0B,
            0x3D5,
        ),
        array(
            0x0A,
            0x233,
        ),
        array(
            0x0A,
            0x2CC,
        ),
        array(
            0x0B,
            0x390,
        ),
        array(
            0x0A,
            0x1BB,
        ),
        array(
            0x0B,
            0x3A1,
        ),
        array(
            0x0B,
            0x3C4,
        ),
        array(
            0x0A,
            0x211,
        ),
        array(
            0x0A,
            0x203,
        ),
        array(
            0x09,
            0x12A,
        ),
        array(
            0x0A,
            0x231,
        ),
        array(
            0x0B,
            0x3E0,
        ),
        array(
            0x0A,
            0x29B,
        ),
        array(
            0x0B,
            0x3D7,
        ),
        array(
            0x0A,
            0x202,
        ),
        array(
            0x0B,
            0x3AD,
        ),
        array(
            0x0A,
            0x213,
        ),
        array(
            0x0A,
            0x253,
        ),
        array(
            0x0A,
            0x32C,
        ),
        array(
            0x0A,
            0x23D,
        ),
        array(
            0x0A,
            0x23F,
        ),
        array(
            0x0A,
            0x32F,
        ),
        array(
            0x0A,
            0x11C,
        ),
        array(
            0x0A,
            0x384,
        ),
        array(
            0x0A,
            0x31C,
        ),
        array(
            0x0A,
            0x17C,
        ),
        array(
            0x0A,
            0x30A,
        ),
        array(
            0x0A,
            0x2E0,
        ),
        array(
            0x0A,
            0x276,
        ),
        array(
            0x0A,
            0x250,
        ),
        array(
            0x0B,
            0x3E3,
        ),
        array(
            0x0A,
            0x396,
        ),
        array(
            0x0A,
            0x18F,
        ),
        array(
            0x0A,
            0x204,
        ),
        array(
            0x0A,
            0x206,
        ),
        array(
            0x0A,
            0x230,
        ),
        array(
            0x0A,
            0x265,
        ),
        array(
            0x0A,
            0x212,
        ),
        array(
            0x0A,
            0x23E,
        ),
        array(
            0x0B,
            0x3AC,
        ),
        array(
            0x0B,
            0x393,
        ),
        array(
            0x0B,
            0x3E1,
        ),
        array(
            0x0A,
            0x1DE,
        ),
        array(
            0x0B,
            0x3D6,
        ),
        array(
            0x0A,
            0x31D,
        ),
        array(
            0x0B,
            0x3E5,
        ),
        array(
            0x0B,
            0x3E4,
        ),
        array(
            0x0A,
            0x207,
        ),
        array(
            0x0B,
            0x3C7,
        ),
        array(
            0x0A,
            0x277,
        ),
        array(
            0x0B,
            0x3D4,
        ),
        array(
            0x08,
            0xC0,
        ),
        array(
            0x0A,
            0x162,
        ),
        array(
            0x0A,
            0x3DA,
        ),
        array(
            0x0A,
            0x124,
        ),
        array(
            0x0A,
            0x1B4,
        ),
        array(
            0x0A,
            0x264,
        ),
        array(
            0x0A,
            0x33D,
        ),
        array(
            0x0A,
            0x1D1,
        ),
        array(
            0x0A,
            0x1AF,
        ),
        array(
            0x0A,
            0x39E,
        ),
        array(
            0x0A,
            0x24F,
        ),
        array(
            0x0B,
            0x373,
        ),
        array(
            0x0A,
            0x249,
        ),
        array(
            0x0B,
            0x372,
        ),
        array(
            0x09,
            0x167,
        ),
        array(
            0x0A,
            0x210,
        ),
        array(
            0x0A,
            0x23A,
        ),
        array(
            0x0A,
            0x1B8,
        ),
        array(
            0x0B,
            0x3AF,
        ),
        array(
            0x0A,
            0x18E,
        ),
        array(
            0x0A,
            0x2EC,
        ),
        array(
            0x07,
            0x62,
        ),
        array(
            0x04,
            0x0D,
        ),
    );

    public static function compress($source) {
        $tmp    = str_split($source, 2);
        $source = array();

        foreach ($tmp as $key => $value) {
            $source[] = hexdec($value);
        }

        $length  = count($source);
        $retval  = array();
        $current = $val = $cBits = 0;

        for ($i = 0; $i < $length; $i++) {
            $nrBits = (int) self::$huffmanTable[$source[$i]][0] - 1;
            $val    = (int) self::$huffmanTable[$source[$i]][1];

            for ($n = $nrBits; $n >= 0; $n--) {
                $x = ($val >> $n) % 2;
                $current <<= 1;
                $current += $x;
                $cBits++;

                if (8 == $cBits) {
                    $retval[] = $current;
                    $cBits    = 0;
                }
            }
        }

        $nrBits = (int) self::$huffmanTable[256][0] - 1;
        $val    = (int) self::$huffmanTable[256][1];

        for ($n = $nrBits; $n >= 0; $n--) {
            $x = ($val >> $n) % 2;
            $current <<= 1;
            $current += $x;
            $cBits++;

            if (8 == $cBits) {
                $retval[] = $current;
                $cBits    = 0;
            }
        }

        while (0 != $cBits) {
            $current <<= 1;
            $cBits++;

            if (8 == $cBits) {
                $retval[] = $current;
                $current  = 0;
                $cBits    = 0;
            }
        }

        $return = "";

        foreach ($retval as $key => $value) {
            $return .= chr($value);
        }

        return $return;
    }

    public static function decompress($source) {
        if (!is_array($source)) {
            $source = str_split($source, 2);
        }

        $m_tree = self::createTree();
        $retval      = array();
        $current     = $val     = 0;
        $length      = count($source);
        $currentNode = $m_tree;

        for ($i = 0; $i < $length; $i++) {
            $current = hexdec($source[$i]);

            for ($n = 7; $n >= 0; $n--) {
                $x = ($current >> $n) % 2;

                if (0 == $x) {
                    $currentNode = $currentNode->right;
                }
                else {
                    $currentNode = $currentNode->left;
                }

                if (true == $currentNode->isLeaf) {
                    $val         = $currentNode->value;
                    $currentNode = $m_tree;

                    if (256 == $val) {
                        $return = [];

                        foreach ($retval as $key => $value) {
                            $return[] = str_pad(dechex($value), 2, "0", STR_PAD_LEFT);
                        }

                        return $return;
                    }

                    if (count($retval) == 0 && $val == 0) {
                        continue;
                    }

                    $retval[] = $val;
                }
            }
        }

        $return = [];

        foreach ($retval as $key => $value) {
            $return[] = str_pad(dechex($value), 2, "0", STR_PAD_LEFT);
        }

        return $return;
    }

    public static function createTree() {
        $mTree = new TreeNode();
        $nrBits = $val = 0;

        for ($i = 0; $i < 257; $i++) {
            $current = $mTree;
            $nrBits = (int) self::$huffmanTable[$i][0] - 1;
            $val    = (int) self::$huffmanTable[$i][1];

            for ($n = $nrBits; $n >= 0; $n--) {
                if (($val >> $n) % 2 == 1) {
                    if (null === $current->left) {
                        $current->left = new TreeNode();
                    }

                    $current = $current->left;
                }
                else {
                    if (null === $current->right) {
                        $current->right = new TreeNode();
                    }

                    $current = $current->right;
                }
            }

            $current->isLeaf = true;
            $current->value  = $i;
        }

        return $mTree;
    }
}

class TreeNode {
    public $isLeaf = false;
    public $value  = 0;
    public $left   = null;
    public $right  = null;
}


// --------------------------------------------

$input = array(0xb9, 0x00, 0xff, 0x92, 0xdb); 

echo 'input:';
print_r($input);

$compression = new Compression();
$packet = $compression->compress("b900ff92db");

// print_r($packet);
echo 'output:';
print_r(str_split(bin2hex($packet), 2));

// 0xb3, 0x0c, 0x59, 0xe4, 0xcb, 0xa0
//  179,   12,   89,  228,  203,  160
echo 'expected output:';
print_r(
  array(
    array(0xb3, 0x0c, 0x59, 0xe4, 0xcb, 0xa0),
    array( 179,   12,   89,  228,  203,  160)
  )
);
