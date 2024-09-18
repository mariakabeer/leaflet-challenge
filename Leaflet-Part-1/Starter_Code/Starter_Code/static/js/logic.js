// Centering the map
var myMap = L.map('map').setView([20, 0], 2);

// Adding OpenStreetMap to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Extracting the earthquake data from the USGS GeoJSON URL
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson')
    .then(response => response.json())
    .then(data => {
        // Styling the marker based on size and depth
        function styleMarker(feature) {
            var magnitude = feature.properties.mag;
            var depth = feature.geometry.coordinates[2];
            return {
                radius: magnitude * 5,
                fillColor: getColor(depth),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
        }

        // Color Scale
        function getColor(depth) {
            return depth > 100 ? '#800026' :
                   depth > 50  ? '#BD0026' :
                   depth > 20  ? '#E31A1C' :
                   depth > 10  ? '#FC4E2A' :
                   depth > 0   ? '#FD8D3C' :
                                 '#FFEDA0';
        }

        // Popup info
        function onEachFeature(feature, layer) {
            if (feature.properties && feature.properties.place) {
                layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
                                 <p>Magnitude: ${feature.properties.mag}</p>
                                 <p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
            }
        }

        // Markers
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, styleMarker(feature));
            },
            onEachFeature: onEachFeature
        }).addTo(myMap);

        // Legend
        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function () {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 10, 20, 50, 100],
                labels = [];

            div.innerHTML += '<strong>Earthquake Depth (km)</strong><br>';

            // Legend Colors
            for (var i = 0; i < grades.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                    grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            }

            return div;
        };

        // Add the legend
        legend.addTo(myMap);
    })
    .catch(error => console.error('Error fetching earthquake data:', error));