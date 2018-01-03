import { caller } from 'postmsg-rpc'
import callbackify from 'callbackify'
import { cidToJson, isCid } from '../serialization/cid'
import { peerIdToJson, peerInfoFromJson, isPeerId, isPeerInfo } from '../serialization/peer'
import { preCall, postCall } from '../fn-call'

export default function (opts) {
  return {
    put: callbackify.variadic(caller('ipfs.dht.put', opts)),
    get: callbackify.variadic(caller('ipfs.dht.get', opts)),
    findprovs: callbackify.variadic(
      postCall(
        caller('ipfs.dht.findprovs', opts),
        (res) => Promise.all(
          res.map((item) => isPeerInfo(item) ? peerInfoFromJson(item) : Promise.resolve(item))
        )
      )
    ),
    findpeer: callbackify.variadic(
      preCall(
        (...args) => {
          if (isPeerId(args[0])) {
            args[0] = peerIdToJson(args[0])
          }

          return args
        },
        postCall(
          caller('ipfs.dht.findpeer', opts),
          (res) => isPeerInfo(res) ? peerInfoFromJson(res) : res
        )
      )
    ),
    provide: callbackify.variadic(
      preCall(
        (...args) => {
          if (isCid(args[0])) {
            args[0] = cidToJson(args[0])
          }

          return args
        },
        caller('ipfs.dht.provide', opts)
      )
    ),
    query: callbackify.variadic(
      preCall(
        (...args) => {
          if (isPeerId(args[0])) {
            args[0] = peerIdToJson(args[0])
          }

          return args
        },
        postCall(
          caller('ipfs.dht.query', opts),
          (res) => Promise.all(
            res.map((item) => isPeerInfo(item) ? peerInfoFromJson(item) : Promise.resolve(item))
          )
        )
      )
    )
  }
}
