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

    // Grab the long URL.
    var url = $('#edit-long-url').val();
    if (!url) {
      alert("Put something in the long URL field first, silly!");
    }
    else {
      // Create AJAX request.
      $.get("/shorten/ajax", {url: url}, function(data, textStatus) {
        if (typeof data.code == 'string') {
          $('#edit-short-url').val('http://mdv.al/' + data.code);
        }
      }, 'json');
    }
  }

  /**
   * Attach behaviours.
   */
  function urlshortInit() {
    // Clear the short URL field if they change the long URL.
    $('#edit-long-url').keydown(function() {
      $('#edit-short-url').val('');
    })

    // If the click Go, get the short URL.
    $('#edit-go').click(urlshortGoClick);
  }

  // Run the init func on page ready.
  $(urlshortInit);

})(jQuery);
