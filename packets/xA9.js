// @flow

// node modules
import { lt } from 'semver';

// types
import type { tConfig, tSocket, tUser } from '../types';

export const xA9 = (config: tConfig, socket: tSocket, user: tUser): Buffer => {
  let tmp_0xa9: Array<number> = [0xa9]; // characters / starting locations

  // >= 7.0.13.0
  let newClient: boolean = true;
  if (lt(`${socket.version.major}.${socket.version.minor}.${socket.version.revision}`, '7.0.13')) {
    newClient = false;
  }

  console.log(`newClient: ${newClient.toString()}`);

  let length_0xa9: number = 11 + config.charLimit * 60 + config.startingLocations.length * (newClient ? 89 : 63);
  let temp_len_0xa9: Buffer = Buffer.alloc(2);
  temp_len_0xa9.writeUInt16BE(length_0xa9, 0);
  tmp_0xa9 = tmp_0xa9.concat(temp_len_0xa9.toJSON().data);
  // tmp_0xa9 = tmp_0xa9.concat([length_0xa9 & 0xff00, length_0xa9 & 0xff]); // writeUInt16BE ?
  tmp_0xa9 = tmp_0xa9.concat(config.charLimit); // number of characters

  for (let i: number = 0; i < config.charLimit; ++i) {
    let tempBuff = Buffer.alloc(60);

    if (i < user.characters.length) {
      tempBuff.write(user.characters[i].charName.substr(0, 30));
    }

    tmp_0xa9 = tmp_0xa9.concat(tempBuff.toJSON().data);
  }

  tmp_0xa9 = tmp_0xa9.concat(config.startingLocations.length); // number of starting locations (cities)

  let tempSize: number = newClient ? 32 : 31;
  for (let i: number = 0; i < config.startingLocations.length; ++i) {
    let startingLocation: Object = config.startingLocations[i];

    tmp_0xa9 = tmp_0xa9.concat(i); // locationIndex (0-based)

    let tempLocationName: Buffer = Buffer.alloc(tempSize);
    tempLocationName.write(startingLocation.name, 0);
    tmp_0xa9 = tmp_0xa9.concat(tempLocationName.toJSON().data);

    let tempAreaName: Buffer = Buffer.alloc(tempSize);
    tempAreaName.write(startingLocation.area, 0);
    tmp_0xa9 = tmp_0xa9.concat(tempAreaName.toJSON().data);

    if (newClient === true) {
      let tempPositionX = Buffer.alloc(4);
      tempPositionX.writeUInt32BE(startingLocation.position.x, 0);
      tmp_0xa9 = tmp_0xa9.concat(tempPositionX.toJSON().data); // city x coordinate

      let tempPositionY = Buffer.alloc(4);
      tempPositionY.writeUInt32BE(startingLocation.position.y, 0);
      tmp_0xa9 = tmp_0xa9.concat(tempPositionY.toJSON().data); // city y coordinate

      let tempPositionZ = Buffer.alloc(4);
      tempPositionZ.writeUInt32BE(startingLocation.position.z, 0);
      tmp_0xa9 = tmp_0xa9.concat(tempPositionZ.toJSON().data); // city z coordinate

      let tempPositionMap = Buffer.alloc(4);
      tempPositionMap.writeUInt32BE(startingLocation.position.map, 0);
      tmp_0xa9 = tmp_0xa9.concat(tempPositionMap.toJSON().data); // city map / map id

      let tempPositionCliloc = Buffer.alloc(4);
      tempPositionCliloc.writeUInt32BE(startingLocation.cliloc, 0);
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
  tempFlags.writeUInt32BE(flags, 0);
  tmp_0xa9 = tmp_0xa9.concat(tempFlags.toJSON().data);

  tmp_0xa9 = tmp_0xa9.concat([0xff, 0xff]); // if SA Enchanced client, last character slot (for highlight)


  console.log('----------------------------');
  console.log(tmp_0xa9);
  console.log('----------------------------');




  return Buffer.from(tmp_0xa9);
};
