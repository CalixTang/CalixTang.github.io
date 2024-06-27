---
title: 'Blindfolded algorithm visualizer'
date: 2024-06-01T18:57:43-04:00
draft: false
genres: cubing
tags:
 - cubing
---


# BLD algorithm visualizer
This page allows you to search and view the algorithms I use to solve the Rubik's cube blindfolded. This includes the classic 3x3, the 4x4 cube, and the 5x5 cube. 

{{< bld-vis >}}

## Usage Guide


### Searching Commutators
As of 6/25/24: 
* You can use sticker notation to search up commutators. Piece names are derived from the names of the faces that they form the intersection of. In this notation, the first letter of the sticker name should be the face that the sticker lies on. For example, the white sticker of the white-green edge on a 3x3 is UF, but the green sticker of the same piece is FU (if you are holding the cube in WCA orientation).    
    * Corners all have two possible names. UFR and URF are both correct names for the white sticker of the white-red-green corner (assuming WCA orientation). 
    * For larger cubes, pieces on inner slices use lowercase letters to indicate an inner slice. For example, Ufr refers to the center closest to the UFR piece on a 4x4. It may also refer to the x center closest to the UFR piece on a 5x5. 


### Examples
* UF-UB-UR will query the 3x3 edge commutator for the <b>UF</b> buffer with UB (A in Speffz) as the first target and UR (B in Speffz) as the second target. This alg is a U perm.

### Things I want to add to this page eventually
* The ability to search up parity algorithms (2e2c), flips, and twists. 2e2e, 2c2c would also be nice. 
* The ability to search up commutators using Speffz or a custom piece-name mapping.