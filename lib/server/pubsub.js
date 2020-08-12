'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (getIpfs, opts) {
  var subs = [
    /*
      {
        topic,    // name of the topic subscribed to
        rpc: {    // details of the RPC stub created to send updates
          fnName, // the RPC function name the stub calls
          stubFn  // the RPC stub function created by postmsg-rpc
        }
      }
    */
  ];

  var api = {
    publish: (0, _postmsgRpc.expose)('ipfs.pubsub.publish', (0, _prepost.pre)((0, _buffer.preBufferFromJson)(1), opts.pre('pubsub.publish'), function () {
      var _getIpfs$pubsub;

      return (_getIpfs$pubsub = getIpfs().pubsub).publish.apply(_getIpfs$pubsub, arguments);
    }), opts),
    subscribe: (0, _postmsgRpc.expose)('ipfs.pubsub.subscribe', function () {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var sub = void 0;

      return (0, _prepost.pre)(function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var topic = args[0];

        if ((0, _function.isFunctionJson)(args[1])) {
          var stubFn = (0, _prepost.pre)(function () {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }

            if (args[0]) {
              args[0] = Object.assign({}, args[0]);

              if ((0, _buffer.isBuffer)(args[0].data)) {
                args[0].data = (0, _buffer.bufferToJson)(args[0].data);
              }

              if ((0, _buffer.isBuffer)(args[0].seqno)) {
                args[0].seqno = (0, _buffer.bufferToJson)(args[0].seqno);
              }
            }

            return args;
          }, (0, _postmsgRpc.caller)(args[1].name, opts));

          sub = {
            topic: topic,
            rpc: {
              fnName: args[1].name,
              stubFn: stubFn
            }
          };

          subs.push(sub);

          args[1] = stubFn;
        }

        return args;
      }, opts.pre('pubsub.subscribe'), _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _getIpfs$pubsub2,
            _args = arguments;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return (_getIpfs$pubsub2 = getIpfs().pubsub).subscribe.apply(_getIpfs$pubsub2, _args);

              case 3:
                return _context.abrupt('return', _context.sent);

              case 6:
                _context.prev = 6;
                _context.t0 = _context['catch'](0);

                subs.splice(subs.indexOf(sub), 1);
                throw _context.t0;

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this, [[0, 6]]);
      }))
      /* Throws TypeError: Cannot read property 'catch' of undefined
      return getIpfs().pubsub.subscribe(...args)
        .catch((err) => {
          subs.splice(subs.indexOf(sub), 1)
          throw err
        })
      */
      ).apply(undefined, args);
    }, opts),
    unsubscribe: (0, _postmsgRpc.expose)('ipfs.pubsub.unsubscribe', (0, _prepost.pre)(function () {
      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      var topic = args[0];

      if ((0, _function.isFunctionJson)(args[1])) {
        var sub = subs.find(function (s) {
          return s.topic === topic && s.rpc.fnName === args[1].name;
        });

        if (sub) {
          args[1] = sub.rpc.stubFn;
          subs.splice(subs.indexOf(sub), 1);
        } else {
          // Well, we don't have a reference to it, so the ipfs node won't
          // either. We shouldn't error either because ipfs won't.
          args[1] = function () {};
        }
      }

      return args;
    }, opts.pre('pubsub.unsubscribe'), function () {
      var _getIpfs$pubsub3;

      return (_getIpfs$pubsub3 = getIpfs().pubsub).unsubscribe.apply(_getIpfs$pubsub3, arguments);
    }), opts),
    peers: (0, _postmsgRpc.expose)('ipfs.pubsub.peers', (0, _prepost.pre)(opts.pre('pubsub.peers'), function () {
      var _getIpfs$pubsub4;

      return (_getIpfs$pubsub4 = getIpfs().pubsub).peers.apply(_getIpfs$pubsub4, arguments);
    }), opts),
    ls: (0, _postmsgRpc.expose)('ipfs.pubsub.ls', (0, _prepost.pre)(opts.pre('pubsub.ls'), function () {
      var _getIpfs$pubsub5;

      return (_getIpfs$pubsub5 = getIpfs().pubsub).ls.apply(_getIpfs$pubsub5, arguments);
    }), opts)

    // Clean up any subscriptions on close
  };api.subscribe.close = (0, _prepost.pre)(function () {
    for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    return Promise.all(subs.map(function (sub) {
      return getIpfs().pubsub.unsubscribe(sub.topic, sub.rpc.stubFn);
    })).then(function () {
      return args;
    });
  }, api.subscribe.close);

  return api;
};

var _postmsgRpc = require('postmsg-rpc');

var _prepost = require('prepost');

var _function = require('../serialization/function');

var _buffer = require('../serialization/buffer');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
//# sourceMappingURL=pubsub.js.map