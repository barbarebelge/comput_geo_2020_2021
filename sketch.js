

const CANVAS_WIDTH_MULTIPLIER = 0.485;
const POINT_RADIUS = 5;
const PLACEHOLDER_TEXT = "Place Points Here";





var makeCanvas = function(p) {
	p.points = [];
	p.convexHullPoints = [];
	p.canPlacePoints = true;
	p.leftMostPointIdx = null;
	p.pointsLimit = null;
	p.lastClickedPointIdx = null;


	p.reset = function ()
	{
		p.points = [];
		p.convexHullPoints = [];
		p.canPlacePoints = true;
		p.leftMostPointIdx = null;
		p.pointsLimit = null;
		p.lastClickedPointIdx = null;
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
		    p.showPoints();
		    p.showConvexHull();
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
				//console.log("\n=======\n");
				// console.log("nb convex hull points: ", convexHullPoints.length);
				console.log("last clicked point idx: ", i);
				return p.points[i];
			}
		}
		return null;
	};


	/** Do operations when the canvas is clicked. */
	p.mousePressed = function () {
		if (p.mouseButton === p.LEFT) 
		{
			// check that the click is inside the canvas
			if (p.mouseX <= p.width && p.mouseX >= 0 && p.mouseY <= p.height && p.mouseY >= 0) 
			{
				pt = p.checkClickedPoint(p.mouseX, p.mouseY);

				// if no existing point was clicked
				if (!pt) 
				{
					p.lastClickedPointIdx = null;
					if (p.canPlacePoints) 
					{
						if (! p.pointsLimit || p.points.length < p.pointsLimit)
						{
							console.log("adding point at", p.mouseX.toFixed(2), p.mouseY.toFixed(2));
						  	p.addPoint(p.mouseX, p.mouseY);

						  	if (p.pointsLimit == p.points.length)
							{
								showNotification("Point limit reached", NOTIF_BLUE);
								validatePointSet();
							}
						}
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


	/** Connects and highllights the convex hull shape if it exists. */
	p.showConvexHull = function () {
		if (p.convexHullPoints.length > 2)
		{
			for (let i = 0; i < p.convexHullPoints.length; ++i) 
			{
			  p.connectCHPoints(i, (i + 1) % p.convexHullPoints.length);
			}
		}
	};


	/** Draws a simple line between two points. */
	p.connectPoints = function (pt1, pt2) {
		// p.strokeWeight(1);
		// p.stroke(0, 0, 0);
		// p.fill("black");
		p.line(pt1.x, pt1.y, pt2.x, pt2.y);
		// p.strokeWeight(1);
		// p.noStroke();
	};


	/** Draws a colored line between two convex hull points points. */
	p.connectCHPoints = function (idx1, idx2) {
		p.strokeWeight(4);
		p.stroke(102, 255, 102, 210);
		p.connectPoints(p.convexHullPoints[idx1], p.convexHullPoints[idx2]);
		p.strokeWeight(1);
		p.noStroke();
		p.fill("black");
	};


	/** Add a point to the list of points and creates a new lavbel for it */
	p.addPoint = function (x, y) {
		//pointLabels.push("p" + str(points.length));
		pt = new Point(x, y);

		p.points.push(pt);

		if (p.leftMostPointIdx === null || pt.x < p.points[p.leftMostPointIdx].x) {
			p.leftMostPointIdx = p.points.length - 1;
		}
	};


	/** Compute the convex hull of the point set and saves it if its size is equal to the requested
	size. Returns the number of extreme points if a convex hull could be computed (at least three points) and
	the computed hull as the requested size (if there is one). Returns null otherwise. */
	p.computeConvexHull = function(requestedHullSize = null)
	{
		var nb_extreme_points = null;

		if (p.points.length <= 2)
		{
			showNotification("Not enough points to compute convex hull", FAILURE_RED);
		}
		else if (requestedHullSize && p.points.length < requestedHullSize)
		{
			showNotification("The number of points is lower than the requested convex hull size", FAILURE_RED);
		}
		else
		{
			let newConvexHullPoints = getGrahamScanConvexHull(p.points, p.leftMostPointIdx);
			if (requestedHullSize && newConvexHullPoints.length !== requestedHullSize)
			{
				showNotification("The convex hull size does not match the requested one", FAILURE_RED);
			}
			else
			{
				p.convexHullPoints = newConvexHullPoints;
				nb_extreme_points = p.convexHullPoints.length;
			}

		}

		return nb_extreme_points;
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
 * ======================  MAIN SKETCH BELOW ========================
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
var convexHullSize = null; // size of the first canvas's convex hull


function validatePointSet()
{
	var notifColor = NOTIF_BLUE;
	var notifText = null;
		
	if (currentCanvas === CANVAS_TYPE.LEFT)
	{
		convexHullSize = leftCanvas.computeConvexHull();

		// if the number of points was sufficient to compute a convex hull
		if (convexHullSize)
		{
			console.log("convex hull size:", convexHullSize);
			leftCanvas.setPointPlacement(false);
			rightCanvas.setPointPlacement(true);
			rightCanvas.pointsLimit = leftCanvas.points.length;
			console.log("right canvas max points:",rightCanvas.pointsLimit);
			currentCanvas = CANVAS_TYPE.RIGHT;
			notifText = "Validated left canvas, now unlocking right canvas";
			leftCanvas.redraw();
		}
	}

	else if (currentCanvas === CANVAS_TYPE.RIGHT)
	{
		if (rightCanvas.points.length !== leftCanvas.points.length)
		{
			console.log("hopla");
			notifText = "Right canvas's number of points does not match the left one";
			notifColor = FAILURE_RED;
		}

		else
		{
			let rightCanvasConvexHullSize = rightCanvas.computeConvexHull(convexHullSize);

			// the convex hull on the right has the right number of points
			if (rightCanvasConvexHullSize)
			{
				rightCanvas.setPointPlacement(false);
				currentCanvas = CANVAS_TYPE.NONE;
				notifText = "Validated right canvas, no canvas can be edited anymore";
				rightCanvas.redraw();
			}
			// if the size of the convex hull on the right does not match the requested convex hull
			// show error message and do nothing else
			else
			{
				notifText = "Right canvas's convex hull size does not match the left one";
				notifColor = FAILURE_RED;
				rightCanvas.reset();
				rightCanvas.pointsLimit = leftCanvas.points.length;
			}
		}

	}

	else
	{
		notifColor = FAILURE_RED;
		notifText = "Both point sets are already validated";
	}

	showNotification(notifText, notifColor);

}


/** Resets both left and right canvas. */
function reset()
{
	leftCanvas.reset();
	rightCanvas.reset();

	currentCanvas = CANVAS_TYPE.LEFT;
	leftCanvas.setPointPlacement(true);
	rightCanvas.setPointPlacement(false);

	console.log("reset done");
}
