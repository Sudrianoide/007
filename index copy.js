const app = require('express')();
const express = require('express')
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3001;
const { SerialPort } = require('serialport')
const { MockBinding } = require('@serialport/binding-mock')
const log = require('node-color-log');
const open = require('open')


// var usbserial = '/dev/ttyUSB1';
var usbserial = '/dev/ttyACM0';

let mock = process.env.MOCK || false;

let arduino;
if (mock) {
  usbserial = '/dev/FAKEPORT'
  MockBinding.createPort(usbserial, { echo: true, record: true })
  arduino = new SerialPort({ binding: MockBinding, path: usbserial, baudRate: 9600 })
  log.info('Mocking Arduino port')
} else {
  arduino = new SerialPort({ path: usbserial, baudRate: 9600 })
}

arduino.on('open', (info) => {
  log.info('Listening on serial port: ', usbserial);
});

arduino.on('error', (err) => {
  log.error('Error from Arduino: ', err.message)
  io.emit('debug', `Error from Arduino: ${err.toString()}`);
});

arduino.on('data', (data) => {
  debug(`Data from Arduino: ${data.toString()}`)
});

io.on('connection', (socket) => {
  log.info('Browser connected');

  socket.on('debug', msg => {
    debug('Data from browser: ', msg);
    arduino.write(msg)
  });

  socket.on('state', (state) => {
    console.log(state);
    switch (state) {
      case 'start':
        pose = '0';
        arduino.write(pose);
        init()
        debug(state);
        break;

      case 'stop':
        pose = '0';
        arduino.write(pose);
        init();
        debug(state);
        break;

      default:
        break;
    }
  })

  socket.on('pose', async (pose) => {
    debug(`Pose from browser: ${pose}`)
    let prediction = await predict(pose)
    if (prediction != 'M') {
      debug(`Pose to do: ${prediction}`)
      arduino.write(prediction[0])
    } else {
      debug('Mort')
      init()
    }
  })
});

app.use(express.static(__dirname + '/public'));

http.listen(port, () => {
  log.info(`Socket.IO server running at http://localhost:${port}/`);
  !mock ? open(`http://localhost:${port}/`) : null
});

function debug(param) {
  log.debug(param)
  io.emit('debug', param)
}

function init() {
  Etat = "C";
  Etat_adverse = "";
  Balle = 0;
  Balle_adverse = 0;
  Actions = new NouvellePile();
  Actions_adversaire = new NouvellePile();
}


//************************************** */
// IA from Python
//************************************** */



function choice(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

var Actions, Actions_adversaire, Balle, Balle_adverse, Etat, Etat_adverse, act_adv, nbr_b, nbr_b_adv;

function NouvellePile() {
  return [];
}

function EstVide(p) {
  return p === [];
}

function Empiller(p, elt) {
  p.push(elt);
}

function Depiller(p) {
  p.pop();
}

function ViderPile(p) {
  for (var i = 0, _pj_a = p.length; i < _pj_a; i += 1) {
    p.pop();
  }
}

function LireSommet(p) {
  return p[p.length - 1];
}

// Etat = "C";
// Etat_adverse = "";
// Balle = 0;
// Balle_adverse = 0;
// Actions = new NouvellePile();
// Actions_adversaire = new NouvellePile();

function Nombre_Bloquage(p) {
  var compteur;
  compteur = 0;
  for (var elt, _pj_c = 0, _pj_a = p, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
    elt = _pj_a[_pj_c];
    if (elt === "B") {
      compteur += 1;
    }
  }
  return compteur;
}

function predict(Action_adverse) {
  if (Etat !== "M" && Etat_adverse !== "M") {
    if (Etat === "C") {
      if (new EstVide(Actions) === true) {
        new Empiller(Actions, "C");
      } else {
        new ViderPile(Actions);
        new Empiller(Actions, "C");
      }

      Balle += 1;
      act_adv = Action_adverse;

      if (act_adv === "C") {
        new ViderPile(Actions_adversaire);
        new Empiller(Actions_adversaire, "C");
        Balle_adverse += 1;
        Etat = "B1";
      } else {
        if (act_adv === "B") {
          nbr_b_adv = new Nombre_Bloquage(Actions_adversaire);

          if (nbr_b_adv === 0) {
            new ViderPile(Actions_adversaire);
            new Empiller(Actions_adversaire, "B");
            Etat = choice(["T", "B1"]);
          } else {
            if (nbr_b_adv === 1) {
              new Empiller(Actions_adversaire, "B");
              Etat = choice(["T", "B1"]);
            } else {
              if (nbr_b_adv === 2) {
                new Empiller(Actions_adversaire, "B");

                if (Balle_adverse === 0) {
                  Etat = "T";
                } else {
                  Etat = "B1";
                }
              }
            }
          }
        } else {
          if (act_adv === "T") {
            new ViderPile(Actions_adversaire);
            new Empiller(Actions_adversaire, "T");
            Etat = "M";
          }
        }
      }
    } else {
      if (Etat === "T") {
        new ViderPile(Actions);
        new Empiller(Actions, "T");
        act_adv = Action_adverse;

        if (act_adv === "C") {
          new ViderPile(Actions_adversaire);
          new Empiller(Actions_adversaire, "C");
          Etat_adverse = "M";
        } else {
          if (act_adv === "B") {
            nbr_b_adv = new Nombre_Bloquage(Actions_adversaire);

            if (nbr_b_adv === 0) {
              new ViderPile(Actions_adversaire);
              new Empiller(Actions_adversaire, "B");
            } else {
              if (nbr_b_adv === 1 || nbr_b_adv === 2) {
                new Empiller(Actions_adversaire, "B");
              }
            }
          } else {
            if (act_adv === "T") {
              new ViderPile(Actions_adversaire);
              new Empiller(Actions_adversaire, "T");
              Balle_adverse -= 1;
            }
          }
        }

        Balle -= 1;
        Etat = "B0";
      } else {
        if (Etat === "B0") {
          nbr_b = new Nombre_Bloquage(Actions);

          if (nbr_b === 0) {
            new ViderPile(Actions);
            new Empiller(Actions, "B");
          } else {
            if (nbr_b === 1) {
              new Empiller(Actions, "B");
            } else {
              if (nbr_b === 2) {
                new Empiller(Actions, "B");
                Etat = "C";
              }
            }
          }

          if (nbr_b !== 3) {
            act_adv = Action_adverse;

            if (act_adv === "C") {
              new ViderPile(Actions_adversaire);
              new Empiller(Actions_adversaire, "C");
              Etat = "B0";
            } else {
              if (act_adv === "B") {
                nbr_b_adv = new Nombre_Bloquage(Actions_adversaire);

                if (nbr_b_adv === 0) {
                  new ViderPile(Actions_adversaire);
                  new Empiller(Actions_adversaire, "B");
                  Etat = choice(["C", "B0"]);
                } else {
                  if (nbr_b_adv === 1) {
                    new Empiller(Actions_adversaire, "B");
                    Etat = choice(["C", "B0"]);
                  } else {
                    if (nbr_b_adv === 2) {
                      new Empiller(Actions_adversaire, "B");
                      Etat = "C";
                    }
                  }
                }
              } else {
                if (act_adv === "T") {
                  new ViderPile(Actions_adversaire);
                  new Empiller(Actions_adversaire, "T");
                  Etat = "C";
                }
              }
            }
          }
        } else {
          if (Etat === "B1") {
            nbr_b = new Nombre_Bloquage(Actions);

            if (nbr_b === 0) {
              new ViderPile(Actions);
              new Empiller(Actions, "B");
            } else {
              if (nbr_b === 1) {
                new Empiller(Actions, "B");
              } else {
                if (nbr_b === 2) {
                  new Empiller(Actions, "B");
                  Etat = "T";
                }
              }
            }

            if (nbr_b !== 3) {
              act_adv = Action_adverse;

              if (act_adv === "C") {
                new ViderPile(Actions_adversaire);
                new Empiller(Actions_adversaire, "C");
                Etat = "B1";
              } else {
                if (act_adv === "B") {
                  nbr_b_adv = new Nombre_Bloquage(Actions_adversaire);

                  if (nbr_b_adv === 0) {
                    new ViderPile(Actions_adversaire);
                    new Empiller(Actions_adversaire, "B");
                    Etat = choice(["T", "B1"]);
                  } else {
                    if (nbr_b_adv === 1) {
                      new Empiller(Actions_adversaire, "B");
                      Etat = choice(["T", "B1"]);
                    } else {
                      if (nbr_b_adv === 2) {
                        new Empiller(Actions_adversaire, "B");
                        Etat = "T";
                      }
                    }
                  }
                } else {
                  if (act_adv === "T") {
                    new ViderPile(Actions_adversaire);
                    new Empiller(Actions_adversaire, "T");
                    Etat = choice(["T", "B1"]);
                  }
                }
              }
            }
          }
        }
      }
    }
    return (Etat);
  } else {
    return 'M'
  }
} 