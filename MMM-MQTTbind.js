"use strict";

// Magicmirror Modul - MMM-MQTTbind - MIT Licensed
// Autor: Jan Mittelstaedter 
// 
// Originally Based on MMM-MQTTbridge (MIT-License) - https://github.com/sergge1/MMM-MQTTbridge


Module.register("MMM-MQTTbind", {
  defaults: {
    server: "",
    ignoredNotifications: [],
    ignoredSenders: [],
    bindings: {
      subscriptions: [],
      publications: [],					
    },
  },

  start: function () {
    Log.info("Starting module: " + this.name);
    this.loaded = false;
    this.initialize(this);
  },

  initialize: function (self) {
    self.sendSocketNotification("MQTT_BIND_CONNECT", self.config);
  },

  socketNotificationReceived: function (notification, payload) {
    var self = this;
    switch (notification) {

      case "MQTT_MESSAGE_RECEIVED": {
          for (var i = 0; i < this.config.bindings.subscriptions.length; i++) {
            if(this.config.bindings.subscriptions[i].topic == payload.topic) {
              this.sendNotification(this.config.bindings.subscriptions[i].notification, payload.message);
              break;              
            }
          }
        }
        break;

      case "ERROR": {
        this.sendNotification("SHOW_ALERT", payload);
        break;
      }
    }
  },

  notificationReceived: function (notification, payload, sender) {
    var self = this;
    var sndname = "system";

    if (!sender === false) { sndname = sender.name; }; 

    for (var x in this.config.ignoredSenders) {
      if (sndname == this.config.ignoredSenders[x]) { return; }
    }

    for (var x in this.config.ignoredNotifications) {
      if (notification == this.config.ignoredNotifications[x]) { return; }
    }

    for (var i = 0; i < this.config.bindings.publications.length; i++) {
      if (this.config.bindings.publications[i].notification === notification) {
        this.sendSocketNotification("MQTT_MESSAGE_SEND", { 'binding': this.config.bindings.publications[i], 'message': payload });
        break;
      }
    }
  },

  log: function(type, message) {

    var self = this;
  
    switch(type) {
      case 'INFO':
        this.sendSocketNotification("LOG", { 'type': type, 'message': message});
        break;
  
        case 'LOG':
        if(self.config.enableLogging == true) {
          this.sendSocketNotification("LOG", { 'type': type, 'message': message});
        }           
        break;
  
        case 'ERROR':
          this.sendSocketNotification("LOG", { 'type': type, 'message': message});
        break;
    }
  },
});
