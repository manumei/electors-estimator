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
        .on("click", function(event, d) {
            // Toggle fill color on click
            const currentColor = d3.select(this).attr("fill") || "#f4f4e8";
            const newColor = currentColor === "#f4f4e8" ? "#ff0000" : "#f4f4e8";
            d3.select(this).attr("fill", newColor);
        });
}).catch(function(error) {
    console.error("Error loading GeoJSON data:", error);
});
