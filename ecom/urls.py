from django.urls import path
from . import views




app_name = 'ecom'

urlpatterns = [
    path('', views.index, name='index'),
    # Product
    path("products/",views.product_list_view, name='products_list'),
    path("product/<pid>/", views.product_detail_view, name = 'product-detail'),
    # Category
    path("category/",views.category_list_view, name='category_list'),
    path("category/<cid>/",views.category_product_list_view, name='category_product_list'),
    
    # Vendor
    path("vendors/",views.vendor_view_list, name='vendor_list'),
    path("vendors/<vid>/",views.vendor_detail_list, name='vendor_detail'),
    
    #Tags
    path("products/tag/<slug:tag_slug>/", views.tag_list, name="tags" ),
    
    #Add Review
    path("ajax-add-review/<int:pid>/", views.ajax_add_review, name="ajax-add-review"),
    
    # Search
    path("search/",views.search_view, name='search'),
    
    # Async product-filter
    
    path("filter-products/", views.filter_product, name="filter-product"),
    
    # Add to Cart
    
    path("add-to-cart/", views.add_to_cart, name="add-to-cart"),
    
    # Cart Page Url
    
    path("cart/", views.cart_view, name="cart"),
]


 