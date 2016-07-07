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
        
        log.info("Instantiated ModbusRTUInNode '" + node.name + "'");
        var modbusConnection = RED.nodes.getNode(config.modbusConnection);
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
            }
        );

        function readHoldingRegisters(slave, startRegister, nbrOfRegisters) {
            log.info(vsprintf('readHolding registers called with: %s, %s, %s',[slave, startRegister, nbrOfRegisters]));
            node.modbusMaster.readHoldingRegisters(slave, startRegister, nbrOfRegisters).
            then(function(data){
                node.send({'payload': data});
            }, function(err){
                log.error('Failure on holding register read: ', err);
            });
        }
        node.on('input', function(msg) {
            log.info('Input message:',msg);
            readHoldingRegisters(msg.payload.slave,msg.payload.startRegister,msg.payload.nbrOfRegisters); 
        });
 

    }
    
    RED.nodes.registerType("modbus-rtu-in",modbusRTUInNode);

};
