# weather_project/urls.py
from django.contrib import admin
from django.urls import path
from weather import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('weather-data/', views.weather_data, name='weather_data'),
    path('weather-graph/', views.weather_graph, name='weather_graph'),
    path('health/', health_check),
]