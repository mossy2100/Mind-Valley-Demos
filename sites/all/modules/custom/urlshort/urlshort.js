/**
 * @file
 * Some nice jQuery to make our URL shortener work with AJAX.
 */


function($, window, Drupal) {

  /**
   * Add AJAX behaviours.
   */
  function urlshortGoClick() {

    // Grab the long URL.
    var url = $('#edit-long-url').val();
    if (!url) {
      alert("Put something in the long URL field first, silly!");
    }
    else {
      // Create AJAX request.
      $.get("/shorten", {url: url}, function(textStatus, data) {
        console.log(textStatus, data);



      });
    }
  }

  /**
   * Attach behaviours.
   */
  function urlshortInit() {
    $('#go-button').click(urlshortGoClick);
  }

  // Run the init func on page ready.
  $(urlshortInit);

}(jQuery, window, Drupal);
