// @flow

export const xB9 = (): Buffer => {
  let tmp_0xb9 = [0xb9]; // enable locked client features

  // prettier-ignore
  let bitflag: number = 0x000000 
                      | 0x000001  // enable T2A features: chat, regions
                      | 0x000002  // enable renaissance features
                      | 0x000004  // enable third dawn features
                      | 0x000008  // enable LBR features: skills, map
                      | 0x000010  // enable AOS features: skills, map, spells, fightbook
                      | 0x000020  // 6th character slot
                      | 0x000040  // enable SE features
                      | 0x000080  // enable ML features: elven race, spells, skills
                   // | 0x000100  // enable 8th age splash screen
                      | 0x000200  // enable 9th age splash screen
                   // | 0x000400  // enable 10th age
                   // | 0x000800  // enable increased housing and bank storage
                      | 0x001000  // 7th character slot
                   // | 0x002000  // enable KR faces
                   // | 0x004000  // enable trial account
                      | 0x008000  // enable live account
                      | 0x010000  // enable SA features: gargoyle race, spells, skills
                      | 0x020000  // enable HSA features
                      | 0x040000  // enable Gothic housing tiles
                      | 0x080000  // enable Rustic housing tiles
                      | 0x100000  // enable Jungle housing tiles
                      | 0x200000  // enabled Shadowguard housing tiles
                      | 0x400000  // enable TOL features
                      | 0x800000; // enable Endless Journey account

  let tempBitFlag: Buffer = Buffer.alloc(4);
  tempBitFlag.writeUInt32BE(bitflag, 0);
  tmp_0xb9 = tmp_0xb9.concat(tempBitFlag.toJSON().data);

  return Buffer.from(tmp_0xb9);
};
