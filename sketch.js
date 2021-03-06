

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
	p.allInnerSegments = [];
	p.allInnerSegmentsCombinations = [];
	p.triangulations = [];
	p.facesNb = 0;
	p.expectedFacesNb = 0;
	p.hslColors = [];
	p.triangIdxToShow = 0;
	p.triangulationFinder = null;

	p.reset = function ()
	{
		p.points = [];
		p.convexHullPoints = [];
		p.canPlacePoints = true;
		p.leftMostPointIdx = null;
		p.pointsLimit = null;
		p.lastClickedPointIdx = null;
		p.allInnerSegments = [];
		p.allInnerSegmentsCombinations = [];
		p.triangulations = [];
		p.triangulationFinder = null;
		p.facesNb = 0;
		p.expectedFacesNb = 0;
		p.hslColors = [];
		p.triangIdxToShow = 0;
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
		    if (! p.triangulations || p.triangulations.length <= 0)
	    	{
		    	p.showConvexHull();
	    	}
			if(p.hslColors.length !== 0){
				p.showColoredTriangles(p.triangulations[p.triangIdxToShow], p.hslColors);
			}
			// console.log("\nTRIANGULATION 0:\n", p.triangulations[0].length,'\n',p.triangulations[0]);
			if(p.triangulations.length !== 0){
				p.showTriangulation(p.triangulations[p.triangIdxToShow]);
			}
			// draw the points at the end to see them better
			p.textSize(12);
		    p.showPoints();
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


	p.showPoint = function (point, col="black"){
		p.push();
		let radius = POINT_RADIUS * 2;
		p.stroke(col);
		p.fill(p.color(col)); 
		p.ellipse(point.x, point.y, radius);
		p.pop();
	};

	/** Draws the ellipses for the points and marks the last clicked one. */
	p.showPoints = function () {
		var radius = null;
		for (let i = 0; i < p.points.length; ++i) 
		{
			if (i === p.lastClickedPointIdx) 
			{
			  p.strokeWeight(6);
			  p.stroke(255, 100, 100);
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
		const NB_CH_POINTS = p.convexHullPoints.length;
		if (NB_CH_POINTS > 2)
		{
			let pt1 = null;
			let pt2 = null;
			for (let i = 0; i < NB_CH_POINTS; ++i) 
			{
				pt1 = p.convexHullPoints[i];
				pt2 = p.convexHullPoints[(i + 1) % NB_CH_POINTS];
				p.connectPoints(pt1, pt2, "#66ff66", 4);
			  // p.connectCHPoints(i, (i + 1) % p.convexHullPoints.length);
			}
		}
	};

	/** Display a list of segments */
	p.showSegments = function(segments, color="black"){
		p.push();
		p.stroke(color);
		p.strokeWeight(2);
		for (let i = 0; i < segments.length; i++){
			let seg = segments[i];
			p.line(seg.p1.x, seg.p1.y, seg.p2.x, seg.p2.y);
		}
		p.pop();
	};

	p.showTriangulation = function (triangulation, color="black")
	{
		let tri = null;
		let trianglePoints = null;

		for(let i = 0; i < triangulation.length; ++i)
		{
			tri = triangulation[i];
			trianglePoints = [tri.p1, tri.p2, tri.p3];
			
			for (let j = 0; j < 3 ; ++j)
			{
				p.connectPoints(trianglePoints[j], trianglePoints[(j+1)%3], color, 4);
			}
		}
		
	};

	p.showTriangle = function (p1, p2, p3, hslColor)
	{
		p.fill(hslColor[0], hslColor[1], hslColor[2]);
		p.triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
	};

	p.showColoredTriangles = function(triangles, hslColors){
		p.push();
		p.noStroke();
  		p.colorMode(p.HSB, 100);

  		let tri = null;
		let trianglePoints = null;

		for(let i = 0; i < triangles.length; ++i)
		{
			tri = triangles[i];
			trianglePoints = [tri.p1, tri.p2, tri.p3];
			p.showTriangle(tri.p1, tri.p2, tri.p3, hslColors[i]);
		}

		p.pop();
	};

	/** Draws a simple line between two points. */
	p.connectPoints = function (pt1, pt2, color="black", strokeWeight=1) {
		p.push();
		p.strokeWeight(strokeWeight);
		p.stroke(color);
		p.line(pt1.x, pt1.y, pt2.x, pt2.y);
		p.pop();
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

	p.computeAllInnerSegments = function(){
		p.allInnerSegments = getAllInnerSegmentsOfPointSet(p.points, p.convexHullPoints);
	}

	/*
	It returns false if a next triangulation
	It returns true if all the triangulations were iterated
	*/
	p.computeNextTriangulation = function()
	{
		if (p.triangulationFinder === null)
		{
			// saves ref to the coroutine function but does not call it
			p.triangulationFinder = makeTriangulationGenerator(p.points, p.convexHullPoints, p.allInnerSegments);
		}

		let innerSegments = p.triangulationFinder.next();

		while (innerSegments !== null && SegmentSet.hasIntersections(innerSegments))
		{
			innerSegments = p.triangulationFinder.next();
		}
		if(innerSegments !== null){
			p.triangulations = [getTrianglesFromCombi(p.points, innerSegments, p.convexHullPoints)];
			//console.log("TRIANGULATION FROM GENERATOR:", innerSegments);
			if (p.triangulations && p.triangulations.length > 0)
			{
				p.facesNb = p.triangulations[0].length;
				p.expectedFacesNb = getPointSetTriangulationFacesNb(p.points.length, p.convexHullPoints.length);
				p.showTriangulation(p.triangulations[0]);
				p.redraw();
			}
			return false;
		}
		else{
			return true;
		}
	};

	p.resetTriangulationFinder = function(){
		p.triangulationFinder = null;
	}


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


var currentCanvasType = CANVAS_TYPE.LEFT;
var leftCanvas = new p5(makeCanvas, 'left-canvas');
var rightCanvas = new p5(makeCanvas, 'right-canvas');
rightCanvas.setPointPlacement(false);
var convexHullSize = null; // size of the first canvas's convex hull


function validatePointSet()
{
	var notifColor = NOTIF_BLUE;
	var notifText = null;
		
	if (currentCanvasType === CANVAS_TYPE.LEFT)
	{
		if (pointSetInGeneralPosition(leftCanvas.points))
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
				currentCanvasType = CANVAS_TYPE.RIGHT;
				notifText = "Validated left canvas, now unlocking right canvas";
				leftCanvas.redraw();
			}
		}

		else
		{
			leftCanvas.reset();
			notifColor = FAILURE_RED;
			notifText = "Left set: expect general position and a sufficient point spacing";
		}
	}

	else if (currentCanvasType === CANVAS_TYPE.RIGHT)
	{
		if (rightCanvas.points.length !== leftCanvas.points.length)
		{
			console.log("hopla");
			notifText = "Right canvas's number of points does not match the left one";
			notifColor = FAILURE_RED;
		}

		else if (pointSetInGeneralPosition(rightCanvas.points))
		{
			let rightCanvasConvexHullSize = rightCanvas.computeConvexHull(convexHullSize);

			// the convex hull on the right has the right number of points
			if (rightCanvasConvexHullSize)
			{
				rightCanvas.setPointPlacement(false);
				currentCanvasType = CANVAS_TYPE.NONE;
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

		else
		{
			rightCanvas.reset();
			rightCanvas.pointsLimit = leftCanvas.points.length;
			notifColor = FAILURE_RED;
			notifText = "Right set: expect general position and a sufficient point spacing";
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

	currentCanvasType = CANVAS_TYPE.LEFT;
	leftCanvas.setPointPlacement(true);
	rightCanvas.setPointPlacement(false);

	console.log("reset done");
}


/*
 *
 * ======================================  CLICK CALLBACKS ============================================
 *
 * 
 */


function validatePointSetClicked()
{
	validatePointSet();
}


function getCanvasMapping(compatibilityChecker)
{
	let triangulationLeft = leftCanvas.triangulations[0];
	let triangulationRight = rightCanvas.triangulations[0];
	let mapping = compatibilityChecker.getCompatibleTriangsBijection(triangulationLeft, triangulationRight);

	return mapping; 
}


function findCompatibleTriangulationsClicked()
{
	// if both canvas have been validated successfully, compute the triangulations
	// of both point sets
	if (currentCanvasType === CANVAS_TYPE.NONE)
	{
		showNotification("Searching compatible triangulation...", NOTIF_BLUE);
		console.log("Start search compatible triangulation.");
		leftCanvas.computeAllInnerSegments();
		rightCanvas.computeAllInnerSegments();

		let pointSet1 = leftCanvas.points;
		let pointSet2 = rightCanvas.points;
		let triangs1 = leftCanvas.triangulations;
		let triangs2 = rightCanvas.triangulations;
		let compatibilityChecker = new CompatibleTriangulationFinder(pointSet1, pointSet2);

		let canvasMapping = null;
		let endReached1 = false;
		let endReached2 = false;
		let counter1 = 0;
		let counter2 = 0; 
		while(canvasMapping === null && !endReached1)
		{
			counter1 += 1;
			endReached1 = leftCanvas.computeNextTriangulation();
			if(!endReached1){
				while(canvasMapping === null && !endReached2)
				{
					counter2 += 1;
					//console.log("Comparing point set 1 triangulation: ", counter1, "with point set 2 triangulation: ", counter2);
					endReached2 = rightCanvas.computeNextTriangulation(); // return true when end reached, no more nexts
					canvasMapping = getCanvasMapping(compatibilityChecker);
				}
				if(canvasMapping === null && endReached2){
					counter2 = 0;
					endReached2 = false;
					rightCanvas.resetTriangulationFinder();
				}
			}
		}

		let colorsNb = leftCanvas.facesNb;
		if(leftCanvas.facesNb < rightCanvas.facesNb){
			colorsNb = rightCanvas.facesNb; // save the biggest number to avoid erros in display in the case of no mapping at all
			console.log("The number of faces are different between the two point sets triangulations.");
		}

		let hslColors1 = getHSLColors(colorsNb);
		let hslColors2 = Array.from(hslColors1);
		let bijection = canvasMapping;

		console.log("Bijection: ", bijection);
		if(bijection !== null){
			showNotification("Compatible triangulation found.", SUCCESS_GREEN);
			for (let i = 0; i < bijection.length; i++){
				let i1 = bijection[i][0];
				let i2 = bijection[i][1];
				hslColors2[i2] = hslColors1[i1];
			}
		}
		else{
			showNotification("Compatible triangulation not found.", FAILURE_RED);
		}
		leftCanvas.hslColors = hslColors1;
		rightCanvas.hslColors = hslColors2;
		rightCanvas.redraw();
		leftCanvas.redraw();
	}

}


function nextTriangulationLeftClicked()
{
	if (currentCanvasType !== CANVAS_TYPE.LEFT)
	{
		leftCanvas.computeNextTriangulation();
	}
	else
	{
		showNotification("Cannot iterate on triangulation before having validated the canvas", FAILURE_RED);
	}
}