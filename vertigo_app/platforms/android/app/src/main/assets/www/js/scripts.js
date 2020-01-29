/*
var aws_config = {
	accessKeyId: 'AKIAYB5UOS3R2XUYAFKO',
	secretAccessKey: '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',
	region: 'us-west-2',
	params: { FunctionName: 'IOT0816-IoTAPI-EIB20168G5O' }
}

class aws {
    constructor(config) {
        this.config = config;
        this.lambda = new AWS.Lambda(this.config);
    }

    update(sensorid, value, success, error)
    {
        var params = {
            Payload: JSON.stringify({
                operation: 'update',
                sensorid: sensorid,
                value: value })
            }
        this.lambda.invoke(
            params,
            function(err, data) {
                if (err) {
                    error && error(err)
                }
                else {
                    success && success(data)
                }
            }
        )
    }

    query(sensorid, success, error)
    {
        var params = {
            Payload: JSON.stringify({
                operation: 'query',
                sensorid: sensorid })
            }
            this.lambda.invoke(
            params,
            function(err, data) {
                if (err) {
                    error && error(err)
                }
                else {
                    var items = JSON.parse(data.Payload).Items
                    success && success(items)
                }
            }
        )
    }

}
*/
// this is RedBear Lab's UART service
var redbear = {
    serviceUUID: "713D0000-503E-4C75-BA94-3148F18D941E",
    txCharacteristic: "713D0002-503E-4C75-BA94-3148F18D941E",
    rxCharacteristic: "713D0003-503E-4C75-BA94-3148F18D941E",
    txDescriptor: "00002902-0000-1000-8000-00805F9B34FB"
};

class Chart {
    constructor(name, div_id, max_readings = 100) {
        this.name = name;
        this.data = [];
        this.max_readings = max_readings
        this.chart = $('<div id="'+name+'-chart" style="width:100%; height:250px;"></div>');
        $('#' + div_id).append(this.chart);
        this.chart.CanvasJSChart({
            title: {
                text: this.name
            },
            axisY : {
                inlcudeZero: false
            },
            data: [{
                type: "splineArea",
                dataPoints: this.data
            }
            ]
        });
    }

    addData(data) {
        this.data.push({
            x: this.data.length+1,
            y: data
        });
    }

    render() {
        var num_readings = this.data.length;
        if (num_readings > this.max_readings) {
            this.chart.CanvasJSChart().options.data[0].dataPoints = this.data.slice(num_readings-this.max_readings);
        } else {
            this.chart.CanvasJSChart().options.data[0].dataPoints = this.data;
        }
        this.chart.CanvasJSChart().render();
    }

    reset() {
        this.data = [];
        this.render();
    }
}

var app = {
    initialize: function() {
        app.bindEvents();
        app.connected = false;
        app.device = null;
        app.analog_enabled = false;
        app.attacking = false;
        app.foundDevices = {};
        app.channelCharts = [
            new Chart('Channel One', 'chart-div'),
            new Chart('Channel Two', 'chart-div'),
            new Chart('Channel Three', 'chart-div')
        ];
        //app.aws = new aws(aws_config);
        evothings.aws.initialize(evothings.aws.config);

        
        app.chartRefresh = setInterval(function(){
            if ($.mobile.activePage.attr( "id" ) == "connected") {
                for (var i = 0; i < app.channelCharts.length; i++) {
                    app.channelCharts[i].render();
                }
            }
        }, 100);
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        $('#scan-button')[0].addEventListener('click', this.refreshDeviceList, false);
        $('#disconnect-button')[0].addEventListener('click', this.disconnect, false);
        $('#device-ul')[0].addEventListener('click', this.connect, false);
        $('#start-button')[0].addEventListener('click', this.toggleAnalog, false);
    },
    onDeviceReady: function() {
        //app.refreshDeviceList()
    },
    refreshDeviceList: function() {
        console.log("Starting device search");
        $('#device-ul').empty();
        app.foundDevices = {};
        evothings.easyble.reportDeviceOnce(true);
	    evothings.easyble.startScan([redbear.serviceUUID], app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device) {
        console.log("Found Device: " + device.name);
        if (device.name != null) {
            var device_dom = $('<li><b>' + device.name + '</b><br/>' +
                'RSSI: ' + device.rssi + '&nbsp;|&nbsp;' +
                device.address+'</li>');
            device_dom[0].dataset.serviceUUID = device.address;
            app.foundDevices[device.address] = device;
            $('#device-ul').append(device_dom);
        }
    },
    connect: function(e) {
        var deviceUUID = e.target.dataset.serviceUUID;
        evothings.easyble.stopScan();
        
        function onConnect(device){
            function onServiceSuccess(device) {
                console.log('Connected to ' + device.name);
                // Helpful for showing services and descriptor UUIDs 
                //$.each(device.__uuidMap, function(key, data) {
                //    console.log(key + ' -> ' + data);
                //});
                app.connected = true;
                app.device = device;
                $('#device-name').text(device.name);
                app.device.writeDescriptor(
                    redbear.txCharacteristic,
                    redbear.txDescriptor,
                    new Uint8Array([1,0]),
                    app.showConnectedPage,
                    app.onError
                );
    
                app.device.enableNotification(
                    redbear.txCharacteristic,
                    app.onData,
                    app.onError
                );
            };
            
            // Connect to the appropriate BLE service
            device.readServices(
                [redbear.serviceUUID],
                onServiceSuccess,
                app.onError
            );
        };
        
        app.foundDevices[deviceUUID].connect(onConnect, app.onError);
        
    },
    onData: function(data) { // data received from Arduino
        var raw_input = new Uint8Array(data);
        var type = raw_input[0];
        var number = (raw_input[1] << 8) | raw_input[2];

        switch(type) {
            case 0x0B:
                app.channelCharts[0].addData(number);
                break; 
            case 0x0E:
                app.channelCharts[1].addData(number);
                break;
            case 0x0F:
                app.channelCharts[2].addData(number);
                break;
            default:
                break; 
        }
        // 0x0B -> data
        // 0x0E -> button
    },
    sendData: function(data) { // send data to Arduino
        if (app.connected)
        {
            function onMessageSendSucces()
            {
                console.log('Succeded to send message.');
            }
    
            function onMessageSendFailure(errorCode)
            {
                console.log('Failed to send data with error: ' + errorCode);
                app.disconnect('Failed to send data');
            }
    
            data = new Uint8Array(data);
    
            app.device.writeCharacteristic(
                redbear.rxCharacteristic,
                data,
                onMessageSendSucces,
                onMessageSendFailure
            );
        }
        else
        {
            // Disconnect and show an error message to the user.
            app.disconnect('Disconnected');
    
            // Write debug information to console
            console.log('Error - No device connected.');
        }
    },
    toggleAnalog : function() {
        if (app.analog_enabled)
        {
            app.analog_enabled = false;
            app.sendData([0xA0,0x00,0x00]);
            $('#start-button').text('Start');
        }
        else
        {
            app.analog_enabled = true;
            app.sendData([0xA0,0x01,0x00]);
            $('#start-button').text('Stop');
        }
    },
    disconnect: function(event) {
        console.log("Disconnecting")
        evothings.easyble.closeConnectedDevices();
        app.connected = false;
        app.device = null;
        app.analog_enabled = false;
        app.attacking = false;
        app.foundDevices = {};
        //clear charts
        for (var i = 0; i < app.channelCharts.length; i++) {
            app.channelCharts[i].reset()
        }
        app.showHomePage();
    },
    showHomePage: function() {
        $('#device-ul').empty();
        $.mobile.navigate( "#home" );
    },
    showConnectedPage: function() {
        $.mobile.navigate( "#connected" );
    },
    onError: function(reason) {
        console.log("ERROR: " + reason)
        alert("ERROR: " + reason); // real apps should use notification.alert
    },
    test: function() {
        /*
        app.aws.update
        */
        evothings.aws.update("Ryan AWS Test", "1.1", function(succ){
            console.log('Successfully uploaded to AWS!');
        }, function(err){
            console.log("Error uploading to AWS :(");
            console.log(err)
        })
    }
};

