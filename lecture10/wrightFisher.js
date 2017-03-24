var plotVertices = true;
var trace = [];

var Key = {
  LEFT:   37,
  UP:     38,
  RIGHT:  39,
  DOWN:   40
};

window.onload = function() {
	
	N = 32;
	G = 64;
	for (var i = 1; i <= N; i++) {
		trace.push(i);
	}

	canvas = document.getElementById("canvas"); // grabs the canvas element
	ctx = canvas.getContext("2d"); // returns the 2d context object
	
	window.addEventListener('keydown', function(evt) {
								
		switch (evt.keyCode) {
			case Key.UP:
				setG(G + 1);
				break;
			case Key.DOWN:
				if (G > 2) {
				  setG(G - 1);
				}
				break;
			case Key.LEFT:
				if (N > 2) {
				  setN(N - 1);
				}
				break;
			case Key.RIGHT:
				  setN(N + 1);
				break;
			default: ;
		}
	});
	
	window.addEventListener('keypress', function(evt) { 
		if (evt.key == 'n') {
			addGenerationGenerateAndDraw();
		}

		if (evt.key == 'v') {
			vertex = !vertex;
			drawWrightFisher();
		}

	});
	regenerate();
}

var intervalId = null;
 
function run() {
	intervalId = setInterval(nextGeneration, 67);
}
  
function stop() {
	if (intervalId !== null) {
		clearInterval(intervalId);
		intervalId = null;
	}
}

function setG(g) {
	G = parseInt(g);
	regenerate();
}

function setN(n) {
	N = parseInt(n);
	
	trace = [];
	for (var i = 1; i <= N; i++) {
		trace.push(i);
	}
	
	regenerate();
}


// calculate the next generation and re-draw the whole wright-fisher population
function nextGeneration() {
	addGeneration();
	drawWrightFisher();	
}

function regenerate() {
	generateWrightFisher();
	drawWrightFisher();		
}

function setPlotVertices(checkbox) {
	plotVertices = checkbox.checked;	
	drawWrightFisher();		
}

function generateWrightFisher() {
	pop = initialPopulation(G, N);
	sortPopulation(pop);
}

function drawWrightFisher() {
	ctx.fillStyle = "#FFFFFF"; // sets color
	ctx.fillRect(0, 0, width(), height()); // sets top left location points x,y and then width and height
	ctx.strokeStyle = "#808080";
	ctx.lineWidth = 0.5;
	plotWrightFisher(ctx);
	ctx.strokeStyle = "#FF0000";
	ctx.lineWidth = 1.5;
		
	traceCoalescence(trace, pop[0], ctx);
	ctx.stroke();
}

// adds a generation to the population and removes the oldest generation
function addGeneration() {
	
	var ngen = pop.length;
	
	tmp = pop[ngen-1];
	
	// shift current generations up one
	for (var i = ngen-1; i > 0; i--) {
		pop[i] = pop[i-1];	
		
		// update gen numbers
		for (var j = 0; j < N; j++) {
			pop[i][j].gen = i;
		}
	}
	
	// reuse oldest generation
	pop[0] = tmp;
	
	// insert new generation in zero'th row
	for (var j = 0; j < N; j++) {
		
		// clear old parent links from new oldest generation
		pop[ngen-1][j].parent = null;
		
		// rewrite data in new generation
		pop[0][j].label = j+1;
		pop[0][j].gen = 0;
		pop[0][j].parent = pop[1][Math.floor((Math.random() * N))];
	}	
	
	// sort this generation by parent numbers
	pop[0].sort(function(a, b) {
		return a.parent.num - b.parent.num
	});
	// number this generation after sorting
	for (var j = 0; j < N; j++) {
		pop[0][j].num = j;
	}
}

function width() {
	return canvas.width;
}

function height() {
	return canvas.height;
}

function plotWrightFisher(context) {
	scale = Math.min(width() / (N + 2), height() / (G + 2));
	
	
	
	xMargin = (width() - scale * (N + 2.0)) / 2.0
	yMargin = (height() - scale * (G + 2)) / 2.0
	radius = scale * 0.23;
	context.beginPath();
	for (i = 1; i <= N; i++) {
		for (j = 1; j <= G; j++) {
			x = i * scale + xMargin
			y = height() - yMargin - j * scale
			plotParentLine(pop[j - 1][i - 1], context)
		}
	}
	context.stroke();
	
	if (plotVertices) {
		for (i = 1; i <= N; i++) {
			for (j = 1; j <= G; j++) {
				x = i * scale + xMargin
				y = height() - yMargin - j * scale
					//text(pop[j-1][i-1].label,i*scale+xMargin, height - yMargin - j*scale)
				context.beginPath();
				context.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI)
				context.fill();
				context.stroke();
			}
		}
	}
}

function plotParentLine(node, context) {
	x = (node.num + 1) * scale + xMargin;
	y = height() - yMargin - (node.gen + 1) * scale;
	if (node["parent"]) {
		p = node.parent;
		px = (p.num + 1) * scale + xMargin;
		py = height() - yMargin - (p.gen + 1) * scale;
		context.moveTo(x, y);
		context.lineTo(px, py);
	}
}

function plotCoalescentLine(node, context) {
	x1 = scale + xMargin;
	x2 = scale * N + xMargin;
	y = height() - yMargin - (node.gen + 1) * scale;
	context.moveTo(x1, y);
	context.lineTo(x2, y);
}

function initialPopulation(G, N) {
	var arr = [];
	// Creates all generations:
	for (var i = 0; i < G; i++) {
		// Creates an empty line
		arr.push([]);
		// Adds cols to the empty line:
		arr[i].push(new Array(N));
	}
	// populate generations from oldest to most recent
	for (var i = G - 1; i >= 0; i--) {
		for (var j = 0; j < N; j++) {
			// Initializes:
			arr[i][j] = {
				label: j + 1
			};
			arr[i][j].gen = i;
			arr[i][j].num = j;
			if (i < G - 1) {
				arr[i][j].parent = arr[i + 1][Math.floor((Math.random() * N))];
			}
		}
	}
	return arr;
}

function traceCoalescence(labels, gen, context) {
	nodes = [];
	for (var j = 0; j < N; j++) {
		if (labels.indexOf(gen[j].label) > -1) {
			nodes.push(gen[j]);
		}
	}
	traceNodes(nodes, context);
}

function traceNodes(nodes, context) {
	parents = [];
	context.beginPath();
	for (var j = 0; j < nodes.length; j++) {
		plotParentLine(nodes[j], context);
		if (nodes[j]["parent"]) {
			if (parents.indexOf(nodes[j].parent) === -1) {
				parents.push(nodes[j].parent);
			}
		}
	}
	context.stroke();
	if (parents.length < nodes.length && parents.length > 0) {
		context.strokeStyle = "#0000FF";
		context.beginPath();
		plotCoalescentLine(parents[0], context);
		context.stroke();
		context.strokeStyle = "#FF0000";
	}
	if (parents.length > 0) {
		traceNodes(parents, context);
	}
}

function sortPopulation(pop) {
	for (i = (G - 2); i >= 0; i--) {
		gen = pop[i];
		// sort this generation by parent numbers
		gen.sort(function(a, b) {
			return a.parent.num - b.parent.num
		});
		// renumber this generation after sorting
		for (var j = 0; j < N; j++) {
			gen[j].num = j;
		}
	}
}