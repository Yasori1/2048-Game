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
  this.score = newScore
  $('[data-js="score"]').html(this.score.toString())
}

Game.prototype.moveAnimations = function () {
  var self = this
  var promiseArray = []

  if (this.moveInProgress) {
    return false
  }

  this.moveInProgress = true
  gameBoard.forEach(function (val, index, array) {
    val.tilesArray.forEach(function (val, index, array) {
      promiseArray.push(val.animetePosition())
    })
  })
  $.when.apply($, promiseArray).done(function () {
    self.moveInProgress = false
    self.TileMerge()
    self.initTile()
  })
}

Game.prototype.move = function (getDirection) {
  var gameBoard
  var direction = getDirection.toLowerCase()
  var hasAnyTileMoved = false
  if (this.moveInProgress) {
    return false
  }
  if (direction === 'up') {
    gameBoard = _.orderBy(this.boardFlatten(), 'y', 'asc')
  } else if (direction === 'right') {
    gameBoard = _.orderBy(this.boardFlatten(), 'x', 'desc')
  } else if (direction === 'down') {
    gameBoard = _.orderBy(this.boardFlatten(), 'y', 'desc')
  } else if (direction === 'left') {
    gameBoard = _.orderBy(this.boardFlatten(), 'y', 'asc')
  }

  gameBoard.forEach(function (val, index, array) {
    val.tilesArray.length
      ? val.tilesArray.forEach(function (val) {
          if (val.move(direction, true)) {
            hasAnyTileMoved = true
            val.move(direction)
          }
        })
      : false
  })
  hasAnyTileMoved ? this.moveAnimations(gameBoard) : false
}

function Tile(x, y, game) {
  this.game = game
  this.el
  this.x = x
  this.y = y
  this.valueProp = 2
  Object.defineProperties(this, {
    value: {
      get: function () {
        return this.valueProp
      },
      set: function (val) {
        this.valueProp = val
        this.el
          .find('.tile_number')
          .html(this.valueProp)
          .attr('data-value', val)
      },
    },
  })
  // can move flag
  this.canMove = false
  // initialize
  this.initialize()
}

Tile.prototype.initialize = function () {
  var getTile = $.parseHTML($('#template_tile').html())
  this.el = $(getTile)
  this.el.find('.tile_number').html(this.valueProp).attr('data-value', 2)
  this.setPosition(this.x, this.y)
  this.animetePosition(true)
  this.el.appendTo('.tile-container')
}

Tile.prototype.setPosition = function (getX, getY) {
  this.x = getX
  this.y = getY
  this.game.board[getX][getY].tilesArray.push(this)
}

Tile.prototype.removeOldPosition = function (getX, getY) {
  this.game.board[getX][getY].tilesArray.pop()
}

Tile.prototype.animetePosition = function (initializeFlag) {
  var self = this
  var fromleft = this.x * (100 / this.game.rows)
  var fromtop = this.y * (100 / this.game.colums)

  var animationDuration = 175
  var getpromise = $.Defferred()

  if (initializeFlag) {
    this.el.addClass('initialize')
  } else {
    this.el.removeClass('initialize')
  }
  function resolvePromise() {
    getpromise.resolve()
    self.el.removeClass('animate')
    self.el.removeClass('initialize')
  }
  function setPosition() {
    self.el.addClass('animate')
    self.el.attr({
      'data-x': fromleft,
      'data-y': fromtop,
    })
  }
  if (initializeFlag) {
    setPosition()
    window.setTimeout(resolvePromise, animationDuration + 50)
  } else {
    setPosition()
    window.setTimeout(resolvePromise, animationDuration)
  }
  return getpromise
}

Tile.prototype.moveCheck = function () {
  if (
    this.move('up', true) ||
    this.move('right', true) ||
    this.move('down', true) ||
    this.move('left', true)
  ) {
    this.canMove = true
    return true
  } else {
    this.canMove = false
    return false
  }
}

Tile.prototype.move = function (getDirection, initializeFlag) {
  var checkFlag = checkFlag ? true : false
  var direction = getDirection.toLowerCase()
  var getX = this.x
  var getY = this.y

  var getNext
  var isNextMatch
  var isNextEmpty
  var nextPositionArray = []

  if (direction === 'up') {
    getNext = this.y > 0 ? this.game.board[this.x][this.y - 1] : false
    nextPositionArray.push(this.x, this.y - 1)
  } else if (direction === 'right') {
    getNext = this.x < 3 ? this.game.board[this.x + 1][this.y] : false
    nextPositionArray.push(this.x + 1, this.y)
  } else if (direction === 'down') {
    getNext = this.y < 3 ? this.game.board[this.x][this.y + 1] : false
    nextPositionArray.push(this.x, this.y + 1)
  } else if (direction === 'left') {
    getNext = this.x > 0 ? this.game.board[this.x - 1][this.y] : false
    nextPositionArray.push(this.x - 1, this.y)
  }
  isNextMatch =
    getNext &&
    getNext.tileArray.length === 1 &&
    getNext.tilesArray[0].valueProp === this.valueProp
  isNextEmpty = getNext && getNext.tileArray.length === 0

  if (checkFlag) {
    return isNextEmpty || isNextMatch ? true : false
  } else if (isNextEmpty || isNextMatch) {
    this.setPosition(nextPositionArray[0], nextPositionArray[1])
    this.removeOldPosition(getX, getY)
    if (isNextMatch) {
      this.move(direction)
    }
  }
}
