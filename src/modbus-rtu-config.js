module.exports = function(RED) {
    function ModbusRTUConfigNode(config) {
        var SerialPort = require('serialport');
        var modbus = require('modbus-rtu');
        var log = require('tracer').console();

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

        var node = this;
        node.modbusMaster = null;
        
        // connection initialization. Create serial device and then modbus master on top of that
        node.initializeRTUConnection = function(callback) {
            var serialPort = new SerialPort(this.serial_device, {
                baudrate: this.serial_speed});
            if (serialPort) {
                // handle serial port open
                serialPort.on('open', function() {
                    log.info("Created serial port");
                    node.modbusMaster = new modbus.Master(serialPort);
                    if (node.modbusMaster) {
                        log.info("Created modbus master device");
                        callback(node.modbusMaster,null);
                    }
                    else {
                        callback(null, "Failed to create modbus master device");
                    }
                });
                // handle serial port opening failure
                serialPort.on('error', function(err) {
                    log.error('Error: ', err.message);
                });
                
            }
            else {
                callback(null, "Failed to create serial port");
            }
        };
    }
    RED.nodes.registerType("modbus-rtu-config",ModbusRTUConfigNode);


};
