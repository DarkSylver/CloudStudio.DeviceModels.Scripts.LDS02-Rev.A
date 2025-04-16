//Test: OB880100250001000000 BAT: 2.952 DOOR OPEN STATUS: 0  OPEN TIMES: 37 LAST OPEN DOOR: 1 MOD: 1 - Parece estar mal en la documentación, con este otro payload funciona OC 42 01 00 00 93 00 00 00 00

function parseUplink(device, payload) {
    var payloadb = payload.asBytes();
    var decoded = Decoder(payloadb, payload.port);
    env.log(decoded);

    // Store battery
    if (decoded.BAT_V != null) {
        var sensor1 = device.endpoints.byAddress("1");

        if (sensor1 != null)
            sensor1.updateVoltageSensorStatus(decoded.BAT_V);
        device.updateDeviceBattery({ voltage: decoded.BAT_V });
    }

    // Store door open status
    if (decoded.DOOR_OPEN_STATUS != null) {
        var sensor2 = device.endpoints.byAddress("2");

        if (sensor2 != null)
            sensor2.updateIASSensorStatus(decoded.DOOR_OPEN_STATUS);
    }

    // Store total open door events
    if (decoded.DOOR_OPEN_TIMES != null) {
        var sensor3 = device.endpoints.byAddress("3");

        if (sensor3 != null)
            sensor3.updateGenericSensorStatus(decoded.DOOR_OPEN_TIMES);
    }

    // Last door open duration
    if (decoded.LAST_DOOR_OPEN_DURATION != null) {
        var sensor4 = device.endpoints.byAddress("4");

        if (sensor4 != null)
            sensor4.updateGenericSensorStatus(decoded.LAST_DOOR_OPEN_DURATION);
    }

    // Alarm
    if (decoded.ALARM != null) {
        var sensor5 = device.endpoints.byAddress("5");

        if (sensor5 != null)
            sensor5.updateIASSensorStatus(decoded.ALARM);
    }
}

function Decoder(bytes, port) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var value=(bytes[0]<<8 | bytes[1])&0x3FFF;
  var bat=value/1000;//Battery,units:V
  
  var door_open_status=bytes[0]&0x80?1:0;//1:open,0:close
  var water_leak_status=bytes[0]&0x40?1:0;
  
  var mod=bytes[2];
  var alarm=bytes[9]&0x01;
  
  if(mod==1){
   var open_times=bytes[3]<<16 | bytes[4]<<8 | bytes[5];
    var open_duration=bytes[6]<<16 | bytes[7]<<8 | bytes[8];//units:min
    if(bytes.length==10 &&  0x07>bytes[0]< 0x0f)
    return {
      BAT_V:bat,
      MOD:mod,
      DOOR_OPEN_STATUS:door_open_status,
      DOOR_OPEN_TIMES:open_times,
      LAST_DOOR_OPEN_DURATION:open_duration,
      ALARM:alarm
    };
  }
  else if(mod==2)
  {
  var leak_times=bytes[3]<<16 | bytes[4]<<8 | bytes[5];
  var leak_duration=bytes[6]<<16 | bytes[7]<<8 | bytes[8];//units:min
  if(bytes.length==10 &&  0x07>bytes[0]< 0x0f)
  return {
      BAT_V:bat,
      MOD:mod,
      WATER_LEAK_STATUS:water_leak_status,
      WATER_LEAK_TIMES:leak_times,
      LAST_WATER_LEAK_DURATION:leak_duration
  };
  }
  else if(mod==3)
  if(bytes.length==10 &&  0x07>bytes[0]< 0x0f)
  {
  return {
      BAT_V:bat,
      MOD:mod,
      DOOR_OPEN_STATUS:door_open_status,
      WATER_LEAK_STATUS:water_leak_status,
      ALARM:alarm
  };
  }
  else{
  return {
      BAT_V:bat,
      MOD:mod,
  };
  }
}