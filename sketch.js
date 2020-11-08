

const CANVAS_WIDTH_MULTIPLIER = 0.485;
const POINT_RADIUS = 5;
const PLACEHOLDER_TEXT = "Place Points Here";


class Canvas
{
	constructor(canvasDataObj)
	{

	}

	init(p5Obj)
	{
		p5Obj.setup = function() {
			p5Obj.createCanvas(p5Obj.windowWidth * CANVAS_WIDTH_MULTIPLIER, p5Obj.windowHeight);
			p5Obj.fill("black");
			p5Obj.noLoop();
		};

		p5Obj.draw = function() {
			p5Obj.background(200);
			if (canvas.points.length === 0) 
			{
		    	p5Obj.textSize(40);
		    	p5Obj.text(PLACEHOLDER_TEXT, p.windowWidth * CANVAS_WIDTH_MULTIPLIER / 2 - 100, p.windowHeight / 2 - 50);
			} 
			else 
			{
			    p.textSize(12);
			    showPoints(canvas);
			}
		};	


		/** Do operations when the canvas is clicked. */
		p.mousePressed = function () {
			if (p.mouseButton === p.LEFT) 
			{
				// check that the click is inside the canvas
				if (p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0) 
				{
					pt = checkClickedPoint(canvas, p.mouseX, p.mouseY);

					// if no existing point was clicked
					if (!pt) 
					{
						canvas.lastClickedPointIdx = null;
						if (canvas.canPlacePoints) 
						{
						  addPoint(canvas, p.mouseX, p.mouseY);
						}
					}

					p.redraw();
				}
			}
		};

		/** This Redraws the Canvas when the window is resized. */
		p.windowResized = function () {
		  p.resizeCanvas(p.windowWidth * CANVAS_WIDTH_MULTIPLIER, p.windowHeight);
		};
	}
}



// class Canvas
// {
// 	constructor(htmlId)
// 	{
// 		if (typeOf(htmlId) !== "string")
// 		{
// 	      throw new TypeError("The Operand of Canvas constructor should be a string for for an html identifier");
// 		}

// 		this.p5Obj = new p5(this.initP5Object, htmlId);
// 		this.points = [];
// 		this.canPlacePoints = true;
// 		this.leftMostPoint = null;
// 		this.leftMostPointIdx = null;
// 	}

// 	/** Resets all the attributes of the canvas to their initial values. */
// 	reset(canvas)
// 	{
// 		this.points = [];
// 		this.canPlacePoints = true;
// 		this.leftMostPoint = null;
// 		this.leftMostPointIdx = null;
// 		this.p5Object.redraw();
// 	}

// 	/** Define the methods of the p5 instance. */
// 	initP5Object(p) {
// 		var canvas = this;
// 		console.log(canvas);

// 		p.setup = function() {
// 			p.createCanvas(p.windowWidth * CANVAS_WIDTH_MULTIPLIER, p.windowHeight);
// 			p.fill("black");
// 			p.noLoop();
// 		};

// 		p.draw = function() {
// 			p.background(200);
// 			if (canvas.points.length === 0) 
// 			{
// 		    	p.textSize(40);
// 		    	p.text(PLACEHOLDER_TEXT, p.windowWidth * CANVAS_WIDTH_MULTIPLIER / 2 - 100, p.windowHeight / 2 - 50);
// 			} 
// 			else 
// 			{
// 			    p.textSize(12);
// 			    showPoints(canvas);
// 			}
// 		};	


// 		/** Do operations when the canvas is clicked. */
// 		p.mousePressed = function () {
// 			if (p.mouseButton === p.LEFT) 
// 			{
// 				// check that the click is inside the canvas
// 				if (p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0) 
// 				{
// 					pt = checkClickedPoint(canvas, p.mouseX, p.mouseY);

// 					// if no existing point was clicked
// 					if (!pt) 
// 					{
// 						canvas.lastClickedPointIdx = null;
// 						if (canvas.canPlacePoints) 
// 						{
// 						  addPoint(canvas, p.mouseX, p.mouseY);
// 						}
// 					}

// 					p.redraw();
// 				}
// 			}
// 		};

// 		/** This Redraws the Canvas when the window is resized. */
// 		p.windowResized = function () {
// 		  p.resizeCanvas(p.windowWidth * CANVAS_WIDTH_MULTIPLIER, p.windowHeight);
// 		};

// 	}
// }


var makeCanvas = function(p) {
	p.points = [];
	p.convexHullPoints = [];
	p.canPlacePoints = true;
	p.leftMostPoint = null;
	p.leftMostPointIdx = null;

	p.reset = function ()
	{
		p.points = [];
		p.convexHullPoints = [];
		p.canPlacePoints = true;
		p.leftMostPoint = null;
		p.leftMostPointIdx = null;
		p.redraw();
	};

	p.setup = function() {
		p.createCanvas(p.windowWidth * CANVAS_WIDTH_MULTIPLIER, p.windowHeight);
		p.fill("black");
		p.noLoop();
	};

	p.draw = function() {
		p.background(200);
		if (p.points.length === 0) 
		{
	    	p.textSize(40);
	    	p.text(PLACEHOLDER_TEXT, p.windowWidth * CANVAS_WIDTH_MULTIPLIER / 2 - 100, p.windowHeight / 2 - 50);
		} 
		else 
		{
		    p.textSize(12);
		    p.showPoints(p);
		}
	};


	/** Do operations when the canvas is clicked. */
	p.mousePressed = function () {
		if (p.mouseButton === p.LEFT) 
		{
			// check that the click is inside the canvas
			if (p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0) 
			{
				pt = p.checkClickedPoint(p, p.mouseX, p.mouseY);

				// if no existing point was clicked
				if (!pt) 
				{
					p.lastClickedPointIdx = null;
					if (p.canPlacePoints) 
					{
						console.log("adding point at", p.mousex, p.mouseY);
					  	p.addPoint(p.mouseX, p.mouseY);
					}
				}
				p.redraw();
			}
		}
	};


	/** Draws a simple line between two points. */
	p.connectPoints = function (pt1, pt2) {
		p.strokeWeight(1);
		p.stroke(0, 0, 0);
		p.fill("black");
		p.line(pt1.x, pt1.y, pt2.x, pt2.y);
		p.strokeWeight(1);
		p.noStroke();
	};


	/** Draws the ellipses for the points and marks the last clicked one. */
	p.showPoints = function () {
		var radius = null;
		for (let i = 0; i < p.points.length; ++i) 
		{
			if (i === p.lastClickedPointIdx) 
			{
			  p.strokeWeight(6);
			  p.stroke(255, 153, 153);
			  radius = POINT_RADIUS * 4;
			} 
			else 
			{
			  p.strokeWeight(1);
			  p.noStroke();
			  radius = POINT_RADIUS * 2;
			}

			p.ellipse(p.points[i].x, p.points[i].y, radius);
		}
	};

	/** Draws a simple line between two points. */
	p.connectPoints = function (pt1, pt2) {
		p.strokeWeight(1);
		p.stroke(0, 0, 0);
		p.fill("black");
		p.line(pt1.x, pt1.y, pt2.x, pt2.y);
		p.strokeWeight(1);
		p.noStroke();
	};


	/** Draws a colored line between two convex hull points points. */
	p.connectCHPoints = function (idx1, idx2) {
		p.strokeWeight(4);
		p.stroke(102, 255, 102, 210);
		p.connectPoints(convexHullPoints[idx1], convexHullPoints[idx2]);
		p.strokeWeight(1);
		p.noStroke();
		p.fill("black");
	};

	/** Connects and highllights the convex hull shape if it exists. */
	p.showConvexHull = function () {
		if (p.convexHullPoints.length > 3) 
		{
			for (let i = 0; i < p.convexHullPoints.length; ++i) 
			{
			  p.connectCHPoints(i, (i + 1) % p.convexHullPoints.length);
			}
		}
	};

	/** Returns a point if it was clicked on, and null if none was clicked.*/
	p.checkClickedPoint = function (x, y) {
		for (let i = 0; i < p.points.length; ++i) 
		{
			// if the click occured inside the radius of the point
			// then the point was clicked
			if (p.dist(x, y, p.points[i].x, p.points[i].y) < POINT_RADIUS) 
			{
				p.lastClickedPointIdx = i;
				console.log("\n=======\n");
				// console.log("nb convex hull points: ", convexHullPoints.length);
				console.log("last clicked point idx: ", i);
				return p.points[i];
			}
		}
		return null;
	};


	/** Add a point to the list of points and creates a new lavbel for it */
	p.addPoint = function (x, y) {
		//pointLabels.push("p" + str(points.length));
		pt = new Point(x, y);

		p.points.push(pt);

		if (p.leftMostPoint === null || pt.x < p.leftMostPoint.x) {
			p.leftMostPoint = pt;
			p.leftMostPointIdx = p.points.length - 1;
		}
	};

	/** Enable or disable point placement. */	
	p.setPointPlacement = function (boolVal) {
		p.canPlacePoints = boolVal;
	};

	// This Redraws the Canvas when resized
	p.windowResized = function () {
	  p.resizeCanvas(p.windowWidth * CANVAS_WIDTH_MULTIPLIER, p.windowHeight);
	};

};



/*
 *
 * 
 * ======================  CANVAS GENERIC METHODS BELOW ========================
 *
 * 
 * 
 */


const CANVAS_TYPE = {
    LEFT: "Left-canvas",
    RIGHT: "Right-canvas",
    NONE: "No-canvas"
};
Object.freeze(CANVAS_TYPE);


var currentCanvas = CANVAS_TYPE.LEFT;

var leftCanvas = new p5(makeCanvas, 'left-canvas');
var rightCanvas = new p5(makeCanvas, 'right-canvas');
rightCanvas.setPointPlacement(false);

var notifManager = new NotificationManager(); 


function validatePointSet()
{
	var notifColor = NOTIF_BLUE;
	var notifText = null;
		
	if (currentCanvas == CANVAS_TYPE.LEFT)
	{
		leftCanvas.setPointPlacement(false);
		rightCanvas.setPointPlacement(true);
		currentCanvas = CANVAS_TYPE.RIGHT;
		notifText = "Validated left canvas, now unlocking right canvas";
	}
	else if (currentCanvas == CANVAS_TYPE.RIGHT)
	{
		rightCanvas.setPointPlacement(false);
		currentCanvas = CANVAS_TYPE.NONE;
		notifText = "Validated right canvas, no canvas can be edited anymore";

	}
	else
	{
		notifColor = FAILURE_RED;
		notifText = "Both point sets are already validated";
	}

	notifManager.showNotification(notifText, notifColor);

}


/** Resets both left and right canvas. */
function reset()
{
	notifManager.reset();
	leftCanvas.reset();
	rightCanvas.reset();

	currentCanvas = CANVAS_TYPE.LEFT;
	leftCanvas.setPointPlacement(true);
	rightCanvas.setPointPlacement(false);

	console.log("reset done");
}
