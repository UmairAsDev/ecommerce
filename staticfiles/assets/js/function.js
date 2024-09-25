// Reviews Section Functionality
$ ('#commentForm').submit (function (e) {
  e.preventDefault ();

  $.ajax ({
    data: $ (this).serialize (),
    method: $ (this).attr ('method'),
    url: $ (this).attr ('action'),
    dataType: 'json',
    success: function (response) {
      if (response.bool == true) {
        $ ('#review-res').html ('Review Added Successfully....');
        $ ('.hide-comment-form').hide ();
        $ ('.add-review').hide ();

        let _html =
          '<div class="single-comment justify-content-between d-flex mb-30">';
        _html += '<div class="user justify-content-between d-flex">';
        _html += '<div class="thumb text-center">';
        _html += '<img src="staticassetsimgs\\blogauthor-1.png" alt="" />';
        _html += `<a href="#" class="font-heading text-brand">${response.context.user}</a>`;
        _html += '</div>';

        _html += '<div class="desc">';
        _html += '<div class="d-flex justify-content-between mb-10">';
        _html += '<div class="d-flex align-items-center">';
        _html += `<span class="font-xs text-muted">${response.context.date}</span>`;
        _html += '</div>';

        for (let i = 0; i < response.context.rating; i++) {
          _html += '<i class="fas fa-star text-warning"></i>';
        }

        _html += '</div>';
        _html += `<p class="mb-10">${response.context.review}</p>`;
        _html += '</div>';
        _html += '</div>';
        _html += '</div>';

        $ ('.comment-list').prepend (_html);
      }
    },
    error: function (xhr, status, error) {
      console.log ('An error occurred:', error);
    },
  });
});

// Filter section functionality
$ (document).ready (function () {
  $ ('.filter-checkbox , #price-filter-btn').on ('click', function () {
    let filter_object = {};

    let min_price = $ ('#max_price').attr ('min');
    let max_price = $ ('#max_price').val ();

    filter_object.min_price = min_price;
    filter_object.max_price = max_price;

    $ ('.filter-checkbox').each (function () {
      let filter_value = $ (this).val ();
      let filter_key = $ (this).data ('filter');

      filter_object[filter_key] = Array.from (
        document.querySelectorAll (
          'input[data-filter=' + filter_key + ']:checked'
        )
      ).map (function (element) {
        return element.value;
      });
    });

    $.ajax ({
      url: '/filter-products',
      data: filter_object,
      dataType: 'json',
      beforeSend: function () {
        $ ('#loader').show ();
      },
      success: function (response) {
        $ ('#filtered-products').html (response.data);
      },
      complete: function () {
        $ ('#loader').hide ();
      },
      error: function (xhr, status, error) {
        console.log ('An error occurred: ' + error);
      },
    });
  });

  $ ('#max_price').on ('blur', function () {
    let min_price = $ (this).attr ('min');
    let max_price = $ (this).attr ('max');
    let current_price = $ (this).val ();

    // console.log("current price is:", current_price);
    // console.log("min price is:", min_price);
    // console.log("max price is:", max_price);

    if (
      current_price < parseInt (min_price) ||
      current_price > parseInt (max_price)
    ) {
      console.log ('Price Error Occurred....!');

      min_price = Math.round (min_price * 100) / 100;
      max_price = Math.round (max_price * 100) / 100;

      // console.log("min price is:", min_price);
      // console.log("max price is:", max_price);

      alert ('Price must be between:$' + min_price + 'and' + max_price);
      $ (this).val (min_price);
      $ ('#range').val (min_price);
      $ (this).focus ();

      return false;
    }
  });

  $(".add-to-cart-btn").on("click", function () {
    let this_val = $(this);
    let index = this_val.attr("data-index");
  
    let quantity = $(".product-quantity-" + index).val();
    let product_title = $(".product-title-" + index).val();
    let product_image = $(".product-image-" + index).val();
    let product_pid = $(".product-pid-" + index).val();
    let product_id = $(".product-id-" + index).val();
    let product_price = $(".current-product-price-" + index).text();
    
    console.log('Current Element:', this_val);
    console.log('Index:', index);
    console.log('Quantity:', quantity);
    console.log('Product title:', product_title);
    console.log('Product image:', product_image);
    console.log('Product pid:', product_pid);
    console.log('Product id:', product_id);
    console.log('Product price:', product_price);
  
    $.ajax({
        url: '/add-to-cart',
        type: 'GET',  // Ensure this matches your Django view method
        data: {
            'id': product_id,
            'pid': product_pid,
            'qty': quantity,
            'title': product_title,
            'price': product_price,
            'image': product_image,
          },
        dataType: 'json',
        beforeSend: function () {
            console.log('Adding product to cart...');
        },
        success: function (res) {
            this_val.html('✔');
            console.log('Added product to cart!');
            $(".cart-item-count").text(res.totalcartitems);
        },
        error: function (xhr, status, error) {
            console.error('Error adding product to cart:', error);
        }
    });
  });

  $(".delete-product").on("click", function(){
    let product_id = $(this).attr("data-product");
    let this_val = $(this);
    console.log("Product ID", product_id);
  
    $.ajax({
      url: '/delete-from-cart',
      data: {
        'id': product_id,
      },
      dataType: 'json',
      beforeSend: function(){
        this_val.hide()
      },
      success: function(response){
        this_val.show()
        console.log(response);
        $(".cart-item-count").text(response.totalcartitems);
        $("#cart-list").html(response.data);
      },
      error: function(xhr, status, error) {
        console.error("Error deleting product:", error);
        this_val.attr("disabled", false); // Re-enable even on error
      }
    });
  });

  $(".update-product").on("click", function(){
    let product_id = $(this).attr("data-product");
    let this_val = $(this);
    let product_quantity = $(".product-qty-" + product_id).val();
    console.log("Product ID", product_id);
    console.log("Product QTY", product_quantity);
  
    $.ajax({
      url: '/update-cart',
      data: {
        'id': product_id,
        'qty':product_quantity,
      },
      dataType: 'json',
      beforeSend: function(){
        this_val.hide()
      },
      success: function(response){
        this_val.show()
        console.log(response);
        $(".cart-item-count").text(response.totalcartitems);
        $("#cart-list").html(response.data);
      },
      error: function(xhr, status, error) {
        console.error("Error deleting product:", error);
        this_val.attr("disabled", false); // Re-enable even on error
      }
    });
  });
  
});





// Delete Product from cart





// Add to Cart btn.....
    
    // $ ('#add-to-cart-btn').on ('click', function () {
    //   let quantity = $ ('#product-quantity').val ();
    //   let product_title = $ ('.product-title').val ();
    //   let product_id = $ ('.product-id').val ();
    //   let product_price = $ ('#current-product-price').text ();
    //   let this_val = $ (this);
    
    //   console.log ('Total Quantity:', quantity);
    //   console.log ('Product title:', product_title);
    //   console.log ('Product id:', product_id);
    //   console.log ('Product price:', product_price);
    //   console.log ('This value:', this_val);
    
    //   $.ajax ({
    //     url: '/add-to-cart',
    //     data: {
    //       id: product_id,
    //       qty: quantity,
    //       title: product_title,
    //       price: product_price,
    //     },
    //     dataType: 'json',
    //     beforeSend: function () {
    //       console.log ('Adding product to cart...');
    //     },
    //     success: function (res) {
    //       this_val.html ('item added to cart..');
    //       console.log ('Added product to cart!');
    //       $(".cart-item-count").text(res.totalcartitems)
    //     },
    //   });
    // });
