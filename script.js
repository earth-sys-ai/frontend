// sever data vars
var serverIp = ""
var levelAval

// transect vars
var tPoints = []
var tValues = []
var curCoord

// colors
var colorArray = []

// --------------------------------------------------------------------------------
// setup map
var map = L.map('mapid', {drawControl: true}).setView([40.796640, -74.481600], 3)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

async function onMapClick(e) {
    let c = e.latlng
    curCoord = [c.lat, c.lng]
}
map.on('click', onMapClick)

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
function genColors(levels, min, max) {
    colorArray = []
    var colorInterpolator = d3.interpolateHslLong("red", "blue");
    for (var level = 0; level < levels; level++) {
        colorArray.push(parseColor(colorInterpolator(((1 - 0) / (max - min)) * (level - min))))
    }
}

function parseColor(color) {
    var arr=[]; color.replace(/[\d+\.]+/g, function(v) { arr.push(parseFloat(v)); });
    return ("#" + arr.slice(0, 3).map(toHex).join(""));
}

function toHex(int) {
    var hex = int.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
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
        let curLevel = 0;

        // gen colors
        genColors(level, min, max)

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
                    curPoly.push([lat, lng])
                });

                // add polygon
                var tPoly = L.polygon(curPoly, {fillColor: colorArray[curLevel], fillOpacity: 0.25, opacity: 0});
                curPolys.push(tPoly);
                tPoly.addTo(map);

            });
            curLevel++
        });
    });
}


// --------------------------------------------------------------------------------
// returns list of values at each point
function getValues(points) {
    var out = []

    // encode
    pointQuery = ""
    points.forEach(function(point) {
        pointQuery += "(" + point[0] + "," + point[1] + ")"
    });
   
    // create url to get
    let level = document.getElementById("levelSelect").value;
    let urlStr = ("http://" + serverIp + "/?com=transect&level=" + level + "&line=" + pointQuery)
    console.log(urlStr)

    // return parsed json response
    $.getJSON(urlStr, function(data) {
        return data.values
    });
}


// --------------------------------------------------------------------------------
// deals with points for transection
function addCurPoint() {
    tPoints.push(curCoord);
    L.marker(curCoord).addTo(map);
}

function clearTransect() {
    tPoints = []
}

function viewTransect() {
    console.log(getValues(tPoints))
}