// Define color constants
const DEFAULT_COLOR = "#d1d1d1";  // Default country fill color
const HOVER_COLOR = "#a4e100";    // Hover color
const SELECTED_COLOR = "#ff0000"; // Selected country fill color

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

// Load GeoJSON data (example with a public GeoJSON file)
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function(geojson) {
    // Draw the map
    svg.selectAll(".country")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", DEFAULT_COLOR) // Use constant for default color
        .on("click", function(event, d) {
            // Toggle fill color on click using constants
            const currentColor = d3.select(this).attr("fill") || DEFAULT_COLOR;
            const newColor = currentColor === DEFAULT_COLOR ? SELECTED_COLOR : DEFAULT_COLOR;
            d3.select(this).attr("fill", newColor);
        })
        .on("mouseover", function() {
            d3.select(this).attr("fill", HOVER_COLOR); // Use constant for hover color
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill", function(d) {
                return d3.select(this).attr("fill") === HOVER_COLOR ? DEFAULT_COLOR : d3.select(this).attr("fill");
            });
        });
}).catch(function(error) {
    console.error("Error loading GeoJSON data:", error);
});
