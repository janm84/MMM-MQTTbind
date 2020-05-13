'use strict';

// Magicmirror Modul - MMM-MQTTbind / node_helper.js
// by Jan Mittelstaedter
//
// MIT Licensed
//
// Please see: https://github.com/janm84/MMM-MQTTbind
//
// Inspired from MMM-MQTTbridge (MIT-License) - https://github.com/sergge1/MMM-MQTTbridge


const NodeHelper = require('node_helper');
const mqtt = require('mqtt');

module.exports = NodeHelper.create({

  // Setting up some internal variables.
  start: function () {
    this.logMsg('module startet');
    this.clients = [];
    this.config = {};
    this.initialstartup = 0;
  },

  // Unsubscribe and Clean up when MM gets stopped
  stop: function() { 
    const self = this;
    self.logMsg("INFO: Cleaning up...");
    self.unsubscribe();
    self.clients[self.config.server].end();
  },

  //Subscribe to the configured topics (options from mqtt.js)
  subscribe: function() {
    const self = this;
    for (var i = 0; i < self.config.bindings.subscriptions.length; i++) {
      if (!self.clients[self.config.server].connected) {
        self.clients[self.config.server].subscribe(self.config.bindings.subscriptions[i].topic, self.config.bindings.subscriptions[i].options);
        self.logMsg("LOG", "Subscripted to: " + self.config.bindings.subscriptions[i].topic);
      }
    }
  },

  // Unsubsribe from configured topics.
  unsubscribe: function() {
    const self = this;

    for (var i = 0; i < self.config.bindings.subscriptions.length; i++) {
      if (!self.clients[self.config.server].connected) {
        self.clients[self.config.server].unsubscribe(self.config.bindings.subscriptions[i].topic);
        self.logMsg("LOG", "Unsubscripted from: " + self.config.bindings.subscriptions[i].topic);
      }
    }    
  },

  // connect the client to mqtt server
  connect: function (config) {
    var self = this;
    var client;
    self.config = config;

    // checking if already connected or the client var is not initialized, setting up a new connection if not
    if (typeof self.clients[self.config.server] === "undefined" || self.clients[self.config.server].connected == false) {
      client = mqtt.connect(self.config.server, config.options);
      self.clients[self.config.server] = client;

      // Gets triggered on Error
      self.clients[self.config.server].on('error', function (error) {
        self.logMsg("ERROR", "(MQTT server: " + error);
        self.sendSocketNotification("ERROR", { type: 'notification', title: '[MMM-MQTTbind]', message: 'Server: ' + error });
      });

      // Gets triggered when the connection could not get established.
      self.clients[self.config.server].on('offline', function () {
        self.logMsg("INFO", "Could not establish connection to MQTT Server");
        self.sendSocketNotification("ERROR", { type: 'notification', title: '[MMM-MQTTbind]', message: "Could not establish connection to MQTT Server" });
        client.end();
      });

      // Gets trigered on disconnect
      self.clients[self.config.server].on('disconnect', function() {
        self.logMsg("LOG", "Disconnected!");
      });

      // Gets triggered when the client is connected
      self.clients[self.config.server].on('connect', function() {
        self.logMsg("LOG", "Connected!");
        self.sendSocketNotification('MQTT_BIND_CONNECTED', true); // Tell the main module that we are connected
      });

      // gets triggered on reconnect
      self.clients[self.config.server].on('reconnect', function() {
        self.logMsg("LOG", "Reconnect...");
      });

      // Gets triggered on every packet received by the client. Only for debbuging purposes
      self.clients[self.config.server].on('packetreceive', function(packet) {
        //self.logMsg("LOG", "PACKETRECEIVE - topic:" + packet.topic + " payload: " + packet.payload);
      });
    }

    self.subscribe();

    // Gets trggered when a MQTT is received. Forward the Message to the Mainmodule.
    self.clients[self.config.server].on('message', function (topic, message, packet) {
      self.logMsg("LOG", "MQTT message received - Topic: " + topic + ", Message: " + message.toString());
      self.sendSocketNotification('MQTT_MESSAGE_RECEIVED', { 'topic': topic, 'message': message.toString() });
    });
  },

  socketNotificationReceived: function (notification, payload) {
    var self = this;
    switch (notification) {
      case 'MQTT_BIND_CONNECT':   
        this.connect(payload);
        break;
      case 'MQTT_MESSAGE_SEND':
        if (typeof self.clients[self.config.server] !== "undefined") {    // Triggered by Mainmodule if we should send a Msg to the MQTT server
          self.clients[self.config.server].publish(payload.binding.topic, payload.message, payload.binding.options);  // Options from mqtt.js
          self.logMsg("LOG", "Published Topic: " + payload.binding.topic + " Value:" + payload.message);          
        };        
        break;
      case 'LOG':   
        self.logMsg(payload.type, payload.message);
        break;
    }
  },

  // used for writing the logs from mainmodule and "this", if logging is enabled.
  logMsg: function(type, message) {

    var self = this;

    switch(type) {
      case 'INFO':   // always gets logged
        console.log("[MQTTbind]: " + message);
        break;

      case 'LOG':   // only if enableLogging is true (used for debugging)
        if(self.config.enableLogging == true) {
          console.log("[MQTTbind]: " + message)
        }           
        break;

      case 'ERROR':   // in case of an error
        console.log("[MQTTbind] ERROR: " + message);
        break;
    }
  }
});
