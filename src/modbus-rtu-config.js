module.exports = function(RED) {
    function ModbusRTUConfigNode(config) {
        RED.nodes.createNode(this,config);
        this.name = config.name;
        this.dataType = config.dataType;
        this.unit_id = config.unit_id;
        this.serial_device = config.serial_device;
        this.serial_speed = config.serial_speed;
        this.serial_parity = config.serial_parity;
        this.serial_databits = config.serial_databits;
        this.serial_stopbits = config.serial_stopbits;

        this.on('input', function(msg) {
            
        });

        var node = this;
    }
    RED.nodes.registerType("modbus-rtu-config",ModbusRTUConfigNode);


};
