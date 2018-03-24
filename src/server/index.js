import { expose } from 'postmsg-rpc'
import { pre } from 'prepost'
import createBitswap from './bitswap'
import createBlock from './block'
import createConfig from './config'
import createDag from './dag'
import createDht from './dht'
import createFiles from './files'
import createKey from './key'
import createLs from './ls'
import createObject from './object'
import createPin from './pin'
import createPubsub from './pubsub'
import createRepo from './repo'
import createStats from './stats'
import createSwarm from './swarm'

export default (getIpfs, opts) => {
  opts = opts || {}

  if (typeof opts.pre !== 'function') {
    const preObj = opts.pre || {}
    opts.pre = (fnName) => preObj[fnName]
  }

  return {
    bitswap: createBitswap(getIpfs, opts),
    block: createBlock(getIpfs, opts),
    config: createConfig(getIpfs, opts),
    dag: createDag(getIpfs, opts),
    dht: createDht(getIpfs, opts),
    dns: expose('ipfs.dns', pre(
      opts.pre('dns'),
      (...args) => getIpfs().dns(...args)
    ), opts),
    files: createFiles(getIpfs, opts),
    id: expose('ipfs.id', pre(
      opts.pre('id'),
      () => getIpfs().id()
    ), opts),
    key: createKey(getIpfs, opts),
    ls: createLs(getIpfs, opts),
    object: createObject(getIpfs, opts),
    pin: createPin(getIpfs, opts),
    pubsub: createPubsub(getIpfs, opts),
    repo: createRepo(getIpfs, opts),
    stats: createStats(getIpfs, opts),
    stop: expose('ipfs.stop', pre(
      opts.pre('stop'),
      () => getIpfs().stop()
    ), opts),
    swarm: createSwarm(getIpfs, opts),
    version: expose('ipfs.version', pre(
      opts.pre('version'),
      () => getIpfs().version()
    ), opts)
  }
}

export function closeProxyServer (obj) {
  Object.keys(obj).forEach((k) => {
    if (obj[k].close) {
      obj[k].close()
    } else {
      closeProxyServer(obj[k])
    }
  })
}
