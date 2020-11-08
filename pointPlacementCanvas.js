



const ORIENT = {
  LEFT: "Left-turn",
  ALIGNED: "Aligned",
  RIGHT: "Right-turn"
};
Object.freeze(ORIENT);

const NOTIF_BLUE = "#4da6ff";
const FAILURE_RED = "#ff6666";
const SUCCESS_GREEN = "#66ff66";
const POINT_RADIUS = 5;

var placeholderText = "Place Points Here";
var points = [];
var pointLabels = [];
var convexHullPoints = [];
var polygonPoints = [];
var triangulationSegments = [];
var triangulationTriangles = [];
var tangentPoints = null;
var leftMostPoint = null;
var leftMostPointIdx = null;
var leftMostCHPoint = null;
var notifTimeout = null;
var lastClickedPointIdx = null;
var canPlacePoints = true;
var polygonFinished = false;
var secondPointIsCounterClockWise = true;

function typeOf(obj) {
  return {}.toString
    .call(obj)
    .match(/\s(\w+)/)[1]
    .toLowerCase();
}

class Point {
  constructor(x, y) {
    if (typeOf(x) !== "number" && typeOf(y) !== "number") {
      throw new TypeError("Operands of Point constructor should be numbers");
    }
    this.x = x;
    this.y = y;
  }
}

class Triangle {
  constructor(p1, p2, p3) {
    if (!p1 || !p2 || !p3) {
      throw new TypeError(
        "Operands of Triangle constructor should be defined and non null"
      );
    }
    if (! (p1 instanceof Point) && ! (p2 instanceof Point) && ! (p3 instanceof Point)) {
      throw new TypeError("Operands of Triangle constructor should be Points");
    }
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }
}

class Segment {
  constructor(p1, p2) {
    if (!p1 || !p2) {
      throw new TypeError("Operands of Segment should be defined and non null");
    }
    if (! (p1 instanceof Point) && ! (p2 instanceof Point)) {
      throw new TypeError("Operands of Segment constructor should be Points");
    }
    this.p1 = p1;
    this.p2 = p2;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  fill("black");
  noLoop();
}

function draw() {
  // Put drawings here
  background(200);

  if (points.length === 0) {
    textSize(40);
    text(placeholderText, windowWidth / 2 - 100, windowHeight / 2 - 50);
  } else {
    textSize(12);
    showPoints();
    showPolygon();
    showTriangulationSegments();
    // showConvexHull();
    // showTangents();
  }
}

/** Displays the tangent points already computed after a click on
 * an outside point. */
function showTangents() {
  if (tangentPoints && tangentPoints.length >= 2) {
    connectTangentPoints(points[lastClickedPointIdx], tangentPoints[0]);
    connectTangentPoints(points[lastClickedPointIdx], tangentPoints[1]);
  }
}

/** Draws the ellipses for the points and marks the last clicked one. */
function showPoints() {
  var radius = null;
  for (let i = 0; i < points.length; ++i) {
    if (i === lastClickedPointIdx) {
      strokeWeight(6);
      stroke(255, 153, 153);
      radius = POINT_RADIUS * 4;
    } else {
      strokeWeight(1);
      noStroke();
      radius = POINT_RADIUS * 2;
    }
    ellipse(points[i].x, points[i].y, radius);
  }
}

/** Displays the segments by connecting their extremities (Point instances). */
function showTriangulationSegments() {
  for (seg of triangulationSegments) {
    connectPoints(seg.p1, seg.p2);
  }
}

/** Displays the polygon defined be the points added to the canvas,
 * according to the order in which they where added.
 */
function showPolygon() {
  if (points.length >= 2) {
    for (var i = 0; i < points.length - 1; ++i) {
      connectPoints(points[i], points[i + 1]);
    }
    if (polygonFinished) {
      connectPoints(points[points.length - 1], points[0]);
    }
  }
}

/** Draws a simple line between two points. */
function connectPoints(p1, p2) {
  strokeWeight(1);
  stroke(0, 0, 0);
  fill("black");
  line(p1.x, p1.y, p2.x, p2.y);
  strokeWeight(1);
  noStroke();
}

/** Draws a line between a point and its tangents. */
function connectTangentPoints(targetPoint, tangentPoint) {
  strokeWeight(4);
  stroke(255, 51, 51, 210);
  connectPoints(targetPoint, tangentPoint);
  strokeWeight(1);
  noStroke();
  fill("black");
}

/** Draws a colored line between two convex hull points points. */
function connectCHPoints(idx1, idx2) {
  strokeWeight(4);
  stroke(102, 255, 102, 210);
  connectPoints(convexHullPoints[idx1], convexHullPoints[idx2]);
  strokeWeight(1);
  noStroke();
  fill("black");
}

/** Connects and highllights the convex hull shape if it exists. */
function showConvexHull() {
  if (convexHullPoints.length > 3) {
    for (let i = 0; i < convexHullPoints.length; ++i) {
      connectCHPoints(i, (i + 1) % convexHullPoints.length);
    }
  }
}

/** Add a point to the list of points and creates a new lavbel for it */
function addPoint(x, y) {
  pointLabels.push("p" + str(points.length));
  p = new Point(x, y);
  points.push(p);

  if (leftMostPoint === null || p.x < leftMostPoint.x) {
    leftMostPoint = p;
    leftMostPointIdx = points.length - 1;
  }
}

/** Returns a point if it was clicked on, and null if none was clicked.
 */
function checkClickedPoint(x, y) {
  for (let i = 0; i < points.length; ++i) {
    // if the click occured inside the radius of the point
    // then the point was clicked
    if (dist(x, y, points[i].x, points[i].y) < POINT_RADIUS) {
      lastClickedPointIdx = i;
      console.log("\n=======\n");
      console.log("nb convex hull points: ", convexHullPoints.length);
      console.log("last clicked point idx: ", i);
      return points[i];
    }
  }
  return null;
}

/** Returns true if the two segments intersect, false otherwise. */
function segmentsIntersect(seg1, seg2) {
  console.log("******");
  console.log(getOrientation(seg1.p1, seg1.p2, seg2.p1));
  console.log(getOrientation(seg1.p1, seg1.p2, seg2.p2));
  console.log("===");
  orientDifferent =
    getOrientation(seg1.p1, seg1.p2, seg2.p1) !==
    getOrientation(seg1.p1, seg1.p2, seg2.p2);
  console.log(getOrientation(seg2.p1, seg2.p2, seg1.p1));
  console.log(getOrientation(seg2.p1, seg2.p2, seg1.p2));
  reverseOrientDifferent =
    getOrientation(seg2.p1, seg2.p2, seg1.p1) !==
    getOrientation(seg2.p1, seg2.p2, seg1.p2);
  return orientDifferent && reverseOrientDifferent;
}

/** Add a point to the canvas only if the segment, defined by that new point
 * and the previously added one, does not intersect any other segment defined
 * by consecutive points in the point list.
 */
function addPointIfNoIntersect(x, y) {
  if (points.length <= 2) {
    addPoint(mouseX, mouseY);
    // if the second point is above the first one
    // this is clock wise order !! this impacts convex point detection
    // don't forget that y axis is inverted, so to check that the poitn is above,
    // we use <
    if (points.length === 2 && mouseY < points[0].y) {
      secondPointIsCounterClockWise = false;
    }
  } else {
    let newPoint = new Point(x, y);
    let newSegment = new Segment(points[points.length - 1], newPoint);
    let maxIter = points.length - 2; // the last point has already been used in newSegment
    let intersectSegment = false;
    for (let i = 0; i < maxIter; ++i) {
      let existingSegment = new Segment(points[i], points[i + 1]);
      intersectSegment = segmentsIntersect(newSegment, existingSegment);
      if (intersectSegment) {
        console.log("conflicting segment:", i, "->", i + 1);
        showNotification(
          "Cannot add a point leading to intersecting segments",
          FAILURE_RED
        );
        break;
      }
    }

    if (!intersectSegment) {
      addPoint(mouseX, mouseY);
    }
  }
}

function mousePressed() {
  if (mouseButton === LEFT) {
    // check that the click is inside the canvas
    if (mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0) {
      p = checkClickedPoint(mouseX, mouseY);

      // if no existing point was clicked
      if (!p) {
        lastClickedPointIdx = null;
        if (canPlacePoints === true) {
          addPointIfNoIntersect(mouseX, mouseY);
        }
      }
      // an existing point was clicked and it's not the firs one
      // ==> consider that the user wants to close the shape to make
      // a polygon
      else if (points.length > 0 && !polygonFinished) {
        polygonFinished = true;
        setPointPlacementCheckBoxInteraction(false);
        setPointPlacement(false);
        polygonPoints = points;
      }
      // if a point was clicked and the convex hull has been successfully
      // computed, can execute operations for that point
      // else if (convexHullPoints.length > 3) {
      //   tangentPoints = null;
      //   if (!checkPointInConvexHull(p)) {
      //     tangentPoints = getCHTangentPoints(p);
      //   }
      //   // checkPointInConvexHull(p);
      // }
      redraw();
    }
  }
}

/** Sort the points rtadially according to the leftmost point. */
function sortPointsRadially() {
  // remove leftmost point to avoid comparison with itself
  points.splice(leftMostPointIdx, 1);
  points.sort(pointOrderComparator);

  // add leftmost point at the start again
  points.unshift(leftMostPoint); // append leftmost point at the start of array
}


/** Find the ordered set of points defining the convex hull,
 * the leftmost point being the first in the list.
 */
function makeGrahamScan() {
  if (points.length > 2) {
    sortPointsRadially();

    var stack = [points[0], points[1]];

    for (let i = 2; i < points.length; ++i) {
      while (
        isRightTurn(stack[stack.length - 2], stack[stack.length - 1], points[i])
      ) {
        stack.pop();
      }
      stack.push(points[i]);
    }
    convexHullPoints = stack;
    leftMostCHPoint = stack[0];
  }

  showNotification("Scan done successfully", NOTIF_BLUE);
  redraw();
}



/** Checks if a point p is contained in the previously computed convex hull,
 * and if so displays a graphical notification.
 */
function checkPointInConvexHull(p) {
  var newResultTxt = "Point is OUTSIDE";
  var newTxtColor = FAILURE_RED;
  var inConvexHull = pointInConvexHull(p);
  if (inConvexHull) {
    newResultTxt = "Point is INSIDE";
    newTxtColor = SUCCESS_GREEN;
  }
  showNotification(newResultTxt, newTxtColor);
  redraw();
  return inConvexHull;
}

/** Returns true if the given point is inside the convex hull polygon,
 * and false otherwise.
 */
function pointInConvexHull(p) {
  var wedgeIndexes = getWedgePointIndexes(p);
  console.log(wedgeIndexes);
  var firstPoint = convexHullPoints[wedgeIndexes[0]];
  var secondPoint = convexHullPoints[wedgeIndexes[1]];
  inCHPolygon = !isRightTurn(firstPoint, secondPoint, p);
  console.log("orientation:", getOrientation(firstPoint, secondPoint, p));
  return inCHPolygon;
}

/** Returns the index of the points that make the smallest wedge containing the
 * targeted point in the convex hull polygon. The first point thus makes a
 * left turn for the given point, and the second point makes
 * a right turn for that same point.
 */
function getWedgePointIndexes(p) {
  var firstPointIdx = binarySearchSplit(p, leftRightOrder);
  var secondPointIdx = (firstPointIdx + 1) % convexHullPoints.length;
  return [firstPointIdx, secondPointIdx];
}

/** Returns the index after which the element should
 * be located, using a binary search.
 */
function binarySearchSplit(targetPoint, orderingFunc) {
  var min = 0;
  var max = convexHullPoints.length - 1;

  var index = null;
  var orderRes = null;

  while (min <= max) {
    index = Math.floor((max + min) / 2);
    orderRes = orderingFunc(targetPoint, index);
    // console.log("index:", index);
    if (orderRes === 0) {
      return index;
    }
    // we explore left
    else if (orderRes < 0) {
      max = index - 1;
    }
    // we explore right
    else {
      min = index + 1;
    }
  }

  return index;
}

/** Returns the sign used by the binary search function for wedge indexes,
 * which is zero whenever the indfex is between a left turn and a right turn.
 * if z if the point, O is an interior point of the hull and
 * p_i is an extreme point of the hull:
 * z->O->p_i must make a left turn (inverted orient determinant < 0)
 * Z->O->p_i+1 must make a right turn (inverted orient determinant > 0)
 * above we chose the leftmost point as an interior point.
 */
function leftRightOrder(targetPoint, index) {
  var p1 = convexHullPoints[index];
  var p2 = convexHullPoints[(index + 1) % convexHullPoints.length];
  var orient = getOrientation(targetPoint, leftMostCHPoint, p1);
  var nextOrient = getOrientation(targetPoint, leftMostCHPoint, p2);

  var res = null;
  var leftOrAligned = orient !== ORIENT.RIGHT;
  if (leftOrAligned && nextOrient === ORIENT.RIGHT) {
    res = 0;
  } else if (leftOrAligned && nextOrient === ORIENT.LEFT) {
    res = 1;
  } else {
    res = -1;
  }
  return res;
}


/** Triangulates a polygon by saving all the sub triangles in a separate
 * array. This function also saves segments that connect
 * the two sibling points of an ear angle point (for the graphical display).
 */
function triangulatePolygon() {
  if (triangulationSegments.length === 0) {
    let polygonPointsCopy = polygonPoints.slice(); // shallow copy
    triangulatePolygonRecursive(polygonPointsCopy);
    showNotification("Triangulation finished successfully", NOTIF_BLUE);
    redraw();
  } else {
    showNotification("Triangulation already done", NOTIF_BLUE);
  }
}

/** Triangulates the polygon using the O(n^3) recursive method,
 * removing ears of the polygon until we reach a polygon of size 3.
 */
function triangulatePolygonRecursive(polygonPointArray) {
  // can only continue the process if we didn't reach the smallest
  // polygon possible, which is a triangle
  if (polygonPointArray.length > 3) {
    let res = getPolygonEar(polygonPointArray);
    let p1 = polygonPointArray[res[0]];
    let p2 = polygonPointArray[res[1]];
    let p3 = polygonPointArray[res[2]];
    triangulationSegments.push(new Segment(p1, p3));
    triangulationTriangles.push(new Triangle(p1, p2, p3));
    polygonPointArray.splice(res[1], 1);
    triangulatePolygonRecursive(polygonPointArray);
  }
  // last triangle, just save it
  else if (polygonPointArray.length === 3) {
    let p1 = polygonPointArray[0];
    let p2 = polygonPointArray[1];
    let p3 = polygonPointArray[2];
    triangulationSegments.push(new Segment(p1, p3));
    triangulationTriangles.push(new Triangle(p1, p2, p3));
  }
}

/** Get the angle at which a valid ear is found. */
function getPolygonEar(polygonPointsView) {
  let ear = null;
  let p1 = null;
  let pAngle = null;
  let p2 = null;

  // loop over the polygon points until we find an ear
  for (let i = 1; i < polygonPointsView.length + 1; ++i) {
    p1 = polygonPointsView[(i - 1) % polygonPointsView.length];
    pAngle = polygonPointsView[i % polygonPointsView.length];
    p2 = polygonPointsView[(i + 1) % polygonPointsView.length];

    // an ear has to rely on a convex vertex
    // we don't accept aligned point since it would enter the
    // loop for nothing (we cannot create a triangle from three aligned points)
    if (
      (isLeftTurn(p1, pAngle, p2) && secondPointIsCounterClockWise) ||
      (isRightTurn(p1, pAngle, p2) && !secondPointIsCounterClockWise)
    ) {
      let allPointsOutside = true;
      for (let j of polygonPointsView) {
        if (j !== p1 && j !== pAngle && j !== p2) {
          if (pointInTriangle(j, p1, pAngle, p2)) {
            allPointsOutside = false;
            break;
          }
        }
      }

      // this is an ear, set the eat and end the loop
      if (allPointsOutside) {
        ear = [
          (i - 1) % polygonPointsView.length,
          i % polygonPointsView.length,
          (i + 1) % polygonPointsView.length
        ];
        break;
      }
    }
  }

  return ear;
}

/** Tells if a point p is inside the triangle delimited by the
 * three points t1, t2 and t3
 */
function pointInTriangle(p, t1, t2, t3) {
  var prevOrient = null;
  var orient = null;
  var trianglePoints = [t1, t2, t3];
  var NB_TRIANGLE_POINTS = 3;
  // loop over all edges
  // if all orientations for the selected pair of points applied
  // to the last added point are the same, then the point is inside the triangle
  for (let i = 0; i < NB_TRIANGLE_POINTS; ++i) {
    prevOrient = orient;
    var a = trianglePoints[i % NB_TRIANGLE_POINTS];
    var c = trianglePoints[(i + 1) % NB_TRIANGLE_POINTS];
    orient = getOrientation(a, p, c);
    if (prevOrient !== null && prevOrient !== orient) {
      return false;
    }
  }
  return true;
}

/** Returns the orientation determinant using the three points given as
 * argument.
 */
function getOrientationDeterminant(p1, pAngle, p2) {
  return (
    pAngle.x * p2.y -
    p1.x * p2.y +
    p1.x * pAngle.y -
    pAngle.y * p2.x +
    p1.y * p2.x -
    p1.y * pAngle.x
  );
}

/**
 *  Returns the inverted determinant for points p1 at the angle, using
 * the leftmost point in the entire point array as starting point. This
 * function serves as a comprator for the sorting algorithm working on points.
 * It also inverts the sign of the orientation determinant to account for the inverted
 * GUI y axis.
 */
function pointOrderComparator(p1, p2) {
  // return invertedOrientationDeterminant(leftMostPoint, p1, p2);
  return getOrientationDeterminant(leftMostPoint, p1, p2);
}

function isLeftTurn(p1, pAngle, p2) {
  return getOrientation(p1, pAngle, p2) === ORIENT.LEFT;
}

function isRightTurn(p1, pAngle, p2) {
  return getOrientation(p1, pAngle, p2) === ORIENT.RIGHT;
}

function isAligned(p1, pAngle, p2) {
  return getOrientation(p1, pAngle, p2) === ORIENT.ALIGNED;
}

function getOrientation(p1, pAngle, p2) {
  var orientDet = getOrientationDeterminant(p1, pAngle, p2);
  if (orientDet < 0) {
    return ORIENT.LEFT;
  } else if (orientDet === 0) {
    return ORIENT.ALIGNED;
  } else {
    return ORIENT.RIGHT;
  }
}

function reset() {
  points = [];
  pointLabels = [];
  convexHullPoints = [];
  polygonPoints = [];
  triangulationSegments = [];
  triangulationTriangles = [];
  tangentPoints = null;
  leftMostPoint = null;
  leftMostPointIdx = null;
  leftMostCHPoint = null;
  lastClickedPointIdx = null;
  polygonFinished = false;
  setPointPlacementCheckBoxInteraction(true);
  setPointPlacement(true);
  resetNotifications();
  redraw();
}

/** Hides all pending notifications and resets thje corresponding html elements. */
function resetNotifications() {
  notifTimeout = null;
  var elem = document.getElementsByClassName("res-txt")[0];
  elem.innerText = "";
  elem.style.color = "black";
}

/** Shows a notification message for a given number of microseconds
 * (the default is 3 seconds). If a negative timeout is passed, the
 * notification will stay displayed indefinitely. */
function showNotification(txt, color = "black", nbMilisec = 3000) {
  if (notifTimeout) {
    clearTimeout(notifTimeout);
  }
  var elem = document.getElementsByClassName("res-txt")[0];
  elem.innerText = txt;
  elem.style.color = color;
  if (nbMilisec > 0) {
    notifTimeout = setTimeout(function () {
      resetNotifications();
    }, nbMilisec);
  }
}

/** Displays an array of point. */
function dumpStack(stack) {
  console.log("******");
  for (let i = 0; i < stack.length; ++i) {
    console.log(stack[i]);
  }
}

function validatePointSet()
{
  setPointPlacementCheckBoxInteraction(false);
  setPointPlacement(false);
}

/** Enable or disable interactions with the point placement checkbox,
 * using the disable property of the html element. */
function setPointPlacementCheckBoxInteraction(boolVal) {
  var checkbox = document.getElementsByClassName("point-placement-checkbox")[0];
  checkbox.disabled = !boolVal;
}

/** Enable or disable point placement. */
function setPointPlacement(boolVal) {
  canPlacePoints = boolVal;
  var notifText = null;
  if (canPlacePoints === true) {
    notifText = "Point placement enabled";
  } else {
    notifText = "Point placement disabled";
  }
  showNotification(notifText, NOTIF_BLUE);
}

/** Enable or disable point placement when clicking the
 * point placement checkbox. */
function placePointsCheckboxCallback() {
  var elem = document.getElementsByClassName("point-placement-checkbox")[0];
  enablePointPlacement(elem.checked);
}

// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};












const ORIENT = {
  LEFT: "Left-turn",
  ALIGNED: "Aligned",
  RIGHT: "Right-turn"
};
Object.freeze(ORIENT);

const NOTIF_BLUE = "#4da6ff";
const FAILURE_RED = "#ff6666";
const SUCCESS_GREEN = "#66ff66";
const POINT_RADIUS = 5;

var placeholderText = "Place Points Here";
var points = [];
var pointLabels = [];
var convexHullPoints = [];
var polygonPoints = [];
var triangulationSegments = [];
var triangulationTriangles = [];
var tangentPoints = null;
var leftMostPoint = null;
var leftMostPointIdx = null;
var leftMostCHPoint = null;
var notifTimeout = null;
var lastClickedPointIdx = null;
var canPlacePoints = true;
var polygonFinished = false;
var secondPointIsCounterClockWise = true;

function typeOf(obj) {
  return {}.toString
    .call(obj)
    .match(/\s(\w+)/)[1]
    .toLowerCase();
}

class Point {
  constructor(x, y) {
    if (typeOf(x) !== "number" && typeOf(y) !== "number") {
      throw new TypeError("Operands of Point constructor should be numbers");
    }
    this.x = x;
    this.y = y;
  }
}

class Triangle {
  constructor(p1, p2, p3) {
    if (!p1 || !p2 || !p3) {
      throw new TypeError(
        "Operands of Triangle constructor should be defined and non null"
      );
    }
    if (! (p1 instanceof Point) && ! (p2 instanceof Point) && ! (p3 instanceof Point)) {
      throw new TypeError("Operands of Triangle constructor should be Points");
    }
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }
}

class Segment {
  constructor(p1, p2) {
    if (!p1 || !p2) {
      throw new TypeError("Operands of Segment should be defined and non null");
    }
    if (! (p1 instanceof Point) && ! (p2 instanceof Point)) {
      throw new TypeError("Operands of Segment constructor should be Points");
    }
    this.p1 = p1;
    this.p2 = p2;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  fill("black");
  noLoop();
}

function draw() {
  // Put drawings here
  background(200);

  if (points.length === 0) {
    textSize(40);
    text(placeholderText, windowWidth / 2 - 100, windowHeight / 2 - 50);
  } else {
    textSize(12);
    showPoints();
    showPolygon();
    showTriangulationSegments();
    // showConvexHull();
    // showTangents();
  }
}

/** Displays the tangent points already computed after a click on
 * an outside point. */
function showTangents() {
  if (tangentPoints && tangentPoints.length >= 2) {
    connectTangentPoints(points[lastClickedPointIdx], tangentPoints[0]);
    connectTangentPoints(points[lastClickedPointIdx], tangentPoints[1]);
  }
}

/** Draws the ellipses for the points and marks the last clicked one. */
function showPoints() {
  var radius = null;
  for (let i = 0; i < points.length; ++i) {
    if (i === lastClickedPointIdx) {
      strokeWeight(6);
      stroke(255, 153, 153);
      radius = POINT_RADIUS * 4;
    } else {
      strokeWeight(1);
      noStroke();
      radius = POINT_RADIUS * 2;
    }
    ellipse(points[i].x, points[i].y, radius);
  }
}

/** Displays the segments by connecting their extremities (Point instances). */
function showTriangulationSegments() {
  for (seg of triangulationSegments) {
    connectPoints(seg.p1, seg.p2);
  }
}

/** Displays the polygon defined be the points added to the canvas,
 * according to the order in which they where added.
 */
function showPolygon() {
  if (points.length >= 2) {
    for (var i = 0; i < points.length - 1; ++i) {
      connectPoints(points[i], points[i + 1]);
    }
    if (polygonFinished) {
      connectPoints(points[points.length - 1], points[0]);
    }
  }
}

/** Draws a simple line between two points. */
function connectPoints(p1, p2) {
  strokeWeight(1);
  stroke(0, 0, 0);
  fill("black");
  line(p1.x, p1.y, p2.x, p2.y);
  strokeWeight(1);
  noStroke();
}

/** Draws a line between a point and its tangents. */
function connectTangentPoints(targetPoint, tangentPoint) {
  strokeWeight(4);
  stroke(255, 51, 51, 210);
  connectPoints(targetPoint, tangentPoint);
  strokeWeight(1);
  noStroke();
  fill("black");
}

/** Draws a colored line between two convex hull points points. */
function connectCHPoints(idx1, idx2) {
  strokeWeight(4);
  stroke(102, 255, 102, 210);
  connectPoints(convexHullPoints[idx1], convexHullPoints[idx2]);
  strokeWeight(1);
  noStroke();
  fill("black");
}

/** Connects and highllights the convex hull shape if it exists. */
function showConvexHull() {
  if (convexHullPoints.length > 3) {
    for (let i = 0; i < convexHullPoints.length; ++i) {
      connectCHPoints(i, (i + 1) % convexHullPoints.length);
    }
  }
}

/** Add a point to the list of points and creates a new lavbel for it */
function addPoint(x, y) {
  pointLabels.push("p" + str(points.length));
  p = new Point(x, y);
  points.push(p);

  if (leftMostPoint === null || p.x < leftMostPoint.x) {
    leftMostPoint = p;
    leftMostPointIdx = points.length - 1;
  }
}

/** Returns a point if it was clicked on, and null if none was clicked.
 */
function checkClickedPoint(x, y) {
  for (let i = 0; i < points.length; ++i) {
    // if the click occured inside the radius of the point
    // then the point was clicked
    if (dist(x, y, points[i].x, points[i].y) < POINT_RADIUS) {
      lastClickedPointIdx = i;
      console.log("\n=======\n");
      console.log("nb convex hull points: ", convexHullPoints.length);
      console.log("last clicked point idx: ", i);
      return points[i];
    }
  }
  return null;
}

/** Returns true if the two segments intersect, false otherwise. */
function segmentsIntersect(seg1, seg2) {
  console.log("******");
  console.log(getOrientation(seg1.p1, seg1.p2, seg2.p1));
  console.log(getOrientation(seg1.p1, seg1.p2, seg2.p2));
  console.log("===");
  orientDifferent =
    getOrientation(seg1.p1, seg1.p2, seg2.p1) !==
    getOrientation(seg1.p1, seg1.p2, seg2.p2);
  console.log(getOrientation(seg2.p1, seg2.p2, seg1.p1));
  console.log(getOrientation(seg2.p1, seg2.p2, seg1.p2));
  reverseOrientDifferent =
    getOrientation(seg2.p1, seg2.p2, seg1.p1) !==
    getOrientation(seg2.p1, seg2.p2, seg1.p2);
  return orientDifferent && reverseOrientDifferent;
}

/** Add a point to the canvas only if the segment, defined by that new point
 * and the previously added one, does not intersect any other segment defined
 * by consecutive points in the point list.
 */
function addPointIfNoIntersect(x, y) {
  if (points.length <= 2) {
    addPoint(mouseX, mouseY);
    // if the second point is above the first one
    // this is clock wise order !! this impacts convex point detection
    // don't forget that y axis is inverted, so to check that the poitn is above,
    // we use <
    if (points.length === 2 && mouseY < points[0].y) {
      secondPointIsCounterClockWise = false;
    }
  } else {
    let newPoint = new Point(x, y);
    let newSegment = new Segment(points[points.length - 1], newPoint);
    let maxIter = points.length - 2; // the last point has already been used in newSegment
    let intersectSegment = false;
    for (let i = 0; i < maxIter; ++i) {
      let existingSegment = new Segment(points[i], points[i + 1]);
      intersectSegment = segmentsIntersect(newSegment, existingSegment);
      if (intersectSegment) {
        console.log("conflicting segment:", i, "->", i + 1);
        showNotification(
          "Cannot add a point leading to intersecting segments",
          FAILURE_RED
        );
        break;
      }
    }

    if (!intersectSegment) {
      addPoint(mouseX, mouseY);
    }
  }
}

function mousePressed() {
  if (mouseButton === LEFT) {
    // check that the click is inside the canvas
    if (mouseX <= width && mouseX >= 0 && mouseY <= height && mouseY >= 0) {
      p = checkClickedPoint(mouseX, mouseY);

      // if no existing point was clicked
      if (!p) {
        lastClickedPointIdx = null;
        if (canPlacePoints === true) {
          addPointIfNoIntersect(mouseX, mouseY);
        }
      }
      // an existing point was clicked and it's not the firs one
      // ==> consider that the user wants to close the shape to make
      // a polygon
      else if (points.length > 0 && !polygonFinished) {
        polygonFinished = true;
        setPointPlacementCheckBoxInteraction(false);
        setPointPlacement(false);
        polygonPoints = points;
      }
      // if a point was clicked and the convex hull has been successfully
      // computed, can execute operations for that point
      // else if (convexHullPoints.length > 3) {
      //   tangentPoints = null;
      //   if (!checkPointInConvexHull(p)) {
      //     tangentPoints = getCHTangentPoints(p);
      //   }
      //   // checkPointInConvexHull(p);
      // }
      redraw();
    }
  }
}

/** Sort the points rtadially according to the leftmost point. */
function sortPointsRadially() {
  // remove leftmost point to avoid comparison with itself
  points.splice(leftMostPointIdx, 1);
  points.sort(pointOrderComparator);

  // add leftmost point at the start again
  points.unshift(leftMostPoint); // append leftmost point at the start of array
}


/** Find the ordered set of points defining the convex hull,
 * the leftmost point being the first in the list.
 */
function makeGrahamScan() {
  if (points.length > 2) {
    sortPointsRadially();

    var stack = [points[0], points[1]];

    for (let i = 2; i < points.length; ++i) {
      while (
        isRightTurn(stack[stack.length - 2], stack[stack.length - 1], points[i])
      ) {
        stack.pop();
      }
      stack.push(points[i]);
    }
    convexHullPoints = stack;
    leftMostCHPoint = stack[0];
  }

  showNotification("Scan done successfully", NOTIF_BLUE);
  redraw();
}



/** Checks if a point p is contained in the previously computed convex hull,
 * and if so displays a graphical notification.
 */
function checkPointInConvexHull(p) {
  var newResultTxt = "Point is OUTSIDE";
  var newTxtColor = FAILURE_RED;
  var inConvexHull = pointInConvexHull(p);
  if (inConvexHull) {
    newResultTxt = "Point is INSIDE";
    newTxtColor = SUCCESS_GREEN;
  }
  showNotification(newResultTxt, newTxtColor);
  redraw();
  return inConvexHull;
}

/** Returns true if the given point is inside the convex hull polygon,
 * and false otherwise.
 */
function pointInConvexHull(p) {
  var wedgeIndexes = getWedgePointIndexes(p);
  console.log(wedgeIndexes);
  var firstPoint = convexHullPoints[wedgeIndexes[0]];
  var secondPoint = convexHullPoints[wedgeIndexes[1]];
  inCHPolygon = !isRightTurn(firstPoint, secondPoint, p);
  console.log("orientation:", getOrientation(firstPoint, secondPoint, p));
  return inCHPolygon;
}

/** Returns the index of the points that make the smallest wedge containing the
 * targeted point in the convex hull polygon. The first point thus makes a
 * left turn for the given point, and the second point makes
 * a right turn for that same point.
 */
function getWedgePointIndexes(p) {
  var firstPointIdx = binarySearchSplit(p, leftRightOrder);
  var secondPointIdx = (firstPointIdx + 1) % convexHullPoints.length;
  return [firstPointIdx, secondPointIdx];
}

/** Returns the index after which the element should
 * be located, using a binary search.
 */
function binarySearchSplit(targetPoint, orderingFunc) {
  var min = 0;
  var max = convexHullPoints.length - 1;

  var index = null;
  var orderRes = null;

  while (min <= max) {
    index = Math.floor((max + min) / 2);
    orderRes = orderingFunc(targetPoint, index);
    // console.log("index:", index);
    if (orderRes === 0) {
      return index;
    }
    // we explore left
    else if (orderRes < 0) {
      max = index - 1;
    }
    // we explore right
    else {
      min = index + 1;
    }
  }

  return index;
}

/** Returns the sign used by the binary search function for wedge indexes,
 * which is zero whenever the indfex is between a left turn and a right turn.
 * if z if the point, O is an interior point of the hull and
 * p_i is an extreme point of the hull:
 * z->O->p_i must make a left turn (inverted orient determinant < 0)
 * Z->O->p_i+1 must make a right turn (inverted orient determinant > 0)
 * above we chose the leftmost point as an interior point.
 */
function leftRightOrder(targetPoint, index) {
  var p1 = convexHullPoints[index];
  var p2 = convexHullPoints[(index + 1) % convexHullPoints.length];
  var orient = getOrientation(targetPoint, leftMostCHPoint, p1);
  var nextOrient = getOrientation(targetPoint, leftMostCHPoint, p2);

  var res = null;
  var leftOrAligned = orient !== ORIENT.RIGHT;
  if (leftOrAligned && nextOrient === ORIENT.RIGHT) {
    res = 0;
  } else if (leftOrAligned && nextOrient === ORIENT.LEFT) {
    res = 1;
  } else {
    res = -1;
  }
  return res;
}


/** Triangulates a polygon by saving all the sub triangles in a separate
 * array. This function also saves segments that connect
 * the two sibling points of an ear angle point (for the graphical display).
 */
function triangulatePolygon() {
  if (triangulationSegments.length === 0) {
    let polygonPointsCopy = polygonPoints.slice(); // shallow copy
    triangulatePolygonRecursive(polygonPointsCopy);
    showNotification("Triangulation finished successfully", NOTIF_BLUE);
    redraw();
  } else {
    showNotification("Triangulation already done", NOTIF_BLUE);
  }
}

/** Triangulates the polygon using the O(n^3) recursive method,
 * removing ears of the polygon until we reach a polygon of size 3.
 */
function triangulatePolygonRecursive(polygonPointArray) {
  // can only continue the process if we didn't reach the smallest
  // polygon possible, which is a triangle
  if (polygonPointArray.length > 3) {
    let res = getPolygonEar(polygonPointArray);
    let p1 = polygonPointArray[res[0]];
    let p2 = polygonPointArray[res[1]];
    let p3 = polygonPointArray[res[2]];
    triangulationSegments.push(new Segment(p1, p3));
    triangulationTriangles.push(new Triangle(p1, p2, p3));
    polygonPointArray.splice(res[1], 1);
    triangulatePolygonRecursive(polygonPointArray);
  }
  // last triangle, just save it
  else if (polygonPointArray.length === 3) {
    let p1 = polygonPointArray[0];
    let p2 = polygonPointArray[1];
    let p3 = polygonPointArray[2];
    triangulationSegments.push(new Segment(p1, p3));
    triangulationTriangles.push(new Triangle(p1, p2, p3));
  }
}

/** Get the angle at which a valid ear is found. */
function getPolygonEar(polygonPointsView) {
  let ear = null;
  let p1 = null;
  let pAngle = null;
  let p2 = null;

  // loop over the polygon points until we find an ear
  for (let i = 1; i < polygonPointsView.length + 1; ++i) {
    p1 = polygonPointsView[(i - 1) % polygonPointsView.length];
    pAngle = polygonPointsView[i % polygonPointsView.length];
    p2 = polygonPointsView[(i + 1) % polygonPointsView.length];

    // an ear has to rely on a convex vertex
    // we don't accept aligned point since it would enter the
    // loop for nothing (we cannot create a triangle from three aligned points)
    if (
      (isLeftTurn(p1, pAngle, p2) && secondPointIsCounterClockWise) ||
      (isRightTurn(p1, pAngle, p2) && !secondPointIsCounterClockWise)
    ) {
      let allPointsOutside = true;
      for (let j of polygonPointsView) {
        if (j !== p1 && j !== pAngle && j !== p2) {
          if (pointInTriangle(j, p1, pAngle, p2)) {
            allPointsOutside = false;
            break;
          }
        }
      }

      // this is an ear, set the eat and end the loop
      if (allPointsOutside) {
        ear = [
          (i - 1) % polygonPointsView.length,
          i % polygonPointsView.length,
          (i + 1) % polygonPointsView.length
        ];
        break;
      }
    }
  }

  return ear;
}

/** Tells if a point p is inside the triangle delimited by the
 * three points t1, t2 and t3
 */
function pointInTriangle(p, t1, t2, t3) {
  var prevOrient = null;
  var orient = null;
  var trianglePoints = [t1, t2, t3];
  var NB_TRIANGLE_POINTS = 3;
  // loop over all edges
  // if all orientations for the selected pair of points applied
  // to the last added point are the same, then the point is inside the triangle
  for (let i = 0; i < NB_TRIANGLE_POINTS; ++i) {
    prevOrient = orient;
    var a = trianglePoints[i % NB_TRIANGLE_POINTS];
    var c = trianglePoints[(i + 1) % NB_TRIANGLE_POINTS];
    orient = getOrientation(a, p, c);
    if (prevOrient !== null && prevOrient !== orient) {
      return false;
    }
  }
  return true;
}

/** Returns the orientation determinant using the three points given as
 * argument.
 */
function getOrientationDeterminant(p1, pAngle, p2) {
  return (
    pAngle.x * p2.y -
    p1.x * p2.y +
    p1.x * pAngle.y -
    pAngle.y * p2.x +
    p1.y * p2.x -
    p1.y * pAngle.x
  );
}

/**
 *  Returns the inverted determinant for points p1 at the angle, using
 * the leftmost point in the entire point array as starting point. This
 * function serves as a comprator for the sorting algorithm working on points.
 * It also inverts the sign of the orientation determinant to account for the inverted
 * GUI y axis.
 */
function pointOrderComparator(p1, p2) {
  // return invertedOrientationDeterminant(leftMostPoint, p1, p2);
  return getOrientationDeterminant(leftMostPoint, p1, p2);
}

function isLeftTurn(p1, pAngle, p2) {
  return getOrientation(p1, pAngle, p2) === ORIENT.LEFT;
}

function isRightTurn(p1, pAngle, p2) {
  return getOrientation(p1, pAngle, p2) === ORIENT.RIGHT;
}

function isAligned(p1, pAngle, p2) {
  return getOrientation(p1, pAngle, p2) === ORIENT.ALIGNED;
}

function getOrientation(p1, pAngle, p2) {
  var orientDet = getOrientationDeterminant(p1, pAngle, p2);
  if (orientDet < 0) {
    return ORIENT.LEFT;
  } else if (orientDet === 0) {
    return ORIENT.ALIGNED;
  } else {
    return ORIENT.RIGHT;
  }
}

function reset() {
  points = [];
  pointLabels = [];
  convexHullPoints = [];
  polygonPoints = [];
  triangulationSegments = [];
  triangulationTriangles = [];
  tangentPoints = null;
  leftMostPoint = null;
  leftMostPointIdx = null;
  leftMostCHPoint = null;
  lastClickedPointIdx = null;
  polygonFinished = false;
  setPointPlacementCheckBoxInteraction(true);
  setPointPlacement(true);
  resetNotifications();
  redraw();
}

/** Hides all pending notifications and resets thje corresponding html elements. */
function resetNotifications() {
  notifTimeout = null;
  var elem = document.getElementsByClassName("res-txt")[0];
  elem.innerText = "";
  elem.style.color = "black";
}

/** Shows a notification message for a given number of microseconds
 * (the default is 3 seconds). If a negative timeout is passed, the
 * notification will stay displayed indefinitely. */
function showNotification(txt, color = "black", nbMilisec = 3000) {
  if (notifTimeout) {
    clearTimeout(notifTimeout);
  }
  var elem = document.getElementsByClassName("res-txt")[0];
  elem.innerText = txt;
  elem.style.color = color;
  if (nbMilisec > 0) {
    notifTimeout = setTimeout(function () {
      resetNotifications();
    }, nbMilisec);
  }
}

/** Displays an array of point. */
function dumpStack(stack) {
  console.log("******");
  for (let i = 0; i < stack.length; ++i) {
    console.log(stack[i]);
  }
}

function validatePointSet()
{
	setPointPlacementCheckBoxInteraction(false);
	setPointPlacement(false);
}

/** Enable or disable interactions with the point placement checkbox,
 * using the disable property of the html element. */
function setPointPlacementCheckBoxInteraction(boolVal) {
  var checkbox = document.getElementsByClassName("point-placement-checkbox")[0];
  checkbox.disabled = !boolVal;
}

/** Enable or disable point placement. */
function setPointPlacement(boolVal) {
  canPlacePoints = boolVal;
  var notifText = null;
  if (canPlacePoints === true) {
    notifText = "Point placement enabled";
  } else {
    notifText = "Point placement disabled";
  }
  showNotification(notifText, NOTIF_BLUE);
}

/** Enable or disable point placement when clicking the
 * point placement checkbox. */
function placePointsCheckboxCallback() {
  var elem = document.getElementsByClassName("point-placement-checkbox")[0];
  enablePointPlacement(elem.checked);
}

// This Redraws the Canvas when resized
windowResized = function () {
  resizeCanvas(windowWidth, windowHeight);
};
