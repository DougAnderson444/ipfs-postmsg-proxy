'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (getIpfs, opts) {
  var _this = this;

  return {
    flush: (0, _postmsgRpc.expose)('ipfs.files.flush', (0, _prepost.pre)(opts.pre('files.flush'), (0, _prepost.post)(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var _getIpfs$files;

      var res,
          _args = arguments;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (_getIpfs$files = getIpfs().files).flush.apply(_getIpfs$files, _args);

            case 2:
              res = _context.sent;

              console.log('in flush, res: ', res);
              return _context.abrupt('return', res);

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    })), function () {
      return null;
    })), opts)
  };
};

var _postmsgRpc = require('postmsg-rpc');

var _prepost = require('prepost');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
//# sourceMappingURL=flush.js.map