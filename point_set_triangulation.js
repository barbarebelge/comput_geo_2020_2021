



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

class CompatibleTriangulationFinder{
	constructor(pointSet1, triangulations1, pointSet2, triangulations2){
		this.pointSet1 = pointSet1;
		for (let i = 0; i < this.pointSet1.length; i++){
			this.pointSet1[i].id=i;
		}
		this.triangulations1 = [];
		for (let i = 0; i < triangulations1.length; i++){
			let triangulation = [];
			for (let j = 0; j < triangulations1[i].length; j++){
				let triPts = triangulations1[i][j];
				//consol.log(triPts);
				let tri = new Triangle(triPts[0], triPts[1], triPts[2]);
				tri.id = j;
				triangulation.push(tri);
			}
			this.triangulations1.push(triangulation);
		}
		this.pointSet2 = pointSet2;
		this.triangulations2 = [];
		for (let i = 0; i < triangulations2.length; i++){
			let triangulation = [];
			for (let j = 0; j < triangulations2[i].length; j++){
				let triPts = triangulations2[i][j];
				let tri = new Triangle(triPts[0], triPts[1], triPts[2]);
				triangulation.push(tri);
			}
			this.triangulations2.push(triangulation);
		}
		let pointsIds = [];
		for(let i = 0; i < pointSet2.length; i++){
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

function getPermutationsOf(array, permutations = [], len = array.length) {
	if (len === 1){
		permutations.push(Array.from(array)); // make a shallow copy and save it
	}
	for (let i = 0; i < len; i++) {
		getPermutationsOf(array, permutations, len - 1);
		// swap a and b: [a, b] = [b, a];
		if(len % 2 === 0){ // length even
			[array[i], array[len - 1]] = [array[len - 1], array[i]]; // swap elem i with last elem
		}
		else{ // length odd
			[array[0], array[len - 1]] = [array[len - 1], array[0]]; // swap first elem with last elem
		}
	}
	return permutations;
}