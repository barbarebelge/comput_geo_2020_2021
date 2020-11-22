

/** Returns a string repreesenting the type of the variable. */
function typeOf(obj) {
  return {}.toString
    .call(obj)
    .match(/\s(\w+)/)[1]
    .toLowerCase();
}

function mod(a, n){
	return ((a % n ) + n ) % n;
}