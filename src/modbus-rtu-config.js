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
        this.modbus_end_packet_timeout = parseInt(config.modbus_end_packet_timeout);
        this.modbus_queue_timeout = parseInt(config.modbus_queue_timeout);
        this.modbus_response_timeout = parseInt(config.modbus_response_timeout);

        this.on('input', function(msg) {

        });
        log.info("Created configuration node with unit_id " + this.unit_id);
        var configNode = this;
        // connection initialization. Create serial device and then modbus master on top of that
        configNode.initializeRTUConnection = function(rtuNode, callback) {
            log.info(vsprintf("About to create serial port on device %s (%s baud)", [configNode.serial_device, configNode.serial_speed]));

            configNode.serialPort = new SerialPort(configNode.serial_device, {
                baudrate: configNode.serial_speed});
            if (configNode.serialPort) {
                log.info("Created the serial port.");
                var master = new modbus.Master(configNode.serialPort, {
                    endPacketTimeout: configNode.modbus_end_packet_timeout,
                    queueTimeout: configNode.modbus_queue_timeout,
                    responseTimeout: configNode.modbus_response_timeout
                });
                if (master) {
                    rtuNode.modbusMaster = master;
                    configNode.modbusMaster = master;
                    log.info("Created modbus master device");
                    callback(master,null);
                }
                else {
                    callback(null, "Failed to create modbus master device");
                }

                // handle serial port open
                configNode.serialPort.on('open', function() {
                    log.info("Opened the serial port.");
                });
                // handle serial port opening failure
                configNode.serialPort.on('error', function(err) {
                    log.error('Error: ', err.message);
                });

            }
            else {
                callback(null, "Failed to create a serial port");
            }
        };


        configNode.close = function() {
            if (configNode.serialPort) {
                configNode.serialPort.close();
            }
            configNode.serialPort = null;
            configNode.modbusMaster = null;
        };

    }
    RED.nodes.registerType("modbus-rtu-config",ModbusRTUConfigNode);
};
