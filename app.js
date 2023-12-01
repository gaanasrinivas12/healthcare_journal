const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins
const svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty";
// let chosenYAxis = "healthcare";

// function used for updating x-scale const upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.95,
      d3.max(healthData, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);

  return xLinearScale;
}

// function used for updating y-scale const upon click on axis label
// function yScale(healthData, chosenYAxis) {
//     // create scales
//     var yLinearScale = d3.scaleLinear()
//       .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
//         d3.max(healthData, d => d[chosenYAxis]) * 1.2
//       ])
//       .range([height, 0]);
  
//     return yLinearScale;
//   }

// function used for updating xAxis const upon click on axis label
function renderAxes(newXScale, xAxis) {
  const bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating xAxis const upon click on axis label
// function renderXAxes(newXScale, xAxis) {
//     const bottomAxis = d3.axisBottom(newXScale);
  
//     xAxis.transition()
//       .duration(1000)
//       .call(bottomAxis);
  
//     return xAxis;
//   }

// function used for updating yAxis const upon click on axis label
// function renderYAxes(newYScale, yAxis) {
//     var leftAxis = d3.axisLeft(newYScale);
  
//     yAxis.transition()
//       .duration(1000)
//       .call(leftAxis);
  
//     return yAxis;
//   }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
    //   .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
  }

// function used for updating labels for circles with a
// transition to new circles
function renderCirclesText(circlesText, newXScale, chosenXAxis) {

    circlesText.transition()
      .duration(1000)
      .attr("dx", d => newXScale(d[chosenXAxis]));
    //   .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesText;
  }

// function used for updating circles group with a transition to
// new circles
// function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

//   circlesGroup.transition()
//     .duration(1000)
//     .attr("cx", d => newXScale(d[chosenXAxis]))
//     .attr("cy", d => newYScale(d[chosenYAxis]));

//   return circlesGroup;
// }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    var xlabel  = "";
    if (chosenXAxis === "poverty") {
        xlabel = "Percent in Poverty: ";
    }
    else if (chosenXAxis === "age") {
        xlabel = "Median Age: ";
    } else {
        xlabel = "Median Household Income: $";
    }

    var ylabel = "Percent Lacking Healthcare: ";
    // if (chosenYAxis === "healthcare") {
    //     ylabel = "Percent w/o Healthcare:";
    // }
    // else if (chosenYAxis === "smokes") {
    //     ylabel = "Percent that Smokes:";
    // } else {
    //     ylabel = "Obesity Percentage:";
    // }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xlabel}${d[chosenXAxis]}<br>${ylabel}${d.healthcare}`);
        });

    // const toolTip = d3.tip()
    // .attr("class", "tooltip")
    // .offset([80, -60])
    // .html(function(d) {
    //     return (`${ylabel} ${d[chosenYAxis]}<br>${xlabel} ${d[chosenXAxis]}`);
    // });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
        // highlight chosen data point
        d3.select(this).style("stroke", "#393939");
    })
    // onmouseout event
    .on("mouseout", function(data) {
        toolTip.hide(data, this);
        // unhighlight the data point
        d3.select(this).style("stroke", "#FFFFFF");
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
(async function(){
    const healthData = await d3.csv("data1.csv");

    // parse data
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // xLinearScale function is initially set the the default x display
    let xLinearScale = xScale(healthData, chosenXAxis);

    // yLinearScale function is initially set the the default y display
    //let yLinearScale = yScale(healthData, chosenYAxis);

    // Create y scale function
    let yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(healthData, d => d.healthcare)+2])
        .range([height, 0]);

    // Create initial axis functions
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // **********************
    // append y axis *****************
    chartGroup.append("g")
        .call(leftAxis);
    // let yAxis = chartGroup.append("g")
    //     .classed("y-axis", true)
    //     .attr("transform", `translate(${height}, 0)`)
    //     .call(leftAxis);

    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(healthData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 10)
        .attr("fill", "red")
        .attr("opacity", ".6");

    // append initial labels for circles
    let circlesText = chartGroup.selectAll(".circle")
        .data(healthData)
        .enter()
        .append("text")
        .text(function(data) { return data.abbr; })
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d.healthcare)+3)
        .attr("font-size", "10px")
        .attr("fill", "white")
        .attr("text-anchor", "middle");

    // Create group for  3 x-axis labels
    const xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    const povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)")
        .style("fill", "darkred");

    const ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)")
        .style("fill", "darkred");

        const incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for the event listener
        .classed("inactive", true)
        .text("Household Income (Median)")
        .style("fill", "darkred"); 

    // Create group for 3 y-axis labels
    // const yLabelsGroup = chartGroup.append("g")
    //     .attr("transform", "rotate(-90)", `translate(${margin.left-margin.top}, ${height/2})`);

    // const healthcareLabel = yLabelsGroup.append("text")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("dy", "1em")
    //     .attr("value", "healthcare") // value to grab for event listener
    //     .classed("active", true)
    //     .text("Lacks Healthcare (%)");

    // const smokesLabel = yLabelsGroup.append("text")
    //     .attr("x", -20)
    //     .attr("y", 0)
    //     .attr("dy", "1em")
    //     .attr("value", "smokes") // value to grab for event listener
    //     .classed("inactive", true)
    //     .text("Smokes (%)");

    // const obeseLabel = yLabelsGroup.append("text")
    //     .attr("x", -40)
    //     .attr("y", 0)
    //     .attr("dy", "1em")
    //     .attr("value", "obesity") // value to grab for event listener
    //     .classed("inactive", true)
    //     .text("Obese (%)");

    // append y axis
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .attr("font-weight", 800)
        .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // updateToolTip function above csv import
    //circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
        // get value of selection
        const value = d3.select(this).attr("value");
        // this prevents the page from rebuilding the same chart
        if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxes(xLinearScale, xAxis);

            // updates x axis with transition
            //xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates labels for circles with new x values
            circlesText = renderCirclesText(circlesText, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
        }
    });
    // y axis labels event listener
    // yLabelsGroup.selectAll("text")
    //     .on("click", function() {
    //     // get value of selection
    //     var value = d3.select(this).attr("value");
    //     // this prevents the page from rebuilding the same chart
    //     if (value !== chosenYAxis) {

    //         // replaces chosenYAxis with value
    //         chosenYAxis = value;

    //         // console.log(chosenYAxis)

    //         // functions here found above csv import
    //         // updates y scale for new data
    //         yLinearScale = yScale(healthData, chosenYAxis);

    //         // updates y axis with transition
    //         yAxis = renderYAxes(yLinearScale, yAxis);

    //         // updates circles with new y values
    //         circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

    //         // updates tooltips with new info
    //         circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

    //         // changes classes to change bold text
    //         if (chosenYAxis === "healthcare") {
    //             healthcareLabel
    //                 .classed("active", true)
    //                 .classed("inactive", false);
    //             smokesLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //             obeseLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //         }
    //         else if (chosenYAxis === "smokes") {
    //             smokesLabel
    //                 .classed("active", true)
    //                 .classed("inactive", false);
    //             obeseLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //             healthcareLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //         }
    //         else {
    //             obeseLabel
    //                 .classed("active", true)
    //                 .classed("inactive", false);
    //             healthcareLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //             smokesLabel
    //                 .classed("active", false)
    //                 .classed("inactive", true);
    //         }
    //     }
    // });
})()