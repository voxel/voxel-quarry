'use strict';

module.exports = function(game, opts) {
  return new QuarryPlugin(game, opts);
};
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry', 'voxel-blockdata', 'voxel-harvest', 'voxel-carry', 'voxel-recipes']
};

function QuarryPlugin(game, opts) {
  this.game = game;

  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-quarry requires "voxel-registry" plugin');

  this.blockdata = game.plugins.get('voxel-blockdata');
  if (!this.blockdata) throw new Error('voxel-quarry requires "voxel-blockdata" plugin');

  this.harvest = game.plugins.get('voxel-harvest');
  if (!this.harvest) throw new Error('voxel-quarry requires "voxel-harvest" plugin');

  this.carry = game.plugins.get('voxel-carry'); // optional
  this.recipes = game.plugins.get('voxel-recipes'); // optional

  this.registerRecipe = opts.registerRecipe !== undefined ? opts.registerRecipe : true;

  this.rangeX = opts.rangeX || 16;
  this.rangeY = opts.rangeY || 16;
  this.rangeZ = opts.rangeZ || 16;

  this.mineDelayMs = opts.mineDelayMs || 200;

  this.enable();
}

QuarryPlugin.prototype.enable = function() {
  this.registry.registerBlock('quarry', {
    texture: 'furnace_top'/* TODO */,
    onInteract: QuarryPlugin.prototype.interact.bind(this) // TODO: better way to activate, power?
  });

  if (this.recipes && this.registerRecipe) {
    this.recipes.registerPositional([
        ['ingotIron', 'ingotIron', 'ingotIron'],
        ['ingotIron', 'pickaxeIron', 'ingotIron'], // TODO: require pickaxe damage tag to be 0! (or missing)
        ['ingotIron', 'ingotIron', 'ingotIron'],
      ], ['quarry']);
  }
};

QuarryPlugin.prototype.disable = function() {
  // TODO: unregister block
  // TODO: unregister recipe
};

QuarryPlugin.prototype.interact = function(target) {
  this.startMining(target.voxel[0], target.voxel[1], target.voxel[2]);
};

QuarryPlugin.prototype.progressToCoords = function(progress, sx, sy, sz) {
  // unpack XZY TODO: support arbitrary ranges (besides rangeX/Y/Z 16)
  var x = (progress >> 0) & 0xf;
  var z = (progress >> 4) & 0xf;
  var y = (progress >> 8) & 0xf;

  x = sx - x;
  y = sy - y;
  z = sz - z;

  y -= 1; // always mine directly below quarry

  return [x, y, z];
};

// start with (x,y,z) = position of quarry block
QuarryPlugin.prototype.startMining = function(x, y, z) {
  // initialize stored blockdata
  var bd = this.blockdata.get(x, y, z);

  if (bd) return; // don't start mining more than once TODO: refactor

  if (!bd) {
    bd = {progress: 0};
    this.blockdata.set(x, y, z, bd);
  }

  this.mine(x, y, z);
};

// do one block-mining operation
QuarryPlugin.prototype.mine = function(x, y, z) {
  // get the blockdata instance, confirm it still exists (not destroyed)
  var bd = this.blockdata.get(x, y, z);
  if (!bd) return;  // quarry block destroyed


  var target = this.progressToCoords(bd.progress, x, y, z);
  console.log('quarrying',target.join(','));

  // get the item drop
  var blockIndex = this.game.getBlock(target);
  var blockName = this.registry.getBlockName(blockIndex);
  var itemPile = this.harvest.block2ItemPile(blockName);

  // destroy the block
  if (this.game.setBlock(target, 0) === false) {
    // if we failed to mine it.. TODO: actually, setBlock() (at least as of voxel-engine 0.20.1)
    // has no return value (or 'undefined'), so this clause is never executed. For later. (permissions?)
    return;
  }
  // TODO: voxel-sfx block mining sound. maybe in voxel-harvest (per block type)

  if (this.quarry) {
    // give the player the mined items TODO: adjacent voxel-chest integration, or an item transport system?
    var excess = this.carry.inventory.give(itemPile);
    if (excess > 0) {
      // full so cannot mine any more TODO: just drop items?
      return;
    }
  } // otherwise, just destroy the items

  // schedule next mining operation
  bd.progress += 1;
  if (bd.progress >= 0xfff) {
    console.log('quarry completed ',x,y,z);
    // TODO: play a sound with voxel-sfx?
    // TODO: destroy the quarry itself? single-use?
    return;
  }
  window.setTimeout(this.mine.bind(this, x, y, z), this.mineDelayMs); // TODO: use tic module, or main game loop instead?
};

