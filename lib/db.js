/* global Fullnode */
/**
 * Database
 * ========
 *
 * For storing content and actions.
 */
'use strict'
let Constants = require('./constants').DB
let Path = require('path')
let PouchDB = require('pouchdb')
let PouchDBFind = require('pouchdb-find')
let Struct = Fullnode.Struct
let asink = require('asink')

PouchDB.plugin(PouchDBFind)

function DB (name, basePath, pouchdb) {
  if (!(this instanceof DB)) {
    return new DB(name, basePath, pouchdb)
  }
  this.initialize()
  this.fromObject({basePath, name, pouchdb})
}

DB.prototype = Object.create(Struct.prototype)
DB.prototype.constructor = DB

/**
 * Synchronous initialization function to set variables - you probably
 * shouldn't call this
 */
DB.prototype.initialize = function () {
  this.basePath = Constants.basePath
  this.name = Constants.defaultName
  return this
}

/**
 * Asynchronous initialization function to actually set up the database -
 * this is what you should call to initialize.
 */
DB.prototype.asyncInitialize = function () {
  return asink(function *() {
    let path = Path.join(this.basePath, this.name)
    this.pouchdb = new PouchDB(path)
    yield this.pouchdb.createIndex({
      index: {
        fields: ['time'] // time in milliseconds since 1970
      }
    })
    return this.asyncInfo()
  }, this)
}

/**
 * For testing purposes it is useful to be able to close the database so that
 * you can re-open it in the same process.
 */
DB.prototype.close = function () {
  return this.pouchdb.close()
}

/**
 * Returns a promise to some basic JSON info about the database, such as
 * number of documents.
 */
DB.prototype.asyncInfo = function () {
  return this.pouchdb.info()
}

/**
 * Add a document to the database.
 */
DB.prototype.asyncPut = function (doc) {
  return this.pouchdb.put(doc)
}

/**
 * Get a document from the database by its id.
 */
DB.prototype.asyncGet = function (id) {
  return this.pouchdb.get(id)
}

/**
 * A window to pouchdb-find's find method.
 */
DB.prototype.asyncFind = function () {
  let args = Array.from(arguments)
  return this.pouchdb.find.apply(this.pouchdb, args)
}

/**
 * A window to pouchdb's allDocs method - useful for testing purposes, but
 * probably should not be used in production.
 */
DB.prototype.asyncAllDocs = function () {
  let args = Array.from(arguments)
  return this.pouchdb.allDocs.apply(this.pouchdb, args)
}

/**
 * Destroy, i.e. delete, the database. This does not attempt to securely
 * erase the database - merely clear the space.
 */
DB.prototype.asyncDestroy = function () {
  return this.pouchdb.destroy()
}

module.exports = DB
