// Define color constants
const BORDER_COLOR = "rgb(255, 255, 255)"; // THIS DOESNT CHANGE ANYTHING, IT IS TRULY DEFINED IN THE CSS FOR .COUNTRY
const DEFAULT_COLOR = "rgba(185, 185, 185)";
const HOVER_COLOR = "rgba(139, 139, 139)"; // Hover color
const NEUTRAL_COLOR = "rgb(220, 200, 132)";
const DEMOCRAT_COLOR = "rgb(36, 73, 153)";
const REPUBLICAN_COLOR = "rgb(210, 37, 50)";
const NEUTRAL_HOVER_COLOR = "rgb(200, 180, 112)";
const DEMOCRAT_HOVER_COLOR = "rgb(26, 63, 133)";
const REPUBLICAN_HOVER_COLOR = "rgb(190, 27, 40)";

// voting options
const STATES = {
    DEFAULT: "default",
    NEUTRAL: "neutral",
    DEMOCRAT: "democrat",
    REPUBLICAN: "republican"
};

// TODO: PLACEHOLDER
function calculateElectors(country) {
    return Math.floor(country.properties.pop_est / 1000000);
}

// Dimensions of the SVG container
const width = 1000;
const height = 600;

// Crear Container, agregarle el zoom y los limits de panning
const svgContainer = d3.select("#map")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .call(d3.zoom()
        .scaleExtent([0.9, 8])
        .translateExtent([[width * -0.02, height * -0.22], [width * 1.02, height * 0.78]])
        .on("zoom", function(event) {
            svg.attr("transform", event.transform);
        })
    )
    .on("dblclick.zoom", null); // Disable zoom on double click

// Append a <g> element inside SVG for proper zooming behavior
const svg = svgContainer.append("g");


// Projection and path generator
const projection = d3.geoMercator()
    .scale(150)
    .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Store country data for later updates
let countryData = {};

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(geojson) {
    // Draw the map
    svg.selectAll(".country")
        .data(geojson.features.filter(d => d.properties.name !== "Antarctica")) // Exclude Antarctica
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", DEFAULT_COLOR) 
        .attr("stroke", BORDER_COLOR)
        .attr("stroke-width", 1) // width de los bordes
        .on("click", function(event, d) {
            const countryId = d.id;

            // If Shift key is pressed, remove the country from the model
            if (event.shiftKey) {
                removeCountryFromModel(d, this);
            } else {
                // Cycle through country states on click
                cycleCountryState(d, this);
            }
        })
        .on("mouseover", function(d) {
            const countryId = d.id;
            const currentState = countryData[countryId]?.state || STATES.DEFAULT;
            let hoverColor;
            switch (currentState) {
            case STATES.NEUTRAL:
                hoverColor = NEUTRAL_HOVER_COLOR;
                break;
            case STATES.DEMOCRAT:
                hoverColor = DEMOCRAT_HOVER_COLOR;
                break;
            case STATES.REPUBLICAN:
                hoverColor = REPUBLICAN_HOVER_COLOR;
                break;
            default:
                hoverColor = HOVER_COLOR;
            }
            d3.select(this).attr("fill", hoverColor);
        })
        .on("mouseout", function(event, d) {
            const countryId = d.id;
            const currentState = countryData[countryId]?.state || STATES.DEFAULT;
            // Restore the color based on the current state
            updateCountryColor(this, currentState);
        });
});

document.getElementById("maximize-btn").addEventListener("click", function() {
    const mapContainer = document.querySelector(".map-container");

    if (!document.fullscreenElement) {
        // Enter fullscreen mode
        if (mapContainer.requestFullscreen) {
            mapContainer.requestFullscreen();
        } else if (mapContainer.mozRequestFullScreen) { // Firefox
            mapContainer.mozRequestFullScreen();
        } else if (mapContainer.webkitRequestFullscreen) { // Chrome, Safari, Edge
            mapContainer.webkitRequestFullscreen();
        } else if (mapContainer.msRequestFullscreen) { // IE/Edge
            mapContainer.msRequestFullscreen();
        }
        this.innerText = "🗕"; // Change icon to minimize
        this.title = "Exit Fullscreen";
    } else {
        // Exit fullscreen mode
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        this.innerText = "⛶"; // Change icon back to maximize
        this.title = "Maximize Map";
    }
});

// Exit fullscreen when ESC is pressed
document.addEventListener("fullscreenchange", function() {
    if (!document.fullscreenElement) {
        const maximizeBtn = document.getElementById("maximize-btn");
        maximizeBtn.innerText = "⛶"; // Reset button
        maximizeBtn.title = "Maximize Map";
    }

    const mapContainer = document.querySelector(".map-container");
    const isFullscreen = !!document.fullscreenElement;

    if (isFullscreen) {
        // Ensure the background remains ocean blue
        mapContainer.style.background = "rgb(173, 216, 230)"; // Light blue
    } else {
        // Restore original background when exiting fullscreen
        mapContainer.style.background = "";
    }
});



// Function to update the color based on state
function updateCountryColor(element, state) {
    let color;
    switch (state) {
        case STATES.NEUTRAL:
            color = NEUTRAL_COLOR;
            break;
        case STATES.DEMOCRAT:
            color = DEMOCRAT_COLOR;
            break;
        case STATES.REPUBLICAN:
            color = REPUBLICAN_COLOR;
            break;
        default:
            color = DEFAULT_COLOR;
    }

    d3.select(element).attr("fill", color);
}

function cycleCountryState(country, element) {
    const countryId = country.id;

    if (!countryData[countryId]) {
        countryData[countryId] = { state: STATES.DEFAULT };
    }

    const currentState = countryData[countryId].state;
    let nextState;
    if (currentState === STATES.DEFAULT) {
        nextState = STATES.NEUTRAL;
    } else if (currentState === STATES.NEUTRAL) {
        nextState = STATES.DEMOCRAT;
    } else if (currentState === STATES.DEMOCRAT) {
        nextState = STATES.REPUBLICAN;
    } else if (currentState === STATES.REPUBLICAN) {
        nextState = STATES.DEFAULT;
    }

    countryData[countryId].state = nextState;

    const electors = calculateElectors(country);

    updateCountryColor(element, nextState);
}

function removeCountryFromModel(country, element) {
    const countryId = country.id;

    delete countryData[countryId];

    updateCountryColor(element, STATES.DEFAULT);
}
