# node-red-contrib-modbus-rtu
Node-RED abstraction of Modbus with RTU protocol. Implementation is based on [modbus-rtu](https://www.npmjs.com/package/modbus-rtu).

Currently only reading of holding registers implemented. Lot of clean-up needed for error handling and logging.
Also, only slik-glove tested using one modbus device connected via RS-485/USB adapter to Linux machine.

__I would not consider using this yet (Jul-2016)__.

## Building
 * clone this repo
 * cd <root directory of the repo>
 * yarn install
 * gulp publish
 * yarn pack

Result of the previous is a tar ball in the root directory. You can install it with npm install to the target.

## Configuration
Configuration through a node-red configuration node.  Serial device, speed, data bit, start and stop bit counts can be defined.
Drag the modbus rtu node to a flow and double-click to edit properties. 
Connection parameters are edited by selecting a connection name (or selecting 'Add new modbus connection' to create a new connection)
and pressing the pencil button.

## Reading holding registers
Holding registers can be red by sending an input message to modbus rtu node with topic 'readHoldingRegisters', slave (server) modbus device number,
starting register number and count of consecutive registers . Example:

```{ "topic": "readHoldingRegisters", "payload": { "slave": "1", "startRegister": "20", "nbrOfRegisters": "6" }}```

The node will spit out a message with register values in an array.
