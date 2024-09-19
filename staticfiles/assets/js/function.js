// Reviews Section Functionality
$("#commentForm").submit(function(e) {
  e.preventDefault();

  $.ajax({
    data: $(this).serialize(),
    method: $(this).attr("method"),
    url: $(this).attr("action"),
    dataType: "json",
    success: function(response) {
      if (response.bool == true) {
        $("#review-res").html("Review Added Successfully....");
        $(".hide-comment-form").hide();
        $(".add-review").hide();

        let _html = '<div class="single-comment justify-content-between d-flex mb-30">';
        _html += '<div class="user justify-content-between d-flex">';
        _html += '<div class="thumb text-center">';
        _html += '<img src="staticassetsimgs\\blogauthor-1.png" alt="" />';
        _html += `<a href="#" class="font-heading text-brand">${response.context.user}</a>`;
        _html += "</div>";

        _html += '<div class="desc">';
        _html += '<div class="d-flex justify-content-between mb-10">';
        _html += '<div class="d-flex align-items-center">';
        _html += `<span class="font-xs text-muted">${response.context.date}</span>`;
        _html += "</div>";

        for (let i = 0; i < response.context.rating; i++) {
          _html += '<i class="fas fa-star text-warning"></i>';
        }

        _html += "</div>";
        _html += `<p class="mb-10">${response.context.review}</p>`;
        _html += "</div>";
        _html += "</div>";
        _html += "</div>";

        $(".comment-list").prepend(_html);
      }
    },
    error: function(xhr, status, error) {
      console.log("An error occurred:", error);
    }
  });
});


// Filter section functionality
$(document).ready(function() {
    $(".filter-checkbox").on("click", function() {
        let filter_object = {};

        $(".filter-checkbox").each(function() {
            let filter_value = $(this).val();
            let filter_key = $(this).data("filter");

            filter_object[filter_key] = Array.from(
                document.querySelectorAll('input[data-filter=' + filter_key + ']:checked')
            ).map(function(element) {
                return element.value;
            });
        });

        $.ajax({
            url: '/filter-products',
            data: filter_object,
            dataType: 'json',
            beforeSend: function() {
                $("#loader").show();
            },
            success: function(response) {
                $("#filtered-products").html(response.data);
            },
            complete: function() {
                $("#loader").hide();
            },
            error: function(xhr, status, error) {
                console.log("An error occurred: " + error);
            }
        });
    });

    $("#max_price").on("blur", function(){
      let min_price = $(this).attr("min")
      let max_price = $(this).attr("max")
      let current_price = $(this).val()

      console.log("current price is:", current_price);
      console.log("min price is:", min_price);
      console.log("max price is:", max_price);

      if (current_price < parseInt(min_price) || current_price > parseInt(max_price)){
        console.log("Price Error Occurred....!")
      }
    })
});



