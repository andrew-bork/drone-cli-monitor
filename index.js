#! /usr/bin/env node

const mqtt = require('mqtt');
const cli = require("./cli");
const str = require("./str");

const logger = cli.logger;

const client  = mqtt.connect('tcp://192.168.86.21:1883');

const RAD_T_DEG = 57.29577951308232;

client.on('connect', function (err) {
    logger.log("connected to drone");
    client.subscribe('adiru/full');
    client.subscribe('motors/speed');
})

const attitude_data = [[str.left_pad("Roll (°)", " ", 10), str.left_pad("Pitch (°)", " ", 10)], [0, 0]];
const attitude_display = new cli.cli_table(attitude_data, 2);

const motor_data = [["FL %", "FR %", "BL %", "BR %"].map((a) => str.left_pad(a, " ", 10)), [0, 0, 0, 0]];
const motor_display = new cli.cli_table(motor_data, 11);


client.on('message', function (topic, message) {
    if(topic === "adiru/full") {
        let data = message.toString().split(" ").map(parseFloat);

        attitude_data[1][0] = str.left_pad((data[3] * RAD_T_DEG).toFixed(2), " ", 10);
        attitude_data[1][1] = str.left_pad((data[4] * RAD_T_DEG).toFixed(2), " ", 10);

        attitude_display.set_data(attitude_data);
        // console.log(data[0], data[1], data[2])
    }else if(topic === "motors/speed") {
        let data = message.toString().split(" ").map(parseFloat);

        motor_data[1][0] = str.left_pad(Math.round(data[0] * 100).toString(), " ", 10);
        motor_data[1][1] = str.left_pad(Math.round(data[1] * 100).toString(), " ", 10);
        motor_data[1][2] = str.left_pad(Math.round(data[2] * 100).toString(), " ", 10);
        motor_data[1][3] = str.left_pad(Math.round(data[3] * 100).toString(), " ", 10);

        motor_display.set_data(motor_data);
        // console.log(data[0], data[1], data[2])
    }
//   client.end()
});

/*

help me log

*/

console.clear();
cli.logger.line_start = 20;
cli.logger.draw();
attitude_display.draw();
motor_display.draw();