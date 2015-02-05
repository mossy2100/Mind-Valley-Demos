/**
 * @file
 * JavaScript/jQuery for the Game of Life demo.
 */

(function ($) {

  var gameOfLife = {

    /**
     * Reset the board.
     */
    initBoard: function () {
      // Calculate and intialise the board size.
      var gridWidth = gameOfLife.board.width(),
        gridTop = gameOfLife.board.offset().top,
        windowHeight = $(window).height(),
        gridHeight = windowHeight - gridTop - 10;
      gameOfLife.board.height(gridHeight);

      // Calculate the number of rows and columns that can be displayed.
      var squareSize = +$('#edit-square-size').val();

      // Record the number of columns and rows in the main object, as this info
      // is needed when playing.
      gameOfLife.nRows = Math.floor((gridHeight - 1) / (squareSize + 1));
      gameOfLife.nCols = Math.floor((gridWidth - 1) / (squareSize + 1));

      // Draw the table.
      var table = "<table>";
      for (var row = 0; row < gameOfLife.nRows; row++) {
        table += "<tr>";
        for (var col = 0; col < gameOfLife.nCols; col++) {
          table += "<td id='cell-" + col + "-" + row + "' data-col='" + col + "' data-row='" + row + "' style='width:" + squareSize + "px; height:" + squareSize + "px;'";

          // Copy the existing cell state if possible.
          if (gameOfLife.getCellState(col, row)) {
            table += " class='alive'";
          }

          table += ">&nbsp;</td>";
        }
        table += "</tr>";
      }
      table += "</table>";
      gameOfLife.board.html(table);
    },

    /**
     * Clear the board.
     */
    clearBoard: function () {
      gameOfLife.states = [];
      gameOfLife.board.find('td').removeClass('alive');
    },

    /**
     * Update the grid to reflect the board states.
     */
    updateBoard: function (newStates) {
      // Update the states array.
      gameOfLife.states = newStates;

      var cell;

      // Loop through all cells, checking states.
      for (var row = 0; row < gameOfLife.nRows; row++) {
        for (var col = 0; col < gameOfLife.nCols; col++) {
          cell = $('#cell-' + col + '-' + row);
          if (gameOfLife.getCellState(col, row)) {
            // Set to alive.
            cell.addClass('alive');
          }
          else {
            // Set to dead.
            cell.removeClass('alive');
          }
        }
      }
    },

    /**
     * Populate the board randomly using the specified density.
     */
    populate: function () {
      // Clear the board.
      var newStates = [], alive;

      // Get the density as a value between 0 and 1.
      var density = +$('#edit-density').val() / 100;

      // For each cell, determine whether or not it's alive based on density.
      for (var row = 0; row < gameOfLife.nRows; row++) {
        for (var col = 0; col < gameOfLife.nCols; col++) {
          alive = (density == 1 || density > Math.random()) ? 1 : 0;
          gameOfLife.setCellState(col, row, alive, newStates);
        }
      }

      // Update the board.
      gameOfLife.updateBoard(newStates);
    },

    /**
     * Get a cell's current state.
     *
     * @param Number col
     * @param Number row
     */
    getCellState: function (col, row) {
      return (typeof gameOfLife.states[col] == 'object' && gameOfLife.states[col][row]) ? 1 : 0;
    },

    /**
     * Set a cell state in a 2D array ensuring existence of sub-arrays.
     *
     * @param Array newStates
     * @param Number col
     * @param Number row
     * @param Number alive
     */
    setCellState: function (col, row, alive, states) {
      // If states not specified use current board states.
      if (states === undefined) {
        states = gameOfLife.states;
      }

      // Check for subarray creation.
      if (states[col] === undefined) {
        states[col] = [];
      }

      // Set the cell state.
      states[col][row] = alive;
    },

    /**
     * Check if a cell is alive or dead. Supports cells outside the grid.
     *
     * @param Number col
     * @param Number row
     *
     * @return Number
     *   0 if dead, 1 if alive. Returning a number instead of a boolean here
     *   because it then becomes easy to count live neighbours.
     */
    isAlive: function (col, row) {

      // Check if looking at cells outside the grid.
      if (col < 0 || col >= gameOfLife.nCols || row < 0 || row >= gameOfLife.nRows) {

        // Is wrapping on?
        if ($('#edit-wrap').is(':checked')) {

          // Implement wrapping of columns.
          if (col < 0) {
            col += gameOfLife.nCols;
          }
          else if (col >= gameOfLife.nCols) {
            col -= gameOfLife.nCols;
          }

          // Implement wrapping of rows.
          if (row < 0) {
            row += gameOfLife.nRows;
          }
          else if (row >= gameOfLife.nRows) {
            row -= gameOfLife.nRows;
          }

        }
        else {
          // If wrapping is off then any cells outside the grid are dead.
          return false;
        }

      }

      // Return the cell's state.
      return gameOfLife.getCellState(col, row);
    },

    /**
     * Update the grid to the next state.
     */
    tick: function () {
      // For each grid position, calculate its new state and record this.
      // We'll record new cell states in a separate array rather than updating
      // the cells directly, because that would affect the states of adjacent
      // cells.

      var newStates = [], alive, nLivingNeighbours, newState;

      // Determine new cell newStates.
      for (var row = 0; row < gameOfLife.nRows; row++) {
        for (var col = 0; col < gameOfLife.nCols; col++) {

          // What's the cell's current state?
          alive = gameOfLife.getCellState(col, row);

          // How many neighbours are alive?
          nLivingNeighbours
            = gameOfLife.isAlive(col - 1, row - 1)
            + gameOfLife.isAlive(col - 1, row)
            + gameOfLife.isAlive(col - 1, row + 1)
            + gameOfLife.isAlive(col, row - 1)
            + gameOfLife.isAlive(col, row + 1)
            + gameOfLife.isAlive(col + 1, row - 1)
            + gameOfLife.isAlive(col + 1, row)
            + gameOfLife.isAlive(col + 1, row + 1);

          // Combine rules 1 and 3.
          // Rule 1: Any live cell with fewer than two live neighbours dies,
          // as if caused by under-population.
          // Rule 3. Any live cell with more than three live neighbours dies,
          // as if by overcrowding.
          if (alive && (nLivingNeighbours < 2 || nLivingNeighbours > 3)) {
            alive = 0;
          }

          // Rule 2: Any live cell with two or three live neighbours lives on
          // to the next generation.
          // Nothing to do here as we default to current state.

          // Rule 4: Any dead cell with exactly three live neighbours becomes a
          // live cell, as if by reproduction.
          if (!alive && nLivingNeighbours == 3) {
            alive = 1;
          }

          // Record the cell's new state.
          gameOfLife.setCellState(col, row, alive, newStates);
        } // cols
      } // rows

      // Update the grid.
      gameOfLife.updateBoard(newStates);

      // If playing, update again after one tick interval.
      if (gameOfLife.playing) {
        setTimeout(gameOfLife.tick, 50);
      }
    },

    /**
     * Play the board.
     */
    play: function () {
      var playBtn = $('#btn-play');
      if (gameOfLife.playing) {
        // Pause.
        gameOfLife.playing = false;
        playBtn.removeClass('active pause').val('Play');
      }
      else {
        // Play.
        gameOfLife.playing = true;
        playBtn.addClass('active').val('Playing');
        gameOfLife.tick();
      }
    },

    /**
     * Just one loop.
     */
    step: function () {
      // Pause if playing.
      if (gameOfLife.playing) {
        gameOfLife.playing = false;
        $('#btn-play').removeClass('active pause').val('Play');
      }

      // One tick.
      gameOfLife.tick();
    },

    /**
     * Attach behaviours.
     */
    setup: function () {
      // Cache some jQuery items.
      gameOfLife.board = $('#gol-board');
      gameOfLife.form = $('#gol-options-form');

      // The board is initially not playing.
      gameOfLife.playing = false;

      // Initialise the board cell states.
      gameOfLife.states = [];

      // Buttons.
      $('#btn-clear').click(gameOfLife.clearBoard);
      $('#btn-populate').click(gameOfLife.populate);
      $('#btn-step').click(gameOfLife.step);
      $('#btn-play')
        .click(gameOfLife.play)
        .mouseover(function () {
          if (gameOfLife.playing) {
            $('#btn-play').addClass('pause').val('Pause');
          }
        })
        .mouseout(function () {
          if (gameOfLife.playing) {
            $('#btn-play').removeClass('pause').val('Playing');
          }
        });

      // Table cells.
      gameOfLife.board.find('td').live('click', function () {
        var td = $(this),
          col = td.data('col'),
          row = td.data('row');

        // Toggle cell state.
        var alive = td.hasClass('alive') ? 0 : 1;

        // Update the board state.
        gameOfLife.setCellState(col, row, alive);

        // Update the table cell.
        if (alive) {
          td.addClass('alive');
        }
        else {
          td.removeClass('alive');
        }
      });

      // Redraw the board.
      gameOfLife.initBoard();
      // Also on window resize.
      $(window).resize(gameOfLife.initBoard);
      // Also if the square size changes.
      $('#edit-square-size').change(gameOfLife.initBoard);
    }
  };

  // Run the setup func on page ready.
  $(gameOfLife.setup);

})(jQuery);
