var dtw = require('dynamic-time-warping');
var dtw_dtw = require('dtw');

var s = [1,1,2,3,2,0];
var t = [0,1,1,2,3,2,1];


var dtw3 = new dtw.DynamicTimeWarping(
	s,
	t,
	function( a, b ) {
		return Math.abs( a - b );
	}
);

var dtw_xxx = new dtw_dtw();

//console.log(dtw3.getPath());
//console.log(dtw3.getDistance());

console.log(dtw_xxx.compute(s,t));
console.log(dtw_xxx.path());

