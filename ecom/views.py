from django.shortcuts import render, get_object_or_404, redirect
from django.template.loader import render_to_string
from django.http import JsonResponse
from django.db.models import Count, Avg, Q
from taggit.models import Tag
from ecom.models import Products, Category, Vendor, CartOrder, CartOrderItems, Wishlist, ProductImages, ProductReview, Address
from ecom.forms import ProductReviewForm
from django.contrib import messages
import warnings

warnings.filterwarnings('ignore')

# Create your views here.

# Index view for homepage
def index(request):
    products = Products.objects.filter(product_status="published", featured=True)
    context = {"products": products}
    return render(request, 'ecom/index.html', context)


# Product List View
def product_list_view(request):
    products = Products.objects.filter(product_status="published")
    tags = Tag.objects.all()

    context = {
        "products": products,
        "tags": tags,
    }
    return render(request, 'ecom/product-list.html', context)


# Category List View
def category_list_view(request):
    categories = Category.objects.all().annotate(product_count=Count("category"))
    context = {"categories": categories}
    return render(request, 'ecom/category-list.html', context)


# Product List by Category View
def category_product_list_view(request, cid):
    category = get_object_or_404(Category, cid=cid)
    products = Products.objects.filter(product_status="published", category=category)

    context = {
        "category": category,
        "products": products,
    }
    return render(request, "ecom/category-product-list.html", context)


# Vendor List View
def vendor_view_list(request):
    vendors = Vendor.objects.all()
    context = {"vendors": vendors}
    return render(request, 'ecom/vendor-list.html', context)


# Vendor Detail View
def vendor_detail_list(request, vid):
    vendor = get_object_or_404(Vendor, vid=vid)
    products = Products.objects.filter(vendor=vendor, product_status="published")
    context = {
        "vendor": vendor,
        "products": products,
    }
    return render(request, 'ecom/vendor-detail.html', context)


# Product Detail View
def product_detail_view(request, pid):
    product = get_object_or_404(Products, pid=pid)
    related_products = Products.objects.filter(category=product.category).exclude(pid=pid)

    # Get all Reviews
    reviews = ProductReview.objects.filter(product=product).order_by("-date")
    average_rating = ProductReview.objects.filter(product=product).aggregate(rating=Avg('rating'))

    # Product Review Form
    review_form = ProductReviewForm()
    make_review = True
    if request.user.is_authenticated:
        user_review_count = ProductReview.objects.filter(user=request.user, product=product).count()
        if user_review_count > 0:
            make_review = False

    p_images = product.p_images.all()
    
    context = {
        "product": product,
        "p_images": p_images,
        "related_products": related_products,
        "reviews": reviews,
        "make_review": make_review,
        "average_rating": average_rating,
        "review_form": review_form,
        "tags": product.tags.all(),
    }
    return render(request, 'ecom/product-detail.html', context)


# Tag Filter View
def tag_list(request, tag_slug=None):
    products = Products.objects.filter(product_status="published").order_by("-id")
    tag = None
    if tag_slug:
        tag = get_object_or_404(Tag, slug=tag_slug)
        products = products.filter(tags=tag)

    context = {
        "products": products,
        "tag": tag,
    }
    return render(request, 'ecom/tag.html', context)


# Add Review via AJAX
def ajax_add_review(request, pid):
    product = get_object_or_404(Products, pk=pid)
    user = request.user
    review = ProductReview.objects.create(
        user=user,
        product=product,
        review=request.POST['review'],
        rating=request.POST['rating'],
    )

    context = {
        "user": user.username,
        "review": request.POST['review'],
        "rating": request.POST['rating'],
    }

    average_rating = ProductReview.objects.filter(product=product).aggregate(rating=Avg('rating'))

    return JsonResponse({
        "bool": True,
        "context": context,
        "average_rating": average_rating,
    })


# Search Products View
def search_view(request):
    query = request.GET.get("q", "")  # Default to an empty string if 'q' is None
    products = Products.objects.none()  # No results by default
    if query:
        products = Products.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query)  # Search by title or description
        ).order_by("-date")

    context = {
        "products": products,
        "query": query,
    }
    return render(request, 'ecom/search.html', context)


# Filter Products View
def filter_product(request):
    categories = request.GET.getlist("Category[]")
    vendors = request.GET.getlist("vendor[]")
    min_price = request.GET['min_price']
    max_price = request.GET['max_price']

    products = Products.objects.filter(product_status="published").distinct()
    products = products.filter(price__gte=min_price, price__lte=max_price)

    if categories:
        products = products.filter(category__id__in=categories).distinct()

    if vendors:
        products = products.filter(vendor__id__in=vendors).distinct()

    context = {"products": products}
    data = render_to_string("ecom/async/product-list.html", context)
    return JsonResponse({"data": data})


# Add to Cart View
def add_to_cart(request):
    cart_product = {
        str(request.GET['id']): {
            'title': request.GET['title'],
            'qty': int(request.GET['qty']),
            'price': float(request.GET['price']),
            'image': request.GET['image'],
            'pid': request.GET['pid']
        }
    }

    if 'cart_data_obj' in request.session:
        cart_data = request.session['cart_data_obj']
        if str(request.GET['id']) in cart_data:
            cart_data[str(request.GET['id'])]['qty'] += int(cart_product[str(request.GET['id'])]['qty'])
        else:
            cart_data.update(cart_product)
        request.session['cart_data_obj'] = cart_data
    else:
        request.session['cart_data_obj'] = cart_product

    total_cart_items = len(request.session['cart_data_obj'])
    return JsonResponse({'data': request.session['cart_data_obj'], 'totalcartitems': total_cart_items})


# View Cart Page
def cart_view(request):
    cart_total_amount = 0
    cart_data = request.session.get('cart_data_obj', {})

    if cart_data:
        for item in cart_data.values():
            cart_total_amount += int(item['qty']) * float(item['price'])

        return render(request, "ecom/cart.html", {
            "cart_data": cart_data,
            "totalcartitems": len(cart_data),
            "cart_total_amount": cart_total_amount
        })
    else:
        messages.warning(request, "Your cart is empty.")
        return redirect("ecom:index")


# Delete Item from Cart
def delete_item_from_cart(request):
    product_id = str(request.GET['id'])
    
    if 'cart_data_obj' in request.session:
        cart_data = request.session['cart_data_obj']
        if product_id in cart_data:
            del cart_data[product_id]
            request.session['cart_data_obj'] = cart_data

    cart_total_amount = 0
    cart_data = request.session.get('cart_data_obj', {})
    if cart_data:
        for item in cart_data.values():
            cart_total_amount += int(item['qty']) * float(item['price'])

    context = render_to_string("ecom/async/cart-list.html", {
        'cart_data': cart_data,
        'totalcartitems': len(cart_data),
        'cart_total_amount': cart_total_amount,
    })
    return JsonResponse({"data": context, 'totalcartitems': len(cart_data)})


# Update Cart
def update_cart(request):
    product_id = str(request.GET['id'])
    product_qty = str(request.GET['qty'])

    if 'cart_data_obj' in request.session:
        cart_data = request.session['cart_data_obj']
        if product_id in cart_data:
            cart_data[product_id]['qty'] = product_qty
            request.session['cart_data_obj'] = cart_data

    cart_total_amount = 0
    cart_data = request.session.get('cart_data_obj', {})
    if cart_data:
        for item in cart_data.values():
            cart_total_amount += int(item['qty']) * float(item['price'])

    context = render_to_string("ecom/async/cart-list.html", {
        'cart_data': cart_data,
        'totalcartitems': len(cart_data),
        'cart_total_amount': cart_total_amount,
    })
    return JsonResponse({"data": context, 'totalcartitems': len(cart_data)})
