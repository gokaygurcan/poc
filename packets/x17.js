// @flow

export const x17 = (): Buffer => {
  let tmp_0x17: Array<number> = [0x17]; // health bar status update (KR)

  tmp_0x17 = tmp_0x17.concat([0x00, 0x0c]); // length
  tmp_0x17 = tmp_0x17.concat([0x00, 0x00, 0x1f, 0xc4]); // mobile Serial
  tmp_0x17 = tmp_0x17.concat([0x00, 0x01]); // 0x0001
  tmp_0x17 = tmp_0x17.concat([0x00, 0x01]); // Status Color (0x01 = Green, 0x02 = Yellow, 0x03 = Red)
  tmp_0x17 = tmp_0x17.concat([0x01]); // Flag (0x00 = Remove Status Color, 0x01 = Enable Status Color)

  return Buffer.from(tmp_0x17);
};
