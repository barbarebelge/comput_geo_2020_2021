


let makeTriangulationGenerator = function(pointSetParam, convexHullPointsParam)
{
	let combination = null;
	let tmpCombination = [];
	let pointSet = pointSetParam;
	let convexHullPoints = convexHullPointsParam;
	let coroutine = getNextTriangulation(); // create instance of the generator
	let paused = true;
	let counter = 1;

	function* getEdgeCombination(list, offset, k)
	{
		if (k > list.length)
		{
			throw new TypeError("k should be <= to the list length.");
		}

	    if (k === 0)
	    {
	    	console.log("yield res:", tmpCombination);
	    	combination = tmpCombination.slice();
	    	paused = true;
	    	yield;
	    }

	    else
		{
		    for(let i = offset; i <= list.length - k; ++i)
		    {
		        tmpCombination.push(list[i]);
		        let recurse = getEdgeCombination(list, i + 1, k - 1);
		        recurse.next();

		        // the nested call set the paused flag to true and made a yield
		        if (paused)
	        	{
	        		yield;
	        		recurse.next(); // exit the yield of the recursive call if there was one called
        		}

		        // let recurseRes = recurse.next().value;
		        tmpCombination.pop();

		        // some recursion found a solution, so wait
	        }

	    }

	}


	function* getNextTriangulation()
	{
	    let triangInnerEdgesNb = getPointSetTriangulationInnerEdgesNb(pointSet.length, convexHullPoints.length);
	    let allInnerSegments = getAllInnerSegmentsOfPointSet(pointSet, convexHullPoints);

		// let combination = null;
		let combinationCoRoutine = getEdgeCombination(allInnerSegments, 0, triangInnerEdgesNb); // instance of the function !!
		let continueLoop = true;

		counter = 100;//triangInnerEdgesNb;

		while (continueLoop)
		{
			// call the function from its current state until next yield call
			paused = false;
			combinationCoRoutine.next(); // updates combination
			console.log("combination:", combination);
			if (combination && combination !== null && combination.length > 0)
			{
				// if (SegmentSet.noIntersections(combination, true))
				// {
					yield combination.slice();
				// }

				// counter -= 1;
				// continueLoop = counter > 0;
			}

			else
			{
				console.log("Empty combination received from yield (", combination, ")");
				yield;
				// continueLoop = false;
			}
			counter -= 1;
			continueLoop = counter > 0;
		}


	}


	function next()
	{
		if (counter > 0)
		{
			return coroutine.next().value;
		}
		else
		{
			console.log("REACHED END OF GENERATOR");
			return null;
		}
	}

	return {next};

};




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
    	let triangulation = getTrianglesFromCombi(pointSet, allInnerSegmentsCombinations[i], convexHullPoints);
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


function getTrianglesFromCombi(pointSet, innerSegsCombi, convexHullPoints){
    // each triangle represent a face of the triangulations
    let triangles = [];
    let segs = [];
    let convexHullSegs = getConvexHullSegs(convexHullPoints);

    segs = segs.concat(innerSegsCombi);
    segs = segs.concat(convexHullSegs);

    let [seg1, seg2, seg3] = [null, null, null];
    let trianglePoints = null;
    let tri = null;

    for (let i = 0 ; i < segs.length ; ++i)
    {
    	seg1 = segs[i];

    	for (let j = i + 1 ; j < segs.length ; ++j)
    	{
    		seg2 = segs[j];

    		for (let k = j + 1 ; k < segs.length ; ++k)
    		{
    			seg3 = segs[k];
    			trianglePoints = getTrianglePointsFromSegments(seg1, seg2, seg3);

    			if(trianglePoints !== null)
			    {
			        tri = new Triangle(trianglePoints[0], trianglePoints[1], trianglePoints[2]);

			    	// if the triangle cannot be further triangulated, more specifically it does not contain any other point
			        if(! tri.containsAny(pointSet))
			        { 
			            triangles.push(tri); // old value: push(trianglePoints)
			        }
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
	// console.assert(seg1 && seg1 !== null);
	// console.assert(seg2 && seg2 !== null);
	// console.assert(seg3 && seg3 !== null);

	if (! seg1 || ! seg2 || ! seg3)
	{
		if (seg1)
		{
			console.log("seg1:", seg1.p1, " & ", seg1.p2);
		}
		else
		{
			console.log("seg1:", seg1);
		}

		if (seg2)
		{
			console.log("seg2:", seg2.p1, " & ", seg2.p2);
		}
		else
		{
			console.log("seg2:", seg2);
		}

		if (seg3)
		{
			console.log("seg3:", seg3.p1, " & ", seg3.p2);
		}
		else
		{
			console.log("seg3:", seg3);
		}
	}

    let p1 = seg1.getCommonExtremity(seg2);
    let p2 = seg1.getCommonExtremity(seg3);
    let p3 = seg2.getCommonExtremity(seg3);
    let pList = [p1, p2, p3];
    if(p1 !== null && p2 !== null && p3 !== null && Point.allDifferent(pList))
    {
        return pList;
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
    let convexHullPolygon = new Polygon(convexHullPoints);
    let innerSegments = []; 

    let p1 = null;
    let p2 = null;

    // Browse all pair of points
    for(let i = 0 ; i < pointSet.length ; ++i)
    { 
    	p1 = pointSet[i];

        for(let j = i+1 ; j < pointSet.length ; ++j)
        {
        	p2 = pointSet[j];

            // We are sure that points are different (from the nested loop start index),
            // need to check that they form a segment of the convex hull polygon (we don't want to remove those).
            // If not already in the list, save the segment to the innerSegments list. 
            if(! convexHullPolygon.areSegmentExtremities(p1, p2))
            {
                innerSegments.push(new Segment(p1, p2));
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



class CompatibleTriangulationFinder
{
	constructor(firstPointSet, firstTriangulationSet, secondPointSet, secondTriangulationSet)
	{
		this.pointSet1 = firstPointSet;
		this.pointSet2 = secondPointSet;

		this.triangulations1 = firstTriangulationSet;
		this.triangulations2 = secondTriangulationSet;

		for (let i = 0; i < this.pointSet1.length; i++)
		{
			this.pointSet1[i].id=i;
		}

		let pointsIds = [];

		for(let i = 0; i < this.pointSet2.length; i++)
		{
			pointsIds.push(i);
		}

		this.pointsIdsPerms = getPermutationsOf(pointsIds);
		this.compatibleTriangs = null;
	}

	setNewIdsToPointset2(ids){
		for (let i = 0; i < this.pointSet2.length; i++){
			this.pointSet2[i].id = ids[i];
		}
	}

	findCompatibleTriang(){
		let bijection = null;
		for (let i = 0; i < this.triangulations1.length; i++){
			for (let j = 0; j < this.triangulations2.length; j++){
				bijection = this.getCompatibleTriangsBijection(this.triangulations1[i], this.triangulations2[j]);
				if(bijection !== null){
					console.log("Compatible triangs: ",i, j);
					this.compatibleTriangs = [i, j];
					return bijection;
				}
			}
		}
		return bijection;
	}

	// tri1: triangulation1
	// tri2: triangulation2
	getCompatibleTriangsBijection(tri1, tri2){
		let adjTriangles1 = [];
		let adjTriangles2 = [];
		let bijectedTris = []; // contains the bijection between the pointsets triangles
		let bijection = null;
		for (let i = 0; i < tri1.length; i++){
			adjTriangles1.push(tri1[i].getAdjacentTrianglesFrom(tri1));
		}
		for (let i = 0; i < tri2.length; i++){
			adjTriangles2.push(tri2[i].getAdjacentTrianglesFrom(tri2));
		}
		for (let i = 0; i < this.pointsIdsPerms.length; i++){
			let ids = this.pointsIdsPerms[i];
			this.setNewIdsToPointset2(ids);
			// now make a link between the triangles with same ids for its points and its adjacent triangles points if possible
			bijection = this.getValidBijection(tri1, tri2, adjTriangles1, adjTriangles2);
			if(bijection !== null){
				break;
			}
			
		}
		this.compatibleTriangs = [0, 0];
		return bijection;
	}

	// tri1: triangulation1
	// tri2: triangulation2
	getValidBijection(tri1, tri2, adjTriangles1, adjTriangles2){
		let bijectedTris = [];
		for (let i = 0; i < tri1.length; i++){
			let bijectedTriIdx = this.getBijectedTriangleIdx(tri1[i], tri2);
			if(bijectedTriIdx !== null){
				if(this.isAdjacentBijectionValid(adjTriangles1[i], adjTriangles2[bijectedTriIdx])){
					bijectedTris.push([i, bijectedTriIdx]);
				}
				else{
					return null;
				}
			}
			else{
				return null;
			}
		}
		return bijectedTris;
	}

	isAdjacentBijectionValid(adjTri1, adjTri2){
		if(adjTri1.length !== adjTri2.length){
			return false;
		}
		let counter = 0;
		for (let i = 0; i < adjTri1.length; i++){
 			for (let j = 0; j < adjTri2.length; j++){
 				if(adjTri1[i].hasValidBijectionWith(adjTri2[j])){
 					counter += 1;
 				}
 			}
		}
		if (counter === adjTri1.length){
			return true;
		}
		return false;
	}

	getBijectedTriangleIdx(triangle1, tri2){
		for (let i = 0; i < tri2.length; i++){
			if(triangle1.hasValidBijectionWith(tri2[i])){
				return i;
			}
		}
		return null;
	}

}



