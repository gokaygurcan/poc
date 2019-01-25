// @flow

import type { Socket } from 'net';

export type tVersion = {
  major: number,
  minor: number,
  revision: number,
  patch: number
};

export type tSocket = Socket & {
  version: tVersion,
  seed: number,
  username: string
};

export type tClientKeys = {
  key1: number,
  key2: number
};

export type tCompression = {
  huffmanTable: Array<number>,
  compress: (src: Buffer | Array<number>) => Buffer,
  decompress: (src: Buffer | Array<number>) => Buffer
};

export type tConnection = {
  username: string,
  version: tVersion
};

export type tServer = {
  id: number,
  name: string,
  active: boolean,
  ip: string,
  port: number | string,
  max_players: number,
  timezone: number
};

export type tPosition = {
  x: number,
  y: number,
  z: number,
  map: number
};

export type tStartingLocation = {
  name: string,
  area: string,
  position: tPosition,
  cliloc: number
};

export type tConfig = {
  port: number,
  servers: Array<tServer>,
  startingLocations: Array<tStartingLocation>,
  charLimit: number
};

export type tCharacter = {
  charName: string
};

export type tUser = {
  username: string,
  password: string,
  characters: Array<tCharacter>
};
