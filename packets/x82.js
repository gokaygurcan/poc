// @flow

export const x82 = (reason: string): Buffer => {
  let tmp_0x82: Array<number> = [0x82];

  /*
    0x00 - Incorrect name/password.
    0x01 - Someone is already using this account.
    0x02 - Your account has been blocked.
    0x03 - Your account credentials are invalid.
    0x04 - Communication problem.
    0x05 - The IGR concurrency limit has been met.
    0x06 - The IGR time limit has been met.
    0x07 - General IGR authentication failure.
  */  
  switch(reason) {
    case 'INCORRECT_NAME_OR_PASSWORD':
      tmp_0x82 = tmp_0x82.concat([0x00]);
      break;

    case 'SOMEONE_IS_ALREADY_USING_THIS_ACCOUNT':
      tmp_0x82 = tmp_0x82.concat([0x01]);
      break;

    case 'YOUR_ACCOUNT_HAS_BEEN_BLOCKED':
      tmp_0x82 = tmp_0x82.concat([0x02]);
      break;

    case 'YOUR_CREDENTIALS_ARE_INVALID':
      tmp_0x82 = tmp_0x82.concat([0x03]);
      break;

    case 'COMMUNICATION_PROBLEM':
      tmp_0x82 = tmp_0x82.concat([0x04]);
      break;

    default:
      tmp_0x82 = tmp_0x82.concat([0x04]);
  }

  return Buffer.from(tmp_0x82);
};
