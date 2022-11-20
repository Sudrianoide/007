$(function () {
  const host = location.host
  const socket = io.connect(host)
  const input = document.getElementById('input')
  const log = document.getElementById('logs')

  const startButton = document.getElementById('startButton')
  const initButton = document.getElementById('initButton')
  const actionButton = document.getElementById('actionButton')

  startButton.addEventListener('click', function (e) {
    e.preventDefault()
    initButton.style.display = 'none'
    startButton.style.display = 'none'
    gamePlay()
  })

  initButton.addEventListener('click', function (e) {
    e.preventDefault()
    init()
    initButton.style.display = 'none'
    startButton.style.display = 'block'
  })

  actionButton.addEventListener('click', function (e) {
    e.preventDefault()
    if (input.value) {
      socket.emit('debug', `${input.value.toUpperCase()}`)
      input.value = ''
    }
  })

  socket.on('connect', () => {
    document.getElementById('OKbdge').style.display = 'block'
    document.getElementById('KObdge').style.display = 'none'
  })

  socket.on('disconnect', () => {
    document.getElementById('KObdge').style.display = 'block'
    document.getElementById('OKbdge').style.display = 'none'
  })

  socket.on('debug', function (data) {
    const timestamp = new Date().toISOString()
    log.append(`${timestamp} ${data} \n`)
  })

  // https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/demos/live_video
  const URL = './tf_model/'
  let model, webcam, ctx, labelContainer, maxPredictions, result

  async function init () {
    const modelURL = URL + 'model.json'
    const metadataURL = URL + 'metadata.json'
    model = await tmPose.load(modelURL, metadataURL)
    maxPredictions = model.getTotalClasses()
    const width = 300
    const height = 300
    const flip = true
    webcam = new tmPose.Webcam(width, height, flip)
    await webcam.setup()
    await webcam.play()
    window.requestAnimationFrame(loop)

    const canvas = document.getElementById('canvas')
    canvas.width = width; canvas.height = height
    ctx = canvas.getContext('2d')
    labelContainer = document.getElementById('label-container')
    for (let i = 0; i < maxPredictions; i++) {
      labelContainer.appendChild(document.createElement('p'))
    }
  }

  async function loop (timestamp) {
    webcam.update()
    setTimeout(await predict(), 500)
    window.requestAnimationFrame(loop)
  }

  async function predict () {
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas)

    const prediction = await model.predict(posenetOutput)
    result = prediction.sort(function (a, b) {
      return b.probability - a.probability
    })[0].className
    labelContainer.childNodes[0].innerHTML = `<h2>${result}</h2>`
    drawPose(pose)
    return result
  }

  function drawPose (pose) {
    if (webcam.canvas) {
      ctx.drawImage(webcam.canvas, 0, 0)
      if (pose) {
        const minPartConfidence = 0.5
        tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx)
        tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx)
      }
    }
  }

  async function gamePlay () {
    let timerId = setTimeout(async function round () {
      socket.emit('debug', result[0])
      timerId = setTimeout(round, 1000)
    }, 1000)
  }
})
