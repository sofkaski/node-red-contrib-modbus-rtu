module.exports = function(RED) {
    function ModbusRTUConfigNode(config) {
        var SerialPort = require('serialport');
        var modbus = require('modbus-rtu');
//        var log = require('tracer').console();
        var vsprintf = require("sprintf-js").vsprintf;
        var log = RED.log;


        RED.nodes.createNode(this,config);
        this.unit_id = parseInt(config.unit_id);
        this.serial_device = config.serial_device;
        this.serial_speed = parseInt(config.serial_speed);
        this.serial_parity = config.serial_parity;
        this.serial_databits = parseInt(config.serial_databits);
        this.serial_stopbits = parseInt(config.serial_stopbits);

        this.on('input', function(msg) {

        });
        log.info("Created configuration node with unit_id " + this.unit_id);

        // connection initialization. Create serial device and then modbus master on top of that
        this.initializeRTUConnection = function(callback) {
            log.info(vsprintf("About to create serial port on device %s (%s baud)", [this.serial_device, this.serial_speed]));

            this.serialPort = new SerialPort(this.serial_device, {
                baudrate: this.serial_speed});
            if (this.serialPort) {
                log.info("Created the serial port.");
                var master = new modbus.Master(this.serialPort);
                if (master) {
                    this.modbusMaster = master;
                    log.info("Created modbus master device");
                    callback(master,null);
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


        this.close = function() {
            if (this.serialPort) {
                this.serialPort.close();
            }
            this.serialPort = null;
            this.modbusMaster = null;
        };

    }
    RED.nodes.registerType("modbus-rtu-config",ModbusRTUConfigNode);
};
