# ipfs-postmsg-proxy

[![Build Status](https://travis-ci.org/tableflip/ipfs-postmsg-proxy.svg?branch=master)](https://travis-ci.org/tableflip/ipfs-postmsg-proxy) [![dependencies Status](https://david-dm.org/tableflip/ipfs-postmsg-proxy/status.svg)](https://david-dm.org/tableflip/ipfs-postmsg-proxy) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![IPFS core API compatible](https://img.shields.io/badge/ipfs%20core%20api-compatible-brightgreen.svg)](https://github.com/ipfs/interface-ipfs-core)



> Proxy to an IPFS over window.postMessage

The proxy uses [`postmsg-rpc`](https://www.npmjs.com/package/postmsg-rpc) under the hood to create an object which looks like an IPFS instance on the web page. This is just an object with "stubs" (functions) that use `window.postMessage` to communicate with a real IPFS node running in the browser extension. `postmsg-rpc` allows us to create these stubs and expose methods on the IPFS node without having to deal with the complexities of `window.postMessage`.

```
Web page                                               Browser extension
+---------------+-----------------+                    +-------------------+----------------+
|               |                 |                    |                   |                |
|               |                 |                    |                   |                |
|               |                 | window.postMessage |                   |                |
| window.ipfs   +->  call stubs   +--------------------->   exposed api    +->  js-ipfs /   |
|             <-+  (postmsg-rpc) <---------------------+   (postmsg-rpc) <-+    js-ipfs-api |
|               |                 |                    |                   |                |
|               |                 |                    |                   |                |
|               |                 |                    |                   |                |
+---------------+--------^--------+                    +-------------------+----------------+
                         |
                         +
                interface-ipfs-core
```

We're using `interface-ipfs-core` to test our call stubs which are hooked up to a `js-ipfs`/`js-ipfs-api` on the other end. If the tests pass we know that the proxy is doing a good job of passing messages over the boundary.

When messages are passed using `window.postMessage` the data that is sent is cloned using the [structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). It allows more things to be cloned than just JSON types but there are some things that _cannot be cloned_ without some prior serialization to a format that _can be cloned_ by the algorithm. For this reason, on both the web page and browser extension side we sometimes manually perform this serialization on arguments and return types.

In the web page, we serialize arguments we know cannot be handled by the structured clone algorithm before stubs are called and we deserialize them in the browser extension before exposed functions are called.

In the browser extension we serialize return values after exposed functions are called and deserialize them in the web page after stubs are called.

The [`prepost`](https://www.npmjs.com/package/prepost) module provides these utility functions.

## Install

```sh
npm install ipfs-postmsg-proxy
```

## Usage

In this example, IPFS is running in an iframe.

In iframe window where the js-ipfs node is running, create **iframe.js**:

```js
const IPFS = require('ipfs')
const { createProxyServer, closeProxyServer } = require('ipfs-postmsg-proxy')

const ipfs = new IPFS()

// Create proxy server that talks to the parent window
const server = createProxyServer(() => ipfs, {
  postMessage: window.parent.postMessage.bind(window.parent)
})

// Later, you might want to close the server:
closeProxyServer(server)
```

Browserify/Webpack **iframe.js** to **bundle.js**.

Create **iframe.html**:

```html
<!doctype html>
<script src="bundle.js"></script>
```

In the client window, add the iframe and create a client to talk to it:

```js
const { createProxyClient } = require('ipfs-postmsg-proxy')

const iframe = document.createElement('iframe')
iframe.src = 'iframe.html'
document.body.appendChild(iframe)

// Create proxy client that talks to the iframe
window.ipfs = createProxyClient({
  postMessage: iframe.contentWindow.postMessage.bind(iframe.contentWindow)
})

// You can now interact with IPFS as usual, e.g.
// ipfs.add(new Buffer('HELLO WORLD'), (err, res) => console.log(err, res))
```

## API

#### `createProxyServer(getIpfs, [options])`

Create a proxy server to a running IPFS instance.

* `getIpfs` - a function that returns the IPFS instance. Note this function will be called every time a function needs to be invoked and so shouldn't create a new instance each time!
* `options.postMessage` - function that posts a message (default `window.postMessage`)
* `options.targetOrigin` - passed to postMessage. See [postMessage docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) for more info (default `'*'`)
* `options.addListener` - function that adds a listener (default `window.addEventListener`)
* `options.removeListener` - function that removes a listener (default `window.removeEventListener`)
* `options.getMessageData` - a function that extracts data from the event object passed to a `message` event handler (default `(e) => e.data`)
* `options.pre` - an object or a function. If an object, it's values are functions to call prior to invoking functions on the exposed IPFS node. The pre-functions are passed arguments as they would be passed to the exposed IPFS node and are expected to return an array of possibly altered arguments or a promise that resolves to the arguments array. The keys for this object identify the function name on the IPFS node that this function should be run before. e.g.

    ```js
    createProxyServer(getIpfs, {
      pre: {
        'files.add' (...args) {
          // Alter the args in some way...
          return args
        }
      }
    })
    ```

    If `options.pre` is a function it should create and return a pre-function (or `null`) for the passed function name. e.g.

    ```js
    createProxyServer(getIpfs, {
      pre: (fnName) => (...args) => {
        // Alter the args in some way...
        return args
      }
    })
    ```

Returns an IPFS proxy server instance.

#### `closeProxyServer(server)`

Close the passed proxy server (removes all listeners for `postMessage` message events).

* `server` - a proxy server created by `createProxyServer`

#### `createProxyClient([options])`

Create a proxy client to the proxy server.

* `options.postMessage` - function that posts a message (default `window.postMessage`)
* `options.targetOrigin` - passed to postMessage. See [postMessage docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) for more info (default `'*'`)
* `options.addListener` - function that adds a listener (default `window.addEventListener`)
* `options.removeListener` - function that removes a listener (default `window.removeEventListener`)
* `options.getMessageData` - a function that extracts data from the event object passed to a `message` event handler (default `(e) => e.data`)

Returns an IPFS proxy client instance.

## Current status

```
.block
  .put
    ✓ a buffer, using defaults
    ✓ a buffer, using CID
    ✓ a buffer, using options
    ✓ a Block instance
    ✓ error with array of blocks
  .get
    ✓ by CID object
    ✓ by CID in Str
  .stat
    ✓ by CID

.bootstrap
  .add
    ✓ returns an error when called with an invalid arg
    ✓ returns a list of containing the bootstrap peer when called with a valid arg (ip4)
    ✓ returns a list of bootstrap peers when called with the default option
  .list
    ✓ returns a list of peers
  .rm
    ✓ returns an error when called with an invalid arg
    ✓ returns empty list because no peers removed when called without an arg or options
    ✓ returns list containing the peer removed when called with a valid arg (ip4)
    ✓ returns list of all peers removed when all option is passed

.config
  .get
    ✓ retrieve the whole config
    ✓ retrieve a value through a key
    ✓ retrieve a value through a nested key
    ✓ fail on non valid key
    ✓ fail on non exist()ent key
    ✓ Promises support
  .set
    ✓ set a new key
    ✓ set an already exist()ing key
    ✓ set a JSON object
    ✓ fail on non valid key
    ✓ fail on non valid value
    ✓ Promises support
  .replace
    - replace the whole config
    - replace to empty config

.dag
  .put
    ✓ dag-pb with default hash func (sha2-256)
    ✓ dag-pb with custom hash func (sha3-512)
    ✓ dag-cbor with default hash func (sha2-256)
    ✓ dag-cbor with custom hash func (sha3-512)
    ✓ dag-cbor node with wrong multicodec
    ✓ returns the cid
    - pass the cid instead of format and hashAlg
  .get
    ✓ dag-pb node
    ✓ dag-cbor node
    with path
      ✓ dag-pb get the node
      ✓ dag-pb local scope
      - dag-pb one level
      - dag-pb two levels
      ✓ dag-cbor get the node
      ✓ dag-cbor local scope
      - dag-cbor one level
      - dag-cbor two levels
      - from dag-pb to dag-cbor
      ✓ from dag-cbor to dag-pb
      ✓ CID String
      ✓ CID String + path
  .tree
    ✓ .tree with CID
    ✓ .tree with CID and path
    ✓ .tree with CID and path as String
    ✓ .tree with CID recursive (accross different formats)
    ✓ .tree with CID and path recursive

.dht
  .get and .put
    ✓ errors when getting a non-existent key from the DHT
    - fetches value after it was put on another node
    ✓ Promises support
  .findpeer
    ✓ finds other peers
    - fails to find other peer, if peer doesnt exist()s
  .provide
    ✓ regular
    - recursive
  findprovs
    - basic
    - Promises support
  .query
    ✓ returns the other node in the query

.files
  .add
    ✓ a Buffer
    ✓ a BIG buffer
    ✓ a BIG buffer with progress enabled
    ✓ a Buffer as tuple
    ✓ add by path fails
    ✓ a Readable Stream
    ✓ add a nested directory as array of tupples
    ✓ add a nested directory as array of tuppled with progress
    ✓ fails in invalid input
    ✓ Promise test
  .addReadableStream
    ✓ stream of valid files and dirs
  .addPullStream
    ✓ stream of valid files and dirs
  .cat
    ✓ with a base58 string encoded multihash
    ✓ with a multihash
    ✓ streams a large file
    ✓ with ipfs path
    1) with ipfs path, nested value
    ✓ Promise test
    ✓ errors on invalid key
    ✓ errors on unknown path
    ✓ errors on dir path
  .catReadableStream
    2) "before all" hook
  .catPullStream
    ✓ returns a Pull Stream for a cid
  .get
    3) returns a Readable Stream for a cid
    .getReadableStream
      ✓ returns a Readable Stream of Readable Streams
    .getPullStream
      ✓ returns a Pull Stream of Pull Streams
      ✓ with a multihash
    .ls
      ✓ with a base58 encoded CID
      ✓ should correctly handle a non existing hash
      ✓ should correctly handle a non exiting path
    .lsReadableStream
      ✓ with a base58 encoded CID
    .lsPullStream
      ✓ with a base58 encoded CID
  .key
    .gen
      4) creates a new rsa key
    .list
      5) lists all the keys
      ✓ contains the created keys
    .rename
      6) "before all" hook
    .rm
      7) removes a key
      8) does not contain the removed name
    exchange
      9) exports
      10) imports
      11) removes
  .miscellaneous
    ✓ .id
    ✓ .version
    ✓ .dns
    ✓ .id Promises support
    ✓ .version Promises support
    ✓ .dns Promises support
    12) .stop
  .object
    callback API
      .new
        ✓ no layout
        ✓ template unixfs-dir
      .put
        ✓ of object
        ✓ of json encoded buffer
        ✓ of protobuf encoded buffer
        ✓ of buffer treated as Data field
        ✓ of DAGNode
        ✓ fails if String is passed
        ✓ DAGNode with a link
      .get
        ✓ with multihash
        ✓ with multihash (+ links)
        ✓ with multihash base58 encoded
        ✓ with multihash base58 encoded toString
      .data
        ✓ with multihash
        ✓ with multihash base58 encoded
        ✓ with multihash base58 encoded toString
      .links
        ✓ object.links with multihash
        ✓ with multihash (+ links)
        ✓ with multihash base58 encoded
        ✓ with multihash base58 encoded toString
      .stat
        ✓ with multihash
        ✓ with multihash (+ Links)
        ✓ with multihash base58 encoded
        ✓ with multihash base58 encoded toString
      .patch
        ✓ .addLink
        ✓ .rmLink
        ✓ .appendData
        ✓ .setData
    promise API
      ✓ object.new
      ✓ object.put
      ✓ object.get
      ✓ object.get multihash string
      ✓ object.data
      ✓ object.stat
      ✓ object.links
      object.patch
        ✓ .addLink
        ✓ .rmLink
        ✓ .appendData
        ✓ .setData
  .pin
    callback API
      13) .ls type recursive
      - .ls type indirect
      14) .rm
      15) .add
      16) .ls
      17) .ls type direct
      18) .ls for a specific hash
    promise API
      19) .add
      20) .ls
      21) .ls hash
      22) .rm
  .pubsub
    single node
      .publish
        ✓ errors on string messags
        ✓ message from buffer
      .subscribe
        ✓ to one topic
        ✓ to one topic with Promise
        ✓ to one topic with options and Promise
        ✓ attaches multiple event listeners
        ✓ discover options
    multiple nodes connected
      .peers
        ✓ does not error when not subscribed to a topic
        ✓ doesn't return extra peers
        ✓ returns peers for a topic - one peer
        ✓ lists peers for a topic - multiple peers
      .ls
        ✓ empty() list when no topics are subscribed
        ✓ list with 1 subscribed topic
        ✓ list with 3 subscribed topics
      multiple nodes
        ✓ receive messages from different node
        ✓ round trips a non-utf8 binary buffer correctly
        ✓ receive multiple messages
      load tests
        ✓ call publish 1k times
Send/Receive 10k messages took: 9589 ms, 1042 ops / s

        ✓ send/receive 10k messages
        ✓ call subscribe/unsubscribe 1k times
  .repo
    23) .version
    24) .version Promise
    25) .stat
    26) .stat Promise
    27) .gc
    28) .gc Promise
  .stats
    29) .bitswap
    30) .bitswap Promise
Not supported in js-ipfs yet
    ✓ .bw
Not supported in js-ipfs yet
    ✓ .bw Promise
Not supported in js-ipfs yet
    ✓ .bwReadableStream
Not supported in js-ipfs yet
    ✓ .bwPullStream
    31) .repo
    32) .repo Promise
  .swarm
    callback API
      ✓ .connect
      ✓ time
      ✓ .addrs
      ✓ .localAddrs
      ✓ .disconnect
      .peers
        ✓ default
        ✓ verbose
        Shows connected peers only once
          ✓ Connecting two peers with one address each
          ✓ Connecting two peers with two addresses each
    promise API
      ✓ .connect
      ✓ time
      ✓ .peers
      ✓ .addrs
      ✓ .localAddrs
      ✓ .disconnect


159 passing
14 pending
32 failing
```

## Caveats

### Progress option

The progress option for `files.add` currently tracks progress of data streamed to the IPFS node.

### Pubsub unsubscribe

The unsubscribe function is not synchronous as it is in js-ipfs. Instead it returns a promise that you can use to run code after the unsubscribe has happened.

## Contribute

Feel free to dive in! [Open an issue](https://github.com/tableflip/ipfs-postmsg-proxy/issues/new) or submit PRs.

## License

[MIT](LICENSE) © Alan Shaw
