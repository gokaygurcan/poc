// @flow

import { hexy } from 'hexy';

// prettier-ignore
let buff: Buffer = Buffer.from([
  0xef,
  0x07, 0x00, 0x47, 0x1b,
  0x00, 0x00, 0x00, 0x07,
  0x00, 0x00, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x47,
  0x00, 0x00, 0x00, 0x1b
]);

console.log(hexy(buff, { width: 16, numbering: 'none', format: 'twos' }));

// ----- ----- ----- ----- -----

class BasePacket {
  cmd: number;
}

class Packet extends BasePacket {
  length: number;

  constructor() {
    super();
  }
}

class LoginServerSeed extends Packet {
  seed: number;
  major: number;
  minor: number;
  revision: number;
  patch: number;

  constructor(buffer: Buffer) {
    super();

    this.cmd = 0xef;
    this.length = 15;

    this.seed = buffer.readUInt32BE(1);
    this.major = buffer.readUInt32BE(5);
    this.minor = buffer.readUInt32BE(9);
    this.revision = buffer.readUInt32BE(13);
    this.patch = buffer.readUInt32BE(17);
  }
}

let ef: Packet = new LoginServerSeed(buff); // ?
console.table(ef);
