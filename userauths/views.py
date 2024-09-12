from django.shortcuts import render
from django.shortcuts import redirect
from userauths.forms import UserRegisterForm
from django.contrib.auth import login, authenticate
from django.contrib import messages
from django.conf import settings
from django.contrib.auth import logout
from userauths.models import User

# User = settings.AUTH_USER_MODEL
# Create your views here.
def register_view(request):
    
    if  request.method =="POST":
        form  = UserRegisterForm(request.POST or None)
        if form.is_valid():
            new_user = form.save()
            username = form.cleaned_data.get("username")
            messages.success(request, f"Hey {username} your account created successfully" )
            new_user = authenticate(username = form.cleaned_data['email'],
                                    password = form.cleaned_data['password1']
            )
            login(request, new_user)
            return redirect('ecom:index')
            
    else:
        form  = UserRegisterForm()

    context = {
        'form' : form,
    }
    return render(request, 'userauths/sign-up.html', context)
    

def login_view(request):
    if request.user.is_authenticated:
        return redirect("ecom:index")
    
    if request.method == "POST":
        email =  request.POST.get("email")
        password = request.POST.get("password")
        
        try:
            user = User.objects.get(email = email)
            user = authenticate(request, email=email, password= password)
            if user is not None:
                login(request, user)
                messages.success(request, "you are logged in...")
                return redirect("ecom:index")
            else:
                messages.warning(request, "User does not exit, create an account.")
        
        except:
            messages.warning(request, f"User with  {email} does not exist")
        
    return render(request, "userauths/sign-in.html")


def logout_view(request):
    logout(request)
    messages.success(request, "You have logged out.")
    return redirect("userauths:sign-in")