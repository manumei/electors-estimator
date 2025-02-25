// Define color constants
const BORDER_COLOR = "rgb(255, 255, 255)"; // THIS DOESNT CHANGE ANYTHING, IT IS TRULY DEFINED IN THE CSS FOR .COUNTRY
const DEFAULT_COLOR = "rgba(185, 185, 185)";
const HOVER_COLOR = "rgba(139, 139, 139)"; // Hover color
const NEUTRAL_COLOR = "rgb(220, 200, 132)";
const DEMOCRAT_COLOR = "rgb(36, 73, 153)";
const REPUBLICAN_COLOR = "rgb(210, 37, 50)";

// Track country states
const STATES = {
    DEFAULT: "default",
    NEUTRAL: "neutral",
    DEMOCRAT: "democrat",
    REPUBLICAN: "republican"
};

// Function to calculate electors (example placeholder formula)
function calculateElectors(country) {
    return Math.floor(country.properties.pop_est / 1000000);
}

// Dimensions of the SVG container
const width = 1000;
const height = 600;

// Create an SVG element
const svg = d3.select("#map")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

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
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", DEFAULT_COLOR) // Use default color initially
        .attr("stroke", BORDER_COLOR)
        .attr("stroke-width", 1) // Increase stroke width (default is around 1)
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
        .on("mouseover", function() {
            d3.select(this).attr("fill", HOVER_COLOR); // Temporary hover color
        })
        .on("mouseout", function(event, d) {
            const countryId = d.id;
            const currentState = countryData[countryId]?.state || STATES.DEFAULT;
            // Restore the color based on the current state
            updateCountryColor(this, currentState);
        });
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

// Function to cycle the country states
function cycleCountryState(country, element) {
    const countryId = country.id;

    // Initialize country state if not already
    if (!countryData[countryId]) {
        countryData[countryId] = { state: STATES.DEFAULT };
    }

    // Cycle through states
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

    // Update the country state
    countryData[countryId].state = nextState;

    // Calculate electors (if needed)
    const electors = calculateElectors(country);

    // Update the color based on new state
    updateCountryColor(element, nextState);
}

// Function to remove country from the model
function removeCountryFromModel(country, element) {
    const countryId = country.id;

    // Remove the country state
    delete countryData[countryId];

    // Reset the color and clear any associated data
    updateCountryColor(element, STATES.DEFAULT);
}
