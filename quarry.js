'use strict';

module.exports = function(game, opts) {
  return new QuarryPlugin(game, opts);
};
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry']
};

function QuarryPlugin(game, opts) {
  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-quarry requires voxel-registry plugin');

  this.enable();
}

QuarryPlugin.prototype.enable = function() {
};

QuarryPlugin.prototype.disable = function() {
};

