import { IOBuffer } from 'iobuffer';

import { Block } from './readBlock';
import { FileHeader } from './readFileHeader';
import { setEndianFromValue } from './utils';

/**
 * varian-convert takes a `fid` input file as a buffer or array buffer
 * and retrieves an object storing all metadata, data and information from the
 * original `fid` file.
 */

export interface Fid {
  /** first block - header - of the fid file. Stores important file metadata.*/
  meta: FileHeader;
  blocks: Block[];
}
/**
 * converts a fid file to JSON object
 *
 * @param data fid file
 * @return Object containing all the parsed information from the fid file
 */
export function convert(fid: Buffer | ArrayBuffer): Fid {
  const buffer = new IOBuffer(fid);

  /* some files may use big endian */
  setEndianFromValue(buffer);

  const fileHeader = new FileHeader(buffer);
  let blocks: Block[] = [];
  for (let i = 0; i < fileHeader.nBlocks; i++) {
    blocks.push(new Block(buffer, fileHeader));
  }
  return { meta: fileHeader, blocks };
}
