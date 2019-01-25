// @flow

export const x73 = (sequence: number): Buffer => {
  let tmp_0x73: Array<number> = [0x73]; // ping

  tmp_0x73 = tmp_0x73.concat([sequence]); // sequence number

  return Buffer.from(tmp_0x73);
};
