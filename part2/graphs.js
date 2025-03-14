// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up scales for x and y axes
    const xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))]) // Unique list of platforms
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)])
        .range([height, 0]);

    // Add x-axis label
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    // Add y-axis label
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Rollup function to calculate quartiles
    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return { min, q1, median, q3, max };
    };

    // Group by Platform and calculate quartiles
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    quantilesByGroups.forEach((quantiles, Platform) => {
        const x = xScale(Platform) + xScale.bandwidth() / 2;
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines for min and max
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black")
            .attr("stroke-width", 1);

        // Draw box (Q1 to Q3)
        svg.append("rect")
            .attr("x", x - boxWidth / 2)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("fill", "#69b3a2");

        // Draw median line
        svg.append("line")
            .attr("x1", x - boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    });
});


// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

d3.csv("socialMediaAvg.csv").then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 150, bottom: 50, left: 40},
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barplot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Define scales
    const x0 = d3.scaleBand()
                 .domain([...new Set(data.map(d => d.Platform))]) // Unique platforms
                 .range([0, width])
                 .padding(0.1);

    const x1 = d3.scaleBand()
                 .domain([...new Set(data.map(d => d.PostType))]) // Unique post types
                 .range([0, x0.bandwidth()])
                 .padding(0.05);

    const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.Likes)])
                .nice()
                .range([height, 0]);

    const color = d3.scaleOrdinal()
                   .domain([...new Set(data.map(d => d.PostType))])
                   .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // Add x-axis
    svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x0));

    // Add y-axis
    svg.append("g")
       .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
       .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
       .style("text-anchor", "middle")
       .text("Platform");

    // Add y-axis label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left)
       .attr("x", 0 - (height / 2))
       .style("text-anchor", "middle")
       .text("Likes");

    // Group container for bars
    const barGroups = svg.selectAll(".bar")
                         .data(data)
                         .enter()
                         .append("g")
                         .attr("transform", d => `translate(${x0(d.Platform)}, 0)`);

    // Draw bars
    barGroups.append("rect")
             .attr("x", d => x1(d.PostType))
             .attr("y", d => y(d.Likes))
             .attr("width", x1.bandwidth())
             .attr("height", d => height - y(d.Likes))
             .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
                      .attr("transform", `translate(${width + 20}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {
        legend.append("rect")
              .attr("x", 0)
              .attr("y", i * 25)
              .attr("width", 20)
              .attr("height", 20)
              .attr("fill", color(type));
        
        legend.append("text")
              .attr("x", 25)
              .attr("y", i * 25 + 12)
              .text(type)
              .attr("alignment-baseline", "middle");
    });
});


// Prepare your data and load the data again.
const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes; // Convert Likes to a number
        d.Date = d3.timeParse("%m/%d/%Y (%A)")(d.Date); // Parse the Date column
    });

    // Define the dimensions and margins for the SVG
    const margin = {top: 20, right: 30, bottom: 50, left: 40},
          width = 800 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#lineplot")
                  .append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set up scales for x and y axes
    const xScale = d3.scaleTime()
                     .domain(d3.extent(data, d => d.Date)) // Set the domain to the min and max dates
                     .range([0, width]);

    const yScale = d3.scaleLinear()
                     .domain([0, d3.max(data, d => d.Likes)]) // Set the domain to the max Likes value
                     .nice()
                     .range([height, 0]);

    // Draw the x-axis
    svg.append("g")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(xScale))
       .selectAll(".tick text")
       .attr("transform", "rotate(45)") // Rotate the x-axis text
       .style("text-anchor", "start");

    // Draw the y-axis
    svg.append("g")
       .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
       .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
       .style("text-anchor", "middle")
       .text("Date");

    // Add y-axis label
    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left)
       .attr("x", 0 - (height / 2))
       .style("text-anchor", "middle")
       .text("Likes");

    // Draw the line and path. Remember to use curveNatural
    const line = d3.line()
                   .x(d => xScale(d.Date))
                   .y(d => yScale(d.Likes))
                   .curve(d3.curveNatural); // Use curveNatural for smooth lines

    svg.append("path")
       .data([data])
       .attr("class", "line")
       .attr("d", line)
       .attr("fill", "none")
       .attr("stroke", "#1f77b4")
       .attr("stroke-width", 2);
});
