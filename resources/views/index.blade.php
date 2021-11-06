<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
        <title>Clever Production</title>
        <!-- Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
        <script type="application/javascript" src="https://api-maps.yandex.ru/2.1/?lang=ru_RU"></script>
        <script type="application/javascript" src="https://npmcdn.com/@turf/turf@6.5.0/turf.min.js"></script>
        <script type="application/javascript" src="https://yastatic.net/s3/mapsapi-jslibs/heatmap/0.0.1/heatmap.min.js"></script>
        <script type="application/javascript" src="https://yastatic.net/s3/mapsapi-jslibs/area/0.0.1/util.calculateArea.min.js"></script>
        <script type="application/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp"/>
        <!-- JS bundle -->
        <script async src='js/main.js'></script>
    </head>
    <body>
    <!-- Vue root -->
    <div id="app"></div>
    </body>
</html>
