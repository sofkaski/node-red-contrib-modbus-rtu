module.exports = function(RED) {
    function ModbusRTUConfigNode(config) {
        var SerialPort = require('serialport').SerialPort;
        var modbus = require('modbus-rtu');
//        var log = require('tracer').console();
        var vsprintf = require("sprintf-js").vsprintf;
        var log = RED.log;


        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.dataType = config.dataType;
        this.unit_id = parseInt(config.unit_id);
        this.serial_device = config.serial_device;
        this.serial_speed = parseInt(config.serial_speed);
        this.serial_parity = config.serial_parity;
        this.serial_databits = parseInt(config.serial_databits);
        this.serial_stopbits = parseInt(config.serial_stopbits);

        this.on('input', function(msg) {

        });

        // connection initialization. Create serial device and then modbus master on top of that
        this.prototype.initializeRTUConnection = function(callback) {
            log.info(vsprintf("About to create serial port on device %s (%s baud)", [node.serial_device, node.serial_speed]));

            var serialPort = new SerialPort(node.serial_device, {
                baudrate: node.serial_speed});
            this.serialPort = serialPort;
            if (this.serialPort) {
                log.info("Created the serial port.");
                var master = new modbus.Master(this.serialPort);
                if (master) {
                  this.modbusMaster = master;
                  log.info("Created modbus master device");
                  callback(this.modbusMaster,null);
                }
                else {
                    callback(null, "Failed to create modbus master device");
                }
                // handle serial port open
                this.serialPort.on('open', function() {
                    log.info("Opened the serial port.");
                });
                // handle serial port opening failure
                this.serialPort.on('error', function(err) {
                    log.error('Error: ', err.message);
                });

            }
            else {
                callback(null, "Failed to create a serial port");
            }
        };


        this.prototype.close = function() {
            if (this.serialPort) {
                this.serialPort.close();
            }
            this.serialPort = null;
            this.modbusMaster = null;
        };

    }
    RED.nodes.registerType("modbus-rtu-config",ModbusRTUConfigNode);
};
