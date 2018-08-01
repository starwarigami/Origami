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
	return ( Math.abs(a - b) < epsilon );
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
	/*determinant(){ return a*(e*i - f*h) - b*(d*i -  f*g) + c*(d*h - e*g); }*/
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
	/** Creates a transformation matrix representing a reflection across a plane
	 * @returns {Matrix}
	 */
	reflection(plane:Plane):Matrix{
		var normal:XY = plane.normal.normalize();
		var a:number = normal.x;
		var b:number = normal.y;
		var c:number = normal.z;
		var d:number = plane.point.dot(normal);
		this.a = 1 - 2*a*a;
		this.d = -2*a*b;
		this.g = -2*a*c;
		this.tx = 2*a*d;
		this.b = -2*b*a;
		this.e = 1 - 2*b*b;
		this.h = -2*b*c;
		this.ty = 2*b*d;
		this.c = -2*c*a;
		this.f = -2*c*b;
		this.i = 1 - 2*c*c;
		this.tz = 2*c*d;
		return this;
	}

	rotation(angle:number, axis:LineType):Matrix{
		var point:XY = axis.pointOnLine().invert();
		var direction:XY = axis.vector().normalize();
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
		return (epsilonEqual(this.x, point.x, epsilon) && epsilonEqual(this.y, point.y, epsilon) && epsilonEqual(this.z, point.z, epsilon))
	}
	normalize():XY { var m = this.magnitude(); return this.scale(1/m); }
	dot(vector:XY):number { return this.x * vector.x + this.y * vector.y + this.z * vector.z; }
	cross(vector:XY):XY{ return new XY(this.y*vector.z - this.z*vector.y, this.z*vector.x - this.x*vector.z, this.x*vector.y - this.y*vector.x); }
	signedArea(vector:XY):number{ var n:XY = this.cross(vector); return n.sign() * n.magnitude(); }
	/** There are 2 interior angles between 2 vectors, from A to B return the clockwise one.
	 *  This is in the cartesian coordinate system. example: angle PI/2 is along the +Y axis
	 * @param {XY} vector
	 * @returns {number} clockwise interior angle (from a to b) in radians
	 */
	clockwiseInteriorAngle(vector:XY):number{
		// this is on average 50 to 100 slower faster than clockwiseInteriorAngleRadians
		var angle:number = Math.atan2(vector.signedArea(this), vector.dot(this));
		if(angle < 0){ angle += Math.PI * 2; }
		return angle;
	}
	counterClockwiseInteriorAngle(vector:XY):number{
		// this is on average 50 to 100 slower faster than clockwiseInteriorAngleRadians
		var angle:number = Math.atan2(this.signedArea(vector), this.dot(vector));
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
	sign():number{
		var sign:number = (this.x + this.y + this.z)/Math.abs(this.x + this.y + this.z);
		if(isNaN(sign)){ sign = (this.x + this.y)/Math.abs(this.x + this.y); }
		if(isNaN(sign)){ sign = this.x/Math.abs(this.x); }
		return isNaN(sign) ? 0 : sign;
	}
	distanceTo(a:XY):number{ return a.subtract(this).magnitude(); }
	transform(matrix:Matrix):XY{
		return matrix.transform(this);
	}
	translate(dx:number, dy:number, dz?:number):XY{ return this.add(dx, dy, dz); }
	rotate90(axis?:LineType):XY {
		if(axis === undefined){ return new XY(-this.y, this.x, this.z); }
		else{ return this.rotate(Math.PI * 0.5, axis); }
	}
	rotate180(axis?:LineType):XY{
		if(axis === undefined){ return new XY(-this.x, -this.y, this.z); }
		else{ return this.rotate(Math.PI, axis); }
	}
	rotate270(axis?:LineType):XY{
		if(axis === undefined){ return new XY(this.y, -this.x, this.z); }
		else{ return this.rotate(Math.PI * 1.5, axis); }
	}
	rotate(angle:number, axis?:LineType){ return this.transform( new Matrix().rotation(angle, axis === undefined ? Line.zAxis : axis) ); }
	lerp(point:XY, pct:number):XY{ var inv=1.0-pct; return new XY(this.x*pct+point.x* inv,this.y*pct+point.y*inv,this.z*pct+point.z*inv); }
	midpoint(other:XY):XY{ return this.lerp(other, 0.5); }
	reflect(plane:Plane):XY{ return this.transform(new Matrix().reflection(plane)); }
	scale(magnitude:number):XY{ return new XY(this.x*magnitude, this.y*magnitude, this.z*magnitude); }
	invert():XY{ return this.scale(-1); }
	add(a:any, b?:number, c?:number):XY{
		if(isValidPoint(a)){ return new XY(this.x+a.x, this.y+a.y, this.z+(isValidNumber(a.z) ? a.z : 0)); }
		else if(isValidNumber(b)){ return new XY(this.x+a, this.y+b, this.z+(isValidNumber(c) ? c : 0)); }
	}
	// todo, outfit all these constructors with flexible parameters like add()
	subtract(point:XY):XY{ return new XY(this.x-point.x, this.y-point.y, this.z-point.z); }
	multiply(m:XY):XY{ return new XY(this.x*m.x, this.y*m.y, this.z*m.z); }
	abs():XY{ return new XY(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z)); }
	commonX(point:XY, epsilon?:number):boolean{return epsilonEqual(this.x, point.x, epsilon);}
	commonY(point:XY, epsilon?:number):boolean{return epsilonEqual(this.y, point.y, epsilon);}
	commonZ(point:XY, epsilon?:number):boolean{return epsilonEqual(this.z, point.z, epsilon);}
	copy():XY{ return new XY(this); }
	project(plane?:Plane, vanishingPoint?:XY):XY
	{
		if (plane === undefined) { return new XY(this.x, this.y); }
		var line:Line;
		if (vanishingPoint === undefined) { line = new Line(this, plane.normal); }
		else {
			if (plane.coplanar(vanishingPoint)) { return undefined; }
			line = new Line(this, this.subtract(vanishingPoint));
		}
		return line.intersectionWithPlane(plane);
	}

	static readonly origin:XY = new XY(0,0,0);
	/** unit vector along the x-axis*/
	static readonly I:XY = new XY(1,0,0);
	/** unit vector along the y-axis*/
	static readonly J:XY = new XY(0,1,0);
	/** unit vector along the z-axis*/
	static readonly K:XY = new XY(0,0,1);
}
abstract class LineType implements LineType{
	abstract length():number
	abstract pointOnLine():XY
	abstract vector():XY
	perpendicular(line:LineType, epsilon?:number):boolean{ return epsilonEqual(this.vector().normalize().cross(line.vector().normalize()).magnitude(), 1, epsilon); }
	parallel(line:LineType, epsilon?:number):boolean{ return epsilonEqual(this.vector().cross(line.vector()).magnitude(), 0, epsilon); }
	abstract collinear(point:XY, epsilon?:number):boolean
	abstract equivalent(line:LineType, epsilon?:number):boolean
	abstract degenrate(epsilon?:number):boolean
	intersection(line:LineType, epsilon?:number):XY{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		var v0:XY = this.vector();
		var v1:XY = line.vector();
		var denominator0:number = v0.signedArea(v1);
		var denominator1:number = -denominator0;
		if (epsilonEqual(denominator0, 0, epsilon)) { return undefined; } /* parallel */
		var o0:XY = this.pointOnLine();
		var o1:XY = line.pointOnLine();
		var numerator0:number = o1.subtract(o0).signedArea(v1);
		var numerator1:number = o0.subtract(o1).signedArea(v0);
		var t0:number = numerator0 / denominator0;
		var t1:number = numerator1 / denominator1;
		if(this.compFunction(t0, epsilon) && line.compFunction(t1, epsilon)){ return o0.add(v0.scale(t0)); }
		return undefined;
	}
	abstract compFunction(t:number, epsilon?:number):boolean
	rotationMatrix(angle:number):Matrix{ return new Matrix().rotation(angle, this); }
	abstract nearestPoint(a:any, b?:number, c?:number):XY
	abstract nearestPointNormalTo(a:any, b?:number, c?:number):XY
	abstract transform(matrix:Matrix):LineType
	abstract copy():LineType
	abstract project(plane?:Plane, vanishingPoint?:XY):LineType
	//abstract clipWithEdge(edge:Edge, epsilon?:number):LineType
	//abstract clipWithEdges(edges:Edge[], epsilon?:number):LineType
	//abstract clipWithEdgesDetails(edges:Edge[], epsilon?:number):LineType
}
/** 3D line, extending infinitely in both directions, represented by a point and a vector */
class Line extends LineType{
	readonly point:XY;
	readonly direction:XY;
	constructor(a?:any, b?:any, c?:number, d?:number){
		super();
		// if(b instanceof XY){ this.point = a.copy(); this.direction = b.copy(); }
		if(isValidPoint(a)){ this.point = new XY(a); this.direction = new XY(b); }
		else{ this.point = new XY(a, b); this.direction = new XY(c, d); }
	}
	rays():[Ray,Ray]{var a = new Ray(this.point, this.direction);return [a, a.flip()];}
	// implements LineType
	length():number{ return Infinity; }
	pointOnLine():XY{ return this.point.copy(); }
	vector():XY{ return this.direction.copy(); }
	collinear(point:XY, epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		if(this.point.equivalent(point, epsilon)){ return true; }
		return epsilonEqual(this.direction.cross(point.subtract(this.point)).magnitude(), 0, epsilon);
	}
	equivalent(line:LineType, epsilon?:number):boolean{
		if(!(line instanceof Line)){ return false; }
		// if lines are parallel and share a point in common
		return this.collinear(line.point, epsilon) && this.parallel(line, epsilon);
	}
	degenrate(epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		return epsilonEqual(this.direction.magnitude(), 0, epsilon);
	}
	compFunction(t:number, epsilon:number):boolean{ return true; }
	nearestPoint(a:any, b?:number, c?:number):XY{ return this.nearestPointNormalTo(a,b,c); }
	nearestPointNormalTo(a:any, b?:number, c?:number):XY{
		var point:XY = new XY(a,b,c);
		var v = this.direction.normalize();
		var u = new XY(point).subtract(this.point).dot(v);
		return this.point.add(v.scale(u));
	}
	transform(matrix:Matrix):LineType{
		// todo: who knows if this works
		return new Line(this.point.transform(matrix), this.direction.transform(matrix));
	}
	copy():LineType{ return new Line(this.point, this.direction); }
	project(plane?:Plane, vanishingPoint?:XY):LineType{ return new Line(this.point.project(plane, vanishingPoint), this.direction.project(plane, vanishingPoint)); }
	bisect(line:Line):Line[]{
		if( this.parallel(line) ){
			return [new Line(this.point.midpoint(line.point), this.direction)];
		}
		else{
			var intersection:XY = this.intersection(line);
			var vectors = [this.direction.bisect(line.direction)[0], this.direction.bisect(line.direction.invert())[0]];
			if(this.direction.cross(vectors[1]).magnitude() < this.direction.cross(vectors[0]).magnitude()){
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
	intersectionWithPlane(plane:Plane):XY{
		var denominator:number = this.direction.dot(plane.normal);
		if (epsilonEqual(denominator, 0)) { return undefined; } //line parallel to plane (0 or infinite intersections)
		var numerator:number = plane.point.subtract(this.point).dot(plane.normal);
		return this.point.add(this.direction.scale(numerator/denominator));
	}

	//Should these by static methods?
	static readonly xAxis:Line = new Line(XY.origin, XY.I);
	static readonly yAxis:Line = new Line(XY.origin, XY.J);
	static readonly zAxis:Line = new Line(XY.origin, XY.K);
}
/** 3D line, extending infinitely in one direction, represented by a point and a vector */
class Ray extends LineType{
	readonly origin:XY;
	readonly direction:XY;
	constructor(a?:any, b?:any, c?:any, d?:any){
		super();
		// if(a instanceof XY){ this.origin = a; this.direction = b; }
		if(isValidPoint(a)){
			this.origin = new XY(a);
			this.direction = new XY(b);
		}
		else{
			this.origin = new XY(a, b);
			this.direction = new XY(c, d);
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
		return epsilonEqual(cross.magnitude(), 0, epsilon);
	}
	equivalent(line:LineType, epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		if(!(line instanceof Ray)){ return false; }
		return (this.origin.equivalent(line.origin, epsilon) &&
				this.direction.normalize().equivalent(line.direction.normalize(), epsilon));
	}
	degenrate(epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		return epsilonEqual(this.direction.magnitude(), 0, epsilon);
	}
	compFunction(t:number, epsilon:number):boolean{ return t >= -epsilon; }
	nearestPoint(a:any, b?:number, c?:number):XY{
		var answer = this.nearestPointNormalTo(a,b,c);
		if(answer !== undefined){ return answer; }
		return this.origin;
	}
	nearestPointNormalTo(a:any, b?:number, c?:number):XY{
		var point:XY = new XY(a,b,c);
		var v = this.direction.normalize();
		var u = new XY(point).subtract(this.origin).dot(v);
		// todo: did I guess right? < 0, and not > 1.0
		if(u < 0){ return undefined; }
		return this.origin.add(v.scale(u));
	}
	transform(matrix:Matrix):LineType{
		// todo: who knows if this works
		return new Ray(this.origin.transform(matrix), this.direction.transform(matrix));
	}
	copy():LineType{return new Ray(this.origin, this.direction); }
	project(plane?:Plane, vanishingPoint?:XY):LineType{ return new Ray(this.origin.project(plane, vanishingPoint), this.direction.project(plane, vanishingPoint)); }
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
	constructor(a:any, b?:any, c?:any, d?:any){
		super();
		// if((a instanceof XY) && (b instanceof XY)){this.nodes = [a,b];}
		if(isValidPoint(a)){this.nodes = [new XY(a), new XY(b)];}
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
	equivalent(line:LineType, epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		if(!(line instanceof Edge)){ return false; }
		return ((this.nodes[0].equivalent(line.nodes[0],epsilon) &&
				 this.nodes[1].equivalent(line.nodes[1],epsilon)) ||
				(this.nodes[0].equivalent(line.nodes[1],epsilon) &&
				 this.nodes[1].equivalent(line.nodes[0],epsilon)) );
	}
	degenrate(epsilon?:number):boolean{
		if(epsilon === undefined){ epsilon = EPSILON_HIGH; }
		return this.nodes[0].equivalent(this.nodes[1], epsilon);
	}
	compFunction(t:number, epsilon:number):boolean{ return t >= -epsilon && t <= 1 + epsilon; }
	nearestPoint(a:any, b?:number, c?:number):XY{
		var answer = this.nearestPointNormalTo(a,b,c);
		if(answer !== undefined){ return answer; }
		var point:XY = new XY(a,b,c);
		return this.nodes
			.map(function(el){ return {point:el,distance:el.distanceTo(point)}; },this)
			.sort(function(a,b){ return a.distance - b.distance; })
			.shift()
			.point;
	}
	nearestPointNormalTo(a:any, b?:number, c?:number):XY{
		var point:XY = new XY(a,b,c);
		var p = this.nodes[0].distanceTo(this.nodes[1]);
		var u = new XY(point).subtract(this.nodes[0]).dot(this.nodes[1].subtract(this.nodes[0])) / Math.pow(p,2);
		if(u < 0 || u > 1.0){ return undefined; }
		return this.nodes[0].add(this.nodes[1].subtract(this.nodes[0]).scale(u));
	}
	transform(matrix:Matrix):LineType{
		return new Edge(this.nodes[0].transform(matrix), this.nodes[1].transform(matrix));
	}
	copy():LineType{ return new Edge(this.nodes[0], this.nodes[1]); }
	project(plane?:Plane, vanishingPoint?:XY):LineType{ return new Edge(this.nodes[0].project(plane,vanishingPoint), this.nodes[1].project(plane, vanishingPoint)); }
	// additional methods
	midpoint():XY{ return this.nodes[0].midpoint(this.nodes[1]); }
	perpendicularBisector():Plane{ return new Plane(this.midpoint(), this.vector()); }
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
		   epsilonEqual(ray.direction.cross(target.subtract(ray.origin)).magnitude(), 0, EPSILON_HIGH)){
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
			var v = prevClip.intersection.vector();
			var reflection = new Plane(prevClip.intersection.nodes[0], v.cross(prevClip.edge.vector()).cross(v)).reflectionMatrix();
			var newRay = new Ray(prevClip.edge.nodes[1], prevClip.edge.nodes[0].transform(reflection).subtract(prevClip.edge.nodes[1]));
			// get next edge intersections
			var newClips:{edge:Edge,intersection:Edge}[] = newRay.clipWithEdgesDetails(intersectable);
			if(target !== undefined &&
			   epsilonEqual(newRay.direction.cross(target.subtract(newRay.origin)).magnitude(), 0, EPSILON_HIGH)){
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
/** A 3D planar surface of infinite area defined by a point and a normal vector. */
class Plane {
	readonly point:XY;
	readonly normal:XY;

	// a, b are points, or
	// (a,b,c) point 1 and (d,e,f) point 2, each x,y,z
	constructor(a?:any, b?:any, c?:any, d?:any, e?:any, f?:any) {
		// if(a instanceof XY){ this.point = a; this.normal = b; }
		if (isValidPoint(a)) {
			this.point = new XY(a);
			this.normal = new XY(b);
		}
		else {
			this.point = new XY(a, b, c);
			this.normal = new XY(d, e, f);
		}
	}
	/** parameters of the equation ax + by + cz + d = 0 that describes the plane */

	perpendicular(plane:Plane, epsilon?:number):boolean { return epsilonEqual(this.normal.normalize().cross(plane.normal.normalize()).magnitude(), 1, epsilon); }
	parallel(plane:Plane, epsilon?:number):boolean { return epsilonEqual(this.normal.cross(plane.normal).magnitude(), 0, epsilon); }
	coplanar(point:any, epsilon?:number):boolean { return epsilonEqual(this.normal.x * point.x + this.normal.y * point.y + this.normal.z * point.z - this.point.dot(this.normal), 0, epsilon); }
	equivalent(plane:Plane, epsilon?:number):boolean { return this.coplanar(plane.point, epsilon) && this.parallel(plane, epsilon); }
	degenerate(epsilon?:number):boolean { return epsilonEqual(this.normal.magnitude(), 0, epsilon); }

	intersection(plane:Plane, epsilon?:number):Line {
		var direction:XY = this.normal.cross(plane.normal);
		if (epsilonEqual(direction.magnitude(), 0, epsilon)) {
			return undefined;
		}
		//TODO:implement this!
	}

	reflectionMatrix():Matrix { return new Matrix().reflection(this); }

	copy():Plane { return new Plane(this.point.copy(), this.normal.copy()); }

	//Should these by static methods?
	/** the plane passing through the origin normal to the z-axis*/
	static readonly XY:Plane = new Plane(XY.origin, XY.K);
	/** the plane passing through the origin normal to the x-axis*/
	static readonly YZ:Plane = new Plane(XY.origin, XY.I);
	/** the plane passing through the origin normal to the y-axis*/
	static readonly ZX:Plane = new Plane(XY.origin, XY.J);
	/** the unique plane passing through three specified points*/
	static fromPoints(a:any, b:any, c:any, d?:number, e?:number, f?:number, g?:number, h?:number, i?:number):Plane {
		var point0:XY, point1:XY, point2:XY;
		if (isValidPoint(a)) {
			point0 = new XY(a);
			point1 = new XY(b);
			point2 = new XY(c);
		}
		else {
			point0 = new XY(a, b, c);
			point1 = new XY(d, e, f);
			point2 = new XY(g, h, i);
		}
		var vector1:XY = point1.subtract(point0);
		var vector2:XY = point2.subtract(point0);
		return new Plane(point0, vector1.cross(vector2));
	}
}
/** the base class for all 2D polygon objects */
abstract class PolygonType {
	abstract vertices():XY[]
	///** length of the perimeter */
	//perimeter():number { }
	/** Tests whether or not a point is contained inside a polygon, or optionally on the perimeter
	 * @returns {boolean} whether the point is inside the polygon or not
	 * @example
	 * var isInside = polygon.contains( {x:0.5, y:0.5} )
	 */
	contains(point:XY, epsilon?:number, includePerimeter?:boolean):boolean {
		if (epsilon == undefined) { epsilon = 0; }
		if (includePerimeter === undefined) { includePerimeter = false; }

		var useEdges:boolean = this.hasOwnProperty('edges');
		var array:any[] = undefined;
		if (useEdges) { array = this['edges']; }
		else { array = this.vertices(); }
		if (array.length == 0) { return false; }

		var ray:Ray = undefined;
		var isInside:boolean = true;
		for (var i= 0; i < array.length; i++) {
			var edge:Edge = useEdges ? array[i] : new Edge(array[i], array[i % array.length]);
			// if the point lies on the edge it is not contained. unless explicitly specified
			if (edge.collinear(point, epsilon)) { return includePerimeter; }

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
	/** returns true if the provided point lies strictly within the interior of the polygon */
	pointInside(point:any, epsilon?:number):boolean { return this.contains(point, epsilon); }
	/** returns true if the provided point lies on the perimeter of the polygon, within a specified tolerance*/
	liesOnEdge(point:any, epsilon?:number):boolean {
		var useEdges:boolean = this.hasOwnProperty('edges');
		var array:any[] = undefined;
		if (useEdges) { array = this['edges']; }
		else { array = this.vertices(); }
		if (array.length == 0) { return false; }

		for (var i:number = 0; i < array.length; i++) {
			var edge:Edge = useEdges ? array[i] : new Edge(array[i], array[i % array.length]);
			if (edge.collinear(point, epsilon)) { return true; }
		}
		return false;
	}
	/** Calculates the signed area of a polygon. This requires the polygon be non-intersecting.
	 * @returns {number} the area of the polygon
	 * @example
	 * var area = polygon.signedArea()
	 */
	signedArea(vertices?:XY[]):number {
		if (vertices === undefined) { vertices = this.vertices(); }
		return 0.5 * vertices.map(function (el:XY, i:number) {
			var nextEl:XY = vertices[(i + 1) % vertices.length];
			return el.signedArea(nextEl);
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
			var mag:number = el.signedArea(nextEl);
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
		var xMin:number = Infinity, xMax:number = -Infinity, yMin:number = Infinity, yMax:number = -Infinity, zMin:number = Infinity, zMax:number = -Infinity;
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
			if (vertices[i].z > zMax) {
				zMax = vertices[i].z;
			}
			if (vertices[i].z < zMin) {
				zMin = vertices[i].z;
			}
		}
		return new XY((xMax - xMin) * 0.5, (yMax - yMin) * 0.5, (zMax - zMin) * 0.5);
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
	/** returns true if all vertices of the polygon ie on the same plane within a specified tolerance*/
	planar():boolean { return this.infinitePlane() !== undefined; }
	/** returns true if all interior angles of the polygon are less than 180 degrees*/
	convex():boolean {
		//TODO: implement this!
		return undefined;
	}
	/** Calculates the bounding box made by the projection of the edges of the polygon onto the XY plane.
	 * @returns {Rect} the bounding box of the polygon projected onto the XY plane
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
	/** returns the plane that all vertice lie on (or undefined if the polygon is not planar)*/
	infinitePlane():Plane {
		var vertices:XY[] = this.vertices();
		//filter out any colinear triplets
		vertices = vertices.map(function (el:XY, i:number) {
			var prevEl:XY = vertices[(i + vertices.length - 1) % vertices.length];
			var nextEl:XY = vertices[(i + 1) % vertices.length];
			if (epsilonEqual(el.subtract(prevEl).cross(nextEl.subtract(el)).magnitude(), 0)) {
				return undefined;
			}
			return el;
		}).filter(function (el:XY) { return el !== undefined; });
		if (vertices.length > 2) {
			//determine the plane that coincides with the first three vertices
			var plane:Plane = Plane.fromPoints(vertices[0], vertices[1], vertices[2]);
			for (var i:number = 3; i < vertices.length; i++) {
				//check that all remaining vertices lie on the same plane
				if (!plane.coplanar(vertices[i])) { return undefined; }
			}
			return plane;
		}
		return undefined;
	}
	/** returns an equivalent polygon*/
	copy():PolygonType {
		var p:Polygon = new Polygon();
		p.nodes = this.vertices().map(function (v:XY) {
			return v.copy();
		}, this);
		return p;
	}
	/** the projection of the polygon onto the specified plane (or the XY plane if not specified)*/
	project(plane?:Plane, vanishingPoint?:XY) {
		var p:Polygon = new Polygon();
		p.nodes = this.vertices().map(function (v:XY) {
			return v.project(plane, vanishingPoint);
		}, this);
		return p;
	}
}
/** A rectilinear space defined by width and height vectors and one corner of the rectangle */
class Rect extends PolygonType{
	origin:XY;
	width:XY;
	height:XY;
	size:{width:number, height:number};
	constructor(a:any,b:any,c:any,d?:number){
		super();
		// a, b, c are points, or
		// a is point and c, d are width and height respectively
		// (a,b) point and c, d are width and height respectively
		if (isValidPoint(a)) {
			this.origin = new XY(a);
			if (isValidPoint(b)) {
				this.width = new XY(b);
				this.height = new XY(c);
			}
			else
			{
				this.width = new XY(b, 0);
				this.height = new XY(0, c);
			}
		}
		else {
			this.origin = new XY(a, b)
			this.width = new XY(c, 0);
			this.height = new XY(0, d);
		}
		this.size = { 'width': this.width.magnitude(), 'height': this.height.magnitude() };
	}
	// implements PolygonType
	vertices():XY[]{
		var vertices:XY[] = [this.origin.copy()];
		vertices.push(vertices[0].add(this.width));
		vertices.push(vertices[1].add(this.height));
		vertices.push(vertices[0].add(this.height));
		return vertices;
	}
	square():boolean{ return epsilonEqual(this.size.width, this.size.height); }
	skew():boolean{ return epsilonEqual(this.width.clockwiseInteriorAngle(this.height), Math.PI*0.5); }
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
}
/** A circle defined by its center point and radius length */
class Circle{
	center:XY;
	radius:number;
	normal:XY;
	constructor(a:any, b:any, c?:any){
		// (a,b) point and c is radius
		// or a is point, b is radius and c is normal vector for teh plane the circle lies on (defaultes to z-axis)
		if (isValidNumber(c)) {
			this.center = new XY(a, b);
			this.radius = Math.abs(c);
			this.normal = XY.K;
		}
		else {
			this.center = new XY(a);
			this.radius = isValidNumber(b) ? Math.abs(b) : 0;
			this.normal = isValidPoint(c) ? new XY(c) : XY.K;
		}
	}
	intersection(line:LineType, epsilon?:number):XY[]{
		//find the intersections of a sphere with specified centre and radius
		//with an infinite extension of the specified line
		var l:XY = line.vector().normalize();
		var o:XY = line.pointOnLine();
		var v:XY = o.subtract(this.center);
		var dot:number = l.dot(v);
		var delta:number = dot * dot - v.dot(v) + this.radius * this.radius;
		var intersections:XY[] = [];
		if (delta >= 0) {
			var l1:XY = l.scale(-1 * dot + Math.sqrt(delta));
			intersections.push(o.add(l1));
		}
		if (delta > 0) {
			var l2:XY = l.scale(-1 * dot - Math.sqrt(delta));
			intersections.push(o.add(l2));
		}
		var p:Plane = this.infinitePlane();
		//check if the intersections lie both on the plane of the circle and on the specified line (which may be a ray or egde)
		return intersections.filter(function (el) { return p.coplanar(el, epsilon) && line.collinear(el, epsilon); })
	}
	infinitePlane():Plane { return new Plane(this.center, this.normal); }
}
/** The boundary of a polygon defined by a sequence of nodes */
class Polygon extends PolygonType{
	nodes:XY[];
	constructor(){ super(); this.nodes = []; }
	// implements PolygonType
	vertices():XY[] { return this.nodes.map(function(el){ return el.copy(); }); }
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
	// additional methods
	clipEdge(edge:Edge):Edge{
		var intersections = this.edges
			.map(function(el){ return edge.intersection(el); })
			.filter(function(el){return el !== undefined; })
			// filter out intersections equivalent to the edge points themselves
			.filter(function(el){
				return !el.equivalent(edge.nodes[0]) &&
					   !el.equivalent(edge.nodes[1]); });
		switch(intersections.length){
			case 0:
				if(this.contains(edge.nodes[0])){ return edge; } // completely inside
				return undefined;  // completely outside
			case 1:
				if(this.contains(edge.nodes[0])){
					return new Edge(edge.nodes[0], intersections[0]);
				}
				return new Edge(edge.nodes[1], intersections[0]);
			// case 2: return new Edge(intersections[0], intersections[1]);
			default:
				for(var i = 1; i < intersections.length; i++){
					if( !intersections[0].equivalent(intersections[i]) ){
						return new Edge(intersections[0], intersections[i]);
					}
				}
		}
	}
	clipLine(line:Line):Edge{
		var intersections = this.edges
			.map(function(el){ return line.intersection(el); })
			.filter(function(el){return el !== undefined; });
		switch(intersections.length){
			case 0: return undefined;
			case 1: return new Edge(intersections[0], intersections[0]); // degenerate edge
			// case 2:
			default:
				for(var i = 1; i < intersections.length; i++){
					if( !intersections[0].equivalent(intersections[i]) ){
						return new Edge(intersections[0], intersections[i]);
					}
				}
		}
	}
	clipRay(ray:Ray):Edge{
		var intersections = this.edges
			.map(function(el){ return ray.intersection(el); })
			.filter(function(el){return el !== undefined; });
		switch(intersections.length){
			case 0: return undefined;
			case 1: return new Edge(ray.origin, intersections[0]);
			// case 2: return new Edge(intersections[0], intersections[1]);
			default:
				for(var i = 1; i < intersections.length; i++){
					if( !intersections[0].equivalent(intersections[i]) ){
						return new Edge(intersections[0], intersections[i]);
					}
				}
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
		if (origin === undefined) { origin = new XY(); }
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
			return new XY(el.x-this.origin.x, el.y-this.origin.y);
		},this);
	}
  axis():Line{
		var v = this.vectors();
		return new Line(this.origin, v[0].cross(v[1]));
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
		var rays = [];
	  var vectors = this.vectors();
	  var angle = vectors[0].counterClockwiseInteriorAngle(vectors[1]) / divisions;
	  var axis =  new Line(this.origin, vectors[0].cross(vectors[1]));
		for (var i = 1; i < divisions; i++) {
			rays.push(new Ray(this.origin.copy(), vectors[0].rotate(angle, axis)));
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
		return cross0.sign() < 0 && cross1.sign() < 0;
	}
	// (private function)
	sortByClockwise(){}
}
// unimplemented classes. may be useful
// subclass of Triangle
class IsoscelesTriangle extends Triangle{ }
