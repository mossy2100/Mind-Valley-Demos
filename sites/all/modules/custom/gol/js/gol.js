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
      var squareSize = +$('#edit-square-size').val(),
        nRows = Math.floor((gridHeight - 1) / (squareSize + 1)),
        nCols = Math.floor((gridWidth - 1) / (squareSize + 1));

      // Draw the table.
      var table = "<table>";
      for (var r = 0; r < nRows; r++) {
        table += "<tr>";
        for (var c = 0; c < nCols; c++) {
          table += "<td data-row='" + r + "' data-col='" + c + "' style='width:" + squareSize + "px; height:" + squareSize + "px;'>&nbsp;</td>";
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
      gameOfLife.board.find('td').removeClass('alive');
    },

    /**
     * Randomise the board using the specified density.
     */
    randomise: function () {
      // Clear the board.
      gameOfLife.clearBoard();

      // Get the density as a value between 0 and 1.
      var density = +$('#edit-density').val() / 100;

      // For each cell, determine whether or not it's alive based on density.
      gameOfLife.board.find('td').each(function () {
        if (density == 1 || density > Math.random()) {
          $(this).addClass('alive');
        }
      });
    },

    play: function () {

    },

    /**
     * Attach behaviours.
     */
    setup: function () {
      // Cache some jQuery items.
      gameOfLife.board = $('#gol-board');
      gameOfLife.form = $('#gol-options-form');

      // Buttons.
      $('#btn-clear').click(gameOfLife.clearBoard);
      $('#btn-randomise').click(gameOfLife.randomise);
      $('#btn-play').click(gameOfLife.play);
      $('#btn-pause').click(gameOfLife.pause);

      // Table cells.
      gameOfLife.board.find('td').live('click', function () {
        var td = $(this);
        if (td.hasClass('alive')) {
          td.removeClass('alive');
        }
        else {
          td.addClass('alive');
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
