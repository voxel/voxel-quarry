'use strict';

module.exports = function(game, opts) {
  return new QuarryPlugin(game, opts);
};
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry', 'voxel-blockdata', 'voxel-harvest']
};

function QuarryPlugin(game, opts) {
  this.game = game;

  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-quarry requires "voxel-registry" plugin');

  this.blockdata = game.plugins.get('voxel-blockdata');
  if (!this.blockdata) throw new Error('voxel-quarry requires "voxel-blockdata" plugin');

  this.harvest = game.plugins.get('voxel-harvest');
  if (!this.harvest) throw new Error('voxel-quarry requires "voxel-harvest" plugin');

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
};

QuarryPlugin.prototype.disable = function() {
  // TODO: unregister block
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
  if (!bd) {
    bd = {progress: 0};
    this.blockdata.set(x, y, z, bd);
  }

  this.mine(x, y, z, bd);
};

// do one block-mining operation
QuarryPlugin.prototype.mine = function(x, y, z, bd) {
  // TODO: confirm quarry block still exists and is active

  var nextTarget = this.progressToCoords(bd.progress, x, y, z);
  console.log('quarrying',nextTarget.join(','));

  this.game.setBlock(nextTarget, 0);

  bd.progress += 1;
  if (bd.progress >= 0xfff) {
    console.log('quarry completed ',x,y,z);
    return;
  }

  // schedule next mining operation
  window.setTimeout(this.mine.bind(this, x, y, z, bd), this.mineDelayMs); // TODO: use tic module, or main game loop instead?
};

