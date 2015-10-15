/* global describe,it,before,after */
'use strict'
let Peers = require('../../lib/peers')
let MsgPing = require('../../lib/msg-ping')
let Address = require('fullnode/lib/address')
let Content = require('../../lib/content')
let ContentAuth = require('../../lib/content-auth')
let MsgContentAuth = require('../../lib/msg-content-auth')
let BR = require('fullnode/lib/br')
let Keypair = require('fullnode/lib/keypair')
let spawn = require('../../lib/spawn')
let should = require('should')

describe('Peers', function () {
  if (!process.browser) {
    // TODO: This code is intended to work both in a browser and in node
    return
  }

  let peers
  let Network, network2
  if (process.browser) {
    Network = require('../../lib/network-browser-webrtc')
  } else {
    Network = require('../../lib/network-node-socket')
  }

  let blockidhex = '00000000000000000e6188a4cc93e3d3244b20bfdef1e9bd9db932e30f3aa2f1'
  let blockhashbuf = BR(new Buffer(blockidhex, 'hex')).readReverse()
  let blockheightnum = 376949

  it('should exist', function () {
    should.exist(Peers)
    should.exist(Peers())
  })

  before(function () {
    peers = Peers()
    return peers.asyncInitialize()
  })

  after(function () {
    network2.close()
    peers.close()
  })

  describe('#asyncConnect', function () {
    it('should be able to connect to a peer in the same process', function () {
      return spawn(function *() {
        network2 = Network()
        yield network2.asyncInitialize()
        let pair = yield peers.asyncConnect(network2.getConnectionInfo())
        should.exist(pair.connection)
        should.exist(pair.network)
      })
    })
  })

  describe('#broadcastMsg', function () {
    it('should send ping and get pong', function () {
      return spawn(function *() {
        let msgPing = MsgPing().fromRandom()
        let msg = msgPing.toMsg()
        let network1 = peers.networks.webrtc // TODO: Test should work in node also
        let connection = network1.connections[0]
        yield new Promise((resolve, reject) => {
          connection.once('msg', msg => {
            msg.getCmd().should.equal('pong')
            resolve()
          })
          peers.broadcastMsg(msg)
        })
      })
    })

    it('should send contentauth', function () {
      return spawn(function *() {
        let content = Content().fromObject({
          title: 'test title',
          body: 'test body'
        })
        let keypair = Keypair().fromRandom()
        let address = Address().fromPubkey(keypair.pubkey)
        let contentauth = ContentAuth().setContent(content)
        contentauth.fromObject({
          blockhashbuf: blockhashbuf,
          blockheightnum: blockheightnum,
          address: address
        })
        contentauth.sign(keypair)

        // assume connection to network2 has already been made
        yield new Promise((resolve, reject) => {
          network2.connections[0].on('msg', msg => {
            let msgcontentauth = MsgContentAuth().fromMsg(msg)
            ;(msgcontentauth.contentauth instanceof ContentAuth).should.equal(true)
            resolve()
          })
          let msg = MsgContentAuth().fromContentAuth(contentauth).toMsg()
          peers.broadcastMsg(msg)
        })
      })
    })
  })
})
