import { expose } from 'postmsg-rpc'
import { pre, post } from 'prepost'

export default function (getIpfs, opts) {
  return {
    flush: expose('ipfs.files.flush', pre(
      opts.pre('files.flush'),
      post(
        async(...args) => {
          
         let res = await getIpfs().files.flush(...args)
         console.log(`in flush, res: `, res)
         return res
        
        },
        () => null
      )
    ), opts)
  }
}
