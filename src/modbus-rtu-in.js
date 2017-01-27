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
        this.name = config.name;
        var rtuNode = this;

        log.info("Instantiated ModbusRTUInNode '" + rtuNode.name + "'");
        rtuNode.modbusConnection = RED.nodes.getNode(config.modbusConnection);
        if (!rtuNode.modbusConnection) {
            var msg = "No modbus connection configuration node found.";
            log.error(msg);
            log.error("Aborting", msg);
        }
        log.info("Using configuration for unit_id " + rtuNode.modbusConnection.unit_id);

        rtuNode.modbusConnection.initializeRTUConnection(rtuNode,
            function (modbusMaster, err) {
                if (err) {
                    log.error(err);
                }
                else if (modbusMaster) {
                    log.info("Modbus master created successfully");
                    rtuNode.status(ModbusState.CONNECTED);
                }
                else {
                    log.error('Modbus connection failed, but no error reported.');
                }
            }
        );
        log.info("Initialized RTU connection to  '" + this.name + "'");

        rtuNode.on('input', function(msg) {
            if (msg.topic === "readHoldingRegisters") {
                    rtuNode.modbusMaster.readHoldingRegisters(msg.payload.slave,msg.payload.startRegister,msg.payload.nbrOfRegisters).
                    then(function(data){
                        rtuNode.send({"topic": "readHoldingRegisters",'payload': data});
                    },
                    function(err){
                        log.error('Failure on holding register read: ' + err);
                    });
            }
            else {
                log.warn('Unknown input message received');
            }
        });

        rtuNode.on('close', function() {
            var modbusConnection = RED.nodes.getNode(config.modbusConnection);
            if (modbusConnection) {
                modbusConnection.close();
            }
            rtuNode.modbusMaster = null;
            rtuNode.status(ModbusState.UNINITIALIZED);
        });

    }

    RED.nodes.registerType("modbus-rtu-in",modbusRTUInNode);

};
