---
title: 'Blindfolded algorithm visualizer'
date: 2024-06-01T18:57:43-04:00
draft: false
genres: cubing
tags:
 - cubing
---

This page allows you to search and view the algorithms I use to solve the Rubik's cube blindfolded. This includes the classic 3x3, the 4x4 cube, and the 5x5 cube. 

{{< bld-vis >}}

## Usage Guide

### Sticker Notation
Since almost all blindfolded algorithms are denoted using pieces or stickers, we need to define sticker notation. All edges and corners are formed of multiple stickers, so for these types of pieces each sticker not only denotes a piece, but also the orientation of that piece. 

> Note: all examples in this guide are written assuming **WCA orientation** (green front, white top).

The rules for naming a sticker are as follows:
1. The name of each sticker is derived from the names of the faces of which the sticker forms an intersection.
2. The face that the sticker lays on is always the first letter in the sticker name. The order of the rest of the faces does not matter. 
    * Example: The white sticker of the white-green edge on a 3x3 is UF, but the green sticker of the same piece is FU.
3. For larger cubes, pieces on inner slices use lowercase letters to indicate an inner slice. 
    * Example: Ufr refers to the center closest to the UFR piece on a 4x4. It may also refer to the x center closest to the UFR piece on a 5x5. 


### Searching Commutators
In the context of blindfolded solving, commutators are ordered and oriented cycles of 3 pieces of the same type. Search commutators with the template `[A]-[B]-[C]`.

Examples:
* `UF-UR-BD` will query the 3x3 edge commutator for the `UF` buffer with `UR` as the first target and `BD` as the second target.
* `UBR-FDL-RDB` will query the 3x3 corrner commutator for the `UBR` buffer with `FDL` as the first target and `RDB` as the second target.

You can explicitly put the puzzle name in brackets (e.g. [4x4], [3x3x3]) in front of the commutator. This is necessary in cases of ambiguity - like between edges on a 3x3 or midges on a 5x5. It may also be useful to visualize an algorithm on a different cube, like with corner commutators on different puzzles. If the puzzle name is not specified, the smallest possible cube is used by default.

Example:
* `[5x5] UF-UR-BD` will query the 5x5 commutator for the UF buffer with `UR` as the first target and `BD` as the second target. This commutator was used in an example earlier, but we need to specify that we are using a 5x5 since the 5x5 midge commutator is different than the 3x3 edge commutator.
* `[4x4] Ufr-Dfl-Bul` will query the 4x4 center commutator with a `Ufr` buffer, `Dfl` as the first target, and `Bul` as the second target. 

### Searching Parity
For blindfolded methods, parity happens when we have 2 edges that need to be swapped with each other and 2 corners that need to be swapped with each other (2e2c). Search parity algorithms with the template `[A]-[B] [C]-[D]`. 

Example:
* `UFR-UBR UF-UR` will query the parity algorithm that swaps the corners `UFR` and `UBR` and swaps the edges `UF` and `UR`. This is a J perm.


### Things I want to add to this page eventually
* The ability to search up flips, and twists. 2e2e, 2c2c would also be nice. 
* The ability to search up commutators using Speffz or a custom piece-name mapping.