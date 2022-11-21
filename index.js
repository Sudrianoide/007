const app = require('express')()
const express = require('express')
const http = require('http').Server(app)
const io = require('socket.io')(http)
const config = require('config');
const port = process.env.PORT || config.get('server.port')
const { SerialPort } = require('serialport')
const { MockBinding } = require('@serialport/binding-mock')
const log = require('node-color-log')
const open = require('open')
const { Player } = require('./Player')
const { predict } = require('./predict');
const { tunnel } = require('./tunnel');

let usbserial = config.get('arduino.serialPort')

const isMock = process.env.MOCK || false

let arduino
let adverse, ia, playing

if (isMock) {
  usbserial = '/dev/FAKEPORT'
  MockBinding.createPort(usbserial, { echo: true, record: true })
  arduino = new SerialPort({ binding: MockBinding, path: usbserial, baudRate: 9600 })
  log.info('Mocking Arduino port')
} else {
  arduino = new SerialPort({ path: usbserial, baudRate: 9600 })
}

arduino.on('open', (info) => {
  log.info('Listening on serial port: ', usbserial)
})

arduino.on('error', (err) => {
  log.error('Error from Arduino: ', err.message)
  io.emit('debug', `Error from Arduino: ${err.toString()}`)
})

arduino.on('data', (data) => {
  debug(`Data from Arduino: ${data.toString()}`)
})

io.on('connection', (socket) => {
  log.info('Browser connected')

  socket.on('debug', msg => {
    debug('Data from browser: ', msg)
    arduino.write(msg)
  })

  socket.on('state', (state) => {
    switch (state) {
      case 'start':
        init()
        debug(state)
        break

      case 'stop':
        init()
        debug(state)
        break

      default:
        break
    }
  })

  socket.on('pose', async (pose) => {
    debug(`Pose from browser: ${pose}`)

    adverse.addMove(pose)

    adverse, ia, playing = await predict(adverse, ia)
    if (playing) {
      const prediction = ia.lastMove()
      debug(adverse.moves)
      debug(ia.moves)
      debug(`Pose to do: ${prediction}`)
      arduino.write(prediction[0])
    } else {
      debug('Mort')
      io.emit('state', 'stoped')
      init()
    }
  })
})

app.use(express.static(`${__dirname}/public`))


http.listen(port, () => {
  log.info(`Socket.IO server running at http://localhost:${port}/`)
  !isMock ? open(`http://localhost:${port}/`) : null
  tunnel(port)
})

function debug(param) {
  log.debug(param)
  io.emit('debug', param)
}

function init() {
  pose = '0'
  arduino.write(pose)
  adverse = new Player()
  ia = new Player()
  ia.addMove('C')
}

init()
