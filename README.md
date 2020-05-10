# MMM-MQTTbind


Configuration:

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
