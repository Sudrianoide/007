const choice = (choices) => {
  const index = Math.floor(Math.random() * choices.length)
  return choices[index]
}
const isMoveValid = (player) => {
  return !(
    (player.lastMove() === 'T' && player.balls === 0) ||
    (player.blocks > 3))
}
const predict = (adverse, ia) => {
  let playing

  if (isMoveValid(adverse)) {
    playing = true
  } else {
    playing = false
  }

  /**
   * @todo Verifier avant de traiter si le mouvement est autorisé
   */
  if (adverse.lastMove() !== 'B' && adverse.moves.length > 2) {
    if (adverse.moves[adverse.moves.length - 2] === 'B') {
      adverse.removeBlock()
    }
  }

  if (ia.lastMove() === 'C') {
    ia.addBall()
    if (adverse.lastMove() === 'C') {
      adverse.addBall()
      ia.addMove('B1')
    } else if (adverse.lastMove() === 'B') {
      if (adverse.blocks === 0) {
        ia.addMove(choice(['T', 'B1']))
      } else if (adverse.blocks === 1) {
        ia.addMove(choice(['T', 'B1']))
      } else if (adverse.blocks === 2) {
        if (adverse.balls === 0) {
          ia.addMove('T')
        } else {
          ia.addMove('B1')
        }
      }
    } else if (adverse.lastMove() === 'T') {
      ia.addMove('M')
      // Fin du jeu IA perd
      playing = false
    }
  } else if (ia.lastMove() === 'T') {
    if (adverse.lastMove() === 'C') {
      adverse.addMove('M')
      // Fin du jeu IA gagne
      playing = false
    } else if (adverse.lastMove() === 'B') {
      adverse.addBlock()
      if (adverse.blocks === 0) {
        if (ia.balls < 0) {
          ia.addMove('C')
        } else {
          ia.addMove('B0')
        }
      } else if (adverse.blocks === 1) {
        if (ia.balls < 0) {
          ia.addMove('C')
        } else {
          ia.addMove('B0')
        }
      } else if (adverse.blocks === 2) {
        if (adverse.balls > 0) {
          ia.addMove('B0')
        } else {
          ia.addMove('C')
        }
      }
    } else if (adverse.lastMove() === 'T') {
      adverse.removeBall()
      playing = false
      /**
       * T & T Fin du jeu égalité
       */
    }

    ia.removeBall()
    ia.addMove('B0')
  } else if (ia.lastMove() === 'B0') {
    ia.addBlock()
    // if (ia.blocks === 0) {
    //   ia.addMove(choice(['C', 'B0']))
    // } else if (ia.blocks === 1) {
    //   ia.addMove(choice(['C', 'B0']))
    // } else if (ia.blocks === 2) {
    //   ia.addMove('C');
    // }

    if (ia.blocks !== 3) {
      if (adverse.lastMove() === 'C') {
        ia.addMove('B0')
      } else if (adverse.lastMove() === 'B') {
        if (adverse.blocks === 0) {
          ia.addMove(choice(['C', 'B0']))
        } else if (adverse.blocks === 1) {
          ia.addMove(choice(['C', 'B0']))
        } else if (adverse.blocks === 2) {
          ia.addMove('C')
        }
      } else if (adverse.lastMove() === 'T') {
        ia.addMove('C')
      }
    }
  } else if (ia.lastMove() === 'B1') {
    ia.addBlock()
    // if (ia.blocks === 0) {
    //   // ViderPile(Actions);
    //   // Empiller(Actions, 'B');
    // } else if (ia.blocks === 1) {
    //   // Empiller(Actions, 'B');
    // } else if (ia.blocks === 2) {
    //   ia.addMove('T');

    // }

    if (ia.blocks < 3) {
      if (adverse.lastMove() === 'C') {
        ia.addMove('B1')
      } else if (adverse.lastMove() === 'B') {
        if (adverse.blocks === 0) {
          ia.addMove(choice(['T', 'B1']))
        } else if (adverse.blocks === 1) {
          ia.addMove(choice(['T', 'B1']))
        } else if (adverse.blocks === 2) {
          ia.addMove('T')
          ia.removeBlock()
        }
      } else if (adverse.lastMove() === 'T') {
        ia.addMove(choice(['T', 'B1']))
      }
    } else {
      ia.addMove('T')
      ia.removeBlock()
    }
  }
  return adverse, ia, playing
}

exports.predict = predict
