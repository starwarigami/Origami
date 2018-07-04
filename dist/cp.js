"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var EPSILON_LOW = 0.003;
var EPSILON = 0.00001;
var EPSILON_HIGH = 0.00000001;
var EPSILON_UI = 0.05;
var Tree = (function () {
    function Tree(thisObject) {
        this.obj = thisObject;
        this.parent = undefined;
        this.children = [];
    }
    return Tree;
}());
function isValidPoint(point) { return (point !== undefined && !isNaN(point.x) && !isNaN(point.y)); }
function isValidNumber(n) { return (n !== undefined && !isNaN(n) && !isNaN(n)); }
function pointsSimilar(a, b, epsilon) {
    if (epsilon == undefined) {
        epsilon = EPSILON_HIGH;
    }
    return epsilonEqual(a.x, b.x, epsilon) && epsilonEqual(a.y, b.y, epsilon);
}
function epsilonEqual(a, b, epsilon) {
    if (epsilon === undefined) {
        epsilon = EPSILON_HIGH;
    }
    return (Math.abs(a - b) < epsilon);
}
function cleanNumber(num, decimalPlaces) {
    if (Math.floor(num) == num || decimalPlaces == undefined) {
        return num;
    }
    return parseFloat(num.toFixed(decimalPlaces));
}
function clockwiseInteriorAngleRadians(a, b) {
    while (a < 0) {
        a += Math.PI * 2;
    }
    while (b < 0) {
        b += Math.PI * 2;
    }
    var a_b = a - b;
    if (a_b >= 0)
        return a_b;
    return Math.PI * 2 - (b - a);
}
function counterClockwiseInteriorAngleRadians(a, b) {
    while (a < 0) {
        a += Math.PI * 2;
    }
    while (b < 0) {
        b += Math.PI * 2;
    }
    var b_a = b - a;
    if (b_a >= 0)
        return b_a;
    return Math.PI * 2 - (a - b);
}
function clockwiseInteriorAngle(a, b) {
    var dotProduct = b.x * a.x + b.y * a.y;
    var determinant = b.x * a.y - b.y * a.x;
    var angle = Math.atan2(determinant, dotProduct);
    if (angle < 0) {
        angle += Math.PI * 2;
    }
    return angle;
}
function counterClockwiseInteriorAngle(a, b) {
    var dotProduct = a.x * b.x + a.y * b.y;
    var determinant = a.x * b.y - a.y * b.x;
    var angle = Math.atan2(determinant, dotProduct);
    if (angle < 0) {
        angle += Math.PI * 2;
    }
    return angle;
}
function interiorAngles(a, b) {
    var interior1 = clockwiseInteriorAngle(a, b);
    var interior2 = Math.PI * 2 - interior1;
    if (interior1 < interior2)
        return [interior1, interior2];
    return [interior2, interior1];
}
function bisectVectors(a, b) {
    a = a.normalize();
    b = b.normalize();
    return [(a.add(b)).normalize(),
        new XY(-a.x + -b.x, -a.y + -b.y).normalize()];
}
function intersect_vec_func(aOrigin, aVec, bOrigin, bVec, compFunction, epsilon) {
    function determinantXY(a, b) { return a.x * b.y - b.x * a.y; }
    var denominator0 = determinantXY(aVec, bVec);
    var denominator1 = -denominator0;
    if (epsilonEqual(denominator0, 0, epsilon)) {
        return undefined;
    }
    var numerator0 = determinantXY(bOrigin.subtract(aOrigin), bVec);
    var numerator1 = determinantXY(aOrigin.subtract(bOrigin), aVec);
    var t0 = numerator0 / denominator0;
    var t1 = numerator1 / denominator1;
    if (compFunction(t0, t1)) {
        return aOrigin.add(aVec.scale(t0));
    }
}
function intersectionLineLine(a, b, epsilon) {
    if (epsilon === undefined) {
        epsilon = EPSILON_HIGH;
    }
    return intersect_vec_func(new XY(a.point.x, a.point.y), new XY(a.direction.x, a.direction.y), new XY(b.point.x, b.point.y), new XY(b.direction.x, b.direction.y), function (t0, t1) { return true; }, epsilon);
}
function intersectionLineRay(line, ray, epsilon) {
    if (epsilon === undefined) {
        epsilon = EPSILON_HIGH;
    }
    return intersect_vec_func(new XY(line.point.x, line.point.y), new XY(line.direction.x, line.direction.y), new XY(ray.origin.x, ray.origin.y), new XY(ray.direction.x, ray.direction.y), function (t0, t1) { return t1 >= -epsilon; }, epsilon);
}
function intersectionLineEdge(line, edge, epsilon) {
    if (epsilon === undefined) {
        epsilon = EPSILON_HIGH;
    }
    return intersect_vec_func(new XY(line.point.x, line.point.y), new XY(line.direction.x, line.direction.y), new XY(edge.nodes[0].x, edge.nodes[0].y), new XY(edge.nodes[1].x - edge.nodes[0].x, edge.nodes[1].y - edge.nodes[0].y), function (t0, t1) { return t1 >= -epsilon && t1 <= 1 + epsilon; }, epsilon);
}
function intersectionRayRay(a, b, epsilon) {
    if (epsilon === undefined) {
        epsilon = EPSILON_HIGH;
    }
    return intersect_vec_func(new XY(a.origin.x, a.origin.y), new XY(a.direction.x, a.direction.y), new XY(b.origin.x, b.origin.y), new XY(b.direction.x, b.direction.y), function (t0, t1) { return t0 >= -epsilon && t1 >= -epsilon; }, epsilon);
}
function intersectionRayEdge(ray, edge, epsilon) {
    if (epsilon === undefined) {
        epsilon = EPSILON_HIGH;
    }
    return intersect_vec_func(new XY(ray.origin.x, ray.origin.y), new XY(ray.direction.x, ray.direction.y), new XY(edge.nodes[0].x, edge.nodes[0].y), new XY(edge.nodes[1].x - edge.nodes[0].x, edge.nodes[1].y - edge.nodes[0].y), function (t0, t1) { return t0 >= -epsilon && t1 >= -epsilon && t1 <= 1 + epsilon; }, epsilon);
}
function intersectionEdgeEdge(a, b, epsilon) {
    if (epsilon === undefined) {
        epsilon = EPSILON_HIGH;
    }
    return intersect_vec_func(new XY(a.nodes[0].x, a.nodes[0].y), new XY(a.nodes[1].x - a.nodes[0].x, a.nodes[1].y - a.nodes[0].y), new XY(b.nodes[0].x, b.nodes[0].y), new XY(b.nodes[1].x - b.nodes[0].x, b.nodes[1].y - b.nodes[0].y), function (t0, t1) { return t0 >= -epsilon && t0 <= 1 + epsilon && t1 >= -epsilon && t1 <= 1 + epsilon; }, epsilon);
}
function intersectionCircleLine(center, radius, p0, p1) {
    var r_squared = Math.pow(radius, 2);
    var x1 = p0.x - center.x;
    var y1 = p0.y - center.y;
    var x2 = p1.x - center.x;
    var y2 = p1.y - center.y;
    var dx = x2 - x1;
    var dy = y2 - y1;
    var dr_squared = dx * dx + dy * dy;
    var D = x1 * y2 - x2 * y1;
    function sgn(x) { if (x < 0) {
        return -1;
    } return 1; }
    var x1 = (D * dy + sgn(dy) * dx * Math.sqrt(r_squared * dr_squared - (D * D))) / (dr_squared);
    var x2 = (D * dy - sgn(dy) * dx * Math.sqrt(r_squared * dr_squared - (D * D))) / (dr_squared);
    var y1 = (-D * dx + Math.abs(dy) * Math.sqrt(r_squared * dr_squared - (D * D))) / (dr_squared);
    var y2 = (-D * dx - Math.abs(dy) * Math.sqrt(r_squared * dr_squared - (D * D))) / (dr_squared);
    var intersections = [];
    if (!isNaN(x1)) {
        intersections.push(new XY(x1 + center.x, y1 + center.y));
    }
    if (!isNaN(x2)) {
        intersections.push(new XY(x2 + center.x, y2 + center.y));
    }
    return intersections;
}
var Matrix = (function () {
    function Matrix(a, b, c, d, tx, ty) {
        this.a = (a !== undefined) ? a : 1;
        this.b = (b !== undefined) ? b : 0;
        this.c = (c !== undefined) ? c : 0;
        this.d = (d !== undefined) ? d : 1;
        this.tx = (tx !== undefined) ? tx : 0;
        this.ty = (ty !== undefined) ? ty : 0;
    }
    Matrix.prototype.identity = function () { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.tx = 0; this.ty = 0; return this;};
    Matrix.prototype.mult = function (mat) {
        var r = new Matrix();
        r.a = this.a * mat.a + this.c * mat.b;
        r.c = this.a * mat.c + this.c * mat.d;
        r.tx = this.a * mat.tx + this.c * mat.ty + this.tx;
        r.b = this.b * mat.a + this.d * mat.b;
        r.d = this.b * mat.c + this.d * mat.d;
        r.ty = this.b * mat.tx + this.d * mat.ty + this.ty;
        return r;
    };
    Matrix.prototype.reflection = function (vector, offset) {
        var angle = Math.atan2(vector.y, vector.x);
        var cosAngle = Math.cos(angle);
        var sinAngle = Math.sin(angle);
        var _cosAngle = Math.cos(-angle);
        var _sinAngle = Math.sin(-angle);
        this.a = cosAngle * _cosAngle + sinAngle * _sinAngle;
        this.b = cosAngle * -_sinAngle + sinAngle * _cosAngle;
        this.c = sinAngle * _cosAngle + -cosAngle * _sinAngle;
        this.d = sinAngle * -_sinAngle + -cosAngle * _cosAngle;
        if (offset !== undefined) {
            this.tx = offset.x + this.a * -offset.x + -offset.y * this.c;
            this.ty = offset.y + this.b * -offset.x + -offset.y * this.d;
        }
        return this;
    };
    Matrix.prototype.rotation = function (angle, origin) {
        this.a = Math.cos(angle);
        this.c = -Math.sin(angle);
        this.b = Math.sin(angle);
        this.d = Math.cos(angle);
        if (origin !== undefined) {
            this.tx = origin.x;
            this.ty = origin.y;
        }
        return this;
    };
    Matrix.prototype.copy = function () {
        var m = new Matrix();
        m.a = this.a;
        m.c = this.c;
        m.tx = this.tx;
        m.b = this.b;
        m.d = this.d;
        m.ty = this.ty;
        return m;
    };
    return Matrix;
}());
var XY = (function () {
    function XY(x, y) {
        this.x = x;
        this.y = y;
    }
    XY.prototype.equivalent = function (point, epsilon) {
        if (epsilon == undefined) {
            epsilon = EPSILON_HIGH;
        }
        return (epsilonEqual(this.x, point.x, epsilon) && epsilonEqual(this.y, point.y, epsilon));
    };
    XY.prototype.normalize = function () { var m = this.magnitude(); return new XY(this.x / m, this.y / m); };
    XY.prototype.dot = function (point) { return this.x * point.x + this.y * point.y; };
    XY.prototype.cross = function (vector) { return this.x * vector.y - this.y * vector.x; };
    XY.prototype.magnitude = function () { return Math.sqrt(this.x * this.x + this.y * this.y); };
    XY.prototype.distanceTo = function (a) { return Math.sqrt(Math.pow(this.x - a.x, 2) + Math.pow(this.y - a.y, 2)); };
    XY.prototype.transform = function (matrix) {
        return new XY(this.x * matrix.a + this.y * matrix.c + matrix.tx, this.x * matrix.b + this.y * matrix.d + matrix.ty);
    };
    XY.prototype.translate = function (dx, dy) { return new XY(this.x + dx, this.y + dy); };
    XY.prototype.rotate90 = function () { return new XY(-this.y, this.x); };
    XY.prototype.rotate180 = function () { return new XY(-this.x, -this.y); };
    XY.prototype.rotate270 = function () { return new XY(this.y, -this.x); };
    XY.prototype.rotate = function (angle, origin) { return this.transform(new Matrix().rotation(angle, origin)); };
    XY.prototype.lerp = function (point, pct) { var inv = 1.0 - pct; return new XY(this.x * pct + point.x * inv, this.y * pct + point.y * inv); };
    XY.prototype.midpoint = function (other) { return new XY((this.x + other.x) * 0.5, (this.y + other.y) * 0.5); };
    XY.prototype.reflect = function (line) {
        var origin = (line.direction != undefined) ? (line.point || line.origin) : new XY(line.nodes[0].x, line.nodes[0].y);
        var vector = (line.direction != undefined) ? line.direction : new XY(line.nodes[1].x, line.nodes[1].y).subtract(origin);
        return this.transform(new Matrix().reflection(vector, origin));
    };
    XY.prototype.scale = function (magnitude) { return new XY(this.x * magnitude, this.y * magnitude); };
    XY.prototype.add = function (a, b) {
        if (isValidPoint(a)) {
            return new XY(this.x + a.x, this.y + a.y);
        }
        else if (isValidNumber(b)) {
            return new XY(this.x + a, this.y + b);
        }
    };
    XY.prototype.subtract = function (point) { return new XY(this.x - point.x, this.y - point.y); };
    XY.prototype.multiply = function (m) { return new XY(this.x * m.x, this.y * m.y); };
    XY.prototype.abs = function () { return new XY(Math.abs(this.x), Math.abs(this.y)); };
    XY.prototype.commonX = function (point, epsilon) { return epsilonEqual(this.x, point.x, epsilon); };
    XY.prototype.commonY = function (point, epsilon) { return epsilonEqual(this.y, point.y, epsilon); };
    return XY;
}());
var LineType = (function () {
    function LineType() {
    }
    LineType.prototype.length = function () { };
    LineType.prototype.vector = function () { };
    LineType.prototype.parallel = function (line, epsilon) { };
    LineType.prototype.collinear = function (point) { };
    LineType.prototype.equivalent = function (line, epsilon) { };
    LineType.prototype.degenrate = function (epsilon) { };
    LineType.prototype.intersection = function (line, epsilon) { };
    LineType.prototype.reflectionMatrix = function () { };
    LineType.prototype.nearestPoint = function (point) { };
    LineType.prototype.nearestPointNormalTo = function (point) { };
    LineType.prototype.transform = function (matrix) { };
    return LineType;
}());
var Line = (function () {
    function Line(a, b, c, d) {
        if (a.x !== undefined) {
            this.point = new XY(a.x, a.y);
            this.direction = new XY(b.x, b.y);
        }
        else {
            this.point = new XY(a, b);
            this.direction = new XY(c, d);
        }
    }
    Line.prototype.rays = function () { var a = new Ray(this.point, this.direction); return [a, a.flip()]; };
    Line.prototype.length = function () { return Infinity; };
    Line.prototype.vector = function () { return this.direction; };
    Line.prototype.parallel = function (line, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        var v = (line.nodes !== undefined)
            ? new XY(line.nodes[1].x - line.nodes[0].x, line.nodes[1].y - line.nodes[0].y)
            : line.direction;
        return (v !== undefined) ? epsilonEqual(this.direction.cross(v), 0, epsilon) : undefined;
    };
    Line.prototype.collinear = function (point, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        var x = [this.point.x, this.point.x + this.direction.x, point.x];
        var y = [this.point.y, this.point.y + this.direction.y, point.y];
        return epsilonEqual(x[0] * (y[1] - y[2]) + x[1] * (y[2] - y[0]) + x[2] * (y[0] - y[1]), 0, epsilon);
    };
    Line.prototype.equivalent = function (line, epsilon) {
        return this.collinear(line.point, epsilon) && this.parallel(line, epsilon);
    };
    Line.prototype.degenrate = function (epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        return epsilonEqual(this.direction.magnitude(), 0, epsilon);
    };
    Line.prototype.intersection = function (line, epsilon) {
        if (line instanceof Line) {
            return intersectionLineLine(this, line, epsilon);
        }
        if (line instanceof Ray) {
            return intersectionLineRay(this, line, epsilon);
        }
        if (line instanceof Edge) {
            return intersectionLineEdge(this, line, epsilon);
        }
    };
    Line.prototype.reflectionMatrix = function () { return new Matrix().reflection(this.direction, this.point); };
    Line.prototype.nearestPoint = function (point) { return this.nearestPointNormalTo(point); };
    Line.prototype.nearestPointNormalTo = function (point) {
        var v = this.direction.normalize();
        var u = ((point.x - this.point.x) * v.x + (point.y - this.point.y) * v.y);
        return new XY(this.point.x + u * v.x, this.point.y + u * v.y);
    };
    Line.prototype.transform = function (matrix) {
        return new Line(this.point.transform(matrix), this.direction.transform(matrix));
    };
    Line.prototype.bisect = function (line) {
        if (this.parallel(line)) {
            return [new Line(this.point.midpoint(line.point), this.direction)];
        }
        else {
            var intersection = intersectionLineLine(this, line);
            var vectors = bisectVectors(this.direction, line.direction);
            vectors[1] = vectors[1].rotate90();
            if (Math.abs(this.direction.cross(vectors[1])) < Math.abs(this.direction.cross(vectors[0]))) {
                var swap = vectors[0];
                vectors[0] = vectors[1];
                vectors[1] = swap;
            }
            return vectors.map(function (el) { return new Line(intersection, el); }, this);
        }
    };
    Line.prototype.subsect = function (line, count) {
        var pcts = Array.apply(null, Array(count)).map(function (el, i) { return i / count; });
        pcts.shift();
        if (this.parallel(line)) {
            return pcts.map(function (pct) { return new Line(this.point.lerp(line.point, pct), this.direction); }, this);
        }
        else {
            var intersection = intersectionLineLine(this, line);
            return [
                [new Sector(intersection, [intersection.add(this.direction), intersection.add(line.direction)]),
                    new Sector(intersection, [intersection.add(this.direction), intersection.add(line.direction.rotate180())])
                ].sort(function (a, b) { return a.angle() - b.angle(); }).shift(),
                [new Sector(intersection, [intersection.add(line.direction), intersection.add(this.direction)]),
                    new Sector(intersection, [intersection.add(line.direction), intersection.add(this.direction.rotate180())])
                ].sort(function (a, b) { return a.angle() - b.angle(); }).shift()
            ].map(function (sector) { return sector.subsect(count); }, this)
                .reduce(function (prev, curr) { return prev.concat(curr); }, [])
                .map(function (ray) { return new Line(ray.origin, ray.direction); }, this);
        }
    };
    return Line;
}());
var Ray = (function () {
    function Ray(a, b, c, d) {
        if (a.x !== undefined) {
            this.origin = new XY(a.x, a.y);
            this.direction = new XY(b.x, b.y);
        }
        else {
            this.origin = new XY(a, b);
            this.direction = new XY(c, d);
        }
        ;
    }
    Ray.prototype.length = function () { return Infinity; };
    Ray.prototype.vector = function () { return this.direction; };
    Ray.prototype.parallel = function (line, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        var v = (line.nodes !== undefined)
            ? new XY(line.nodes[1].x - line.nodes[0].x, line.nodes[1].y - line.nodes[0].y)
            : line.direction;
        if (v === undefined) {
            return undefined;
        }
        return epsilonEqual(this.direction.cross(v), 0, epsilon);
    };
    Ray.prototype.collinear = function (point, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        var pOrigin = new XY(point.x - this.origin.x, point.y - this.origin.y);
        var dot = pOrigin.dot(this.direction);
        if (dot < -epsilon) {
            return false;
        }
        var cross = pOrigin.cross(this.direction);
        return epsilonEqual(cross, 0, epsilon);
    };
    Ray.prototype.equivalent = function (ray, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        return (this.origin.equivalent(ray.origin, epsilon) &&
            this.direction.normalize().equivalent(ray.direction.normalize(), epsilon));
    };
    Ray.prototype.degenrate = function (epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        return epsilonEqual(this.direction.magnitude(), 0, epsilon);
    };
    Ray.prototype.intersection = function (line, epsilon) {
        if (line instanceof Ray) {
            return intersectionRayRay(this, line, epsilon);
        }
        if (line instanceof Line) {
            return intersectionLineRay(line, this, epsilon);
        }
        if (line instanceof Edge) {
            return intersectionRayEdge(this, line, epsilon);
        }
    };
    Ray.prototype.reflectionMatrix = function () { return new Matrix().reflection(this.direction, this.origin); };
    Ray.prototype.nearestPoint = function (point) {
        var answer = this.nearestPointNormalTo(point);
        if (answer !== undefined) {
            return answer;
        }
        return this.origin;
    };
    Ray.prototype.nearestPointNormalTo = function (point) {
        var v = this.direction.normalize();
        var u = ((point.x - this.origin.x) * v.x + (point.y - this.origin.y) * v.y);
        if (u < 0) {
            return undefined;
        }
        return new XY(this.origin.x + u * v.x, this.origin.y + u * v.y);
    };
    Ray.prototype.transform = function (matrix) {
        return new Ray(this.origin.transform(matrix), this.direction.transform(matrix));
    };
    Ray.prototype.flip = function () { return new Ray(this.origin, new XY(-this.direction.x, -this.direction.y)); };
    Ray.prototype.clipWithEdge = function (edge, epsilon) {
        var intersect = intersectionRayEdge(this, edge, epsilon);
        if (intersect === undefined) {
            return undefined;
        }
        return new Edge(this.origin, intersect);
    };
    Ray.prototype.clipWithEdges = function (edges, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        return edges
            .map(function (edge) { return this.clipWithEdge(edge); }, this)
            .filter(function (edge) { return edge !== undefined; })
            .map(function (edge) { return { edge: edge, length: edge.length() }; })
            .filter(function (el) { return el.length > epsilon; })
            .sort(function (a, b) { return a.length - b.length; })
            .map(function (el) { return el.edge; });
    };
    Ray.prototype.intersectionsWithEdges = function (edges, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        return edges
            .map(function (edge) { return intersectionRayEdge(this, edge, epsilon); }, this)
            .filter(function (point) { return point !== undefined; }, this)
            .map(function (point) { return { point: point, length: point.distanceTo(this.origin) }; }, this)
            .sort(function (a, b) { return a.length - b.length; })
            .map(function (el) { return el.point; }, this);
    };
    Ray.prototype.clipWithEdgesDetails = function (edges, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        return edges
            .map(function (edge) { return { 'edge': this.clipWithEdge(edge), 'intersection': edge }; }, this)
            .filter(function (el) { return el.edge !== undefined; })
            .map(function (el) {
            return {
                'edge': el.edge,
                'intersection': el.intersection,
                'length': el.edge.length()
            };
        })
            .filter(function (el) { return el.length > epsilon; })
            .sort(function (a, b) { return a.length - b.length; })
            .map(function (el) { return { edge: el.edge, intersection: el.intersection }; });
    };
    return Ray;
}());
var Edge = (function () {
    function Edge(a, b, c, d) {
        if (a.x !== undefined) {
            this.nodes = [new XY(a.x, a.y), new XY(b.x, b.y)];
        }
        else if (isValidNumber(d)) {
            this.nodes = [new XY(a, b), new XY(c, d)];
        }
        else if (a.nodes !== undefined) {
            this.nodes = [new XY(a.nodes[0].x, a.nodes[0].y), new XY(a.nodes[1].x, a.nodes[1].y)];
        }
    }
    Edge.prototype.length = function () { return Math.sqrt(Math.pow(this.nodes[0].x - this.nodes[1].x, 2) + Math.pow(this.nodes[0].y - this.nodes[1].y, 2)); };
    Edge.prototype.vector = function (originNode) {
        if (originNode === undefined) {
            return this.nodes[1].subtract(this.nodes[0]);
        }
        if (this.nodes[0].equivalent(originNode)) {
            return this.nodes[1].subtract(this.nodes[0]);
        }
        return this.nodes[0].subtract(this.nodes[1]);
    };
    Edge.prototype.parallel = function (line, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        var v = (line.nodes !== undefined)
            ? new XY(line.nodes[1].x - line.nodes[0].x, line.nodes[1].y - line.nodes[0].y)
            : line.direction;
        if (v === undefined) {
            return undefined;
        }
        var u = this.nodes[1].subtract(this.nodes[0]);
        return epsilonEqual(u.cross(v), 0, epsilon);
    };
    Edge.prototype.collinear = function (point, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        var p0 = new Edge(point, this.nodes[0]).length();
        var p1 = new Edge(point, this.nodes[1]).length();
        return epsilonEqual(this.length() - p0 - p1, 0, epsilon);
    };
    Edge.prototype.equivalent = function (e, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        return ((this.nodes[0].equivalent(e.nodes[0], epsilon) &&
            this.nodes[1].equivalent(e.nodes[1], epsilon)) ||
            (this.nodes[0].equivalent(e.nodes[1], epsilon) &&
                this.nodes[1].equivalent(e.nodes[0], epsilon)));
    };
    Edge.prototype.degenrate = function (epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        return this.nodes[0].equivalent(this.nodes[1], epsilon);
    };
    Edge.prototype.intersection = function (line, epsilon) {
        if (line instanceof Edge) {
            return intersectionEdgeEdge(this, line, epsilon);
        }
        if (line instanceof Line) {
            return intersectionLineEdge(line, this, epsilon);
        }
        if (line instanceof Ray) {
            return intersectionRayEdge(line, this, epsilon);
        }
    };
    Edge.prototype.reflectionMatrix = function () {
        return new Matrix().reflection(this.nodes[1].subtract(this.nodes[0]), this.nodes[0]);
    };
    Edge.prototype.nearestPoint = function (point) {
        var answer = this.nearestPointNormalTo(point);
        if (answer !== undefined) {
            return answer;
        }
        return this.nodes
            .map(function (el) { return { point: el, distance: el.distanceTo(point) }; }, this)
            .sort(function (a, b) { return a.distance - b.distance; })
            .shift()
            .point;
    };
    Edge.prototype.nearestPointNormalTo = function (point) {
        var p = this.nodes[0].distanceTo(this.nodes[1]);
        var u = ((point.x - this.nodes[0].x) * (this.nodes[1].x - this.nodes[0].x) + (point.y - this.nodes[0].y) * (this.nodes[1].y - this.nodes[0].y)) / (Math.pow(p, 2));
        if (u < 0 || u > 1.0) {
            return undefined;
        }
        return new XY(this.nodes[0].x + u * (this.nodes[1].x - this.nodes[0].x), this.nodes[0].y + u * (this.nodes[1].y - this.nodes[0].y));
    };
    Edge.prototype.transform = function (matrix) {
        return new Edge(this.nodes[0].transform(matrix), this.nodes[1].transform(matrix));
    };
    Edge.prototype.midpoint = function () {
        return new XY(0.5 * (this.nodes[0].x + this.nodes[1].x), 0.5 * (this.nodes[0].y + this.nodes[1].y));
    };
    Edge.prototype.perpendicularBisector = function () { return new Line(this.midpoint(), this.vector().rotate90()); };
    Edge.prototype.infiniteLine = function () { return new Line(this.nodes[0], this.nodes[1].subtract(this.nodes[0])); };
    return Edge;
}());
var Polyline = (function () {
    function Polyline() {
        this.nodes = [];
    }
    Polyline.prototype.edges = function () {
        var result = [];
        for (var i = 0; i < this.nodes.length - 1; i++) {
            result.push(new Edge(this.nodes[i], this.nodes[i + 1]));
        }
        return result;
    };
    Polyline.prototype.rayReflectRepeat = function (ray, intersectable, target) {
        var REFLECT_LIMIT = 666;
        var clips = [];
        var firstClips = ray.clipWithEdgesDetails(intersectable);
        if (firstClips.length == 0)
            return this;
        if (target !== undefined &&
            epsilonEqual(ray.direction.cross(target.subtract(ray.origin)), 0, EPSILON_HIGH)) {
            if (firstClips.length === 0 ||
                ray.origin.distanceTo(target) < firstClips[0].edge.length()) {
                this.nodes = [ray.origin, target];
                return this;
            }
        }
        clips.push(firstClips[0]);
        var i = 0;
        while (i < REFLECT_LIMIT) {
            var prevClip = clips[clips.length - 1];
            var n0 = new XY(prevClip.intersection.nodes[0].x, prevClip.intersection.nodes[0].y);
            var n1 = new XY(prevClip.intersection.nodes[1].x, prevClip.intersection.nodes[1].y);
            var reflection = new Matrix().reflection(n1.subtract(n0), n0);
            var newRay = new Ray(prevClip.edge.nodes[1], prevClip.edge.nodes[0].transform(reflection).subtract(prevClip.edge.nodes[1]));
            var newClips = newRay.clipWithEdgesDetails(intersectable);
            if (target !== undefined &&
                epsilonEqual(newRay.direction.cross(target.subtract(newRay.origin)), 0, EPSILON_HIGH)) {
                clips.push({ edge: new Edge(newRay.origin, target), intersection: undefined });
                break;
            }
            if (newClips.length === 0 || newClips[0] === undefined) {
                break;
            }
            clips.push(newClips[0]);
            i++;
        }
        this.nodes = clips.map(function (el) { return el.edge.nodes[0]; });
        this.nodes.push(clips[clips.length - 1].edge.nodes[1]);
        return this;
    };
    return Polyline;
}());
var Rect = (function () {
    function Rect(x, y, width, height) {
        this.origin = { 'x': x, 'y': y };
        this.size = { 'width': width, 'height': height };
    }
    Rect.prototype.contains = function (point, epsilon) {
        if (epsilon == undefined) {
            epsilon = 0;
        }
        return point.x > this.origin.x - epsilon &&
            point.y > this.origin.y - epsilon &&
            point.x < this.origin.x + this.size.width + epsilon &&
            point.y < this.origin.y + this.size.height + epsilon;
    };
    return Rect;
}());
var Triangle = (function () {
    function Triangle(points, circumcenter) {
        this.points = points;
        this.edges = this.points.map(function (el, i) {
            var nextEl = this.points[(i + 1) % this.points.length];
            return new Edge(el, nextEl);
        }, this);
        this.sectors = this.points.map(function (el, i) {
            var prevI = (i + this.points.length - 1) % this.points.length;
            var nextI = (i + 1) % this.points.length;
            return new Sector(el, [this.points[prevI], this.points[nextI]]);
        }, this);
        this.circumcenter = circumcenter;
        if (circumcenter === undefined) {
        }
    }
    Triangle.prototype.angles = function () {
        return this.points.map(function (p, i) {
            var prevP = this.points[(i + this.points.length - 1) % this.points.length];
            var nextP = this.points[(i + 1) % this.points.length];
            return clockwiseInteriorAngle(nextP.subtract(p), prevP.subtract(p));
        }, this);
    };
    Triangle.prototype.isAcute = function () {
        var a = this.angles();
        for (var i = 0; i < a.length; i++) {
            if (a[i] > Math.PI * 0.5) {
                return false;
            }
        }
        return true;
    };
    Triangle.prototype.isObtuse = function () {
        var a = this.angles();
        for (var i = 0; i < a.length; i++) {
            if (a[i] > Math.PI * 0.5) {
                return true;
            }
        }
        return false;
    };
    Triangle.prototype.isRight = function () {
        var a = this.angles();
        for (var i = 0; i < a.length; i++) {
            if (epsilonEqual(a[i], Math.PI * 0.5)) {
                return true;
            }
        }
        return false;
    };
    Triangle.prototype.pointInside = function (p) {
        for (var i = 0; i < this.points.length; i++) {
            var p0 = this.points[i];
            var p1 = this.points[(i + 1) % this.points.length];
            var cross = (p.y - p0.y) * (p1.x - p0.x) -
                (p.x - p0.x) * (p1.y - p0.y);
            if (cross < 0)
                return false;
        }
        return true;
    };
    return Triangle;
}());
var Circle = (function () {
    function Circle(a, b, c) {
        if (c !== undefined) {
            this.center = new XY(a, b);
            this.radius = c;
        }
        else {
            this.center = a;
            this.radius = b;
        }
    }
    Circle.prototype.intersection = function (line) {
        if (line instanceof Line) {
            return intersectionCircleLine(this.center, this.radius, line.point, line.point.add(line.direction));
        }
        if (line instanceof Edge) {
            return intersectionCircleLine(this.center, this.radius, line.nodes[0], line.nodes[1]);
        }
        if (line instanceof Ray) {
            return intersectionCircleLine(this.center, this.radius, line.origin, line.origin.add(line.direction));
        }
    };
    return Circle;
}());
var Polygon = (function () {
    function Polygon() {
        this.nodes = [];
    }
    Polygon.prototype.equivalent = function (polygon) {
        if (polygon.nodes.length != this.nodes.length) {
            return false;
        }
        var iFace = undefined;
        polygon.nodes.forEach(function (n, i) { if (n === this.nodes[0]) {
            iFace = i;
            return;
        } }, this);
        if (iFace == undefined) {
            return false;
        }
        for (var i = 0; i < this.nodes.length; i++) {
            var iFaceMod = (iFace + i) % this.nodes.length;
            if (this.nodes[i] !== polygon.nodes[iFaceMod]) {
                return false;
            }
        }
        return true;
    };
    Polygon.prototype.contains = function (point) {
        var isInside = false;
        for (var i = 0, j = this.nodes.length - 1; i < this.nodes.length; j = i++) {
            if ((this.nodes[i].y > point.y) != (this.nodes[j].y > point.y) &&
                point.x < (this.nodes[j].x - this.nodes[i].x) * (point.y - this.nodes[i].y) / (this.nodes[j].y - this.nodes[i].y) + this.nodes[i].x) {
                isInside = !isInside;
            }
        }
        return isInside;
    };
    Polygon.prototype.signedArea = function () {
        return 0.5 * this.nodes.map(function (el, i) {
            var nextEl = this.nodes[(i + 1) % this.nodes.length];
            return el.x * nextEl.y - nextEl.x * el.y;
        }, this)
            .reduce(function (prev, cur) { return prev + cur; }, 0);
    };
    Polygon.prototype.centroid = function () {
        return this.nodes.map(function (el, i) {
            var nextEl = this.nodes[(i + 1) % this.nodes.length];
            var mag = el.x * nextEl.y - nextEl.x * el.y;
            return new XY((el.x + nextEl.x) * mag, (el.y + nextEl.y) * mag);
        }, this)
            .reduce(function (prev, current) { return prev.add(current); }, new XY(0, 0))
            .scale(1 / (6 * this.signedArea()));
    };
    Polygon.prototype.center = function () {
        var xMin = Infinity, xMax = 0, yMin = Infinity, yMax = 0;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].x > xMax) {
                xMax = this.nodes[i].x;
            }
            if (this.nodes[i].x < xMin) {
                xMin = this.nodes[i].x;
            }
            if (this.nodes[i].y > yMax) {
                yMax = this.nodes[i].y;
            }
            if (this.nodes[i].y < yMin) {
                yMin = this.nodes[i].y;
            }
        }
        return new XY(xMin + (xMax - xMin) * 0.5, yMin + (yMax - yMin) * 0.5);
    };
    Polygon.prototype.transform = function (matrix) { this.nodes.forEach(function (node) { node.transform(matrix); }, this); };
    return Polygon;
}());
var ConvexPolygon = (function () {
    function ConvexPolygon() {
        this.edges = [];
    }
    ConvexPolygon.prototype.nodes = function () {
        return this.edges.map(function (el, i) {
            var nextEl = this.edges[(i + 1) % this.edges.length];
            if (el.nodes[0].equivalent(nextEl.nodes[0]) || el.nodes[0].equivalent(nextEl.nodes[1])) {
                return el.nodes[1];
            }
            return el.nodes[0];
        }, this);
    };
    ConvexPolygon.prototype.signedArea = function (nodes) {
        if (nodes === undefined) {
            nodes = this.nodes();
        }
        return 0.5 * nodes.map(function (el, i) {
            var nextEl = nodes[(i + 1) % nodes.length];
            return el.x * nextEl.y - nextEl.x * el.y;
        }, this)
            .reduce(function (prev, cur) {
            return prev + cur;
        }, 0);
    };
    ConvexPolygon.prototype.centroid = function () {
        var nodes = this.nodes();
        return nodes.map(function (el, i) {
            var nextEl = nodes[(i + 1) % nodes.length];
            var mag = el.x * nextEl.y - nextEl.x * el.y;
            return new XY((el.x + nextEl.x) * mag, (el.y + nextEl.y) * mag);
        }, this)
            .reduce(function (prev, current) {
            return prev.add(current);
        }, new XY(0, 0))
            .scale(1 / (6 * this.signedArea(nodes)));
    };
    ConvexPolygon.prototype.center = function () {
        var xMin = Infinity, xMax = 0, yMin = Infinity, yMax = 0;
        var nodes = this.edges.map(function (el) { return el.nodes[0]; });
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].x > xMax) {
                xMax = nodes[i].x;
            }
            if (nodes[i].x < xMin) {
                xMin = nodes[i].x;
            }
            if (nodes[i].y > yMax) {
                yMax = nodes[i].y;
            }
            if (nodes[i].y < yMin) {
                yMin = nodes[i].y;
            }
        }
        return new XY(xMin + (xMax - xMin) * 0.5, yMin + (yMax - yMin) * 0.5);
    };
    ConvexPolygon.prototype.contains = function (p) {
        var found = true;
        for (var i = 0; i < this.edges.length; i++) {
            var a = this.edges[i].nodes[1].subtract(this.edges[i].nodes[0]);
            var b = new XY(p.x - this.edges[i].nodes[0].x, p.y - this.edges[i].nodes[0].y);
            if (a.cross(b) < 0) {
                return false;
            }
        }
        return true;
    };
    ConvexPolygon.prototype.liesOnEdge = function (p) {
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].collinear(p)) {
                return true;
            }
        }
        return false;
    };
    ConvexPolygon.prototype.clipEdge = function (edge) {
        var intersections = this.edges
            .map(function (el) { return intersectionEdgeEdge(edge, el); })
            .filter(function (el) { return el !== undefined; })
            .filter(function (el) {
            return !el.equivalent(edge.nodes[0]) &&
                !el.equivalent(edge.nodes[1]);
        });
        switch (intersections.length) {
            case 0:
                if (this.contains(edge.nodes[0])) {
                    return edge;
                }
                return undefined;
            case 1:
                if (this.contains(edge.nodes[0])) {
                    return new Edge(edge.nodes[0], intersections[0]);
                }
                return new Edge(edge.nodes[1], intersections[0]);
            default:
                for (var i = 1; i < intersections.length; i++) {
                    if (!intersections[0].equivalent(intersections[i])) {
                        return new Edge(intersections[0], intersections[i]);
                    }
                }
        }
    };
    ConvexPolygon.prototype.clipLine = function (line) {
        var intersections = this.edges
            .map(function (el) { return intersectionLineEdge(line, el); })
            .filter(function (el) { return el !== undefined; });
        switch (intersections.length) {
            case 0: return undefined;
            case 1: return new Edge(intersections[0], intersections[0]);
            default:
                for (var i = 1; i < intersections.length; i++) {
                    if (!intersections[0].equivalent(intersections[i])) {
                        return new Edge(intersections[0], intersections[i]);
                    }
                }
        }
    };
    ConvexPolygon.prototype.clipRay = function (ray) {
        var intersections = this.edges
            .map(function (el) { return intersectionRayEdge(ray, el); })
            .filter(function (el) { return el !== undefined; });
        switch (intersections.length) {
            case 0: return undefined;
            case 1: return new Edge(ray.origin, intersections[0]);
            default:
                for (var i = 1; i < intersections.length; i++) {
                    if (!intersections[0].equivalent(intersections[i])) {
                        return new Edge(intersections[0], intersections[i]);
                    }
                }
        }
    };
    ConvexPolygon.prototype.setEdgesFromPoints = function (points) {
        this.edges = points.map(function (el, i) {
            var nextEl = points[(i + 1) % points.length];
            return new Edge(el, nextEl);
        }, this);
        return this;
    };
    ConvexPolygon.prototype.regularPolygon = function (sides) {
        var halfwedge = 2 * Math.PI / sides * 0.5;
        var radius = Math.cos(halfwedge);
        var points = [];
        for (var i = 0; i < sides; i++) {
            var a = -2 * Math.PI * i / sides + halfwedge;
            var x = cleanNumber(radius * Math.sin(a), 14);
            var y = cleanNumber(radius * Math.cos(a), 14);
            points.push(new XY(x, y));
        }
        this.setEdgesFromPoints(points);
        return this;
    };
    ConvexPolygon.prototype.convexHull = function (points) {
        if (points === undefined || points.length === 0) {
            this.edges = [];
            return undefined;
        }
        var INFINITE_LOOP = 10000;
        var sorted = points.slice().sort(function (a, b) {
            if (epsilonEqual(a.y, b.y, EPSILON_HIGH)) {
                return a.x - b.x;
            }
            return a.y - b.y;
        });
        var hull = [];
        hull.push(sorted[0]);
        var ang = 0;
        var infiniteLoop = 0;
        do {
            infiniteLoop++;
            var h = hull.length - 1;
            var angles = sorted
                .filter(function (el) {
                return !(epsilonEqual(el.x, hull[h].x, EPSILON_HIGH) && epsilonEqual(el.y, hull[h].y, EPSILON_HIGH));
            })
                .map(function (el) {
                var angle = Math.atan2(hull[h].y - el.y, hull[h].x - el.x);
                while (angle < ang) {
                    angle += Math.PI * 2;
                }
                return { node: el, angle: angle, distance: undefined };
            })
                .sort(function (a, b) { return (a.angle < b.angle) ? -1 : (a.angle > b.angle) ? 1 : 0; });
            if (angles.length === 0) {
                this.edges = [];
                return undefined;
            }
            var rightTurn = angles[0];
            angles = angles.filter(function (el) { return epsilonEqual(rightTurn.angle, el.angle, EPSILON_LOW); })
                .map(function (el) {
                var distance = Math.sqrt(Math.pow(hull[h].x - el.node.x, 2) + Math.pow(hull[h].y - el.node.y, 2));
                el.distance = distance;
                return el;
            })
                .sort(function (a, b) { return (a.distance < b.distance) ? 1 : (a.distance > b.distance) ? -1 : 0; });
            if (hull.filter(function (el) { return el === angles[0].node; }).length > 0) {
                return this.setEdgesFromPoints(hull);
            }
            hull.push(angles[0].node);
            ang = Math.atan2(hull[h].y - angles[0].node.y, hull[h].x - angles[0].node.x);
        } while (infiniteLoop < INFINITE_LOOP);
        this.edges = [];
        return undefined;
    };
    ConvexPolygon.prototype.minimumRect = function () {
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.nodes().forEach(function (el) {
            if (el.x > maxX) {
                maxX = el.x;
            }
            if (el.x < minX) {
                minX = el.x;
            }
            if (el.y > maxY) {
                maxY = el.y;
            }
            if (el.y < minY) {
                minY = el.y;
            }
        });
        return new Rect(minX, minY, maxX - minX, maxY - minY);
    };
    ConvexPolygon.prototype.copy = function () {
        var p = new ConvexPolygon();
        p.edges = this.edges.map(function (e) {
            return new Edge(e.nodes[0].x, e.nodes[0].y, e.nodes[1].x, e.nodes[1].y);
        });
        return p;
    };
    return ConvexPolygon;
}());
var Sector = (function () {
    function Sector(origin, endpoints) {
        this.origin = origin;
        this.endPoints = endpoints;
    }
    Sector.prototype.vectors = function () {
        return this.endPoints.map(function (el) {
            return new XY(el.x - this.origin.x, el.y - this.origin.y);
        }, this);
    };
    Sector.prototype.angle = function () {
        var vectors = this.vectors();
        return counterClockwiseInteriorAngle(vectors[0], vectors[1]);
    };
    Sector.prototype.bisect = function () {
        var vectors = this.vectors();
        var angles = vectors.map(function (el) { return Math.atan2(el.y, el.x); });
        while (angles[0] < 0) {
            angles[0] += Math.PI * 2;
        }
        while (angles[1] < 0) {
            angles[1] += Math.PI * 2;
        }
        var interior = counterClockwiseInteriorAngleRadians(angles[0], angles[1]);
        var bisected = angles[0] + interior * 0.5;
        return new Ray(new XY(this.origin.x, this.origin.y), new XY(Math.cos(bisected), Math.sin(bisected)));
    };
    Sector.prototype.subsect = function (divisions) {
        if (divisions == undefined || divisions < 2) {
            throw "subset() requires number parameter > 1";
        }
        var angles = this.vectors().map(function (el) { return Math.atan2(el.y, el.x); });
        while (angles[0] < 0) {
            angles[0] += Math.PI * 2;
        }
        while (angles[1] < 0) {
            angles[1] += Math.PI * 2;
        }
        var interior = counterClockwiseInteriorAngleRadians(angles[0], angles[1]);
        var rays = [];
        for (var i = 1; i < divisions; i++) {
            var angle = angles[0] + interior * (i / divisions);
            rays.push(new Ray(new XY(this.origin.x, this.origin.y), new XY(Math.cos(angle), Math.sin(angle))));
        }
        return rays;
    };
    Sector.prototype.equivalent = function (a) {
        return a.origin.equivalent(this.origin) &&
            a.endPoints[0].equivalent(this.endPoints[0]) &&
            a.endPoints[1].equivalent(this.endPoints[1]);
    };
    Sector.prototype.contains = function (point) {
        var cross0 = (point.y - this.endPoints[0].y) * (this.origin.x - this.endPoints[0].x) -
            (point.x - this.endPoints[0].x) * (this.origin.y - this.endPoints[0].y);
        var cross1 = (point.y - this.origin.y) * (this.endPoints[1].x - this.origin.x) -
            (point.x - this.origin.x) * (this.endPoints[1].y - this.origin.y);
        return cross0 < 0 && cross1 < 0;
    };
    Sector.prototype.sortByClockwise = function () { };
    return Sector;
}());
var IsoscelesTriangle = (function (_super) {
    __extends(IsoscelesTriangle, _super);
    function IsoscelesTriangle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return IsoscelesTriangle;
}(Triangle));
var VoronoiMolecule = (function (_super) {
    __extends(VoronoiMolecule, _super);
    function VoronoiMolecule(points, circumcenter, edgeNormal) {
        var _this = _super.call(this, points, circumcenter) || this;
        _this.isEdge = false;
        _this.isCorner = false;
        _this.overlaped = [];
        _this.hull = new ConvexPolygon().convexHull([points[0], points[1], points[2], circumcenter].filter(function (el) { return el !== undefined; }));
        _this.units = _this.points.map(function (el, i) {
            var nextEl = this.points[(i + 1) % this.points.length];
            return new VoronoiMoleculeTriangle(circumcenter, [el, nextEl]);
        }, _this);
        var pointsLength = _this.points.length;
        switch (pointsLength) {
            case 1:
                _this.isCorner = true;
                _this.addCornerMolecules();
                break;
            case 2:
                _this.isEdge = true;
                _this.units = _this.units.filter(function (el) {
                    var cross = (el.vertex.y - el.base[0].y) * (el.base[1].x - el.base[0].x) -
                        (el.vertex.x - el.base[0].x) * (el.base[1].y - el.base[0].y);
                    if (cross < 0) {
                        return false;
                    }
                    return true;
                }, _this);
                _this.addEdgeMolecules(edgeNormal);
                break;
        }
        var eclipsed = undefined;
        _this.units = _this.units.filter(function (el) {
            var cross = (el.vertex.y - el.base[0].y) * (el.base[1].x - el.base[0].x) -
                (el.vertex.x - el.base[0].x) * (el.base[1].y - el.base[0].y);
            if (cross < 0) {
                eclipsed = el;
                return false;
            }
            return true;
        }, _this);
        if (eclipsed !== undefined) {
            var angle = clockwiseInteriorAngle(eclipsed.vertex.subtract(eclipsed.base[1]), eclipsed.base[0].subtract(eclipsed.base[1]));
            _this.units.forEach(function (el) { el.crimpAngle -= angle; });
        }
        return _this;
    }
    VoronoiMolecule.prototype.addEdgeMolecules = function (normal) {
        this.edgeNormal = normal.normalize().abs();
        if (this.units.length < 1) {
            return;
        }
        var base = this.units[0].base;
        var reflected = base.map(function (b) {
            var diff = this.circumcenter.subtract(b);
            var change = diff.multiply(this.edgeNormal).scale(2);
            return b.add(change);
        }, this);
        this.units = this.units.concat([new VoronoiMoleculeTriangle(this.circumcenter, [base[1], reflected[1]]),
            new VoronoiMoleculeTriangle(this.circumcenter, [reflected[0], base[0]])]);
    };
    VoronoiMolecule.prototype.addCornerMolecules = function () { };
    VoronoiMolecule.prototype.generateCreases = function () {
        var edges = [];
        var outerEdges = this.units.map(function (el, i) {
            var nextEl = this.units[(i + 1) % this.units.length];
            if (el.base[1].equivalent(nextEl.base[0])) {
                edges.push(new Edge(el.base[1], el.vertex));
            }
        }, this);
        var creases = this.units.map(function (el) { return el.generateCrimpCreaseLines(); });
        creases.forEach(function (el) { edges = edges.concat(el); }, this);
        if (this.isObtuse()) {
            this.units.forEach(function (el, i) {
                var nextEl = this.units[(i + 1) % this.units.length];
                if (el.base[0].equivalent(el.base[1])) {
                    edges.push(new Edge(el.base[0], el.vertex));
                }
            }, this);
        }
        return edges;
    };
    return VoronoiMolecule;
}(Triangle));
var VoronoiMoleculeTriangle = (function () {
    function VoronoiMoleculeTriangle(vertex, base, crimpAngle) {
        this.vertex = vertex;
        this.base = base;
        this.crimpAngle = crimpAngle;
        this.overlapped = [];
        if (this.crimpAngle === undefined) {
            var vec1 = base[1].subtract(base[0]);
            var vec2 = vertex.subtract(base[0]);
            var a1 = clockwiseInteriorAngle(vec1, vec2);
            var a2 = clockwiseInteriorAngle(vec2, vec1);
            this.crimpAngle = (a1 < a2) ? a1 : a2;
        }
    }
    VoronoiMoleculeTriangle.prototype.crimpLocations = function () {
        var baseAngle = Math.atan2(this.base[1].y - this.base[0].y, this.base[1].x - this.base[0].x);
        var crimpVector = new XY(Math.cos(baseAngle + this.crimpAngle), Math.sin(baseAngle + this.crimpAngle));
        var bisectVector = new XY(Math.cos(baseAngle + this.crimpAngle * 0.5), Math.sin(baseAngle + this.crimpAngle * 0.5));
        var symmetryLine = new Edge(this.vertex, this.base[0].midpoint(this.base[1]));
        var crimpPos = intersectionRayEdge(new Ray(this.base[0], crimpVector), symmetryLine);
        var bisectPos = intersectionRayEdge(new Ray(this.base[0], bisectVector), symmetryLine);
        return [crimpPos, bisectPos];
    };
    VoronoiMoleculeTriangle.prototype.generateCrimpCreaseLines = function () {
        var crimps = this.crimpLocations();
        var symmetryLine = new Edge(this.vertex, this.base[0].midpoint(this.base[1]));
        if (this.overlapped.length > 0) {
            symmetryLine.nodes[1] = this.overlapped[0].circumcenter;
        }
        var overlappingEdges = [symmetryLine]
            .concat(this.overlapped
            .map(function (el) { return el.generateCreases(); })
            .reduce(function (prev, curr) { return prev.concat(curr); }, []));
        var edges = [symmetryLine]
            .concat(new Polyline().rayReflectRepeat(new Ray(this.base[0], this.base[1].subtract(this.base[0])), overlappingEdges, this.base[1]).edges());
        crimps.filter(function (el) {
            return el !== undefined && !el.equivalent(this.vertex);
        }, this)
            .forEach(function (crimp) {
            edges = edges.concat(new Polyline().rayReflectRepeat(new Ray(this.base[0], crimp.subtract(this.base[0])), overlappingEdges, this.base[1]).edges());
        }, this);
        return edges;
    };
    VoronoiMoleculeTriangle.prototype.pointInside = function (p) {
        var points = [this.vertex, this.base[0], this.base[1]];
        for (var i = 0; i < points.length; i++) {
            var p0 = points[i];
            var p1 = points[(i + 1) % points.length];
            var cross = (p.y - p0.y) * (p1.x - p0.x) -
                (p.x - p0.x) * (p1.y - p0.y);
            if (cross < 0)
                return false;
        }
        return true;
    };
    return VoronoiMoleculeTriangle;
}());
var VoronoiEdge = (function () {
    function VoronoiEdge() {
        this.cache = {};
    }
    return VoronoiEdge;
}());
var VoronoiCell = (function () {
    function VoronoiCell() {
        this.points = [];
        this.edges = [];
    }
    return VoronoiCell;
}());
var VoronoiJunction = (function () {
    function VoronoiJunction() {
        this.edges = [];
        this.cells = [];
        this.isEdge = false;
        this.isCorner = false;
    }
    return VoronoiJunction;
}());
var VoronoiGraph = (function () {
    function VoronoiGraph(v, epsilon) {
        var containsXY = function (a, object) {
            return (a.filter(function (e) {
                return e.equivalent(object, epsilon);
            }).length > 0);
        };
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        var allPoints = v.edges
            .map(function (e) { return [new XY(e[0][0], e[0][1]), new XY(e[1][0], e[1][1])]; })
            .reduce(function (prev, curr) { return prev.concat(curr); }, []);
        var hull = new ConvexPolygon().convexHull(allPoints);
        this.edges = [];
        this.junctions = [];
        this.cells = [];
        this.edges = v.edges.map(function (el) {
            var edge = new VoronoiEdge();
            edge.endPoints = [new XY(el[0][0], el[0][1]), new XY(el[1][0], el[1][1])];
            edge.cache = { 'left': el.left, 'right': el.right };
            return edge;
        });
        this.cells = v.cells.map(function (c) {
            var cell = new VoronoiCell();
            cell.site = new XY(c.site[0], c.site[1]);
            cell.edges = c.halfedges.map(function (hf) { return this.edges[hf]; }, this);
            cell.points = cell.edges.map(function (el, i) {
                var a = el.endPoints[0];
                var b = el.endPoints[1];
                var nextA = cell.edges[(i + 1) % cell.edges.length].endPoints[0];
                var nextB = cell.edges[(i + 1) % cell.edges.length].endPoints[1];
                if (a.equivalent(nextA, epsilon) || a.equivalent(nextB, epsilon)) {
                    return b;
                }
                return a;
            }, this);
            return cell;
        }, this);
        this.edges.forEach(function (el) {
            var thisCells = [undefined, undefined];
            if (el.cache['left'] !== undefined) {
                var leftSite = new XY(el.cache['left'][0], el.cache['left'][1]);
                for (var i = 0; i < this.cells.length; i++) {
                    if (leftSite.equivalent(this.cells[i].site, epsilon)) {
                        thisCells[0] = this.cells[i];
                        break;
                    }
                }
            }
            if (el.cache['right'] !== undefined) {
                var rightSite = new XY(el.cache['right'][0], el.cache['right'][1]);
                for (var i = 0; i < this.cells.length; i++) {
                    if (rightSite.equivalent(this.cells[i].site, epsilon)) {
                        thisCells[1] = this.cells[i];
                        break;
                    }
                }
            }
            el.cells = thisCells;
            el.isBoundary = false;
            if (el.cells[0] === undefined || el.cells[1] === undefined) {
                el.isBoundary = true;
            }
            el.cache = {};
        }, this);
        var nodes = [];
        this.edges.forEach(function (el) {
            if (!containsXY(nodes, el.endPoints[0])) {
                nodes.push(el.endPoints[0]);
            }
            if (!containsXY(nodes, el.endPoints[1])) {
                nodes.push(el.endPoints[1]);
            }
        }, this);
        this.junctions = nodes.map(function (el) {
            var junction = new VoronoiJunction();
            junction.position = el;
            junction.cells = this.cells.filter(function (cell) {
                return containsXY(cell.points, el);
            }, this).sort(function (a, b) {
                var vecA = a.site.subtract(el);
                var vecB = b.site.subtract(el);
                return Math.atan2(vecA.y, vecA.x) - Math.atan2(vecB.y, vecB.x);
            });
            switch (junction.cells.length) {
                case 1:
                    junction.isCorner = true;
                    break;
                case 2:
                    junction.isEdge = true;
                    hull.edges.forEach(function (edge) {
                        if (edge.collinear(junction.position)) {
                            junction.edgeNormal = edge.nodes[1].subtract(edge.nodes[0]).rotate90();
                        }
                    });
                    break;
            }
            junction.edges = this.edges.filter(function (edge) {
                return containsXY(edge.endPoints, el);
            }, this).sort(function (a, b) {
                var otherA = a.endPoints[0];
                if (otherA.equivalent(el)) {
                    otherA = a.endPoints[1];
                }
                var otherB = b.endPoints[0];
                if (otherB.equivalent(el)) {
                    otherB = b.endPoints[1];
                }
                var vecA = otherA.subtract(el);
                var vecB = otherB.subtract(el);
                return Math.atan2(vecA.y, vecA.x) - Math.atan2(vecB.y, vecB.x);
            });
            return junction;
        }, this);
        return this;
    }
    VoronoiGraph.prototype.edgeExists = function (points, epsilon) {
        if (epsilon === undefined) {
            epsilon = EPSILON_HIGH;
        }
        this.edges.forEach(function (el) {
            if (el.endPoints[0].equivalent(points[0], epsilon) &&
                el.endPoints[1].equivalent(points[1], epsilon)) {
                return el;
            }
            if (el.endPoints[1].equivalent(points[0], epsilon) &&
                el.endPoints[0].equivalent(points[1], epsilon)) {
                return el;
            }
        });
        return undefined;
    };
    VoronoiGraph.prototype.generateMolecules = function (interp) {
        return this.junctions.map(function (j) {
            var endPoints = j.cells.map(function (cell) {
                return cell.site.lerp(j.position, interp);
            }, this);
            var molecule = new VoronoiMolecule(endPoints, j.position, j.isEdge ? j.edgeNormal : undefined);
            return molecule;
        }, this);
    };
    VoronoiGraph.prototype.generateSortedMolecules = function (interp) {
        var molecules = this.generateMolecules(interp);
        for (var i = 0; i < molecules.length; i++) {
            for (var j = 0; j < molecules.length; j++) {
                if (i !== j) {
                    molecules[j].units.forEach(function (unit) {
                        if (unit.pointInside(molecules[i].circumcenter)) {
                            unit.overlapped.push(molecules[i]);
                            molecules[j].overlaped.push(molecules[i]);
                        }
                    });
                }
            }
        }
        for (var i = 0; i < molecules.length; i++) {
            molecules[i].units.forEach(function (unit) {
                unit.overlapped.sort(function (a, b) {
                    return a.circumcenter.distanceTo(unit.vertex) - b.circumcenter.distanceTo(unit.vertex);
                });
            });
            molecules[i].overlaped.sort(function (a, b) {
                return a.circumcenter.distanceTo(molecules[i].circumcenter) - b.circumcenter.distanceTo(molecules[i].circumcenter);
            });
        }
        var array = [];
        var mutableMolecules = molecules.slice();
        var rowIndex = 0;
        while (mutableMolecules.length > 0) {
            array.push([]);
            for (var i = mutableMolecules.length - 1; i >= 0; i--) {
                if (mutableMolecules[i].overlaped.length <= rowIndex) {
                    array[rowIndex].push(mutableMolecules[i]);
                    mutableMolecules.splice(i, 1);
                }
            }
            rowIndex++;
        }
        return array;
    };
    return VoronoiGraph;
}());
function creaseVoronoi(cp, v, interp) {
    if (interp === undefined) {
        interp = 0.5;
    }
    var edges = v.edges.filter(function (el) { return !el.isBoundary; });
    var cells = v.cells.map(function (cell) {
        return cell.edges.map(function (edge) {
            return edge.endPoints.map(function (el) {
                return cell.site.lerp(el, interp);
            });
        }, this);
    }, this);
    var sortedMolecules = v.generateSortedMolecules(interp);
    sortedMolecules.forEach(function (arr) {
        arr.forEach(function (m) {
            var edges = m.generateCreases();
            edges.forEach(function (el) {
                cp.crease(el.nodes[0], el.nodes[1]);
            }, this);
        }, this);
    }, this);
    edges.forEach(function (edge) {
        var c = cp.crease(edge.endPoints[0], edge.endPoints[1]);
        if (c !== undefined) {
            c.valley();
        }
    }, this);
    cells.forEach(function (cell) {
        cell.forEach(function (edge) {
            cp.crease(edge[0], edge[1]).mountain();
        }, this);
    }, this);
    return sortedMolecules.reduce(function (prev, current) { return prev.concat(current); });
}
var GraphClean = (function () {
    function GraphClean(numNodes, numEdges) {
        this.nodes = { total: 0, isolated: 0 };
        this.edges = { total: 0, duplicate: 0, circular: 0 };
        if (numNodes != undefined) {
            this.nodes.total = numNodes;
        }
        if (numEdges != undefined) {
            this.edges.total = numEdges;
        }
    }
    GraphClean.prototype.join = function (report) {
        this.nodes.total += report.nodes.total;
        this.edges.total += report.edges.total;
        this.nodes.isolated += report.nodes.isolated;
        this.edges.duplicate += report.edges.duplicate;
        this.edges.circular += report.edges.circular;
        return this;
    };
    GraphClean.prototype.isolatedNodes = function (num) { this.nodes.isolated = num; this.nodes.total += num; return this; };
    GraphClean.prototype.duplicateEdges = function (num) { this.edges.duplicate = num; this.edges.total += num; return this; };
    GraphClean.prototype.circularEdges = function (num) { this.edges.circular = num; this.edges.total += num; return this; };
    return GraphClean;
}());
var GraphNode = (function () {
    function GraphNode(graph) {
        this.cache = {};
        this.graph = graph;
    }
    GraphNode.prototype.adjacentEdges = function () {
        return this.graph.edges.filter(function (el) {
            return el.nodes[0] === this || el.nodes[1] === this;
        }, this);
    };
    GraphNode.prototype.adjacentNodes = function () {
        var checked = [];
        return this.adjacentEdges()
            .filter(function (el) { return !el.isCircular(); })
            .map(function (el) {
            if (el.nodes[0] === this) {
                return el.nodes[1];
            }
            return el.nodes[0];
        }, this)
            .filter(function (el) {
            return checked.indexOf(el) >= 0 ? false : checked.push(el);
        }, this);
    };
    GraphNode.prototype.isAdjacentToNode = function (node) {
        return (this.graph.getEdgeConnectingNodes(this, node) !== undefined);
    };
    GraphNode.prototype.degree = function () {
        return this.graph.edges.map(function (el) {
            var sum = 0;
            if (el.nodes[0] === this) {
                sum += 1;
            }
            if (el.nodes[1] === this) {
                sum += 1;
            }
            return sum;
        }, this).reduce(function (a, b) { return a + b; });
    };
    return GraphNode;
}());
var GraphEdge = (function () {
    function GraphEdge(graph, node1, node2) {
        this.graph = graph;
        this.nodes = [node1, node2];
    }
    GraphEdge.prototype.adjacentEdges = function () {
        return this.graph.edges
            .filter(function (el) {
            return el !== this &&
                (el.nodes[0] === this.nodes[0] ||
                    el.nodes[0] === this.nodes[1] ||
                    el.nodes[1] === this.nodes[0] ||
                    el.nodes[1] === this.nodes[1]);
        }, this);
    };
    GraphEdge.prototype.adjacentNodes = function () {
        return [this.nodes[0], this.nodes[1]];
    };
    GraphEdge.prototype.isAdjacentToEdge = function (edge) {
        return ((this.nodes[0] === edge.nodes[0]) || (this.nodes[1] === edge.nodes[1]) ||
            (this.nodes[0] === edge.nodes[1]) || (this.nodes[1] === edge.nodes[0]));
    };
    GraphEdge.prototype.isSimilarToEdge = function (edge) {
        return ((this.nodes[0] === edge.nodes[0] && this.nodes[1] === edge.nodes[1]) ||
            (this.nodes[0] === edge.nodes[1] && this.nodes[1] === edge.nodes[0]));
    };
    GraphEdge.prototype.otherNode = function (node) {
        if (this.nodes[0] === node) {
            return this.nodes[1];
        }
        if (this.nodes[1] === node) {
            return this.nodes[0];
        }
        return undefined;
    };
    GraphEdge.prototype.isCircular = function () { return this.nodes[0] === this.nodes[1]; };
    GraphEdge.prototype.duplicateEdges = function () {
        return this.graph.edges.filter(function (el) {
            return this.isSimilarToEdge(el);
        }, this);
    };
    GraphEdge.prototype.commonNodeWithEdge = function (otherEdge) {
        if (this === otherEdge)
            return undefined;
        if (this.nodes[0] === otherEdge.nodes[0] || this.nodes[0] === otherEdge.nodes[1])
            return this.nodes[0];
        if (this.nodes[1] === otherEdge.nodes[0] || this.nodes[1] === otherEdge.nodes[1])
            return this.nodes[1];
        return undefined;
    };
    GraphEdge.prototype.uncommonNodeWithEdge = function (otherEdge) {
        if (this === otherEdge)
            return undefined;
        if (this.nodes[0] === otherEdge.nodes[0] || this.nodes[0] === otherEdge.nodes[1])
            return this.nodes[1];
        if (this.nodes[1] === otherEdge.nodes[0] || this.nodes[1] === otherEdge.nodes[1])
            return this.nodes[0];
        return undefined;
    };
    return GraphEdge;
}());
var Graph = (function () {
    function Graph() {
        this.nodeType = GraphNode;
        this.edgeType = GraphEdge;
        this.nodes = [];
        this.edges = [];
    }
    Graph.prototype.newNode = function () {
        return this.addNode(new this.nodeType(this));
    };
    Graph.prototype.newEdge = function (node1, node2) {
        return this.addEdge(new this.edgeType(this, node1, node2));
    };
    Graph.prototype.addNode = function (node) {
        if (node == undefined) {
            throw "addNode() requires an argument: 1 GraphNode";
        }
        node.graph = this;
        node.index = this.nodes.length;
        this.nodes.push(node);
        return node;
    };
    Graph.prototype.addEdge = function (edge) {
        if (edge.nodes[0] === undefined ||
            edge.nodes[1] === undefined ||
            edge.nodes[0].graph !== this ||
            edge.nodes[1].graph !== this) {
            return undefined;
        }
        edge.graph = this;
        edge.index = this.edges.length;
        this.edges.push(edge);
        return edge;
    };
    Graph.prototype.addNodes = function (nodes) {
        if (nodes === undefined || nodes.length <= 0) {
            throw "addNodes() must contain array of GraphNodes";
        }
        var len = this.nodes.length;
        var checkedNodes = nodes.filter(function (el) { return (el instanceof GraphNode); });
        this.nodes = this.nodes.concat(checkedNodes);
        for (var i = len; i < this.nodes.length; i++) {
            this.nodes[i].graph = this;
            this.nodes[i].index = i;
        }
        return this.nodes.length - len;
    };
    Graph.prototype.addEdges = function (edges) {
        if (edges == undefined || edges.length <= 0) {
            throw "addEdges() must contain array of GraphEdges";
        }
        var len = this.edges.length;
        var checkedEdges = edges.filter(function (el) { return (el instanceof GraphEdge); });
        this.edges = this.edges.concat(checkedEdges);
        for (var i = len; i < this.edges.length; i++) {
            this.edges[i].graph = this;
        }
        this.cleanGraph();
        return this.edges.length - len;
    };
    Graph.prototype.copyNode = function (node) {
        return Object.assign(this.newNode(), node);
    };
    Graph.prototype.copyEdge = function (edge) {
        return Object.assign(this.newEdge(edge.nodes[0], edge.nodes[1]), edge);
    };
    Graph.prototype.clear = function () {
        this.nodes = [];
        this.edges = [];
        return this;
    };
    Graph.prototype.removeEdge = function (edge) {
        var edgesLength = this.edges.length;
        this.edges = this.edges.filter(function (el) { return el !== edge; });
        this.edgeArrayDidChange();
        return new GraphClean(undefined, edgesLength - this.edges.length);
    };
    Graph.prototype.removeEdgeBetween = function (node1, node2) {
        var edgesLength = this.edges.length;
        this.edges = this.edges.filter(function (el) {
            return !((el.nodes[0] === node1 && el.nodes[1] === node2) ||
                (el.nodes[0] === node2 && el.nodes[1] === node1));
        });
        this.edgeArrayDidChange();
        return new GraphClean(undefined, edgesLength - this.edges.length);
    };
    Graph.prototype.removeNode = function (node) {
        var nodesLength = this.nodes.length;
        var edgesLength = this.edges.length;
        this.nodes = this.nodes.filter(function (el) { return el !== node; });
        this.edges = this.edges.filter(function (el) { return el.nodes[0] !== node && el.nodes[1] !== node; });
        if (this.edges.length != edgesLength) {
            this.edgeArrayDidChange();
        }
        if (this.nodes.length != nodesLength) {
            this.nodeArrayDidChange();
        }
        return new GraphClean(nodesLength - this.nodes.length, edgesLength - this.edges.length);
    };
    Graph.prototype.mergeNodes = function (node1, node2) {
        if (node1 === node2) {
            return undefined;
        }
        this.edges.forEach(function (edge) {
            if (edge.nodes[0] === node2) {
                edge.nodes[0] = node1;
            }
            if (edge.nodes[1] === node2) {
                edge.nodes[1] = node1;
            }
        }, this);
        var nodesLength = this.nodes.length;
        this.nodes = this.nodes.filter(function (el) { return el !== node2; });
        return new GraphClean(nodesLength - this.nodes.length).join(this.cleanGraph());
    };
    Graph.prototype.removeNodeIfIsolated = function (node) {
        if (this.edges.filter(function (edge) { return edge.nodes[0] === node || edge.nodes[1] === node; }, this).length === 0) {
            return new GraphClean();
        }
        ;
        this.nodes = this.nodes.filter(function (el) { return el !== node; });
        this.nodeArrayDidChange();
        return new GraphClean(1, 0);
    };
    Graph.prototype.removeIsolatedNodes = function () {
        this.nodeArrayDidChange();
        var nodeDegree = [];
        for (var i = 0; i < this.nodes.length; i++) {
            nodeDegree[i] = false;
        }
        for (var i = 0; i < this.edges.length; i++) {
            nodeDegree[this.edges[i].nodes[0].index] = true;
            nodeDegree[this.edges[i].nodes[1].index] = true;
        }
        var nodeLength = this.nodes.length;
        this.nodes = this.nodes.filter(function (el, i) { return nodeDegree[i]; });
        var isolatedCount = nodeLength - this.nodes.length;
        if (isolatedCount > 0) {
            this.nodeArrayDidChange();
        }
        return new GraphClean().isolatedNodes(isolatedCount);
    };
    Graph.prototype.removeCircularEdges = function () {
        var edgesLength = this.edges.length;
        this.edges = this.edges.filter(function (el) { return el.nodes[0] !== el.nodes[1]; });
        if (this.edges.length != edgesLength) {
            this.edgeArrayDidChange();
        }
        return new GraphClean().circularEdges(edgesLength - this.edges.length);
    };
    Graph.prototype.removeDuplicateEdges = function () {
        var count = 0;
        for (var i = this.edges.length - 1; i > 0; i--){
            for (var j = i - 1; j > 0; j--) {
                if (this.edges[i].isSimilarToEdge(this.edges[j])) {
                    this.edges.splice(j, 1);
                    count += 1;
                    --i;
                }
            }
        }
        if (count > 0) {
            this.edgeArrayDidChange();
        }
        return new GraphClean().duplicateEdges(count);
    };
    Graph.prototype.cleanGraph = function () {
        this.edgeArrayDidChange();
        this.nodeArrayDidChange();
        return this.removeDuplicateEdges().join(this.removeCircularEdges());
    };
    Graph.prototype.clean = function () { return this.cleanGraph(); };
    Graph.prototype.getEdgeConnectingNodes = function (node1, node2) {
        for (var i = 0; i < this.edges.length; i++) {
            if ((this.edges[i].nodes[0] === node1 && this.edges[i].nodes[1] === node2) ||
                (this.edges[i].nodes[0] === node2 && this.edges[i].nodes[1] === node1)) {
                return this.edges[i];
            }
        }
        return undefined;
    };
    Graph.prototype.getEdgesConnectingNodes = function (node1, node2) {
        return this.edges.filter(function (el) {
            return (el.nodes[0] === node1 && el.nodes[1] === node2) ||
                (el.nodes[0] === node2 && el.nodes[1] === node1);
        });
    };
    Graph.prototype.copy = function () {
        this.nodeArrayDidChange();
        this.edgeArrayDidChange();
        var g = new Graph();
        for (var i = 0; i < this.nodes.length; i++) {
            var n = g.addNode(new GraphNode(g));
            Object.assign(n, this.nodes[i]);
            n.graph = g;
            n.index = i;
        }
        for (var i = 0; i < this.edges.length; i++) {
            var index = [this.edges[i].nodes[0].index, this.edges[i].nodes[1].index];
            var e = g.addEdge(new GraphEdge(g, g.nodes[index[0]], g.nodes[index[1]]));
            Object.assign(e, this.edges[i]);
            e.graph = g;
            e.index = i;
            e.nodes = [g.nodes[index[0]], g.nodes[index[1]]];
        }
        return g;
    };
    Graph.prototype.connectedGraphs = function () {
        var cp = this.copy();
        cp.clean();
        cp.removeIsolatedNodes();
        cp.nodes.forEach(function (node) { node.cache['adj'] = node.adjacentEdges().length; }, this);
        var graphs = [];
        while (cp.edges.length > 0) {
            var graph = new Graph();
            cp.nodes.forEach(function (node) { graph.addNode(Object.assign(new cp.nodeType(graph), node)); }, this);
            var node = cp.nodes.slice().sort(function (a, b) { return b.cache['adj'] - a.cache['adj']; })[0];
            var adj = node.adjacentEdges();
            while (adj.length > 0) {
                var smartList = adj.filter(function (el) { return el.otherNode(node).cache['adj'] % 2 == 0; }, this);
                if (smartList.length == 0) {
                    smartList = adj;
                }
                var nextEdge = smartList.sort(function (a, b) { return b.otherNode(node).cache['adj'] - a.otherNode(node).cache['adj']; })[0];
                var nextNode = nextEdge.otherNode(node);
                var newEdge = Object.assign(new cp.edgeType(graph, undefined, undefined), nextEdge);
                newEdge.nodes = [graph.nodes[node.index], graph.nodes[nextNode.index]];
                graph.addEdge(newEdge);
                node.cache['adj'] -= 1;
                nextNode.cache['adj'] -= 1;
                cp.edges = cp.edges.filter(function (el) { return el !== nextEdge; });
                node = nextNode;
                adj = node.adjacentEdges();
            }
            graph.removeIsolatedNodes();
            graphs.push(graph);
        }
        return graphs;
    };
    Graph.prototype.nodeArrayDidChange = function () { for (var i = 0; i < this.nodes.length; i++) {
        this.nodes[i].index = i;
    } };
    Graph.prototype.edgeArrayDidChange = function () { for (var i = 0; i < this.edges.length; i++) {
        this.edges[i].index = i;
    } };
    return Graph;
}());
var Multigraph = (function (_super) {
    __extends(Multigraph, _super);
    function Multigraph() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Multigraph.prototype.cleanGraph = function () {
        this.edgeArrayDidChange();
        this.nodeArrayDidChange();
        return new GraphClean();
    };
    return Multigraph;
}(Graph));
var PlanarClean = (function (_super) {
    __extends(PlanarClean, _super);
    function PlanarClean(numNodes, numEdges) {
        var _this = _super.call(this, numNodes, numEdges) || this;
        _this.edges = { total: 0, duplicate: 0, circular: 0 };
        _this.nodes = {
            total: 0,
            isolated: 0,
            fragment: [],
            collinear: [],
            duplicate: []
        };
        if (numNodes != undefined) {
            _this.nodes.total += numNodes;
        }
        if (numEdges != undefined) {
            _this.edges.total += numEdges;
        }
        return _this;
    }
    PlanarClean.prototype.fragmentedNodes = function (nodes) {
        this.nodes.fragment = nodes;
        this.nodes.total += nodes.length;
        return this;
    };
    PlanarClean.prototype.collinearNodes = function (nodes) {
        this.nodes.collinear = nodes;
        this.nodes.total += nodes.length;
        return this;
    };
    PlanarClean.prototype.duplicateNodes = function (nodes) {
        this.nodes.duplicate = nodes;
        this.nodes.total += nodes.length;
        return this;
    };
    PlanarClean.prototype.join = function (report) {
        this.nodes.total += report.nodes.total;
        this.edges.total += report.edges.total;
        this.nodes.isolated += report.nodes.isolated;
        this.edges.duplicate += report.edges.duplicate;
        this.edges.circular += report.edges.circular;
        var planarReport = report;
        if (planarReport.nodes.fragment != undefined) {
            this.nodes.fragment = this.nodes.fragment.concat(planarReport.nodes.fragment);
        }
        if (planarReport.nodes.collinear != undefined) {
            this.nodes.collinear = this.nodes.collinear.concat(planarReport.nodes.collinear);
        }
        if (planarReport.nodes.duplicate != undefined) {
            this.nodes.duplicate = this.nodes.duplicate.concat(planarReport.nodes.duplicate);
        }
        return this;
    };
    return PlanarClean;
}(GraphClean));
var PlanarNode = (function (_super) {
    __extends(PlanarNode, _super);
    function PlanarNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cache = {};
        return _this;
    }
    PlanarNode.prototype.copy = function () { return new XY(this.x, this.y); };
    PlanarNode.prototype.junction = function () {
        if (this.graph.unclean) {
            this.graph.clean();
        }
        return this.graph.junctions.slice().filter(function (junction) {
            return junction.origin === this;
        }, this).shift();
    };
    PlanarNode.prototype.sectors = function () {
        if (this.graph.unclean) {
            this.graph.clean();
        }
        return this.graph.sectors.filter(function (el) { return el.origin === this; }, this);
    };
    PlanarNode.prototype.interiorAngles = function () { return this.junction().interiorAngles(); };
    PlanarNode.prototype.adjacentFaces = function () {
        if (this.graph.unclean) {
            this.graph.clean();
        }
        return this.graph.faces.filter(function (face) {
            return face.nodes.filter(function (n) { return n === this; }, this).length > 0;
        }, this);
    };
    PlanarNode.prototype.adjacentEdges = function () {
        return this.graph.edges
            .filter(function (el) { return el.nodes[0] === this || el.nodes[1] === this; }, this)
            .map(function (el) {
            var other = el.otherNode(this);
            return { 'edge': el, 'angle': Math.atan2(other.y - this.y, other.x - this.x) };
        }, this)
            .map(function (el) { if (el['angle'] < 0) {
            el['angle'] += 2 * Math.PI;
        } ; return el; })
            .sort(function (a, b) { return a.angle - b.angle; })
            .map(function (el) { return el.edge; });
    };
    PlanarNode.prototype.setPosition = function (x, y) { this.x = x; this.y = y; return this; };
    PlanarNode.prototype.transform = function (matrix) {
        var t = new XY(this.x * matrix.a + this.y * matrix.c + matrix.tx, this.x * matrix.b + this.y * matrix.d + matrix.ty);
        this.x = t.x;
        this.y = t.y;
        return this;
    };
    PlanarNode.prototype.translate = function (dx, dy) { this.x += dx; this.y += dy; return this; };
    PlanarNode.prototype.rotate = function (angle, origin) { return this.transform(new Matrix().rotation(angle, origin)); };
    PlanarNode.prototype.reflect = function (line) {
        var origin = (line.direction != undefined) ? (line.point || line.origin) : new XY(line.nodes[0].x, line.nodes[0].y);
        var vector = (line.direction != undefined) ? line.direction : new XY(line.nodes[1].x, line.nodes[1].y).subtract(origin);
        return this.transform(new Matrix().reflection(vector, origin));
    };
    PlanarNode.prototype.equivalent = function (point, epsilon) { return new XY(this.x, this.y).equivalent(point, epsilon); };
    PlanarNode.prototype.normalize = function () { var m = this.magnitude(); return new XY(this.x / m, this.y / m); };
    PlanarNode.prototype.dot = function (point) { return this.x * point.x + this.y * point.y; };
    PlanarNode.prototype.cross = function (vector) { return this.x * vector.y - this.y * vector.x; };
    PlanarNode.prototype.magnitude = function () { return Math.sqrt(this.x * this.x + this.y * this.y); };
    PlanarNode.prototype.distanceTo = function (a) { return Math.sqrt(Math.pow(this.x - a.x, 2) + Math.pow(this.y - a.y, 2)); };
    PlanarNode.prototype.rotate90 = function () { return new XY(-this.y, this.x); };
    PlanarNode.prototype.rotate180 = function () { return new XY(-this.x, -this.y); };
    PlanarNode.prototype.rotate270 = function () { return new XY(this.y, -this.x); };
    PlanarNode.prototype.lerp = function (point, pct) { var inv = 1.0 - pct; return new XY(this.x * pct + point.x * inv, this.y * pct + point.y * inv); };
    PlanarNode.prototype.midpoint = function (other) { return new XY((this.x + other.x) * 0.5, (this.y + other.y) * 0.5); };
    PlanarNode.prototype.scale = function (magnitude) { return new XY(this.x * magnitude, this.y * magnitude); };
    PlanarNode.prototype.add = function (a, b) { if (isValidPoint(a)) {
        return new XY(this.x + a.x, this.y + a.y);
    }
    else if (isValidNumber(b)) {
        return new XY(this.x + a, this.y + b);
    } };
    PlanarNode.prototype.subtract = function (point) { return new XY(this.x - point.x, this.y - point.y); };
    PlanarNode.prototype.multiply = function (m) { return new XY(this.x * m.x, this.y * m.y); };
    PlanarNode.prototype.abs = function () { return new XY(Math.abs(this.x), Math.abs(this.y)); };
    PlanarNode.prototype.commonX = function (point, epsilon) { return epsilonEqual(this.x, point.x, epsilon); };
    PlanarNode.prototype.commonY = function (point, epsilon) { return epsilonEqual(this.y, point.y, epsilon); };
    return PlanarNode;
}(GraphNode));
var PlanarEdge = (function (_super) {
    __extends(PlanarEdge, _super);
    function PlanarEdge() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cache = {};
        return _this;
    }
    PlanarEdge.prototype.copy = function () { return new Edge(this.nodes[0].copy(), this.nodes[1].copy()); };
    PlanarEdge.prototype.adjacentFaces = function () {
        if (this.graph.unclean) {
            this.graph.clean();
        }
        return this.graph.faces.filter(function (face) {
            return face.edges.filter(function (edge) { return edge === this; }, this).length > 0;
        }, this);
    };
    PlanarEdge.prototype.boundingBox = function (epsilon) {
        if (epsilon == undefined) {
            epsilon = 0;
        }
        var xs = this.nodes[0].x < this.nodes[1].x ? [this.nodes[0].x, this.nodes[1].x] : [this.nodes[1].x, this.nodes[0].x];
        var ys = this.nodes[0].y < this.nodes[1].y ? [this.nodes[0].y, this.nodes[1].y] : [this.nodes[1].y, this.nodes[0].y];
        var eps2 = epsilon * 2;
        return new Rect(xs[0] - epsilon, ys[0] - epsilon, xs[1] - xs[0] + eps2, ys[1] - ys[0] + eps2);
    };
    PlanarEdge.prototype.intersection = function (edge, epsilon) {
        if (typeof edge.isAdjacentToEdge === "function" && this.isAdjacentToEdge(edge)) {
            return undefined;
        }
        var intersect = this.copy().intersection(edge.copy(), epsilon);
        if (intersect != undefined &&
            !(intersect.equivalent(this.nodes[0], epsilon) || intersect.equivalent(this.nodes[1], epsilon))) {
            return intersect;
        }
    };
    PlanarEdge.prototype.transform = function (matrix) { return new Edge(this.nodes[0].transform(matrix), this.nodes[1].transform(matrix)); };
    PlanarEdge.prototype.parallel = function (edge, epsilon) { return new Edge(this).parallel(new Edge(edge), epsilon); };
    PlanarEdge.prototype.collinear = function (point, epsilon) { return new Edge(this).collinear(point, epsilon); };
    PlanarEdge.prototype.equivalent = function (e, epsilon) { return ((this.nodes[0].equivalent(e.nodes[0], epsilon) && this.nodes[1].equivalent(e.nodes[1], epsilon)) || (this.nodes[0].equivalent(e.nodes[1], epsilon) && this.nodes[1].equivalent(e.nodes[0], epsilon))); };
    PlanarEdge.prototype.degenrate = function (epsilon) { return this.nodes[0].equivalent(this.nodes[1], epsilon); };
    PlanarEdge.prototype.length = function () { return Math.sqrt(Math.pow(this.nodes[0].x - this.nodes[1].x, 2) + Math.pow(this.nodes[0].y - this.nodes[1].y, 2)); };
    PlanarEdge.prototype.vector = function (originNode) { if (originNode == undefined) {
        return this.nodes[1].subtract(this.nodes[0]);
    } if (this.nodes[0].equivalent(originNode)) {
        return this.nodes[1].subtract(this.nodes[0]);
    } return this.nodes[0].subtract(this.nodes[1]); };
    PlanarEdge.prototype.reflectionMatrix = function () { return new Matrix().reflection(this.nodes[1].subtract(this.nodes[0]), this.nodes[0]); };
    PlanarEdge.prototype.nearestPoint = function (point) { var answer = this.nearestPointNormalTo(point); if (answer !== undefined) {
        return answer;
    } return this.nodes.map(function (el) { return { point: el, distance: el.distanceTo(point) }; }, this).sort(function (a, b) { return a.distance - b.distance; }).shift().point; };
    PlanarEdge.prototype.nearestPointNormalTo = function (point) { var p = this.nodes[0].distanceTo(this.nodes[1]); var u = ((point.x - this.nodes[0].x) * (this.nodes[1].x - this.nodes[0].x) + (point.y - this.nodes[0].y) * (this.nodes[1].y - this.nodes[0].y)) / (Math.pow(p, 2)); if (u < 0 || u > 1.0) {
        return undefined;
    } return new XY(this.nodes[0].x + u * (this.nodes[1].x - this.nodes[0].x), this.nodes[0].y + u * (this.nodes[1].y - this.nodes[0].y)); };
    PlanarEdge.prototype.midpoint = function () { return new XY(0.5 * (this.nodes[0].x + this.nodes[1].x), 0.5 * (this.nodes[0].y + this.nodes[1].y)); };
    PlanarEdge.prototype.perpendicularBisector = function () { return new Line(this.midpoint(), this.vector().rotate90()); };
    PlanarEdge.prototype.infiniteLine = function () { return new Line(this.nodes[0], this.nodes[1].subtract(this.nodes[0])); };
    return PlanarEdge;
}(GraphEdge));
var PlanarFace = (function (_super) {
    __extends(PlanarFace, _super);
    function PlanarFace(graph) {
        var _this = _super.call(this) || this;
        _this.graph = graph;
        _this.nodes = [];
        _this.edges = [];
        return _this;
    }
    PlanarFace.prototype.sectors = function () {
        if (this.graph.unclean) { }
        var options = this.graph.sectors.filter(function (sector) {
            return this.nodes.filter(function (node) { return node === sector.origin; }, this).length > 0;
        }, this);
        return this.edges.map(function (el, i) {
            var nextEl = this.edges[(i + 1) % this.edges.length];
            return options.filter(function (sector) { return sector.edges[1] === el && sector.edges[0] === nextEl; }, this).shift();
        }, this);
    };
    PlanarFace.prototype.commonEdges = function (face) {
        return this.edges.filter(function (edge) {
            return face.edges.filter(function (fe) { return fe === edge; }, this).length > 0;
        }, this);
    };
    PlanarFace.prototype.uncommonEdges = function (face) {
        return this.edges.filter(function (edge) {
            return face.edges.filter(function (fe) { return fe === edge; }, this).length == 0;
        }, this);
    };
    PlanarFace.prototype.edgeAdjacentFaces = function () {
        var allFaces = this.graph.faces.filter(function (el) { return !this.equivalent(el); }, this);
        return this.edges.map(function (ed) {
            for (var i = 0; i < allFaces.length; i++) {
                var adjArray = allFaces[i].edges.filter(function (ef) { return ed === ef; });
                if (adjArray.length > 0) {
                    return allFaces[i];
                }
            }
        }, this).filter(function (el) { return el !== undefined; });
    };
    PlanarFace.prototype.nodeAdjacentFaces = function () {
        var allFaces = this.graph.faces.filter(function (el) { return !this.equivalent(el); }, this);
        return this.nodes.map(function (node) {
            for (var i = 0; i < allFaces.length; i++) {
                var adjArray = allFaces[i].nodes.filter(function (nf) { return node === nf; });
                if (adjArray.length > 0) {
                    return allFaces[i];
                }
            }
        }, this).filter(function (el) { return el !== undefined; });
    };
    PlanarFace.prototype.adjacentFaceArray = function () {
        if (this.graph.unclean) {
            this.graph.clean();
        }
        else {
            this.graph.faceArrayDidChange();
        }
        var current = this;
        var visited = [current];
        var list = [[{ "face": current, "parent": undefined }]];
        do {
            var totalRoundAdjacent = [];
            list[list.length - 1].forEach(function (current) {
                totalRoundAdjacent = totalRoundAdjacent.concat(current.face.edgeAdjacentFaces()
                    .filter(function (face) {
                    return visited.filter(function (el) { return el === face; }, this).length == 0;
                }, this)
                    .map(function (face) {
                    visited.push(face);
                    return { "face": face, "parent": current };
                }, this));
            });
            list[list.length] = totalRoundAdjacent;
        } while (list[list.length - 1].length > 0);
        if (list.length > 0 && list[list.length - 1].length == 0) {
            list.pop();
        }
        return list;
    };
    PlanarFace.prototype.adjacentFaceTree = function () {
        var array = this.adjacentFaceArray();
        array[0][0]["tree"] = new Tree(array[0][0].face);
        for (var r = 1; r < array.length; r++) {
            for (var c = 0; c < array[r].length; c++) {
                var newNode = new Tree(array[r][c].face);
                newNode.parent = array[r][c]["parent"]["tree"];
                newNode.parent.children.push(newNode);
                array[r][c]["tree"] = newNode;
            }
        }
        return array[0][0]["tree"];
    };
    return PlanarFace;
}(Polygon));
var PlanarSector = (function (_super) {
    __extends(PlanarSector, _super);
    function PlanarSector(edge1, edge2) {
        var _this = _super.call(this, edge1.commonNodeWithEdge(edge2), undefined) || this;
        if (_this.origin === undefined) {
            return _this;
        }
        if (edge1 === edge2) {
            return _this;
        }
        _this.edges = [edge1, edge2];
        _this.endPoints = [
            (edge1.nodes[0] === _this.origin) ? edge1.nodes[1] : edge1.nodes[0],
            (edge2.nodes[0] === _this.origin) ? edge2.nodes[1] : edge2.nodes[0]
        ];
        return _this;
    }
    PlanarSector.prototype.equivalent = function (a) {
        return ((a.edges[0].isSimilarToEdge(this.edges[0]) &&
            a.edges[1].isSimilarToEdge(this.edges[1])) ||
            (a.edges[0].isSimilarToEdge(this.edges[1]) &&
                a.edges[1].isSimilarToEdge(this.edges[0])));
    };
    return PlanarSector;
}(Sector));
var PlanarJunction = (function () {
    function PlanarJunction(node) {
        this.origin = node;
        this.sectors = [];
        this.edges = [];
        if (node === undefined) {
            return;
        }
        this.edges = this.origin.adjacentEdges();
        if (this.edges.length <= 1) {
            return;
        }
        this.sectors = this.edges.map(function (el, i) {
            return new this.origin.graph.sectorType(el, this.edges[(i + 1) % this.edges.length]);
        }, this);
    }
    PlanarJunction.prototype.nodes = function () {
        return this.edges.map(function (edge) { return edge.otherNode(this.origin); }, this);
    };
    PlanarJunction.prototype.faces = function () {
        if (this.origin.graph.unclean) {
            this.origin.graph.clean();
        }
        return this.origin.graph.faces.filter(function (face) {
            return face.nodes.filter(function (node) { return node === this.origin; }, this).length > 0;
        }, this);
    };
    PlanarJunction.prototype.edgeAngles = function () {
        return this.nodes()
            .map(function (node) { return new XY(node.x, node.y).subtract(this.origin); })
            .map(function (vec) { return Math.atan2(vec.y, vec.x); }, this);
    };
    PlanarJunction.prototype.edgeVectorsNormalized = function () {
        return this.edges.map(function (el) { return el.vector(this.origin).normalize(); }, this);
    };
    PlanarJunction.prototype.sectorWithEdges = function (a, b) {
        var found = undefined;
        this.sectors.forEach(function (el) {
            if ((el.edges[0].equivalent(a) && el.edges[1].equivalent(b)) ||
                (el.edges[1].equivalent(a) && el.edges[0].equivalent(b))) {
                found = el;
                return found;
            }
        }, this);
        return found;
    };
    PlanarJunction.prototype.interiorAngles = function () {
        return this.sectors.map(function (el) {
            return el.angle();
        }, this);
    };
    PlanarJunction.prototype.clockwiseNode = function (fromNode) {
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].otherNode(this.origin) === fromNode) {
                return this.edges[(i + this.edges.length - 1) % this.edges.length].otherNode(this.origin);
            }
        }
    };
    PlanarJunction.prototype.counterClockwiseNode = function (fromNode) {
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].otherNode(this.origin) === fromNode) {
                return this.edges[(i + 1) % this.edges.length].otherNode(this.origin);
            }
        }
    };
    PlanarJunction.prototype.clockwiseEdge = function (fromEdge) {
        var index = this.edges.indexOf(fromEdge);
        if (index === -1) {
            return undefined;
        }
        return this.edges[(index + this.edges.length - 1) % this.edges.length];
    };
    PlanarJunction.prototype.counterClockwiseEdge = function (fromEdge) {
        var index = this.edges.indexOf(fromEdge);
        if (index === -1) {
            return undefined;
        }
        return this.edges[(index + 1) % this.edges.length];
    };
    return PlanarJunction;
}());
var PlanarGraph = (function (_super) {
    __extends(PlanarGraph, _super);
    function PlanarGraph() {
        var _this = _super.call(this) || this;
        _this.nodeType = PlanarNode;
        _this.edgeType = PlanarEdge;
        _this.faceType = PlanarFace;
        _this.sectorType = PlanarSector;
        _this.junctionType = PlanarJunction;
        _this.faces = [];
        _this.sectors = [];
        _this.junctions = [];
        return _this;
    }
    PlanarGraph.prototype.clean = function (epsilon) {
        this.unclean = false;
        var report = new PlanarClean();
        report.join(this.cleanDuplicateNodes(epsilon));
        this.fragmentCollinearNodes(epsilon);
        report.join(this.cleanDuplicateNodes(epsilon));
        report.join(this.fragment(epsilon));
        report.join(this.cleanDuplicateNodes(epsilon));
        report.join(this.cleanGraph());
        report.join(this.cleanAllNodes());
        this.nodeArrayDidChange();
        this.edgeArrayDidChange();
        this.generateJunctionsAndSectors();
        this.generateFaces();
        return report;
    };
    PlanarGraph.prototype.generateJunctionsAndSectors = function () {
        this.junctions = this.nodes
            .map(function (el) { return new this.junctionType(el); }, this)
            .filter(function (el) { return el !== undefined && el.edges.length > 1; }, this);
        this.sectors = this.junctions
            .map(function (el) { return el.sectors; }, this)
            .reduce(function (prev, curr) { return prev.concat(curr); }, [])
            .filter(function (el) { return el !== undefined; }, this);
        this.junctionArrayDidChange();
        this.sectorArrayDidChange();
    };
    PlanarGraph.prototype.generateFaces = function () {
        var faces = this.edges
            .map(function (edge) {
            return [this.counterClockwiseCircuit(edge.nodes[0], edge.nodes[1]),
                this.counterClockwiseCircuit(edge.nodes[1], edge.nodes[0])];
        }, this)
            .reduce(function (prev, curr) { return prev.concat(curr); }, [])
            .filter(function (el) { return el != undefined; }, this)
            .map(function (el) { return this.faceFromCircuit(el); }, this)
            .filter(function (el) { return el != undefined; }, this);
        var uniqueFaces = [];
        for (var i = 0; i < faces.length; i++) {
            var found = false;
            for (var j = 0; j < uniqueFaces.length; j++) {
                if (faces[i].equivalent(uniqueFaces[j])) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                uniqueFaces.push(faces[i]);
            }
        }
        this.faces = uniqueFaces;
        this.faceArrayDidChange();
    };
    PlanarGraph.prototype.newPlanarNode = function (x, y) {
        this.unclean = true;
        return this.newNode().setPosition(x, y);
    };
    PlanarGraph.prototype.newPlanarEdge = function (x1, y1, x2, y2) {
        this.unclean = true;
        var a = this.newNode().setPosition(x1, y1);
        var b = this.newNode().setPosition(x2, y2);
        return this.newEdge(a, b);
    };
    PlanarGraph.prototype.newPlanarEdgeFromNode = function (node, x, y) {
        this.unclean = true;
        var newNode = this.newNode().setPosition(x, y);
        return this.newEdge(node, newNode);
    };
    PlanarGraph.prototype.newPlanarEdgeBetweenNodes = function (a, b) {
        this.unclean = true;
        return this.newEdge(a, b);
    };
    PlanarGraph.prototype.clear = function () {
        this.nodes = [];
        this.edges = [];
        this.faces = [];
        this.sectors = [];
        this.junctions = [];
        return this;
    };
    PlanarGraph.prototype.removeEdge = function (edge) {
        var len = this.edges.length;
        var endNodes = [edge.nodes[0], edge.nodes[1]];
        this.edges = this.edges.filter(function (el) { return el !== edge; });
        return new PlanarClean(0, len - this.edges.length)
            .join(this.cleanNode(endNodes[0]))
            .join(this.cleanNode(endNodes[1]));
    };
    PlanarGraph.prototype.removeEdgeBetween = function (node1, node2) {
        var len = this.edges.length;
        this.edges = this.edges.filter(function (el) {
            return !((el.nodes[0] === node1 && el.nodes[1] === node2) ||
                (el.nodes[0] === node2 && el.nodes[1] === node1));
        });
        this.edgeArrayDidChange();
        return new PlanarClean(0, len - this.edges.length)
            .join(this.cleanNode(node1))
            .join(this.cleanNode(node2));
    };
    PlanarGraph.prototype.cleanNode = function (node) {
        var edges = this.edges.filter(function (e) { return e.nodes[0] === node || e.nodes[1] === node; }, this);
        switch (edges.length) {
            case 0:
                this.nodes = this.nodes.filter(function (el) { return el !== node; });
                this.nodeArrayDidChange();
                return new PlanarClean(1, 0);
            case 2:
                var farNodes = [(edges[0].uncommonNodeWithEdge(edges[1])),
                    (edges[1].uncommonNodeWithEdge(edges[0]))];
                if (farNodes[0] === undefined || farNodes[1] === undefined) {
                    return new PlanarClean();
                }
                var span = new Edge(farNodes[0].x, farNodes[0].y, farNodes[1].x, farNodes[1].y);
                if (span.collinear(node)) {
                    edges[0].nodes = [farNodes[0], farNodes[1]];
                    this.edges = this.edges.filter(function (el) { return el !== edges[1]; });
                    this.nodes = this.nodes.filter(function (el) { return el !== node; });
                    this.nodeArrayDidChange();
                    this.edgeArrayDidChange();
                    return new PlanarClean(1, 1);
                }
            default: return new PlanarClean();
        }
    };
    PlanarGraph.prototype.cleanAllNodes = function () {
        this.nodes.forEach(function (el) { el.cache['adjE'] = []; });
        this.edges.forEach(function (el) {
            el.nodes[0].cache['adjE'].push(el);
            el.nodes[1].cache['adjE'].push(el);
        });
        var report = new PlanarClean().join(this.removeIsolatedNodes());
        this.nodeArrayDidChange();
        this.edgeArrayDidChange();
        for (var i = this.nodes.length - 1; i >= 0; i--) {
            var edges = this.nodes[i].cache['adjE'];
            switch (edges.length) {
                case 0:
                    report.join(this.removeNode(this.nodes[i]));
                    break;
                case 2:
                    var farNodes = [(edges[0].uncommonNodeWithEdge(edges[1])),
                        (edges[1].uncommonNodeWithEdge(edges[0]))];
                    var span = new Edge(farNodes[0].x, farNodes[0].y, farNodes[1].x, farNodes[1].y);
                    if (span.collinear(this.nodes[i])) {
                        edges[0].nodes = [farNodes[0], farNodes[1]];
                        this.edges.splice(edges[1].index, 1);
                        this.edgeArrayDidChange();
                        this.nodes.splice(this.nodes[i].index, 1);
                        this.nodeArrayDidChange();
                        report.join(new PlanarClean(1, 1));
                    }
                    break;
            }
        }
        this.nodes.forEach(function (el) { el.cache['adjE'] = undefined; });
        return report;
    };
    PlanarGraph.prototype.cleanDuplicateNodes = function (epsilon) {
        var EPSILON_HIGH = 0.00000001;
        if (epsilon == undefined) {
            epsilon = EPSILON_HIGH;
        }
        var tree = rbush();
        tree.load(this.nodes.map(function (el) {
            return { minX: el.x - epsilon, minY: el.y - epsilon, maxX: el.x + epsilon, maxY: el.y + epsilon, node: el };
        }));
        var remainList = [], removeList = [];
        var mergeList = [];
        this.nodes.forEach(function (node) {
            tree.search({ minX: node.x - epsilon, minY: node.y - epsilon, maxX: node.x + epsilon, maxY: node.y + epsilon })
                .filter(function (r) { return node !== r['node']; }, this)
                .filter(function (r) { return remainList.indexOf(r['node']) == -1; }, this)
                .filter(function (r) { return removeList.indexOf(node) == -1; }, this)
                .forEach(function (r) {
                remainList.push(node);
                removeList.push(r['node']);
                mergeList.push({ 'remain': node, 'remove': r['node'] });
            }, this);
        }, this);
        return mergeList
            .map(function (el) {
            return new PlanarClean(-1)
                .join(this.mergeNodes(el['remain'], el['remove']))
                .duplicateNodes([new XY(el['remove'].x, el['remove'].y)]);
        }, this)
            .reduce(function (prev, curr) { return prev.join(curr); }, new PlanarClean());
    };
    PlanarGraph.prototype.nearest = function (a, b) {
        var point = gimme1XY(a, b);
        var face = this.faceContainingPoint(point);
        var edgeArray = this.edges
            .map(function (edge) {
            return { edge: edge, distance: edge.nearestPoint(point).distanceTo(point) };
        }, this)
            .sort(function (a, b) {
            return a.distance - b.distance;
        })[0];
        var edge = (edgeArray != undefined) ? edgeArray.edge : undefined;
        var node = (edge !== undefined) ? edge.nodes
            .slice().sort(function (a, b) { return a.distanceTo(point) - b.distanceTo(point); }).shift() : undefined;
        if (node == undefined) {
            var sortedNode = this.nodes
                .map(function (el) { return { 'node': el, 'distance': point.distanceTo(el) }; }, this)
                .sort(function (a, b) { return a.distance - b.distance; })
                .shift();
            node = (sortedNode != undefined) ? sortedNode['node'] : undefined;
        }
        var junction = (node != undefined) ? node.junction() : undefined;
        if (junction === undefined) {
            var sortedJunction = this.junctions
                .map(function (el) { return { 'junction': el, 'distance': point.distanceTo(el.origin) }; }, this)
                .sort(function (a, b) { return a['distance'] - b['distance']; })
                .shift();
            junction = (sortedJunction !== undefined) ? sortedJunction['junction'] : undefined;
        }
        var sector = (junction !== undefined) ? junction.sectors.filter(function (el) {
            return el.contains(point);
        }, this).shift() : undefined;
        return {
            'node': node,
            'edge': edge,
            'face': face,
            'junction': junction,
            'sector': sector
        };
    };
    PlanarGraph.prototype.faceContainingPoint = function (point) {
        for (var f = 0; f < this.faces.length; f++) {
            if (this.faces[f].contains(point)) {
                return this.faces[f];
            }
        }
    };
    PlanarGraph.prototype.nearestNodes = function (quantity, a, b) {
        var point = gimme1XY(a, b);
        var sortedNodes = this.nodes
            .map(function (el) { return { 'node': el, 'distance': point.distanceTo(el) }; }, this)
            .sort(function (a, b) { return a.distance - b.distance; })
            .map(function (el) { return el['node']; }, this);
        if (quantity > sortedNodes.length) {
            return sortedNodes;
        }
        return sortedNodes.slice(0, quantity);
    };
    PlanarGraph.prototype.nearestEdge = function (edges, a, b) {
        var point = gimme1XY(a, b);
        edges.map(function (edge) {
            return { edge: edge, distance: edge.nearestPoint(point).distanceTo(point) };
        }, this)
            .sort(function (a, b) { return a.distance - b.distance; })
            .slice(0);
    };
    PlanarGraph.prototype.nearestEdges = function (quantity, a, b) {
        var point = gimme1XY(a, b);
        var sortedEdges = this.edges
            .map(function (edge) {
            return { edge: edge, distance: edge.nearestPoint(point).distanceTo(point) };
        }, this)
            .sort(function (a, b) { return a.distance - b.distance; });
        if (quantity > sortedEdges.length) {
            return sortedEdges;
        }
        return sortedEdges.slice(0, quantity);
    };
    PlanarGraph.prototype.nearestEdgeWithPoints = function (a, b, c, d) {
        var p = gimme2XY(a, b, c, d);
        if (p === undefined) {
            return;
        }
        var nears = p.map(function (point) {
            return this.nodes
                .map(function (el) { return { 'n': el, 'd': point.distanceTo(el) }; }, this)
                .sort(function (a, b) { return a.d - b.d; })
                .map(function (el) { return a.n; }, this);
        }, this);
        if (nears[0].length == 0 || nears[1].length == 0) {
            return;
        }
        var edge = this.getEdgeConnectingNodes(nears[0][0], nears[1][0]);
        if (edge !== undefined)
            return edge;
        for (var cou = 3; cou < 20; cou += 3) {
            for (var i = 0; i < nears[0].length; i++) {
                for (var j = 0; j < nears[1].length; j++) {
                    if (i !== j) {
                        var edge = this.getEdgeConnectingNodes(nears[0][i], nears[1][j]);
                        if (edge !== undefined)
                            return edge;
                    }
                }
            }
        }
    };
    PlanarGraph.prototype.bounds = function () {
        if (this.nodes === undefined || this.nodes.length === 0) {
            return undefined;
        }
        var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.nodes.forEach(function (el) {
            if (el.x > maxX) {
                maxX = el.x;
            }
            if (el.x < minX) {
                minX = el.x;
            }
            if (el.y > maxY) {
                maxY = el.y;
            }
            if (el.y < minY) {
                minY = el.y;
            }
        });
        return new Rect(minX, minY, maxX - minX, maxY - minY);
    };
    PlanarGraph.prototype.getEdgeIntersections = function (epsilon) {
        var intersections = [];
        for (var i = 0; i < this.edges.length - 1; i++) {
            for (var j = i + 1; j < this.edges.length; j++) {
                var intersection = this.edges[i].intersection(this.edges[j], epsilon);
                if (intersection != undefined) {
                    var copy = false;
                    for (var k = 0; k < intersections.length; k++) {
                        if (intersection.equivalent(intersections[k], epsilon)) {
                            copy = true;
                            break;
                        }
                    }
                    if (!copy) {
                        intersections.push(intersection);
                    }
                }
            }
        }
        return intersections;
    };
    PlanarGraph.prototype.fragment = function (epsilon) {
        this.edgeArrayDidChange();
        var list = [];
        for (var i = 0; i < this.edges.length - 1; i++) {
            for (var j = i + 1; j < this.edges.length; j++) {
                var intersection = this.edges[i].intersection(this.edges[j], epsilon);
                if (intersection != undefined) {
                    list.push({ point: intersection, edges: [this.edges[i], this.edges[j]] });
                }
            }
        }
        for (var i = 0; i < list.length - 1; i++) {
            for (var j = list.length - 1; j > i; j--) {
                if (list[i].point.equivalent(list[j].point, epsilon)) {
                    list[i].point = list[i].point.lerp(list[j].point, 0.5);
                    list[i].edges = list[i].edges.concat(list[j].edges);
                    list.splice(j, 1);
                }
            }
        }
        var newList = list.map(function (el) {
            var newNode = this.newNode().setPosition(el.point.x, el.point.y);
            return { node: newNode, edges: el.edges };
        }, this);
        var edgesIntersections = Array.apply(null, Array(this.edges.length)).map(function (el) { return []; });
        for (var i = 0; i < newList.length; i++) {
            for (var j = 0; j < newList[i].edges.length; j++) {
                var index = newList[i].edges[j].index;
                edgesIntersections[index].push(newList[i].node);
            }
        }
        var EPSILON_HIGH = 0.000000001;
        if (epsilon == undefined) {
            epsilon = EPSILON_HIGH;
        }
        for (var i = 0; i < edgesIntersections.length; i++) {
            edgesIntersections[i].sort(function (a, b) {
                if (a.commonX(b, epsilon)) {
                    return a.y - b.y;
                }
                return a.x - b.x;
            });
        }
        var rebuild = edgesIntersections.map(function (el, i) {
            var endpoints = this.edges[i].nodes.slice().sort(function (a, b) {
                if (a.commonX(b, epsilon)) {
                    return a.y - b.y;
                }
                return a.x - b.x;
            });
            return { edge: this.edges[i], endpoints: endpoints, innerPoints: el };
        }, this);
        var rebuilt = rebuild
            .filter(function (el) { return el.innerPoints.length != 0; }, this)
            .map(function (el) {
            return this.rebuildEdge(el.edge, el.endpoints, el.innerPoints, epsilon);
        }, this);
        this.removeIsolatedNodes();
        this.cleanDuplicateNodes();
        this.cleanGraph();
        return new PlanarClean();
    };
    PlanarGraph.prototype.fragmentOld = function (epsilon) {
        var protection = 0;
        var report = new PlanarClean();
        var roundReport;
        do {
            roundReport = this.edges
                .map(function (edge) { return this.fragmentCrossingEdges(edge, epsilon); }, this)
                .reduce(function (prev, curr) { return prev.join(curr); }, new PlanarClean());
            if (roundReport.nodes.fragment.length > 0) {
                this.cleanDuplicateNodes(epsilon);
                this.cleanGraph();
            }
            report.join(roundReport);
            protection += 1;
        } while (roundReport.nodes.fragment.length != 0 && protection < 1000);
        if (protection >= 1000) {
            console.log("exiting fragment(). potential infinite loop detected");
        }
        this.removeIsolatedNodes();
        this.cleanDuplicateNodes();
        this.cleanGraph();
        return report;
    };
    PlanarGraph.prototype.fragmentCrossingEdges = function (edge, epsilon) {
        var report = new PlanarClean();
        var intersections = this.edgeCrossingEdges(edge, epsilon);
        if (intersections.length == 0) {
            return report;
        }
        var edgesLength = this.edges.length;
        report.nodes.fragment = intersections.map(function (el) { return new XY(el.point.x, el.point.y); });
        var newLineNodes = intersections.map(function (el) {
            return this.newNode().setPosition(el.point.x, el.point.y);
        }, this);
        var isolated = intersections
            .map(function (el, i) { return this.rebuildEdge(el.edge, el.edge.nodes, [newLineNodes[i]], epsilon); }, this)
            .map(function (el) { return el.nodes; })
            .reduce(function (prev, curr) { return prev.concat(curr); }, []);
        var sortedEndpts = edge.nodes.slice().sort(function (a, b) {
            if (a.commonX(b, epsilon)) {
                return a.y - b.y;
            }
            return a.x - b.x;
        });
        isolated = isolated.concat(this.rebuildEdge(edge, sortedEndpts, newLineNodes, epsilon).nodes);
        report.edges.total += edgesLength - this.edges.length;
        return report;
    };
    PlanarGraph.prototype.edgeCrossingEdges = function (edge, epsilon) {
        var EPSILON_HIGH = 0.000000001;
        if (epsilon == undefined) {
            epsilon = EPSILON_HIGH;
        }
        var myXs = edge.nodes.map(function (n) { return n.x; }).sort(function (a, b) { return a - b; });
        var myYs = edge.nodes.map(function (n) { return n.y; }).sort(function (a, b) { return a - b; });
        myXs[0] -= epsilon;
        myXs[1] += epsilon;
        myYs[0] -= epsilon;
        myYs[1] += epsilon;
        return this.edges
            .filter(function (el) {
            return !((el.nodes[0].x < myXs[0] && el.nodes[1].x < myXs[0]) ||
                (el.nodes[0].x > myXs[1] && el.nodes[1].x > myXs[1]) ||
                (el.nodes[0].y < myYs[0] && el.nodes[1].y < myYs[0]) ||
                (el.nodes[0].y > myYs[1] && el.nodes[1].y > myYs[1]));
        }, this)
            .filter(function (el) { return edge !== el; }, this)
            .map(function (el) { return { edge: el, point: edge.intersection(el, epsilon) }; }, this)
            .filter(function (el) { return el.point != undefined; })
            .sort(function (a, b) {
            if (a.point.commonX(b.point, epsilon)) {
                return a.point.y - b.point.y;
            }
            return a.point.x - b.point.x;
        });
    };
    PlanarGraph.prototype.rebuildEdge = function (oldEdge, oldEndpts, innerpoints, epsilon) {
        var isolatedNodes = [];
        var endinnerpts = [innerpoints[0], innerpoints[innerpoints.length - 1]];
        var equiv = oldEndpts.map(function (n, i) { return n.equivalent(endinnerpts[i], epsilon); }, this);
        if (equiv[0]) {
            isolatedNodes.push(oldEndpts[0]);
        }
        else {
            innerpoints.unshift(oldEndpts[0]);
        }
        if (equiv[1]) {
            isolatedNodes.push(oldEndpts[1]);
        }
        else {
            innerpoints.push(oldEndpts[1]);
        }
        var newEdges = [];
        if (innerpoints.length > 1) {
            for (var i = 0; i < innerpoints.length - 1; i++) {
                var e = this.copyEdge(oldEdge);
                e.nodes = [innerpoints[i], innerpoints[i + 1]];
                newEdges.push(e);
            }
        }
        this.edges = this.edges.filter(function (e) { return e !== oldEdge; }, this);
        return { edges: newEdges, nodes: isolatedNodes };
    };
    PlanarGraph.prototype.fragmentCollinearNodes = function (epsilon) {
        var EPSILON_HIGH = 0.000000001;
        if (epsilon == undefined) {
            epsilon = EPSILON_HIGH;
        }
        var tree = rbush();
        var treeNodes = this.nodes.map(function (n) {
            return { minX: n.x - epsilon, minY: n.y - epsilon, maxX: n.x + epsilon, maxY: n.y + epsilon, node: n };
        }, this);
        tree.load(treeNodes);
        this.edges.forEach(function (edge) { edge.cache['box'] = edge.boundingBox(epsilon); }, this);
        this.edges.slice().forEach(function (edge) {
            var box = edge.cache['box'];
            if (box == undefined) {
                box = edge.boundingBox(epsilon);
            }
            var result = tree.search({
                minX: box.origin.x,
                minY: box.origin.y,
                maxX: box.origin.x + box.size.width,
                maxY: box.origin.y + box.size.height
            }).filter(function (found) {
                return !edge.nodes[0].equivalent(found['node'], epsilon) &&
                    !edge.nodes[1].equivalent(found['node'], epsilon);
            }).filter(function (found) { return edge.collinear(found['node'], epsilon); });
            if (result.length) {
                var sortedEdgePts = edge.nodes.slice().sort(function (a, b) {
                    if (a.commonX(b, epsilon)) {
                        return a.y - b.y;
                    }
                    return a.x - b.x;
                });
                var sortedResult = result
                    .map(function (found) { return found['node']; }, this)
                    .sort(function (a, b) {
                    if (a.commonX(b, epsilon)) {
                        return a.y - b.y;
                    }
                    return a.x - b.x;
                });
                this.rebuildEdge(edge, sortedEdgePts, sortedResult, epsilon)
                    .edges
                    .forEach(function (e) { e.cache['box'] = e.boundingBox(epsilon); });
            }
        }, this);
    };
    PlanarGraph.prototype.counterClockwiseCircuit = function (node1, node2) {
        if (node1 === undefined || node2 === undefined) {
            return undefined;
        }
        var incidentEdge = node1.graph.getEdgeConnectingNodes(node1, node2);
        if (incidentEdge == undefined) {
            return undefined;
        }
        var pairs = [];
        var lastNode = node1;
        var travelingNode = node2;
        var visitedList = [lastNode];
        var nextWalk = incidentEdge;
        pairs.push(nextWalk);
        do {
            visitedList.push(travelingNode);
            var travelingNodeJunction = travelingNode.junction();
            if (travelingNodeJunction !== undefined) {
                nextWalk = travelingNodeJunction.clockwiseEdge(nextWalk);
            }
            pairs.push(nextWalk);
            lastNode = travelingNode;
            travelingNode = nextWalk.otherNode(lastNode);
            if (travelingNode === node1) {
                return pairs;
            }
        } while (!(visitedList.filter(function (el) { return el === travelingNode; }).length > 0));
        return undefined;
    };
    PlanarGraph.prototype.faceFromCircuit = function (circuit) {
        var SUM_ANGLE_EPSILON = 0.000000000001;
        if (circuit == undefined || circuit.length < 3) {
            return undefined;
        }
        var face = new this.faceType(this);
        face.edges = circuit;
        face.nodes = circuit.map(function (el, i) {
            var nextEl = circuit[(i + 1) % circuit.length];
            return el.uncommonNodeWithEdge(nextEl);
        });
        var angleSum = face.nodes
            .map(function (el, i) {
            var el1 = face.nodes[(i + 1) % face.nodes.length];
            var el2 = face.nodes[(i + 2) % face.nodes.length];
            return clockwiseInteriorAngle(new XY(el.x - el1.x, el.y - el1.y), new XY(el2.x - el1.x, el2.y - el1.y));
        }, this)
            .reduce(function (sum, value) { return sum + value; }, 0);
        if (face.nodes.length > 2 && Math.abs(angleSum / (face.nodes.length - 2) - Math.PI) < SUM_ANGLE_EPSILON) {
            return face;
        }
    };
    PlanarGraph.prototype.copy = function () {
        this.nodeArrayDidChange();
        this.edgeArrayDidChange();
        this.faceArrayDidChange();
        this.sectorArrayDidChange();
        this.junctionArrayDidChange();
        var g = new PlanarGraph();
        for (var i = 0; i < this.nodes.length; i++) {
            var n = g.addNode(new PlanarNode(g));
            Object.assign(n, this.nodes[i]);
            n.graph = g;
            n.index = i;
        }
        for (var i = 0; i < this.edges.length; i++) {
            var index = [this.edges[i].nodes[0].index, this.edges[i].nodes[1].index];
            var e = g.addEdge(new PlanarEdge(g, g.nodes[index[0]], g.nodes[index[1]]));
            Object.assign(e, this.edges[i]);
            e.graph = g;
            e.index = i;
            e.nodes = [g.nodes[index[0]], g.nodes[index[1]]];
        }
        for (var i = 0; i < this.faces.length; i++) {
            var f = new PlanarFace(g);
            Object.assign(f, this.faces[i]);
            for (var j = 0; j < this.faces[i].nodes.length; j++) {
                f.nodes.push(f.nodes[this.faces[i].nodes[j].index]);
            }
            for (var j = 0; j < this.faces[i].edges.length; j++) {
                f.edges.push(f.edges[this.faces[i].edges[j].index]);
            }
            f.graph = g;
            f.index = i;
            g.faces.push(f);
        }
        g.sectors = this.sectors.map(function (sector, i) {
            var gSecEdges = sector.edges.map(function (edge) { return g.edges[edge.index]; }, this);
            var s = new PlanarSector(gSecEdges[0], gSecEdges[1]);
            s.index = i;
            return s;
        }, this);
        g.junctions = this.junctions.map(function (junction, i) {
            var j = new PlanarJunction(undefined);
            j.origin = g.nodes[junction.origin.index];
            j.sectors = junction.sectors.map(function (sector) { return g.sectors[sector.index]; }, this);
            j.edges = junction.edges.map(function (edge) { return g.edges[edge.index]; }, this);
            j.index = i;
            return j;
        }, this);
        return g;
    };
    PlanarGraph.prototype.polylines = function () {
        return this.connectedGraphs().map(function (graph) {
            if (graph.edges.length == 0) {
                return undefined;
            }
            if (graph.edges.length == 1) {
                return graph.edges[0].nodes.map(function (n) { return n.copy(); }, this);
            }
            var nodes = [graph.edges[0].uncommonNodeWithEdge(graph.edges[1])];
            for (var i = 0; i < graph.edges.length - 1; i++) {
                var edge = graph.edges[i];
                var nextEdge = graph.edges[(i + 1)];
                nodes.push(edge.commonNodeWithEdge(nextEdge));
            }
            nodes.push(graph.edges[graph.edges.length - 1].uncommonNodeWithEdge(graph.edges[graph.edges.length - 2]));
            return nodes.map(function (el) { return el.copy(); }, this);
        }, this)
            .filter(function (el) { return el != undefined; }, this)
            .map(function (line) {
            var p = new Polyline();
            p.nodes = line;
            return p;
        }, this);
    };
    PlanarGraph.prototype.faceArrayDidChange = function () { for (var i = 0; i < this.faces.length; i++) {
        this.faces[i].index = i;
    } };
    PlanarGraph.prototype.sectorArrayDidChange = function () { for (var i = 0; i < this.sectors.length; i++) {
        this.sectors[i].index = i;
    } };
    PlanarGraph.prototype.junctionArrayDidChange = function () { for (var i = 0; i < this.junctions.length; i++) {
        this.junctions[i].index = i;
    } };
    return PlanarGraph;
}(Graph));
function gimme1XY(a, b) {
    if (isValidPoint(a)) {
        return new XY(a.x, a.y);
    }
    if (isValidNumber(b)) {
        return new XY(a, b);
    }
    if (a.constructor === Array) {
        return new XY(a[0], a[1]);
    }
}
function gimme2XY(a, b, c, d) {
    if (a instanceof XY && b instanceof XY) {
        return [a, b];
    }
    if (isValidPoint(b)) {
        return [new XY(a.x, a.y), new XY(b.x, b.y)];
    }
    if (isValidNumber(d)) {
        return [new XY(a, b), new XY(c, d)];
    }
}
function gimme1Edge(a, b, c, d) {
    if (a instanceof Edge) {
        return a;
    }
    if (a.nodes !== undefined) {
        return new Edge(a.nodes[0], a.nodes[1]);
    }
    if (isValidPoint(b)) {
        return new Edge(a, b);
    }
    if (isValidNumber(d)) {
        return new Edge(a, b, c, d);
    }
}
function gimme1Ray(a, b, c, d) {
    if (a instanceof Ray) {
        return a;
    }
    if (isValidPoint(b)) {
        return new Ray(a, b);
    }
    if (isValidNumber(d)) {
        return new Ray(new XY(a, b), new XY(c, d));
    }
}
function gimme1Line(a, b, c, d) {
    if (a instanceof Line) {
        return a;
    }
    if (isValidPoint(b)) {
        return new Line(a, b);
    }
    if (isValidNumber(d)) {
        return new Line(a, b, c, d);
    }
    if (a.nodes instanceof Array &&
        a.nodes.length > 0 &&
        isValidPoint(a.nodes[1])) {
        return new Line(a.nodes[0].x, a.nodes[0].y, a.nodes[1].x, a.nodes[1].y);
    }
}
var CPPoint = (function (_super) {
    __extends(CPPoint, _super);
    function CPPoint(cp, point) {
        var _this = _super.call(this, point.x, point.y) || this;
        _this.cp = cp;
        return _this;
    }
    CPPoint.prototype.nearest = function () { return this.cp.nearest(this); };
    return CPPoint;
}(XY));
var CreaseLineType = (function () {
    function CreaseLineType() {
    }
    CreaseLineType.prototype.crease = function () { };
    return CreaseLineType;
}());
var CPLine = (function (_super) {
    __extends(CPLine, _super);
    function CPLine(cp, line) {
        var _this = _super.call(this, line.point, line.direction) || this;
        _this.cp = cp;
        return _this;
    }
    CPLine.prototype.crease = function () { return this.cp.crease(this); };
    return CPLine;
}(Line));
var CPRay = (function (_super) {
    __extends(CPRay, _super);
    function CPRay(cp, ray) {
        var _this = _super.call(this, ray.origin, ray.direction) || this;
        _this.cp = cp;
        return _this;
    }
    CPRay.prototype.crease = function () { return this.cp.crease(this); };
    CPRay.prototype.creaseAndRepeat = function () { return this.cp.creaseRayRepeat(this); };
    CPRay.prototype.creaseAndStop = function () { return this.cp.creaseAndStop(this); };
    return CPRay;
}(Ray));
var CPEdge = (function (_super) {
    __extends(CPEdge, _super);
    function CPEdge(cp, edge) {
        var _this = _super.call(this, edge.nodes[0], edge.nodes[1]) || this;
        _this.cp = cp;
        return _this;
    }
    CPEdge.prototype.crease = function () { return this.cp.crease(this); };
    return CPEdge;
}(Edge));
var CPPolyline = (function (_super) {
    __extends(CPPolyline, _super);
    function CPPolyline(cp, polyline) {
        var _this = _super.call(this) || this;
        _this.cp = cp;
        _this.nodes = polyline.nodes.map(function (p) { return new XY(p.x, p.y); }, _this);
        return _this;
    }
    CPPolyline.prototype.crease = function () { return this.cp.creasePolyline(this); };
    return CPPolyline;
}(Polyline));
var CreaseDirection;
(function (CreaseDirection) {
    CreaseDirection[CreaseDirection["mark"] = 0] = "mark";
    CreaseDirection[CreaseDirection["border"] = 1] = "border";
    CreaseDirection[CreaseDirection["mountain"] = 2] = "mountain";
    CreaseDirection[CreaseDirection["valley"] = 3] = "valley";
})(CreaseDirection || (CreaseDirection = {}));
var Fold = (function () {
    function Fold(foldFunction, argumentArray) {
        this.func = undefined;
        this.args = [];
        this.func = foldFunction;
        this.args = argumentArray;
    }
    return Fold;
}());
var MadeByType;
(function (MadeByType) {
    MadeByType[MadeByType["ray"] = 0] = "ray";
    MadeByType[MadeByType["doubleRay"] = 1] = "doubleRay";
    MadeByType[MadeByType["endpoints"] = 2] = "endpoints";
    MadeByType[MadeByType["axiom1"] = 3] = "axiom1";
    MadeByType[MadeByType["axiom2"] = 4] = "axiom2";
    MadeByType[MadeByType["axiom3"] = 5] = "axiom3";
    MadeByType[MadeByType["axiom4"] = 6] = "axiom4";
    MadeByType[MadeByType["axiom5"] = 7] = "axiom5";
    MadeByType[MadeByType["axiom6"] = 8] = "axiom6";
    MadeByType[MadeByType["axiom7"] = 9] = "axiom7";
})(MadeByType || (MadeByType = {}));
var MadeBy = (function () {
    function MadeBy() {
        this.endPoints = [];
        this.intersections = [];
    }
    return MadeBy;
}());
var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["position"] = 0] = "position";
    ChangeType[ChangeType["newLine"] = 1] = "newLine";
})(ChangeType || (ChangeType = {}));
var FoldSequence = (function () {
    function FoldSequence() {
    }
    return FoldSequence;
}());
var CreaseSector = (function (_super) {
    __extends(CreaseSector, _super);
    function CreaseSector() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CreaseSector.prototype.bisect = function () {
        var vectors = this.vectors();
        var angles = vectors.map(function (el) { return Math.atan2(el.y, el.x); });
        while (angles[0] < 0) {
            angles[0] += Math.PI * 2;
        }
        while (angles[1] < 0) {
            angles[1] += Math.PI * 2;
        }
        var interior = counterClockwiseInteriorAngleRadians(angles[0], angles[1]);
        var bisected = angles[0] + interior * 0.5;
        var ray = new Ray(new XY(this.origin.x, this.origin.y), new XY(Math.cos(bisected), Math.sin(bisected)));
        return new CPRay(this.origin.graph, ray);
    };
    CreaseSector.prototype.kawasakiCollapse = function () {
        var junction = this.origin.junction();
        if (junction.edges.length % 2 == 0) {
            return;
        }
        var foundIndex = undefined;
        for (var i = 0; i < junction.sectors.length; i++) {
            if (this.equivalent(junction.sectors[i])) {
                foundIndex = i;
            }
        }
        if (foundIndex == undefined) {
            return;
        }
        var sumEven = 0;
        var sumOdd = 0;
        for (var i = 0; i < junction.sectors.length - 1; i++) {
            var index = (i + foundIndex + 1) % junction.sectors.length;
            if (i % 2 == 0) {
                sumEven += junction.sectors[index].angle();
            }
            else {
                sumOdd += junction.sectors[index].angle();
            }
        }
        var dEven = Math.PI - sumEven;
        var vec0 = this.edges[0].vector(this.origin);
        var angle0 = Math.atan2(vec0.y, vec0.x);
        var newA = angle0 + dEven;
        var solution = new Ray(new XY(this.origin.x, this.origin.y), new XY(Math.cos(newA), Math.sin(newA)));
        if (this.contains(solution.origin.add(solution.direction))) {
            return new CPRay(this.origin.graph, solution);
        }
    };
    return CreaseSector;
}(PlanarSector));
var CreaseJunction = (function (_super) {
    __extends(CreaseJunction, _super);
    function CreaseJunction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CreaseJunction.prototype.flatFoldable = function (epsilon) { return this.kawasaki(epsilon) && this.maekawa(); };
    CreaseJunction.prototype.alternateAngleSum = function () {
        if (this.sectors.length % 2 != 0) {
            return undefined;
        }
        var sums = [0, 0];
        this.sectors.forEach(function (el, i) { sums[i % 2] += el.angle(); });
        return sums;
    };
    CreaseJunction.prototype.maekawa = function () {
        if (this.origin.isBoundary()) {
            return true;
        }
        var m = this.edges.filter(function (edge) { return edge.orientation === CreaseDirection.mountain; }, this).length;
        var v = this.edges.filter(function (edge) { return edge.orientation === CreaseDirection.valley; }, this).length;
        return Math.abs(m - v) == 2;
    };
    CreaseJunction.prototype.kawasaki = function (epsilon) {
        if (epsilon === undefined) {
            epsilon = 0.0001;
        }
        if (this.origin.isBoundary()) {
            return true;
        }
        var alternating = this.alternateAngleSum();
        if (alternating == undefined) {
            return false;
        }
        return Math.abs(alternating[0] - alternating[1]) < epsilon;
    };
    CreaseJunction.prototype.kawasakiRating = function () {
        var alternating = this.alternateAngleSum();
        return Math.abs(alternating[0] - alternating[1]);
    };
    CreaseJunction.prototype.kawasakiSolution = function () {
        var alternating = this.alternateAngleSum().map(function (el) {
            return { 'difference': (Math.PI - el), 'sectors': [] };
        });
        this.sectors.forEach(function (el, i) { alternating[i % 2].sectors.push(el); });
        return alternating;
    };
    CreaseJunction.prototype.kawasakiCollapse = function (sector) {
        if (this.edges.length % 2 == 0) {
            return;
        }
        var foundIndex = undefined;
        for (var i = 0; i < this.sectors.length; i++) {
            if (sector.equivalent(this.sectors[i])) {
                foundIndex = i;
            }
        }
        if (foundIndex == undefined) {
            return undefined;
        }
        var sumEven = 0;
        var sumOdd = 0;
        for (var i = 0; i < this.sectors.length - 1; i++) {
            var index = (i + foundIndex + 1) % this.sectors.length;
            if (i % 2 == 0) {
                sumEven += this.sectors[index].angle();
            }
            else {
                sumOdd += this.sectors[index].angle();
            }
        }
        var dEven = Math.PI - sumEven;
        var vec0 = sector.edges[0].vector(sector.origin);
        var angle0 = Math.atan2(vec0.y, vec0.x);
        var newA = angle0 - dEven;
        var solution = new Ray(new XY(this.origin.x, this.origin.y), new XY(Math.cos(newA), Math.sin(newA)));
        if (sector.contains(solution.origin.add(solution.direction))) {
            return new CPRay(this.origin.graph, solution);
        }
    };
    return CreaseJunction;
}(PlanarJunction));
var CreaseNode = (function (_super) {
    __extends(CreaseNode, _super);
    function CreaseNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CreaseNode.prototype.isBoundary = function () {
        return this.graph.boundary.liesOnEdge(this);
    };
    CreaseNode.prototype.alternateAngleSum = function () {
        return this.junction().alternateAngleSum();
    };
    CreaseNode.prototype.kawasakiRating = function () {
        return this.junction().kawasakiRating();
    };
    CreaseNode.prototype.flatFoldable = function (epsilon) {
        if (this.isBoundary()) {
            return true;
        }
        return this.junction().flatFoldable(epsilon);
    };
    CreaseNode.prototype.kawasakiCollapse = function (a, b) {
        var junction = this.junction();
        var sector = junction.sectorWithEdges(a, b);
        if (sector !== undefined) {
            return junction.kawasakiCollapse(sector);
        }
    };
    return CreaseNode;
}(PlanarNode));
var Crease = (function (_super) {
    __extends(Crease, _super);
    function Crease(graph, node1, node2) {
        var _this = _super.call(this, graph, node1, node2) || this;
        _this.orientation = CreaseDirection.mark;
        _this.newMadeBy = new MadeBy();
        _this.newMadeBy.endPoints = [node1, node2];
        return _this;
    }
    ;
    Crease.prototype.mark = function () { this.orientation = CreaseDirection.mark; return this; };
    Crease.prototype.mountain = function () { this.orientation = CreaseDirection.mountain; return this; };
    Crease.prototype.valley = function () { this.orientation = CreaseDirection.valley; return this; };
    Crease.prototype.border = function () { this.orientation = CreaseDirection.border; return this; };
    Crease.prototype.reflectionMatrix = function () {
        if (this.orientation == CreaseDirection.border || this.orientation == CreaseDirection.mark)
            return new Matrix().identity();
        else
            return new Matrix().reflection(this.nodes[1].subtract(this.nodes[0]), this.nodes[0]);
    };
    Crease.prototype.creaseToEdge = function (edge) { return this.graph.creaseEdgeToEdge(this, edge); };
    return Crease;
}(PlanarEdge));
var CreaseFace = (function (_super) {
    __extends(CreaseFace, _super);
    function CreaseFace() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CreaseFace.prototype.rabbitEar = function () {
        var sectors = this.sectors();
        if (sectors.length !== 3) {
            return [];
        }
        var rays = sectors.map(function (el) { return el.bisect(); });
        var incenter = rays
            .map(function (el, i) {
            var nextEl = rays[(i + 1) % rays.length];
            return el.intersection(nextEl);
        })
            .reduce(function (prev, current) { return prev.add(current); })
            .scale(1.0 / rays.length);
        var incenterNode = this.graph.newPlanarNode(incenter.x, incenter.y);
        return this.nodes.map(function (el) {
            return this.graph.newCreaseBetweenNodes(el, incenterNode);
        }, this);
    };
    return CreaseFace;
}(PlanarFace));
var CreasePattern = (function (_super) {
    __extends(CreasePattern, _super);
    function CreasePattern() {
        var _this = _super.call(this) || this;
        _this.nodeType = CreaseNode;
        _this.edgeType = Crease;
        _this.faceType = CreaseFace;
        _this.sectorType = CreaseSector;
        _this.junctionType = CreaseJunction;
        _this.boundary = new ConvexPolygon();
        _this.symmetryLine = undefined;
        _this.square();
        return _this;
    }
    CreasePattern.prototype.clear = function () {
        this.nodes = [];
        this.edges = [];
        this.faces = [];
        this.sectors = [];
        this.junctions = [];
        this.symmetryLine = undefined;
        this.cleanBoundary();
        this.clean();
        return this;
    };
    CreasePattern.prototype.cleanBoundary = function () {
        this.edges = this.edges.filter(function (el) { return el.orientation !== CreaseDirection.border; });
        this.cleanAllNodes();
        var boundaryNodes = this.boundary.nodes().map(function (node) { return this.newPlanarNode(node.x, node.y); }, this);
        boundaryNodes.forEach(function (node, i) {
            var nextNode = boundaryNodes[(i + 1) % boundaryNodes.length];
            this.newPlanarEdgeBetweenNodes(node, nextNode).border();
        }, this);
        this.cleanDuplicateNodes();
    };
    CreasePattern.prototype.contains = function (a, b) {
        var p = gimme1XY(a, b);
        if (p == undefined) {
            return false;
        }
        return this.boundary.contains(p);
    };
    CreasePattern.prototype.square = function (width) {
        if (width == undefined) {
            width = 1.0;
        }
        else if (width < 0) {
            width = Math.abs(width);
        }
        return this.setBoundary([[0, 0], [width, 0], [width, width], [0, width]], true);
    };
    CreasePattern.prototype.rectangle = function (width, height) {
        if (width == undefined || height == undefined) {
            return this;
        }
        width = Math.abs(width);
        height = Math.abs(height);
        return this.setBoundary([[0, 0], [width, 0], [width, height], [0, height]], true);
    };
    CreasePattern.prototype.polygon = function (sides) {
        if (sides < 3) {
            return this;
        }
        return this.setBoundary(new ConvexPolygon().regularPolygon(sides).nodes());
    };
    CreasePattern.prototype.noBoundary = function () {
        this.boundary.edges = [];
        this.cleanBoundary();
        this.clean();
        return this;
    };
    CreasePattern.prototype.setBoundary = function (pointArray, pointsSorted) {
        var points = pointArray.map(function (p) { return gimme1XY(p); }, this);
        if (points[0].equivalent(points[points.length - 1])) {
            points.pop();
        }
        if (pointsSorted === true) {
            this.boundary.setEdgesFromPoints(points);
        }
        else {
            this.boundary.convexHull(points);
        }
        this.cleanBoundary();
        this.clean();
        return this;
    };
    CreasePattern.prototype.setMinimumRectBoundary = function () {
        var bounds = this.bounds();
        return this.setBoundary([
            [bounds.origin.x, bounds.origin.y],
            [bounds.origin.x + bounds.size.width, bounds.origin.y],
            [bounds.origin.x + bounds.size.width, bounds.origin.y + bounds.size.height],
            [bounds.origin.x, bounds.origin.y + bounds.size.height]
        ]);
    };
    CreasePattern.prototype.noSymmetry = function () {
        this.symmetryLine = undefined;
        return this;
    };
    CreasePattern.prototype.bookSymmetry = function () {
        var center = this.boundary.center();
        this.symmetryLine = new Line(center, new XY(0, 1));
        return this;
    };
    CreasePattern.prototype.diagonalSymmetry = function () {
        var center = this.boundary.center();
        this.symmetryLine = new Line(center, new XY(0.7071, 0.7071));
        return this;
    };
    CreasePattern.prototype.setSymmetryLine = function (a, b, c, d) {
        var edge = gimme1Edge(a, b, c, d);
        this.symmetryLine = new Line(edge.nodes[0], edge.nodes[1].subtract(edge.nodes[1]));
        return this;
    };
    CreasePattern.prototype.point = function (a, b) { return new CPPoint(this, gimme1XY(a, b)); };
    CreasePattern.prototype.line = function (a, b, c, d) { return new CPLine(this, gimme1Line(a, b, c, d)); };
    CreasePattern.prototype.ray = function (a, b, c, d) { return new CPRay(this, gimme1Ray(a, b, c, d)); };
    CreasePattern.prototype.edge = function (a, b, c, d) { return new CPEdge(this, gimme1Edge(a, b, c, d)); };
    CreasePattern.prototype.newCreaseBetweenNodes = function (a, b) {
        this.unclean = true;
        return this.newEdge(a, b);
    };
    CreasePattern.prototype.newCrease = function (a_x, a_y, b_x, b_y) {
        this.creaseSymmetry(a_x, a_y, b_x, b_y);
        var newCrease = this.newPlanarEdge(a_x, a_y, b_x, b_y);
        if (this.didChange !== undefined) {
            this.didChange(undefined);
        }
        return newCrease;
    };
    CreasePattern.prototype.creaseSymmetry = function (ax, ay, bx, by) {
        if (this.symmetryLine === undefined) {
            return undefined;
        }
        var ra = new XY(ax, ay).reflect(this.symmetryLine);
        var rb = new XY(bx, by).reflect(this.symmetryLine);
        return this.newPlanarEdge(ra.x, ra.y, rb.x, rb.y);
    };
    CreasePattern.prototype.crease = function (a, b, c, d) {
        if (a instanceof Line) {
            return this.creaseLine(a);
        }
        if (a instanceof Edge) {
            return this.creaseEdge(a);
        }
        if (a instanceof Ray) {
            return this.creaseRay(a);
        }
        var e = gimme1Edge(a, b, c, d);
        if (e === undefined) {
            return;
        }
        var edge = this.boundary.clipEdge(e);
        if (edge === undefined) {
            return;
        }
        return this.newCrease(edge.nodes[0].x, edge.nodes[0].y, edge.nodes[1].x, edge.nodes[1].y);
    };
    CreasePattern.prototype.creaseAndStop = function (a, b, c, d) {
        if (a instanceof Line) {
            var endpoints = a.rays().map(function (ray) {
                return ray.intersectionsWithEdges(this.edges).shift();
            }, this).filter(function (el) { return el != undefined; }, this);
            if (endpoints.length < 2) {
                return this.creaseLine(a);
            }
            return this.creaseEdge(endpoints[0], endpoints[1]);
        }
        if (a instanceof Ray) {
            var intersections = a.intersectionsWithEdges(this.edges).filter(function (point) { return !point.equivalent(a.origin); });
            var intersection = intersections.shift();
            if (intersection == undefined) {
                return this.creaseRay(a);
            }
            return this.creaseEdge(a.origin, intersection);
        }
        var e = gimme1Edge(a, b, c, d);
        var point0Ray = new Ray(e.nodes[0], new XY(e.nodes[1].x - e.nodes[0].x, e.nodes[1].y - e.nodes[0].y));
        var edgeDetail = point0Ray.clipWithEdgesDetails(this.edges).shift();
        if (edgeDetail == undefined) {
            return;
        }
        if (edgeDetail['edge'].length() < e.length()) {
            return this.creaseEdge(edgeDetail['edge']);
        }
        return this.creaseEdge(e);
    };
    CreasePattern.prototype.creaseAndReflect = function (a, b, c, d) {
        if (a instanceof Line) {
            return a.rays().map(function (ray) {
                return this.creaseRayRepeat(ray);
            }, this).reduce(function (prev, curr) {
                return prev.concat(curr);
            }, []);
        }
        if (a instanceof Ray) {
            return this.creaseRayRepeat(a);
        }
        return undefined;
    };
    CreasePattern.prototype.creaseLine = function (a, b, c, d) {
        var line = gimme1Line(a, b, c, d);
        if (line === undefined) {
            return;
        }
        var edge = this.boundary.clipLine(line);
        if (edge === undefined) {
            return;
        }
        return this.newCrease(edge.nodes[0].x, edge.nodes[0].y, edge.nodes[1].x, edge.nodes[1].y);
    };
    CreasePattern.prototype.creaseRay = function (a, b, c, d) {
        var ray = gimme1Ray(a, b, c, d);
        if (ray === undefined) {
            return;
        }
        var edge = this.boundary.clipRay(ray);
        if (edge === undefined) {
            return;
        }
        var newCrease = this.newCrease(edge.nodes[0].x, edge.nodes[0].y, edge.nodes[1].x, edge.nodes[1].y);
        return newCrease;
    };
    CreasePattern.prototype.creaseEdge = function (a, b, c, d) {
        var e = gimme1Edge(a, b, c, d);
        if (e === undefined) {
            return;
        }
        var edge = this.boundary.clipEdge(e);
        if (edge === undefined) {
            return;
        }
        return this.newCrease(edge.nodes[0].x, edge.nodes[0].y, edge.nodes[1].x, edge.nodes[1].y);
    };
    CreasePattern.prototype.creaseRayUntilIntersection = function (ray, target) {
        var clips = ray.clipWithEdgesDetails(this.edges);
        if (clips.length > 0) {
            if (target !== undefined) {
                var targetEdge = new Edge(ray.origin.x, ray.origin.y, target.x, target.y);
                if (clips[0].edge.length() > targetEdge.length()) {
                    return this.crease(targetEdge);
                }
            }
            return this.crease(clips[0].edge);
        }
        return undefined;
    };
    CreasePattern.prototype.creaseLineRepeat = function (a, b, c, d) {
        var ray = gimme1Ray(a, b, c, d);
        return this.creaseRayRepeat(ray)
            .concat(this.creaseRayRepeat(ray.flip()));
    };
    CreasePattern.prototype.creaseRayRepeat = function (ray, target) {
        return new Polyline()
            .rayReflectRepeat(ray, this.edges, target)
            .edges()
            .map(function (edge) {
            return this.crease(edge);
        }, this)
            .filter(function (el) { return el != undefined; });
    };
    CreasePattern.prototype.creasePolyline = function (polyline) {
        return polyline.edges()
            .map(function (edge) {
            return this.crease(edge);
        }, this)
            .filter(function (el) { return el != undefined; });
    };
    CreasePattern.prototype.creaseThroughPoints = function (a, b, c, d) {
        var inputEdge = gimme1Edge(a, b, c, d);
        if (inputEdge === undefined) {
            return;
        }
        var edge = this.boundary.clipLine(inputEdge.infiniteLine());
        if (edge === undefined) {
            return;
        }
        var newCrease = this.newCrease(edge.nodes[0].x, edge.nodes[0].y, edge.nodes[1].x, edge.nodes[1].y);
        return newCrease;
    };
    CreasePattern.prototype.creasePointToPoint = function (a, b, c, d) {
        var e = gimme1Edge(a, b, c, d);
        if (e === undefined) {
            return;
        }
        var edge = this.boundary.clipLine(e.perpendicularBisector());
        if (edge === undefined) {
            return;
        }
        var newCrease = this.newCrease(edge.nodes[0].x, edge.nodes[0].y, edge.nodes[1].x, edge.nodes[1].y);
        return newCrease;
    };
    CreasePattern.prototype.creaseEdgeToEdge = function (one, two) {
        var a = gimme1Edge(one).infiniteLine();
        var b = gimme1Edge(two).infiniteLine();
        return a.bisect(b)
            .map(function (line) { return this.boundary.clipLine(line); }, this)
            .filter(function (edge) { return edge !== undefined; }, this)
            .map(function (edge) {
            return this.newCrease(edge.nodes[0].x, edge.nodes[0].y, edge.nodes[1].x, edge.nodes[1].y);
        }, this);
    };
    CreasePattern.prototype.creasePerpendicularThroughPoint = function (line, point) {
        var edge = this.boundary.clipLine(new Line(point, line.vector().rotate90()));
        if (edge === undefined) {
            return;
        }
        var newCrease = this.newCrease(edge.nodes[0].x, edge.nodes[0].y, edge.nodes[1].x, edge.nodes[1].y);
        return newCrease;
    };
    CreasePattern.prototype.creasePointToLine = function (origin, point, line) {
        var radius = Math.sqrt(Math.pow(origin.x - point.x, 2) + Math.pow(origin.y - point.y, 2));
        var intersections = new Circle(origin.x, origin.y, radius).intersection(new Edge(line));
        var creases = [];
        for (var i = 0; i < intersections.length; i++) {
            creases.push(this.creasePointToPoint(point, intersections[i]));
        }
        return creases;
    };
    CreasePattern.prototype.creasePerpendicularPointOntoLine = function (point, ontoLine, perp) {
        var newLine = new Line(point, new XY(perp.nodes[1].x - perp.nodes[0].x, perp.nodes[1].y - perp.nodes[0].y));
        var intersection = newLine.intersection(ontoLine.infiniteLine());
        if (intersection === undefined) {
            return;
        }
        var edge = this.boundary.clipLine(new Edge(point, intersection).perpendicularBisector());
        if (edge === undefined) {
            return;
        }
        return this.newCrease(edge.nodes[0].x, edge.nodes[0].y, edge.nodes[1].x, edge.nodes[1].y);
    };
    CreasePattern.prototype.pleat = function (count, one, two) {
        var a = new Edge(one.nodes[0].x, one.nodes[0].y, one.nodes[1].x, one.nodes[1].y);
        var b = new Edge(two.nodes[0].x, two.nodes[0].y, two.nodes[1].x, two.nodes[1].y);
        return a.infiniteLine()
            .subsect(b.infiniteLine(), count)
            .map(function (line) {
            return this.boundary.clipLine(line);
        }, this)
            .filter(function (el) { return el != undefined; }, this)
            .map(function (el) {
            return this.newCrease(el.nodes[0].x, el.nodes[0].y, el.nodes[1].x, el.nodes[1].y);
        }, this);
    };
    CreasePattern.prototype.glitchPleat = function (one, two, count) {
        var a = new Edge(one.nodes[0].x, one.nodes[0].y, one.nodes[1].x, one.nodes[1].y);
        var b = new Edge(two.nodes[0].x, two.nodes[0].y, two.nodes[1].x, two.nodes[1].y);
        var u = a.nodes[0].subtract(a.nodes[1]);
        var v = b.nodes[0].subtract(b.nodes[1]);
        return Array.apply(null, Array(count - 1))
            .map(function (el, i) { return (i + 1) / count; }, this)
            .map(function (el) {
            var origin = a.nodes[0].lerp(b.nodes[0], el);
            var vector = u.lerp(v, el);
            return this.boundary.clipLine(new Line(origin, vector));
        }, this)
            .filter(function (el) { return el !== undefined; }, this)
            .map(function (el) { return this.newCrease(el.nodes[0].x, el.nodes[0].y, el.nodes[1].x, el.nodes[1].y); }, this);
    };
    CreasePattern.prototype.availableAxiomFolds = function () {
        var edges = [];
        edges = edges.concat(this.availableAxiom1Folds());
        edges = edges.concat(this.availableAxiom2Folds());
        edges = edges.concat(this.availableAxiom3Folds());
        return edges;
    };
    CreasePattern.prototype.availableAxiom1Folds = function () {
        var edges = [];
        for (var n0 = 0; n0 < this.nodes.length - 1; n0++) {
            for (var n1 = n0 + 1; n1 < this.nodes.length; n1++) {
                var inputEdge = new Edge(this.nodes[n0], this.nodes[n1]);
                var edge = this.boundary.clipLine(inputEdge.infiniteLine());
                if (edge !== undefined) {
                    var cpedge = new CPEdge(this, edge);
                    cpedge.madeBy = new Fold(this.creaseThroughPoints, [new XY(this.nodes[n0].x, this.nodes[n0].y), new XY(this.nodes[n1].x, this.nodes[n1].y)]);
                    edges.push(cpedge);
                }
            }
        }
        return edges;
    };
    CreasePattern.prototype.availableAxiom2Folds = function () {
        var edges = [];
        for (var n0 = 0; n0 < this.nodes.length - 1; n0++) {
            for (var n1 = n0 + 1; n1 < this.nodes.length; n1++) {
                var inputEdge = new Edge(this.nodes[n0], this.nodes[n1]);
                var edge = this.boundary.clipLine(inputEdge.perpendicularBisector());
                if (edge !== undefined) {
                    var cpedge = new CPEdge(this, edge);
                    cpedge.madeBy = new Fold(this.creasePointToPoint, [new XY(this.nodes[n0].x, this.nodes[n0].y), new XY(this.nodes[n1].x, this.nodes[n1].y)]);
                    edges.push(cpedge);
                }
            }
        }
        return edges;
    };
    CreasePattern.prototype.availableAxiom3Folds = function () {
        var edges = [];
        for (var e0 = 0; e0 < this.edges.length - 1; e0++) {
            for (var e1 = e0 + 1; e1 < this.edges.length; e1++) {
                var a = this.edges[e0].infiniteLine();
                var b = this.edges[e1].infiniteLine();
                var pair = a.bisect(b).map(function (line) {
                    return this.boundary.clipLine(line);
                }, this).filter(function (el) { return el !== undefined; }, this);
                var p = pair.map(function (edge) {
                    var cpedge = new CPEdge(this, edge);
                    cpedge.madeBy = new Fold(this.creaseEdgeToEdge, [this.edges[e0].copy(), this.edges[e1].copy()]);
                    return cpedge;
                }, this);
                edges = edges.concat(p);
            }
        }
        return edges;
    };
    CreasePattern.prototype.availableAxiom4Folds = function () {
        var edges = [];
        for (var e = 0; e < this.edges.length; e++) {
            for (var n = 0; n < this.nodes.length; n++) {
                var point = new XY(this.nodes[n].x, this.nodes[n].y);
                var edge = this.boundary.clipLine(new Line(point, this.edges[e].vector().rotate90()));
                if (edge != undefined) {
                    var cpedge = new CPEdge(this, edge);
                    cpedge.madeBy = new Fold(this.creasePerpendicularThroughPoint, [point, new Edge(this.edges[e].nodes[0].copy(), this.edges[e].nodes[1].copy())]);
                    edges.push(cpedge);
                }
            }
        }
        return edges;
    };
    CreasePattern.prototype.wiggle = function (epsilon) {
        if (epsilon === undefined) {
            epsilon = 0.00001;
        }
        var lengths = this.edges.forEach(function (crease, i) {
            return crease.length();
        });
        var nodesAttempted = 0;
        for (var i = 0; i < this.nodes.length; i++) {
            var rating = this.nodes[i].kawasakiRating();
            if (rating > epsilon) {
                nodesAttempted++;
                var guesses = [];
                for (var n = 0; n < 12; n++) {
                    var randomAngle = Math.random() * Math.PI * 20;
                    var radius = Math.random() * rating;
                    var move = new XY(0.05 * radius * Math.cos(randomAngle), 0.05 * radius * Math.sin(randomAngle));
                    this.nodes[i].x += move.x;
                    this.nodes[i].y += move.y;
                    var newRating = this.nodes[i].kawasakiRating();
                    var adjNodes = this.nodes[i].adjacentNodes();
                    var adjRating = 0;
                    for (var adj = 0; adj < adjNodes.length; adj++) {
                        adjRating += this.nodes[i].kawasakiRating();
                    }
                    guesses.push({ xy: move, rating: newRating + adjRating });
                    this.nodes[i].x -= move.x;
                    this.nodes[i].y -= move.y;
                }
                var sortedGuesses = guesses.sort(function (a, b) { return a.rating - b.rating; });
                this.nodes[i].x += sortedGuesses[0].xy.x;
                this.nodes[i].y += sortedGuesses[0].xy.y;
            }
        }
        return nodesAttempted;
    };
    CreasePattern.prototype.flatFoldable = function () {
        return this.nodes.map(function (el) { return el.flatFoldable(); })
            .reduce(function (prev, cur) { return prev && cur; });
    };
    CreasePattern.prototype.bounds = function () { return this.boundary.minimumRect(); };
    CreasePattern.prototype.bottomEdge = function () {
        return this.edges
            .filter(function (el) { return el.orientation === CreaseDirection.border; })
            .sort(function (a, b) { return (b.nodes[0].y + b.nodes[1].y) - (a.nodes[0].y + a.nodes[1].y); })
            .shift();
    };
    CreasePattern.prototype.topEdge = function () {
        return this.edges
            .filter(function (el) { return el.orientation === CreaseDirection.border; })
            .sort(function (a, b) { return (a.nodes[0].y + a.nodes[1].y) - (b.nodes[0].y + b.nodes[1].y); })
            .shift();
    };
    CreasePattern.prototype.rightEdge = function () {
        return this.edges
            .filter(function (el) { return el.orientation === CreaseDirection.border; })
            .sort(function (a, b) { return (b.nodes[0].x + b.nodes[1].x) - (a.nodes[0].x + a.nodes[1].x); })
            .shift();
    };
    CreasePattern.prototype.leftEdge = function () {
        return this.edges
            .filter(function (el) { return el.orientation === CreaseDirection.border; })
            .sort(function (a, b) { return (a.nodes[0].x + a.nodes[1].x) - (b.nodes[0].x + b.nodes[1].x); })
            .shift();
    };
    CreasePattern.prototype.overlapRelationMatrix = function () {
        this.clean();
        var matrix = Array.apply(null, Array(this.faces.length)).map(function (e) {
            return Array.apply(null, Array(this.faces.length));
        }, this);
        var adj = this.faces.map(function (face) { return face.edgeAdjacentFaces(); }, this);
        adj.forEach(function (adjFaces, i) {
            var face = this.faces[i];
            adjFaces.filter(function (adjFace) { return matrix[face.index][adjFace.index] == undefined; }, this)
                .forEach(function (adjFace) {
                var thisEdge = face.commonEdges(adjFace).shift();
                switch (thisEdge.orientation) {
                    case CreaseDirection.mountain:
                        matrix[face.index][adjFace.index] = true;
                        break;
                    case CreaseDirection.valley:
                        matrix[face.index][adjFace.index] = false;
                        break;
                }
            }, this);
        }, this);
        console.log(matrix);
        return undefined;
    };
    CreasePattern.prototype.removeAllMarks = function () {
        for (var i = this.edges.length - 1; i >= 0; i--) {
            if (this.edges[i].orientation === CreaseDirection.mark) {
                i -= this.removeEdge(this.edges[i]).edges.total - 1;
            }
        }
        this.clean();
        return this;
    };
    CreasePattern.prototype.fold = function (face) {
        this.clean();
        var copyCP = this.copy().removeAllMarks();
        if (face == undefined) {
            var bounds = copyCP.bounds();
            face = copyCP.nearest(bounds.origin.x + bounds.size.width * 0.5, bounds.origin.y + bounds.size.height * 0.5).face;
        }
        else {
            var centroid = face.centroid();
            face = copyCP.nearest(centroid.x, centroid.y).face;
        }
        if (face === undefined) {
            return;
        }
        var tree = face.adjacentFaceTree();
        var faces = [];
        tree['matrix'] = new Matrix();
        faces.push({ 'face': tree.obj, 'matrix': tree['matrix'] });
        function recurse(node) {
            node.children.forEach(function (child) {
                var local = child.obj.commonEdges(child.parent.obj).shift().reflectionMatrix();
                child['matrix'] = child.parent['matrix'].mult(local);
                faces.push({ 'face': child.obj, 'matrix': child['matrix'] });
                recurse(child);
            }, this);
        }
        recurse(tree);
        var nodeTransformed = Array.apply(false, Array(copyCP.nodes.length));
        faces.forEach(function (el) {
            el.face.nodes
                .filter(function (node) { return !nodeTransformed[node.index]; }, this)
                .forEach(function (node) {
                node.transform(el.matrix);
                nodeTransformed[node.index] = true;
            }, this);
        }, this);
        return copyCP.exportFoldFile();
    };
    CreasePattern.prototype.foldSVG = function (face) {
        this.clean();
        var copyCP = this.copy().removeAllMarks();
        if (face == undefined) {
            var bounds = copyCP.bounds();
            face = copyCP.nearest(bounds.origin.x + bounds.size.width * 0.5, bounds.origin.y + bounds.size.height * 0.5).face;
        }
        if (face === undefined) {
            return;
        }
        var tree = face.adjacentFaceTree();
        var faces = [];
        tree['matrix'] = new Matrix();
        faces.push({ 'face': tree.obj, 'matrix': tree['matrix'] });
        function recurse(node) {
            node.children.forEach(function (child) {
                var local = child.obj.commonEdges(child.parent.obj).shift().reflectionMatrix();
                child['matrix'] = child.parent['matrix'].mult(local);
                faces.push({ 'face': child.obj, 'matrix': child['matrix'] });
                recurse(child);
            }, this);
        }
        recurse(tree);
        var nodeTransformed = Array.apply(false, Array(copyCP.nodes.length));
        faces.forEach(function (el) {
            el.face.nodes
                .filter(function (node) { return !nodeTransformed[node.index]; }, this)
                .forEach(function (node) {
                node.transform(el.matrix);
                nodeTransformed[node.index] = true;
            }, this);
        }, this);
        return copyCP.exportSVG();
    };
    CreasePattern.prototype["export"] = function (fileType) {
        switch (fileType.toLowerCase()) {
            case "fold": return this.exportFoldFile();
            case "svg": return this.exportSVG();
        }
    };
    CreasePattern.prototype.exportFoldFile = function () {
        this.nodeArrayDidChange();
        this.edgeArrayDidChange();
        var file = {};
        file["file_spec"] = 1;
        file["file_creator"] = "crease pattern Javascript library by Robby Kraft";
        file["file_author"] = "";
        file["file_classes"] = ["singleModel"];
        file["vertices_coords"] = this.nodes.map(function (node) {
            return [cleanNumber(node.x, 12), cleanNumber(node.y, 12)];
        }, this);
        file["faces_vertices"] = this.faces.map(function (face) {
            return face.nodes.map(function (node) { return node.index; }, this);
        }, this);
        file["edges_vertices"] = this.edges.map(function (edge) {
            return edge.nodes.map(function (node) { return node.index; }, this);
        }, this);
        file["edges_assignment"] = this.edges.map(function (edge) {
            switch (edge.orientation) {
                case CreaseDirection.border: return "B";
                case CreaseDirection.mountain: return "M";
                case CreaseDirection.valley: return "V";
                case CreaseDirection.mark: return "F";
                default: return "U";
            }
        }, this);
        return file;
    };
    CreasePattern.prototype.importFoldFile = function (file, epsilon) {
        if (file === undefined ||
            file["vertices_coords"] === undefined ||
            file["edges_vertices"] === undefined) {
            return undefined;
        }
        if (file["frame_attributes"] !== undefined && file["frame_attributes"].contains("3D")) {
            console.log("importFoldFile(): FOLD file marked as '3D', this library only supports 2D. attempting import anyway, expect a possible distortion due to orthogonal projection.");
        }
        this.noBoundary();
        this.clear();
        file["vertices_coords"].forEach(function (el) {
            this.newPlanarNode((el[0] || 0), (el[1] || 0));
        }, this);
        this.nodeArrayDidChange();
        file["edges_vertices"]
            .map(function (el) {
            return el.map(function (index) { return this.nodes[index]; }, this);
        }, this)
            .filter(function (el) { return el[0] !== undefined && el[1] !== undefined; }, this)
            .forEach(function (nodes) {
            this.newPlanarEdgeBetweenNodes(nodes[0], nodes[1]);
        }, this);
        this.edgeArrayDidChange();
        var assignmentDictionary = { "B": CreaseDirection.border, "M": CreaseDirection.mountain, "V": CreaseDirection.valley, "F": CreaseDirection.mark, "U": CreaseDirection.mark };
        file["edges_assignment"]
            .map(function (assignment) { return assignmentDictionary[assignment]; })
            .forEach(function (orientation, i) { this.edges[i].orientation = orientation; }, this);
        this.faces = file["faces_vertices"]
            .map(function (faceNodeArray, fi) {
            var face = new CreaseFace(this);
            face.nodes = faceNodeArray.map(function (nodeIndex) { return this.nodes[nodeIndex]; }, this);
            face.edges = face.nodes.map(function (node, ei) {
                var nextNode = face.nodes[(ei + 1) % face.nodes.length];
                return this.getEdgeConnectingNodes(node, nextNode);
            }, this);
            return face;
        }, this);
        this.faceArrayDidChange();
        var boundaryPoints = this.edges
            .filter(function (el) { return el.orientation === CreaseDirection.border; }, this)
            .map(function (el) {
            return [
                new XY(el.nodes[0].x, el.nodes[0].y),
                new XY(el.nodes[1].x, el.nodes[1].y)
            ];
        }, this);
        this.setBoundary([].concat.apply([], boundaryPoints));
        this.clean(epsilon);
        return this;
    };
    CreasePattern.prototype.exportSVG = function (size) {
        if (size === undefined || size <= 0) {
            size = 600;
        }
        var bounds = this.bounds();
        var width = bounds.size.width;
        var height = bounds.size.height;
        var scale = size / (width);
        var origins = [bounds.origin.x, bounds.origin.y];
        var widthScaled = cleanNumber(width * scale).toString();
        var heightScaled = cleanNumber(height * scale).toString();
        var dashW = cleanNumber(width * scale * 0.0025 * 4).toString();
        var dashWOff = dashW;
        var strokeWidthNum = width * scale * 0.0025 * 2;
        var strokeWidth = strokeWidthNum < 0.5 ? 0.5 : cleanNumber(strokeWidthNum).toString();
        if (strokeWidth == 0) {
            strokeWidth = 0.5;
        }
        var valleyStyle = "stroke=\"#4379FF\" stroke-linecap=\"round\" stroke-dasharray=\"" + dashW + "," + dashWOff + "\" ";
        var mountainStyle = "stroke=\"#EE1032\" ";
        var noStyle = "stroke=\"#000000\" ";
        var blob = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<!-- generated by crease pattern Javascript library by Robby Kraft  -->\n<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" width=\"" + widthScaled + "px\" height=\"" + heightScaled + "px\" viewBox=\"0 0 " + widthScaled + " " + heightScaled + "\">\n";
        var orientationList = [CreaseDirection.mark, CreaseDirection.valley, CreaseDirection.mountain, CreaseDirection.border];
        var styles = [noStyle, valleyStyle, mountainStyle, noStyle];
        var gNames = ["marks", "valley", "mountain", "boundary"];
        var sortedCreases = orientationList.map(function (orient) { return this.edges.filter(function (e) { return e.orientation == orient; }, this); }, this);
        sortedCreases.unshift(this.edges.filter(function (e) {
            return orientationList.filter(function (el) { return el == e.orientation; }, this).length == 0;
        }, this));
        gNames.unshift("other");
        styles.unshift(noStyle);
        sortedCreases.forEach(function (creases, i) {
            if (creases.length == 0) {
                return;
            }
            blob += "<g id=\"" + gNames[i] + "\">\n";
            var style = styles[i];
            creases.forEach(function (crease) {
                var p = crease.nodes
                    .map(function (el) { return [el.x, el.y]; }, this)
                    .reduce(function (prev, curr) { return prev.concat(curr); }, [])
                    .map(function (el, i) { return (el - origins[i % 2]) * scale; }, this)
                    .map(function (number) { return cleanNumber(number, 12).toString(); }, this);
                blob += "\t<line " + style + "stroke-width=\"" + strokeWidth + "\" x1=\"" + p[0] + "\" y1=\"" + p[1] + "\" x2=\"" + p[2] + "\" y2=\"" + p[3] + "\"/>\n";
            }, this);
            blob += "</g>\n";
        }, this);
        blob += "</svg>\n";
        return blob;
    };
    CreasePattern.prototype.exportSVGMin = function (size) {
        if (size === undefined || size <= 0) {
            size = 600;
        }
        var bounds = this.bounds();
        var width = bounds.size.width;
        var height = bounds.size.height;
        var padX = bounds.origin.x;
        var padY = bounds.origin.y;
        var scale = size / (width + padX * 2);
        var strokeWidth = (width * scale * 0.0025).toFixed(1);
        if (strokeWidth === "0" || strokeWidth === "0.0") {
            strokeWidth = "0.5";
        }
        var polylines = this.polylines();
        var blob = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<!-- generated by crease pattern Javascript library by Robby Kraft  -->\n<svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" x=\"0px\" y=\"0px\" width=\"" + ((width + padX * 2) * scale) + "px\" height=\"" + ((height + padY * 2) * scale) + "px\" viewBox=\"0 0 " + ((width + padX * 2) * scale) + " " + ((height + padY * 2) * scale) + "\">\n<g>\n";
        for (var i = 0; i < polylines.length; i++) {
            if (polylines[i].nodes.length >= 0) {
                blob += "<polyline fill=\"none\" stroke-width=\"" + strokeWidth + "\" stroke=\"#000000\" points=\"";
                for (var j = 0; j < polylines[i].nodes.length; j++) {
                    var point = polylines[i].nodes[j];
                    blob += cleanNumber(scale * point.x, 12).toString() + "," + cleanNumber(scale * point.y, 12).toString() + " ";
                }
                blob += "\"/>\n";
            }
        }
        blob = blob + "</g>\n</svg>\n";
        return blob;
    };
    CreasePattern.prototype.kiteBase = function () {
        return this.importFoldFile({ "vertices_coords": [[0, 0], [1, 0], [1, 1], [0, 1], [0.4142135623730955, 0], [1, 0.5857864376269045]], "faces_vertices": [[2, 3, 5], [3, 0, 4], [3, 1, 5], [1, 3, 4]], "edges_vertices": [[2, 3], [3, 0], [3, 1], [3, 4], [0, 4], [4, 1], [3, 5], [1, 5], [5, 2]], "edges_assignment": ["B", "B", "V", "M", "B", "B", "M", "B", "B"] });
    };
    CreasePattern.prototype.fishBase = function () {
        return this.importFoldFile({ "vertices_coords": [[0, 0], [1, 0], [1, 1], [0, 1], [0.292893218813, 0.292893218813], [0.707106781187, 0.707106781187], [0.292893218813, 0], [1, 0.707106781187]], "faces_vertices": [[2, 3, 5], [3, 0, 4], [3, 1, 5], [1, 3, 4], [4, 0, 6], [1, 4, 6], [5, 1, 7], [2, 5, 7]], "edges_vertices": [[2, 3], [3, 0], [3, 1], [0, 4], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 6], [0, 6], [6, 1], [5, 7], [1, 7], [7, 2]], "edges_assignment": ["B", "B", "V", "M", "M", "M", "M", "M", "M", "V", "B", "B", "V", "B", "B"] });
    };
    CreasePattern.prototype.birdBase = function () {
        return this.importFoldFile({ "vertices_coords": [[0, 0], [1, 0], [1, 1], [0, 1], [0.5, 0.5], [0.207106781187, 0.5], [0.5, 0.207106781187], [0.792893218813, 0.5], [0.5, 0.792893218813], [0.353553390593, 0.646446609407], [0.646446609407, 0.646446609407], [0.646446609407, 0.353553390593], [0.353553390593, 0.353553390593], [0, 0.5], [0.5, 0], [1, 0.5], [0.5, 1]], "faces_vertices": [[3, 5, 9], [5, 3, 13], [0, 5, 13], [5, 0, 12], [4, 5, 12], [5, 4, 9], [0, 6, 12], [6, 0, 14], [1, 6, 14], [6, 1, 11], [4, 6, 11], [6, 4, 12], [1, 7, 11], [7, 1, 15], [2, 7, 15], [7, 2, 10], [4, 7, 10], [7, 4, 11], [2, 8, 10], [8, 2, 16], [3, 8, 16], [8, 3, 9], [4, 8, 9], [8, 4, 10]], "edges_vertices": [[3, 5], [0, 5], [4, 5], [0, 6], [1, 6], [4, 6], [1, 7], [2, 7], [4, 7], [2, 8], [3, 8], [4, 8], [5, 9], [9, 8], [9, 4], [3, 9], [8, 10], [10, 7], [4, 10], [10, 2], [7, 11], [11, 6], [4, 11], [11, 1], [6, 12], [12, 5], [0, 12], [12, 4], [5, 13], [0, 13], [13, 3], [6, 14], [0, 14], [14, 1], [7, 15], [1, 15], [15, 2], [8, 16], [3, 16], [16, 2]], "edges_assignment": ["M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "F", "F", "V", "V", "F", "F", "V", "V", "F", "F", "M", "M", "F", "F", "V", "V", "V", "B", "B", "V", "B", "B", "V", "B", "B", "V", "B", "B"] });
    };
    CreasePattern.prototype.frogBase = function () {
        return this.importFoldFile({ "vertices_coords": [[0, 0], [1, 0], [1, 1], [0, 1], [0.5, 0.5], [0, 0.5], [0.5, 0], [1, 0.5], [0.5, 1], [0.146446609407, 0.353553390593], [0.353553390593, 0.146446609407], [0.646446609407, 0.146446609407], [0.853553390593, 0.353553390593], [0.853553390593, 0.646446609407], [0.646446609407, 0.853553390593], [0.353553390593, 0.853553390593], [0.146446609407, 0.646446609407], [0, 0.353553390593], [0, 0.646446609407], [0.353553390593, 0], [0.646446609407, 0], [1, 0.353553390593], [1, 0.646446609407], [0.646446609407, 1], [0.353553390593, 1]], "faces_vertices": [[0, 4, 9], [4, 0, 10], [4, 2, 14], [2, 4, 13], [3, 4, 15], [4, 3, 16], [4, 1, 12], [1, 4, 11], [4, 5, 9], [5, 4, 16], [4, 6, 11], [6, 4, 10], [4, 7, 13], [7, 4, 12], [4, 8, 15], [8, 4, 14], [0, 9, 17], [9, 5, 17], [10, 0, 19], [6, 10, 19], [1, 11, 20], [11, 6, 20], [12, 1, 21], [7, 12, 21], [2, 13, 22], [13, 7, 22], [14, 2, 23], [8, 14, 23], [3, 15, 24], [15, 8, 24], [16, 3, 18], [5, 16, 18]], "edges_vertices": [[0, 4], [4, 2], [3, 4], [4, 1], [4, 5], [4, 6], [4, 7], [4, 8], [0, 9], [4, 9], [5, 9], [4, 10], [0, 10], [6, 10], [1, 11], [4, 11], [6, 11], [4, 12], [1, 12], [7, 12], [2, 13], [4, 13], [7, 13], [4, 14], [2, 14], [8, 14], [3, 15], [4, 15], [8, 15], [4, 16], [3, 16], [5, 16], [9, 17], [0, 17], [17, 5], [16, 18], [5, 18], [18, 3], [10, 19], [0, 19], [19, 6], [11, 20], [6, 20], [20, 1], [12, 21], [1, 21], [21, 7], [13, 22], [7, 22], [22, 2], [14, 23], [8, 23], [23, 2], [15, 24], [3, 24], [24, 8]], "edges_assignment": ["V", "V", "V", "M", "V", "V", "V", "V", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "M", "V", "B", "B", "V", "B", "B", "V", "B", "B", "V", "B", "B", "V", "B", "B", "V", "B", "B", "V", "B", "B", "V", "B", "B"] });
    };
    CreasePattern.prototype.copy = function () {
        this.nodeArrayDidChange();
        this.edgeArrayDidChange();
        this.faceArrayDidChange();
        var g = new CreasePattern();
        g.nodes = [];
        g.edges = [];
        g.faces = [];
        g.boundary = undefined;
        for (var i = 0; i < this.nodes.length; i++) {
            var n = g.addNode(new CreaseNode(g));
            Object.assign(n, this.nodes[i]);
            n.graph = g;
            n.index = i;
        }
        for (var i = 0; i < this.edges.length; i++) {
            var index = [this.edges[i].nodes[0].index, this.edges[i].nodes[1].index];
            var e = g.addEdge(new Crease(g, g.nodes[index[0]], g.nodes[index[1]]));
            Object.assign(e, this.edges[i]);
            e.graph = g;
            e.index = i;
            e.nodes = [g.nodes[index[0]], g.nodes[index[1]]];
        }
        for (var i = 0; i < this.faces.length; i++) {
            var f = new PlanarFace(g);
            g.faces.push(f);
            f.graph = g;
            f.index = i;
            if (this.faces[i] !== undefined) {
                if (this.faces[i].nodes !== undefined) {
                    for (var j = 0; j < this.faces[i].nodes.length; j++) {
                        var nIndex = this.faces[i].nodes[j].index;
                        f.nodes.push(g.nodes[nIndex]);
                    }
                }
                if (this.faces[i].edges !== undefined) {
                    for (var j = 0; j < this.faces[i].edges.length; j++) {
                        var eIndex = this.faces[i].edges[j].index;
                        f.edges.push(g.edges[eIndex]);
                    }
                }
            }
        }
        g.sectors = this.sectors.map(function (sector, i) {
            var gSecEdges = sector.edges.map(function (edge) { return g.edges[edge.index]; }, this);
            var s = new CreaseSector(gSecEdges[0], gSecEdges[1]);
            s.index = i;
            return s;
        }, this);
        g.junctions = this.junctions.map(function (junction, i) {
            var j = new CreaseJunction(undefined);
            j.origin = g.nodes[junction.origin.index];
            j.sectors = junction.sectors.map(function (sector) { return g.sectors[sector.index]; }, this);
            j.edges = junction.edges.map(function (edge) { return g.edges[edge.index]; }, this);
            j.index = i;
            return j;
        }, this);
        g.boundary = this.boundary.copy();
        return g;
    };
    return CreasePattern;
}(PlanarGraph));
!function (t) { if ("object" == typeof exports && "undefined" != typeof module)
    module.exports = t();
else if ("function" == typeof define && define.amd)
    define([], t);
else {
    var i;
    i = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, i.rbush = t();
} }(function () { return function t(i, n, e) { function r(h, o) { if (!n[h]) {
    if (!i[h]) {
        var s = "function" == typeof require && require;
        if (!o && s)
            return s(h, !0);
        if (a)
            return a(h, !0);
        var l = new Error("Cannot find module '" + h + "'");
        throw l.code = "MODULE_NOT_FOUND", l;
    }
    var f = n[h] = { exports: {} };
    i[h][0].call(f.exports, function (t) { var n = i[h][1][t]; return r(n ? n : t); }, f, f.exports, t, i, n, e);
} return n[h].exports; } for (var a = "function" == typeof require && require, h = 0; h < e.length; h++)
    r(e[h]); return r; }({ 1: [function (t, i, n) {
            "use strict";
            function e(t, i) { return this instanceof e ? (this._maxEntries = Math.max(4, t || 9), this._minEntries = Math.max(2, Math.ceil(.4 * this._maxEntries)), i && this._initFormat(i), void this.clear()) : new e(t, i); }
            function r(t, i, n) { if (!n)
                return i.indexOf(t); for (var e = 0; e < i.length; e++)
                if (n(t, i[e]))
                    return e; return -1; }
            function a(t, i) { h(t, 0, t.children.length, i, t); }
            function h(t, i, n, e, r) { r || (r = p(null)), r.minX = 1 / 0, r.minY = 1 / 0, r.maxX = -(1 / 0), r.maxY = -(1 / 0); for (var a, h = i; h < n; h++)
                a = t.children[h], o(r, t.leaf ? e(a) : a); return r; }
            function o(t, i) { return t.minX = Math.min(t.minX, i.minX), t.minY = Math.min(t.minY, i.minY), t.maxX = Math.max(t.maxX, i.maxX), t.maxY = Math.max(t.maxY, i.maxY), t; }
            function s(t, i) { return t.minX - i.minX; }
            function l(t, i) { return t.minY - i.minY; }
            function f(t) { return (t.maxX - t.minX) * (t.maxY - t.minY); }
            function u(t) { return t.maxX - t.minX + (t.maxY - t.minY); }
            function c(t, i) { return (Math.max(i.maxX, t.maxX) - Math.min(i.minX, t.minX)) * (Math.max(i.maxY, t.maxY) - Math.min(i.minY, t.minY)); }
            function m(t, i) { var n = Math.max(t.minX, i.minX), e = Math.max(t.minY, i.minY), r = Math.min(t.maxX, i.maxX), a = Math.min(t.maxY, i.maxY); return Math.max(0, r - n) * Math.max(0, a - e); }
            function d(t, i) { return t.minX <= i.minX && t.minY <= i.minY && i.maxX <= t.maxX && i.maxY <= t.maxY; }
            function x(t, i) { return i.minX <= t.maxX && i.minY <= t.maxY && i.maxX >= t.minX && i.maxY >= t.minY; }
            function p(t) { return { children: t, height: 1, leaf: !0, minX: 1 / 0, minY: 1 / 0, maxX: -(1 / 0), maxY: -(1 / 0) }; }
            function M(t, i, n, e, r) { for (var a, h = [i, n]; h.length;)
                n = h.pop(), i = h.pop(), n - i <= e || (a = i + Math.ceil((n - i) / e / 2) * e, g(t, a, i, n, r), h.push(i, a, a, n)); }
            i.exports = e;
            var g = t("quickselect");
            e.prototype = { all: function () { return this._all(this.data, []); }, search: function (t) { var i = this.data, n = [], e = this.toBBox; if (!x(t, i))
                    return n; for (var r, a, h, o, s = []; i;) {
                    for (r = 0, a = i.children.length; r < a; r++)
                        h = i.children[r], o = i.leaf ? e(h) : h, x(t, o) && (i.leaf ? n.push(h) : d(t, o) ? this._all(h, n) : s.push(h));
                    i = s.pop();
                } return n; }, collides: function (t) { var i = this.data, n = this.toBBox; if (!x(t, i))
                    return !1; for (var e, r, a, h, o = []; i;) {
                    for (e = 0, r = i.children.length; e < r; e++)
                        if (a = i.children[e], h = i.leaf ? n(a) : a, x(t, h)) {
                            if (i.leaf || d(t, h))
                                return !0;
                            o.push(a);
                        }
                    i = o.pop();
                } return !1; }, load: function (t) { if (!t || !t.length)
                    return this; if (t.length < this._minEntries) {
                    for (var i = 0, n = t.length; i < n; i++)
                        this.insert(t[i]);
                    return this;
                } var e = this._build(t.slice(), 0, t.length - 1, 0); if (this.data.children.length)
                    if (this.data.height === e.height)
                        this._splitRoot(this.data, e);
                    else {
                        if (this.data.height < e.height) {
                            var r = this.data;
                            this.data = e, e = r;
                        }
                        this._insert(e, this.data.height - e.height - 1, !0);
                    }
                else
                    this.data = e; return this; }, insert: function (t) { return t && this._insert(t, this.data.height - 1), this; }, clear: function () { return this.data = p([]), this; }, remove: function (t, i) { if (!t)
                    return this; for (var n, e, a, h, o = this.data, s = this.toBBox(t), l = [], f = []; o || l.length;) {
                    if (o || (o = l.pop(), e = l[l.length - 1], n = f.pop(), h = !0), o.leaf && (a = r(t, o.children, i), a !== -1))
                        return o.children.splice(a, 1), l.push(o), this._condense(l), this;
                    h || o.leaf || !d(o, s) ? e ? (n++, o = e.children[n], h = !1) : o = null : (l.push(o), f.push(n), n = 0, e = o, o = o.children[0]);
                } return this; }, toBBox: function (t) { return t; }, compareMinX: s, compareMinY: l, toJSON: function () { return this.data; }, fromJSON: function (t) { return this.data = t, this; }, _all: function (t, i) { for (var n = []; t;)
                    t.leaf ? i.push.apply(i, t.children) : n.push.apply(n, t.children), t = n.pop(); return i; }, _build: function (t, i, n, e) { var r, h = n - i + 1, o = this._maxEntries; if (h <= o)
                    return r = p(t.slice(i, n + 1)), a(r, this.toBBox), r; e || (e = Math.ceil(Math.log(h) / Math.log(o)), o = Math.ceil(h / Math.pow(o, e - 1))), r = p([]), r.leaf = !1, r.height = e; var s, l, f, u, c = Math.ceil(h / o), m = c * Math.ceil(Math.sqrt(o)); for (M(t, i, n, m, this.compareMinX), s = i; s <= n; s += m)
                    for (f = Math.min(s + m - 1, n), M(t, s, f, c, this.compareMinY), l = s; l <= f; l += c)
                        u = Math.min(l + c - 1, f), r.children.push(this._build(t, l, u, e - 1)); return a(r, this.toBBox), r; }, _chooseSubtree: function (t, i, n, e) { for (var r, a, h, o, s, l, u, m;;) {
                    if (e.push(i), i.leaf || e.length - 1 === n)
                        break;
                    for (u = m = 1 / 0, r = 0, a = i.children.length; r < a; r++)
                        h = i.children[r], s = f(h), l = c(t, h) - s, l < m ? (m = l, u = s < u ? s : u, o = h) : l === m && s < u && (u = s, o = h);
                    i = o || i.children[0];
                } return i; }, _insert: function (t, i, n) { var e = this.toBBox, r = n ? t : e(t), a = [], h = this._chooseSubtree(r, this.data, i, a); for (h.children.push(t), o(h, r); i >= 0 && a[i].children.length > this._maxEntries;)
                    this._split(a, i), i--; this._adjustParentBBoxes(r, a, i); }, _split: function (t, i) { var n = t[i], e = n.children.length, r = this._minEntries; this._chooseSplitAxis(n, r, e); var h = this._chooseSplitIndex(n, r, e), o = p(n.children.splice(h, n.children.length - h)); o.height = n.height, o.leaf = n.leaf, a(n, this.toBBox), a(o, this.toBBox), i ? t[i - 1].children.push(o) : this._splitRoot(n, o); }, _splitRoot: function (t, i) { this.data = p([t, i]), this.data.height = t.height + 1, this.data.leaf = !1, a(this.data, this.toBBox); }, _chooseSplitIndex: function (t, i, n) { var e, r, a, o, s, l, u, c; for (l = u = 1 / 0, e = i; e <= n - i; e++)
                    r = h(t, 0, e, this.toBBox), a = h(t, e, n, this.toBBox), o = m(r, a), s = f(r) + f(a), o < l ? (l = o, c = e, u = s < u ? s : u) : o === l && s < u && (u = s, c = e); return c; }, _chooseSplitAxis: function (t, i, n) { var e = t.leaf ? this.compareMinX : s, r = t.leaf ? this.compareMinY : l, a = this._allDistMargin(t, i, n, e), h = this._allDistMargin(t, i, n, r); a < h && t.children.sort(e); }, _allDistMargin: function (t, i, n, e) { t.children.sort(e); var r, a, s = this.toBBox, l = h(t, 0, i, s), f = h(t, n - i, n, s), c = u(l) + u(f); for (r = i; r < n - i; r++)
                    a = t.children[r], o(l, t.leaf ? s(a) : a), c += u(l); for (r = n - i - 1; r >= i; r--)
                    a = t.children[r], o(f, t.leaf ? s(a) : a), c += u(f); return c; }, _adjustParentBBoxes: function (t, i, n) { for (var e = n; e >= 0; e--)
                    o(i[e], t); }, _condense: function (t) { for (var i, n = t.length - 1; n >= 0; n--)
                    0 === t[n].children.length ? n > 0 ? (i = t[n - 1].children, i.splice(i.indexOf(t[n]), 1)) : this.clear() : a(t[n], this.toBBox); }, _initFormat: function (t) { var i = ["return a", " - b", ";"]; this.compareMinX = new Function("a", "b", i.join(t[0])), this.compareMinY = new Function("a", "b", i.join(t[1])), this.toBBox = new Function("a", "return {minX: a" + t[0] + ", minY: a" + t[1] + ", maxX: a" + t[2] + ", maxY: a" + t[3] + "};"); } };
        }, { quickselect: 2 }], 2: [function (t, i, n) {
            "use strict";
            function e(t, i, n, a, h) { for (; a > n;) {
                if (a - n > 600) {
                    var o = a - n + 1, s = i - n + 1, l = Math.log(o), f = .5 * Math.exp(2 * l / 3), u = .5 * Math.sqrt(l * f * (o - f) / o) * (s - o / 2 < 0 ? -1 : 1), c = Math.max(n, Math.floor(i - s * f / o + u)), m = Math.min(a, Math.floor(i + (o - s) * f / o + u));
                    e(t, i, c, m, h);
                }
                var d = t[i], x = n, p = a;
                for (r(t, n, i), h(t[a], d) > 0 && r(t, n, a); x < p;) {
                    for (r(t, x, p), x++, p--; h(t[x], d) < 0;)
                        x++;
                    for (; h(t[p], d) > 0;)
                        p--;
                }
                0 === h(t[n], d) ? r(t, n, p) : (p++, r(t, p, a)), p <= i && (n = p + 1), i <= p && (a = p - 1);
            } }
            function r(t, i, n) { var e = t[i]; t[i] = t[n], t[n] = e; }
            i.exports = e;
        }, {}] }, {}, [1])(1); });
