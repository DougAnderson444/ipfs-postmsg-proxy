"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postmsgRpc = require("postmsg-rpc");

var _callbackify = require("callbackify");

var _callbackify2 = _interopRequireDefault(_callbackify);

var _bitswap = require("./bitswap");

var _bitswap2 = _interopRequireDefault(_bitswap);

var _block = require("./block");

var _block2 = _interopRequireDefault(_block);

var _bootstrap = require("./bootstrap");

var _bootstrap2 = _interopRequireDefault(_bootstrap);

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _dag = require("./dag");

var _dag2 = _interopRequireDefault(_dag);

var _dht = require("./dht");

var _dht2 = _interopRequireDefault(_dht);

var _files = require("./files");

var _files2 = _interopRequireDefault(_files);

var _key = require("./key");

var _key2 = _interopRequireDefault(_key);

var _ls = require("./ls");

var _ls2 = _interopRequireDefault(_ls);

var _name = require("./name");

var _name2 = _interopRequireDefault(_name);

var _object = require("./object");

var _object2 = _interopRequireDefault(_object);

var _pin = require("./pin");

var _pin2 = _interopRequireDefault(_pin);

var _ping = require("./ping");

var _ping2 = _interopRequireDefault(_ping);

var _pubsub = require("./pubsub");

var _pubsub2 = _interopRequireDefault(_pubsub);

var _repo = require("./repo");

var _repo2 = _interopRequireDefault(_repo);

var _stats = require("./stats");

var _stats2 = _interopRequireDefault(_stats);

var _swarm = require("./swarm");

var _swarm2 = _interopRequireDefault(_swarm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (opts) {
  var ipfs = {
    bitswap: (0, _bitswap2.default)(opts),
    block: (0, _block2.default)(opts),
    bootstrap: (0, _bootstrap2.default)(opts),
    config: (0, _config2.default)(opts),
    dag: (0, _dag2.default)(opts),
    dht: (0, _dht2.default)(opts),
    dns: _callbackify2.default.variadic((0, _postmsgRpc.caller)("ipfs.dns", opts)),
    files: (0, _files2.default)(opts),
    id: (0, _callbackify2.default)((0, _postmsgRpc.caller)("ipfs.id", opts)),
    key: (0, _key2.default)(opts),
    name: (0, _name2.default)(opts),
    object: (0, _object2.default)(opts),
    pin: (0, _pin2.default)(opts),
    pubsub: (0, _pubsub2.default)(opts),
    repo: (0, _repo2.default)(opts),
    resolve: _callbackify2.default.variadic((0, _postmsgRpc.caller)("ipfs.resolve", opts)),
    stats: (0, _stats2.default)(opts),
    stop: (0, _callbackify2.default)((0, _postmsgRpc.caller)("ipfs.stop", opts)),
    swarm: (0, _swarm2.default)(opts),
    version: (0, _callbackify2.default)((0, _postmsgRpc.caller)("ipfs.version", opts))
  };

  Object.assign(ipfs, (0, _ls2.default)(opts), (0, _ping2.default)(opts));

  // Aliases
  ipfs.add = ipfs.files.add;
  ipfs.get = ipfs.files.get;
  ipfs.cat = ipfs.files.cat;
  ipfs.stats.bitswap = ipfs.bitswap.stat;
  ipfs.stats.repo = ipfs.repo.stat;

  return ipfs;
};
//# sourceMappingURL=index.js.map