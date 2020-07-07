"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDhtClient = exports.createSwarmClient = exports.createProxyClient = exports.closeProxyServer = exports.createProxyServer = undefined;

var _server = require("./server");

Object.defineProperty(exports, "createProxyServer", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_server).default;
  }
});
Object.defineProperty(exports, "closeProxyServer", {
  enumerable: true,
  get: function get() {
    return _server.closeProxyServer;
  }
});

var _client = require("./client");

Object.defineProperty(exports, "createProxyClient", {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_client).default;
  }
});

var _swarm = require("./client/swarm");

var _swarm2 = _interopRequireDefault(_swarm);

var _dht = require("./client/dht");

var _dht2 = _interopRequireDefault(_dht);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createSwarmClient = function createSwarmClient(opts) {
  return (0, _swarm2.default)(opts);
};

var createDhtClient = function createDhtClient(opts) {
  return (0, _dht2.default)(opts);
};

exports.createSwarmClient = createSwarmClient;
exports.createDhtClient = createDhtClient;
//# sourceMappingURL=index.js.map