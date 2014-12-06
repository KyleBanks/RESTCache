/**
 * server.js
 *
 * The main entry point of RESTCache, called to initialize the system.
 *
 * Created by kylewbanks on 2014-12-01.
 */

console.log("Initializing RCClient...");

/**
 * Imports
 */
var Cache = require('./src/Cache');
var BackupManager = require('./src/BackupManager');
var Config = require('./conf/Config');
var ModuleManager = require('./src/ModuleManager');
var HttpInterface = require('./src/HttpInterface');

/**
 * Initialize the cache
 * @type {Cache}
 */
var globalCache = new Cache();

/**
 * Initialize the BackupManager
 * @type {BackupManager}
 */
var backupManager = new BackupManager(Config.backup);

/**
 * Initialize the HttpInterface
 */
var httpInterface = new HttpInterface();

/**
 * Initialize the ModuleManager
 * @type {ModuleManager}
 */
var moduleManager = new ModuleManager(globalCache, backupManager, httpInterface);

/**
 * Execute any initialization scripts as needed
 */
backupManager.initialize();
httpInterface.initialize();


console.log("RCClient Started.");
