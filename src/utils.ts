import { IOBuffer } from 'iobuffer';

/**
 * Status of the data stored. Used in block headers and file header.
 * @param status pass the code
 * @return status object with important information about the block data.
 */
export class Status {
  /** - 0x1 indicates the presence of data */
  public storesData: boolean;
  /** 0x2 would indicate "spectrum" (as opposed to "FID") */
  public isSpectrum: boolean;
  /** 0x4 indicates 32-bit (as opposed to 16-bit) data */
  public isInt32: boolean;
  /** 0x8 indicates (32-bit, IEEE format) floating point data (**then bit 2 is irrelevant**) */
  public isFloat32: boolean;
  /** 0x10 indicates complex (as opposed to real) data */
  public isComplex: boolean;
  /** 0x20 indicates hypercomplex data (transformed nD data only) */
  public isHypercomplex: boolean;
  /** 0x40 is unused up to VnmrJ 1.1D maybe more */
  public isBaselineCorrected: boolean;

  public constructor(status: number) {
    this.storesData = (status & 0x1) !== 0;
    if (!this.storesData) {
      throw new Error('No data stored in file. Exiting...');
    }
    this.isSpectrum = (status & 0x2) !== 0;
    this.isInt32 = (status & 0x4) !== 0;
    this.isFloat32 = (status & 0x8) !== 0;
    this.isComplex = (status & 0x10) !== 0;
    this.isHypercomplex = (status & 0x20) !== 0;
    this.isBaselineCorrected = (status & 0x40) !== 0;
  }
}

/**
 * Block status from code.
 * Parses each bit in the Int16 number.
 * @extends [[`Status`]]
 * @param status - The code.
 * @return object - Block metadata.
 */
export class BlockStatus extends Status {
  public moreBlocks: boolean;
  public npComplex: boolean;
  public nfComplex: boolean;
  public niComplex: boolean;
  public ni2Complex: boolean;

  public constructor(status: number) {
    super(status);
    this.moreBlocks = (status & 0x80) !== 0;
    this.npComplex = (status & 0x100) !== 0;
    this.nfComplex = (status & 0x200) !== 0;
    this.niComplex = (status & 0x400) !== 0;
    this.ni2Complex = (status & 0x800) !== 0;
  }
}
/**
 * File status bits.
 * Parses each bit in the Int16 number.
 * @extends [[`Status`]]
 * @param status - The status code
 * @return status  - Object with important information about the block data.
 */
export class FileStatus extends Status {
  /** 0x80. 0: Not DDR Acq, 1: DDR Acq */
  public isAcqPar: boolean;
  /** 0x100. 0 means is first FT, 1 is second */
  public isSecondFT: boolean;
  /** 0x200. 0 regular, 1 transposed */
  public isTransformed: boolean;
  /** Is 3D. 1 for 3D data */
  public is3D: boolean;
  /** 0x800. np dimension is active */
  public isNp: boolean;
  /** 0x1000. nf dimension is active */
  public isNf: boolean;
  /** 0x2000. ni dimension is active */
  public isNi: boolean;
  /** 0x4000. n2 dimension is active */
  public isNi2: boolean;
  public constructor(status: number) {
    super(status);
    this.isAcqPar = (status & 0x80) !== 0;
    this.isSecondFT = (status & 0x100) !== 0;
    this.isTransformed = (status & 0x200) !== 0;
    this.is3D = (status & 0x400) !== 0;
    this.isNp = (status & 0x800) !== 0;
    this.isNf = (status & 0x1000) !== 0;
    this.isNi = (status & 0x2000) !== 0;
    this.isNi2 = (status & 0x4000) !== 0;
  }
}

/**
Big Endian (apparently from Sun systems)
Little Endian (most other systems)
*/
type Endian = 'BE' | 'LE';

/** Set the endianness using eBytes property value. Buffer offset is left unchanged.
 * From the VnmrJ user manual:
 * > the byte order in our FIDs is whatever the acquisition CPU (Motorola 68000, 68040,
or PowerPC 603) delivers and does NOT depend on the type of host computer.
 * @param buffer as iobuffer  i.e `new IOBuffer(buffer)`
 * @return endianness  - String indicating resulting endian.
 */
export function setEndianFromValue(buffer: IOBuffer): Endian {
  buffer.setLittleEndian();/*is the default but in case user has changed it */

  /* buffer.mark() could be confusing. Just use the current offset. */
  const initialOffset = buffer.offset;
  const bits = 32 * 3 
  /* Get to eBytes */
  buffer.offset = bits/8

  /* If read in the wrong way'd be huge. eBytes must exist. */
  const readLE = buffer.readInt32();
  const valsLE = [2, 4];
  const valsBE = [2 ** 25, 2 ** 26];

  if (valsLE.includes(readLE)) {
    /* already set */
  } else if (valsBE.includes(readLE)) {
    buffer.setBigEndian();
  } else {
    throw new Error(`Unexpected value of eBytes (${readLE}). Expect one of
                    ${valsLE.concat(valsBE).join()}`);
  }

  buffer.offset = initialOffset;

  /* per IOBuffer defs, if one true the other one is false */
  const endian = buffer.isBigEndian() ? 'BE' : 'LE';

  return endian;
}

/** Software version, type of file, instrument vendor
 * @param code takes the number
 * @return object representing the application/software/file details.
 * If softwareVersion is 0, software was not VnmrJ (afaik).
 */
export class AppDetails {
  /** Bits 0-5:  31 different software versions; 32-63 are for 3D */
  public softwareVersion: number;
  /** Bits 6-10:  31 different file types (64-1984 in steps of 64) */
  public typeOfFile: {
    fidFile: boolean;
    dataFile: boolean;
    data3DFile: boolean /* for Ft3d */;
  };
  /* Bits 11-14 */
  /** VnmrJ can read different fid formats, and when you save
    it probably writes down where it is coming from, if it can detect 
    it */
  public vendorIdStatus: {
    isVar: boolean /** 1 = Varian data*/;
    isQOne: boolean /** 1 = Q-One data*/;
    isMakeFid: boolean /** 1 = data from makefid*/;
    isJeol: boolean /** 1 = JEOL data*/;
    isBru: boolean /** 1 = Bruker data*/;
    isMag: boolean /** 1 = Magritek data*/;
    isOx: boolean /** 1 = Oxford data*/;
    ipVers: boolean /** preserves version number*/;
    ipFileId: boolean /** preserves file ID status*/;
    ipVendorId: boolean /** preserves vendor ID status*/;
  };
  public constructor(code: number) {
    this.softwareVersion = code & (2 ** 6 - 1);
    this.typeOfFile = {
      fidFile: (code & 0x40) !== 0,
      dataFile: (code & 0x80) !== 0,
      data3DFile: (code & 0x100) !== 0,
    };
    this.vendorIdStatus = {
      isVar: (code & 0x0) !== 0,
      isQOne: (code & 0x800) !== 0,
      isMakeFid: (code & 0x1000) !== 0,
      isJeol: (code & 0x2000) !== 0,
      isBru: (code & 0x4000) !== 0,
      isMag: (code & 0x1800) !== 0,
      isOx: (code & 0x2800) !== 0,
      ipVers: (code & 0x003f) !== 0,
      ipFileId: (code & 0x07c0) !== 0,
      ipVendorId: (code & 0x7800) !== 0,
    };
  }
}
