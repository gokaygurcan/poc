// @flow

export const x4F = (level: number): Buffer => {
  let tmp_0x4f: Array<number> = [0x4f]; // overall light level
  /*
  0x00 - day
  0x09 - OSI night
  0x1F - Black
  Max normal val = 0x1F
  */
  tmp_0x4f = tmp_0x4f.concat([level]); // level

  return Buffer.from(tmp_0x4f);
};
