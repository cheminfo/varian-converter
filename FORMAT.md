# Varian Native format

Varian/Agilent instruments store data under a directory ending in '.fid': 
* **fid**: fid binary data.
* **procpar**: user-input experiment metadata, parameters.
* **text**: text file.

**fid** file stores experiment's parameters **and** the FIDs.

The FID consist in irradiating atoms with a pulse of radiofrequency that excites the nuclear spin. Those then decay back to equilibrium and this signal (induced voltage caused by the change in magnetic field) is measured over time. This decay energy is called Free Induction Decay (FID). 

The actual FID data (induced voltage) is typically stored as pairs floating-point numbers, and shown vs time.

To get the shifts the FIDs has to be Fourier Transformed.

## File Post-Processing

When file was post-processed (after measurement) **procpar** and **fid** file params may disagree. **fid** always matches the **data** on disk. There are however, important sample data to be taken from **procpar**.

* Get FIDs and params from **fid**,
* Get sample information from **procpar**.

## Blocks
* FileHeader (first 32B): File Metadata: the number of blocks, size of blocks etc. 
For fid files holding FIDs - and not transformed spectras, the number of block headers is 1.
* BlockHeader (28B): Block Metadata. There may be several headers depending on different FileHeader
  parameters.
* BlockBody: either Int16, Int32 or Float32 numbers.

The general structure of those headers is different, but they share some properties (example
[Status class, under utils](./src/utils).)


## Reads
* [Free Induction Decay FID Wiki](https://en.wikipedia.org/wiki/Free_induction_decay).
* [NMR and Imaging](https://www.cis.rit.edu/htbooks/mri/)
* [Fourier Transform](https://homepages.inf.ed.ac.uk/rbf/CVonline/LOCAL_COPIES/OWENS/LECT4/node2.html)
