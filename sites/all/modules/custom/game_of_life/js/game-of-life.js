/**
 * @file
 * JavaScript/jQuery for the Game of Life demo.
 */

(function ($) {

  var gameOfLife = {

    /**
     * Reset the grid.
     */
    initGrid: function () {
      // Calculate the grid size. No scrollbars are visible, so the grid must
      // match the visible area.
      var gridWidth = gameOfLife.grid.width(),
        gridTop = gameOfLife.grid.offset().top,
        windowHeight = $(window).height(),
        gridHeight = windowHeight - gridTop - 10;

      // Set the grid height.
      gameOfLife.grid.height(gridHeight);

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
          if (gameOfLife.isAlive(col, row)) {
            table += " class='alive'";
          }

          table += ">&nbsp;</td>";
        }
        table += "</tr>";
      }
      table += "</table>";
      gameOfLife.grid.html(table);
    },

    /**
     * Clear the grid.
     */
    clear: function () {
      gameOfLife.states = [];
      gameOfLife.grid.find('td').removeClass('alive');
    },

    /**
     * Update the table cells to reflect the grid states.
     */
    updateGrid: function () {
      var cell, fn;

      // Loop through all cells, checking states.
      for (var row = 0; row < gameOfLife.nRows; row++) {
        for (var col = 0; col < gameOfLife.nCols; col++) {
          fn = gameOfLife.isAlive(col, row) ? 'addClass' : 'removeClass';
          cell = $('#cell-' + col + '-' + row)[fn]('alive');
        }
      }
    },

    /**
     * Populate the grid randomly using the specified density.
     */
    populate: function () {
      // Clear the grid.
      var alive;

      // Get the density as a value between 0 and 1.
      var density = +$('#edit-density').val() / 100;

      // For each cell, determine whether or not it's alive based on density.
      for (var row = 0; row < gameOfLife.nRows; row++) {
        for (var col = 0; col < gameOfLife.nCols; col++) {
          alive = (density == 1 || density > Math.random()) ? 1 : 0;
          gameOfLife.setAlive(col, row, alive);
        }
      }

      // Update the grid.
      gameOfLife.updateGrid();
    },

    /**
     * Get a cell's current state.
     * If checkWrap true, supports checking of cells outside the grid.
     *
     * @param Number col
     * @param Number row
     * @param Boolean checkWrap
     *   Whether or not to check if the caller is possibly requesting the state
     *   of a cell outside the grid.
     *
     * @return Number
     *   0 if dead, 1 if alive. Returning a number instead of a boolean here
     *   because it then becomes easy to count live neighbours.
     */
    isAlive: function (col, row, checkWrap) {

      // Make checking wrap conditional, for speed.
      // If checking for wrap, see if looking at cells outside the grid.
      if (checkWrap) {
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
      }

      // Return the cell's state.
      return (typeof gameOfLife.states[col] == 'object' && gameOfLife.states[col][row]) ? 1 : 0;
    },

    /**
     * Set a cell state in a 2D array ensuring existence of sub-arrays.
     *
     * @param Number col
     * @param Number row
     * @param Number alive
     * @param Array states
     *   Optionally specify the array of cells in which to set the cell state.
     *   Defaults to the current grid.
     */
    setAlive: function (col, row, alive, states) {
      // If states not specified use current grid states.
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
     * Update the grid to the next state.
     */
    tick: function () {
      // For each grid position, calculate its new state and record this.
      // New cell states are recorded in the states2 array rather than updating
      // the states array directly, because that would affect the states of
      // adjacent cells.

      var alive, nLivingNeighbours;

      // Determine new cell newStates.
      for (var row = 0; row < gameOfLife.nRows; row++) {
        for (var col = 0; col < gameOfLife.nCols; col++) {

          // What's the cell's current state?
          alive = gameOfLife.isAlive(col, row);

          // How many neighbours are alive?
          nLivingNeighbours
            = gameOfLife.isAlive(col - 1, row - 1, true)
            + gameOfLife.isAlive(col - 1, row, true)
            + gameOfLife.isAlive(col - 1, row + 1, true)
            + gameOfLife.isAlive(col, row - 1, true)
            + gameOfLife.isAlive(col, row + 1, true)
            + gameOfLife.isAlive(col + 1, row - 1, true)
            + gameOfLife.isAlive(col + 1, row, true)
            + gameOfLife.isAlive(col + 1, row + 1, true);

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
          gameOfLife.setAlive(col, row, alive, gameOfLife.states2);
        } // cols
      } // rows

      // Swap array references. Much quicker than copying each array item.
      var tmp = gameOfLife.states;
      gameOfLife.states = gameOfLife.states2;
      gameOfLife.states2 = tmp;

      // Update the grid.
      gameOfLife.updateGrid();

      // If playing, update again after one tick interval.
      if (gameOfLife.playing) {
        setTimeout(gameOfLife.tick, gameOfLife.tickDelay);
      }
    },

    /**
     * Play the grid.
     */
    play: function () {
      gameOfLife.playing = true;
      playBtn = $('#btn-play').addClass('active').val('Playing');
      gameOfLife.tick();
    },

    /**
     * Pause the game.
     */
    pause: function () {
      gameOfLife.playing = false;
      $('#btn-play').removeClass('active').val('Play');
    },

    /**
     * Just one tick.
     */
    step: function () {
      // Pause if playing.
      if (gameOfLife.playing) {
        gameOfLife.pause();
      }

      // One tick.
      gameOfLife.tick();
    },

    /**
     * Attach behaviours.
     */
    setup: function () {
      // Cache some jQuery items.
      gameOfLife.grid = $('#game-of-life-grid');
      gameOfLife.form = $('#game-of-life-options-form');

      // The grid is initially not playing.
      gameOfLife.playing = false;

      // Initialise the grid cell states.
      gameOfLife.states = [];

      // This array is for calculating the new states. A separate array is
      // necessary because the new states depend on adjacent cells, hence we
      // don't want to disrupt the grid states while calculating the new
      // grid states. Also, it will be more efficient in terms of memory
      // management to use just 2 arrays instead of creating a new one each
      // tick.
      gameOfLife.states2 = [];

      // Get the current tick delay. This value is cached so we don't need to
      // query the DOM every tick (which would be slow).
      var speedInput = $('#edit-speed');
      gameOfLife.tickDelay = +speedInput.val();
      speedInput.change(function () {
        gameOfLife.tickDelay = +speedInput.val();
      });

      // Buttons.
      $('#btn-populate').click(gameOfLife.populate);
      $('#btn-clear').click(gameOfLife.clear);
      $('#btn-play').click(gameOfLife.play);
      $('#btn-pause').click(gameOfLife.pause);
      $('#btn-step').click(gameOfLife.step);

      // Table cells.
      gameOfLife.grid.find('td').live('click', function () {
        var td = $(this),
          col = td.data('col'),
          row = td.data('row');

        // Toggle cell state.
        var alive = td.hasClass('alive') ? 0 : 1;

        // Update the grid state.
        gameOfLife.setAlive(col, row, alive);

        // Update the table cell.
        if (alive) {
          td.addClass('alive');
        }
        else {
          td.removeClass('alive');
        }
      });

      // Redraw the grid.
      gameOfLife.initGrid();
      // Also on window resize.
      $(window).resize(gameOfLife.initGrid);
      // Also if the square size changes.
      $('#edit-square-size').change(gameOfLife.initGrid);
    }
  };

  // Run the setup func on page ready.
  $(gameOfLife.setup);

})(jQuery);
