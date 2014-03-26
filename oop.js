
function Barchart(svgnum, store, metric, year) {
    this.store = store;
    this.metric = metric;
    this.year = year;
    this.data = function () {
	prepdata = $.grep(items, function(v) {
			return (v.Store == store && v.Description == metric && v.Year == year);
		});

		data = prepdata.sort(function(a,b) {return d3.ascending(a.Year+'-'+a.Quarter, b.Year+'-'+b.Quarter); });
		return data;
	};
	this.regiondata = function() {
		var q1 = [];
		var q2 = [];
		var q3 = [];
		var q4 = [];
		var regdata = [];
		
		var prepregiondata = $.grep(items, function(v) {
			return (v.Year == year && v.Description == metric);
		});

		for (var i = 0; i < prepregiondata.length; i++) {
			switch(prepregiondata[i].Quarter) {
				case 'Q1': q1.push(prepregiondata[i]); break;
				case 'Q2': q2.push(prepregiondata[i]); break;
				case 'Q3': q3.push(prepregiondata[i]); break;
				case 'Q4': q4.push(prepregiondata[i]); break; 
			}
		}

		for (var k = 1; k < 5; k++) {
			if(eval('q'+(k)).length > 0) {
				var sum = 0;
				for (var j = 0; j < eval('q'+(k)).length; j++) {
					sum += parseInt(eval('q'+(k))[j].Value);
				}
				var regavg = Math.round(sum / (eval('q'+(k)).length));
				var avg = {'Quarter': k, "Value": regavg };
				regdata.push(avg);
			}
		}
		return regdata;
	};

	// draw graph baased on data
	this.drawGraph = function() {
		var margin = { top: 50, right: 20, bottom: 50, left: 60 },
        width = 270,
        height = 180;

        var xValues = d3.set(this.regiondata().map(function (d) { return d.Quarter; })).values().sort();
        var xScale = d3.scale.ordinal()
            .domain(xValues)
            .rangePoints([0, width], 1);

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], 0.1);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .tickFormat(function (d) { return d.slice(-2); })
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var tip = d3.tip()
            .attr('class', 'd3-tip svg'+svgnum)
            .offset([-10, 0])
            .html(function (d) { return parseValues(d.Value, metric); });

        var line = d3.svg.line()
            .interpolate("cardinal")
            .x(function (d) { return xScale(d.Quarter); })
            .y(function (d) { return y(d.Value); }); 

        var svg = d3.select(".results-container").insert("svg", ":first-child")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("id", "svg" + svgnum)
            .attr("class", 'lightshadow ' + this.getColor(metric))
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.call(tip);

        var linemax = d3.max(this.regiondata(), function (d) { return d.Value; });
        var barmax = d3.max(this.data(), function (d) { return d.Value; });
        var graphmax = Math.max(linemax, barmax);

        x.domain(this.data().map(function (d) { return d.Year + ' / ' + d.Quarter; }));
        y.domain([0, graphmax]);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.selectAll(".bar")
            .data(this.data())
        .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function (d) { return x(d.Year + ' / ' + d.Quarter); })
            .attr("width", x.rangeBand())
            .attr("y", height)
            .attr("height", 0)
            .on('click', this.openLink)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        svg.selectAll('rect').transition()
            .duration(2000)
            .attr("y", function (d) { return y(d.Value); })
            .attr("height", function (d) { return height - y(d.Value); });

        svg.append("text")
            .attr("x", (width / 2) - 5)
            .attr("y", -35)
            .attr("text-anchor", "middle")
            .attr("class", "graph-title")
            .text(year+' '+store);

        svg.append("text")
            .attr("x", (width / 2) - 5)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .attr("class", "graph-title")
            .text(metric);

        svg.append("path")
            .attr("class", "avg")
            .attr("d", line(this.regiondata()));

        var points = svg.selectAll(".point")
            .data(this.regiondata())
        .enter().append("svg:circle")
            .attr("stroke", "black")
            .attr("fill", "black")
            .attr("cx", function (d, i) { return xScale(d.Quarter); })
            .attr("cy", function (d, i) { return y(d.Value); })
            .attr("r", 3)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        svg.append("g")
            .attr("class", "closeme")
            .on('click', this.closeme)
            .on('mouseover', this.hoverred)
            .on('mouseout', this.hovergrey)
        .append("circle")
            .attr("class", "closeout")
            .attr("cx", 275)
            .attr("cy", -35)
            .attr("r", 11);

        svg.select(".closeme").append("path")
            .attr("d", "M271 -39 l8 8")
            .attr("stroke", "rgb(250,250,250)")
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round");

        svg.select(".closeme").append("path")
            .attr("d", "M271 -31 l8 -8")
            .attr("stroke", "rgb(250,250,250)")
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round");

        svg.append("g")
            .attr("transform", "translate(40, 215)")
            .attr("class", "legend");

        svg.select(".legend").append("line")
            .attr("x1", -8)
            .attr("y1", 0)
            .attr("x2", 8)
            .attr("y2", 0)
            .style("stroke", "black")
            .style("stroke-width", 1);

        svg.select(".legend").append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 3)
            .style("stroke", "black")
            .style("fill", "black");

        svg.select(".legend").append("text")
            .attr("x", 12)
            .attr("y", 3)
            .style("font-size", "10px")
            .text("regional avg");

        svg.select(".legend").append("rect")
            .attr("x", 100)
            .attr("y", -8)
            .attr("width", 16)
            .attr("height", 16)
            .attr("class", "bar");

        svg.select(".legend").append("text")
            .attr("x", 120)
            .attr("y", 3)
            .style("font-size", "10px")
            .text(store);
	}; 
}

Barchart.prototype = {
	constructor: Barchart,

	getColor:function(metric) { // set color for graph
		switch (metric) {
            case "Whole Planet Foundation Fundraising": return 'color1';
            case "Holiday Donations": return 'color2';
            case "Whole Kids Foundation Fundraising": return 'color3';
            case "Nickels for Non-Profits": return 'color4';
            case "Community Garden Support": return 'color5';
            case "Gift Card Sales": return 'color6';
            case "Whole Trade Sales - Regional Comparison": return 'color7';
            case "CTC Sales": return 'color8';
            case "Open POs Past Expected Dates": return 'color9';
            case "POs Created after Delivery": return 'color10';
            case "Out of Period": return 'color11';
            case "Cool Beans": return 'color12';
            case "Green Trek": return 'color13';
            case "Biometric Screening Participation": return 'color14';
            case "Whole Planet Foundation Volunteerism": return 'color15';
            case "Team Member Survey Participation": return 'color16';
            default: return 'color0';
        }
	},

	openLink:function(d) { // opens data link when clicked on single bar in chart
		window.open(d.Link);
	},

	hoverred:function(g) { // turns x to red
		$(this).find('circle').css("fill", "red");
	},

    hovergrey:function(g) { // turns x to grey
		$(this).find('circle').css("fill", "rgb(200,200,200)");
	},

	closeme:function(svg) { // deletes the bar chart
        var idnum = ($(this).closest('svg').attr('id'));
        $('#' + idnum).animate({ opacity: 0.5, width: '0px' }, 400, function () { $(this).closest('svg').remove(); });
        $('.'+idnum).remove();
    }
};

function parseValues(value, metric) { // formats value and valuetype
	var type;
    for (var i = 0; i < definitions.length; i++) {
        if (definitions[i].Description == metric) {
            type = definitions[i].ValueType;
        }
    }

    if (type == 3) {
        return '$' + numberWithCommas(value);
    } else if (type == 2) {
        return value + '%';
    } else { return numberWithCommas(value); }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// add available metrics to corresponding <select> based on selected store
function propMetrics(enabledMetrics) {
    //remove existing options first
    $('#selectMetric option').not('.default').remove();
    var availableMetrics = [];
    var metricsList = [];

    //filter data by Store
    var store = $('#selectStore option:selected').text();
    metricList = $.grep(items, function (v) {
        return (v.Store == store);
    });

	//add unique metrics to availableMetrics array 
    for (var i = 0; i < metricList.length; i++) {
        var object = metricList[i];
        var exists = false;
        jQuery.each(availableMetrics, function (index, avMetric) {
            if (object.Description == avMetric) {
                exists = true;
            }
        });
        if (exists === false) {
            availableMetrics.push(object.Description);
        }
    }

    // Cross check availableMetrics with enabledMetrics store metrics in metricsList
    for (var j = 0; j < availableMetrics.length; j++) {
        if (enabledMetrics.indexOf(availableMetrics[j]) !== -1) {
            metricsList.push(availableMetrics[j]);
        }
    }

    // Append metricsList to select
    $.each(metricsList, function (key, value) {
        $('#selectMetric')
        .append($('<option>', { value: key })
        .text(value));
    });

    $('#selectMetric>option:eq(0)').prop('selected', true);
}

// add available years to corresponding <select> based on selected store and metric
function propYears() {
    //remove existing options
    $('#selectYear option').not(':eq(0)').remove();
    var availableYears = [];

    var currentYear = new Date().getFullYear();
    if ($('#selectMetric option:selected').text() == 'Current Campaign') {
        availableYears = [currentYear];
    }

    //filter data by metric and store
    var store = $('#selectStore option:selected').text();
    var metric = $('#selectMetric option:selected').text();
    yearList = $.grep(items, function (v) {
        return (v.Store == store && v.Description == metric);
    });

    //add unique years to availableYears array and append options to select
    for (var i = 0; i < yearList.length; i++) {
        var object = yearList[i];
        var exists = false;
        jQuery.each(availableYears, function (index, avmetric) {
            if (object.Year == avmetric) {
                exists = true;
            }
        });
        if (exists === false) {
            availableYears.push(object.Year);
        }
    }

    availableYears.sort(function (a, b) { return b - a; });

    $.each(availableYears, function (key, value) {
        $('#selectYear')
        .append($('<option>', { value: key })
        .text(value));
    });

    $('#selectYear>option:eq(1)').prop('selected', true);
}

function init() {

    // Send button event handler
    var svgnum = 1; //counter for number of svg graphs
    $("#send").click(function () {
        var filterYear = $('#selectYear option:selected').text();
        var filterMetric = $('#selectMetric option:selected').text();
        var filterStore = $('#selectStore option:selected').text();

        // Make sure each <select> has been selected
        if (filterStore != 'Select Store' && filterMetric != 'Select Metric' && filterYear != 'Select Year') {
            if(filterMetric == 'Current Campaign') { //create new Barchart for every metric in mainPage
                filterMetric = mainPage;
                for (var i = 0; i < filterMetric.length; i++) {
                    var svg = new Barchart(svgnum, filterStore, filterMetric[i], filterYear);
                    svg.drawGraph();
                    svgnum++;
                }
            } else { //create single new Barchart
                var svg = new Barchart(svgnum, filterStore, filterMetric, filterYear);
                svg.drawGraph();
                svgnum++;
            }
        } else { 
            if (filterStore == 'Select Store') {
                alert('Please select a Store.');
            } else if (filterMetric == 'Select Metric') {
                alert("Please select a Metric.");
            } else {
                alert('Please select a Year.');
            }
        }
    });
	
	//add main page metrics to mainPage array
	var mainPage = []; 
    for (var i = 0; i < definitions.length; i++) {
        if (definitions[i].MainPage == 1) {
            mainPage.push(definitions[i].Description);
        }
    }

    //add enabled metrics to enabledMetrics array
    var enabledMetrics = []; 
    for (var j = 0; j < definitions.length; j++) {
        if (definitions[j].Enabled == 1) {
            enabledMetrics.push(definitions[j].Description);
        }
    }

    //add unique stores to availableStores array and append options to select
    var availableStores = []; // list of available stores
    for (var k = 0; k < items.length; k++) {
        var object = items[k];
        var exists = false;
        jQuery.each(availableStores, function (index, avStore) {
            if (object.Store == avStore) {
                exists = true;
            }
        });
        if (exists === false) {
            availableStores.push(object.Store);
        }
    }

    $.each(availableStores, function (key, value) {
        $('#selectStore')
        .append($('<option>', { value: key })
        .text(value));
    });

    //OnChange event handler to display Metric dropdown
    $('#selectStore').change(function (value) {
        $('#selectYear option').not(':eq(0)').remove(); 
        $('#selectYear').prop('disabled', true); 
        if ($('#selectStore option:selected').text() == 'Select Store') {
            $('#selectMetric').prop('disabled', true);
        } else {
            $('#selectMetric').prop('disabled', false);
        }
        propMetrics(enabledMetrics);
        $('#selectMetric').focus();
    });

    //OnChange event handler to display Year dropdown
    $('#selectMetric').change(function (value) {
        if ($('#selectMetric option:selected').text() == 'Select Metric') {
            $('#selectYear').prop('disabled', true);
        } else {
            $('#selectYear').prop('disabled', false);
        }
        propYears();
        $('#selectYear').focus();
    });

    // OnChange event handler for Submit button
    $('#selectYear').change(function (value) {
        if ($('#selectYear option:selected').text() != 'Select Year') {
            $('#send').focus();
        }
    });
}

$(document).ready(function () {
  init();
  $('#selectStore').focus();
});