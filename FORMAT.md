# Varian Native format

Varian/Agilent instruments store data under a directory ending in '.fid': 
* **fid**: fid binary data.
* **procpar**: text file. Sample information, instrument parameters (pulse width etc.)
* **text**: text file. Comments, notes text.
* **log**: text file. Error messages, acquisition data.

**fid** file stores experiment's parameters **and** the FIDs.

The Free Induction Decay experiment (FID) consist in irradiating molecules in a magnetic field with a pulse of radiofrequency that excites the nuclear spin. Those then decay back to equilibrium and this signal (induced voltage caused by the change in magnetic field) is measured over time. This decay-energy is called Free Induction Decay (FID). 

The actual FID data are floating point numbers. To get the shifts the FIDs have to be Fourier Transformed.

## File Post-Processing

When file was post-processed (after measurement) **procpar** and **fid** file params may disagree. **fid** always matches the **data** on disk. There are however, important sample data to be taken from **procpar**.

* Get FIDs and params from **fid**,
* Get sample information from **procpar**.

## fid
* FileHeader (first 32B): File Metadata: the number of blocks, size of blocks etc. 
For fid files holding FIDs - and not transformed spectras, the number of block headers is 1.
* BlockHeader (28B): Block Metadata. There may be several headers depending on different FileHeader
  parameters.
* BlockBody: either Int16, Int32 or Float32 numbers.

The 1D NMR data files have the following structure:          
```
filehead  blockhead  blockdata  blockhead  blockdata ...  	
```								

The 2D NMR data files have the following structure:		
```
filehead  blockhead  blockhead2  blockdata ...		
```								

The 3D NMR data files have the following structure:		
```
filehead  blockhead  blockhead2  blockhead2  blockdata ..	
```								
								
All blocks within one file have exactly the same size.       
								
The general structure of those headers is different, but they share some properties (example
[Status class, under utils](./src/utils).)

## procpar
Text file storing the user input information, instrument settings. The arrange of
data is similar to:
```
<name> <subType> <basicType> ...
<nOfLines> <values>
lines 'children' of prev line
optional line
<name> <subType> <basicType> ...
<nOfLines> <values>
lines 'children' of prev line
```

The first `<name>` line is pretty much like a header, and tells how to parse the rest (apart from some data
included in the other lines themselves).

### Parameters
Some useful parameter names. To get the parameters from the array you could filter it by name (if you know the name): `arr.filter(p=> p.name=='apptype')`. It will be stored in the key "name".
These are a few `name`s, alphabetically:

* **apptype**, example std1D is a standard 1D measurement.
* **comment**
* **explist**, from the list of pre-set experiments (PROTON, CARBON...).
* **emailaddr**
* **file**
* **np** number of real datapoints (not imaginary/complex).
* **operator** (use that did the nmr)
* **pw**: pulse width. **pw90**: pulse with 90degrees.
* **sample**, **samplename**.
* **solvent**
* **temp**
* **time\_complete** (also time\_saved, time\_run...)
* **username**
See [OpenVnmrJ variables.h](https://github.com/OpenVnmrJ/OpenVnmrJ/blob/master/src/vnmr/variables.h)
for info on how to parse this file.

## Reads
* [Free Induction Decay FID Wiki](https://en.wikipedia.org/wiki/Free_induction_decay).
* [NMR and Imaging](https://www.cis.rit.edu/htbooks/mri/)
* [Fourier Transform](https://homepages.inf.ed.ac.uk/rbf/CVonline/LOCAL_COPIES/OWENS/LECT4/node2.html)
