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

/*
   sender    encryption     compression
  -------- | ------------ | -------------
  server   | nope         | both
  client   | yep          | nope
*/
server.on('connection', socket => {
  console.log('server::connection');

  socket.setNoDelay(true); // the nagle algorithm

  socket.on('data', data => {
    dump(data, 'client');

    let cmd = data.readUInt8(0);

    /* 0xF0, 0xF1, 0xCF, 0x80, 0x91, 0xA4, 0xEF */
    if (cmd === 0xef) {
      if (data.length === 1) {
        console.log(socket);

        response = Buffer.from([
          0x82,
          0x04 // communication problem
        ]);
      } else {
        // login seed packet
        let seed = data.readUInt32BE(1);
        let major = data.readUInt32BE(5);
        let minor = data.readUInt32BE(9);
        let revision = data.readUInt32BE(13);
        let patch = data.readUInt32BE(17);

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
        */

        socket.seed = seed;
        socket.version = { major, minor, revision, patch };
      }
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
          /*
          System Info Flags: 
          0xCC - Do not send video card info
          0x64 - Send Video card
          RunUO And SteamEngine both send 0x5D
          */
          tmp_0xa8 = tmp_0xa8.concat([0x64]); // system info
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
        console.log('--- OTP ---');
        console.table(socket.version);
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

        dump(tmp_0xb9, 'server *');
        response = compression.compress(Buffer.from(tmp_0xb9));
        dump(response, 'server (compressed) *');
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

        dump(tmp_0xa9, 'server (uncompressed) *');
        response = compression.compress(Buffer.from(tmp_0xa9));
      } else {
        response = Buffer.from([
          0x53, // reject character logon packet
          0x00 // incorrect password
        ]);
      }
    } else if (cmd === 0xf8) {
      /*
      f8 ed ed ed ed ff ff ff ff 00 45 72 69 63 20 43 6c 61 70 74 6f 6e 00 00 00 00 00 00 00 00 00 00    xmmmm.....Eric.Clapton..........
      00 00 00 00 00 00 00 00 00 00 00 00 00 3f 00 00 00 01 00 00 00 03 01 00 00 00 00 00 00 00 00 00    .............?..................
      00 00 00 00 00 00 02 2d 23 0a 1b 1e 11 1e 28 1e 01 1e 04 1d 20 3b 04 5e 20 4b 04 5e 00 00 00 00    .......-#.....(......;.^.K.^....
      00 00 0a 00 4b 01 03 26 03 26                                                                      ....K..&.&
      */

      let character = {
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

      let tmp_0x1b = [0x1b]; // login confirm
      tmp_0x1b = tmp_0x1b.concat([0x00, 0x00, 0x00, 0x63]); // player serial
      tmp_0x1b = tmp_0x1b.concat([0x00, 0x00, 0x00, 0x00]); // unknown. always 0
      tmp_0x1b = tmp_0x1b.concat([0x01, 0x90]); // body type
      tmp_0x1b = tmp_0x1b.concat([0x05, 0xd8]); // xLoc
      tmp_0x1b = tmp_0x1b.concat([0x06, 0x5c]); // yLoc
      tmp_0x1b = tmp_0x1b.concat([0x00, 0x0a]); // zLoc
      tmp_0x1b = tmp_0x1b.concat([0x03]); // facing
      tmp_0x1b = tmp_0x1b.concat([0x00, 0xff, 0xff, 0xff]); // unknown 0x0
      tmp_0x1b = tmp_0x1b.concat([0xff, 0x00, 0x00, 0x00]); // unknown 0x0
      tmp_0x1b = tmp_0x1b.concat([0x00]); // unknown 0x0
      tmp_0x1b = tmp_0x1b.concat([0x18, 0x00]); // server boundary width
      tmp_0x1b = tmp_0x1b.concat([0x10, 0x00]); // server boundary height
      tmp_0x1b = tmp_0x1b.concat([0x00, 0x00]); // unknown 0x0
      tmp_0x1b = tmp_0x1b.concat([0x00, 0x00, 0x00, 0x00]); // unknown 0x0

      dump(tmp_0x1b, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0x1b));
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0xbf_0x18 = [0xbf]; // general information packet
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x31]); // length
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x18]); // subcommand id (enable map-diff)
      // subcommand details
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x00, 0x00, 0x05]); // number of maps
      // for each map
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x00, 0x00, 0x00]); // number of map patches in this map
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x00, 0x00, 0x00]); // number of static patches in this map
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x00, 0x00, 0x00]); // number of map patches in this map
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x00, 0x00, 0x00]); // number of static patches in this map
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x00, 0x00, 0x00]); // number of map patches in this map
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x00, 0x00, 0x00]); // number of static patches in this map
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x00, 0x00, 0x00]); // number of map patches in this map
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x00, 0x00, 0x00]); // number of static patches in this map
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x00, 0x00, 0x00]); // number of map patches in this map
      tmp_0xbf_0x18 = tmp_0xbf_0x18.concat([0x00, 0x00, 0x00, 0x00]); // number of static patches in this map
      // endFor

      dump(tmp_0xbf_0x18, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0xbf_0x18));
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x6d = [0x6d]; // play midi music
      tmp_0x6d = tmp_0x6d.concat([0x00, 0x09]); // musicID
      dump(tmp_0x6d, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0x6d));
      socket.write(response);

      let tmp_0xbf_0x08 = [0xbf]; // general information packet
      tmp_0xbf_0x08 = tmp_0xbf_0x08.concat([0x00, 0x06]); // length
      tmp_0xbf_0x08 = tmp_0xbf_0x08.concat([0x00, 0x08]); // subcommand id (set cursor hue / set MAP)
      // subcommand details
      tmp_0xbf_0x08 = tmp_0xbf_0x08.concat([0x00]); // hue (0 = Felucca, unhued / BRITANNIA map. 1 = Trammel, hued gold / BRITANNIA map, 2 = (switch to) ILSHENAR map)

      dump(tmp_0xbf_0x08, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0xbf_0x08));
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x78 = [0x78]; // draw object
      tmp_0x78 = tmp_0x78.concat([0x00, 0x71]); // length
      tmp_0x78 = tmp_0x78.concat([0x00, 0x00, 0x1f, 0xc4]); // object serial
      tmp_0x78 = tmp_0x78.concat([0x01, 0x90]); // graphic ID
      tmp_0x78 = tmp_0x78.concat([0x05, 0xd8]); // X
      tmp_0x78 = tmp_0x78.concat([0x06, 0x5c]); // Y
      tmp_0x78 = tmp_0x78.concat([0x0a]); // Z
      tmp_0x78 = tmp_0x78.concat([0x03]); // direction/facing
      tmp_0x78 = tmp_0x78.concat([0x83, 0xea]); // color
      /*
      0x00: Normal
      0x01: Unknown
      0x02: Can Alter Paperdoll
      0x04: Poisoned
      0x08: Golden Health
      0x10: Unknown
      0x20: Unknown
      0x40: War Mode

      0x12 Status Flag was a guild mates mount not in war mode. 
      0x52 is for the same pets status flag while in war mode. 
      Poisoned it stayed the same appropriately in each. 0x12 and 0x52
      */
      tmp_0x78 = tmp_0x78.concat([0x00]); // status flag (bitwise flag)
      /*
      0x1: Innocent (Blue)
      0x2: Friend (Green)
      0x3: Grey (Grey - Animal)
      0x4: Criminal (Grey)
      0x5: Enemy (Orange)
      0x6: Murderer (Red)
      0x7: Invulnerable (Yellow)
      */
      tmp_0x78 = tmp_0x78.concat([0x01]); // notoriety
      // loop if next block is not [0x00, 0x00, 0x00, 0x00]
      tmp_0x78 = tmp_0x78.concat([0x40, 0x00, 0x1f, 0xc3, 0x0e, 0x75, 0x15, 0x00, 0x00]); // BYTE[4] Serial
      tmp_0x78 = tmp_0x78.concat([0x40, 0x00, 0x1f, 0xc1, 0x20, 0x3b, 0x0b, 0x04, 0x4e]); // BYTE[2] Graphic
      tmp_0x78 = tmp_0x78.concat([0x40, 0x00, 0x1f, 0xbd, 0x0a, 0x28, 0x02, 0x00, 0x00]); // BYTE[1] Layer
      tmp_0x78 = tmp_0x78.concat([0x40, 0x00, 0x1f, 0xbb, 0x15, 0x17, 0x05, 0x01, 0xf5]); // BYTE[2] Color (this byte only needed if (Graphic&0x8000)
      tmp_0x78 = tmp_0x78.concat([0x40, 0x00, 0x1f, 0xba, 0x15, 0x2e, 0x04, 0x01, 0xd9]); //
      tmp_0x78 = tmp_0x78.concat([0x40, 0x00, 0x1f, 0xb9, 0x17, 0x0f, 0x03, 0x00, 0x00]); //
      tmp_0x78 = tmp_0x78.concat([0x40, 0x00, 0x1f, 0xb8, 0x0e, 0xfa, 0x01, 0x00, 0x00]); //
      tmp_0x78 = tmp_0x78.concat([0x40, 0x00, 0x1f, 0xb4, 0x17, 0x18, 0x06, 0x00, 0x00]); //
      tmp_0x78 = tmp_0x78.concat([0x40, 0x00, 0x1f, 0xb3, 0x1f, 0x03, 0x16, 0x05, 0x2f]); //
      tmp_0x78 = tmp_0x78.concat([0x40, 0x00, 0x1f, 0xb2, 0x13, 0xc6, 0x07, 0x00, 0x00]); //
      // endLoop
      tmp_0x78 = tmp_0x78.concat([0x00, 0x00, 0x00, 0x00]); // BYTE[4] 0x00000000

      dump(tmp_0x78, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0x78));
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x17 = [0x17]; // health bar status update (KR)
      tmp_0x17 = tmp_0x17.concat([0x00, 0x0c]); // length
      tmp_0x17 = tmp_0x17.concat([0x00, 0x00, 0x1f, 0xc4]); // mobile Serial
      tmp_0x17 = tmp_0x17.concat([0x00, 0x01]); // 0x0001
      tmp_0x17 = tmp_0x17.concat([0x00, 0x01]); // Status Color (0x01 = Green, 0x02 = Yellow, 0x03 = Red)
      tmp_0x17 = tmp_0x17.concat([0x01]); // Flag (0x00 = Remove Status Color, 0x01 = Enable Status Color)

      dump(tmp_0x17, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0x17));
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x20 = [0x20]; // draw game player
      tmp_0x20 = tmp_0x20.concat([0x00, 0x00, 0x1f, 0xc4]); // creature id
      tmp_0x20 = tmp_0x20.concat([0x01, 0x90]); // bodyType
      tmp_0x20 = tmp_0x20.concat([0x00]); // unknown1 (0)
      tmp_0x20 = tmp_0x20.concat([0x83, 0xea]); // skin color / hue
      tmp_0x20 = tmp_0x20.concat([0x00]); // flag byte
      tmp_0x20 = tmp_0x20.concat([0x05, 0xd8]); // xLoc
      tmp_0x20 = tmp_0x20.concat([0x06, 0x5c]); // yLoc
      tmp_0x20 = tmp_0x20.concat([0x00, 0x00]); // unknown2 (0)
      tmp_0x20 = tmp_0x20.concat([0x03]); // direction
      tmp_0x20 = tmp_0x20.concat([0x0a]); // zLoc

      dump(tmp_0x20, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0x20));
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x4f = [0x4f]; // overall light level
      /*
      0x00 - day
      0x09 - OSI night
      0x1F - Black
      Max normal val = 0x1F
      */
      tmp_0x4f = tmp_0x4f.concat([0x1a]); // level
      dump(tmp_0x4f, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0x4f));
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x11 = [0x11]; // status bar info
      tmp_0x11 = tmp_0x11.concat([0x00, 0x70]); // length
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00, 0x1f, 0xc4]); // player serial
      tmp_0x11 = tmp_0x11.concat(Buffer.from(character.charName).toJSON().data); // player name
      tmp_0x11 = tmp_0x11.concat([0x00, 0x19]); // Current Hit Points (see notes)
      tmp_0x11 = tmp_0x11.concat([0x00, 0x19]); // Max Hit Points (see notes)
      /*
      1: Allowed to Change In StatusBar (like with pets)
      0: Not allowed
      */
      tmp_0x11 = tmp_0x11.concat([0x00]); // Name Change Flag
      /*
      0x00: no more data following (end of packet here).
      0x01: T2A Extended Info
      0x03: UOR Extended Info
      0x04: AOS Extended Info (4.0+)
      0x05: UOML Extended Info (5.0+)
      0x06: UOKR Extended Info (UOKR+)
      */
      tmp_0x11 = tmp_0x11.concat([0x06]); // Status Flag
      /*
      0: Male Human
      1: Female Human
      2: Male Elf
      3: Female Elf

      1: Human
      2: Elf
      3: Gargoyle
      */
      tmp_0x11 = tmp_0x11.concat([0x00]); // Sex+Race
      tmp_0x11 = tmp_0x11.concat([0x00, 0x19]); // Strength
      tmp_0x11 = tmp_0x11.concat([0x00, 0x14]); // Dexterity
      tmp_0x11 = tmp_0x11.concat([0x00, 0x2d]); // Intelligence
      tmp_0x11 = tmp_0x11.concat([0x00, 0x14]); // Current Stamina
      tmp_0x11 = tmp_0x11.concat([0x00, 0x14]); // Max Stamina
      tmp_0x11 = tmp_0x11.concat([0x00, 0x2d]); // Current Mana
      tmp_0x11 = tmp_0x11.concat([0x00, 0x2d]); // Max Mana
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00, 0x03, 0xe8]); // Gold In Pack
      tmp_0x11 = tmp_0x11.concat([0x00, 0x06]); // Armor Rating (see notes)
      tmp_0x11 = tmp_0x11.concat([0x00, 0x3d]); // Weight

      tmp_0x11 = tmp_0x11.concat([0x00, 0x7f]); // Hit Chance Increase
      tmp_0x11 = tmp_0x11.concat([0x01, 0x01]); // Swing Speed Increase
      tmp_0x11 = tmp_0x11.concat([0x2c, 0x00]); // Damage Chance Increase
      tmp_0x11 = tmp_0x11.concat([0x05, 0x00]); // Lower Reagent Cost
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00]); // Hit Points Regeneration
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00]); // Stamina Regeneration
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00]); // Mana Regeneration
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00]); // Reflect Physical Damage
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00]); // Enhance Potions
      tmp_0x11 = tmp_0x11.concat([0x01, 0x00]); // Defense Chance Increase
      tmp_0x11 = tmp_0x11.concat([0x04, 0x00]); // Spell Damage Increase
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00]); // Faster Cast Recovery
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00]); // Faster Casting
      tmp_0x11 = tmp_0x11.concat([0x46, 0x00]); // Lower Mana Cost
      tmp_0x11 = tmp_0x11.concat([0x46, 0x00]); // Strength Increase
      tmp_0x11 = tmp_0x11.concat([0x46, 0x00]); // Dexterity Increase
      tmp_0x11 = tmp_0x11.concat([0x46, 0x00]); // Intelligence Increase
      tmp_0x11 = tmp_0x11.concat([0x46, 0x00]); // Hit Points Increase
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00]); // Stamina Increase
      tmp_0x11 = tmp_0x11.concat([0x2d, 0x00]); // Mana Increase
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00]); // Maximum Hit Points Increase
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00]); // Maximum Stamina Increase
      tmp_0x11 = tmp_0x11.concat([0x00, 0x00]); // Maximum Mana Increase

      dump(tmp_0x11, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0x11));
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0xbf_0x19 = [0xbf]; // general information packet
      tmp_0xbf_0x19 = tmp_0xbf_0x19.concat([0x00, 0x06]); // length
      tmp_0xbf_0x19 = tmp_0xbf_0x19.concat([0x00, 0x19]); // subcommand id (extended stats)
      // subcommand details
      tmp_0xbf_0x19 = tmp_0xbf_0x19.concat([0x02]); // subsubcommand (0x2 for 2D client, 0x5 for KR client)
      tmp_0xbf_0x19 = tmp_0xbf_0x19.concat([0x00, 0x00, 0x1f, 0xc4]); // serial
      tmp_0xbf_0x19 = tmp_0xbf_0x19.concat([0x00]); // unknown (always 0)
      tmp_0xbf_0x19 = tmp_0xbf_0x19.concat([0x00]); // Lock flags (0 = up, 1 = down, 2 = locked, FF = update mobile status animation ( KR only )

      dump(tmp_0xbf_0x19, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0xbf_0x19));
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x72 = [0x72]; // request war mode
      /*
      0x00 - Normal
      0x01 - Fighting
      */
      tmp_0x72 = tmp_0x72.concat([0x00]); // flag
      tmp_0x72 = tmp_0x72.concat([0x00, 0x32, 0x00]); // unknown1 (always 00 32 00 in testing)

      dump(tmp_0x72, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0x72));
      dump(response, 'server (compressed) *');
      socket.write(response);

      let tmp_0x55 = [0x55]; // login complete
      dump(tmp_0x55, 'server (uncompressed) *');
      response = compression.compress(Buffer.from(tmp_0x55));
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

server.on('listening', () => console.log(`server::listening (RAZOR: ${razor})`));
server.on('close', () => console.log('server::close'));
server.on('error', err => console.log(`server::error ${err ? '| err: ' + err : ''}`));

server.listen(config.port, () => console.log(`server::listen (${config.port})`));

/*
client --->
ef                                                                                                 o

internal/buffer.js:51
    throw new ERR_BUFFER_OUT_OF_BOUNDS();
    ^

RangeError [ERR_BUFFER_OUT_OF_BOUNDS]: Attempt to write outside buffer bounds
    at boundsError (internal/buffer.js:51:11)
    at Uint8Array.readUInt32BE (internal/buffer.js:196:5)
    at Socket.readUInt32BE (/Users/gokaygurcan/Projects/GitHub/poc/index.js:230:23)
    at Socket.emit (events.js:182:13)
    at addChunk (_stream_readable.js:283:12)
    at readableAddChunk (_stream_readable.js:264:11)
    at Socket.Readable.push (_stream_readable.js:219:10)
    at TCP.onStreamRead [as onread] (internal/stream_base_commons.js:94:17)
error Command failed with exit code 1.
*/
