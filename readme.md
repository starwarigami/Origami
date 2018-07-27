# Origami Code

This is a Javascript library for creating origami crease patterns.

First time visitors, check out the [docs](http://origami.pw/docs/), there are a lot of interactive graphical examples.

Download this repo and check out the `/examples/` folder.

# Usage

Include `cp.js`, found in the root folder

A crease pattern is initialized like so

```javascript
var cp = new CreasePattern();
```

This creates a square piece of paper able to be creased with mountain, valley, or un-creased mark lines. Mathematically speaking, a unit-square 2D surface bounded between 0 and 1, cartesian X and Y, containing nodes and edges of a planar graph. Add a straight crease line:

```javascript
cp.crease(0,0,1,1);
cp.crease( {x:0,y:0}, {x:1,y:1} );
cp.crease( [[0,0], [1,1]] );
```

Three ways of making the same crease: a line segment between the x,y coordinate 0,0 and 1,1; the bottom left corner to the top right. Now, make it a valley crease:

```javascript
cp.crease(0,0,1,1).valley();
```

There are numerous origami operations, to name a few of the simple ones:

```
creaseRay(...)
creaseRayUntilIntersection(...)
creaseRayRepeat(...)
pleat(...)
// origami axioms
creaseThroughPoints(...)
creasePointToPoint(...)
creaseEdgeToEdge(...)
creasePerpendicularThroughPoint(...)
creasePointToLine(...)
creasePerpendicularPointOntoLine(...)
```

There are also functions for checking local flat-foldability, Kawasaki-Justin's theorem, Maekawa's theorem, exposing the planar graph data structure. Everything is built on a custom geometry module giving the user complete control over the epsilon value for all adjacency or intersection calculations, useful for .svg file import. This library supports .fold, .oripa, and .svg file formats for import and export.

# Paper.js

If you include the popular vector graphics library [Paper.js](http://paperjs.org/), also include `cp.paperjs.js` in the root folder. One line of code is all you need to visualize your crease patter in HTML canvas. A lot of effort was spent hooking together these two libraries. After you initialize your crease pattern, throw it onto a canvas:

```Javascript
new OrigamiPaper("canvas-name", cp);
```

This OrigamiPaper object is interactive and includes built-in functions, modeled after the experience using creative coding platforms like Processing and openFrameworks:

```javascript
var project = new OrigamiPaper("canvas");

project.onFrame = function(event){ }
project.onResize = function(event){ }
project.onMouseDown = function(event){ }
project.onMouseUp = function(event){ }
project.onMouseMove = function(event){ }
```

> If you don't initialize a crease pattern before creating the OrigamiPaper object, it will initialize a CreasePattern for you, located at `project.cp`

# License

MIT open source software license