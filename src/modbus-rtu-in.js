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
        this.name = config.name;

        log.info("Instantiated ModbusRTUInNode '" + this.name + "'");
        this.modbusConnection = RED.nodes.getNode(config.modbusConnection);
        if (!this.modbusConnection) {
            var msg = "No modbus connection configuration node found.";
            log.error(msg);
            node.error("Aborting", msg);
        }
        this.modbusConnection.initializeRTUConnection(
            function (this.modbusMaster, err) {
                if (err) {
                    log.error(err);
                }
                else if (this.modbusMaster) {
                    this.status(ModbusState.CONNECTED);
                }
                else {
                    log.error('Modbus connection failed, but no error reported.');
                }
            }
        );

        this.on('input', function(msg) {
            if (msg.topic === "readHoldingRegisters") {
                    this.modbusMaster.readHoldingRegisters(msg.payload.slave,msg.payload.startRegister,msg.payload.nbrOfRegisters).
                    then(function(data){
                        this.send({"topic": "readHoldingRegisters",'payload': data});
                    },
                    function(err){
                        log.error('Failure on holding register read: ' + err);
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
            this.modbusMaster = null;
            this.status(ModbusState.UNINITIALIZED);
        });

    }

    RED.nodes.registerType("modbus-rtu-in",modbusRTUInNode);

};
