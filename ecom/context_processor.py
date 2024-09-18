from ecom.models import Products, Category, Vendor, CartOrder, CartOrderItems, Wishlist, ProductImages, ProductReview, Address


def default(request):
    
    categories = Category.objects.all()
    vendors = Vendor.objects.all()
    try:
        address = Address.objects.get(user=request.user)
    except:
        address = None
    return {
        "categories": categories,
        "address": address,
        "vendors": vendors,
    }