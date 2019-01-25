// @flow

export const xA8 = (servers: Array<Object>): Buffer => {
  let tmp_0xa8: Array<number> = [0xa8]; // game server list
  let fixedLength: number = 1 + 2 + 1 + 2; // cmd + length + sysinfo + number of servers
  let dynamicLength: number = servers.length * (2 + 32 + 1 + 1 + 4); // index + name + percentage + timezone + ip
  let totalLength: number = fixedLength + dynamicLength;
  let length_0x80: Buffer = Buffer.alloc(2);

  length_0x80.writeUInt16BE(totalLength, 0);
  tmp_0xa8 = tmp_0xa8.concat(length_0x80.toJSON().data); // length
  /*
  System Info Flags: 
  0xCC - Do not send video card info
  0x64 - Send Video card
  RunUO And SteamEngine both send 0x5D
  */
  tmp_0xa8 = tmp_0xa8.concat([0x64]); // system info
  tmp_0xa8 = tmp_0xa8.concat([servers.length & 0xff00, servers.length & 0xff]); // # of servers

  for (let i: number = 0; i < servers.length; ++i) {
    let server: Object = servers[i];

    tmp_0xa8 = tmp_0xa8.concat([i & 0xff00, i & 0xff]); // server index (0-based)

    let name: Buffer = Buffer.alloc(32);
    name.write(server.name);

    tmp_0xa8 = tmp_0xa8.concat(name.toJSON().data); // server name
    tmp_0xa8 = tmp_0xa8.concat([0x01]); // percent full
    tmp_0xa8 = tmp_0xa8.concat([0x02]); // timezone
    // server ip to ping
    tmp_0xa8 = tmp_0xa8.concat(server.ip.split('.').reverse().map(octet => parseInt(octet))); // prettier-ignore
  }

  return Buffer.from(tmp_0xa8);
};
