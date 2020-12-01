

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
	p.combinationIdx = null;
	p.dcelSegments = [];
	p.vtxPt = null;
	p.triangulations = [];


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
		p.combinationIdx = null;
		p.dcelSegments = [];
		p.vtxPt = null;
		p.triangulations = [];
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
		    //p.showSegments(p.allInnerSegments); // TMP display
		    if(p.allInnerSegmentsCombinations.length != 0){ // TMP display
		    	p.showSegments(p.allInnerSegmentsCombinations[p.combinationIdx], "red");
		    	// the last combination is using all the inner segments
			}
			if(p.dcelSegments.length !== 0){
				p.showSegments(p.dcelSegments, "blue");
			}
			if(p.vtxPt !== null){
				p.showPoint(p.vtxPt, "green");
			}
			if(p.triangulations.length !== 0){
				p.showTriangulation(p.triangulations[0], "orange");
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

								// Triangulation with lists
								p.triangulations = getAllTriangulations(p.points, p.convexHullPoints);

								/* // TO REMOVE: used to verify polygon class and areSegmentPoints()
								let polygon = new Polygon(p.convexHullPoints);
								console.log("Polygon Segment: "+polygon.areSegmentPoints(p.convexHullPoints[0],p.convexHullPoints[1]));
								console.log("Polygon Segment: "+polygon.areSegmentPoints(p.convexHullPoints[1],p.convexHullPoints[0]));
								console.log("Polygon Segment: "+polygon.areSegmentPoints(p.convexHullPoints[0],p.convexHullPoints[p.convexHullPoints.length-1]));
								console.log("Polygon Segment: "+polygon.areSegmentPoints(p.convexHullPoints[p.convexHullPoints.length-1], p.convexHullPoints[0]));
								console.log("Polygon Segment: "+polygon.areSegmentPoints(p.convexHullPoints[0],p.convexHullPoints[2]));
								*/

								// Triangulation with DCEL 
								/* 
								console.log("Triangulation Faces: " + getPointSetTriangulationFacesNb(p.points.length, p.convexHullPoints.length));
								console.log("Triangulation Edges: " + getPointSetTriangulationEdgesNb(p.points.length, p.convexHullPoints.length));
								let triangInnerEdgesNb = getPointSetTriangulationInnerEdgesNb(p.points.length, p.convexHullPoints.length);
								console.log("Triangulation Inner Edges: " + triangInnerEdgesNb);
								p.allInnerSegments = getAllInnerSegmentsOfPointSet(p.points, p.convexHullPoints);
								console.log("All inner segments len: " + p.allInnerSegments.length);
								p.allInnerSegmentsCombinations = getCombinationsOfSizeK(p.allInnerSegments, triangInnerEdgesNb)
								console.log("All inner segments combinations len: " + p.allInnerSegmentsCombinations.length);
								//console.log("All Inner Segments Combinations");
								//console.log(p.allInnerSegmentsCombinations);
								let dcel = new DCELGraph();
								dcel.initFromConvexHullPoints(p.convexHullPoints);
								p.allInnerSegmentsCombinations = getSegsCombiWithNoIntersect(p.allInnerSegmentsCombinations);
								console.log("Combis with no intersection: " + p.allInnerSegmentsCombinations.length);
								p.combinationIdx = 0;
								let combi = p.allInnerSegmentsCombinations[p.combinationIdx];
								console.log(combi);
								console.log("Segments List Intersect: " + areSegmentsListIntersect(combi));
								let seg = combi[0];
								//let seg = new Segment(dcel.vertices[0].pt, dcel.vertices[2].pt);
								let vtxIdx = dcel.getCommonVertexIdxOfSegment(seg);
								p.vtxPt = dcel.getVertexOfIdx(vtxIdx).pt;
								//dcel.addEdgeFromSegment(seg, vtxIdx);
								//p.dcelSegments = getEdgesToSegments(dcel.getAllIncidentOutEdgesOfVertex(dcel.vertices[0]));
								//p.dcelSegments = dcel.getFaceSegsFromIdx(0);
								//p.dcelSegments = dcel.getFaceSegsFromIdx(1);
								//dcel.addSegments(combi);
								console.log("Vtx Idx: "+ vtxIdx);
								p.dcelSegments = dcel.getEdgesSegments();

								//console.log("Vertex Inside: ", dcel.isVertexInside(dcel.vertices[0]));
								//console.log("Vertices Connected: " + dcel.areVerticesConnected(dcel.vertices[1],dcel.vertices[0]));
								//console.log("Dcel connect: "+dcel.connectVerticesIfNotIntersect(dcel.vertices[0],dcel.vertices[1]));
								//console.log("Dcel connect: "+dcel.connectVerticesIfNotIntersect(dcel.vertices[0],dcel.vertices[2]));
								//console.log("Dcel connect: "+dcel.connectVerticesIfNotIntersect(dcel.vertices[1],dcel.vertices[3]));
								
								console.log("Faces size: "+dcel.getFacesSize());
								//p.dcelSegments = dcel.getIncidentOutEdgesOfVertexIdx(3);
								//p.dcelSegments = dcel.getFaceSegsFromIdx(0);
								*/
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

	p.showPoint = function (point, col="black"){
		p.push();
		let radius = POINT_RADIUS * 2;
		p.stroke(col);
		p.fill(p.color(col)); 
		p.ellipse(point.x, point.y, radius);
		p.pop();
	}

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
	}

	p.showTriangulation = function (triangulation, color="black"){
		for(let i = 0; i < triangulation.length; i++){
			p.showSegments(triangulation[i], color);
		}
		
	}

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


// TO REMOVE used to test the Combinator class
/*
let combi = new Combinator();
let l1 = ["a", "b", "c"];
let l2 = ["a", "b", "c", "d"];
let combis = combi.getCombinationsOfSizeKFromList(2,l1);
console.log(combis);
*/

//  TO REMOVE used to test segmentsIntersect();
/*
let seg0 = new Segment(new Point(0,100), new Point(0, 0));
let seg1 = new Segment(new Point(0, 0), new Point(0,100));
let seg2 = new Segment(new Point(0, 0), new Point(0,100));
let seg3 = new Segment(new Point(0,0), new Point(100,100));
let seg4 = new Segment(new Point(0,100), new Point(100,0));
console.log("Segs are on same line: " + segmentsIntersect(seg0, seg1, true));
console.log("Segs are on same line: " + segmentsIntersect(seg1, seg2, true));
console.log("Segs have a common endpoint: " + segmentsIntersect(seg1, seg3, true));
console.log("Segs have an intersection between their endpoints: " + segmentsIntersect(seg3, seg4, true));
console.log("Segs have an intersection between their endpoints: " + segmentsIntersect(seg4, seg3, true));
console.log("-------");
console.log("Segs are on same line: " + segmentsIntersect(seg0, seg1, false));
console.log("Segs are on same line: " + segmentsIntersect(seg1, seg2, false));
console.log("Segs have a common endpoint: " + segmentsIntersect(seg1, seg3, false));
console.log("Segs have an intersection between their endpoints: " + segmentsIntersect(seg3, seg4, false));
console.log("Segs have an intersection between their endpoints: " + segmentsIntersect(seg4, seg3, false));
*/

function validatePointSet()
{
	var notifColor = NOTIF_BLUE;
	var notifText = null;
		
	if (currentCanvas === CANVAS_TYPE.LEFT)
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
				currentCanvas = CANVAS_TYPE.RIGHT;
				notifText = "Validated left canvas, now unlocking right canvas";
				leftCanvas.redraw();
			}
		}

		else
		{
			notifColor = FAILURE_RED;
			notifText = "The left set is not in general position";
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

		else if (pointSetInGeneralPosition(rightCanvas.points))
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

		else
		{
			notifColor = FAILURE_RED;
			notifText = "The right set is not in general position";
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
