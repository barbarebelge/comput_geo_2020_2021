


class Point {
	constructor(x, y) 
	{
		if (typeOf(x) !== "number" && typeOf(y) !== "number") 
		{
			throw new TypeError("Operands of Point constructor should be numbers");
		}
		this.x = x;
		this.y = y;
		this.id = null;
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
		this.id = null;
		this.seg1 = new Segment(this.p1, this.p2);
		this.seg2 = new Segment(this.p2, this.p3);
		this.seg3 = new Segment(this.p3, this.p1);
		this.segs = [this.seg1, this.seg2, this.seg3];
		this.adjTris = null;
	}

	getSegments(){
		return this.segs;
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
			let a = trianglePoints[i];
			let c = trianglePoints[(i + 1) % NB_POINTS];
			orient = getOrientation(a, c, pt);

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

	isAdjacentTo(tri){
		for (let seg of this.segs){
			if(seg.equalsToAny(tri.getSegments())){
				return true;
			}
		}
		return false;
	}

	getAdjacentTrianglesFrom(triangles){
		let adjTris = [];
		for(let i = 0; i < triangles.length; i++){
			let tri = triangles[i];
			if(this.isAdjacentTo(tri)){
				adjTris.push(tri);
			}
		}
		this.adjTris = adjTris;
		return adjTris;
	}

	hasValidBijectionWith(triangle){
		let pts1 = [this.p1.id, this.p2.id, this.p3.id];
		let pts2 = [triangle.p1.id, triangle.p2.id, triangle.p3.id];
		let counter = 0;
		for (let i = 0; i < pts1.length; i++){
			if(valueEqualAny(pts1[i], pts2)){
				counter += 1;
			}
		}
		if(counter === 3){
			return true;
		}
		return false;
	}
}



function valueEqualAny(val, vals){
	for (let i = 0; i < vals.length; i++){
		if(val === vals[i]){
			return true;
		}
	}
	return false;
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

		/* Set the extremities using the coordinates's lexicographic order. */

		if (p1.x < p2.x)
		{
			this.p1 = p1;
			this.p2 = p2;
		}
		else if (p1.x > p2.x)
		{
			this.p1 = p2;
			this.p2 = p1;
		}
		else // p1.x === p2.x
		{
			if (p1.y < p2.y)
			{
				this.p1 = p1;
				this.p2 = p2;
			}
			else
			{
				this.p1 = p2;
				this.p2 = p1;
			}
		}
	}

	equals(other)
	{
		return (this.p1.equals(other.p1) && this.p2.equals(other.p2)) ||
		       (this.p1.equals(other.p2) && this.p2.equals(other.p1));
	}

	equalsToAny(segList){
		for (let other of segList)
		{
			if(this.equals(other)){
				return true;
			}
		}
		return false;
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
	return Math.abs(orientDet) <= 35;
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
						// if margin wanted, use isApproximatelyAlignment()
						// if no margin needed, use isAlignment()
						if (isApproximatelyAlignment(pointArray[i], pointArray[j], pointArray[k]))
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




