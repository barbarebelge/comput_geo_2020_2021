


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




class DCELVertex {
    constructor(pt, edge = null) 
    {
        if (!(pt instanceof Point)) 
        {
            throw new TypeError("DCELVertex constructor expects pt to be a Point");
        }

        this.pt = pt;
        this.outEdge = edge;
    }
}

class DCELFace {
    constructor(edge = null) 
    {
        this.startEdge = edge;
    }
}

class DCELEdge {
    constructor(originVertex = null)
    {
        this.origin = originVertex;
        this.prev = null;
        this.next = null;
        this.twin = null;
        this.face = null;
        // this.pEnd = pEnd;
    }
    getTarget(){
        return this.next.origin;
    }
}

class DCELGraph {
    constructor()
    {
        this.vertices = [];
        this.clockWiseEdges = []; // edges of the exterior face
        this.counterClockWiseEdges = []; // edges of the interior faces
        this.faces = []; // without the exteriorFace
        this.exteriorFace = null;
    }

    isVertexInside(vertex){
        for(let i = 0; i < this.vertices.length; i++){
            if(vertex === this.vertices[i]){
                return true;
            }
        }
        return false;
    }

    // Get the face containing the new vertex.
    // Search if the new vertex is in the incident faces of a vertex. 
    getFaceOfNewVertex(vertex, newVertex){
        let incidentEdges = this.getIncidentOutEdgesOfVertex(vertex);
        //console.log(incidentEdges);
        let face = null;
        for(let i = 0; i < incidentEdges.length; i++){
            face = incidentEdges[i].face;
            let curEdge = face.startEdge;
            let start = curEdge;
            let pointInside = true;
            while(curEdge.next !== start){
                if(isRightTurn(curEdge.origin.pt, curEdge.getTarget().pt, newVertex.pt)){
                    pointInside = false;
                    break;
                }
                curEdge = curEdge.next;
            }
            if(isRightTurn(curEdge.origin.pt, curEdge.getTarget().pt, newVertex.pt)){
                pointInside = false;
            }
            if(pointInside){
                break;
            }
        }
        return face;
    }

    getFacesSize(){
        let facesSize = [];
        for(let i = 0; i < this.faces.length; i++){
            facesSize.push(this.getFaceSegsFromIdx(i).length);
        }
        return facesSize;
    }

    // Get the segments of a face with index faceIdx
    getFaceSegsFromIdx(faceIdx){
        let face = this.faces[faceIdx];
        let start = face.startEdge;
        let curEdge = start;
        let faceSegs = [];
        while(curEdge.next !== start){ // stops at the edge before start
            faceSegs.push(this.getEdgeSegment(curEdge));
            curEdge = curEdge.next;
        }
        faceSegs.push(this.getEdgeSegment(curEdge));
        return faceSegs;
    }

    // Get the segment of the edge
    getEdgeSegment(edge){
        let seg = new Segment(edge.origin.pt, edge.next.origin.pt);
        return seg;
    }

    // Return the segments of the edges which are in counter clockwise.
    getEdgesSegments(){
        let edgesSegs = [];
        console.log(this.counterClockWiseEdges);
        for (let i = 0; i < this.counterClockWiseEdges.length; i++){
            let edge = this.counterClockWiseEdges[i];
            let seg = new Segment(edge.origin.pt, edge.next.origin.pt);
            edgesSegs.push(seg);
        }
        return edgesSegs;
    }


    // Used to test 
    getIncidentOutEdgesOfVertexIdx(vIdx){
        let vertex = this.vertices[vIdx];
        console.log("CCE: "+this.counterClockWiseEdges.length);
        console.log("CE: "+this.clockWiseEdges.length);
        console.log("V: "+this.vertices.length);
        let incidentEdges = [];
        // this method is not working 
        /*
        let curEdge = vertex.outEdge;
        let startEdge = curEdge;
        while(curEdge.twin.next !== startEdge){
            incidentEdges.push(this.getEdgeSegment(curEdge));
            curEdge = curEdge.twin.next;
        }
        */
        // this method is working
        for (let i = 0; i < this.counterClockWiseEdges.length; i++){
            if(this.counterClockWiseEdges[i].origin === vertex){
                incidentEdges.push(this.getEdgeSegment(this.counterClockWiseEdges[i]));
            }
        }
        for (let i = 0; i < this.clockWiseEdges.length; i++){
            if(this.clockWiseEdges[i].origin === vertex){
                incidentEdges.push(this.getEdgeSegment(this.clockWiseEdges[i]));
            }
        }
        console.log("Incident Outedges:");
        console.log(incidentEdges);
        return incidentEdges;
    }

    // This will return only the counter clockwise out edges which belongs to the bounds of the inner faces.
    getIncidentOutEdgesOfVertex(vertex){
        let incidentEdges = [];
        for (let i = 0; i < this.counterClockWiseEdges.length; i++){
            if(this.counterClockWiseEdges[i].origin === vertex){
                incidentEdges.push(this.counterClockWiseEdges[i]);
            }
        }
        // We don't need the clockWiseEdges
        /*
        for (let i = 0; i < this.clockWiseEdges.length; i++){
            if(this.clockWiseEdges[i].origin === vertex){
                incidentEdges.push(this.clockWiseEdges[i]);
            }
        }
        */
        return incidentEdges;
    }

    // This will return also the clockWise out edges, in addition of the counter clockwise.
    getAllIncidentOutEdgesOfVertex(vertex){
        let incidentEdges = [];
        //console.log("CCE: "+this.counterClockWiseEdges.length);
        //console.log("CE: "+this.clockWiseEdges.length);
        //console.log("V: "+this.vertices.length);
        
        for (let i = 0; i < this.counterClockWiseEdges.length; i++){
            if(this.counterClockWiseEdges[i].origin === vertex){
                //console.log("i: " + i);
                incidentEdges.push(this.counterClockWiseEdges[i]);
            }
        }
        
        for (let i = 0; i < this.clockWiseEdges.length; i++){
            if(this.clockWiseEdges[i].origin === vertex){
                //console.log("j: " + i);
                incidentEdges.push(this.clockWiseEdges[i]);
            }
        }
        
        //console.log("Incident Length: " + incidentEdges.length);
        return incidentEdges;
    }

    // Return the common face of two vertices.
    getVerticesCommonFace(vertex1, vertex2){
        let incidentEdgesV1 = this.getIncidentOutEdgesOfVertex(vertex1);
        let incidentEdgesV2 = this.getIncidentOutEdgesOfVertex(vertex2);
        let commonFace = null;
        let i1 = 0;
        let i2 = 0;
        while(i1 < incidentEdgesV1.length && commonFace === null){
            while(i2 < incidentEdgesV2.length && commonFace === null){
                if (incidentEdgesV1[i1].face === incidentEdgesV2[i2].face && incidentEdgesV2[i2].face !== this.exteriorFace){
                    commonFace = incidentEdgesV1[i1].face;
                }
                i2 += 1;
            }
            i1+=1;
        }
        return commonFace;
    }

    // Return the edge incident to the given vertex and face.
    getVertexIncidentEdgeToFace(vertex, face){
        let incidentEdges = this.getIncidentOutEdgesOfVertex(vertex);
        let edge = null;
        for(let i=0; i < incidentEdges.length; i++){
            if(incidentEdges[i].face === face){
                edge = incidentEdges[i];
                break;
            }
        }
        return edge; 
    }

    getVertexOfIdx(idx){
        return this.vertices[idx];
    }

    // Return the vertex index corresponding to one of the endpoints of the given segment.
    getCommonVertexIdxOfSegment(segment){
        let p1 = segment.p1;
        let p2 = segment.p2;
        let vertexIdx = null;
        let p = null;
        for (let i = 0; i < this.vertices.length; ++i) 
        {
            p = this.vertices[i].pt;
            if (p1 === p || p2 === p){
            //if(arePointsEq(segment.p1,this.vertices[i].pt) || arePointsEq(segment.p2,this.vertices[i].pt)){
                vertexIdx = i;
                break;
            }
        }
        if(vertexIdx === null){
            console.log("vertexIdx is null");
        }
        return vertexIdx;   
    }

    // Return the vertex index from the given point.
    getVertexIdxOfPoint(point){
        for (let i = 0; i < this.vertices.length; ++i) 
        {
            let p = this.vertices[i].pt;
            if (p === point){
                return i;
            }
        }
        return null;   
    }

    // Add an edge from the given segment and a given vertex idx into the dcel.
    // Case 1: edge between to existing vertices
    // Case 2: edge between an existing vertex and a new one.
    // return true if added with succes
    // return false if intersection or if vtIdx is null
    addEdgeFromSegment(segment, vtxIdx){
        let added = null;
        if(vtxIdx === null){
            console.log("The vertex idx is null.");
            added = false;
        }
        else{
            let p1 = segment.p1;
            let p2 = segment.p2;
            let v1 = this.vertices[vtxIdx];
            if (v1.pt === p1){ // p1 exsits already
                let v2Idx = this.getVertexIdxOfPoint(p2);
                if(v2Idx){
                    // connect two existing vertices
                    added = this.connectVertices(v1, this.vertices[v2Idx]);
                }
                else{ // p2 new vertex
                    // connect existing vertex to a new one
                    let v2 = new DCELVertex(p2);
                    added = this.connectVertexToNewVertex(v1, v2);
                }
            }
            else if(v1.pt === p2){ // p2 exists already
                let v2Idx = this.getVertexIdxOfPoint(p1);
                if(v2Idx){
                    // connect two existing vertices
                    added = this.connectVertices(v1, this.vertices[v2Idx]);
                }
                else{ // p1 new vertex
                    // connect existing vertex to a new one
                    let v2 = new DCELVertex(p1);
                    added = this.connectVertexToNewVertex(v1, v2);
                }
            }
        }
        return added;
    }

    // The convex hull points are in counter clockwise order.
    initFromConvexHullPoints(convexHullPoints){
        let exteriorFace = new DCELFace();
        let interiorFace = new DCELFace();

        this.faces.push(interiorFace);
        //this.faces.push(exteriorFace);
        this.exteriorFace = exteriorFace;

        const nbPoints = convexHullPoints.length;

        /* Create DCEL vertices from point instances. */
        for (let i = 0; i < nbPoints; ++i) 
        {
            let vertex = new DCELVertex(convexHullPoints[i]);
            this.vertices.push(vertex);
        }

        /* Creates exterior edges and their twins, creating the square shape.
        Also sets the face of each edge. */
        for (let i = 0; i < nbPoints; ++i) 
        {
            let pStart = this.vertices[i];
            let pStartReverse = this.vertices[(i + 1) % nbPoints];
            let newEdge = new DCELEdge();
            let newEdgeReverse = new DCELEdge();
            newEdge.origin = pStart;
            newEdgeReverse.origin = pStartReverse;
            pStart.outEdge = newEdge;
            pStartReverse.outEdge = newEdgeReverse;
            newEdge.twin = newEdgeReverse;
            newEdgeReverse.twin = newEdge;
            newEdge.face = interiorFace;
            newEdgeReverse.face = exteriorFace;
            this.counterClockWiseEdges.push(newEdge);
            this.clockWiseEdges.push(newEdgeReverse);
        }

        interiorFace.startEdge = this.counterClockWiseEdges[0];
        exteriorFace.startEdge = this.clockWiseEdges[0];

        /* Set the previous and next attributes of the edges. */
        for (let i = 0; i < nbPoints; ++i) 
        {
            let prevIndex = mod((i - 1), nbPoints);
            let nextIndex = mod((i + 1), nbPoints);

            this.counterClockWiseEdges[i].prev = this.counterClockWiseEdges[prevIndex];
            this.counterClockWiseEdges[i].next = this.counterClockWiseEdges[nextIndex];
            this.clockWiseEdges[i].prev = this.clockWiseEdges[prevIndex];
            this.clockWiseEdges[i].next = this.clockWiseEdges[nextIndex];
        }   
    }

    /** 
     * Add a new vertex and connect it to another existing vertex.
     */
    connectVertexToNewVertex(vertex, newVertex){
        if(this.connectVerticesIfNotIntersect(vertex, newVertex)){
            console.log("Connect existing vertex to new vertex");
            let face = this.getFaceOfNewVertex(vertex, newVertex);
            if (face === null){
                console.log("Face is null when connecting to new vertex");
            }
            let v1outEdge = this.getVertexIncidentEdgeToFace(vertex, face);
            if (v1outEdge === null){
                console.log("v1outEdge is null when connecting to new vertex");
            }
            let v1inEdge = v1outEdge.prev;
            let hedge = new DCELEdge(vertex);
            let hedgeTwin = new DCELEdge(newVertex);
            hedge.twin = hedgeTwin;
            hedgeTwin.twin = hedge;
            hedge.face = face;
            hedgeTwin.face = face;
            
            hedge.next = hedgeTwin;
            hedgeTwin.next = v1outEdge;
            hedge.prev = v1inEdge;
            hedgeTwin.prev = hedge;
            v1inEdge.next = hedge;
            v1outEdge.prev = hedgeTwin

            newVertex.outEdge = hedgeTwin;
            this.vertices.push(newVertex);
            this.counterClockWiseEdges.push(hedge);
            this.counterClockWiseEdges.push(hedgeTwin);
            console.log("Done connecting existing vertex to new vertex");
            return true;
        }
        else{
            console.log("There is an intersection");
            return false;
        }
    }

    // To Do
    // We need to connect first the segments having an existing vertex.
    // Remove from the list the segment succesfully added at each step.  
    // If intersection return false
    // All segments added return true (eventually check if faces are all triangular).
    /*
    addSegments(segments){
        for(let i = 0; i < segments.length; i++){
            let vtxIdx = this.getCommonVertexIdxOfSegment(segments[i]);
            if (vtxIdx !== null){
                this.addEdgeFromSegment(segments[i], vtxIdx);
            }
            else{
                console.log("The vtxIdx is null");
            }
        }
    }
    */

    addSegments(segments){
        let intersection = false;
        let i = 0;
        while (segments.length !== 0 && !intersection){
            let vtxIdx = this.getCommonVertexIdxOfSegment(segments[i]);
            if (vtxIdx !== null){
                let added = this.addEdgeFromSegment(segments[i], vtxIdx);
                if (!added){
                    intersection = true;
                    break;
                }
                else{
                    removeElem(segments[i], segments);
                    console.log("Len segments: "+segments.length);
                }
            }
            i = (i+1) % segments.length;
        }
        return !intersection;
    }
    

    areVerticesConnected(vertex1, vertex2){
        let edgeExists = false;
        let edges = this.getIncidentOutEdgesOfVertex(vertex1);
        for (let i = 0; i < edges.length; i++){
            if(edges[i].getTarget().pt === vertex2.pt){
                edgeExists = true;
            }
        }
        edges = this.getIncidentOutEdgesOfVertex(vertex2);
        for (let i = 0; i < edges.length; i++){
            if(edges[i].getTarget().pt === vertex1.pt){
                edgeExists = true;
            }
        }
        return edgeExists;   
    }

    /**
     * Connect two existing vertices if the edge to create does not intersect 
     * any other existing edge.
     */
    connectVerticesIfNotIntersect(vertex, newVertex)
    {
        let noIntersect = false;
        let edgeExists = this.areVerticesConnected(vertex, newVertex);
        
        if(edgeExists)
        {
            //showNotification("Vertices are already connected", FAILURE_RED);
            console.log("Vertices are already connected");
        }
        else
        {
            let newSegment = new Segment(vertex.pt, newVertex.pt);
            // let newPoint = new Point(x, y);
            // let newSegment = new Segment(points[points.length - 1], newPoint);
            // let maxIter = points.length - 2; // the last point has already been used in newSegment
            let intersectEdge = false;
            let halfedges = this.counterClockWiseEdges;
            halfedges = halfedges.concat(this.clockWiseEdges);
            for (let i = 0; i < halfedges.length; ++i) 
            {
                let e = halfedges[i];
                let existingSegment = new Segment(e.origin.pt, e.getTarget().pt);
                intersectEdge = segmentsIntersect(newSegment, existingSegment, false);

                if (intersectEdge) 
                {
                    // console.log("conflicting segment:", i, "->", i + 1);
                    console.log("Cannot add a point leading to intersecting edges");
                    //showNotification("Cannot add a point leading to intersecting edges", FAILURE_RED);
                    break;
                }
            }

            if (!intersectEdge) 
            {
                noIntersect = true;
                console.log("A new edge is added.");
            }
        }
        return noIntersect;

    }

    /**
     * Connect two existing vertices of the DCEL.
     * This will split a face in two faces.
     */
    connectVertices(vertex1, vertex2) 
    {
        if(this.connectVerticesIfNotIntersect(vertex1, vertex2)){
            console.log("Adding edge between two existing vertices.")
            // find the edges incident to their common face, because a vertex
            // can be incident to several faces and also can have several outEdges
            // the face can't be the exterior face
            let commonFace = this.getVerticesCommonFace(vertex1, vertex2);
            // edges originating from them and in counter clockwise sense
            if(commonFace === null){
                console.log("common face is null");
            }
            let v1outEdge = this.getVertexIncidentEdgeToFace(vertex1, commonFace);
            let v2outEdge = this.getVertexIncidentEdgeToFace(vertex2, commonFace);
            if(v1outEdge === null){
                console.log("v1outEdge is null");
            }
            // REMARK we have to set the vertices in counter clockwise order
            // if(v1.pt, v2.pt, v2.getTarget().pt) === LT => ok
            // else swap cause not in counter clockwise order.
            /*
            if(!isLeftTurn(vertex1.pt, vertex2.pt, v2outEdge.getTarget().pt)){
                let tmp = vertex1;
                vertex1 = vertex2;
                vertex2 = tmp;

                tmp = v1outEdge;
                v1outEdge = v2outEdge;
                v2outEdge = tmp;
            }
            */
            let face1 = new DCELFace();
            let face2 = new DCELFace();
            
            let edge = new DCELEdge(vertex1);
            let edgeTwin = new DCELEdge(vertex2);
            
            edge.twin = edgeTwin;
            edgeTwin.twin = edge;
           
            // et <-> v1out
            edgeTwin.next = v1outEdge;
            v1outEdge.prev = edgeTwin;

            let curEdge = edgeTwin;
            while(curEdge.getTarget() !== vertex2){
                curEdge.face = face1;
                curEdge = curEdge.next;
            }
            curEdge.face = face1; // the edge before vertex2, v2in
            // et <-> v2in
            edgeTwin.prev = curEdge;
            curEdge.next = edgeTwin;
            // e <-> v2out
            edge.next = v2outEdge;
            v2outEdge.prev = edge;

            curEdge = edge;
            while(curEdge.getTarget() !== vertex1){
                curEdge.face = face2;
                curEdge = curEdge.next;
            }
            curEdge.face = face2; // the edge before vertex1, v1in
            // e <-> v1in
            curEdge.next = edge;
            edge.prev = curEdge;

            face1.startEdge = edge;
            face2.startEdge = edgeTwin;

            vertex1.outEdge = edge;
            vertex2.outEdge = edgeTwin; 

            removeElem(commonFace, this.faces);
            this.faces.push(face1);
            this.faces.push(face2);
            this.counterClockWiseEdges.push(edge);
            this.counterClockWiseEdges.push(edgeTwin);
            console.log("Finished adding edge between two existing vertices.")
            return true;
        }
        else{
            console.log("There is an intersection");
            return false;
        }
    }
}

function getEdgesToSegments(edges){
    segs = [];
    for (let i = 0; i < edges.length; i++){
        let e = edges[i];
        segs.push(new Segment(e.origin.pt, e.getTarget().pt));
    }
    return segs;
}



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

function getAllTriangulations(pointSet, convexHullPoints){
    let pointSetSize = pointSet.length;
    let convexHullPointsSize = convexHullPoints.length;
    console.log("Triangulation Faces: " + getPointSetTriangulationFacesNb(pointSetSize, convexHullPointsSize));
    console.log("Triangulation Edges: " + getPointSetTriangulationEdgesNb(pointSetSize, convexHullPointsSize));
    let triangInnerEdgesNb = getPointSetTriangulationInnerEdgesNb(pointSetSize, convexHullPointsSize);
    console.log("Triangulation Inner Edges: " + triangInnerEdgesNb);
    let allInnerSegments = getAllInnerSegmentsOfPointSet(pointSet, convexHullPoints);
    console.log("All inner segments len: " + allInnerSegments.length);
    let allInnerSegmentsCombinations = getCombinationsOfSizeK(allInnerSegments, triangInnerEdgesNb);
    console.log("Combinations len: " + allInnerSegmentsCombinations.length);
    allInnerSegmentsCombinations = getSegsCombiWithNoIntersect(allInnerSegmentsCombinations);
    console.log("Combinations with no intersection len: " + allInnerSegmentsCombinations.length);

    let triangulations = [];
    for(let i = 0; i < allInnerSegmentsCombinations.length; i++){
        triangulations.push(getTrianglesFromCombi(allInnerSegmentsCombinations[i], convexHullPoints));
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
    let edgesNb = getPointSetTriangulationEdgesNb(pointSetSize, convexHullPointsNb)
    return edgesNb - convexHullPointsNb // convexHullPoints = number of edges of the Convex Hull
}

/**
* Check if two segments have the same endpoints, 
* if yes, they are equivalent.
* @param [segment] seg1
* @param [segment] seg2
* @return [bool] true if seg1 is equivalent to seg2.
*/
function areSegmentsEq(seg1, seg2){
    if((arePointsEq(seg1.p1, seg2.p1) && arePointsEq(seg1.p2, seg2.p2)) ||
        (arePointsEq(seg1.p2, seg2.p1) && arePointsEq(seg1.p1, seg2.p2))){
        return true;
    }
    return false;
}

function arePointsEq(p1, p2){
    if (p1.x === p2.x && p1.y === p2.y){
        return true;
    }
    return false;
}

function areSegmentsListIntersect(segments){
    intersect = false; 
    for(let i = 0; i < segments.length; i++){
        for(let j = 0; j < segments.length; j++){
            if(i !== j){
                if(segmentsIntersect(segments[i], segments[j])){
                    intersect = true;
                    return intersect;
                }
            }
        }
    }
    return intersect;
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

function getTrianglesFromCombi(innerSegsCombi, convexHullPoints){
    // each triangle represent a face
    let triangles = [];
    let segs = [];
    segs = segs.concat(innerSegsCombi);
    let convexHullSegs = getConvexHullSegs(convexHullPoints);
    segs = segs.concat(convexHullSegs);
    for (let i = 0; i < segs.length; i++){
        for (let j = 0; j < segs.length; j++){
            for (let k = 0; k < segs.length; k++){
                if (i!==j && i!==k && j!==k){
                    if(segsFormATriangle(segs[i], segs[j], segs[k])){
                        triangles.push([segs[i], segs[j], segs[k]]);
                    }
                }
            }
        }
    }
    return triangles;
}

// Triangle if each pair of segments has a common point
// and all the common points are different.
function segsFormATriangle(seg1, seg2 , seg3){
    let p1 = segsGetCommonPoint(seg1, seg2);
    let p2 = segsGetCommonPoint(seg1, seg3);
    let p3 = segsGetCommonPoint(seg2, seg3);
    if(segsHaveCommonPoint(seg1, seg2) &&
        segsHaveCommonPoint(seg1, seg3) &&
        segsHaveCommonPoint(seg2, seg3) &&
        !arePointsEq(p1,p2) &&
        !arePointsEq(p1,p3) &&
        !arePointsEq(p2,p3)){
        return true;
    }
    return false;
}

function segsHaveCommonPoint(seg1, seg2){
    if(arePointsEq(seg1.p1, seg2.p1) || 
        arePointsEq(seg1.p2, seg2.p2) || 
        arePointsEq(seg1.p1, seg2.p2) || 
        arePointsEq(seg1.p2, seg2.p1)){
        return true;
    }
    return false;
}

function segsGetCommonPoint(seg1, seg2){
    if(arePointsEq(seg1.p1, seg2.p1)){
        return seg1.p1;
    }
    else if(arePointsEq(seg1.p2, seg2.p2)){
        return seg1.p2; 
    }
    else if(arePointsEq(seg1.p1, seg2.p2)){
        return seg1.p1; 
    }
    else if(arePointsEq(seg1.p2, seg2.p1)){
        return seg1.p2; 
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

function getSegsCombiWithNoIntersect(segsCombinations){
    segsCombis = [];
    for(let i = 0; i < segsCombinations.length; i++){
        if(!areSegmentsListIntersect(segsCombinations[i])){
            segsCombis.push(segsCombinations[i]);
        }
    }
    return segsCombis;     
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
* @param [list] list
* @return [list of lists] a list with all combinations of size k from list
*/
function getCombinationsOfSizeK(list, k){
    let combinator = new Combinator();
    let combinations = combinator.getCombinationsOfSizeKFromList(k, list);
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


function segmentsIntersect(seg1, seg2, allowAligned = true){
  // return true if segments are intersecting, false otherwise
  // Remark it returns true if they are overlapped entierly.
  // return false if one common endpoint
  let intersect = false;
  let det1 = getOrientationDeterminant(seg1.p1, seg1.p2, seg2.p1);
  let det2 = getOrientationDeterminant(seg1.p1, seg1.p2, seg2.p2);
  let det3 = getOrientationDeterminant(seg2.p1, seg2.p2, seg1.p1);
  let det4 = getOrientationDeterminant(seg2.p1, seg2.p2, seg1.p2);
  if ((det1 * det2) < 0 && (det3 * det4) < 0) {
    // determinants different sign in the two cases => intersection between their endpoints
    intersect = true;
    // console.log("INTERSECT");
  } 
  else if (areSegmentsEq(seg1, seg2)){
    // segments are overlapped.
    //console.log("OVERLAPPED");
    intersect = true;
  }
  return intersect;
}

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

/** 
 * Returns true if the orientations of are different for the first segment according to each extremity of the second segment.
 * If the allow aligned parameter is false, the orientation of both segments will be considered the same and the return value
 * will thus be false.
 */
function orientationsDifferent(seg1, seg2, allowAligned = true)
{
    seg1Orient1 = getOrientation(seg1.p1, seg1.p2, seg2.p1);
    seg1Orient2 = getOrientation(seg1.p1, seg1.p2, seg2.p2);
    //console.log(seg1Orient1);
    //console.log(seg1Orient2);
    seg1AlignmentDetected = (seg1Orient1 === ORIENT.ALIGNED || seg1Orient2 === ORIENT.ALIGNED);
    
    if (seg1AlignmentDetected && ! allowAligned)
    { 
        return false;
    }

    return getOrientation(seg1.p1, seg1.p2, seg2.p1) !== getOrientation(seg1.p1, seg1.p2, seg2.p2);
}
