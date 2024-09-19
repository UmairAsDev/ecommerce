from ecom.models import Products, Category, Vendor, CartOrder, CartOrderItems, Wishlist, ProductImages, ProductReview, Address
from django.db.models import Count, Min, Max

def default(request):
    
    categories = Category.objects.all()
    vendors = Vendor.objects.all()
    
    # Min Max Price range
    
    min_max_price = Products.objects.aggregate(Min("price"), Max("price"))
    try:
        address = Address.objects.get(user=request.user)
    except:
        address = None
    return {
        "categories": categories,
        "address": address,
        "vendors": vendors,
        "min_max_price": min_max_price,
    }