# voxel-quarry

Automated mining quarry (voxel.js plugin)

![screenshot](http://i.imgur.com/O5VTS6I.png "Screenshot")

Load with [voxel-plugins](https://github.com/deathcap/voxel-plugins), options:

* `mineDelayMs`: delay between each block mining operation (default 200 ms)

To use in the game, craft a quarry block with a
[voxel-workbench](https://github.com/deathcap/voxel-workbench) by
surrounding an iron
[voxel-pickaxe](https://github.com/deathcap/voxel-pickaxe) with iron
ingots (or with
[voxel-commands](https://github.com/deathcap/voxel-commands) installed,
type ".item quarry"), place it in the world, then right-click it to begin
the process. One at a time, the blocks below the quarry will be mined,
up to a 16x16x16 cubic volume:

![screenshot](http://i.imgur.com/kzkMuv4.png "Screenshot")

As they are mined, the item drops will be added to the player inventory
with [voxel-carry](https://github.com/deathcap/voxel-carry), if installed.
Also requires
[voxel-harvest](https://github.com/deathcap/voxel-harvest) (to calculate
the item drops from the mined blocks),
[voxel-blockdata](https://github.com/deathcap/voxel-blockdata) (for storing
the mining progress for the quarry), and
[voxel-registry](https://github.com/deathcap/voxel-registry) plugins.

## References / see also

Inspired by the
[quarry](http://www.mod-buildcraft.com/wiki/doku.php?id=quarry) from the
[BuildCraft](http://www.mod-buildcraft.com/)
modification for Minecraft.

## License

MIT

