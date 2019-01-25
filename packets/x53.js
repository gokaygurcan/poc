// @flow

export const x53 = (reason: string): Buffer => {
  let tmp_0x53: Array<number> = [0x53]; // reject character logon packet

  /*
    0x00 - Incorrect Password
    0x01 - This character does not exist any more!
    0x02 - This character already exists.
    0x03 - Could not attach to game server.
    0x04 - Could not attach to game server.
    0x05 - Another character is logged in.
    0x06 - Synchronization Error.
    0x07 - Idle too long.
    0x08 - Could not attach to game server.
    0x09 - Character Transfer.
  */  
  switch(reason) {
    case 'INCORRECT_PASSWORD':
      tmp_0x53 = tmp_0x53.concat([0x00]);
      break;

    case 'THIS_CHARACTER_DOES_NOT_EXIST_ANY_MORE':
      tmp_0x53 = tmp_0x53.concat([0x01]);
      break;

    case 'THIS_CHARACTER_ALREADY_EXISTS':
      tmp_0x53 = tmp_0x53.concat([0x02]);
      break;

    case 'COULD_NOT_ATTACH_TO_GAME_SERVER':
      tmp_0x53 = tmp_0x53.concat([0x03]);
      break;

    case 'COULD_NOT_ATTACH_TO_GAME_SERVER_2':
      tmp_0x53 = tmp_0x53.concat([0x04]);
      break;

    case 'ANOTHER_CHARACTER_IS_LOGGED_IN':
      tmp_0x53 = tmp_0x53.concat([0x05]);
      break;

    case 'SYNCHRONIZATION_ERROR':
      tmp_0x53 = tmp_0x53.concat([0x06]);
      break;

    case 'IDLE_TOO_LONG':
      tmp_0x53 = tmp_0x53.concat([0x07]);
      break;

    case 'COULD_NOT_ATTACH_TO_GAME_SERVER_3':
      tmp_0x53 = tmp_0x53.concat([0x08]);
      break;

    case 'CHARACTER_TRANSFER':
      tmp_0x53 = tmp_0x53.concat([0x09]);
      break;
      
    default:
    tmp_0x53 = tmp_0x53.concat([0x03]);
  }

  return Buffer.from(tmp_0x53);
};
