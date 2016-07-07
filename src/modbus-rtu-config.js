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

        node.modbusMaster = null;
        node.serialPort = null;
        log.info(vsprintf("Defined parameters for device %s (%s baud)", [node.serial_device, node.serial_speed]));
        
        // connection initialization. Create serial device and then modbus master on top of that
        node.initializeRTUConnection = function(callback) {
            log.info(vsprintf("About to create serial port on device %s (%s baud)", [node.serial_device, node.serial_speed]));

            node.serialPort = new SerialPort(node.serial_device, {
                baudrate: node.serial_speed});
            if (node.serialPort) {
                log.info("Created the serial port.");
                new modbus.Master(node.serialPort, function (master) {
                    if (master) {
                        node.modbusMaster = master;
                        log.info("Created modbus master device");
                        callback(node.modbusMaster,null);
                    }
                    else {
                        callback(null, "Failed to create modbus master device");
                    }

                });
                // handle serial port open
                node.serialPort.on('open', function() {
                    log.info("Opened the serial port.");
                });
                // handle serial port opening failure
                node.serialPort.on('error', function(err) {
                    log.error('Error: ', err.message);
                });
                
            }
            else {
                callback(null, "Failed to create a serial port");
            }
        };
    }
    RED.nodes.registerType("modbus-rtu-config",ModbusRTUConfigNode);


};
