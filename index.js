// @flow

// ------------------------------ imports

// core modules
import { createServer, Server } from 'net';

// node modules
import { hexy } from 'hexy';

// local modules
import {
  x11,
  x17,
  x1B,
  x20,
  x4F,
  x53,
  x55,
  x6D,
  x72,
  x73,
  x78,
  x82,
  x8C,
  xA8,
  xA9,
  xB9,
  xBF,
  xBFx08,
  xBFx18,
  xBFx19
} from './packets';

// ------------------------------ types

import type {
  tCharacter,
  tClientKeys,
  tCompression,
  tConfig,
  tConnection,
  tPosition,
  tServer,
  tSocket,
  tStartingLocation,
  tUser,
  tVersion
} from './types';

// ------------------------------ utilities

const dump = (data: Buffer | Array<number | string>, sender: string): void => {
  console.log(`${sender.indexOf('client') > -1 ? sender + ' --->' : '<---' + sender}`);
  console.log(hexy(data, { width: 32, numbering: 'none', format: 'twos' }));
};

const decrypt = (data: Buffer, keys: tClientKeys, seed: number): Buffer => {
  const EncryptionSeed: number = seed;
  const FirstClientKey: number = keys.key1;
  const SecondClientKey: number = keys.key2;

  let CurrentKey0: number = ((~EncryptionSeed ^ 0x00001357) << 16) | ((EncryptionSeed ^ 0xffffaaaa) & 0x0000ffff);
  let CurrentKey1: number = ((EncryptionSeed ^ 0x43210000) >>> 16) | ((~EncryptionSeed ^ 0xabcdffff) & 0xffff0000);

  for (let i: number = 0; i < data.length; ++i) {
    data[i] = CurrentKey0 ^ data[i];

    let oldkey0: number = CurrentKey0;
    let oldkey1: number = CurrentKey1;

    CurrentKey0 = ((oldkey0 >>> 1) | (oldkey1 << 31)) ^ SecondClientKey;
    CurrentKey1 = (((((oldkey1 >>> 1) | (oldkey0 << 31)) ^ (FirstClientKey - 1)) >>> 1) | (oldkey0 << 31)) ^ FirstClientKey; // prettier-ignore
  }

  return Buffer.from(data);
};

const calculateKeys = ({ major, minor, revision, patch }: tVersion): tClientKeys => {
  let key1: number = (major << 23) | (minor << 14) | (revision << 4);
  key1 ^= (revision * revision) << 9;
  key1 ^= minor * minor;
  key1 ^= (minor * 11) << 24;
  key1 ^= (revision * 7) << 19;
  key1 ^= 0x2c13a5fd; // 739485181

  let key2: number = (major << 22) | (revision << 13) | (minor << 3);
  key2 ^= (revision * revision * 3) << 10;
  key2 ^= minor * minor;
  key2 ^= (minor * 13) << 23;
  key2 ^= (revision * 7) << 18;
  key2 ^= 0xa31d527f; // 2736607871

  return {
    key1,
    key2
  };
};

const compression: tCompression = {
  // prettier-ignore
  huffmanTable: [
    0x2, 0x000, 0x5, 0x01f, 0x6, 0x022, 0x7, 0x034, 0x7, 0x075, 0x6, 0x028, 0x6, 0x03b, 0x7, 0x032, 
    0x8, 0x0e0, 0x8, 0x062, 0x7, 0x056, 0x8, 0x079, 0x9, 0x19d, 0x8, 0x097, 0x6, 0x02a, 0x7, 0x057, 
    0x8, 0x071, 0x8, 0x05b, 0x9, 0x1cc, 0x8, 0x0a7, 0x7, 0x025, 0x7, 0x04f, 0x8, 0x066, 0x8, 0x07d, 
    0x9, 0x191, 0x9, 0x1ce, 0x7, 0x03f, 0x9, 0x090, 0x8, 0x059, 0x8, 0x07b, 0x8, 0x091, 0x8, 0x0c6, 
    0x6, 0x02d, 0x9, 0x186, 0x8, 0x06f, 0x9, 0x093, 0xa, 0x1cc, 0x8, 0x05a, 0xa, 0x1ae, 0xa, 0x1c0, 
    0x9, 0x148, 0x9, 0x14a, 0x9, 0x082, 0xa, 0x19f, 0x9, 0x171, 0x9, 0x120, 0x9, 0x0e7, 0xa, 0x1f3, 
    0x9, 0x14b, 0x9, 0x100, 0x9, 0x190, 0x6, 0x013, 0x9, 0x161, 0x9, 0x125, 0x9, 0x133, 0x9, 0x195, 
    0x9, 0x173, 0x9, 0x1ca, 0x9, 0x086, 0x9, 0x1e9, 0x9, 0x0db, 0x9, 0x1ec, 0x9, 0x08b, 0x9, 0x085, 
    0x5, 0x00a, 0x8, 0x096, 0x8, 0x09c, 0x9, 0x1c3, 0x9, 0x19c, 0x9, 0x08f, 0x9, 0x18f, 0x9, 0x091, 
    0x9, 0x087, 0x9, 0x0c6, 0x9, 0x177, 0x9, 0x089, 0x9, 0x0d6, 0x9, 0x08c, 0x9, 0x1ee, 0x9, 0x1eb, 
    0x9, 0x084, 0x9, 0x164, 0x9, 0x175, 0x9, 0x1cd, 0x8, 0x05e, 0x9, 0x088, 0x9, 0x12b, 0x9, 0x172, 
    0x9, 0x10a, 0x9, 0x08d, 0x9, 0x13a, 0x9, 0x11c, 0xa, 0x1e1, 0xa, 0x1e0, 0x9, 0x187, 0xa, 0x1dc, 
    0xa, 0x1df, 0x7, 0x074, 0x9, 0x19f, 0x8, 0x08d, 0x8, 0x0e4, 0x7, 0x079, 0x9, 0x0ea, 0x9, 0x0e1, 
    0x8, 0x040, 0x7, 0x041, 0x9, 0x10b, 0x9, 0x0b0, 0x8, 0x06a, 0x8, 0x0c1, 0x7, 0x071, 0x7, 0x078, 
    0x8, 0x0b1, 0x9, 0x14c, 0x7, 0x043, 0x8, 0x076, 0x7, 0x066, 0x7, 0x04d, 0x9, 0x08a, 0x6, 0x02f, 
    0x8, 0x0c9, 0x9, 0x0ce, 0x9, 0x149, 0x9, 0x160, 0xa, 0x1ba, 0xa, 0x19e, 0xa, 0x39f, 0x9, 0x0e5, 
    0x9, 0x194, 0x9, 0x184, 0x9, 0x126, 0x7, 0x030, 0x8, 0x06c, 0x9, 0x121, 0x9, 0x1e8, 0xa, 0x1c1, 
    0xa, 0x11d, 0xa, 0x163, 0xa, 0x385, 0xa, 0x3db, 0xa, 0x17d, 0xa, 0x106, 0xa, 0x397, 0xa, 0x24e, 
    0x7, 0x02e, 0x8, 0x098, 0xa, 0x33c, 0xa, 0x32e, 0xa, 0x1e9, 0x9, 0x0bf, 0xa, 0x3df, 0xa, 0x1dd, 
    0xa, 0x32d, 0xa, 0x2ed, 0xa, 0x30b, 0xa, 0x107, 0xa, 0x2e8, 0xa, 0x3de, 0xa, 0x125, 0xa, 0x1e8, 
    0x9, 0x0e9, 0xa, 0x1cd, 0xa, 0x1b5, 0x9, 0x165, 0xa, 0x232, 0xa, 0x2e1, 0xb, 0x3ae, 0xb, 0x3c6, 
    0xb, 0x3e2, 0xa, 0x205, 0xa, 0x29a, 0xa, 0x248, 0xa, 0x2cd, 0xa, 0x23b, 0xb, 0x3c5, 0xa, 0x251, 
    0xa, 0x2e9, 0xa, 0x252, 0x9, 0x1ea, 0xb, 0x3a0, 0xb, 0x391, 0xa, 0x23c, 0xb, 0x392, 0xb, 0x3d5, 
    0xa, 0x233, 0xa, 0x2cc, 0xb, 0x390, 0xa, 0x1bb, 0xb, 0x3a1, 0xb, 0x3c4, 0xa, 0x211, 0xa, 0x203, 
    0x9, 0x12a, 0xa, 0x231, 0xb, 0x3e0, 0xa, 0x29b, 0xb, 0x3d7, 0xa, 0x202, 0xb, 0x3ad, 0xa, 0x213, 
    0xa, 0x253, 0xa, 0x32c, 0xa, 0x23d, 0xa, 0x23f, 0xa, 0x32f, 0xa, 0x11c, 0xa, 0x384, 0xa, 0x31c, 
    0xa, 0x17c, 0xa, 0x30a, 0xa, 0x2e0, 0xa, 0x276, 0xa, 0x250, 0xb, 0x3e3, 0xa, 0x396, 0xa, 0x18f, 
    0xa, 0x204, 0xa, 0x206, 0xa, 0x230, 0xa, 0x265, 0xa, 0x212, 0xa, 0x23e, 0xb, 0x3ac, 0xb, 0x393, 
    0xb, 0x3e1, 0xa, 0x1de, 0xb, 0x3d6, 0xa, 0x31d, 0xb, 0x3e5, 0xb, 0x3e4, 0xa, 0x207, 0xb, 0x3c7, 
    0xa, 0x277, 0xb, 0x3d4, 0x8, 0x0c0, 0xa, 0x162, 0xa, 0x3da, 0xa, 0x124, 0xa, 0x1b4, 0xa, 0x264, 
    0xa, 0x33d, 0xa, 0x1d1, 0xa, 0x1af, 0xa, 0x39e, 0xa, 0x24f, 0xb, 0x373, 0xa, 0x249, 0xb, 0x372, 
    0x9, 0x167, 0xa, 0x210, 0xa, 0x23a, 0xa, 0x1b8, 0xb, 0x3af, 0xa, 0x18e, 0xa, 0x2ec, 0x7, 0x062, 
    0x4, 0x00d
  ],

  compress: (src: Buffer | Array<number>): Buffer => {
    let dest: Array<number> = [];
    let bitCount: number = 0;
    let bitValue: number = 0;
    let pEntry: number = 0;
    let iDest: number = 0;

    for (let i: number = 0; i < src.length; ++i) {
      pEntry = src[i] << 1; // DO NOT TRUNCATE TO 8 BITS

      bitCount += compression.huffmanTable[pEntry];
      bitValue <<= compression.huffmanTable[pEntry];
      bitValue |= compression.huffmanTable[pEntry + 1];

      while (bitCount >= 8) {
        bitCount -= 8;
        dest[iDest++] = (bitValue >>> bitCount) & 0xff;
      }
    }

    // terminal code
    pEntry = 0x200;

    bitCount += compression.huffmanTable[pEntry];
    bitValue <<= compression.huffmanTable[pEntry];
    bitValue |= compression.huffmanTable[pEntry + 1];

    // align on byte boundary
    if ((bitCount & 7) !== 0) {
      bitValue <<= 8 - (bitCount & 7);
      bitCount += 8 - (bitCount & 7);
    }

    while (bitCount >= 8) {
      bitCount -= 8;
      dest[iDest++] = (bitValue >>> bitCount) & 0xff;
    }

    return Buffer.from(dest);
  },

  decompress: (src: Buffer | Array<number>): Buffer => {
    return Buffer.from(src); // TODO: ??
  }
};

// ------------------------------ variables

const razor: boolean = process.env.RAZOR === 'true';
const servers: Array<tServer> = [
  { id: 1, name: 'Hello World', active: true, ip: '127.0.0.1', port: 2593, max_players: 100, timezone: 2 },
  { id: 2, name: 'Test Server', active: false, ip: '127.0.0.2', port: 2593, max_players: 100, timezone: 2 },
  { id: 3, name: 'Closed Server', active: false, ip: '127.0.0.3', port: 2593, max_players: 100, timezone: 2 }
];
const startingLocations: Array<tStartingLocation> = [
  { name: 'New Haven', area: 'New Haven Bank', position: { x: 3503, y: 2574, z: 14, map: 0 }, cliloc: 1150168 },
  { name: 'Yew', area: 'The Empath Abbey', position: { x: 633, y: 858, z: 0, map: 1 }, cliloc: 1075072 },
  { name: 'Minoc', area: 'The Barnacle Tavern', position: { x: 2476, y: 413, z: 15, map: 1 }, cliloc: 1075073 },
  { name: 'Britain', area: "The Wayfarer's Inn", position: { x: 1602, y: 1591, z: 20, map: 1 }, cliloc: 1075074 },
  { name: 'Moonglow', area: 'The Scholars Inn', position: { x: 4408, y: 1168, z: 0, map: 1 }, cliloc: 1075075 },
  { name: 'Trinsic', area: "The Traveller's Inn", position: { x: 1845, y: 2745, z: 0, map: 1 }, cliloc: 1075076 },
  { name: 'Jhelom', area: 'The Mercenary Inn', position: { x: 1374, y: 3826, z: 0, map: 1 }, cliloc: 1075078 },
  { name: 'Skara Brae', area: "The Falconer's Inn", position: { x: 618, y: 2234, z: 0, map: 1 }, cliloc: 1075079 },
  { name: 'Vesper', area: 'The Ironwood Inn', position: { x: 2771, y: 976, z: 0, map: 1 }, cliloc: 1075080 },
  { name: 'Royal City', area: 'Royal City Inn', position: { x: 738, y: 3486, z: 0, map: 5 }, cliloc: 1150169 }
];
const config: tConfig = {
  port: parseInt(process.env.PORT || 2593, 10),
  servers,
  startingLocations,
  charLimit: 7
};
const users: Array<tUser> = [
  {
    username: 'username',
    password: 'password',
    characters: [] // empty :(
  }
];
const connections: Map<number, tConnection> = new Map();

const server: Server = createServer();
let response: Buffer | null;

// ------------------------------ events
server.on('connection', (socket: tSocket): void => {
  console.log('server::connection');

  socket.setNoDelay(true); // the nagle algorithm

  socket.on('data', (data: Buffer): void => {
    dump(data, 'client');

    let cmd: number = data.readUInt8(0);

    /* 0xF0, 0xF1, 0xCF, 0x80, 0x91, 0xA4, 0xEF */
    if (cmd === 0xef) {
      if (data.length !== 0x15) {
        console.log(socket);

        /*
        ef 0a 00 4b 01 00 00 00 07 00 00 00 00 00 00 00    o..K............
        47 00 00 00 1b 80 75 73 65 72 6e 61 6d 65 00 00    G.....username..
        00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00    ................
        00 00 00 00 70 61 73 73 77 6f 72 64 00 00 00 00    ....password....
        00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00    ................
        00 00 5d                                           ..]

        consider handling this packet. it has both 0xEF and 0x80. 
        maybe splitting it can be an option, idk.
        otherwise, client stays in "Verifying Account" screen.

        ef                                                 o

        same for this one. it's just 0xEF without any client info.
        */

        response = x82('COMMUNICATION_PROBLEM');
      } else {
        // login seed packet
        let seed: number = data.readUInt32BE(1);
        let major: number = data.readUInt32BE(5);
        let minor: number = data.readUInt32BE(9);
        let revision: number = data.readUInt32BE(13);
        let patch: number = data.readUInt32BE(17);

        socket.seed = seed;
        socket.version = { major, minor, revision, patch };
      }
    } else {
      if (razor === false) {
        data = decrypt(data, socket.version, socket.seed);
        dump(data, 'client *');

        // decrypted cmd
        cmd = data.readUInt8(0);
      }
    }

    if (cmd === 0x73) {
      // ping packet
      response = x73(data.readUInt8(1));
    } else if (cmd === 0x80) {
      // login request packet
      let username: string = data.slice(1, 31).toString('utf8').split('\0')[0]; // prettier-ignore
      let password: string = data.slice(31, 61).toString('utf8').split('\0')[0]; // prettier-ignore
      let nextLoginKey: number = data.readUInt8(61);

      if (!username || !password) {
        response = x82('INCORRECT_NAME_OR_PASSWORD');
      } else {
        let user: Object = users.filter((user: Object) => user.username === username && user.password === password)[0];

        if (typeof user === 'undefined') {
          response = x82('YOUR_CREDENTIALS_ARE_INVALID');
        } else if ('online' in user && user.online === true) {
          response = x82('SOMEONE_IS_ALREADY_USING_THIS_ACCOUNT');
        } else if ('blocked' in user && user.blocked === true) {
          response = x82('YOUR_ACCOUNT_HAS_BEEN_BLOCKED');
        } else if (parseInt(Math.random() * 100) <= 1) {
          response = x82('COMMUNICATION_PROBLEM');
        } else {
          socket.username = username;

          let servers: Array<Object> = config.servers.filter(server => server.active);
          response = xA8(servers);
        }
      }
    } else if (cmd === 0xa0) {
      let index: number = data.readUInt16BE(1);
      let server: tServer = config.servers.filter(server => server.active)[index];

      if (typeof server === 'undefined') {
        response = x53('COULD_NOT_ATTACH_TO_GAME_SERVER');
      }

      // TODO: implement OTP kind of stuff.
      // https://docs.mongodb.com/manual/tutorial/expire-data/
      let key: Buffer = Buffer.alloc(4);
      key.writeUInt32BE(parseInt(0xffffffff * Math.random()), 0);

      let connection: tConnection = {
        username: socket.username,
        version: socket.version
      };
      connections.set(key.readUInt32BE(0), connection);

      response = x8C(server, key);
    } else if (cmd === 0x91) {
      let key: number = data.readUInt32BE(1);
      let cred: Array<string> = data.slice(5).toString('utf8').split('\0').filter(item => item !== ''); // prettier-ignore
      let username: string = cred[0]; // TODO: spread syntax, maybe?
      let password: string = cred[1]; // TODO: something like let [username, password] = cred

      let s: tConnection | any = connections.get(key); // TODO: any is just a monkey patch, find a better solution here.
      if (s.username === username) {
        socket.version = s.version;
        console.log('--- OTP ---');
        console.table(socket.version);
      }

      // TODO: proper auth check, this is game server from now on
      let user: tUser = users.filter(user => user.username === username && user.password === password)[0];

      if (typeof user !== 'undefined') {
        let tmp_0xb9: Buffer = xB9();
        dump(tmp_0xb9, 'server *');
        response = compression.compress(tmp_0xb9);
        dump(response, 'server (compressed) *');
        socket.write(response);

        let tmp_0xa9: Buffer = xA9(config, socket, user);
        dump(tmp_0xa9, 'server (uncompressed) *');
        response = compression.compress(tmp_0xa9);
      } else {
        response = x53('INCORRECT_PASSWORD')
      }
    } else if (cmd === 0xf8) {
      /*
      f8 ed ed ed ed ff ff ff ff 00 45 72 69 63 20 43 6c 61 70 74 6f 6e 00 00 00 00 00 00 00 00 00 00    xmmmm.....Eric.Clapton..........
      00 00 00 00 00 00 00 00 00 00 00 00 00 3f 00 00 00 01 00 00 00 03 01 00 00 00 00 00 00 00 00 00    .............?..................
      00 00 00 00 00 00 02 2d 23 0a 1b 1e 11 1e 28 1e 01 1e 04 1d 20 3b 04 5e 20 4b 04 5e 00 00 00 00    .......-#.....(......;.^.K.^....
      00 00 0a 00 4b 01 03 26 03 26                                                                      ....K..&.&
      */

      let character: Object = {
        pattern1: data.readUInt32BE(1), // 0xedededed
        pattern2: data.readUInt32BE(5), // 0xffffffff
        pattern3: data.readUInt8(9), // 0x00
        charName: data.slice(10, 40).toString('utf8').split('\0')[0], // prettier-ignore
        unknown0: data.readUInt16BE(40),
        /*
        t2a         : 0x00
        renaissance : 0x01
        third dawn  : 0x02
        lbr         : 0x04
        aos         : 0x08
        se          : 0x10
        sa          : 0x20
        uo3d        : 0x40
        reserved    : 0x80
        3dclient    : 0x100
        */
        clientflag: data.readUInt32BE(42),
        unknown1: data.readUInt32BE(46),
        logincount: data.readUInt32BE(50),
        profession: data.readUInt8(54),
        unknown2: data.slice(55, 70).toString('utf8').split('\0')[0], // prettier-ignore
        /*
        Male Human      : 0x00
        Female Human    : 0x01
        Male Human      : 0x02
        Female Human    : 0x03
        Male Elf        : 0x04
        Female Elf      : 0x05
        Male Gargoyle   : 0x06
        Female Gargoyle : 0x07
        */
        sex: data.readUInt8(70),
        str: data.readUInt8(71),
        dex: data.readUInt8(72),
        int: data.readUInt8(73),
        skill1: data.readUInt8(74),
        skill1value: data.readUInt8(75),
        skill2: data.readUInt8(76),
        skill2value: data.readUInt8(77),
        skill3: data.readUInt8(78),
        skill3value: data.readUInt8(79),
        skill4: data.readUInt8(80),
        skill4value: data.readUInt8(81),
        skinColor: data.readUInt16BE(82),
        hairStyle: data.readUInt16BE(84),
        hairColor: data.readUInt16BE(86),
        facialHair: data.readUInt16BE(88),
        facialHairColor: data.readUInt16BE(90),
        location: data.readUInt16BE(92), // # from starting list
        unknown3: data.readUInt16BE(94), // usually 0x00 in testing
        slot: data.readUInt16BE(96),
        clientIP: data.readUInt32BE(98),
        shirtColor: data.readUInt16BE(102),
        pantsColor: data.readUInt16BE(104)
      }; // total: 106

      console.log('--- character ---');
      console.table(character); // save this somewhere, lol

      let tmp_0x1b: Buffer = x1B();
      dump(tmp_0x1b, 'server (uncompressed) *');
      response = compression.compress(tmp_0x1b);
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0xbf_0x18: Buffer = xBFx18();
      dump(tmp_0xbf_0x18, 'server (uncompressed) *');
      response = compression.compress(tmp_0xbf_0x18);
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x6d: Buffer = x6D([0x00, 0x09]);
      dump(tmp_0x6d, 'server (uncompressed) *');
      response = compression.compress(tmp_0x6d);
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0xbf_0x08: Buffer = xBFx08();
      dump(tmp_0xbf_0x08, 'server (uncompressed) *');
      response = compression.compress(tmp_0xbf_0x08);
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x78: Buffer = x78();
      dump(tmp_0x78, 'server (uncompressed) *');
      response = compression.compress(tmp_0x78);
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x17: Buffer = x17();
      dump(tmp_0x17, 'server (uncompressed) *');
      response = compression.compress(tmp_0x17);
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x20: Buffer = x20();
      dump(tmp_0x20, 'server (uncompressed) *');
      response = compression.compress(tmp_0x20);
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x4f: Buffer = x4F(0x1a);
      dump(tmp_0x4f, 'server (uncompressed) *');
      response = compression.compress(tmp_0x4f);
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x11: Buffer = x11(character);
      dump(tmp_0x11, 'server (uncompressed) *');
      response = compression.compress(tmp_0x11);
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0xbf_0x19: Buffer = xBFx19();
      dump(tmp_0xbf_0x19, 'server (uncompressed) *');
      response = compression.compress(tmp_0xbf_0x19);
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x72: Buffer = x72(0x00);
      dump(tmp_0x72, 'server (uncompressed) *');
      response = compression.compress(tmp_0x72);
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x55: Buffer = x55();
      dump(tmp_0x55, 'server (uncompressed) *');
      response = compression.compress(tmp_0x55);
    } else if (cmd === 0x00) {
      // ?
    }

    if (response) {
      dump(response, 'server');
      socket.write(response);
      response = null;

      console.log('-----------------------------------------------------------------------------------------------------------------------------------'); // prettier-ignore
    }
  });

  socket.on('close', hadError => console.log(`server::socket::close ${hadError ? '| hadError: ' + hadError : ''}`));
  socket.on('error', hadError => console.log(`server::socket::error ${hadError ? '| hadError: ' + hadError : ''}`));
  socket.on('connect', () => console.log('server::socket::connect'));
  socket.on('drain', () => console.log('server::socket::drain'));
  socket.on('end', () => console.log('server::socket::end'));
  socket.on('lookup', (error, address, family, host) => console.log('server::socket::lookup', error, address, family, host)); // prettier-ignore
  socket.on('timeout', () => console.log('server::socket::timeout'));
});

server.on('listening', () => console.log(`server::listening (RAZOR: ${razor.toString()})`));
server.on('close', () => console.log('server::close'));
server.on('error', err => console.log(`server::error ${err ? '| err: ' + err : ''}`));

server.listen(config.port, () => console.log(`server::listen (${config.port})`));
