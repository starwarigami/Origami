<?php include 'header.php';?>

<h1>ORIGAMI AXIOMS</h1>

<section id="intro">

<h2>Axiom 1</h2>
	<div class="explain">
		<p>Given two points, we can fold a line connecting them</p>
	</div>
	<div class="centered">
		<canvas id="canvas-axiom-1" resize></canvas>
	</div>
	<div class="centered">
		<pre><code>cp.<f>creaseConnectingPoints</f>(point1, point2)</code></pre>
	</div>


<h2>Axiom 2</h2>
	<div class="explain">
		<p>Given two points, we can fold point 1 onto point 2</p>
	</div>
	<div class="centered">
		<canvas id="canvas-axiom-2" resize></canvas>
	</div>
	<div class="centered">
		<pre><code>cp.<f>creasePointToPoint</f>(point1, point2)</code></pre>
	</div>

<h2>Axiom 3</h2>
	<div class="explain">
		<p>Given two lines, we can fold line 1 onto line 2</p>
	</div>
	<div class="centered">
		<canvas id="canvas-axiom-3" resize></canvas>
	</div>
	<div class="centered">
		<pre><code>cp.<f>creaseEdgeToEdge</f>(edge1, edge2)</code></pre>
	</div>

<h2>Axiom 4</h2>
	<div class="explain">
		<p>Given a point and a line, we can make a fold perpendicular to the line passing through the point</p>
	</div>
	<div class="centered">
		<canvas id="canvas-axiom-4" resize></canvas>
	</div>
	<div class="centered">
		<pre><code>cp.<f>creasePerpendicularThroughPoint</f>(edge, point)</code></pre>
	</div>

<h2>Axiom 5</h2>
	<div class="explain">
		<p>Given two points and a line, we can make a fold that places the first point on to the line and passes through the second point</p>
	</div>
	<div class="centered">
		<canvas id="canvas-axiom-5" resize></canvas>
	</div>
	<div class="centered">
		<pre><code>cp.<f>creasePointToLine</f>(point1, point2, edge)</code></pre>
	</div>

<h2>Axiom 6</h2>
	<div class="explain">
		<p>Given two points and two lines we can make a fold that places the first point onto the first line and the second point onto the second line</p>
	</div>
	<div class="centered">
		<canvas id="canvas-axiom-6" resize></canvas>
	</div>
	<div class="centered">
		<pre><code>cp.<f>creasePointsToLines</f>(point1, point2, edge1, edge2)</code></pre>
	</div>

<h2>Axiom 7</h2>
	<div class="explain">
		<p>Given a point and two lines we can make a fold perpendicular to the second line that places the point onto the first line</p>
	</div>
	<div class="centered">
		<canvas id="canvas-axiom-7" resize></canvas>
	</div>
	<div class="centered">
		<pre><code>cp.<f>creasePerpendicularPointOntoLine</f>(point, edge1, edge2)</code></pre>
	</div>

</section>

<script src="../lib/cubicSolver.js"></script>
<script type="text/javascript" src="../tests/axiom1.js"></script>
<script type="text/javascript" src="../tests/axiom2.js"></script>
<script type="text/javascript" src="../tests/axiom3.js"></script>
<script type="text/javascript" src="../tests/axiom4.js"></script>
<script type="text/javascript" src="../tests/axiom5.js"></script>
<script type="text/javascript" src="../tests/axiom6.js"></script>
<script type="text/javascript" src="../tests/axiom7.js"></script>

<?php include 'footer.php';?>