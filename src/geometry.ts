// Euclidean plane geometry
// primitives and algorithms for intersections, hulls, transformations
// MIT open source license, Robby Kraft

"use strict";

var EPSILON_LOW  = 0.003;
var EPSILON	  = 0.00001;
var EPSILON_HIGH = 0.00000001;
var EPSILON_UI   = 0.05;  // user tap, based on precision of a finger on a screen

////////////////////////////   DATA TYPES   ///////////////////////////
class Tree<T>{
	obj:T;
	parent:Tree<T>;
	children:Tree<T>[];
	constructor(thisObject:T){
		this.obj = thisObject;
		this.parent = undefined;
		this.children = [];
	}
}
//////////////////////////// TYPE CHECKING ////////////////////////////
function isValidPoint(point:XY):boolean{return(point!==undefined&&!isNaN(point.x)&&!isNaN(point.y));}
function isValidNumber(n:number):boolean{return(n!==undefined&&!isNaN(n));}
function pointsSimilar(a:any, b:any, epsilon?:number){
	if(epsilon == undefined){epsilon = EPSILON_HIGH;}
	return epsilonEqual(a.x,b.x,epsilon) && epsilonEqual(a.y,b.y,epsilon);
}
/////////////////////////////// NUMBERS ///////////////////////////////
/** map a number from one range into another */
// function map(input:number, fl1:number, ceil1:number, fl2:number, ceil2:number):number{
// 	return ( (input - fl1) / (ceil1 - fl1) ) * (ceil2 - fl2) + fl2;
// }
/** are 2 numbers similar to each other within an epsilon range. */
function epsilonEqual(a:number, b:number, epsilon?:number):boolean{
	if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
	return ( Math.abs(a - b) <= epsilon );
}
// function formatFloat(num:number, epsilon?:number):number{
// 	var fix = parseFloat((num).toFixed(15));
// 	if(num.toString().length - fix.toString().length > 5){ return fix; }
// 	return parseFloat((num).toFixed(14));
// }
/** will clean up numbers like 15.00000000000032 up to an epsilon range */
function cleanNumber(num:number, decimalPlaces?:number):number{
	if(Math.floor(num) == num || decimalPlaces == undefined){ return num; }
	return parseFloat(num.toFixed(decimalPlaces));
}

/////////////////////////////////////////////////////////////////////////////////
//							2D ALGORITHMS
/////////////////////////////////////////////////////////////////////////////////
/** There are 2 interior angles between 2 absolute angle measurements, from A to B return the clockwise one
 *  This is in the cartesian coordinate system. example: angle PI/2 is along the +Y axis
 * @param {number} angle in radians
 * @param {number} angle in radians
 * @returns {number} clockwise interior angle (from a to b) in radians
 */
function clockwiseInteriorAngleRadians(a:number, b:number):number{
	// this is on average 50 to 100 times faster than clockwiseInteriorAngle
	while(a < 0){ a += Math.PI*2; }
	while(b < 0){ b += Math.PI*2; }
	var a_b = a - b;
	if(a_b >= 0) return a_b;
	return Math.PI*2 - (b - a);
}
function counterClockwiseInteriorAngleRadians(a:number, b:number):number{
	// this is on average 50 to 100 times faster than clockwiseInteriorAngle
	while(a < 0){ a += Math.PI*2; }
	while(b < 0){ b += Math.PI*2; }
	var b_a = b - a;
	if(b_a >= 0) return b_a;
	return Math.PI*2 - (a - b);
}

/////////////////////////////////////////////////////////////////////////////////
//								GEOMETRY
/////////////////////////////////////////////////////////////////////////////////

/** This is a 3x4 matrix: 3x3 for scale and rotation and 3x1 for translation */
class Matrix{
	private a:number; private d:number; private g:number; private tx:number;
	private b:number; private e:number; private h:number; private ty:number;
	private c:number; private f:number; private i:number; private tz:number;
	constructor(a?:number, b?:number, d?:number, e?:number, tx?:number, ty?:number){
		//constructor supports 2D transformations only
		this.a = isValidNumber(a) ? a : 1;
		this.b = isValidNumber(b) ? b : 0;
		this.c = 0;
		this.d = isValidNumber(d) ? d : 0;
		this.e = isValidNumber(e) ? e : 1;
		this.f = 0;
		this.g = 0;
		this.h = 0;
		this.i = 1;
		this.tx = isValidNumber(tx) ? tx : 0;
		this.ty = isValidNumber(ty) ? ty : 0;
		this.tz = 0;
	}
	/** Sets this to be the identity matrix */
	identity(){ this.a = 1; this.b = 0; this.c = 0; this.d = 0; this.e = 1; this.f = 0; this.g = 0; this.h = 0; this.i = 1; this.tx = 0; this.ty = 0; this.tz = 0; return this; }
	/** Returns a new matrix that is the sum of this and the argument. Will not change this or the argument
	 * @returns {Matrix}
	 */
	mult(mat:Matrix):Matrix{
		var r = new Matrix();
		r.a = this.a * mat.a + this.d * mat.b + this.g * mat.c;
		r.d = this.a * mat.d + this.d * mat.e + this.g * mat.f;
		r.g = this.a * mat.g + this.d * mat.h + this.g * mat.i;
		r.tx = this.a * mat.tx + this.d * mat.ty + this.g * mat.tz + this.tx;
		r.b = this.b * mat.a + this.e * mat.b + this.h * mat.c;
		r.e = this.b * mat.d + this.e * mat.e + this.h * mat.f;
		r.h = this.b * mat.g + this.e * mat.h + this.h * mat.i;
		r.ty = this.b * mat.tx + this.e * mat.ty + this.h * mat.tz + this.ty;
		r.c = this.c * mat.a + this.f * mat.b + this.i * mat.c;
		r.f = this.c * mat.d + this.f * mat.e + this.i * mat.f;
		r.i = this.c * mat.g + this.f * mat.h + this.i * mat.i;
		r.tz = this.c * mat.tx + this.f * mat.ty + this.i * mat.tz + this.tz;
		return r;
	}
	transform(point:XY):XY{
		return new XY(point.x * this.a + point.y * this.d + point.z * this.g + this.tx,
					point.x * this.b + point.y * this.e + point.z * this.h + this.ty,
					point.x * this.c + point.y * this.f + point.z * this.i + this.tz);
	}
	translation(vector:XY):Matrix{
		this.identity();
		this.tx = vector.x;
		this.ty = vector.y;
		this.tz = vector.z;
		return this;
	}
	/** Creates a transformation matrix representing a reflection across a line in the XY plane
	 * @returns {Matrix}
	 */
	reflection(line:LineType):Matrix{
		var normal:XY = line.vector().rotate90().normalize();
		var a:number = normal.x;
		var b:number = normal.y;
		//var c:number = normal.z;
		var d:number = line.pointOnLine().dot(normal);
		this.a = 1 - 2*a*a;
		this.d = -2*a*b;
		this.g = 0;//-2*a*c;
		this.tx = 2*a*d;
		this.b = -2*b*a;
		this.e = 1 - 2*b*b;
		this.h = 0;//-2*b*c;
		this.ty = 2*b*d;
		this.c = 0;//-2*c*a;
		this.f = 0;// -2*c*b;
		this.i = 1;// - 2*c*c;
		this.tz = 0;//2*c*d;
		return this;
	}
	/** Creates a transformation matrix representing a rotation around the origin, or a specified line in the XY plane into 3D-space
	 * @returns {Matrix}
	 */
	rotation(angle:number, originOrAxis?:any):Matrix{
		var point:XY = originOrAxis === undefined ? XY.origin : (isValidPoint(originOrAxis) ? new XY(originOrAxis).invert() : (<LineType>originOrAxis).pointOnLine().invert());
		var direction:XY = originOrAxis === undefined || isValidPoint(originOrAxis) ? XY.K : (<LineType>originOrAxis).vector().normalize();
		var cosA:number = Math.cos(angle);
		var sinA:number = Math.sin(angle);
		this.a = cosA + direction.x * direction.x * (1 - cosA);
		this.b = direction.x * direction.y * (1 - cosA) - direction.z * sinA;
		this.c = direction.x * direction.z * (1 - cosA) + direction.y * sinA;
		this.d = direction.y * direction.x * (1 - cosA) + direction.z * sinA;
		this.e = cosA + direction.y * direction.y * (1 - cosA);
		this.f = direction.y * direction.z * (1 - cosA) - direction.x * sinA;
		this.g = direction.z * direction.x * (1 - cosA) - direction.y * sinA;
		this.h = direction.z * direction.y * (1 - cosA) + direction.x * sinA;
		this.i = cosA + direction.z * direction.z * (1 - cosA);
		this.tx = (this.a - 1) * point.x + this.d * point.y + this.c * point.z;
		this.ty = this.b * point.x + (this.e - 1) * point.y + this.h * point.z;
		this.tz = this.c * point.x + this.f * point.y + (this.i - 1) * point.z;
		return this;
	}
	/** Deep-copy the Matrix and return it as a new object
	 * @returns {Matrix}
	 */
	copy():Matrix{
		var m = new Matrix();
		m.a = this.a;   m.d = this.d;   m.g = this.g;   m.tx = this.tx;
		m.b = this.b;   m.e = this.e;   m.h = this.h;   m.ty = this.ty;
		m.c = this.c;   m.f = this.f;   m.i = this.i;   m.tz = this.tz;
		return m;
	}
}
/** The base type for all vector representations, contains numbers x and y with z optional*/
class XY{
	readonly x:number;
	readonly y:number;
	readonly z:number;
	constructor(a?:any, b?:number, c?:number){
		if (isValidPoint(a)){ this.x = a.x; this.y = a.y; this.z = isValidNumber(a.z) ? a.z : 0; }
		else{ this.x = isValidNumber(a) ? a : 0; this.y = isValidNumber(b) ? b : 0; this.z = isValidNumber(c) ? c : 0; }
	}
	equivalent(point:XY, epsilon?:number):boolean{
		if(epsilon == undefined){ epsilon = EPSILON_HIGH; }
		// rect bounding box for now, much cheaper than radius calculation
		return (epsilonEqual(this.x, point.x, epsilon) && epsilonEqual(this.y, point.y, epsilon));
	}
	normalize():XY { var m = this.magnitude(); return this.scale(1/m); }
	dot(vector:XY):number { return this.x * vector.x + this.y * vector.y; }
	cross(vector:XY):number{ return this.x*vector.y - this.y*vector.x; }
	/** There are 2 interior angles between 2 vectors, from A to B return the clockwise one.
	 *  This is in the cartesian coordinate system. example: angle PI/2 is along the +Y axis
	 * @param {XY} vector
	 * @returns {number} clockwise interior angle (from a to b) in radians
	 */
	clockwiseInteriorAngle(vector:XY):number{
		// this is on average 50 to 100 slower faster than clockwiseInteriorAngleRadians
		var angle:number = Math.atan2(vector.cross(this), vector.dot(this));
		if(angle < 0){ angle += Math.PI * 2; }
		return angle;
	}
	counterClockwiseInteriorAngle(vector:XY):number{
		// this is on average 50 to 100 slower faster than clockwiseInteriorAngleRadians
		var angle:number = Math.atan2(this.cross(vector), this.dot(vector));
		if(angle < 0){ angle += Math.PI * 2; }
		return angle;
	}
	/** There are 2 interior angles between 2 vectors, return both, always the smaller first
	 * @param {XY} vector
	 * @returns {number[]} 2 angle measurements between vectors
	 */
	interiorAngles(vector:XY):number[]{
		var interior1:number = this.clockwiseInteriorAngle(vector);
		var interior2:number = Math.PI*2 - interior1;
		if(interior1 < interior2) return [interior1, interior2];
		return [interior2, interior1];
	}
	/** This bisects 2 vectors, returning both smaller and larger outside angle bisections [small,large]
	 * @param {XY} vector
	 * @returns {XY[]} 2 vector angle bisections, the smaller interior angle is always first
	 */
	bisect(vector:XY):XY[]{
		var n1:XY = this.normalize();
		var n2:XY = vector.normalize();
		var n3:XY = n1.invert();
		return [n1.add(n2).normalize(),
			n3.subtract(n2).normalize()];
	}
	magnitude():number { return Math.sqrt(this.dot(this)); }
	distanceTo(a:XY):number{ return a.subtract(this).magnitude(); }
	transform(matrix:Matrix):XY{
		return matrix.transform(this);
	}
	translate(dx:number, dy:number):XY{ return this.add(dx, dy); }
	rotate90():XY { return new XY(-this.y, this.x); }
	rotate180():XY{ return new XY(-this.x, -this.y); }
	rotate270():XY{ return new XY(this.y, -this.x); }
	rotate(angle:number){ return this.transform( new Matrix().rotation(angle) ); }
	lerp(point:XY, pct:number):XY{ var inv=1.0-pct; return new XY(this.x*pct+point.x* inv,this.y*pct+point.y*inv); }
	midpoint(other:XY):XY{ return this.lerp(other, 0.5); }
	reflect(line:LineType):XY{ return this.transform(new Matrix().reflection(line)); }
	scale(magnitude:number):XY{ return new XY(this.x*magnitude, this.y*magnitude); }
	invert():XY{ return this.scale(-1); }
	add(a:any, b?:number):XY{
		if(isValidPoint(a)){ return new XY(this.x+a.x, this.y+a.y); }
		else if(isValidNumber(b)){ return new XY(this.x+a, this.y+b); }
	}
	// todo, outfit all these constructors with flexible parameters like add()
	subtract(point:XY):XY{ return new XY(this.x-point.x, this.y-point.y); }
	multiply(m:XY):XY{ return new XY(this.x*m.x, this.y*m.y); }
	abs():XY{ return new XY(Math.abs(this.x), Math.abs(this.y)); }
	commonX(point:XY, epsilon?:number):boolean{return epsilonEqual(this.x, point.x, epsilon);}
	commonY(point:XY, epsilon?:number):boolean{return epsilonEqual(this.y, point.y, epsilon);}
	copy():XY{ return new XY(this); }
	project(projection?:IProjection):XY
	{
		if (projection === undefined) { return new XY(this.x, this.y); }
		return projection.project(this);
	}

	static readonly origin:XY = new XY(0,0);
	/** unit vector along the x-axis*/
	static readonly I:XY = new XY(1,0);
	/** unit vector along the y-axis*/
	static readonly J:XY = new XY(0,1);
	/** unit vector along the z-axis*/
	static readonly K:XY = new XY(0,0,1);
}
abstract class LineType implements LineType{
	abstract length():number
	abstract pointOnLine():XY
	abstract vector():XY
	perpendicular(line:LineType, epsilon?:number):boolean{ return epsilonEqual(Math.abs(this.vector().normalize().cross(line.vector().normalize())), 1, epsilon); }
	parallel(line:LineType, epsilon?:number):boolean{ return epsilonEqual(this.vector().cross(line.vector()), 0, epsilon); }
	abstract collinear(point:XY, epsilon?:number):boolean
	abstract equivalent(line:LineType, epsilon?:number):boolean
	abstract degenrate(epsilon?:number):boolean
	intersection(line:LineType, epsilon?:number):XY{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		var v0:XY = this.vector();
		var v1:XY = line.vector();
		var denominator0:number = v0.cross(v1);
		var denominator1:number = -denominator0;
		if (epsilonEqual(denominator0, 0, epsilon)) { return undefined; } /* parallel */
		var o0:XY = this.pointOnLine();
		var o1:XY = line.pointOnLine();
		var numerator0:number = o1.subtract(o0).cross(v1);
		var numerator1:number = o0.subtract(o1).cross(v0);
		var t0:number = numerator0 / denominator0;
		var t1:number = numerator1 / denominator1;
		if(this.compFunction(t0, epsilon) && line.compFunction(t1, epsilon)){ return o0.add(v0.scale(t0)); }
		return undefined;
	}
	abstract compFunction(t:number, epsilon?:number):boolean
	reflectionMatrix():Matrix{ return new Matrix().reflection(this); }
	rotationMatrix(angle:number):Matrix{ return new Matrix().rotation(angle, this); }
	abstract nearestPoint(a:any, b?:number):XY
	abstract nearestPointNormalTo(a:any, b?:number):XY
	abstract transform(matrix:Matrix):LineType
	abstract copy():LineType
	//abstract clipWithEdge(edge:Edge, epsilon?:number):LineType
	//abstract clipWithEdges(edges:Edge[], epsilon?:number):LineType
	//abstract clipWithEdgesDetails(edges:Edge[], epsilon?:number):LineType
}
/** 3D line, extending infinitely in both directions, represented by a point and a vector */
class Line extends LineType{
	readonly point:XY;
	readonly direction:XY;
	constructor(a?:any, b?:any, c?:any, d?:number){
		super();
		if(isValidPoint(a)){
			this.point = new XY(a);
			if(isValidPoint(b)){ this.direction = new XY(b); }
			else{ this.direction = new XY(b,c); }
		}
		else{
			this.point = new XY(a, b);
			if(isValidPoint(c)){ this.direction = new XY(c); }
			else{ this.direction = new XY(c,d); }
		}
	}
	rays():[Ray,Ray]{var a = new Ray(this.point, this.direction);return [a, a.flip()];}
	// implements LineType
	length():number{ return Infinity; }
	pointOnLine():XY{ return this.point.copy(); }
	vector():XY{ return this.direction.copy(); }
	collinear(point:XY, epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		if(this.point.equivalent(point, epsilon)){ return true; }
		return epsilonEqual(this.direction.cross(point.subtract(this.point)), 0, epsilon);
	}
	equivalent(line:Line, epsilon?:number):boolean{
		// if lines are parallel and share a point in common
		return this.collinear(line.point, epsilon) && this.parallel(line, epsilon);
	}
	degenrate(epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		return epsilonEqual(this.direction.magnitude(), 0, epsilon);
	}
	compFunction(t:number, epsilon:number):boolean{ return true; }
	nearestPoint(a:any, b?:number):XY{ return this.nearestPointNormalTo(a,b); }
	nearestPointNormalTo(a:any, b?:number):XY{
		var point:XY = new XY(a,b);
		var v = this.direction.normalize();
		var u = new XY(point).subtract(this.point).dot(v);
		return this.point.add(v.scale(u));
	}
	transform(matrix:Matrix):Line{
		// todo: who knows if this works
		return new Line(this.point.transform(matrix), this.direction.transform(matrix));
	}
	copy():Line{ return new Line(this.point, this.direction); }
	bisect(line:Line):Line[]{
		if( this.parallel(line) ){
			return [new Line(this.point.midpoint(line.point), this.direction)];
		}
		else{
			var intersection:XY = this.intersection(line);
			var vectors = [this.direction.bisect(line.direction)[0], this.direction.bisect(line.direction.invert())[0]];
			if(Math.abs(this.direction.cross(vectors[1])) < Math.abs(this.direction.cross(vectors[0]))){
				var swap = vectors[0];	vectors[0] = vectors[1];	vectors[1] = swap;
			}
			return vectors.map(function (el) { return new Line(intersection, el); }, this);
		}
	}
	subsect(line:Line, count:number):Line[]{
		if( this.parallel(line) ){
			var pcts = Array.apply(null, Array(count)).map(function(el,i){return i/count;});
			pcts.shift();
			return pcts.map(function(pct){ return new Line( this.point.lerp(line.point, pct), this.direction); },this);
		}
		else{
			var intersection = this.intersection(line);
			// creates an array of sectors [a, b], by first building array of array [[a1,a2], [b1,b2]]
			// and filtering out the wrong-winding by sorting and locating smaller of the two.
			return [
				[ new Sector(intersection, [intersection.add(this.direction), intersection.add(line.direction)]),
				  new Sector(intersection, [intersection.add(this.direction), intersection.add(line.direction.invert())])
				  ].sort(function(a,b){ return a.angle() - b.angle(); }).shift(),
				[ new Sector(intersection, [intersection.add(line.direction), intersection.add(this.direction)]),
				  new Sector(intersection, [intersection.add(line.direction), intersection.add(this.direction.invert())])
				  ].sort(function(a,b){ return a.angle() - b.angle(); }).shift()
			].map(function(sector){ return sector.subsect(count); },this)
				.reduce(function(prev, curr){ return prev.concat(curr); },[])
				.map(function(ray){ return new Line(ray.origin, ray.direction); },this);
		}
	}

	//Should these by static methods?
	static readonly xAxis:Line = new Line(XY.origin, XY.I);
	static readonly yAxis:Line = new Line(XY.origin, XY.J);
}
/** 3D line, extending infinitely in one direction, represented by a point and a vector */
class Ray extends LineType{
	readonly origin:XY;
	readonly direction:XY;
	constructor(a?:any, b?:any, c?:any, d?:number){
		super();
		if(isValidPoint(a)){
			this.origin = new XY(a);
			if(isValidPoint(b)){ this.direction = new XY(b); }
			else{ this.direction = new XY(b,c); }
		}
		else{
			this.origin = new XY(a, b);
			if(isValidPoint(c)){ this.direction = new XY(c); }
			else{ this.direction = new XY(c,d); }
		}
	}
	// implements LineType
	length():number{return Infinity;}
	pointOnLine():XY{return this.origin.copy();}
	vector():XY{return this.direction.copy();}
	collinear(point:XY, epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		var pOrigin = new XY(point).subtract(this.origin);
		var dot = pOrigin.dot(this.direction);
		if(dot < -epsilon){ return false; }  // point is behind the ray's origin
		var cross = pOrigin.cross(this.direction);
		return epsilonEqual(cross, 0, epsilon);
	}
	equivalent(ray:Ray, epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		return (this.origin.equivalent(ray.origin, epsilon) &&
				this.direction.normalize().equivalent(ray.direction.normalize(), epsilon));
	}
	degenrate(epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		return epsilonEqual(this.direction.magnitude(), 0, epsilon);
	}
	compFunction(t:number, epsilon:number):boolean{ return t >= -epsilon; }
	nearestPoint(a:any, b?:number):XY{
		var answer = this.nearestPointNormalTo(a,b);
		if(answer !== undefined){ return answer; }
		return this.origin;
	}
	nearestPointNormalTo(a:any, b?:number):XY{
		var point:XY = new XY(a,b);
		var v = this.direction.normalize();
		var u = new XY(point).subtract(this.origin).dot(v);
		// todo: did I guess right? < 0, and not > 1.0
		if(u < 0){ return undefined; }
		return this.origin.add(v.scale(u));
	}
	transform(matrix:Matrix):Ray{
		// todo: who knows if this works
		return new Ray(this.origin.transform(matrix), this.direction.transform(matrix));
	}
	copy():Ray{return new Ray(this.origin, this.direction); }
	// additional methods
	flip():Ray{ return new Ray(this.origin, this.direction.invert()); }
	/** this returns undefined if ray and edge don't intersect
	 * edge.nodes[0] is always the ray.origin
	 */
	clipWithEdge(edge:Edge, epsilon?:number):Edge{
		var intersect = this.intersection(edge, epsilon);
		if(intersect === undefined){ return undefined; }
		return new Edge(this.origin, intersect);
	}
	/** this returns array of edges, sorted by shortest to longest */
	clipWithEdges(edges:Edge[], epsilon?:number):Edge[]{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		return edges
			.map(function(edge:Edge){ return this.clipWithEdge(edge); }, this)
			.filter(function(edge){ return edge !== undefined; })
			.map(function(edge){ return {edge:edge, length:edge.length()}; })
			.filter(function(el){ return el.length > epsilon})
			.sort(function(a,b){ return a.length - b.length; })
			.map(function(el){ return el.edge })
	}
	intersectionsWithEdges(edges:Edge[], epsilon?:number):XY[]{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		return edges
			.map(function(edge:Edge){ return this.intersection(edge, epsilon); }, this)
			.filter(function(point){ return point !== undefined; },this)
			.map(function(point){ return {point:point, length:point.distanceTo(this.origin)}; },this)
			.sort(function(a,b){ return a.length - b.length; })
			.map(function(el){ return el.point },this);
	}
	clipWithEdgesDetails(edges:Edge[], epsilon?:number):{edge:Edge,intersection:Edge}[]{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		return edges
			.map(function(edge:Edge){ return {'edge':this.clipWithEdge(edge), 'intersection':edge } },this)
			.filter(function(el){ return el.edge !== undefined; })
			.map(function(el){ return {
				'edge':el.edge,
				'intersection':el.intersection,
				'length':el.edge.length()}; })
			.filter(function(el){ return el.length > epsilon; })
			.sort(function(a,b){ return a.length - b.length; })
			.map(function(el){ return {edge:el.edge,intersection:el.intersection}; })
	}
}
/** 3D finite line, bounded and defined by two endpoints */
class Edge extends LineType{
	readonly nodes:[XY,XY];
	// a, b are points, or
	// (a,b) point 1 and (c,d) point 2, each x,y
	constructor(a:any, b?:any, c?:any, d?:number){
		super();
		if(isValidPoint(a)){
			if(isValidPoint(b)){this.nodes = [new XY(a), new XY(b)]; }
			else{  [new XY(a), new XY(b,c)]; }
		}
		else if(isValidPoint(c)){ this.nodes = [new XY(a,b), new XY(c)]; }
		else if(isValidNumber(d)){ this.nodes = [new XY(a,b), new XY(c,d)]; }
		else if(a.nodes !== undefined){this.nodes = [new XY(a.nodes[0]), new XY(a.nodes[1])];}
	}
	// implements LineType
	length():number{ return this.nodes[0].distanceTo(this.nodes[1]); }
	pointOnLine():XY{ return this.nodes[0].copy(); }
	vector(originNode?:XY):XY{
		if(originNode === undefined || this.nodes[0].equivalent(originNode)){
			return this.nodes[1].subtract(this.nodes[0]);
		}
		return this.nodes[0].subtract(this.nodes[1]);
	}
	collinear(point:XY, epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		var l0 = new Edge(point, this.nodes[0]).length();
		var l1 = new Edge(point, this.nodes[1]).length();
		return epsilonEqual(this.length() - l0 - l1, 0, epsilon);
	}
	equivalent(edge:Edge, epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		return ((this.nodes[0].equivalent(edge.nodes[0],epsilon) &&
				 this.nodes[1].equivalent(edge.nodes[1],epsilon)) ||
				(this.nodes[0].equivalent(edge.nodes[1],epsilon) &&
				 this.nodes[1].equivalent(edge.nodes[0],epsilon)) );
	}
	degenrate(epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		return this.nodes[0].equivalent(this.nodes[1], epsilon);
	}
	compFunction(t:number, epsilon:number):boolean{ return t >= -epsilon && t <= 1 + epsilon; }
	nearestPoint(a:any, b?:number):XY{
		var answer = this.nearestPointNormalTo(a,b);
		if(answer !== undefined){ return answer; }
		var point:XY = new XY(a,b);
		return this.nodes
			.map(function(el){ return {point:el,distance:el.distanceTo(point)}; },this)
			.sort(function(a,b){ return a.distance - b.distance; })
			.shift()
			.point;
	}
	nearestPointNormalTo(a:any, b?:number):XY{
		var point:XY = new XY(a,b);
		var p = this.nodes[0].distanceTo(this.nodes[1]);
		var u = new XY(point).subtract(this.nodes[0]).dot(this.nodes[1].subtract(this.nodes[0])) / Math.pow(p,2);
		if(u < 0 || u > 1.0){ return undefined; }
		return this.nodes[0].add(this.nodes[1].subtract(this.nodes[0]).scale(u));
	}
	transform(matrix:Matrix):Edge{
		return new Edge(this.nodes[0].transform(matrix), this.nodes[1].transform(matrix));
	}
	copy():Edge{ return new Edge(this.nodes[0], this.nodes[1]); }
	// additional methods
	midpoint():XY{ return this.nodes[0].midpoint(this.nodes[1]); }
	perpendicularBisector():Line{ return new Line(this.midpoint(), this.vector().rotate90()); }
	infiniteLine():Line{ return new Line(this.nodes[0], this.nodes[1].subtract(this.nodes[0])); }
}
/** A path of node-adjacent edges defined by a set of nodes. */
class Polyline{
	nodes:XY[];

	constructor(){ this.nodes = []; }

	edges():Edge[]{
		var result = [];
		for(var i = 0; i < this.nodes.length-1; i++){
			result.push( new Edge(this.nodes[i], this.nodes[i+1]) );
		}
		return result;
	}

	rayReflectRepeat(ray:Ray, intersectable:Edge[], target?:XY):Polyline{
		const REFLECT_LIMIT = 666;
		var clips:{edge:Edge,intersection:Edge}[] = [];
		var firstClips:{edge:Edge,intersection:Edge}[] = ray.clipWithEdgesDetails(intersectable);
		if (firstClips.length == 0){ return this; }
		// special case: original ray directed toward target
		if(target !== undefined &&
		   epsilonEqual(ray.direction.cross(target.subtract(ray.origin)), 0, EPSILON_HIGH)){
			if(firstClips.length === 0 ||
			   ray.origin.distanceTo(target) < firstClips[0].edge.length()){
				this.nodes = [ray.origin, target];
				return this;
			}
		}
		clips.push( firstClips[0] );
		var i = 0;
		while(i < REFLECT_LIMIT){
			// build new ray, reflected across edge
			var prevClip:{edge:Edge,intersection:Edge} = clips[clips.length-1];
			// if(prevClip.edge.nodes[0].equivalent(prevClip.intersection.nodes[0]) ||
			//	prevClip.edge.nodes[0].equivalent(prevClip.intersection.nodes[1]) ||
			//	prevClip.edge.nodes[1].equivalent(prevClip.intersection.nodes[0]) ||
			//	prevClip.edge.nodes[1].equivalent(prevClip.intersection.nodes[1])){ break; }
			var reflection = prevClip.intersection.reflectionMatrix();
			var newRay = new Ray(prevClip.edge.nodes[1], prevClip.edge.nodes[0].transform(reflection).subtract(prevClip.edge.nodes[1]));
			// get next edge intersections
			var newClips:{edge:Edge,intersection:Edge}[] = newRay.clipWithEdgesDetails(intersectable);
			if(target !== undefined &&
			   epsilonEqual(newRay.direction.cross(target.subtract(newRay.origin)), 0, EPSILON_HIGH)){
				clips.push({edge:new Edge(newRay.origin, target), intersection:undefined});
				break;
			}
			if(newClips.length === 0 || newClips[0] === undefined){ break; }
			clips.push( newClips[0] );
			i++;
		}
		this.nodes = clips.map(function(el){ return el.edge.nodes[0]; });
		this.nodes.push( clips[clips.length-1].edge.nodes[1] );
		return this;
	}
}
/** the base class for all 2D polygon objects */
abstract class PolygonType {
	abstract vertices():XY[]
	coincident(point:XY, inside?:boolean, onEdge?:boolean, epsilon?:number):boolean {
		if (inside == undefined) { inside = true; }
		if (onEdge == undefined) { onEdge = true; }
		if (epsilon == undefined) { epsilon = 0; }

		var useEdges:boolean = this.hasOwnProperty('edges');
		var array:any[] = undefined;
		if (useEdges) { array = this['edges']; }
		else { array = this.vertices(); }
		if (array.length == 0) { return false; }

		var ray:Ray = undefined;
		var isInside:boolean = inside;
		for (var i= 0; i < array.length; i++) {
			var edge:Edge = useEdges ? array[i] : new Edge(array[i], array[i % array.length]);
			// if the point lies on the edge it is not contained. unless explicitly specified
			if (edge.collinear(point, epsilon)) { return onEdge; }
			if (!inside){ continue; }
			// a point is inisde the polygon if any ray from that point intersects an odd number of edges
			if (i == 0/*ray === undefined*/) {
				//define a ray that runs from the point passing through the middle of the first edge
				ray = new Ray(point, edge.midpoint().subtract(point));
			}
			else {
				var intersection:XY = ray.intersection(edge);
				//if the intersection occurs at a vertex, only count intersections with the first vertex of each edge
				//to avoid double counting
				if (intersection !== undefined && !intersection.equivalent(edge.nodes[1], epsilon)) { isInside = !isInside; }
			}
		}
		return isInside;
	}
	/** Tests whether or not a point is contained inside a polygon, or optionally on the perimeter
	 * @returns {boolean} whether the point is inside the polygon or not
	 * @example
	 * var isInside = polygon.contains( {x:0.5, y:0.5} )
	 */
	contains(point:XY, epsilon?:number):boolean{ return this.coincident(point, true, false, epsilon); }
	/** returns true if the provided point lies on the perimeter of the polygon, within a specified tolerance*/
	liesOnEdge(point:any, epsilon?:number):boolean { if(epsilon === undefined){ epsilon = EPSILON_HIGH; } return this.coincident(point, false, true, epsilon); }
	/** Calculates the signed area of a polygon. This requires the polygon be non-intersecting.
	 * @returns {number} the area of the polygon
	 * @example
	 * var area = polygon.signedArea()
	 */
	signedArea(vertices?:XY[]):number {
		if (vertices === undefined) { vertices = this.vertices(); }
		return 0.5 * vertices.map(function (el:XY, i:number) {
			var nextEl:XY = vertices[(i + 1) % vertices.length];
			return el.cross(nextEl);
		}, this)
			.reduce(function (prev:number, cur:number) { return prev + cur; }, 0);
	}
	/** Calculates the centroid or the center of mass of the polygon.
	 * @returns {XY} the location of the centroid
	 * @example
	 * var centroid = polygon.centroid()
	 */
	centroid(vertices?:XY[]):XY {
		if (vertices === undefined) {
			vertices = this.vertices();
		}
		return vertices.map(function (el:XY, i:number) {
			var nextEl:XY = vertices[(i + 1) % vertices.length];
			var mag:number = el.cross(nextEl);
			return el.add(nextEl).scale(mag);
		}, this)
			.reduce(function (prev:XY, current:XY) { return prev.add(current); }, new XY())
			.scale(1/(6 * this.signedArea(vertices)));
	}
	/** Calculates the center of the bounding box made by the edges of the polygon.
	 * @returns {XY} the location of the center of the bounding box
	 * @example
	 * var boundsCenter = polygon.center()
	 */
	center(vertices?:XY[]):XY {
		if (vertices === undefined) {
			vertices = this.vertices();
		}
		// this is not an average / means
		var xMin:number = Infinity, xMax:number = -Infinity, yMin:number = Infinity, yMax:number = -Infinity;
		for (var i:number = 0; i < vertices.length; i++) {
			if (vertices[i].x > xMax) {
				xMax = vertices[i].x;
			}
			if (vertices[i].x < xMin) {
				xMin = vertices[i].x;
			}
			if (vertices[i].y > yMax) {
				yMax = vertices[i].y;
			}
			if (vertices[i].y < yMin) {
				yMin = vertices[i].y;
			}
		}
		return new XY((xMax - xMin) * 0.5, (yMax - yMin) * 0.5);
	}
	/** This compares two polygons by checking their nodes are the same, and in the same order, regardless of chirality.
	 * @returns {boolean} whether two polygons are equivalent or not
	 * @example
	 * var equivalent = polygon.equivalent(anotherPolygon)
	 */
	equivalent(polygon:PolygonType, epsilon?:number):boolean {
		var vertices1:XY[] = this.vertices();
		var vertices2:XY[] = polygon.vertices();
		// quick check, if number of vertices differs, can't be equivalent
		if (vertices2.length != vertices1.length) { return false; }
		//find if the first vertex has an equivalent
		var i0s:number[] = [];
		vertices2.forEach(function (v:XY, i:number) { if (v.equivalent(vertices1[0], epsilon)) { i0s.push(i); } }, this);
		if (i0s.length == 0) { return false; }
		do {
			//check both clockwise and anticlockwise orientations
			var i0:number = i0s.shift();
			var equivalent:boolean = true;
			for (var i:number = 1; i < vertices1.length; ++i) {
				var iMod:number = (i0 + i) % vertices1.length;
				if (vertices1[i].equivalent(vertices2[iMod], epsilon)) {
					equivalent = false;
					break;
				}
			}
			if (!equivalent) {
				equivalent = true;
				for (i = vertices1.length - 1; i > 0; --i) {
					iMod = (i0 + i) % vertices1.length;
					if (vertices1[i].equivalent(vertices2[iMod], epsilon)) {
						equivalent = false;
						break;
					}
				}
			}
			if (equivalent) { return true; }
		} while (i0s.length);
		return false;
	}
	/** returns true if all vertices of the polygon are co-linear within a specified tolerance*/
	degenerate(epsilon?:number) { return epsilonEqual(this.signedArea(), 0, epsilon); }
	/** Apply a matrix transform to this polygon by transforming the location of its vertices.
	 * @example
	 * polygon.transform(matrix)
	 */
	transform(matrix:Matrix):PolygonType {
		var p:Polygon = new Polygon();
		p.nodes = this.vertices().map(function (v:XY) {
			return v.transform(matrix);
		}, this);
		return p;
	}
	/** returns true if all interior angles of the polygon are less than 180 degrees*/
	convex():boolean {
		//TODO: implement this!
		return undefined;
	}
	/** Calculates the bounding box made by the projection of the edges of the polygon.
	 * @returns {Rect} the bounding box of the polygon
	 * @example
	 * var bounds = polygon.minimumRect()
	 */
	minimumRect():Rect {
		var minX:number = Infinity, maxX:number = -Infinity, minY:number = Infinity, maxY:number = -Infinity;
		this.vertices().forEach(function (el:XY) {
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
	}
	/** returns an equivalent polygon*/
	copy():PolygonType {
		var p:Polygon = new Polygon();
		p.nodes = this.vertices().map(function (v:XY) {
			return v.copy();
		}, this);
		return p;
	}
}
/** A rectilinear space defined by width and height vectors and one corner of the rectangle */
class Rect extends PolygonType{
	origin:XY;
	size:{width:number, height:number};
	constructor(a:any,b?:number,c?:number,d?:number){
		super();
		// a is another Rect, or
		// a is point and c, d are width and height respectively, or
		// (a,b) point and c, d are width and height respectively
		if (a instanceof Rect){
			this.origin = a.origin.copy();
			this.size = {'width':a.size.width, 'height':a.size.height};
		}
		if (isValidPoint(a)) {
			this.origin = new XY(a);
			this.size = {'width':b, 'height':c};
		}
		else {
			this.origin = new XY(a, b);
			this.size = {'width':c, 'height':d};
		}
	}
	// implements PolygonType
	vertices():XY[]{ return [this.origin.copy(), new XY(this.origin.x + this.size.width, this.origin.y), new XY(this.origin.x + this.size.width, this.origin.y + this.size.height), new XY(this.origin.x, this.origin.y + this.size.height)];	}
	//override for performance benefit
	contains(point:XY, epsilon?:number):boolean{
		if(epsilon == undefined){ epsilon = 0; }
		return point.x > this.origin.x - epsilon &&
		       point.y > this.origin.y - epsilon &&
		       point.x < this.origin.x + this.size.width + epsilon &&
		       point.y < this.origin.y + this.size.height + epsilon;
	}
	square():boolean{ return epsilonEqual(this.size.width, this.size.height); }
}
/** A verbose representation of a triangle containing points, edges, sectors (interior angles), and its circumcenter */
class Triangle extends PolygonType{
	points:[XY,XY,XY];
	edges:[Edge, Edge, Edge];
	circumcenter:XY;
	sectors:[Sector,Sector,Sector];
	constructor(points:[XY,XY,XY], circumcenter?:XY){
		super();
		this.points = points;
		this.edges = <[Edge, Edge, Edge]>this.points.map(function(el,i){
			var nextEl = this.points[ (i+1)%this.points.length ];
			return new Edge(el, nextEl);
		},this);
		this.sectors = <[Sector,Sector,Sector]>this.points.map(function(el,i){
			var prevI = (i+this.points.length-1)%this.points.length;
			var nextI = (i+1)%this.points.length;
			return new Sector(el, [this.points[prevI], this.points[nextI]]);
		},this);
		this.circumcenter = circumcenter;
		if(circumcenter === undefined){
			// TODO: calculate circumcenter
		}
	}
	// implements PolygonType
	vertices():XY[] { return this.points.map(function(el:XY){ return el.copy(); }); }
	// additional methods
	angles():[number,number,number]{
		return <[number,number,number]>this.points.map(function(p,i){
			var prevP = this.points[(i+this.points.length-1)%this.points.length];
			var nextP = this.points[(i+1)%this.points.length];
			return nextP.subtract(p).clockwiseInteriorAngle(prevP.subtract(p));
		},this);
	}
	isAcute():boolean{
		var a = this.angles();
		for(var i = 0; i < a.length; i++){if(a[i] > Math.PI*0.5){return false;}}
		return true;
	}
	isObtuse():boolean{
		var a = this.angles();
		for(var i = 0; i < a.length; i++){if(a[i] > Math.PI*0.5){return true;}}
		return false;
	}
	isRight():boolean{
		var a = this.angles();
		for(var i = 0; i < a.length; i++){if(epsilonEqual(a[i],Math.PI*0.5)){return true;}}
		return false;
	}
	//redefine for performance benefit rather than using the base class method
	//TODO: seems to return true for boundary points - is this intentional?
	//pointInside(p:XY):boolean { return this.coincident(p, true, true); }
	pointInside(p:XY):boolean{
		for(var i = 0; i < this.points.length; i++){
			var p0 = this.points[i];
			var p1 = this.points[(i+1)%this.points.length];
			var cross = p1.subtract(p0).cross(p.subtract(p0));
			if (cross < 0) return false;
		}
		return true;
	}
}
/** A circle defined by its center point and radius length */
class Circle{
	center:XY;
	radius:number;
	constructor(a:any, b:any, c?:any){
		// (a,b) point and c is radius
		// or a is point, b is radius and c is normal vector for teh plane the circle lies on (defaultes to z-axis)
		if (isValidNumber(c)) {
			this.center = new XY(a, b);
			this.radius = Math.abs(c);
		}
		else {
			this.center = new XY(a);
			this.radius = Math.abs(b);
		}
	}
	intersection(line:LineType):XY[]{
		var p0:XY = line.pointOnLine();
		var p1:XY = p0.add(line.vector());
		var r_squared =  Math.pow(this.radius,2);
		var v1:XY = p0.subtract(this.center);
		var v2:XY = p1.subtract(this.center);
		var dv:XY = v2.subtract(v1);
		var dr_squared = dv.dot(dv);
		var D = v1.cross(v2);
		function sgn(x:number){ if(x < 0){return -1;} return 1; }
		var x1 = (D*dv.y + sgn(dv.y)*dv.x*Math.sqrt(r_squared*dr_squared - (D*D)))/(dr_squared);
		var x2 = (D*dv.y - sgn(dv.y)*dv.x*Math.sqrt(r_squared*dr_squared - (D*D)))/(dr_squared);
		var y1 = (-D*dv.x + Math.abs(dv.y)*Math.sqrt(r_squared*dr_squared - (D*D)))/(dr_squared);
		var y2 = (-D*dv.x - Math.abs(dv.y)*Math.sqrt(r_squared*dr_squared - (D*D)))/(dr_squared);
		var intersections = [];
		if(!isNaN(x1)){ intersections.push( new XY(x1 + this.center.x, y1 + this.center.y) ); }
		if(!isNaN(x2)){ intersections.push( new XY(x2 + this.center.x, y2 + this.center.y) ); }
		return intersections;
	}
}
/** The boundary of a polygon defined by a sequence of nodes */
class Polygon extends PolygonType{
	nodes:XY[];
	constructor(){ super(); this.nodes = []; }
	// implements PolygonType
	vertices():XY[]{ return this.nodes.map(function(el){ return el.copy(); }); }
	//TODO: This is counting on the polygon to be convex
	//the base class method should work for any polygon, but may be less efficient
	contains(point:XY):boolean{
    var isInside = false;
		// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
		for(var i = 0, j = this.nodes.length - 1; i < this.nodes.length; j = i++) {
			if( (this.nodes[i].y > point.y) != (this.nodes[j].y > point.y) &&
			point.x < (this.nodes[j].x - this.nodes[i].x) * (point.y - this.nodes[i].y) / (this.nodes[j].y - this.nodes[i].y) + this.nodes[i].x ) {
				isInside = !isInside;
			}
		}
		return isInside;
	}
}
/** An ordered set of node-adjacent edges defining the boundary of a convex space */
//TODO: extend ConvexPolygon from polygon?
class ConvexPolygon extends PolygonType{
	edges:Edge[];
	constructor(){ super(); this.edges = []; }
	nodes():XY[]{
		return this.edges.map(function(el,i){
			var nextEl = this.edges[ (i+1)%this.edges.length ];
			if(el.nodes[0].equivalent(nextEl.nodes[0]) || el.nodes[0].equivalent(nextEl.nodes[1])){
				return el.nodes[1];
			}
			return el.nodes[0];
		},this);
	}
	// implements PolygonType
	vertices() { return this.nodes(); }
	//redefine for performance benefit rather than using the base class method
	//TODO: seems to return true for boundary points - is this intentional?
	//contains(p:XY):boolean { return this.coincident(p, true, true); }
	contains(p:XY):boolean{
		for(var i = 0; i < this.edges.length; i++){
			var a = this.edges[i].nodes[1].subtract(this.edges[i].nodes[0]);
			var b = p.subtract(this.edges[i].nodes[0]);
			if(a.cross(b) < 0){ return false; }
		}
		return true;
	}
	// additional methods
	clipEdge(edge:Edge):Edge{
		var intersections = this.edges
			.map(function(el){ return edge.intersection(el); });
		//remove duplicate intersections at nodes
		intersections = intersections.filter(function(el, i){
				if (el === undefined){ return false}
				for(var j = 0; j<i; ++j){ if(intersections[j] !== undefined && el.equivalent(intersections[j])){ return false; }}
				return true;
			});
		switch(intersections.length){
			case 0:
				//if(this.contains(edge.nodes[0])){ return edge; } // completely inside
				if(this.coincident(edge.nodes[0], true, false)){ return edge; } // completely inside
				return undefined;  // completely outside
			case 1:
				//if(this.contains(edge.nodes[0])){
				if(this.coincident(edge.nodes[0], true, false)){
					return new Edge(edge.nodes[0], intersections[0]);
				}
				//if(this.contains(edge.nodes[1])){
				if(this.coincident(edge.nodes[1], true, false)){
					return new Edge(edge.nodes[1], intersections[0]);
				}
				return new Edge(intersections[0], intersections[0]); // degenerate edge
			case 2: return new Edge(intersections[0], intersections[1]);
		}
	}
	clipLine(line:Line):Edge{
		var intersections = this.edges
			.map(function(el){ return line.intersection(el); });
		//remove duplicate intersections at nodes
		intersections = intersections.filter(function(el, i){
				if (el === undefined){ return false}
				for(var j = 0; j<i; ++j){ if(intersections[j] !== undefined && el.equivalent(intersections[j])){ return false; }}
				return true;
			});
		switch(intersections.length){
			case 0: return undefined;
			case 1: return new Edge(intersections[0], intersections[0]); // degenerate edge
			case 2: return new Edge(intersections[0], intersections[1]);
		}
	}
	clipRay(ray:Ray):Edge{
		var intersections = this.edges
			.map(function(el){ return ray.intersection(el); });
		//remove duplicate intersections at nodes
		intersections = intersections.filter(function(el, i){
				if (el === undefined){ return false}
				for(var j = 0; j<i; ++j){ if(intersections[j] !== undefined && el.equivalent(intersections[j])){ return false; }}
				return true;
			});
		switch(intersections.length){
			case 0: return undefined;
			case 1:
				//if(this.contains(ray.origin)){
				if(this.coincident(ray.origin, true, false)){
					return new Edge(ray.origin, intersections[0]);
				}
			return new Edge(intersections[0], intersections[0]); // degenerate edge
			case 2: return new Edge(intersections[0], intersections[1]);
		}
	}
	setEdgesFromPoints(points:XY[]):ConvexPolygon{
		this.edges = points.map(function(el,i){
			var nextEl = points[ (i+1)%points.length ];
			return new Edge(el, nextEl);
		},this);
		return this;
	}
	regularPolygon(sides:number, scale?:number, origin?:XY):ConvexPolygon{
		if (scale === undefined) { scale = 1; }
		if (origin === undefined) { origin = XY.origin; }
		var halfwedge = 2*Math.PI/sides * 0.5;
		var radius = Math.cos(halfwedge) * scale;
		var points = [];
		for(var i = 0; i < sides; i++){
			var a = -2 * Math.PI * i / sides + halfwedge;
			var x = origin.x + cleanNumber(radius * Math.sin(a), 14);
			var y = origin.y + cleanNumber(radius * Math.cos(a), 14);
			points.push( new XY(x, y) ); // align point along Y
		}
		this.setEdgesFromPoints(points);
		return this;
	}
	convexHull(points:XY[]):ConvexPolygon{
		// validate input
		if(points === undefined || points.length === 0){ this.edges = []; return undefined; }
		// # points in the convex hull before escaping function
		var INFINITE_LOOP = 10000;
		// sort points by x and y
		var sorted = points.slice().sort(function(a,b){
			if(epsilonEqual(a.y, b.y, EPSILON_HIGH)){ return a.x - b.x; }
			return a.y - b.y;
		});
		var hull:XY[] = [];
		hull.push(sorted[0]);
		// the current direction the perimeter walker is facing
		var ang = 0;
		var infiniteLoop = 0;
		do{
			infiniteLoop++;
			var h = hull.length-1;
			var angles = sorted
				// remove all points in the same location from this search
				.filter(function(el){
					return !(epsilonEqual(el.x, hull[h].x, EPSILON_HIGH) && epsilonEqual(el.y, hull[h].y, EPSILON_HIGH)) })
				// sort by angle, setting lowest values next to "ang"
				.map(function(el){
					var angle = Math.atan2(hull[h].y - el.y, hull[h].x - el.x);
					while(angle < ang){ angle += Math.PI*2; }
					return {node:el, angle:angle, distance:undefined}; })  // distance to be set later
				.sort(function(a,b){return (a.angle < b.angle)?-1:(a.angle > b.angle)?1:0});
			if(angles.length === 0){ this.edges = []; return undefined; }
			// narrowest-most right turn
			var rightTurn = angles[0];
			// collect all other points that are collinear along the same ray
			angles = angles.filter(function(el){ return epsilonEqual(rightTurn.angle, el.angle, EPSILON_LOW); })
			// sort collinear points by their distances from the connecting point
			.map(function(el){
				var distance = Math.sqrt(Math.pow(hull[h].x-el.node.x, 2) + Math.pow(hull[h].y-el.node.y, 2));
				el.distance = distance;
				return el;})
			// (OPTION 1) exclude all collinear points along the hull
			.sort(function(a,b){return (a.distance < b.distance)?1:(a.distance > b.distance)?-1:0});
			// (OPTION 2) include all collinear points along the hull
			// .sort(function(a,b){return (a.distance < b.distance)?-1:(a.distance > b.distance)?1:0});
			// if the point is already in the convex hull, we've made a loop. we're done
			// if(contains(hull, angles[0].node)){
			if(hull.filter(function(el){return el === angles[0].node; }).length > 0){
				return this.setEdgesFromPoints(hull);
			}
			// add point to hull, prepare to loop again
			hull.push(angles[0].node);
			// update walking direction with the angle to the new point
			ang = Math.atan2( hull[h].y - angles[0].node.y, hull[h].x - angles[0].node.x);
		}while(infiniteLoop < INFINITE_LOOP);
		this.edges = [];
		return undefined;
	}
	/** deep copy this object and all its contents */
	copy():ConvexPolygon{
		var p = new ConvexPolygon();
		p.edges = this.edges.map(function(e:Edge){
			return new Edge(e.nodes[0].x, e.nodes[0].y, e.nodes[1].x, e.nodes[1].y);
		});
		return p;
	}
}
/** a Sector is defined by three nodes connecting two adjacent edges (one common node) */
class Sector{
	// the node in common with the edges
	origin:XY;
	// the indices of these 2 nodes directly correlate to 2 edges' indices
	endPoints:[XY,XY];
	// angle counter-clockwise from endpoint 0 to 1
	constructor(origin:XY, endpoints:[XY,XY]){
		this.origin = origin;
		this.endPoints = endpoints;
	}
	vectors():[XY,XY]{
		return <[XY,XY]>this.endPoints.map(function(el){
			return el.subtract(this.origin);
		},this);
	}
	/** the interior angle is measured clockwise from endpoint 0 to 1  */
	angle():number{
		var vectors = this.vectors();
		return vectors[0].counterClockwiseInteriorAngle(vectors[1]);
	}
	bisect():Ray{
		var vectors = this.vectors();
		return new Ray(this.origin, vectors[1].bisect(vectors[0])[0]);
	}
	subsect(divisions:number):Ray[]{
		if(divisions == undefined || divisions < 2){ throw "subsect() requires number parameter > 1"; }
		var angles = this.vectors().map(function(el){ return Math.atan2(el.y, el.x); });
		while(angles[0] < 0){ angles[0] += Math.PI*2; }
		while(angles[1] < 0){ angles[1] += Math.PI*2; }
		var interior = counterClockwiseInteriorAngleRadians(angles[0], angles[1]);
		var rays = [];
		for(var i = 1; i < divisions; i++){
			var angle = angles[0] + interior * (i/divisions);
			rays.push(new Ray(this.origin, new XY(Math.cos(angle), Math.sin(angle))));
		}
		return rays;
	}
	equivalent(a:Sector):boolean{
		return a.origin.equivalent(this.origin) &&
			   a.endPoints[0].equivalent(this.endPoints[0]) &&
			   a.endPoints[1].equivalent(this.endPoints[1]);
	}
	/** a sector contains a point if it is between the two edges in counter-clockwise order */
	contains(point:XY):boolean{
		var cross0 = this.origin.subtract(this.endPoints[0]).cross(point.subtract(this.endPoints[0]))
		var cross1 = this.endPoints[1].subtract(this.origin).cross(point.subtract(this.origin));
		return cross0 < 0 && cross1 < 0;
	}
	// (private function)
	sortByClockwise(){}
}
// unimplemented classes. may be useful
// subclass of Triangle
class IsoscelesTriangle extends Triangle{ }

interface IProjection {
	project(point:XY);
}

class Orthographic implements IProjection{
	vector:XY;

	constructor(vector?:XY){
		this.vector = vector === undefined ? XY.K : vector;
	}

	project(point:XY) {
		return point.subtract(this.vector.scale(point.z/this.vector.z));
	}
}

class Perspective implements IProjection{
	source:XY;

	constructor(source:XY){
		this.source = source;
	}

	project(point:XY) {
		var vector:XY = point.subtract(this.source);
		return point.subtract(vector.scale(point.z/vector.z));
	}
}
