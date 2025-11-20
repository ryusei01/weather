from django.urls import path
from .views import weather_data

urlpatterns = [
    path('weather-data/', weather_data, name='weather_data'),
]
