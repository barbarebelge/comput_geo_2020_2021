


class Point {
	constructor(x, y) 
	{
		if (typeOf(x) !== "number" && typeOf(y) !== "number") 
		{
			throw new TypeError("Operands of Point constructor should be numbers");
		}
		this.x = x;
		this.y = y;
	}

	equals(pt)
	{
		return (this.x === pt.x) && (this.y === pt.y);
	}

	equalsAny(ptList)
	{
		for (let other of ptList)
		{
			if (this.equals(other))
			{
				return true;
			}
		}

		return false;
	}

	static allDifferent(ptList)
	{	
		// use indices to make inner loop faster
		for (let i = 0 ; i < ptList.length ; ++i)
		{	
			// this loop is faster since we start from i 
			// (wrosk since all points before i have been compared with all other points)
			for (let j = i+1 ; j < ptList.length ; ++j)
			{
				if ( ptList[i].equals(ptList[j]) )
				{
					return false;
				}
			}
		}

		return true;
	}
}


class Triangle {
	constructor(p1, p2, p3) 
	{
		if (!p1 || !p2 || !p3) 
		{
		  throw new TypeError(
		    "Operands of Triangle constructor should be defined and non null"
		  );
		}

		if (! (p1 instanceof Point) && ! (p2 instanceof Point) && ! (p3 instanceof Point)) 
		{
			throw new TypeError("Operands of Triangle constructor should be Points");
		}

		if (! Point.allDifferent(p1, p2, p3))
		{
			throw new Error("Operands of Triangle should be distinct Points");
		}

		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
		this.centroid = new Point( (p1.x + p2.x + p3.x)/3 , (p1.y + p2.y + p3.y)/3 );
	}

	equals(other)
	{
		let otherPoints = [other.p1, other.p2, other.p3];

		if (this.p1.equalsAny(otherPoints) && this.p2.equalsAny(otherPoints) && this.p3.equalsAny(otherPoints))
		{
			return true;
		}

    	return false;
	}

	contains(pt)
	{
		let prevOrient = null;
		let orient = null;
		let trianglePoints = [this.p1, this.p2, this.p3];
		let NB_POINTS = trianglePoints.length;

		// loop over all edges
		// if all orientations for the selected pair of points applied
		// to the last added point are the same, then the point is inside the triangle
		for (let i = 0; i < NB_POINTS; ++i) 
		{
			prevOrient = orient;
			let a = trianglePoints[i % NB_POINTS];
			let c = trianglePoints[(i + 1) % NB_POINTS];
			orient = getOrientation(a, pt, c);

			if (prevOrient !== null && prevOrient !== orient) 
			{
				return false;
			}
		}

		return true;
	}

	containsAny(points)
	{
	    for(let i = 0; i < points.length; i++)
	    {
	        if(this.contains(points[i]))
	        {
	            return true;
	        }
	    }
	    return false;
	}

}


class Segment {
	constructor(p1, p2) 
	{
		if (!p1 || !p2) 
		{
		  throw new TypeError("Operands of Segment should be defined and non null");
		}

		if (! (p1 instanceof Point) && ! (p2 instanceof Point)) 
		{
		  throw new TypeError("Operands of Segment constructor should be Points");
		}

		if (p1.equals(p2))
		{
			throw new Error("Operands of Segment should be distinct Points");
		}

		this.p1 = p1;
		this.p2 = p2;

		/* Set the extremities using the coordinates's lexicographic order. */

		// if (p1.x < p2.x)
		// {
		// 	this.p1 = p1;
		// 	this.p2 = p2;
		// }
		// else if (p1.x > p2.x)
		// {
		// 	this.p1 = p2;
		// 	this.p2 = p1;
		// }
		// else // p1.x === p2.x
		// {
		// 	if (p1.y < p2.y)
		// 	{
		// 		this.p1 = p1;
		// 		this.p2 = p2;
		// 	}
		// 	else
		// 	{
		// 		this.p1 = p2;
		// 		this.p2 = p1;
		// 	}
		// }
	}

	equals(other)
	{
		return (this.p1.equals(other.p1) && this.p2.equals(other.p2)) ||
		       (this.p1.equals(other.p2) && this.p2.equals(other.p1));
	}

	hasExtremity(pt)
	{
		return (pt.equals(this.p1) || pt.equals(this.p2));
	}

	getCommonExtremity(other)
	{
	    if(this.p1.equalsAny([other.p1, other.p2]))
	    {
	        return this.p1;
	    }

	    else if(this.p2.equalsAny([other.p1, other.p2]))
	    {
	        return this.p2; 
	    }
	   
	    return null;
	}


	intersectsAny(segList)
	{
		for (let other of segList)
		{
			if (this.intersects(other))
			{
				return true;
			}
		}

		return false;
	}


	/** 
	 * Returns true if the two segments intersect, false otherwise.
	 * The two segments will intersect if the orientations are different for the first segment according 
	 * to each extremity of the second segment,
	 * and similarly the orientations are different for the second segment according to each extremity
	 * of the first segment. The allowCommonExtremity parameter is useful when building data structures that
	 * want to test intersections that are distinct from the extremities of the segments.
	 */
	intersects(other, allowCommonExtremity = true)
	{
		if (this.equals(other))
		{
			throw new Error("Segment intersect expects two distinct segments");
		}

		else if (this.hasExtremity(other.p1) || this.hasExtremity(other.p2))
		{
			return allowCommonExtremity;
		}

		// segments are different and have no common extremity
		else
		{
			let thisOrient1 = getOrientation(this.p1, this.p2, other.p1);
	    	let thisOrient2 = getOrientation(this.p1, this.p2, other.p2);

	    	let otherOrient1 = getOrientation(other.p1, other.p2, this.p1);
	    	let otherOrient2 = getOrientation(other.p1, other.p2, this.p2);

		    let orientDifferent = thisOrient1 !== thisOrient2;
		    let reverseOrientDifferent = otherOrient1 !== otherOrient2;

		    return orientDifferent && reverseOrientDifferent;
	    }

	}

	
	static noIntersections(segments, allowCommonExtremity = false)
	{
		for (let i = 0 ; i < segments.length ; ++i)
		{
			for (let j = i+1 ; j < segments.length ; ++j)
			{
				if ( segments[i].intersects(segments[j], allowCommonExtremity) )
				{
					return false;
				}
			}
		}

		return true;
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
    areSegmentExtremities(p1, p2){
        for (let seg of this.segments)
        {
        	if (seg.hasExtremity(p1) && seg.hasExtremity(p2))
        	{
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

function isAlignment(p1, pAngle, p2) {
    return getOrientation(p1, pAngle, p2) === ORIENT.ALIGNED;
}

function isApproximatelyAlignment(p1, pAngle, p2) {
	let orientDet = getOrientationDeterminant(p1, pAngle, p2);
	return Math.abs(orientDet) <= 10;
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





/*
tri is a triangle
r is a point
return true if r is strictly in xyz else return false
*/
// function isPointInTriangle(tri , r) {
//     let orients = [];
//     let isInside = false;
//     orients.push(getOrientation(tri.p1, tri.p2, r));
//     orients.push(getOrientation(tri.p2, tri.p3, r));
//     orients.push(getOrientation(tri.p3, tri.p1, r));
//     let onLeft = 0;
//     let onRight = 0;
//     let onLine = 0;
//     for (orient of orients) {
//         if (orient === ORIENT.RIGHT) {
//             onRight += 1;
//         } else if (orient === ORIENT.ALIGNED) {
//             onLine += 1;
//         } else if (orient === ORIENT.LEFT) {
//             onLeft += 1;
//         }
//     }
//     if (onLeft === 3 || onRight === 3) {
//         isInside = true;
//     }
//   return isInside;
// }



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


// /**
//  * Performs a Graham scan on the point set in order to create both the convex hull
//  * and the triangulation of the point set.
//  */
// function getGrahamScanTriangulation(points, leftMostPointIdx)
// {
//     let dcel = new DCELGraph();

//     let convexHullPoints = [];

//     if (points.length <= 2)
//     {
//         console.log("Not enough points to make convex hull or triangulation");
//     }

//     else
//     {
//         var sortedPoints = sortPointsRadially(points, leftMostPointIdx);
//         console.log("sorted points:", sortedPoints);
//         convexHullPoints = [sortedPoints[0], sortedPoints[1]];

//         for (let i = 2; i < sortedPoints.length; ++i) 
//         {
//             while (isRightTurn(convexHullPoints[convexHullPoints.length - 2],
//             convexHullPoints[convexHullPoints.length - 1], sortedPoints[i])) 
//             {
//                 convexHullPoints.pop();
//             }
//             convexHullPoints.push(sortedPoints[i]);
//         }
        
//     }
    
//     return convexHullPoints;
// }

function getAllTriangulations(pointSet, convexHullPoints){
    let pointSetSize = pointSet.length;
    let convexHullPointsSize = convexHullPoints.length;
    let combinator = new Combinator();
    console.log("Triangulation Faces: " + getPointSetTriangulationFacesNb(pointSetSize, convexHullPointsSize));
    console.log("Triangulation Edges: " + getPointSetTriangulationEdgesNb(pointSetSize, convexHullPointsSize));
    let triangInnerEdgesNb = getPointSetTriangulationInnerEdgesNb(pointSetSize, convexHullPointsSize);
    console.log("Triangulation Inner Edges: " + triangInnerEdgesNb);
    let allInnerSegments = getAllInnerSegmentsOfPointSet(pointSet, convexHullPoints);
    console.log("All inner segments len: " + allInnerSegments.length);
    let allInnerSegmentsCombinations = combinator.getCombinationsOfSizeKFromList(triangInnerEdgesNb, allInnerSegments);
    console.log("Combinations len: " + allInnerSegmentsCombinations.length);
    allInnerSegmentsCombinations = getSegsCombiWithNoIntersect(allInnerSegmentsCombinations);
    console.log("Combinations with no intersection len: " + allInnerSegmentsCombinations.length);

    let triangulations = [];
    for(let i = 0; i < allInnerSegmentsCombinations.length; i++){
    	let triangulation = getTrianglesFromCombi(combinator, pointSet, allInnerSegmentsCombinations[i], convexHullPoints);
        console.log("TRIANGLES NB: " + triangulation.length);
        triangulations.push(triangulation);
    }
    return triangulations;
}


/**
* @return [int] number of triangles/faces of a point set triangulation
*/
function getPointSetTriangulationFacesNb(pointSetSize, convexHullPointsNb){
    return 2 * pointSetSize - convexHullPointsNb - 2;
}


/**
* @return [int] number of edges of a point set triangulation
*/
function getPointSetTriangulationEdgesNb(pointSetSize, convexHullPointsNb){
    return 3 * pointSetSize - convexHullPointsNb - 3;
}


/**
* @return [int] number of inner edges of a point set triangulation
* which is the total number of edges of the triangulation without 
* the edges of the Convex Hull.
*/
function getPointSetTriangulationInnerEdgesNb(pointSetSize, convexHullPointsNb){
    let edgesNb = getPointSetTriangulationEdgesNb(pointSetSize, convexHullPointsNb);
    return edgesNb - convexHullPointsNb; // convexHullPoints = number of edges of the Convex Hull
}



function getConvexHullSegs(convexHullPoints){
    let points = convexHullPoints;
    segments = [];
    for(let i = 0; i < points.length; i++){
        let i2 = (i+1) % points.length;
        let segment = new Segment(points[i], points[i2]);
        segments.push(segment);
    }
    return segments;
}


function getTrianglesFromCombi(combinator, pointSet, innerSegsCombi, convexHullPoints){
    // each triangle represent a face of the triangulations
    let triangles = [];
    let segs = [];
    segs = segs.concat(innerSegsCombi);
    let convexHullSegs = getConvexHullSegs(convexHullPoints);
    segs = segs.concat(convexHullSegs);
    let combisOfTripleSegs = combinator.getCombinationsOfSizeKFromList(3, segs);
    let tri1 = new Triangle(convexHullPoints[0], convexHullPoints[1], convexHullPoints[2]);
    for (let i = 0; i < combisOfTripleSegs.length; i++){
        tripleSegs = combisOfTripleSegs[i];
        let trianglePoints = getTrianglePointsFromSegments(tripleSegs[0], tripleSegs[1], tripleSegs[2]);
        if(trianglePoints !== null){
            let tri2 = new Triangle(trianglePoints[0], trianglePoints[1], trianglePoints[2]);
            if(! tri2.containsAny(pointSet)){ // if the triangle does not contain other triangles
                // Special case the convex hull is a triangle and we need to ignore it.
            	if(convexHullPoints.length === 3){
                    if( ! tri1.equals(tri2) ){
                   	    triangles.push(trianglePoints);
                	}
                }
                else{
                    triangles.push(trianglePoints);
                }
            }
        }
    }
    return triangles;
}


/**
 * Returns a triplet of points if the segments passed as argument form exactly a triangle.
 * Otherwise, returns null.
 */
function getTrianglePointsFromSegments(seg1, seg2, seg3)
{
    let p1 = seg1.getCommonExtremity(seg2);
    let p2 = seg1.getCommonExtremity(seg3);
    let p3 = seg2.getCommonExtremity(seg3);

    if(p1 !== null && p2 !== null && p3 !== null && Point.allDifferent(p1, p2, p3))
    {
        return [p1, p2, p3];
    }

    return null;
}



/**
* Find all the possible inner segments/edges of the point which are inside its convex hull.
* All the segments/edges that can be drawn in the convex hull of the points set.
* The intersecting segments are allowed.
* @param [list of points] pointSet 
* @param [list of points] convexHullPoints
* @return [list of segments] innerSegments
*/
function getAllInnerSegmentsOfPointSet(pointSet, convexHullPoints)
{
    // Complexity O(n^3)
    let polygonCH = new Polygon(convexHullPoints);
    let innerSegments = []; 
    for(let p1 of pointSet){ // Browse all pair of points
        for(let p2 of pointSet){
            // If points are different, not forming a segment of CH and not already in list:
            // save the segment formed by the points in the innerSegments list. 
            if(! p1.equals(p2) && !polygonCH.areSegmentExtremities(p1, p2)){
                let newSegment = new Segment(p1, p2);
                let inList = false;
                for (let i = 0; i < innerSegments.length; i++){
                    if(newSegment.equals(innerSegments[i])){
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


function getSegsCombiWithNoIntersect(segsCombinations)
{
    segsCombis = [];
    for(let i = 0; i < segsCombinations.length; i++)
    {
        if(Segment.noIntersections(segsCombinations[i]))
        {
            segsCombis.push(segsCombinations[i]);
        }
    }
    return segsCombis;     
}




// function segmentsIntersect(seg1, seg2, allowAligned = true){
//   // return true if segments are intersecting, false otherwise
//   // Remark it returns true if they are overlapped entierly.
//   // return false if one common endpoint
//   let intersect = false;
//   let det1 = getOrientationDeterminant(seg1.p1, seg1.p2, seg2.p1);
//   let det2 = getOrientationDeterminant(seg1.p1, seg1.p2, seg2.p2);
//   let det3 = getOrientationDeterminant(seg2.p1, seg2.p2, seg1.p1);
//   let det4 = getOrientationDeterminant(seg2.p1, seg2.p2, seg1.p2);
//   if ((det1 * det2) < 0 && (det3 * det4) < 0) {
//     // determinants different sign in the two cases => intersection between their endpoints
//     intersect = true;
//     // console.log("INTERSECT");
//   } 
//   else if (seg1.equals(seg2)){
//     // segments are overlapped.
//     //console.log("OVERLAPPED");
//     intersect = true;
//   }
//   return intersect;
// }

/** 
 * Returns true if the two segments intersect, false otherwise.
 * The two segments will intersect if the orientations are different for the first segment according to each extremity of the second segment,
 * and similarly the orientations are different for the second segment according to each extremity of the first segment
 */
/*
function segmentsIntersect(seg1, seg2, allowAligned = true) 
{
    //console.log("******");

    let orientDifferent = orientationsDifferent(seg1, seg2, allowAligned);
    let reverseOrientDifferent = orientationsDifferent(seg2, seg1, allowAligned);

    return orientDifferent && reverseOrientDifferent;
}
*/


function pointSetInGeneralPosition(pointArray)
{	
	const NB_PTS = pointArray.length;

	if ( NB_PTS < 3 || (NB_PTS === 3 && ! isAlignment(pointArray[0], pointArray[1], pointArray[2])) )
	{
		return true;
	}

	for (let i = 0 ; i < NB_PTS ; ++i)
	{
		for (let j = 0 ; j < NB_PTS ; ++j)
		{
			if (j !== i)
			{
				for (let k = 0 ; k < NB_PTS ; ++k)
				{
					if (k !== j && k !== i)
					{
						if (isAlignment(pointArray[i], pointArray[j], pointArray[k]))
						{
							return false;
						}
					}
				}
			}
		}
	}

	return true;
}



// function sameTriangles(tri1, tri2)
// {
// 	for (let pt of tri1)
// 	{
// 		if ( ! (pt.equals(tri1[0]) && pt.equals(tri1[1]) && pt.equals(tri1[2])) )
// 		{
// 			return false;
// 		}
// 	}
// 	return true;
// }


// function isCompatibleTriangulations(triangulation1, triangulation2)
// {	
// 	let orderedTriangulation1
// 	for (let triangle of triangulaion1)
// 	{

// 	}

// 	let allSame = true;
// 	for (let triangle1 of triangulation1)
// 	{
// 		let matchAny = false;
// 		for (let triangle2 of triangulation2)
// 		{
// 			if (sameTriangles(triangle1, triangle2))
// 			{
// 				matchAny = true;
// 				break;
// 			}
			
// 		}

// 		// we iterated on all triangles of the second list without finding the same
// 		// triangle as triangle1, so the triangulations are not compatible
// 		if (! matchAny)
// 		{

// 		}
// 	}
// }
// 
// 




