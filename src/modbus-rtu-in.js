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

        log.info("Instantiated ModbusRTUInNode '" + this.name + "'");
        this.modbusConnection = RED.nodes.getNode(config.modbusConnection);
        if (!this.modbusConnection) {
            var msg = "No modbus connection configuration node found.";
            log.error(msg);
            log.error("Aborting", msg);
        }
        log.info("Using configuration for unit_id " + this.modbusConnection.unit_id);

        var node = this;
        this.modbusConnection.initializeRTUConnection(
            function (modbusMaster, err) {
                if (err) {
                    log.error(err);
                }
                else if (modbusMaster) {
                    log.info("Modbus master created successfully");
                    node.modbusMaster = modbusMaster;
                    node.status(ModbusState.CONNECTED);
                }
                else {
                    log.error('Modbus connection failed, but no error reported.');
                }
            }
        );
        log.info("Initialized RTU connection to  '" + this.name + "'");

        this.on('input', function(msg) {
            if (msg.topic === "readHoldingRegisters") {
                    node.modbusMaster.readHoldingRegisters(msg.payload.slave,msg.payload.startRegister,msg.payload.nbrOfRegisters).
                    then(function(data){
                        node.send({"topic": "readHoldingRegisters",'payload': data});
                    },
                    function(err){
                        log.error('Failure on holding register read: ' + err);
                    });
            }
            else {
                log.warn('Unknown input message received');
            }
        });

        this.on('close', function() {
            var modbusConnection = RED.nodes.getNode(config.modbusConnection);
            if (modbusConnection) {
                modbusConnection.close();
            }
            node.modbusMaster = null;
            node.status(ModbusState.UNINITIALIZED);
        });

    }

    RED.nodes.registerType("modbus-rtu-in",modbusRTUInNode);

};
