module.exports = function(RED) {
    function ModbusRTUConfigNode(config) {
        var SerialPort = require('serialport');
        var modbus = require('modbus-rtu');
//        var log = require('tracer').console();
        var vsprintf = require("sprintf-js").vsprintf;
        var log = RED.log;


        RED.nodes.createNode(this,config);
        var node = this;
        node.name = config.name;
        node.dataType = config.dataType;
        node.unit_id = parseInt(config.unit_id);
        node.serial_device = config.serial_device;
        node.serial_speed = parseInt(config.serial_speed);
        node.serial_parity = config.serial_parity;
        node.serial_databits = parseInt(config.serial_databits);
        node.serial_stopbits = parseInt(config.serial_stopbits);

        node.on('input', function(msg) {
            
        });
        var globalContext = this.context().global;
        var modbusMaster = globalContext.get('modbusMaster') || null;
        var serialPort = globalContext.get('serialPort') || null;
        
        if (modbusMaster || serialPort) {
            node.close();    
        }
        // connection initialization. Create serial device and then modbus master on top of that
        node.initializeRTUConnection = function(callback) {
            log.info(vsprintf("About to create serial port on device %s (%s baud)", [node.serial_device, node.serial_speed]));

            serialPort = new SerialPort(node.serial_device, {
                baudrate: node.serial_speed});
            if (serialPort) {
                log.info("Created the serial port.");
                globalContext.set('serialPort', serialPort);
                new modbus.Master(serialPort, function (master) {
                    if (master) {
                        modbusMaster = master;
                        globalContext.set('modbusMaster', modbusMaster);
                        log.info("Created modbus master device");
                        callback(modbusMaster,null);
                    }
                    else {
                        callback(null, "Failed to create modbus master device");
                    }

                });
                // handle serial port open
                serialPort.on('open', function() {
                    log.info("Opened the serial port.");
                });
                // handle serial port opening failure
                serialPort.on('error', function(err) {
                    log.error('Error: ', err.message);
                });
                
            }
            else {
                callback(null, "Failed to create a serial port");
            }
        };
        
        
        node.close = function() {
            var globalContext = this.context().global;
            var serialPort = globalContext.get('serialPort') || null;
            if (serialPort) {
                serialPort.close();
            }
            globalContext.set('serialPort', null);
            globalContext.set('modbusMaster', null);

        };
    
    }
    RED.nodes.registerType("modbus-rtu-config",ModbusRTUConfigNode);


};
