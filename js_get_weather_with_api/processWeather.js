//initialize event listener to btn
const init = () => {
    let btnEventListener = document.querySelector("#weatherBtn");
    btnEventListener.addEventListener("click", getLatAndLong);
}
window.onload = init;

//receive latitude and longitude from input zipCode
function getLatAndLong () {
    let zipCode = document.getElementById("zipCode").value;
    let Http = new XMLHttpRequest();
    let location = {lat: 0, lng: 0, placeName: ''};
    let url = `http://api.geonames.org/postalCodeLookupJSON?postalcode=${zipCode}&username=mih9898&country=US`;
    Http.open("GET", url);
    Http.send(null);
    Http.onreadystatechange = () => {
        if(Http.readyState == 4 && Http.status == 200) { 
            let loc = Http.responseText;
            location.lat = loc.match(/(?<=lat":).+\b/);
            location.lng = loc.match(/(?<=lng":)(-?\d+\.\d+)/g);
            location.placeName = loc.match(/(?<=placeName":")\w+/);
            getTempAndWind(location);
        }
    }
}

//receive temperature and wind-speed from lat/longit
function getTempAndWind(location) {
    let Http = new XMLHttpRequest();
    let url = `http://api.geonames.org/findNearByWeatherJSON?lat=${location.lat}&lng=${location.lng}&username=mih9898`;
    Http.open("GET", url);
    Http.send(null);
    Http.onreadystatechange = () => {
        if(Http.readyState == 4 && Http.status == 200) {
            loc = Http.responseText;
            let temp = Number(loc.match(/(?<=temperature":")-?\d+/g));
            let windAngle = Number(loc.match(/(?<=windDirection":)\d+/g));
            let windSpeed = Number(loc.match(/(?<=windSpeed":")\d+/g));
            output(cToF(temp), windAngle, windSpeed, location.placeName);
        }
    }
}

//convert wind angle to direction
function convertDegreesToWindDirection(degrees) {
    directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'N'];
    degrees = degrees * 8 / 360;
    degrees = Math.round(degrees, 0);
    degrees = (degrees + 8) % 8
    return directions[degrees];
}

//reset if wrong input or more then 1 output
const reset = () => {
    if(document.querySelector("#outputCont")) {
        document.getElementById("outputCont").remove();
    }
    if(document.querySelector(".err")){
        document.querySelector(".err").remove();
    } 
}

//convert celcius to forengheit
const cToF = celcius => celcius * 9 / 5 + 32;

//if input correct, then print to DOM html weather data
const output = (temp, angle, speed, place) => {
    reset();
    if (!place || (!angle && temp == 32 && !speed)) {
        if(!document.querySelector(".err")){
            let pErr = document.createElement("p");
            pErr.innerHTML = "Bad Zip Code, try again";
            pErr.setAttribute("class", "err");
            document.body.appendChild(pErr);
        }
        return;
    }
    
    let div = document.createElement("div");
    div.setAttribute("id", "outputCont");
    let h2 = document.createElement("h2");
    h2.innerHTML = place;

    let pTemp = document.createElement("p");
    pTemp.setAttribute("class", "outputInfo");
    pTemp.setAttribute("id", "regularTemp");
    if(temp < 34) {
        pTemp.setAttribute("id", "coldTemp")
    } else if (temp > 83) {
        pTemp.setAttribute("id", "warmTemp");
    }
    pTemp.innerHTML = `${temp}&deg; Farenheit`;
    
    let pWind = document.createElement("p");
    pWind.setAttribute("class", "outputInfo");
    pWind.setAttribute("id", "regularTemp");
    pWind > 15 ? pWind.setAttribute("id", "windy") : pWind.setAttribute("id", "regularWind");
    pWind.innerHTML = `${speed} mph ${convertDegreesToWindDirection(angle)} Wind`;

    div.appendChild(document.createElement('hr'));
    document.body.appendChild(div);
    div.appendChild(h2);
    div.appendChild(pTemp);
    div.appendChild(pWind);
}