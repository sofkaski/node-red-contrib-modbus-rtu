module.exports = function(RED) {
    function ModbusRTUInNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.log("Instantiated ModbusRTUInNode");
        var modbusConnection = RED.nodes.getNode(config.modbusConnection);
        node.log("Found modbusConnection object");
        
        this.on('input', function(msg) {
            
        });
    }
    RED.nodes.registerType("modbus-rtu-in",ModbusRTUInNode);

};
