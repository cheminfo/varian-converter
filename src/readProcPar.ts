import { Lines } from './utils';
/**
 * Read the parameter's first line.
 * Parameters are groups of lines, the first line
 * is like a header, and contains data used to parse next lines
 * Definition is here
 * [OpenVnmrJ][init.h]
 * @param lineIn - header line / first line as a string
 */
export class Header {
  /** parameter name */
  public name: string;
  public subType: string;
  /** 0 undefined, 1 for real, 2 for string 
  1 and 2 may be arrays 
  */
  public basicType: number;
  /** Maximum value for this current parameter */
  public maxValue: number;
  /** Minimum value for this current parameter */
  public minValue: number;
  /** Step size value for this current parameter */
  public stepSize: number;
  public gGroup: string;
  public dGroup: string;
  public protection: string;
  public active: string;
  public intptr: string;

  public constructor(lineIn: string) {
    const line = lineIn.split(' ');
    this.name = line[0];
    this.subType = line[1];
    this.basicType = parseInt(line[2], 10);
    this.maxValue = parseInt(line[3], 10);
    this.minValue = parseInt(line[4], 10);
    this.stepSize = parseInt(line[5], 10);
    this.gGroup = line[6];
    this.dGroup = line[7];
    this.protection = line[8];
    this.active = line[9];
    this.intptr = line[10];
  }
}

/** Parameter Class represents a parameter
 * Parameters are either user input (i.e sample description)
 * or intrument settings.
 * The structure of a single parameter, is something like this:
 ```
 Header
 NOL num(1)|str(2)
 <thirLine is optional>
 ```
 * If basicType is 2 and NOL (NOfLines) > 1 then string is multiline.
 * @param lines - All the lines as a [[`Lines`]] class
 */
export class Param extends Header {
  /** Values from second Line (but can be multi line) */
  public values: string[] = [];
  /** Values from 'third' Line */
  public enumerable: number;
  /** Optional val from 'third' Line */
  public enumerables: string[] = [];

  public constructor(lines: Lines) {
    /* 
       Each parameter has 3 "lines" but the second line 
       may actually be several lines
    */
    super(lines.readLine()); /* pass first line to the Header class */
    const line2 = lines.readLine();
    /*  NOL will be updated (let). number of lines */
    let numOfLines = parseInt(line2.split(' ')[0], 10);

     if (this.basicType === 1) { // basicType=0 leaves values=[ ] 
      /* real num */
      this.values = line2.split(' ').slice(1); /* leave NOL out */
    } else if(this.basicType === 2){
      this.values = line2.split('"').slice(1,2); /* split on "s */

      /* strings may have multiple lines */
      while (numOfLines > 1) {
        this.values.push(lines.readLine().split('"')[1]);
        numOfLines--;
        /* if line 2 has NOF=3, we read 2 more i.e NOF=3, NOF=2.
           First (line2) was read before */
      }
    }

    const line3 = lines.readLine();
    /* How many "p1" "p2" "p3" */
    this.enumerable = parseInt(line3.split(' ')[0], 10);

    if (this.enumerable !== 0) { /* if 0, it is [] */
      if (this.basicType === 1) {
        // reals
        this.enumerables = line3.split(' ').slice(1) as string[];
      } else if (this.basicType === 2) { // strings
        /* if "", split " has length 3, we retain the data in between '' */
        this.enumerables = line3
        .split('"').filter((el,idx) => idx%2===1) as string[];
      }
    }
  }
}

/** Get parameters from the procpar file
 * @param buffer - a Buffer object. You get this using:
 * `fs.readFileSync('path/to/propar')`
 */
export function getParameters(buffer: Buffer): Param[] {
  let params: Param[] = [];
  let lines = new Lines(buffer); /*each element a line */
  while (lines.offset < lines.length - 1) {
    const param = new Param(lines); /* updates the lines offset */
    params.push(param);
  }
  return params;
}
/* [init.h]:https://github.com/OpenVnmrJ/OpenVnmrJ/blob/master/src/vnmr/init.h#L16 */
