# weather_project/urls.py
from django.contrib import admin
from django.urls import path
from weather import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('weather-data/', views.weather_data, name='weather_data'),
    path('weather-graph/', views.weather_graph, name='weather_graph'),
    path('custom-week-weather/<int:weeks>/', views.custom_week_weather, name='custom_week_weather'),
    path('custom-year-weather/<int:years>/', views.custom_year_weather, name='custom_year_weather'),
    path('health/', views.health_check, name='health_check'),
]