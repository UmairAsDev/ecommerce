from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.db.models import Count, Avg
from taggit.models import Tag
from ecom.models import Products, Category, Vendor, CartOrder, CartOrderItems, Wishlist, ProductImages, ProductReview, Address
from ecom.forms import ProductReviewForm
# Create your views here.

def index(request):
    # products = Products.objects.all("-id")
    products = Products.objects.filter(product_status = "published", featured = True)
    context = {
        "products": products
    }
    return render(request, 'ecom/index.html', context)


def product_list_view(request):
    products = Products.objects.filter(product_status = "published")
    context = {
        "products": products
    }
    return render(request, 'ecom/product-list.html', context)

def category_list_view(request):
    
    categories = Category.objects.all().annotate(product_count = Count("category"))
    # categories = Category.objects.all()
    context = {
        "categories": categories
    }
    return render(request, 'ecom/category-list.html', context)


def category_product_list_view(request, cid):
    category = Category.objects.get(cid=cid)
    product = Products.objects.filter(product_status = "published", category=category)
    
    context = {
        "category":category, 
        "product": product
    }
    return render(request, "ecom/category-product-list.html", context)


def vendor_view_list(request):
    vendors = Vendor.objects.all()
    context = {
        'vendors':vendors,
    }
    return render(request, 'ecom/vendor-list.html', context)



def vendor_detail_list(request, vid):
    vendor = Vendor.objects.get(vid=vid)
    products = Products.objects.filter(vendor=vendor, product_status = "published")
    context = {
        'vendor':vendor,
        'products': products
    }
    return render(request, 'ecom/vendor-detail.html', context)

def product_detail_view(request, pid):
    product = Products.objects.get(pid=pid)
    # product = get_object_or_404(Products, pid=pid)
    products = Products.objects.filter(category=product.category).exclude(pid=pid)
    
    # Get all Reviews
    reviews = ProductReview.objects.filter(product=product).order_by("-date")
    # Getting Average Reviews
    average_rating = ProductReview.objects.filter(product=product).aggregate(rating=Avg('rating'))
    # Product Reviews
    review_form = ProductReviewForm()
    p_images = product.p_images.all()
    
    context = {
        'product': product,
        'p_images':p_images,
        'products':products,
        'reviews' :reviews,
        'average_rating':average_rating,
        'review_form':review_form,
        'tags': product.tags.all(),
    }
    return render(request, 'ecom/product-detail.html', context)


def tag_list(request, tag_slug=None):
    products = Products.objects.filter(product_status = "published").order_by("-id")
    tag = None
    if tag_slug:
        tag = get_object_or_404(Tag, slug=tag_slug)
        products = products.filter(tags=tag)
    
    context = {
        'products':products,
        'tag':tag,
    }
    return render(request, 'ecom/tag.html', context)


def ajax_add_review(request, pid):
    product = Products.objects.get(pk=pid)
    user = request.user
    review = ProductReview.objects.create(
        user = user,
        product = product,
        review = request.POST['review'],
        rating = request.POST['rating'],
    )
    
    context = {
        'user': user.username,
        'review' : request.POST['review'],
        'rating' : request.POST['rating'],
    }
    
    average_rating = ProductReview.objects.filter(product=product).aggregate(rating=Avg('rating'))
    
    return JsonResponse(
        {
            'bool': True,
            'context': context,
            'average_rating' : average_rating,
        }
    )
