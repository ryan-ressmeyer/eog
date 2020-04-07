
class Saccades {
    constructor(parent_id, min_delay = 800, max_delay = 1200) {
        this.parnet_id = parent_id;

        this.canvas = document.createElement('canvas');
        document.getElementById(parent_id).appendChild(this.canvas);
        this.canvas.style.width ='100%';
        this.canvas.style.height='100%';

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        ons.orientation.on('change', this.resizeCanvas.bind(this));

        this.animating = false;
        this.min_delay = min_delay;
        this.max_delay = max_delay;

        this.location = .5;
        this.delay = 0;
        this.start_time = 0;
        this.horizontal = true;
    }

    resizeCanvas() {
        // Make it visually fill the positioned parent
        // ...then set the internal size to match
        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    startAnimation() {
        this.animating = true;
        this.request_id = window.requestAnimationFrame(this.checkOrientation.bind(this));
    }

    checkOrientation(time) {
        if (ons.orientation.isLandscape()) {
            this.start_time = time;
            this.request_id = window.requestAnimationFrame(this.countdown.bind(this));
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.font = "30px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Please Hold Horizontal",  this.canvas.width/2, this.canvas.height/2);
            this.request_id = window.requestAnimationFrame(this.checkOrientation.bind(this)); 
        }
    }

    countdown(time) {
        let elapsed = Math.floor((time - this.start_time) /1000);
        if (elapsed < 5) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.font = "50px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(String(5 - elapsed), this.canvas.width/2, this.canvas.height/2);
            this.request_id = window.requestAnimationFrame(this.countdown.bind(this));
        } else {
            this.start_time = time;
            this.delay = Math.floor(this.min_delay + (this.max_delay - this.min_delay) * Math.random());
            this.request_id = window.requestAnimationFrame(this.saccades.bind(this));
        }
    }

    saccades(time) {
        let elapsed = time - this.start_time;
        
        let x = this.horizontal ? this.canvas.width * this.location : this.canvas.width / 2;
        let y = this.horizontal ? this.canvas.height/2 : this.canvas.height * this.location;


        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(x, y, 10, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
        
        if (elapsed > this.delay) {
            this.delay += Math.floor(this.min_delay + (this.max_delay - this.min_delay) * Math.random());
            let old_location = this.location;
            while (Math.abs(old_location - this.location) < .15) {
                this.location = Math.random()*.8 + .1;
            }
            if (elapsed > 7500) {
                this.horizontal = false;
            }
        }

        if (elapsed < 15000) {
            this.request_id = window.requestAnimationFrame(this.saccades.bind(this));
        } else {
            this.animating = false;
            fn.load('eng-complete.html');
        }
    }


    stopAnimation() {
        this.animating = false;
        window.cancelAnimationFrame(this.request_id);
    }
}

class SmoothPursuit {
    constructor(parent_id) {
        this.parnet_id = parent_id;

        this.canvas = document.createElement('canvas');
        document.getElementById(parent_id).appendChild(this.canvas);
        this.canvas.style.width ='100%';
        this.canvas.style.height='100%';

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        ons.orientation.on('change', this.resizeCanvas.bind(this));

        this.animating = false;

        this.start_time = 0;
        this.delay = 5000;
        this.speed = .2;
    }

    resizeCanvas() {
        // Make it visually fill the positioned parent
        // ...then set the internal size to match
        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    startAnimation() {
        this.animating = true;
        this.first_time = this.prev_time = performance.now();
        this.request_id = window.requestAnimationFrame(this.checkOrientation.bind(this));
    }

    checkOrientation(time) {
        if (ons.orientation.isLandscape()) {
            this.start_time = time;
            this.request_id = window.requestAnimationFrame(this.countdown.bind(this));
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.font = "30px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Please Hold Horizontal",  this.canvas.width/2, this.canvas.height/2);
            this.request_id = window.requestAnimationFrame(this.checkOrientation.bind(this)); 
        }
    }

    countdown(time) {
        let elapsed = Math.floor((time - this.start_time) /1000);
        if (elapsed < 5) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.font = "50px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(String(5 - elapsed), this.canvas.width/2, this.canvas.height/2);
            this.request_id = window.requestAnimationFrame(this.countdown.bind(this));
        } else {
            this.start_time = time;
            this.request_id = window.requestAnimationFrame(this.smoothPursuit.bind(this));
        }
    }

    smoothPursuit(time) {
        let elapsed = time - this.start_time;
        
        if (elapsed > this.delay && this.speed != 0) {
            if (this.speed > 0 && this.speed < .5) {
                this.start_time = time;
                elapsed = 0;
                this.speed += .1;
                this.delay = 1000/this.speed * (this.speed * 10 - 1);
            } else {
                this.speed = 0;
                elapsed = 0;
                this.start_time = time;
                this.delay = 1000;
            }
        } 

        let location = this.canvas.width * (.4 * Math.sin(elapsed / 1000 * Math.PI * 2 * this.speed) + .5);

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.ctx.arc(location, this.canvas.height/2, 10, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();

        if (this.speed == 0 && elapsed > this.delay) {
            this.animating = false;
            fn.load('eng-complete.html');
        } else {
            this.request_id = window.requestAnimationFrame(this.smoothPursuit.bind(this));
        }
    }


    stopAnimation() {
        this.animating = false;
        window.cancelAnimationFrame(this.request_id);
    }
}

class Optokinetic {
    constructor(parent_id, num_bars=5, speed=300 ) {
        this.parnet_id = parent_id;

        this.canvas = document.createElement('canvas');
        document.getElementById(parent_id).appendChild(this.canvas);
        this.canvas.style.width ='100%';
        this.canvas.style.height='100%';

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        ons.orientation.on('change', this.resizeCanvas.bind(this));

        this.num_bars = num_bars;
        this.speed = speed;
        this.animating = false;
        this.start_time = 0;
        this.prev_time = 0;
        this.offset = 0;
    }

    resizeCanvas() {
        // Make it visually fill the positioned parent
        // ...then set the internal size to match
        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }
    startAnimation() {
        this.animating = true;
        this.first_time = this.prev_time = performance.now();
        this.request_id = window.requestAnimationFrame(this.checkOrientation.bind(this));
    }

    checkOrientation(time) {
        if (ons.orientation.isLandscape()) {
            this.start_time = time;
            this.request_id = window.requestAnimationFrame(this.countdown.bind(this));
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.font = "30px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText("Please Hold Horizontal",  this.canvas.width/2, this.canvas.height/2);
            this.request_id = window.requestAnimationFrame(this.checkOrientation.bind(this)); 
        }
    }

    countdown(time) {
        let elapsed = Math.floor((time - this.start_time) /1000);
        if (elapsed < 5) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.font = "50px Arial";
            this.ctx.textAlign = "center";
            this.ctx.fillText(String(5 - elapsed), this.canvas.width/2, this.canvas.height/2);
            this.request_id = window.requestAnimationFrame(this.countdown.bind(this));
        } else {
            this.start_time = time; 
            this.prev_time = time;
            this.request_id = window.requestAnimationFrame(this.optokinetics.bind(this));
        }
    }

    optokinetics(time) {
        let elapsed = time - this.start_time;
        
        var time_diff = time - this.prev_time;
        this.prev_time = time;
        this.offset += (time_diff * this.speed / 1000) * (elapsed < 7500 ? 1 : -1);
        var width = Math.ceil(this.canvas.width / this.num_bars);
        this.offset = this.offset % width + width * (this.offset < 0);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = -1; i < this.num_bars; i++) {
            //draw bar at offset
            let x = Math.round(i * width + this.offset);
            this.ctx.fillRect(x, 0, Math.ceil(width/2), this.canvas.height);
          }
        
        if (elapsed < 15000) {
            this.request_id = window.requestAnimationFrame(this.optokinetics.bind(this));
        } else {
            this.animating = false;
            fn.load('eng-complete.html');
        }
        
    }


    stopAnimation() {
        this.animating = false;
        window.cancelAnimationFrame(this.request_id);
    }

    
}

class Chart {
    constructor(name, data, style, max_readings) {
        this.name = name;
        this.data = data;
        this.max_readings = max_readings;
        this.chart_container = document.createElement('div');
        this.chart_container.style=style;

        this.chart = new CanvasJS.Chart(this.chart_container, {
            title: {
                text: this.name
            },
            axisX : {
                title: "time",
                interval:2, 
                intervalType: "second",
            },
            axisY : {
                inlcudeZero: false
            },
            data: [{
                xValueType: "dateTime",
                type: "splineArea",
                dataPoints: this.data
            }
            ]
        });
    }

    addData(data) {
        this.data.push({
            x: Date.getTime(),
            y: data
        });
        if (num_readings > this.max_readings) {
            this.data = this.data.slice(num_readings-this.max_readings);
        }
    }

    render() {
        this.chart.CanvasJSChart().render();
    }

    reset() {
        this.data = [];
        this.render();
    }
}


(function () {
    document.addEventListener('init', (event) => {
        var page = event.target;
        switch (page.id) {
            case 'settings':
                if (app.name) {
                    document.getElementById('name-input').value = app.name
                }
                break;
            case 'saccades-page':
                fn.saccades = new Saccades('saccades-body');
                fn.saccades.startAnimation();
                break;
            case 'pursuit-page':
                fn.smooth_pursuit = new SmoothPursuit('pursuit-body');
                fn.smooth_pursuit.startAnimation();
                break;
            case 'optokinetic-page':
                fn.optokinetic = new Optokinetic('optokinetic-body');
                fn.optokinetic.startAnimation();
                break;
            default:
                console.log('Page Init with ID: ' + page.id)
                break;
        }
    }, false);

    document.addEventListener('hide', (event) => {
        var page = event.target;
        switch (page.id) {
            case 'saccades-page':
                fn.saccades.stopAnimation();
                break;
            case 'pursuit-page':
                fn.smooth_pursuit.stopAnimation();
                break;
            case 'optokinetic-page':
                fn.optokinetic.stopAnimation();
                break;
            default:
                console.log('Page Hide with ID: ' + page.id)
                break;
        }
    }, false);

    // fn for page functions: navigation, responsiveness, etc...
    window.fn = window.fn || {};

    var fn = window.fn;
    fn.chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };
    
    fn.initialize = function () {
        var nav = document.getElementById('navigator');
        nav.addEventListener('postpush', fn.postPush);
        fn.chart = null;
    }

    fn.open = function () {
        var menu = document.getElementById('menu');
        menu.open();
    };
    fn.load = function (page) {
        var nav = document.getElementById('navigator');
        var menu = document.getElementById('menu');
        nav.pushPage(page)
        menu.close();
    };

    fn.back = function (options = {}) {
        var nav = document.getElementById('navigator');
        return nav.popPage(options);
    }

    fn.home = function (options = {}) {
        var nav = document.getElementById('navigator');
        return nav.resetToPage('home.html', options);
    }

    fn.scanBLE = function () {

        var nav = document.getElementById('navigator');
        nav.pushPage('connect.html', { animation: 'lift' }).then(
            () => {
                var device_list = document.getElementById('ble-devices');
                device_list.innerHTML = '';

                var onDiscoverDevice = function (device) {
                    console.log("Found Device: " + device.name);
                    if (device.name != null) {
                        var device_dom = document.createElement('ons-list-item');

                        device_dom.innerHTML = '<span class="list-item__title">' + device.name +
                            '</span><span class="list-item__subtitle">RSSI: ' + device.rssi + '&nbsp;|&nbsp;' + device.address + '</span>';

                        device_dom.dataset.serviceUUID = device.address;
                        app.foundDevices[device.address] = device;
                        device_dom.addEventListener("click", app.connect)
                        device_list.appendChild(device_dom);
                    }
                }

                evothings.easyble.reportDeviceOnce(true);
                evothings.easyble.startScan([app.redbear.serviceUUID], onDiscoverDevice, fn.onError);
            });
    }

    fn.stopScan = function () {
        evothings.easyble.stopScan();
        fn.home().then(
            () => {
                fn.refresh();
            });
    }

    fn.onError = function (e) {
        console.log("ERROR: " + e)
        ons.notification.toast(e, { timeout: 1000, animation: 'fall' })
    }

    fn.refresh = function () {
        var nav = document.getElementById('navigator');
        if (nav.topPage.id == 'home-page') {
            var content = document.getElementById('content');
            if (app.connected) {
                content.load('home-connected.html').then(() => {
                    fn.refreshRecordingButton();
                    fn.initPreviewChart();
                    fn.home_chart.startAnimation();
                });
            } else {
                content.load('home-disconnected.html');
            }
        } else {
            console.log('Page not refreshable')
        }
    }

    fn.refreshRecordingButton = function () {
        var button = document.getElementById('recording-button');
        if (app.recording) {
            button.innerHTML = "Recording";
            button.style.backgroundColor = 'green';
        } else {
            button.innerHTML = "Not Recording";
            button.style.backgroundColor = 'red';
        }
    }

    fn.initPreviewChart = function () {
        fn.home_chart = {
            max_readings: 100,
            animating: false,
            chart: new CanvasJS.Chart('data-preview', {
                title: {
                    text: 'Data Preview'
                },
                backgroundColor: '#eceff1',
                axisX: {
                    title: "time",
                    interval: 2,
                    intervalType: "second",
                    labelAngle: -45
                },
                axisY: {
                    inlcudeZero: false
                },
                data: [{
                    name: 'Channel 1',
                    xValueType: "dateTime",
                    markerSize: 0,
                    type: "line",
                    dataPoints: []
                },
                {
                    name: 'Channel 2',
                    xValueType: "dateTime",
                    markerSize: 0,
                    type: "line",
                    dataPoints: []
                },
                {
                    name: 'Channel 3',
                    xValueType: "dateTime",
                    markerSize: 0,
                    type: "line",
                    dataPoints: []
                }
                ]
            }),
            updateData: function () {
                for (let i = 0; i < 3; i++) {
                    let num_readings = app.data[i].length;
                    if (num_readings > fn.home_chart.max_readings) {
                        fn.home_chart.chart.options.data[i].dataPoints = app.data[i].slice(num_readings - this.max_readings);
                    } else {
                        fn.home_chart.chart.options.data[i].dataPoints = app.data[i]
                    }
                }
            },
            updateChart: function () {
                fn.home_chart.updateData();
                fn.home_chart.chart.render();
            },
            startAnimation: function (interval = 20) {
                fn.home_chart.animating = true;
                fn.home_chart.timeout_id = window.setInterval(fn.home_chart.updateChart, interval);
            },
            stopAnimation: function () {
                fn.home_chart.animating = false;
                window.clearInterval(fn.home_chart.timeout_id);
            }
        }
    }

    // app is for data and processing. BLE, AWS, data storage, etc...
    window.app = window.app || {};

    var app = window.app;

    app.redbear = {
        serviceUUID: "713D0000-503E-4C75-BA94-3148F18D941E",
        txCharacteristic: "713D0002-503E-4C75-BA94-3148F18D941E",
        rxCharacteristic: "713D0003-503E-4C75-BA94-3148F18D941E",
        txDescriptor: "00002902-0000-1000-8000-00805F9B34FB"
    };

    app.connected = false;

    app.initialize = function () {
        app.connected = false;
        app.device = null;
        app.recording = false;
        app.attacking = false;
        app.foundDevices = {};

        app.data = [[],[],[]];
        // keys: name 
        app.storage = window.localStorage;
    };
    
    Object.defineProperty(app, 'name', {
        get() {
            return app.storage['name']
        },
        set(value){
            app.storage['name'] = value;
        }
    });
    
    app.onData = function (data) {
        var raw_input = new Uint8Array(data);
        var type = raw_input[0];
        var number = (raw_input[1] << 8) | raw_input[2];
        console.log(number)
        
        switch(type) {
            case 0x0B:
                app.data[0].push({
                    x: moment(),
                    y: number
                });
                break; 
            case 0x0E:
                app.data[1].push({
                    x: moment(),
                    y: number
                });
                break;
            case 0x0F:
                app.data[2].push({
                    x: moment(),
                    y: number
                });
                break;
            default:
                break; 
        }

        
        evothings.aws.update(app.name+'_'+type.toFixed(0), number.toFixed(1), function(succ){
            console.log('Successfully uploaded '+ succ +' to AWS!');
        }, function(err){
            console.log("Error uploading to AWS :(");
            console.log(err)
        });
        
        // 0x0B -> data
        // 0x0E -> button
    }

    app.sendData = function (data) { // send data to Arduino
        if (app.connected) {
            function onMessageSendSucces() {
                console.log('Succeded to send message.');
            }

            function onMessageSendFailure(errorCode) {
                console.log('Failed to send data with error: ' + errorCode);
                app.disconnect('Failed to send data');
            }

            data = new Uint8Array(data);

            app.device.writeCharacteristic(
                app.redbear.rxCharacteristic,
                data,
                onMessageSendSucces,
                onMessageSendFailure
            );
        }
        else {
            // Disconnect and show an error message to the user.
            app.disconnect('Disconnected');

            // Write debug information to console
            console.log('Error - No device connected.');
        }
    }

    app.toggleRecording = function () {
        if (app.recording) {
            app.recording = false;
            app.sendData([0xA0, 0x00, 0x00]);
        }
        else {
            app.recording = true;
            app.sendData([0xA0, 0x01, 0x00]);
        }
        fn.refreshRecordingButton();
    }

    app.connect = function (e) {
        fn.stopScan();
        var loading = document.createElement('ons-progress-circular');
        loading.indeterminate = true;
        document.getElementById('home-content').appendChild(loading);

        var deviceUUID = e.currentTarget.dataset.serviceUUID;

        console.log(deviceUUID);
        console.log(app.foundDevices[deviceUUID]);

        function onConnect(device) {
            function onServiceSuccess(device) {
                console.log('Connected to ' + device.name);
                // Helpful for showing services and descriptor UUIDs 
                //$.each(device.__uuidMap, function(key, data) {
                //    console.log(key + ' -> ' + data);
                //});
                app.connected = true;
                app.device = device;

                app.device.writeDescriptor(
                    app.redbear.txCharacteristic,
                    app.redbear.txDescriptor,
                    new Uint8Array([1, 0]),
                    () => {
                        ons.notification.toast('Successfully Connected', { timeout: 1000, animation: 'fall' });

                    },
                    fn.onError
                );

                app.device.enableNotification(
                    app.redbear.txCharacteristic,
                    app.onData,
                    fn.onError
                );
                // end
                loading.parentNode.removeChild(loading);
                fn.refresh();
                app.foundDevices = {};
            };

            // Connect to the appropriate BLE service
            device.readServices(
                [app.redbear.serviceUUID],
                onServiceSuccess,
                fn.onError
            );
        };

        app.foundDevices[deviceUUID].connect(onConnect, fn.onError);

    }

    app.disconnect = function () {
        console.log("Disconnecting")
        evothings.easyble.closeConnectedDevices();
        app.connected = false;
        app.device = null;
        app.recording = false;
        app.attacking = false;
        /*
        //clear charts
        for (var i = 0; i < app.channelCharts.length; i++) {
            app.channelCharts[i].reset()
        }
        app.showHomePage();
        */
        fn.refresh();
    }

    app.awsTest = function () {
        /*
        app.aws.update
        */
        evothings.aws.update("Ryan AWS Test", "1.1", function (succ) {
            console.log('Successfully uploaded to AWS!');
        }, function (err) {
            console.log("Error uploading to AWS :(");
            console.log(err)
        })
    }

    app.save = () => {
        app.name = document.getElementById('name-input').value
    }

    ons.ready(function () {
        //on initialized function
        evothings.aws.initialize(evothings.aws.config);
        app.initialize();
        fn.initialize();
        console.log("Onsen UI is ready!");
    });

})();


if (ons.platform.isIPhoneX()) {
    document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
    document.documentElement.setAttribute('onsflag-iphonex-landscape', '');
}