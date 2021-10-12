<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Clever Production</title>
        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
        <script type="application/javascript" src="https://api-maps.yandex.ru/2.1/?lang=ru_RU"></script>
        <script type="application/javascript" src="https://npmcdn.com/@turf/turf@6.5.0/turf.min.js"></script>
        <script type="application/javascript" src="https://yastatic.net/s3/mapsapi-jslibs/heatmap/0.0.1/heatmap.min.js"></script>
        <script type="application/javascript" src="https://yastatic.net/s3/mapsapi-jslibs/area/0.0.1/util.calculateArea.min.js" type="text/javascript"></script>
        <!-- JS bundle -->
        <script async type="text/javascript" src='{{ asset('js/main.js') }}'></script>
        <style>
            body {
                font-family: 'Nunito', sans-serif;
            }
        </style>
    </head>
    <body>
    <!-- Vue root -->
    <div id="app"></div>
    </body>
</html>
