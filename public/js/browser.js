$(function () {
    var host = location.host
    var socket = io.connect(host);
    var input = document.getElementById('input');
    var log = document.getElementById('logs')
    var state = 'stopped'

    var startButton = document.getElementById('startButton')
    var initButton = document.getElementById('initButton')
    var stopButton = document.getElementById('stopButton')
    var poseButton = document.getElementById('poseButton')
    var actionButton = document.getElementById('actionButton')

    startButton.addEventListener('click', async function (e) {
        e.preventDefault();
        gamePlay()
    });

    initButton.addEventListener('click', function (e) {
        e.preventDefault();
        init()
        initButton.style.display = 'none';
        startButton.style.display = 'block';
    });

    actionButton.addEventListener('click', function (e) {
        e.preventDefault();
        if (input.value) {
            socket.emit('debug', `${input.value}`);
            input.value = '';
        }
    });

    poseButton.addEventListener('click', function (e) {
        e.preventDefault();
        if (input.value) {
            socket.emit('pose', `${input.value}`);
            input.value = '';
        }
    });

    stopButton.addEventListener('click', function (e) {
        e.preventDefault();
        socket.emit('state', 'start');
        state = 'stopped'
    });

    socket.on("connect", () => {
        document.getElementById('OKbdge').style.display = 'block';
        document.getElementById('KObdge').style.display = 'none';
    });

    socket.on("disconnect", () => {
        document.getElementById('KObdge').style.display = 'block';
        document.getElementById('OKbdge').style.display = 'none';
    });

    socket.on('debug', function (data) {
        var timestamp = new Date().toISOString()
        log.append(`${timestamp} ${data} \n`)
    });
    socket.on('state', function (data) {
        if (data == 'stoped') {
            state = 'stopped'
            log.append(`Finished`)
        }
    });

    // https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/demos/live_video
    const URL = "./tf_model/";
    let model, webcam, ctx, labelContainer, maxPredictions, result;

    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmPose.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        const width = 300;
        const height = 300;
        const flip = true;
        webcam = new tmPose.Webcam(width, height, flip);
        await webcam.setup();
        await webcam.play();
        window.requestAnimationFrame(loop);

        const canvas = document.getElementById("canvas");
        canvas.width = width; canvas.height = height;
        ctx = canvas.getContext("2d");
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("p"));
        }
    }

    async function loop(timestamp) {
        webcam.update();
        await predict();
        window.requestAnimationFrame(loop);
    }

    async function predict() {
        let { pose, posenetOutput } = await model.estimatePose(webcam.canvas);

        let prediction = await model.predict(posenetOutput);
        result = prediction.sort(function (a, b) {
            return b.probability - a.probability;
        })[0].className
        labelContainer.childNodes[0].innerHTML = `<h2>${result}</h2>`
        drawPose(pose);
        return result
    }

    function drawPose(pose) {
        if (webcam.canvas) {
            ctx.drawImage(webcam.canvas, 0, 0);
            if (pose) {
                const minPartConfidence = 0.5;
                tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
                tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
            }
        }
    }

    function countdown() {
        return new Promise(resolve => {
            const clock = document.getElementById("countdown")
            clock.style.display = 'none';
            var time = 3
            let timeinterval = setInterval(() => {
                clock.innerHTML = time
                clock.style.display = 'block';
                if (time < 0) {
                    clearInterval(timeinterval);
                    clock.style.display = 'none';
                    resolve();
                }
                time--
            }, 1000);
        });
    }

    async function gamePlay() {
        await countdown();
        socket.emit('state', 'start')
        state = 'started'
        socket.emit('pose', result[0])

        let timerId = setTimeout(async function round() {
            await countdown().then(
                socket.emit('pose', result[0])
            )
            if (state == 'started') {
                timerId = setTimeout(round, 2000);
            } else {
                setTimeout(displayEnd, 3000)
                function displayEnd() {
                    document.getElementById('endDisplay').style.display = 'block'
                    setTimeout(hideEnd, 5000)
                    function hideEnd() {
                        document.getElementById('endDisplay').style.display = 'none'
                    }
                }
            }
        }, 2000);


        // let roundInterval = setInterval(async () => {



        // }, 2000);
    }
})