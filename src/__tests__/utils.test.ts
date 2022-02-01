import { readFileSync } from 'fs';
import { join } from 'path';

import { IOBuffer } from 'iobuffer';

import { setEndianFromValue, FileStatus } from '../utils';

test('inspect bits', () => {
  /*
   * to see how bits are inspected, just invent
   * a number and check the props.
   */

  const status = new FileStatus(0b00000110010101);
  /* the number means: stores data, in int32 form,
and it is complex, etc */
  expect(status).toMatchObject({
    storesData: true,
    isSpectrum: false,
    isInt32: true,
    isFloat32: false,
    isComplex: true,
    isHypercomplex: false,
    isAcqPar: true,
    isSecondFT: true,
    isTransformed: false,
    isNp: false,
    isNf: false,
    isNi: false,
    isNi2: false,
  });
});

describe('test utils against proton fid', () => {
  const file = readFileSync(join(__dirname, '../../data/proton.fid/fid'));
  const buffer = new IOBuffer(file);

  it('test endianness', () => {
    const initOffset = buffer.offset;
    expect(setEndianFromValue(buffer)).toBe('BE');
    expect(buffer.isBigEndian()).toBe(true);
    const finOffset = buffer.offset;
    expect(initOffset).toBe(finOffset);
  });
});
