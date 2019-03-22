# Adafruit IO App for Triggering Alarms

Adafruit IO is Internet of Things as a service. This app you're looking at right here is a quick, single purpose implementation of a few client APIs.

Using only the [IO HTTP API](https://io.adafruit.com/api/docs/#!/v2), we can add data to feeds and read recent data from feeds. This lets us share data quickly between connected devices, things like browsers, phones, and other network connected hardware.

By hooking up [MQTT subscribers](https://learn.adafruit.com/adafruit-io/mqtt-api) we can even react to new data in (very very close to) real time!