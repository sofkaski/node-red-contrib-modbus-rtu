module.exports = function(RED) {
    
    var ModbusState = {
        CONNECTED: {fill:"green",shape:"dot",text:"connected"},
        UNINITIALIZED: {fill:"red",shape:"ring",text:"disconnected"}
    };
    Object.freeze(ModbusState);
    
    function ModbusRTUInNode(config) {
        var log = require('tracer').console();
        RED.nodes.createNode(this,config);
        var node = this;
        node.modbusMaster = null;
        
        log.info("Instantiated ModbusRTUInNode");
        var modbusConnection = RED.nodes.getNode(config.modbusConnection);
        log.info("Found modbusConnection object");
        modbusConnection.initializeRTUConnection(
            function (modbusMaster, err) {
                if (err) {
                    log.error(err);
                } 
                else if (modbusMaster) {
                    node.status(ModbusState.CONNECTED);
                    node.modbusMaster = modbusMaster;
                }
                else {
                    log.error('Modbus connection failed, but no error reported.');
                }
            });
        
    }
    RED.nodes.registerType("modbus-rtu-in",ModbusRTUInNode);

};
