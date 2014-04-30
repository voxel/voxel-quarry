'use strict';

module.exports = function(game, opts) {
  return new QuarryPlugin(game, opts);
};
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry']
};

function QuarryPlugin(game, opts) {
  this.game = game;
  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-quarry requires voxel-registry plugin');

  this.rangeX = opts.rangeX || 16;
  this.rangeY = opts.rangeY || 16;
  this.rangeZ = opts.rangeZ || 16;

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

// start with (x,y,z) = position of quarry block
QuarryPlugin.prototype.startMining = function(x, y, z) {
  y -= 1; // mine directly below quarry

  for (var i = 0; i < this.rangeX; i += 1) {
    for (var j = 0; j < this.rangeY; j += 1) {
      for (var k = 0; k < this.rangeZ; k += 1) {
        this.game.setBlock([x-k, y-j, z-i], 0);
      }
    }
  }
};
