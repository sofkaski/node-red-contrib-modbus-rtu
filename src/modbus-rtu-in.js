module.exports = function(RED) {
    
    var ModbusState = {
        CONNECTED: {fill:"green",shape:"dot",text:"connected"},
        UNINITIALIZED: {fill:"red",shape:"ring",text:"disconnected"}
    };
    Object.freeze(ModbusState);
    
    function modbusRTUInNode(config) {
        //var log = require('tracer').console();
        var log = RED.log;
        var vsprintf = require("sprintf-js").vsprintf;
        var Q = require("q");
        
        RED.nodes.createNode(this,config);
        var node = this;
        node.name = config.name;
        node.modbusMaster = null;
        node.modbusConnection = null;
        
        log.info("Instantiated ModbusRTUInNode '" + node.name + "'");
        node.modbusConnection = RED.nodes.getNode(config.modbusConnection);
        node.modbusConnection.initializeRTUConnection(
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
            }
        );

        node.on('input', function(msg) {
            log.info('Input message:',msg);
            if (msg.topic === "readHoldingRegisters") {
                node.modbusMaster.readHoldingRegisters(msg.payload.slave,msg.payload.startRegister,msg.payload.nbrOfRegisters).
                    then(function(data){
                        node.send({'payload': data});
                    }, 
                    function(err){
                        log.error('Failure on holding register read: ', err);
                    });
            }
            else {
                log.warn('Unknown input message received');
            }
        });
        
        node.on('close', function() {
            node.modbusConnection.close();
            node.modbusMaster = null;
            node.modbusConnection = null;
            node.status(ModbusState.UNINITIALIZED);
        });

    }
    
    RED.nodes.registerType("modbus-rtu-in",modbusRTUInNode);

};
