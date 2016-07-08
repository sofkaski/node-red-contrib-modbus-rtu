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
        
        var globalContext = this.context().global;
        var modbusMaster = globalContext.get('modbusMaster') || null;
 
      
        log.info("Instantiated ModbusRTUInNode '" + node.name + "'");
        modbusConnection = RED.nodes.getNode(config.modbusConnection);
        if (!modbusConnection) {
            var msg = "No modbus connection configuration node found.";
            log.error(msg);
            node.error("Aborting", msg);
        }
        modbusConnection.initializeRTUConnection(
            function (modbusMaster, err) {
                if (err) {
                    log.error(err);
                } 
                else if (modbusMaster) {
                    node.status(ModbusState.CONNECTED);
                }
                else {
                    log.error('Modbus connection failed, but no error reported.');
                }
            }
        );

        node.on('input', function(msg) {
            log.info('Input message:',msg);
            if (msg.topic === "readHoldingRegisters") {
                var modbusMaster = this.context().global.get('modbusMaster');
                    modbusMaster.readHoldingRegisters(msg.payload.slave,msg.payload.startRegister,msg.payload.nbrOfRegisters).
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
            var modbusConnection = RED.nodes.getNode(config.modbusConnection);
            if (modbusConnection) {
                modbusConnection.close();
            }
            modbusMaster = null;
            node.status(ModbusState.UNINITIALIZED);
        });

    }
    
    RED.nodes.registerType("modbus-rtu-in",modbusRTUInNode);

};
