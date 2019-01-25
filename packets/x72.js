// @flow

export const x72 = (flag: number): Buffer => {
  let tmp_0x72: Array<number> = [0x72]; // request war mode

  /*
    Flag:
      0x00 - Normal
      0x01 - Fighting
  */
  tmp_0x72 = tmp_0x72.concat([flag]); // flag
  tmp_0x72 = tmp_0x72.concat([0x00, 0x32, 0x00]); // unknown1 (always 00 32 00 in testing)

  return Buffer.from(tmp_0x72);
};
