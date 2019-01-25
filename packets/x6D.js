// @flow

export const x6D = (musicID: Array<number>): Buffer => {
  let tmp_0x6d: Array<number> = [0x6d]; // play midi music

  tmp_0x6d = tmp_0x6d.concat(musicID); // musicID

  return Buffer.from(tmp_0x6d);
};
