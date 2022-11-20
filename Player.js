class Player {
  constructor () {
    this.balls = 0
    this.moves = []
    this.blocks = 0
  }

  addMove (move) {
    return this.moves.push(move)
  }

  addBall () {
    this.balls += 1
    return this.balls
  }

  addBlock () {
    this.blocks += 1
    return this.blocks
  }

  removeBall () {
    this.balls -= 1
    return this.balls
  }

  removeBlock () {
    this.blocks = 0
    return this.blocks
  }

  clearMoves () {
    this.moves = []
    return this.moves
  }

  blocks () {
    return this.moves.filter(elt => elt.includes('B')).length
    /**
     * @todo Changer et mettre le nombre des dernier bloquage qui se suivent
     */
  }

  lastMove () {
    return this.moves[this.moves.length - 1]
  }
}
exports.Player = Player
