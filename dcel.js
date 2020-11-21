

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
}

class DCELGraph {
    constructor()
    {
        this.vertices = [];
        this.clockWiseEdges = [];
        this.counterClockWiseEdges = [];
        this.faces = [];
        this.prevClickedVertexIdx = null;
        this.clickedVertexIdx = null;
        this.currentVertexIdx = null;
        this.makeInitialSquare();
    }

    makeInitialSquare() 
    {
        addPoint(350, 550);
        addPoint(700, 550);
        addPoint(700, 200);
        addPoint(350, 200);

        let exteriorFace = new DCELFace();
        let interiorFace = new DCELFace();

        this.faces.push(interiorFace);
        this.faces.push(exteriorFace);

        const nbPoints = points.length;

        /* Create DCEL vertices from point instances. */
        for (let i = 0; i < nbPoints; ++i) 
        {
            let vertex = new DCELVertex(points[i]);
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
            let prevIndex = mod(i - 1, nbPoints);
            let nextIndex = mod(i + 1, nbPoints);

            this.counterClockWiseEdges[i].prev = this.counterClockWiseEdges[
            prevIndex];
            this.counterClockWiseEdges[i].next = this.counterClockWiseEdges[
            nextIndex];
            this.clockWiseEdges[i].prev = this.clockWiseEdges[prevIndex];
            this.clockWiseEdges[i].next = this.clockWiseEdges[nextIndex];
        }
    }

    checkClickedVertexIdx(x, y) 
    {
        for (let i = 0; i < this.vertices.length; ++i) 
        {
            let pt = this.vertices[i].pt;
            // if the click occured inside the radius of the point
            // then the point was clicked
            
            if (dist(x, y, pt.x, pt.y) < POINT_RADIUS) 
            {
            // this.prevClickedVertexIdx = this.clickedVertexIdx;
            // this.clickedVertexIdx = i;
            return i;
            }
        }

        // this.prevClickedVertexIdx = this.clickedVertexIdx;
        // this.clickedVertexIdx = null;
        return null;
    }

    /** 
     * Add a new vertex and connect it to another existing vertex.
     */
    connectVertex(vertex, newVertex, face) 
    {
        this.vertices.push(newVertex);
        this.connectVertices(vertex, newVertex, face);
    }

    /**
     * Connect two existing vertices if the edge to create does not intersect 
     * any other existing edge.
     */
    connectVerticesIfNotIntersect(vertex, newVertex, face)
    {
        let res = false;

        if (vertex.outEdge.next.origin.pt === newVertex.pt)
        {
            showNotification("Vertices are already connected", FAILURE_RED);
        }

        else
        {
            let newSegment = new Segment(vertex.pt, newVertex.pt);
            // let newPoint = new Point(x, y);
            // let newSegment = new Segment(points[points.length - 1], newPoint);
            // let maxIter = points.length - 2; // the last point has already been used in newSegment
            let intersectEdge = false;
            for (let i = 0; i < this.counterClockWiseEdges.length; ++i) 
            {
                let e = this.counterClockWiseEdges[i];
                let existingSegment = new Segment(e.origin.pt, e.next.origin.pt);
                intersectEdge = segmentsIntersect(newSegment, existingSegment, false);

                if (intersectEdge) 
                {
                    // console.log("conflicting segment:", i, "->", i + 1);
                    showNotification("Cannot add a point leading to intersecting edges", FAILURE_RED);
                    break;
                }
            }

            if (!intersectEdge) 
            {
                this.connectVertices(vertex, newVertex, face);
                res = true;
            }
        }

        return res;

    }


    /**
     * Connect two existing vertices of the DCEL.
     */
    connectVertices(vertex, newVertex, face) 
    {
        let edge = new DCELEdge(vertex);
        let edgeTwin = new DCELEdge(newVertex);
        edge.twin = edgeTwin;
        edgeTwin.twin = edge;

        edge.face = face;
        edgeTwin.face = face;

        edge.next = edgeTwin;

        if (vertex.outEdge) 
        {
            edge.prev = vertex.outEdge.prev;
            edgeTwin.next = vertex.outEdge.twin;
        }
        edgeTwin.prev = edge;

        // update out egdes at the end, so we could use the old values
        // to update everything
        vertex.outEdge = edge;
        newVertex.outEdge = edgeTwin;

        this.counterClockWiseEdges.push(edge);
        this.clockWiseEdges.push(edgeTwin);
    }


  /** 
   * Returns a point if it was clicked on, a
   * and null if none was clicked.
   */
    checkClickedSegmentPoint(x, y) 
    {
        let res = null;
        const nbEdges = this.clockWiseEdges.length;
        console.log("check if clicked on segment ...");
        console.log("nb points:", nbEdges);
        let segmentPoint = null;

        for (let i = 0; i < nbEdges; ++i) 
        {
            let edge = this.counterClockWiseEdges[i];
            let vertex = edge.origin;
            let nextVertex = edge.next.origin;
            let segment = new Segment(vertex.pt, nextVertex.pt);
            segmentPoint = coordOnSegment(x, y, segment);

            if (segmentPoint) 
            {
                res = [i, vertex, nextVertex, segmentPoint];
            }
        }

        return res;
    }

    splitSegmentIfCLicked(x, y) 
    {
        let tuple = this.checkClickedSegmentPoint(x, y);
        if (tuple) 
        {
            this.splitEdge(tuple[0], tuple[1], tuple[2], tuple[3]);
            return true;
        }
        return false;
    }

    splitEdge(edgeIdx, vertex, nextVertex, splitPoint) 
    {
        console.log("split edge ...");
        let newVertex = new DCELVertex(splitPoint);
        let inEdge = new DCELEdge(vertex);
        let inEdgeTwin = new DCELEdge(newVertex);
        let outEdge = new DCELEdge(newVertex);
        let outEdgeTwin = new DCELEdge(nextVertex); // vertex.outEdge.next.origin

        inEdge.twin = inEdgeTwin;
        inEdgeTwin.twin = inEdge;
        inEdge.face = vertex.outEdge.face;
        inEdgeTwin.face = vertex.outEdge.twin.face;
        inEdge.prev = vertex.outEdge.prev;
        inEdgeTwin.prev = outEdgeTwin;
        inEdge.next = outEdge;
        inEdgeTwin.next = vertex.outEdge.twin.next;
        
        outEdge.twin = outEdgeTwin;
        outEdgeTwin.twin = outEdge;
        outEdge.face = nextVertex.outEdge.prev.face;
        outEdgeTwin.face = nextVertex.outEdge.prev.twin.face;
        outEdge.prev = inEdge;
        outEdgeTwin.prev = nextVertex.outEdge.twin;
        outEdge.next = nextVertex.outEdge;
        outEdgeTwin.next = inEdgeTwin;

        vertex.outEdge = inEdge;
        console.log("remove edge id: ", edgeIdx);
        this.counterClockWiseEdges.splice(edgeIdx, 1);
        this.clockWiseEdges.splice(edgeIdx, 1);

        newVertex.outEdge = outEdge;
        nextVertex.outEdge.prev = outEdge;

        points.push(splitPoint);
        this.vertices.push(newVertex);
        this.counterClockWiseEdges.push(inEdge);
        this.counterClockWiseEdges.push(outEdge);
        this.clockWiseEdges.push(inEdgeTwin);
        this.clockWiseEdges.push(outEdgeTwin);
    }
}
