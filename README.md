# MMM-MQTTbind

This is a Magicmirror2 module for communication with a MQTT broker. 

With this module you are able to use the most important features of MQTT, like retained flags, QoS, clean connections, etc.
The client is based on the mqtt.js library from NodeJS, so for explanation or extension of the configuration you can always read on https://www.npmjs.com/package/mqtt to receive more details.

How it's working:

![alt-text](https://github.com/janm84/MMM-MQTTbind/blob/master/gitthub/MQTTbind.png)

The module MMM-MQTTbind represents the bindin between MQTT-Topics and Magicmirror Notifications. 

#####MQTT to Magicmirror Notification:
If the client receives messages from the MQTT-Broker for a subscribed Topic, it forwards them to the configured Magicmirror Notification. e.g:

Topic: "home/livingroom/bulb1/cmnd/power" Message: "ON" -> Notification: "MY_NOTIFICATION" Payload "ON".

#####Magicmirror Notification to MQTT
If a publish is configured, MMM-MQTTbind will publish the received Notification and it's payload to an configured MQTT-Topic. e.g.:

"MY_NOTIFICATION" Payload "ON" will be forwarded as MQTT Message to Topic: "home/livingroom/bulb1/stat/power

#####Configuration:

		{
			module: 'MMM-MQTTbind',
			disabled: false,
			config: {
				enableLogging: true,
				server: "mqtt://192.168.44.16:1883",
				options: {
					clientOptions: {
						keepalive: 60,
						clientId: "MM_Esszimmer",
						protocolId: 'MQTT',
						protocolVersion: 5,
						clean: true, 
					},
					will: {
						topic: "home/esszimmer/magicmirror/stat/lastwill",
						payload: "died",
					},
				},
				ignoredNotifications: ["CLOCK_MINUTE", "CLOCK_SECOND", "NEWS_FEED"],
				ignoredSenders: ["NEWS_FEED", "calender", "MMM-GoogleTasks", "MMM-OpenmapWeather", "weatherforecast"],
				bindings: {
					subscriptions: [
						{						
							topic: "home/esszimmer/magicmirror/monitor/cmnd/setmode",
							notification: "MONITOR_POWER_TOGGLE",
							options: {
								qos: 0,
								nl: false,
								rap: false,
								rh: false,
							},		
						},
					],
					publications: [
						{
							topic: "home/esszimmer/magicmirror/monitor/stat/power",
							notification: "MONITOR_POWER",
							options: {
								qos: 1,
								retain: false,
								dup: false,
							},		
						},
						{
							topic: "home/esszimmer/magicmirror/stat/userpresence",
							notification: "USER_PRESENCE",
							options: {
								qos: 0,
								retain: false,
								dup: false,
							},		
						},
						{
							topic: "home/esszimmer/magicmirror/stat/temperature",
							notification: "INDOOR_TEMPERATURE",
							options: {
								qos: 0,
								retain: false,
								dup: false,
							},		
						},
						{
							topic: "home/esszimmer/magicmirror/stat/humidity",
							notification: "INDOOR_HUMIDITY",
							options: {
								qos: 0,
								retain: false,
								dup: false,
							},		
						},
						{
							topic: "home/esszimmer/magicmirror/monitor/stat/mode",
							notification: "MONITOR_MODE",
							options: {
								qos: 1,
								retain: false, 
								dup: false,
							},		
						},
					],					
				},
			},
