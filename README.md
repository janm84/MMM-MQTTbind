# MMM-MQTTbind

This is a Magicmirror2 module for communication with a MQTT broker, inspired by MMM-MQTTbridge (https://github.com/sergge1/MMM-MQTTbridge)

With this module you are able to use the most important features of MQTT, like retained flags, QoS, clean connections, etc.
The client is based on the mqtt.js library from NodeJS, so for explanation or extension of the configuration you can always read on https://www.npmjs.com/package/mqtt to receive more details.

#### How it's working:

![alt-text](https://github.com/janm84/MMM-MQTTbind/blob/master/github/MQTTbind.png)

The module MMM-MQTTbind represents the bindin between MQTT-Topics and Magicmirror Notifications. 

#### MQTT to Magicmirror Notification:
If the client receives messages from the MQTT-Broker for a subscribed Topic, it forwards them to the configured Magicmirror Notification. e.g:

Topic: "home/livingroom/bulb1/cmnd/power" Message: "ON" -> Notification: "MY_NOTIFICATION" Payload "ON".

#### Magicmirror Notification to MQTT
If a publish is configured, MMM-MQTTbind will publish the received Notification and it's payload to an configured MQTT-Topic. e.g.:

"MY_NOTIFICATION" Payload "ON" will be forwarded as MQTT Message to Topic: "home/livingroom/bulb1/stat/power

#### Minimalistic Configuration:

		{
			module: 'MMM-MQTTbind',
			disabled: false,
			config: {
				enableLogging: true,   // If true every publish and subscription will get logged with the payload
				server: "mqtt://192.168.0.1:1883", //See mqtt.client.connect() for more details
				options: {},
				ignoredNotifications: ["CLOCK_MINUTE", "CLOCK_SECOND", "NEWS_FEED"],
				ignoredSenders: ["NEWS_FEED", "calender", "MMM-GoogleTasks", "MMM-OpenmapWeather", "weatherforecast"],
				bindings: {
					subscriptions: [
						{						
							topic: "home/livingroom/bulbone/cmnd/power",  // Topic to subscribe to
							notification: "RECEIVING_NOTIFICATION_ONE",   // Notification to forward to
						},
						{						
							topic: "home/livingroom/bulbtwo/cmnd/power",  
							notification: "RECEIVING_NOTIFICATION_TWO",
						},
					],
					publications: [
						{
							topic: "home/livingroom/bulbone/stat/power",  // Topic to publish to
							notification: "SENDING_NOTIFICATION_ONE",     // Notifiction to publish
						},
						{
							topic: "home/livingroom/bulbtwo/stat/power",
							notification: "SENDING_NOTIFICATION_TWO",
						},
					],					
				},
			},


#### Extended Configuration:


		{
			module: 'MMM-MQTTbind',
			disabled: false,
			config: {
				enableLogging: true,   // If true every publish and subscription will get logged with the payload
				server: "mqtt://192.168.0.1:1883", // possible protocolls  'mqtt', 'mqtts', 'tcp', 'tls', 'ws', 'wss'. See mqtt.js for more details: https://www.npmjs.com/package/mqtt
				options: {   // please see mqtt.Client(streamBuilder, option) for more details (https://www.npmjs.com/package/mqtt)
					clientOptions: {
						keepalive: 60, // seconds, set to 0 to disable
						reschedulePings: true // reschedule ping messages after sending packets (default true)
						clientId: "MQTTbind", // Client ID for the communication with the MQTTBroker
						protocolId: 'MQTT',  // MQTTm MQIsdp
						protocolVersion: 4, // 1-5
						clean: true, // , set to false to receive QoS 1 and 2 messages while offline
						reconnectPeriod: 1000  // milliseconds, interval between two reconnections. Disable auto reconnect by setting to 0.
						connectTimeout: 30 * 1000 // milliseconds, time to wait before a CONNACK is received
						username: user // the username required by your broker, if any
						password: password // the password required by your broker, if any
					},
					will: {   //  a message that will sent by the broker automatically when the client disconnect badly
						topic: "home/esszimmer/magicmirror/stat/lastwill", // he topic to pulish to
						payload: "dead", // last will/testament message
						qos: 1, // qos level for the LWT Message
						retain: true, // retain flag
					},
				},
				ignoredNotifications: ["CLOCK_MINUTE", "CLOCK_SECOND", "NEWS_FEED"],  // Notifications that will be irgnored by MMM-MQTTbind
				ignoredSenders: ["NEWS_FEED", "calender", "MMM-GoogleTasks", "MMM-OpenmapWeather", "weatherforecast"],  // Notification-Sendera that will be irgnored by MMM-MQTTbind
				bindings: {
					subscriptions: [
						{						
							topic: "home/livingroom/bulbone/cmnd/power",  // >Topic to subscribe to
							notification: "RECEIVING_POWER_TOGGLE",   // Notification to forward to
							options: {
								qos: 0,  // QoS subscription level, default 0
								rap: false,  // Retain as Published MQTT 5.0 flag (If true, Application Messages forwarded using this subscription keep the RETAIN flag they were published with. If false, Application Messages forwarded using this subscription have the RETAIN flag set to 0.)
								rh: false,  // Retain Handling MQTT 5.0 (This option specifies whether retained messages are sent when the subscription is established.)
							},		
						},
					],
					publications: [
						{
							topic: "home/livingroom/bulbone/stat/power",
							notification: "SENDING_NOTIFICATION_ONE",
							options: {
								qos: 1,  // QoS level, Number, default 0
								retain: false,   // retain flag, Boolean, default false
							},		
						},
						{
							topic: "home/livingroom/bulbtwo/stat/power",
							notification: "SENDING_NOTIFICATION_TWO",
							options: {
								qos: 0,
								retain: false,
								dup: false,
							},		
						},
					],					
				},
			},

