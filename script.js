// sever data vars
var serverIp = ""
var levelAval

// transect vars
var tPoints = []
var tValues = []
var curCoord
var curPolys = []


// --------------------------------------------------------------------------------
// setup map
var map = L.map('mapid', {drawControl: true}).setView([40.796640, -74.481600], 3)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

async function onMapClick(e) {
    curCoord = e.latlng
}

// --------------------------------------------------------------------------------
// set level and ip data for server
function setServer() {
    serverIp = prompt("Server IP:")
    let urlStr = ("http://" + serverIp + "/?com=listLevels")
    $.getJSON(urlStr, function(data) {
        levelAval = data.levels;
        select = document.getElementById('levelSelect');
        levelAval.forEach(function(item) {
            var opt = document.createElement("option");
            opt.value = item;
            opt.innerHTML = item;
            select.appendChild(opt);
        });
    });
}


// --------------------------------------------------------------------------------
// for color generation
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


// --------------------------------------------------------------------------------
// clear polygons from map
function clearMap() {
    for(i in map._layers) {
        if(map._layers[i]._path != undefined) {
            map.removeLayer(map._layers[i]);
        }
    }
}


// --------------------------------------------------------------------------------
// convert and draw polygons
function loadPolys() {

    // sets url for desired level
    let level = document.getElementById("levelSelect").value;
    let urlStr = ("http://" + serverIp + "/?com=getData&level=" + level)

    // download and parse json
    $.getJSON(urlStr, function(data) {
        
        // wipe previous polygons
        clearMap()
        tValues = []
        curPolys = []
        
        // vars for color and levels
        let levels = data.levels
        let min = data.info.min
        let max = data.info.max

        // loop through levels
        levels.forEach(function(item) {
            let polys = item.polygons;
            let value = item.value;

            // loop through polygons and add them to map with given value
            polys.forEach(function(poly) {
                let verts = poly.vertices;
                var curPoly = []
                tValues.push(value)

                // make verts into polygon
                verts.forEach(function(vert) {
                    let lat = vert.lat
                    let lng = vert.lng
                    curPoly.push([lng, lat])
                });

                // add polygon
                let color = Math.round(((value - min) / (max - min)) * 255)
                var tPoly = L.polygon(curPoly, {fillColor: rgbToHex(color, 255 - color, 0), fillOpacity: 0.2, opacity: 0});
                curPolys.push(tPoly);
                tPoly.addTo(map);
                console.log(rgbToHex(255 - color, color, 0) + ": " + color);
            })
        });
    });
}


// --------------------------------------------------------------------------------
// checks if points reside in a given polygon
function inPoly(x, y, poly) {
    var inside = false;
    for (var ii=0; ii<poly.getLatLngs().length;ii++){
        var polyPoints = poly.getLatLngs()[ii];
        for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
            var xi = polyPoints[i].lat, yi = polyPoints[i].lng;
            var xj = polyPoints[j].lat, yj = polyPoints[j].lng;
            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
    }
    return inside;
}


// --------------------------------------------------------------------------------
// returns list of values at each point
function getValues(points, polygons) {
    var out = []
    var i = 0
    points.forEach(function(point) {
        polygons.forEach(function(poly) {
            if ((inPoly(point[0], point[1], poly))) {
                out.push(tValues[i])
            }
            i += 1
        });
    });
    return out
}


// --------------------------------------------------------------------------------
// deals with points for transection
function addCurPoint() {
    tPoints.push(curCoord)
}

function clearTransect() {
    tPoints = []
}

function viewTransect() {
    console.log(getValues(tValues, curPolys))
}