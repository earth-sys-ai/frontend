// sever data vars
var serverIp = ""
var levelAval

// --------------------------------------------------------------------------------
// setup map
var map = L.map('mapid', {drawControl: true}).setView([40.796640, -74.481600], 3)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


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
    let level = document.getElementById("levelSelect").value;
    let urlStr = ("http://" + serverIp + "/?com=getData&level=" + level)


    $.getJSON(urlStr, function(data) {
        

       clearMap()
        




        let levels = data.levels
        let min = data.info.min
        let max = data.info.max




        levels.forEach(function(item) {
            let polys = item.polygons;
            let value = item.value;

            // loop through polygons and add them to map with given value
            polys.forEach(function(poly) {
                let verts = poly.vertices;
                var curPoly = []

                // make verts into polygon
                verts.forEach(function(vert) {
                    let lat = vert.lat
                    let lng = vert.lng
                    curPoly.push([lng, lat])
                });

                // add polygon
                let color = Math.round(((value - min) / (max - min)) * 255)
                L.polygon(curPoly, {fillColor: rgbToHex(color, 255 - color, 0), fillOpacity: 0.2, opacity: 0}).addTo(map);
                console.log(rgbToHex(255 - color, color, 0) + ": " + color);
            })

        });



















    });
}