var curCoord;
var curRad = 50;

// --------------------------------------------------------------------------------
// setup map
var map = L.map('mapid').setView([40.796640, -74.481600], 3)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// setup heatmap
var heat = new L.WebGLHeatMap({size: 2, units: 'px', alphaRange: 0.4, autoresize: true});
map.addLayer(heat)
heat.addTo(map)


// --------------------------------------------------------------------------------
// get json from api
function getData(coord) {
    let urlStr = ("http://" + document.getElementById("ip").value + "/?lat=" + Math.round(coord.lat) + "&lng=" + Math.round(coord.lng) + "&red=true")
    $.get(urlStr, function( raw ) {
            let json = JSON.parse(raw)
            let data = json.data
            let popText = ("Lat:" + Math.round(coord.lat) + "<br>Lng: " + Math.round(coord.lng) + "<br>--<br>" + data)

            var popup = L.popup()
            .setLatLng(coord)
            .setContent(popText)
            .openOn(map)
      });  
}


// --------------------------------------------------------------------------------
// display elevation of current clicked place on map
async function onMapClick(e) {
    curCoord = e.latlng
    getData(e.latlng)
}
map.on('click', onMapClick)


// --------------------------------------------------------------------------------
// store data in database
function addData() {
    let data = prompt("New data to add for this location:")
    let urlStr = ("http://" + document.getElementById("ip").value + "/?lat=" + Math.round(curCoord.lat) + "&lng=" + Math.round(curCoord.lng) + "&add=" + data) 

    $.get(urlStr);
    getData(curCoord)
}


// --------------------------------------------------------------------------------
// clear data of location
function clearData() {
    if (confirm("Are you sure you want to clear data for this location?")) {
        let urlStr = ("http://" + document.getElementById("ip").value + "/?lat=" + Math.round(curCoord.lat) + "&lng=" + Math.round(curCoord.lng) + "&clr=true") 
        $.get(urlStr);
        getData(curCoord)
    }
}

// --------------------------------------------------------------------------------
// display all data on heatmap
function dispAll() {
    heat.setData([]);
    let urlStr = ("http://" + document.getElementById("ip").value + "/?lis=true&lat=" + curCoord.lat + "&lng=" + curCoord.lng + "&rad=" + curRad);
    $.get(urlStr, function( raw ) {
        let points = JSON.parse(raw).points
        let values = JSON.parse(raw).values
        for (i = 0; i < points.length; i++) {
            heat.addDataPoint(points[i][0], points[i][1], values[i] * 1000);
        }
        heat._update()
    });
}


// updates radius of check
function circleRange() {
    curRad = document.getElementById("radiusIn").value;
}
