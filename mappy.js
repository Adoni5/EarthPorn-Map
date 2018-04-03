/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


		//In case of window resize, redraw the svg
        d3.select(window).on("resize", throttle);
		//get window information, set the svg width and height
        var c = document.getElementById('container');
        var width = c.offsetWidth;
        var height = width / 2;
		//create zoom function
        var zoom = d3.zoom()
                .scaleExtent([1, 12]).translateExtent([[0, -50], [width, height]])
                .on("zoom", move);
        //offsets for tooltips
        var offsetL = c.offsetLeft + 20;
        var offsetT = c.offsetTop + 10;
		//initialise the variables you need
        var topo, projection, path, svg, g;
		//Graticule lines on map
        var graticule = d3.geoGraticule();
		//Append the tooltip div
        var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");
        //Initialise variable X which will be used as the linear scale for placing the scale bar by pixel location
		var x;
		//call setup function to append svg, geoJson projection and add the countries g element
        setup(width, height);        

        function setup(width, height) {
            projection = d3.geoMercator()
                    .translate([(width / 2), (height / 2)])
                    .scale(width / 2 / Math.PI);
			//path variable used to generate path d values when plotting the geoJson Borders
            path = d3.geoPath().projection(projection);

            svg = d3.select("#container").append("svg")
                    .attr("id", "svg")
                    .attr("width", width)
                    .attr("height", height)

                    .call(zoom);
            // .on("click", click)

            g = svg.append("g").attr("id", "countries").attr("width", width)
                    .attr("height", height)
                    .on("click", click);
        }
		
		//scale and bar, 10 rgb values generated from d3 interpolatespectral, used as data for linear gradient
        var col = [];
        for (var i = 0; i <= 10; i++) {
            col.push(d3.interpolateSpectral(0.1 * i));
        }
        console.log(col);

        //call countries function
        countries();
        function countries() {
			//defs element thich contains linear gradient for scale
            var defs = svg.append("defs");
            //pixel value generator for scale bar
			x = d3.scaleLinear()
                    .domain([1, 11])
                    .rangeRound([150, width - 150]);
            //add linear gradient html5 to defs element, set its attributes to be horizontal
			var linearGradient = defs.append("linearGradient")
                    .attr("id", "linear-gradient");
            linearGradient
                    .attr("x1", "0%")
                    .attr("y1", "0%")
                    .attr("x2", "100%")
                    .attr("y2", "0%");
			//set colour locations on linear gradient, to add changes
            linearGradient.selectAll("stop")
                    .data(col)
                    .enter().append("stop")
                    .attr("offset", function (d, i) {
                        return i / (col.length - 1);
                    })
                    .attr("stop-color", function (d) {
                        return d;
                    });
			//add scale rectangle to svg and fill it with the linear gradient
            var k = svg.append("g")
                    .attr("class", "key");
            k.append("rect")
                    .attr("width", width - 300)
                    .attr("height", 8)
                    .attr("x", 150)
                    .attr("y", height-45)
                    .style("fill", "url(#linear-gradient)");
					
			//add zoomout button, calls reset on click, resets original zoom
            svg.append("svg:image").attr("xlink:href", "./zoomout.png")
                    .attr('width', '20')
                    .attr('height', '30')
                    .attr("x", 20)
                    .attr("y", (width / 2) - 35)
                    .on("click", reset);
			//add circle behind the zoomout button which also calls reset, is easier to click
            svg.append("circle").attr("r", 10).attr("fill", "transparent")
                    .attr("cx", 30)
                    .attr("cy", (width / 2) - 25)
                    .on("click", reset);
					
			//Read in country topojson
            d3.json("/json/countrie.topo.json", function (error, us) {
                if (error) {
                    throw error;
                }
				//get the features, which is the border path data
                var countries = topojson.feature(us, us.objects.countries).features;				
                topo = countries;
                //append country paths to svg, true means that we are drawing the country data.
                draw(topo, true);
                //remove usa
                g.selectAll("#United_States").remove();
                //append usa states paths to map, synchronously, calling here causes D3, which is asynchronous to instead wait for each function to finish
                states();
				//Get the number of posts for each state or country from the output.csv and calculate the colour value, then colour that state or country correspondingly on map
                Csv();
            });
        }
		//read the USA states json and draw it on the map
        function states() {
            d3.json("/json/states_usa.topo.json", function (error, us1) {
                if (error) {
                    throw error;
                }

                var countries = topojson.feature(us1, us1.objects.states).features;
                topo = countries;
				//draw the json onto the map, false here implies we are drawing the states not countries
                draw(topo, false);
            });
        }
		//read the csv file into the JS environment, and then calculate the colour correpsonding to the value and colour the map correctly
        function Csv() {
            d3.csv("output.csv", function (data) {
                //create dataset of country and count
				var dataset = (data.map(function (d) {
                    return [d["country"], +d["count"]];
                }));
                var Ar = [];
				//get the highest count from the dataset, create array of all counts and call math.amx
                for (var k = 0; k < dataset.length; k++) {
                    Ar.push(dataset[k][1]);
                }
                var highest = Math.max.apply(Math, Ar);
                
				//create colour scale to return correct colour for that value on the scale, for values between 1 and 10
                var colour = d3.scaleThreshold()
                        .domain(d3.range(1, 11))
                        .range(col);


                var a = [];
				//create an array with rounded values in tenth increments of the maximum value, to label the scale as the key
                for (var i = 0; i <= 10; i++) {
                    a.push(Math.round(highest * 0.1 * i));
                }
				//draw axis bottom value on scale, using the x scale from the begining to calculate equally spaced locations
                d3.select(".key").call(d3.axisBottom(x)
                        .tickSize(13)
                        .tickFormat(function (x, i) {
                            return a[i];
                        })
                        .tickSizeInner(0)
                        .tickSizeOuter(0)
                        .tickPadding(height - 33))
                        .select(".domain")
                        .remove();					
                //set the fill of the country or state to correct scaled colour, and the count as an attribute so we can have the count in the tooltip
                for (var k = 0; k < dataset.length; k++) {
                    var s = "#" + dataset[k][0].toString().replace(/ /, "_");
                    var s2 = dataset[k][1];
                    d3.selectAll(s).style("fill", d3.interpolateSpectral(s2 / highest)).attr("score", s2.toString());
                }
            });
        }
        //tooltips on mouseover function
        function handleMouseOver() {
            var mouse = d3.mouse(svg.node()).map(function (d) {
                return parseInt(d);

            });
            var y = 0;
            if (this.getAttribute("score")) {
                y = this.getAttribute("score");
            } else {
                y = 0;
            }
            tooltip.classed("hidden", false)
                    .attr("style", "left:" + (mouse[0] + offsetL) + "px;top:" + (mouse[1] + offsetT) + "px")
                    .html(this.__data__.properties.name + ": " + y);

        }
		//on mouse out, hide the tooltip
        function handleMouseOut() {
            tooltip.classed("hidden", true);
        }
		//draw the geoJSON paths  onto the svg borders to have them there
        function draw(topo, bool) {
            //country 
            if (bool) {
				//draw the graticule lines on the scale
                g.append("path")
                        .datum(graticule)
                        .attr("class", "graticule")
                        .attr("d", path);
				//draw the equator line
                g.append("path")
                        .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
                        .attr("class", "equator")
                        .attr("d", path);
				//select all country class, bind the topo data
                var country = g.selectAll(".country").data(topo);
				//enter the data and insert path element for each datum
                country.enter().insert("path")                        
						.attr("class", "country")
						//set the id replacing any white space with an underscore
                        .attr("id", function (d) {
                            return d.properties.name.replace(/ /, "_");
                        })
						//set the d value to draw the path
                        .attr("d", path)
                        .attr("title", function (d, i) {
                            return d.properties.name;
                        }).on("mouseover", handleMouseOver)
                        .on("mouseout", handleMouseOut);


                // same but for states
            } else if (!bool) {

                var states = g.append("g").attr("id", "states").selectAll("path").data(topo);

                states.enter().insert("path")
                        .attr("class", "states")
                        .attr("id", function (d, i) {
                            return d.properties.name.replace(/ /, "_");
                        })
                        .attr("d", path)
                        .attr("title", function (d, i) {
                            return d.properties.name;
                        })
                        .on("mouseover", handleMouseOver)
                        .on("mouseout", handleMouseOut);

            }

            //EXAMPLE: adding some capitals from external CSV file
            //  d3.csv("data/country-capitals.csv", function(err, capitals) {
            //
            //    capitals.forEach(function(i){
            //      addpoint(i.CapitalLongitude, i.CapitalLatitude, i.CapitalName );
            //    });
            //
            //  });

        }
		//on pressing zommout button, reset the svg zoom.scale object to 1
        function reset() {            
            d3.select("#svg").transition().duration(750).call(zoom.scaleTo, 1);
        }

		//function redraws the svg, calls setup, then redraws all the paths and colours them by calling countries
        function redraw() {
            width = c.offsetWidth;
            height = width / 2;
            d3.select('svg').remove();
            setup(width, height);
            countries();
        }
		//function to allow panning
        function move() {
            g.attr("transform", d3.event.transform);
        }
		//throttle is called on windo resize, in itself calls redraw after 200ms
        var throttleTimer;
        function throttle() {
            window.clearTimeout(throttleTimer);
            throttleTimer = window.setTimeout(function () {
                redraw();
            }, 200);
        }


        // geo translation on mouse click in map
        function click() {
            var latlon = projection.invert(d3.mouse(this));
            console.log(latlon);
        }


        //function to add points and text to the map (used in plotting capitals)
        function addpoint(lat, lon, text) {

            var gpoint = g.append("g").attr("class", "gpoint");
            var x = projection([lat, lon])[0];
            var y = projection([lat, lon])[1];

            gpoint.append("svg:circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("class", "point")
                    .attr("r", 1.5);

            //conditional in case a point has no associated text
            if (text.length > 0) {

                gpoint.append("text")
                        .attr("x", x + 2)
                        .attr("y", y + 2)
                        .attr("class", "text")
                        .text(text);
            }

        }

