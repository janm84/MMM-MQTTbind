"use strict";

// Magicmirror Modul - MMM-MQTTbind
// by Jan Mittelstaedter
//
// MIT Licensed
//
// Please see: https://github.com/janm84/MMM-MQTTbind
//
// Inspired from MMM-MQTTbridge (MIT-License) - https://github.com/sergge1/MMM-MQTTbridge


Module.register("MMM-MQTTbind", {

  //Default Values for the Configuration
  defaults: {
    server: "",
    ignoredNotifications: [],
    ignoredSenders: [],
    bindings: {
      subscriptions: [],
      publications: [],
    },
  },

  // Declaration of interal Variables
  start: function () {
    Log.info("Starting module: " + this.name);
    this.loaded = false;      // true when Connected the first time
    this.initialize(this);
    this.startupQueue = [];   // Queue for Messages where Received before connected to MQTT Server
  },

  // Provide the node helper with the configuration and trigger the connection
  initialize: function (self) {
    self.sendSocketNotification("MQTT_BIND_CONNECT", self.config);
  },

  socketNotificationReceived: function (notification, payload) {
    var self = this;
    switch (notification) {

      // Triggered by node_helper when a msg from from mqtt server was received
      case "MQTT_MESSAGE_RECEIVED": {
        for (var i = 0; i < this.config.bindings.subscriptions.length; i++) {
          if(this.config.bindings.subscriptions[i].topic == payload.topic) {
            this.sendNotification(this.config.bindings.subscriptions[i].notification, payload.message);
            break;
          }
        }
      }
      break;

      // triggered by node_hellper when the connection is established
      case "MQTT_BIND_CONNECTED": {
        this.loaded = true;

        // sending queued notifications
        for (var i = 0; i < this.startupQueue.length; i++) {
          let item = this.startupQueue.shift();
          this.sendNotification(item.notification, item.payload);
          this.log("LOG", "Publish Queued Item: " + i+1 + "(notification: " + item.notification + ", payload: " + payload + ")");
        }
        break;
      }

      // Triggered by node_helper in case of a Error
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

    // Checking if the sender is in the list of ignored senders. Thoughts to change this into a whitelist.
    for (var x in this.config.ignoredSenders) {
      if (sndname == this.config.ignoredSenders[x]) { return; }
    }

    // Checking if the ntification is in the list of ignored norifications. Thoughts to change this into a whitelist.
    for (var x in this.config.ignoredNotifications) {
      if (notification == this.config.ignoredNotifications[x]) { return; }
    }

    // Checking if a binding exists in the configuration for this notification and forward it to node_helper.
    for (var i = 0; i < this.config.bindings.publications.length; i++) {
      if (this.config.bindings.publications[i].notification === notification) {

        // If false the client is not connected and the received notification gets queued.
        if(this.loaded = true) {
          this.safeSendNotification(this.config.bindings.publications[i], payload);
        } else {
          // Notifications in eine queue schreiben um sie nach dem connect abzuarbeiten.
          this.startupQueue.push({ 'notification': notification, 'payload': payload });
          this.log("LOG", "Adding Item to StartupQueue: (" + notification + ", payload: " + payload + ")");
        }
        break;
      }
    }
  },

  safeSendNotification : function (binding, message) {
    if (typeof(message) !== "string") {
      message = JSON.stringify(message);
    }
    this.sendSocketNotification("MQTT_MESSAGE_SEND", { 'binding': binding, 'message': message });
  },

  // Logging to pm2 logfile instead of browser console
  log: function(type, message) {

    var self = this;

    switch(type) {

      case 'INFO':     // Always gets logged.
        this.sendSocketNotification("LOG", { 'type': type, 'message': message});
        break;

        case 'LOG':    // Only if enable logging is true in the config.
        if(self.config.enableLogging == true) {
          this.sendSocketNotification("LOG", { 'type': type, 'message': message});
        }
        break;

        case 'ERROR':   // Always gets logged
          this.sendSocketNotification("LOG", { 'type': type, 'message': message});
        break;
    }
  },
});
