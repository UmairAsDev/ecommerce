// Reviews Section Functionality
$("#commentForm").submit(function (e) {
  e.preventDefault();

  $.ajax({
    data: $(this).serialize(),
    method: $(this).attr("method"),
    url: $(this).attr("action"),
    dataType: "json",
    success: function (response) {
      if (response.bool == true) {
        $("#review-res").html("Review Added Successfully....");
        $(".hide-comment-form").hide();
        $(".add-review").hide();

        let _html =
          '<div class="single-comment justify-content-between d-flex mb-30">';
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
    error: function (xhr, status, error) {
      console.log("An error occurred:", error);
    }
  });
});

// Filter section functionality
$(document).ready(function () {
  // Comment form submission
  $("#commentForm").submit(function (e) {
    e.preventDefault();

    $.ajax({
      data: $(this).serialize(),
      method: $(this).attr("method"),
      url: $(this).attr("action"),
      dataType: "json",
      success: function (response) {
        if (response.bool === true) {
          $("#review-res").html("Review Added Successfully....");
          $(".hide-comment-form").hide();
          $(".add-review").hide();

          const _html = `
            <div class="single-comment justify-content-between d-flex mb-30">
              <div class="user justify-content-between d-flex">
                <div class="thumb text-center">
                  <img src="staticassetsimgs/blogauthor-1.png" alt="" />
                  <a href="#" class="font-heading text-brand">${
                    response.context.user
                  }</a>
                </div>
                <div class="desc">
                  <div class="d-flex justify-content-between mb-10">
                    <div class="d-flex align-items-center">
                      <span class="font-xs text-muted">${
                        response.context.date
                      }</span>
                    </div>
                    ${'<i class="fas fa-star text-warning"></i>'.repeat(
                      response.context.rating
                    )}
                  </div>
                  <p class="mb-10">${response.context.review}</p>
                </div>
              </div>
            </div>`;

          $(".comment-list").prepend(_html);
        }
      },
      error: function (xhr, status, error) {
        console.error("An error occurred:", error);
        alert("Failed to add review. Please try again.");
      }
    });
  });

  // Filter section functionality
  $(".filter-checkbox, #price-filter-btn").on("click", function () {
    const filter_object = {};

    const min_price = $("#max_price").attr("min");
    const max_price = $("#max_price").val();

    filter_object.min_price = min_price;
    filter_object.max_price = max_price;

    $(".filter-checkbox").each(function () {
      const filter_value = $(this).val();
      const filter_key = $(this).data("filter");

      filter_object[filter_key] = Array.from(
        document.querySelectorAll(`input[data-filter=${filter_key}]:checked`)
      ).map((element) => element.value);
    });

    $.ajax({
      url: "/filter-products",
      data: filter_object,
      dataType: "json",
      beforeSend: function () {
        $("#loader").show();
      },
      success: function (response) {
        $("#filtered-products").html(response.data);
      },
      complete: function () {
        $("#loader").hide();
      },
      error: function (xhr, status, error) {
        console.error("An error occurred: " + error);
        alert("Failed to filter products. Please try again.");
      }
    });
  });

  $("#max_price").on("blur", function () {
    const min_price = $(this).attr("min");
    const max_price = $(this).attr("max");
    const current_price = $(this).val();

    if (
      current_price < parseInt(min_price) ||
      current_price > parseInt(max_price)
    ) {
      alert(
        `Price must be between: $${Math.round(min_price * 100) / 100} and $${
          Math.round(max_price * 100) / 100
        }`
      );
      $(this).val(min_price);
      $(this).focus();
      return false;
    }
  });

  $(".add-to-cart-btn").on("click", function () {
    const currentButton = $(this);
    const index = currentButton.attr("data-index");

    const quantity = $(".product-quantity-" + index).val();
    const product_title = $(".product-title-" + index).val();
    const product_image = $(".product-image-" + index).val();
    const product_pid = $(".product-pid-" + index).val();
    const product_id = $(".product-id-" + index).val();
    const product_price = $(".current-product-price-" + index).text();

    $.ajax({
      url: "/add-to-cart",
      type: "GET",
      data: {
        id: product_id,
        pid: product_pid,
        qty: quantity,
        title: product_title,
        price: product_price,
        image: product_image
      },
      dataType: "json",
      beforeSend: function () {
        console.log("Adding product to cart...");
      },
      success: function (res) {
        currentButton.html("✔");
        $(".cart-item-count").text(res.totalcartitems);
      },
      error: function (xhr, status, error) {
        console.error("Error adding product to cart:", error);
        alert("Failed to add product to cart. Please try again.");
      }
    });
  });

  $(".delete-product").on("click", function () {
    const product_id = $(this).attr("data-product");
    const currentButton = $(this);

    $.ajax({
      url: "/delete-from-cart",
      data: {
        id: product_id
      },
      dataType: "json",
      beforeSend: function () {
        currentButton.hide();
      },
      success: function (response) {
        currentButton.show();
        $(".cart-item-count").text(response.totalcartitems);
        $("#cart-list").html(response.data);
      },
      error: function (xhr, status, error) {
        console.error("Error deleting product:", error);
        currentButton.show(); // Show button again on error
        alert("Failed to delete product from cart. Please try again.");
      }
    });
  });

  $(".update-product").on("click", function (event) {
    event.preventDefault();

    const product_id = $(this).attr("data-product");
    const currentButton = $(this);

    const product_quantity = $(".product-qty-" + product_id).val();

    if (product_quantity === undefined || product_quantity <= 0) {
      alert("Invalid quantity!");
      return;
    }

    $.ajax({
      url: "/update-cart",
      data: {
        id: product_id,
        qty: product_quantity
      },
      dataType: "json",
      beforeSend: function () {
        currentButton.attr("disabled", true).text("Updating...");
      },
      success: function (response) {
        currentButton.attr("disabled", false).text("Update");
        $(".cart-item-count").text(response.totalcartitems);
        $("#cart-list").html(response.data);
      },
      error: function (xhr, status, error) {
        console.error("Error updating product:", error);
        alert(
          "An error occurred while updating the product. Please try again."
        );
        currentButton.attr("disabled", false).text("Update");
      }
    });
  });
});

