#include <WaspSensorAgr_v20.h>  // Librería sensores agrícolas v2.0
#include <WaspXBee802.h>        // Librería XBee 802.15.4

// Dirección del Gateway USB (DL = 1 → "0001")
char DEST_ADDR[] = "0001";

// Buffer para el mensaje
char payload[64];

void setup() {
  USB.ON();
  USB.println(F("Inicio de medicion de Humedad y Temperatura"));

  // Inicializar placa de sensores agrícolas
  SensorAgrv20.ON();

  // Inicializar XBee
  xbee802.ON();
  delay(200);
}

void loop() {
  // --- Humedad y temperatura (SHT75 Sensirion) ---
  SensorAgrv20.setSensorMode(SENS_ON, SENS_AGR_SENSIRION);
  delay(100);

  float temperature = SensorAgrv20.readValue(SENS_AGR_SENSIRION, SENSIRION_TEMP);
  float humidity    = SensorAgrv20.readValue(SENS_AGR_SENSIRION, SENSIRION_HUM);

  SensorAgrv20.setSensorMode(SENS_OFF, SENS_AGR_SENSIRION);

  // Mostrar por USB
  USB.print(F("Temperatura (C): ")); USB.println(temperature);
  USB.print(F("Humedad (%RH): "));   USB.println(humidity);

  // Construir payload (ejemplo CSV con dos campos)
  char tempStr[16], humStr[16];
  dtostrf(temperature, 6, 2, tempStr);
  dtostrf(humidity,    6, 2, humStr);
  sprintf(payload, "T:%s,H:%s", tempStr, humStr);

  // Enviar al Gateway USB
  int error = xbee802.send(DEST_ADDR, payload);

  if (error == 0) {
    USB.print(F("Datos enviados: "));
    USB.println(payload);
  } else {
    USB.print(F("Error al enviar (codigo): "));
    USB.println(error, DEC);
  }

  delay(5000); // cada 5 segundos
}


