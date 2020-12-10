



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

