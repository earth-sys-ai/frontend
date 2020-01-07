// sever data vars
var serverIp = ""
var levelAval

// transect vars
var tPoints = []
var tValues = []
var curCoord
var markers = []

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
function clearPolys() {
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
        clearPolys()
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
// open graph of transection values
function graphTransect(values) {

    // create chart on last point
    markers[markers.length - 1]
    .bindPopup('<div id="chartContainer"></div>').openPopup();
    chartContainer.setAttribute("style", "width:500px");

    // create chart
    var chart = new CanvasJS.Chart("chartContainer",
    {
      title:{
      text: "Transection"
      },
       data: [
      {
        type: "line",
        dataPoints: values 
      }
    ],
      axisY: {
          title: "Maximum Elevation (m)"
      },
      axisX: {
          title: "Coordinate Index"
      }
    });
    chart.render();
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

    // parse returned values
    $.getJSON(urlStr, function(data) {
        outp = []

        // convert to graph format
        data.values.forEach(function (v) {
            outp.push({y: v})
        });

        // graph points
        graphTransect(outp);
    });
}


// --------------------------------------------------------------------------------
// deals with points for transection
function addCurPoint() {
    tPoints.push(curCoord);
    let m = L.marker(curCoord);
    map.addLayer(m);
    markers.push(m);
}

function importPoints(arr) {
    clearTransect()
    arr.forEach(function (v) {
      curCoord = v;
      addCurPoint();  
    })
}

function clearTransect() {
    tPoints = []
    markers.forEach(function (m){
        map.removeLayer(m);
    })
}

function viewTransect() {
    console.log(getValues(tPoints))
}

function loadSandy() {
    importPoints([
        [21.663607048865853, -77.18994140625],
        [23.307478627790545, -77.12402343750001],
        [25.030833285988944, -77.43164062500001],
        [26.671450002030547, -77.95898437500001],
        [27.998277318538527, -78.92578125000001],
        [29.328119904884396, -78.17871093750001],
        [31.2459043207037, -76.68457031250001],
        [33.43554319886957, -74.61914062500001],
        [35.42641908269343, -74.04785156250001],
        [37.29245372208609, -74.49829101562501],
        [38.204269288939656, -75.10253906250001],
        [39.30055202379298, -75.64086914062501]
    ]);
}