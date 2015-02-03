/**
 * @file
 * Some nice jQuery to make our URL shortener work with AJAX.
 */


(function ($) {

  /**
   * Add AJAX behaviours.
   */
  function urlshortGoClick(e) {
    // Prevent submission of the form.
    e.preventDefault();

    // Hide the error message if visible.
    $('#error-msg').hide();

    // Grab the long URL.
    var url = $('#edit-long-url').val();
    if (!url) {
      $('#error-msg').text("Put something in the long URL field first, silly!").show();
    }
    else {
      // Create AJAX request.
      $.get("/shorten/ajax", {url: url}, function(data) {
        if (typeof data.code == 'string') {
          // Stick the shortened URL in the text field and automatically select
          // it so the user can easily copy it.
          $('#edit-short-url')
            .val('http://' + window.nakedHost + '/' + data.code)
            .select();
        }
        else if (typeof data.error == 'string') {
          $('#error-msg').text(data.error).show();
        }
      }, 'json');
    }
  }

  /**
   * Attach behaviours.
   */
  function urlshortInit() {
    // Get the naked host name. We do this instead of hard-coding the host
    // name so it works in different environments (or if we move the site).
    var host = window.location.hostname;
    if (host.substr(0, 4) == 'www.') {
      // Should always be true on this page. Strip off the 'www.'.
      window.nakedHost = host.substr(4);
    }
    else {
      window.nakedHost = host;
    }

    $('#edit-long-url')
      .keydown(function() {
        // Clear the short URL field if they change the long URL.
        $('#edit-short-url').val('');
        // Hide the error message if visible.
        $('#error-msg').hide();
      })
      .focus(function() {
        // Clear the long URL if it regains focus, because it probably means
        // the user wants to shorten another URL.
        $(this).val('');
        // Hide the error message if visible.
        $('#error-msg').hide();
      });

    // If the click Go, shorten the URL.
    $('#edit-go').click(urlshortGoClick);
  }

  // Run the init func on page ready.
  $(urlshortInit);

})(jQuery);
