// @flow

// types
import type { tServer } from '../types';

export const x8C = (server: tServer, key: Buffer): Buffer => {
  let tmp_0x8c = [0x8c]; // connect to game server

  // server ip
  tmp_0x8c = tmp_0x8c.concat(server.ip.split('.').map(octet => parseInt(octet) & 0xff)); // prettier-ignore

  let port: Buffer = Buffer.alloc(2);
  port.writeInt16BE(parseInt(server.port, 10), 0);
  tmp_0x8c = tmp_0x8c.concat(port.toJSON().data);

  tmp_0x8c = tmp_0x8c.concat(key.toJSON().data);

  return Buffer.from(tmp_0x8c);
};
