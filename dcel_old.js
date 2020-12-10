

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