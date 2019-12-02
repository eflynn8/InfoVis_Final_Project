d3.csv("aircraft_incidents.csv", function(data) {
    let flight_phase = data.map(function(d) {
        // console.log(d.Country)
        return [d.Broad_Phase_of_Flight, d.Total_Fatal_Injuries];
    });
    // console.log(flight_phase)

    let phase_frequency = {};
    flight_phase.forEach(function(e) {
        let d = e[0];
        if (d != "") {
            if (!(d in phase_frequency)) {
                phase_frequency[d] = 0;
            } else {
                phase_frequency[d]++;
            }
        }
    })

    let phase_frequency_arr = [];
    Object.keys(phase_frequency).forEach(function(d) {
        if (d != "") {
            phase_frequency_arr.push({ key: d, value: phase_frequency[d] })
        }
    });
    console.log(phase_frequency_arr)

    let phase_fatality = {};
    flight_phase.forEach(function(e) {
        let d = e[0];
        let fatalities = e[1];
        if (d != "") {
            if (!(d in phase_fatality)) {
                phase_fatality[d] = 0;
            } else {
                // console.log(fatalities)
                phase_fatality[d] += parseInt(fatalities);
            }
        }
    })

    let phase_fatality_arr = [];
    Object.keys(phase_fatality).forEach(function(d) {
        if (d != "") {
            phase_fatality_arr.push({ key: d, value: phase_fatality[d] })
        }
    });
    console.log(phase_fatality_arr);

    let margin = {top: 40, right: 30, bottom: 10, left: 50}, 
        width = 1000 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // set the ranges
    let xdim = d3.scaleBand().domain(Object.keys(phase_frequency))
        .range([0, width]).padding(0.1);
    let ydim = d3.scaleLinear().domain([d3.max(phase_frequency_arr, function(d) { return d.value; }), 0])
        .range([margin.top, height]);
    let colorScale = ["rgba(223, 245, 245, 1)", "rgba(174, 235, 235, 1)", "rgba(131, 199, 199, 1)", "rgba(99, 173, 173, 1)", "rgba(65, 148, 148, 1)", "rgba(38, 128, 128, 1)", "rgba(12, 82, 82, 1)"];
    // colorScale.domain(Object.keys(phase_frequency));

    let svg = d3.select("body").select("div").select("svg");
    let crashChart = svg.append("g")
        .attr("transform", "translate(60, " + height + ")").attr("class", "xScale")
        .call(d3.axisBottom(xdim));

    crashChart.append("g").attr("transform", "translate(0, " + -height + ")").call(d3.axisLeft(ydim).ticks(6));

    svg.append("text")              
      .attr("transform",
            "translate(" + (width / 2) + " ," + 
                           (height - margin.bottom + margin.top + 10) + ")")
      .style("text-anchor", "middle")
      .text("Phase of Flight");

    svg.append("text")
      .attr("id", "yaxis")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 + margin.left - 35)
      .attr("x", 0 - (height / 2))
      .style("text-anchor", "middle")
      .text("Number of Crashes");

    svg.append("text")
        .attr("transform", "translate(" + width / 2 + "," + (margin.top - 10) + ")")
        .style("text-anchor", "middle")
        .text("Crash Frequency by Phase of Flight");

    let size = 20;
    svg.selectAll("dots")
        .data(["0 - 50", "51 - 100", "101 - 150", "151 - 200", "201 - 250", "251 - 300", "300+"])
        .enter()
        .append("rect")
        .attr("x", 900)
        .attr("y", function(d, i) { return 10 + i * (size + 5)})
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d, i) { return colorScale[i]})

    svg.selectAll("labels")
        .data(["0 - 50", "51 - 100", "101 - 150", "151 - 200", "201 - 250", "251 - 300", "300+"])
        .enter()
        .append("text")
            .attr("x", 900 + size * 1.2)
            .attr("y", function(d, i) { return 10 + i * (size + 5) + (size / 2)})
            .style("fill", "black")
            .text(function(d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
    
    svg.append("text")
        .attr("id", "crash_info")
        .attr("transform", "translate(700, 20)")
        .style("text-anchor", "middle")
        .text("");

    svg.append("text")
        .attr("id", "fatal_info")
        .attr("transform", "translate(700, 60)")
        .style("text-anchor", "middle")
        .text("");

    let Tooltip = svg.append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    let mouseover = function(d) {
        Tooltip.style("opacity", 1)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }

    let mousemove = function (d) {
        Tooltip.html("Number of crashes: " + d.value)
        .style("left", (d3.mouse(this)[0]+70 + "px"))
        .style("top", d3.mouse(this)[1] + "px")
        d3.select("#crash_info").text("Number of Crashes: " + d.value);
        d3.select("#fatal_info").text("Number of Fatalities: " + phase_fatality[d.key]);
    }

    let mouseleave = function (d) {
        Tooltip.style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    svg.selectAll(".bar").data(phase_frequency_arr).enter().append("rect").attr("class", "bar")
        .attr("x", function(d) { return xdim(d.key)  + margin.left + 8; }).attr("width", xdim.bandwidth())
        .attr("y", function(d) { 
            return ydim(d.value); })
        .attr("height", function(d) { return height - ydim(d.value); })
        .style("fill", function(d) { 
            if (phase_fatality[d.key] <= 50) {
                return colorScale[0];
            } else if (phase_fatality[d.key] > 50 && phase_fatality[d.key] < 101) {
                return colorScale[1];
            } else if (phase_fatality[d.key] > 100 && phase_fatality[d.key] < 151) {
                return colorScale[2];
            } else if (phase_fatality[d.key] > 150 && phase_fatality[d.key] < 201) {
                return colorScale[2];
            } else if (phase_fatality[d.key] > 200 && phase_fatality[d.key] < 251) {
                return colorScale[3];
            } else if (phase_fatality[d.key] > 250 && phase_fatality[d.key] < 301) {
                return colorScale[4];
            } else if (phase_fatality[d.key] > 300) {
                return colorScale[5];
            }
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    // let Tooltip = svg.append(".div")
    //     .style("opacity", 0)
    //     .attr("class", "tooltip")
    //     .style("background-color", "white")
    //     .style("border", "solid")
    //     .style("border-width", "2px")
    //     .style("border-radius", "5px")
    //     .style("padding", "5px")

    // let mouseover = function(d) {
    //     Tooltip.style("opacity", 1)
    //     d3.select(this)
    //         .style("stroke", "black")
    //         .style("opacity", 1)
    // }

    // let mousemove = function (d) {
    //     Tooltip.html("Number of crashes: " + d.value)
    //     .style("left", (d3.mouse(this)[0]+70 + "px"))
    //     .style("top", d3.mouse(this)[1] + "px")
    // }

    // let mouseleave = function (d) {
    //     Tooltip.style("opacity", 0)
    //     d3.select(this)
    //         .style("stroke", "none")
    //         .style("opacity", 0.8)
    // }

    // // Line chart for times of year
    // let crash_date = data.map(function(d) {
    //     return d.Event_Date;
    // });

    // console.log(crash_date)
})