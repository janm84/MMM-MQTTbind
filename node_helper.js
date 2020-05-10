'use strict';

// Magicmirror Modul - MMM-MQTTbind / node_helper.js - MIT Licensed
// Autor: Jan Mittelstaedter 
// 
// Originally Based on MMM-MQTTbridge (MIT-License) - https://github.com/sergge1/MMM-MQTTbridge 


const NodeHelper = require('node_helper');
const mqtt = require('mqtt');

module.exports = NodeHelper.create({
  start: function () {
    this.logMsg('module startet');
    this.clients = [];
    this.config = {};
  },

  stop: function() { 
    const self = this;
    self.logMsg("INFO: Cleaning up...");
    self.unsubscribe();
    self.clients[self.config.server].end();
  },

  subscribe: function() {
    const self = this;
    for (var i = 0; i < self.config.bindings.subscriptions.length; i++) {
      if (!self.clients[self.config.server].connected) {
        self.clients[self.config.server].subscribe(self.config.bindings.subscriptions[i].topic, self.config.bindings.subscriptions[i].options);
        self.logMsg("LOG", "Subscripted to: " + self.config.bindings.subscriptions[i].topic);
      }
    }
  },

  unsubscribe: function() {
    const self = this;

    for (var i = 0; i < self.config.bindings.subscriptions.length; i++) {
      if (!self.clients[self.config.server].connected) {
        self.clients[self.config.server].unsubscribe(self.config.bindings.subscriptions[i].topic);
        self.logMsg("LOG", "Unsubscripted from: " + self.config.bindings.subscriptions[i].topic);
      }
    }    
  },

  connect: function (config) {
    var self = this;
    var client;
    self.config = config;

    if (typeof self.clients[self.config.server] === "undefined" || self.clients[self.config.server].connected == false) {
      client = mqtt.connect(self.config.server, config.options);
      self.clients[self.config.server] = client;

      self.clients[self.config.server].on('error', function (error) {
        self.logMsg("ERROR", "(MQTT server: " + error);
        self.sendSocketNotification("ERROR", { type: 'notification', title: '[MMM-MQTTbind]', message: 'Server: ' + error });
      });

      self.clients[self.config.server].on('offline', function () {
        self.logMsg("INFO", "Could not establish connection to MQTT Server");
        self.sendSocketNotification("ERROR", { type: 'notification', title: '[MMM-MQTTbind]', message: "Could not establish connection to MQTT Server" });
        client.end();
      });

      self.clients[self.config.server].on('disconnect', function() {
        self.logMsg("LOG", "Disconnected!");
      });

      self.clients[self.config.server].on('connect', function() {
        self.logMsg("LOG", "Connected!");
      });

      self.clients[self.config.server].on('reconnect', function() {
        self.logMsg("LOG", "Reconnect...");
      });

      self.clients[self.config.server].on('packetreceive', function(packet) {
        //self.logMsg("LOG", "PACKETRECEIVE - topic:" + packet.topic + " payload: " + packet.payload);
      });
    }

    self.subscribe();

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
        if (typeof self.clients[self.config.server] !== "undefined") {
          self.clients[self.config.server].publish(payload.binding.topic, payload.message, payload.binding.options);
          self.logMsg("LOG", "Published Topic: " + payload.binding.topic + " Value:" + payload.message);          
        };        
        break;
      case 'LOG':
        self.logMsg(payload.type, payload.message);
        break;
    }
  },

  logMsg: function(type, message) {

    var self = this;

    switch(type) {
      case 'INFO':
        console.log("[MQTTbind]: " + message);
        break;

      case 'LOG':
        if(self.config.enableLogging == true) {
          console.log("[MQTTbind]: " + message)
        }           
        break;

      case 'ERROR':
        console.log("[MQTTbind] ERROR: " + message);
        break;
    }
  }
});
