<!DOCTYPE html>
<html lang="en">
<meta charset="utf-8">

<head>

	<title>Connect 4 Game</title>
	<link rel="stylesheet" type="text/css" href="Layout.css">
	<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
  	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>

</head>

<body>

	<script src="matter.js"></script>
	<div onselectstart="return false" id="container">
		<canvas onselectstart="return false" id="world"></canvas>
		<div id='win_msg' class="ui-widget-content">
		<div id="won"></div>
		<button id="exit">Exit</button>
		<button id="reset">Restart</button>
		</div>
	<div id="turns"></div>
	</div>
	<script src="Game.js"></script>

</body>
</html>