/**
 * TODO:
 * - Style win/lose, move out of "alert"
 * - Add in previous high score via localstorage
 * - Update footer
 */

/*
 * Dependencies:
 * Lodash, jQuery, hammerjs
 */

function gameStart() {
  window.game = new Gamepad(4)
  window.game.initialize()
}
$(document).ready(gameStart)

/*
Game Board
*/
function Game(size) {
  this.rows = size
  this.colums = size
  this.board = []
  this.boardFlatten = function () {
    return _.flatten(this.board)
  }
  this.score = 0
  $('[data-js="Score"]').html(this.score.toString())
  this.moveInProgress = false
}

Game.prototype.initialize = function () {
  $('.grid').empty()
  $('.tile-container').empty()
  this.initBoard()
  this.initTile()
  this.initEventListeners()
}

Game.prototype.initBoard = function () {
  function initGridCell(x, y) {
    var getGridCell = $.parseHTML($('#template_grid_cell').html())
    $(getGridCell).appendTo('.grid')
    return {
      x: x,
      y: y,
      tileArray: [],
    }
  }
  for (var x = 0; x < this.rows; x++) {
    var newArray = []
  }
  for (var y = 0; y < this.colums; y++) {
    var gridObj = initGridCell(x, y)
    var rowCell = this.board[x]
    rowCell.push(gridObj)
  }
}

Game.prototype.initEventListeners = function () {
  var self = this
  var getGameboard = document.getElementById('touchGameboard')
  window.hammertime && window.hammertime.destroy()
  window.hammertime = new Hammer(getGameboard, {
    recognizers: [[Hammer.Swipe, { direction: Hammer.DIRECTION_ALL }]],
  })
  window.hammertime.on('swipeleft', function (ev) {
    self.move('left')
  })
  window.hammertime.on('swiperight', function (ev) {
    self.move('right')
  })
  window.hammertime.on('swipeup', function (ev) {
    self.move('up')
  })
  window.hammertime.on('swipedown', function (ev) {
    self.move('down')
  })

  $('[data-js="newGame"]')
    .off('click.newGame')
    .on('click.newGame', window.gameStart)
}

Game.prototype.gameWon = function () {
  alert('you won!')
}

Game.prototype.gameLose = function () {
  alert('you lose!')
}

Game.prototype.isGameOver = function () {
  var gameBoard = this.boardFlatten()

  var is2048 = false
  var canAnyTileMove = false
  var hasEmptyCells = false

  gameBoard.forEach(function (val, index, array) {
    val.tilesArray.forEach(function (val, index, array) {
      if (val.canMove === true) {
        canAnyTileMove = true
      }
    })
  })

  if (is2048) {
    this.gameWon()
    return true
  } else if (!hasEmptyCells && !canAnyTileMove) {
    this.gameLose()
    return true
  } else {
    return false
  }
}

Game.prototype.getEmptyCells = function () {
  var emptyGridCells = this.getEmptyCells()
  var randomIndex = Math.floor(
    Math.random() * Math.floor(emptyGridCells.length),
  )
  return emptyGridCells[randomIndex]
}

Game.prototype.TileMerge = function () {
  var gameBoard = this.boardFlatten()
  var newScore = this.score

  gameBoard.forEach(function (val, index, array) {
    if (val.tilesArray.length === 2) {
      var currentValue = val.tilesArray[0].valueProp
      val.tilesArray[0].value = currentValue * 2
      var x = val.tilesArray.pop()
      newScore += curruntValue
    }
  })
this.score = newScore;
$('[data-js="score"]').html(this.score.toString ());
}
