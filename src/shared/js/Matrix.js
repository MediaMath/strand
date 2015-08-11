(function (scope) {
	var Matrix = function(coll,rows,cols) {
		this.M = coll || [
			0,0,0,0,
			0,0,0,0,
			0,0,0,0,
			0,0,0,0
		];
		this.rows = rows || 4;
		this.cols = cols || 4;
	}
	Matrix.prototype = {
		get: function(col,row) {
			return this.M[ (row-1)*this.rows + col-1 ];
		},

		set: function(col,row,value) {
			this.M[ (row-1)*this.rows + col-1 ] = value;
			return value;
		},

		log: function() {
			var acc = "";
			for(var i=1; i<=this.rows; i++) {
				for(var j=1; j<=this.cols; j++) {
					acc += this.get(j,i) + " ";
				}
				acc += "\n";
			}
			console.log(acc);
		},

		add: function(other) {
			var answer = new Matrix();
			if (this.M.length === other.M.length) {
				for(var i=0; i<this.M.length; i++) {
					answer.M[i] = this.M[i] + other.M[i];
				}
			}
			return answer;
		},

		// Assumes proper dimensions
		multiply: function(other) {
			var answer = new Matrix();
			for(var i=1; i<=this.rows; i++) {
				for(var j=1; j<=other.cols; j++) {
					var acc = 0;
					for(var k=1; k<=this.cols; k++) {
						acc += this.get(k,i)*other.get(j,k);
					}
					answer.set(j,i,acc);
				}
			}
			return answer;
		},

		congruent: function(other) {
			for(var i=0; i<this.M.length; i++) {
				if (this.M[i] !== other.M[i]) return false;
			}
			return true;
		},
	}

	var fromString = function(str) {
		var c = str.split(/\s*[(),]\s*/).slice(1,-1),
				coll;
		if (c.length === 6) {
			// 'matrix()' (3x2)
			coll = [
				+c[0], +c[2],  0  , +c[4],
				+c[1], +c[3],  0  , +c[5],
				  0  ,   0  ,  1  ,   0  ,
				  0  ,   0  ,  0  ,   1
			];

		} else if (c.length === 16) {
			// matrix3d() (4x4)
			coll = [
				+c[0], +c[4], +c[8] , +c[12],
				+c[1], +c[5], +c[9] , +c[13],
				+c[2], +c[6], +c[10], +c[14],
				+c[3], +c[7], +c[11], +c[15]
			];
		} else {
			return ident();
		}
		return new Matrix(coll);
	};
	
	var ident = function() {
		return new Matrix([
			1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1
		]);
	}

	var MatrixLib = {
		Matrix: Matrix,
		fromString: fromString,
		ident: ident
	}

	scope.Matrix = MatrixLib;
})(window.StrandLib = window.StrandLib || {});