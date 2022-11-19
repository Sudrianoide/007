class Player {
  constructor() {
    this.balls = 0;
    this.moves = [];
    this.blocks = 0;
  }
  addMove(move) {
    return this.moves.push(move);
  }
  addBall() {
    return this.balls += 1;
  }
  addBlock() {
    return this.blocks += 1;
  }
  removeBall() {
    return this.balls -= 1;
  }
  removeBlock() {
    return this.blocks = 0;
  }
  clearMoves() {
    return this.moves = [];
  }
  blocks() {
    return this.moves.filter(elt => elt.includes('B')).length;
    /**
     * @todo Changer et mettre le nombre des dernier bloquage qui se suivent
     */
  }
  lastMove() {
    return this.moves[this.moves.length - 1];
  }
}
exports.Player = Player;
