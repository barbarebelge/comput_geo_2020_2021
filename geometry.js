


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

class Polygon{
    /**
    * @param [list of points] points: the points of the polygon ordered in counter clockwise order 
    */
    constructor(points){
        this.points = points;
        this.segments = [];
        for(let i = 0; i < points.length; i++){
            let i2 = (i+1) % points.length;
            let segment = new Segment(points[i], points[i2]);
            this.segments.push(segment);
        }
    }
    /**
    * @param [point] p1
    * @param [point] p2
    * @return [bool] true if the points p1 and p2 are points of a polygon segment otherwise return false
    */
    areSegmentPoints(p1, p2){
        for (let i = 0; i < this.segments.length; i++){
            if((p1 === this.segments[i].p1 && this.segments[i].p2 === p2) 
                || (p2 === this.segments[i].p1 && this.segments[i].p2 === p1)){
                return true;
            }
        }
        return false;
    }
}

const ORIENT = {
    LEFT: "Left-turn",
    ALIGNED: "Aligned",
    RIGHT: "Right-turn"
};
Object.freeze(ORIENT);



/** Returns the orientation determinant using the three points given as
 * argument. When considering an inverted y axis, the value will be negative for left-turns
 * and positive for right-turns. A null value indicates three aligned points.
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
    if (orientDet < 0) 
    {
        return ORIENT.LEFT;
    } 
    else if (orientDet === 0) 
    {
        return ORIENT.ALIGNED;
    } 
    else 
    {
        return ORIENT.RIGHT;
    }
}




/** 
 * Sort the points rtadially according to the leftmost point passed as argument.
 */
function sortPointsRadially(pointArray, leftMostPointIdx) {

    // make a shallow copy of the array
    var points = pointArray.slice();

    // remove leftmost point to avoid comparison with itself
    var leftMostPoint = points.splice(leftMostPointIdx, 1)[0];

    // define a function that always calls the orient determinant starting from the leftmost point
    // a function with 2 arguments instead of 3 is needed for the sort function
    var pointOrderComparator = function(pt1, pt2) {
        return getOrientationDeterminant(leftMostPoint, pt1, pt2);
    };

    // sort the points using our previously defined comparator function
    points.sort(pointOrderComparator);

    // add the leftmost point at the start of the array
    points.unshift(leftMostPoint); // append leftmost point at the start of array

    return points;
}


/** 
 * Find the ordered set of points defining the convex hull,
 * the leftmost point of the set being the first in the list.
 */
function getGrahamScanConvexHull(points, leftMostPointIdx) {
    let convexHullPoints = [];

    if (points.length <= 2)
    {
        console.log("Not enough points to make convex hull");
    }

    else
    {
        var sortedPoints = sortPointsRadially(points, leftMostPointIdx);
        console.log("sorted points:", sortedPoints);
        convexHullPoints = [sortedPoints[0], sortedPoints[1]];

        for (let i = 2; i < sortedPoints.length; ++i) 
        {
            while (isRightTurn(convexHullPoints[convexHullPoints.length - 2],
            convexHullPoints[convexHullPoints.length - 1], sortedPoints[i])) 
            {
                convexHullPoints.pop();
            }
            convexHullPoints.push(sortedPoints[i]);
        }
        
    }
    
    return convexHullPoints;
}


/**
 * Performs a Graham scan on the point set in order to create both the convex hull
 * and the triangulation of the point set.
 */
function getGrahamScanTriangulation(points, leftMostPointIdx)
{
    let dcel = new DCELGraph();

    let convexHullPoints = [];

    if (points.length <= 2)
    {
        console.log("Not enough points to make convex hull or triangulation");
    }

    else
    {
        var sortedPoints = sortPointsRadially(points, leftMostPointIdx);
        console.log("sorted points:", sortedPoints);
        convexHullPoints = [sortedPoints[0], sortedPoints[1]];

        for (let i = 2; i < sortedPoints.length; ++i) 
        {
            while (isRightTurn(convexHullPoints[convexHullPoints.length - 2],
            convexHullPoints[convexHullPoints.length - 1], sortedPoints[i])) 
            {
                convexHullPoints.pop();
            }
            convexHullPoints.push(sortedPoints[i]);
        }
        
    }
    
    return convexHullPoints;
}



/**
* Check if two segments have the same endpoints, 
* if yes, they are equivalent.
* @param [segment] seg1
* @param [segment] seg2
* @return [bool] true if seg1 is equivalent to seg2.
*/
function areSegmentsEq(seg1, seg2){
    if((seg1.p1 === seg2.p1 && seg1.p2 === seg2.p2) ||
        (seg1.p2 === seg2.p1 && seg1.p1 === seg2.p2)){
        return true;
    }
    return false;
}

/**
* Find all the possible inner segments/edges of the point which are inside its convex hull.
* All the segments/edges that can be drawn in the convex hull of the points set.
* The intersecting segments are allowed.
* @param [list of points] pointSet 
* @param [list of points] convexHullPoints
* @return [list of segments] innerSegments
*/
function getAllInnerSegmentsOfPointSet(pointSet, convexHullPoints){
    // Complexity O(n^3)
    let polygonCH = new Polygon(convexHullPoints);
    let innerSegments = []; 
    for(p1 of pointSet){ // Browse all pair of points
        for(p2 of pointSet){
            // If points are different, not forming a segment of CH and not already in list:
            // save the segment formed by the points in the innerSegments list. 
            if(p1 !== p2 && !polygonCH.areSegmentPoints(p1, p2)){
                let newSegment = new Segment(p1, p2);
                let inList = false;
                for (let i = 0; i < innerSegments.length; i++){
                    if(areSegmentsEq(newSegment, innerSegments[i])){
                        inList = true;
                        break;
                    }
                }
                if(!inList){
                    innerSegments.push(newSegment);
                }
            }
        }
    }
    return innerSegments;
}

// Maybe move it to utils.js
/**
* Class used to get combinations of size k from a list (n=list.length).
*/
class Combinator{
    constructor(){
        this.list = [];
        this.combination = [];
        this.combinations = [];
        // bool combination(s) can be removed
        this.boolCombination = [];
        this.boolCombinations = [];
    }
    findCombinations(offset, k){
        if(k === 0){
            //console.log(this.combination);
            //console.log(this.boolCombination);
            this.combinations.push(Array.from(this.combination));
            this.boolCombinations.push(Array.from(this.boolCombination)); // maybe not usefull
            return true;
        }
        for(let i = offset; i <= this.list.length - k; i++){
            this.combination.push(this.list[i]);
            this.boolCombination[i] = true;
            this.findCombinations(i + 1, k - 1);
            this.combination.pop();
            this.boolCombination[i] = false;
        }
    }
    getCombinationsOfSizeKFromList(k, list){
        if (k > list.length){
            throw new TypeError("k should be <= to the list length.");
            return null;
        }
        else{
            this.reset();
            for(let i = 0; i < list.length; i++){
                this.boolCombination.push(false);
            }
            this.list = list;
            this.findCombinations(0,k);
            //console.log(this.combinations);
            //console.log(this.boolCombinations);
            return Array.from(this.combinations);
       }
   }
    reset(){
        this.combination = [];
        this.combinations = [];
        this.boolCombination = [];
        this.boolCombinations = [];    
    }
}

/**
* @param [list] list
* @return [list of lists] a list of combinations of k elements from list variable,
* where k is going from 1 to list.length (included).
*/
function getAllCombinationsOf(list){
    let combinations = [];
    let combinator = new Combinator();
    for(let k = 1; k <= list.length; k++){
        let combinationsSizeK = combinator.getCombinationsOfSizeKFromList(k, list);
        for(let i = 0; i < combinationsSizeK.length; i++){
            combinations.push(combinationsSizeK[i]);
        }
    }
    return combinations;
}



/** 
 * Returns true if the first argument is in between the two other arguments. 
 * This method will behave as expected no matter what the order (min or max) of the bound arguments val1 and val2.
 */
function inInterval(val, val1, val2) 
{
  return (val <= val1 && val >= val2) || (val >= val1 && val <= val2);
}


/**
 * Returns the magintude of a line segment, which is its length in the euclidean plane.
 */
function lineMagnitude(x1, y1, x2, y2) 
{
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Returns the distance from a point to a line.
 */
function pointLineDistance(px, py, x1, y1, x2, y2) 
{
    let distance = null;
    let magnitude = lineMagnitude(x1, y1, x2, y2);

    if (magnitude < 0.00000001) 
    {
        distance = 9999;
        return distance;
    }

    let u1 = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
    let u = u1 / (magnitude * magnitude);

    if (u < 0.00001 || u > 1) 
    {
        let ix = lineMagnitude(px, py, x1, y1);
        let iy = lineMagnitude(px, py, x2, y2);

        if (ix > iy) 
        {
            distance = iy;
        } 
        else 
        {
            distance = ix;
        }
    } 

    else 
    {
        let ix = x1 + u * (x2 - x1);
        let iy = y1 + u * (y2 - y1);
        distance = lineMagnitude(px, py, ix, iy);
    }

    return distance;
}


/** 
 * Returns true if the coordinates x and y are situated on the given segment, allowing the x and y deltas to fluctuate using
 * a given margin. 
 */
function coordOnSegment(x, y, segment, clickMargin = POINT_RADIUS) {
    let res = null;
    let p1 = segment.p1;
    let p2 = segment.p2;
    let distance = pointLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);

    if ( dist(x, y, p1.x, p1.y) < POINT_RADIUS || dist(x, y, p2.x, p2.y) < POINT_RADIUS ) 
    {
        // console.log("same as one extreme point");
        res = null;
    }

    // x value in segment's click margin and
    // y value is between the segment extremities
    else if ( inInterval(x, p1.x + clickMargin, p1.x - clickMargin) && inInterval(y, p1.y, p2.y) )
    {
        // console.log("x in segment's click margin");
        res = new Point(p1.x, y);
    }

    // same y value and x value is between the segment extremities
    else if ( inInterval(y, p1.y + clickMargin, p1.y - clickMargin) && inInterval(x, p1.x, p2.x) )
    {
        // console.log("y in segment's click margin");
        res = new Point(x, p1.y);
    } 

    // inInterval(x, segment.p1.x + clickMargin, segment.p2.x - clickMargin) &&
    // inInterval(y, segment.p1.y + clickMargin, segment.p2.y - clickMargin) &&
    else if (distance < clickMargin) 
    {
        // let segmentSlope = (p2.x - p1.x)/(p2.y - p1.y);
        // let newPtY = segmentSlope.
        // console.log("point(x,y) is not in the segment click margin");
        res = new Point(x, y);
    }

    return res;
}


/** 
 * Returns true if the two segments intersect, false otherwise.
 * The two segments will intersect if the orientations are different for the first segment according to each extremity of the second segment,
 * and similarly the orientations are different for the second segment according to each extremity of the first segment
 */
function segmentsIntersect(seg1, seg2, allowAligned = true) 
{
    console.log("******");

    let orientDifferent = orientationsDifferent(seg1, seg2, allowAligned);
    let reverseOrientDifferent = orientationsDifferent(seg2, seg1, allowAligned);

    return orientDifferent && reverseOrientDifferent;
}

/** 
 * Returns true if the orientations of are different for the first segment according to each extremity of the second segment.
 * If the allow aligned parameter is false, the orientation of both segments will be considered the same and the return value
 * will thus be false.
 */
function orientationsDifferent(seg1, seg2, allowAligned = true)
{
    seg1Orient1 = getOrientation(seg1.p1, seg1.p2, seg2.p1);
    seg1Orient2 = getOrientation(seg1.p1, seg1.p2, seg2.p2);
    console.log(seg1Orient1);
    console.log(seg1Orient2);
    seg1AlignmentDetected = (seg1Orient1 === ORIENT.ALIGNED || seg1Orient2 === ORIENT.ALIGNED);
    
    if (seg1AlignmentDetected && ! allowAligned)
    { 
        return false;
    }

    return getOrientation(seg1.p1, seg1.p2, seg2.p1) !== getOrientation(seg1.p1, seg1.p2, seg2.p2);
}
