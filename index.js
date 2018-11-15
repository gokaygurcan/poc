// Ultima Online

// ------------------------------ imports

// core modules
import { createServer } from 'net';

// node modules
import { hexy } from 'hexy';
import { lt } from 'semver';

// ------------------------------ utilities

const dump = (data, sender) => {
  console.log(`${sender.indexOf('client') > -1 ? sender + ' --->' : '<---' + sender}`);
  console.log(hexy(data, { width: 32, numbering: 'none', format: 'twos' }));
};

const decrypt = (data, socket) => {
  const keys = calculateKeys(socket.version);

  const EncryptionSeed = socket.seed;
  const FirstClientKey = keys.key1;
  const SecondClientKey = keys.key2;

  let CurrentKey0 = ((~EncryptionSeed ^ 0x00001357) << 16) | ((EncryptionSeed ^ 0xffffaaaa) & 0x0000ffff);
  let CurrentKey1 = ((EncryptionSeed ^ 0x43210000) >>> 16) | ((~EncryptionSeed ^ 0xabcdffff) & 0xffff0000);

  for (let i = 0; i < data.length; ++i) {
    data[i] = CurrentKey0 ^ data[i];

    let oldkey0 = CurrentKey0;
    let oldkey1 = CurrentKey1;

    CurrentKey0 = ((oldkey0 >>> 1) | (oldkey1 << 31)) ^ SecondClientKey;
    CurrentKey1 =
      (((((oldkey1 >>> 1) | (oldkey0 << 31)) ^ (FirstClientKey - 1)) >>> 1) | (oldkey0 << 31)) ^ FirstClientKey;
  }

  return data;
};

const calculateKeys = ({ major, minor, revision, patch }) => {
  let key1 = (major << 23) | (minor << 14) | (revision << 4);
  key1 ^= (revision * revision) << 9;
  key1 ^= minor * minor;
  key1 ^= (minor * 11) << 24;
  key1 ^= (revision * 7) << 19;
  key1 ^= 0x2c13a5fd; // 739485181

  let key2 = (major << 22) | (revision << 13) | (minor << 3);
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

const compression = {
  compress: src => {
    let dest = [];

    // prettier-ignore
    var huffmanTable = [
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
    ];

    let bitCount = 0;
    let bitValue = 0;
    let pEntry = 0;
    let iDest = 0;

    for (let i = 0; i < src.length; ++i) {
      pEntry = src[i] << 1; // DO NOT TRUNCATE TO 8 BITS

      bitCount += huffmanTable[pEntry];
      bitValue <<= huffmanTable[pEntry];
      bitValue |= huffmanTable[pEntry + 1];

      while (bitCount >= 8) {
        bitCount -= 8;
        dest[iDest++] = (bitValue >>> bitCount) & 0xff;
      }
    }

    // terminal code
    pEntry = 0x200;

    bitCount += huffmanTable[pEntry];
    bitValue <<= huffmanTable[pEntry];
    bitValue |= huffmanTable[pEntry + 1];

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

  decompress: src => {
    return ''; // TODO: ??
  }
};

// ------------------------------ variables

const razor = process.env.RAZOR || false;
const config = {
  port: 2593,
  servers: [
    {
      id: 1,
      name: 'Hello World',
      active: true,
      ip: '127.0.0.1',
      port: 2593,
      max_players: 100,
      timezone: 2
    },
    {
      id: 2,
      name: 'Test Server',
      active: false,
      ip: '127.0.0.2',
      port: 2593,
      max_players: 100,
      timezone: 2
    },
    {
      id: 3,
      name: 'Closed Server',
      active: false,
      ip: '127.0.0.3',
      port: 2593,
      max_players: 100,
      timezone: 2
    }
  ],
  startingLocations: [
    { name: 'New Haven', area: 'New Haven Bank', position: { x: 3503, y: 2574, z: 14, map: 1 }, cliloc: 1150168 },
    { name: 'Yew', area: 'The Empath Abbey', position: { x: 633, y: 858, z: 0, map: 1 }, cliloc: 1075072 },
    { name: 'Minoc', area: 'The Barnacle Tavern', position: { x: 2476, y: 413, z: 15, map: 1 }, cliloc: 1075073 },
    { name: 'Britain', area: "The Wayfarer's Inn", position: { x: 1602, y: 1591, z: 20, map: 1 }, cliloc: 1075074 },
    { name: 'Moonglow', area: 'The Scholars Inn', position: { x: 4408, y: 1168, z: 0, map: 1 }, cliloc: 1075075 },
    { name: 'Trinsic', area: "The Traveller's Inn", position: { x: 1845, y: 2745, z: 0, map: 1 }, cliloc: 1075076 },
    { name: 'Jhelom', area: 'The Mercenary Inn', position: { x: 1374, y: 3826, z: 0, map: 1 }, cliloc: 1075078 },
    { name: 'Skara Brae', area: "The Falconer's Inn", position: { x: 618, y: 2234, z: 0, map: 1 }, cliloc: 1075079 },
    { name: 'Vesper', area: 'The Ironwood Inn', position: { x: 2771, y: 976, z: 0, map: 0 }, cliloc: 1075080 },
    { name: 'Royal City', area: 'Royal City Inn', position: { x: 738, y: 3486, z: 0, map: 5 }, cliloc: 1150169 }
  ],
  charLimit: 7
};
const users = [
  {
    username: 'username',
    password: 'password',
    characters: [] // empty :(
  }
];
const connections = new Map();
const server = createServer();
let response;
let tmp;

// ------------------------------ events

server.on('connection', socket => {
  console.log('server::connection');

  socket.setNoDelay(true); // the nagle algorithm

  socket.on('data', data => {
    dump(data, 'client');

    let cmd = data.readUInt8(0);

    if (cmd === 0xef) {
      // login seed packet
      let seed = data.readUInt32BE(1);
      let major = data.readUInt32BE(5);
      let minor = data.readUInt32BE(9);
      let revision = data.readUInt32BE(13);
      let patch = data.readUInt32BE(17);

      socket.seed = seed;
      socket.version = { major, minor, revision, patch };
    } else {
      if (razor === false) {
        data = decrypt(data, socket);
        dump(data, 'client *');

        // decrypted cmd
        cmd = data.readUInt8(0);
      }
    }

    if (cmd === 0x73) {
      // ping packet
      response = Buffer.from([
        0x73, // ping
        data.readUInt8(1) // sequence number
      ]);
    } else if (cmd === 0x80) {
      // login request packet
      let username = data.slice(1, 31).toString('utf8').split('\0')[0]; // prettier-ignore
      let password = data.slice(31, 61).toString('utf8').split('\0')[0]; // prettier-ignore
      let nextLoginKey = data.readUInt8(61);

      if (!username || !password) {
        response = Buffer.from([
          0x82, // login rejected packet
          0x00 // incorrect name/password
        ]);
      } else {
        let user = users.filter(user => user.username === username && user.password === password)[0];

        if (typeof user === 'undefined') {
          response = Buffer.from([
            0x82,
            0x03 // your account credentials are invalid
          ]);
        } else if ('online' in user && user.online === true) {
          response = Buffer.from([
            0x82,
            0x01 // someone is already using this account
          ]);
        } else if ('blocked' in user && user.blocked === true) {
          response = Buffer.from([
            0x82,
            0x02 // your account has been blocked
          ]);
        } else if (parseInt(Math.random() * 100) <= 1) {
          response = Buffer.from([
            0x82,
            0x04 // communication problem
          ]);
        } else {
          socket.username = username;
          let servers = config.servers.filter(server => server.active);
          let tmp_0xa8 = [0xa8]; // game server list

          let fixedLength = 1 + 2 + 1 + 2; // cmd + length + sysinfo + number of servers
          let dynamicLength = servers.length * (2 + 32 + 1 + 1 + 4); // index + name + percentage + timezone + ip
          let totalLength = fixedLength + dynamicLength;
          let length_0x80 = [totalLength & 0xff00, totalLength & 0xff]; // writeUInt16BE ?
          tmp_0xa8 = tmp_0xa8.concat(length_0x80); // length
          tmp_0xa8 = tmp_0xa8.concat([0x5d]); // system info
          tmp_0xa8 = tmp_0xa8.concat([servers.length & 0xff00, servers.length & 0xff]); // # of servers

          for (let i = 0; i < servers.length; ++i) {
            let server = servers[i];

            tmp_0xa8 = tmp_0xa8.concat([i & 0xff00, i & 0xff]); // server index (0-based)

            let name = Buffer.alloc(32);
            name.write(server.name);
            tmp_0xa8 = tmp_0xa8.concat(name.toJSON().data); // server name
            tmp_0xa8 = tmp_0xa8.concat([0x01]); // percent full
            tmp_0xa8 = tmp_0xa8.concat([0x02]); // timezone
            // server ip to ping
            tmp_0xa8 = tmp_0xa8.concat(server.ip.split('.').reverse().map(octet => parseInt(octet))); // prettier-ignore
          }

          response = Buffer.from(tmp_0xa8);
        }
      }
    } else if (cmd === 0xa0) {
      let index = data.readUInt16BE(1);
      let server = config.servers.filter(server => server.active)[index];

      if (typeof server === 'undefined') {
        response = Buffer.from([
          0x53, // reject character logon packet
          0x03 // could not attach to game server
        ]);
      }

      let tmp_0xa0 = [0x8c]; // connect to game server
      // server ip
      tmp_0xa0 = tmp_0xa0.concat(server.ip.split('.').map(octet => parseInt(octet) & 0xff)); // prettier-ignore

      let port = Buffer.alloc(2);
      port.writeInt16BE(server.port);
      tmp_0xa0 = tmp_0xa0.concat(port.toJSON().data);

      // TODO: implement OTP kind of stuff.
      // https://docs.mongodb.com/manual/tutorial/expire-data/
      let key = Buffer.alloc(4);
      key.writeUInt32BE(parseInt(0xffffffff * Math.random()));
      tmp_0xa0 = tmp_0xa0.concat(key.toJSON().data);

      connections.set(key.readUInt32BE(0), {
        username: socket.username,
        version: socket.version
      });

      response = Buffer.from(tmp_0xa0);
    } else if (cmd === 0x91) {
      let key = data.readUInt32BE(1);
      let cred = data.slice(5).toString('utf8').split('\0').filter(item => item !== ''); // prettier-ignore
      let username = cred[0];
      let password = cred[1];

      let s = connections.get(key);
      if (s.username === username) {
        socket.version = s.version;
        console.log(`OTP: ${socket.version}`);
      }

      // TODO: proper auth check, this is game server from now on
      let user = users.filter(user => user.username === username && user.password === password)[0];

      if (typeof user !== 'undefined') {
        let tmp_0xb9 = [0xb9]; // enable locked client features

        // prettier-ignore
        let bitflag = 0x000000 
                    | 0x000001  // enable T2A features: chat, regions
                    | 0x000002  // enable renaissance features
                    | 0x000004  // enable third dawn features
                    | 0x000008  // enable LBR features: skills, map
                    | 0x000010  // enable AOS features: skills, map, spells, fightbook
                    | 0x000020  // 6th character slot
                    | 0x000040  // enable SE features
                    | 0x000080  // enable ML features: elven race, spells, skills
                 // | 0x000100  // enable 8th age splash screen
                    | 0x000200  // enable 9th age splash screen
                 // | 0x000400  // enable 10th age
                 // | 0x000800  // enable increased housing and bank storage
                    | 0x001000  // 7th character slot
                 // | 0x002000  // enable KR faces
                 // | 0x004000  // enable trial account
                    | 0x008000  // enable live account
                    | 0x010000  // enable SA features: gargoyle race, spells, skills
                    | 0x020000  // enable HSA features
                    | 0x040000  // enable Gothic housing tiles
                    | 0x080000  // enable Rustic housing tiles
                    | 0x100000  // enable Jungle housing tiles
                    | 0x200000  // enabled Shadowguard housing tiles
                    | 0x400000  // enable TOL features
                    | 0x800000; // enable Endless Journey account

        let tempBitFlag = Buffer.alloc(4);
        tempBitFlag.writeUInt32BE(bitflag);
        tmp_0xb9 = tmp_0xb9.concat(tempBitFlag.toJSON().data);

        response = compression.compress(Buffer.from([0x00, 0xff, 0x92, 0xdb]));

        dump(response, 'server *');
        socket.write(response);

        let tmp_0xa9 = [0xa9]; // characters / starting locations

        // >= 7.0.13.0
        let newClient = true;
        if (lt(`${socket.version.major}.${socket.version.minor}.${socket.version.revision}`, '7.0.13')) {
          newClient = false;
        }

        console.log(`newClient: ${newClient}`);

        let length_0xa9 = 11 + config.charLimit * 60 + config.startingLocations.length * (newClient ? 89 : 63);
        tmp_0xa9 = tmp_0xa9.concat([length_0xa9 & 0xff00, length_0xa9 & 0xff]); // writeUInt16BE ?
        tmp_0xa9 = tmp_0xa9.concat(config.charLimit); // number of characters

        for (let i = 0; i < config.charLimit; ++i) {
          let tempBuff = Buffer.alloc(60);

          if (i < user.characters.length) {
            tempBuff.write(user.characters[i].name.substr(0, 30));
          }

          tmp_0xa9 = tmp_0xa9.concat(tempBuff.toJSON().data);
        }

        tmp_0xa9 = tmp_0xa9.concat(config.startingLocations.length); // number of starting locations (cities)

        let tempSize = newClient ? 32 : 31;
        for (let i = 0; i < config.startingLocations.length; ++i) {
          let startingLocation = config.startingLocations[i];

          tmp_0xa9 = tmp_0xa9.concat(i); // locationIndex (0-based)

          let tempLocationName = Buffer.alloc(tempSize);
          tempLocationName.write(startingLocation.name);
          tmp_0xa9 = tmp_0xa9.concat(tempLocationName.toJSON().data);

          let tempAreaName = Buffer.alloc(tempSize);
          tempAreaName.write(startingLocation.area);
          tmp_0xa9 = tmp_0xa9.concat(tempAreaName.toJSON().data);

          if (newClient === true) {
            let tempPositionX = Buffer.alloc(4);
            tempPositionX.writeUInt32BE(startingLocation.position.x);
            tmp_0xa9 = tmp_0xa9.concat(tempPositionX.toJSON().data); // city x coordinate

            let tempPositionY = Buffer.alloc(4);
            tempPositionY.writeUInt32BE(startingLocation.position.y);
            tmp_0xa9 = tmp_0xa9.concat(tempPositionY.toJSON().data); // city y coordinate

            let tempPositionZ = Buffer.alloc(4);
            tempPositionZ.writeUInt32BE(startingLocation.position.z);
            tmp_0xa9 = tmp_0xa9.concat(tempPositionZ.toJSON().data); // city z coordinate

            let tempPositionMap = Buffer.alloc(4);
            tempPositionMap.writeUInt32BE(startingLocation.position.map);
            tmp_0xa9 = tmp_0xa9.concat(tempPositionMap.toJSON().data); // city map / map id

            let tempPositionCliloc = Buffer.alloc(4);
            tempPositionCliloc.writeUInt32BE(startingLocation.cliloc);
            tmp_0xa9 = tmp_0xa9.concat(tempPositionCliloc.toJSON().data); // cliloc description

            tmp_0xa9 = tmp_0xa9.concat([0x00, 0x00, 0x00, 0x00]); // always 0
          }
        }

        // prettier-ignore
        let flags = 0x0000
               // | 0x0001  // unknown
               // | 0x0002  // send config/req logout (IGR?, overwrite configuration button?)
               // | 0x0004  // single character (siege - limit 1 character/account)
                  | 0x0008  // enable npcpopup/context menus
               // | 0x0010  // limit character slots?
                  | 0x0020  // enable common AOS features (tooltip thing/fight system book, but not AOS monsters/map/skills, necromancer/paladin classes)
                  | 0x0040  // 6th character slot
                  | 0x0080  // samurai and ninja classes
                  | 0x0100  // elven race
               // | 0x0200  // KR support flag1 ?
               // | 0x0400  // send UO3D client type (client will send 0xE1 packet)
               // | 0x0800  // unknown
                  | 0x1000; // 7th character slot, only 2D client
        // | 0x2000  // unknown (SA?)
        // | 0x4000  // new movement packets 0xF0 -> 0xF2
        // | 0x8000; // unlock new felucca areas

        let tempFlags = Buffer.alloc(4);
        tempFlags.writeUInt32BE(flags);
        tmp_0xa9 = tmp_0xa9.concat(tempFlags.toJSON().data);

        tmp_0xa9 = tmp_0xa9.concat([0xff, 0xff]); // if SA Enchanced client, last character slot (for highlight)

        response = compression.compress(Buffer.from(tmp_0xa9));
      } else {
        response = Buffer.from([
          0x53, // reject character logon packet
          0x00 // incorrect password
        ]);
      }
    } else if (cmd === 0x00) {
      // ?
    }

    if (response) {
      dump(response, 'server');
      socket.write(response);
      response = null;
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

server.on('listening', () => console.log(`server::listening (RAZOR: ${razor})`));
server.on('close', () => console.log('server::close'));
server.on('error', err => console.log(`server::error ${err ? '| err: ' + err : ''}`));

server.listen(config.port, () => console.log(`server::listen (${config.port})`));
