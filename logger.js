'use strict';
const winston = require('winston');
require('winston-daily-rotate-file');

const stringify = require('json-stringify-safe');

// const logconfig = require('./config-reader');
const logFileName = "node_project_logs";
const { createLogger, format, transports } = winston;
const { combine, timestamp, label, prettyPrint, printf, json, simple } = format;
const fs = require('fs');
const _ = require('underscore');
const winstonLogMode = ["console","file"];

const config = {
  directory: "logs",
  logLevel: "info",
  systemLogFile: "system.log",
  //auditLogFile: "audit.log",
  winstonLogMessagesMode: winstonLogMode[0],
  serviceName: ""
};

var logDir = process.cwd()+"/"+config.directory;
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const customFormat = printf(info => {
    var str = `[${info.timestamp}] [${info.level.toUpperCase()}]: [node project] ${info.message}`;

    if(info instanceof Error)
        str += " /--/ " + stringify(info.stack);

    return str;
});

var   logger;

var loggerFormat = combine(timestamp(), json(), customFormat);
var loggerTransports = [];
//var auditLoggerTransports = [];


if (winstonLogMode && winstonLogMode.includes('console')) {
    loggerTransports.push(new transports.Console({timestamp: true, colorize: true})); 
   
    //auditLoggerTransports.push(new transports.Console({timestamp: true, colorize: true}));
    

}

if (winstonLogMode && winstonLogMode.includes('file')) {

    const sys_log_rotate = JSON.parse(stringify({ "filename" : logFileName}));
    sys_log_rotate["filename"]= logDir + '/' + config.systemLogFile;
    loggerTransports.push(new (winston.transports.DailyRotateFile)(sys_log_rotate));

    const audit_log_rotate = JSON.parse(stringify({"filename" : logFileName}));
   // audit_log_rotate["filename"] = logDir + '/' + config.auditLogFile;
  //  auditLoggerTransports.push(new (winston.transports.DailyRotateFile)(audit_log_rotate));
    
}

logger = winston.createLogger({
    level: config.logLevel,
    format: loggerFormat,
    defaultMeta: { service: "node_project" },
    transports: loggerTransports,
    exitOnError: false
});

// auditLogger = winston.createLogger({
//     level: config.logLevel,
//     format: loggerFormat,
//     defaultMeta: { service: "node_project" },
//     transports: auditLoggerTransports,
//     exitOnError: false
// });

const log = (arr) => {
    var totalResult=_.map(arr,function(value){
        if(typeof value==='object')
        {
            value=stringify(value);
        }
        return _.extend(value,',');
    });
    logger.info(totalResult.join(','));
}

const info = (arr) => {
    var totalResult=_.map(arr,function(value){
        if(typeof value==='object')
        {
            value=stringify(value);
        }
        return _.extend(value,',');
    });

    logger.info(totalResult.join(',')); 
}

const error = (arr) => {
    var totalResult=_.map(arr,function(value){
        if(value instanceof Error)
            logger.error(value);

        if(typeof value==='object')
        {
            value=stringify(value);
        }
        return _.extend(value,',');
    });
    logger.error(totalResult.join(','));
}

const warn = (arr) => {
    var totalResult=_.map(arr,function(value){
        if(typeof value==='object')
        {
            value=stringify(value);
        }
        return _.extend(value,',');
    });
    logger.warn(totalResult.join(','));
}

const debug = (arr) => {
    var totalResult=_.map(arr,function(value){
        if(typeof value==='object')
        {
            value=stringify(value);
        }
        return _.extend(value,',');
    });
    logger.debug(totalResult.join(','));
}


module.exports.loggerServices = {
    logger      :   logger,
    //auditLogger :   auditLogger,
    log         :   log,
    info        :   info,
    error       :   error,
    warn        :   warn,
    debug       :   debug
} 