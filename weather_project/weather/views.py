import logging
from django.http import JsonResponse
from .utils import get_last_year_weather_data, get_similar_weather_data, get_highest_temperature

def weather_data(request):
    last_year_weather = get_last_year_weather_data()
    print('!!',last_year_weather)
    if last_year_weather:
        last_year_date, last_year_temp, last_year_weather_desc = last_year_weather[0]
        
        # try:
        year, month, day = last_year_date.split('-')
            # similar_weather_data = get_similar_weather_data(year, month, last_year_weather_desc)
            # highest_temp = get_highest_temperature(year, month)
        # except ValueError as e:
        #     return JsonResponse({'error': e})
        
        return JsonResponse({
            'last_year_date': last_year_date,
            'last_year_temp': last_year_temp,
            'last_year_weather_desc': last_year_weather_desc,
            # 'similar_weather_data': similar_weather_data,
            # 'highest_temp': highest_temp,
        })
    return JsonResponse({'error': 'Data not available'})
