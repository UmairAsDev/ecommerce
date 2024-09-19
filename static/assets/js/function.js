console.log("working fine");

$("#commentForm").submit(function(e) {
  e.preventDefault();

  $.ajax({
    data: $(this).serialize(),
    method: $(this).attr("method"),
    url: $(this).attr("action"),
    dataType: "json",
    success: function(response) {
      console.log("Comment saved to DB....");

      if (response.bool == true) {
        $("#review-res").html("Review Added Successfully....");
        $(".hide-comment-form").hide();
        $(".add-review").hide();

        let _html =
          '<div class="single-comment justify-content-between d-flex mb-30">';
        _html += '<div class="user justify-content-between d-flex">';
        _html += '<div class="thumb text-center">';
        _html += '<img src="staticassetsimgs\blogauthor-1.png" alt="" />';
        _html += `<a href="#" class="font-heading text-brand">${response.context
          .user}</a>`; // Use template literals
        _html += "</div>";

        _html += '<div class="desc">';
        _html += '<div class="d-flex justify-content-between mb-10">';
        _html += '<div class="d-flex align-items-center">';
        _html += `<span class="font-xs text-muted">${response.context
          .date}</span>`; // Assuming date comes from response
        _html += "</div>";

        // Generate stars for the rating
        for (let i = 0; i < response.context.rating; i++) {
          // Loop through all ratings
          _html += '<i class="fas fa-star text-warning"></i>';
        }

        _html += "</div>"; // Closing the div for the star rating

        // Add the review text
        _html += `<p class="mb-10">${response.context.review}</p>`;

        _html += "</div>"; // Close desc
        _html += "</div>"; // Close user
        _html += "</div>"; // Close single-comment

        // Prepend the new review to the list of comments
        $(".comment-list").prepend(_html);
      }
    },
    error: function(xhr, status, error) {
      console.log("An error occurred:", error);
    }
  });
});




$(document).ready(function() {
    $(".filter-checkbox").on("click", function() {
        console.log("A checkbox has been checked...");

        let filter_object = {};

        // Iterate over each checkbox to build the filter object
        $(".filter-checkbox").each(function() {
            let filter_value = $(this).val();
            let filter_key = $(this).data("filter");

            console.log("Filter value is:", filter_value);
            console.log("Filter key is:", filter_key);

            // Collect checked filter values for each filter key
            filter_object[filter_key] = Array.from(
                document.querySelectorAll('input[data-filter=' + filter_key + ']:checked')
            ).map(function(element) {
                return element.value;
            });
        });

        console.log("Filter object is:", filter_object);

        // Send AJAX request with the filter data
        $.ajax({
            url: '/filter-products', // Ensure this is the correct URL for filtering products
            data: filter_object, // Send the filter object as data
            dataType: 'json',
            beforeSend: function() {
                console.log("product is yet to be filtered...");
                // Show loader or other actions (optional)
                $("#loader").show(); // Ensure you have an element with id 'loader'
            },
            success: function(response) { // Pass the response parameter to access the response data
                console.log(response.data); // Log the response from the server
                console.log("product filtered successfully....");
                // Update the product list or any relevant part of the DOM
                $("#filtered-products").html(response.data); // Corrected ID selector for the product list
            },
            complete: function() {
                // Hide loader after request completes (optional)
                $("#loader").hide();
            },
            error: function(xhr, status, error) {
                console.log("An error occurred: " + error); // Handle any errors
            }
        });
    });
});
