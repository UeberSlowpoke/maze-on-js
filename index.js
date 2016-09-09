// Recursive Backtracker algorithm

function Maze(x, y) {
    this.total = x * y;
    this.rows = x;
    this.cols = y;

    // this.cells looks like:
    // [[0,0,0,0],[0,1,1,1],[1,1,0,1]]
    // [[1,1,1,0],[0,1,0,1],[0,1,0,1]]
    // ...
    // [[1,0,1,0],[0,1,1,1],[0,1,0,1]]
    this.cells = [];

    // further array will be more readable than {x:0, y:0}
    this.entry = [0, 0];

    // Use 'visited' array with flags "visited"(1)/"unvisited"(0) for each cell
    // instead 'stack' array with only visited cells,
    // because there is no way to check existence of new array with neighbour`s position in stack:
    // maybe, the reason is that objects and arrays are singletons in js.

    // Because of it 'stack.indexOf(neighbour`s position) == -1' doesn`t work:
    // it returns true even if checked array and array in stack are the same.
    this.visited = [];

    // for discard step if dead-end
    // and check if build is ended
    this.path = [];
}

Maze.prototype.init = function() {
    for (var i = 0; i < this.rows; i++) {
        this.cells[i] = [];
        this.visited[i] = [];
        for (var j = 0; j < this.cols; j++) {

            // each cell = it`s borders params:
            // [top, right, bottom, left]
            this.cells[i][j] = [1,1,1,1];

            // visited looks like:
            // [[0,0,0]
            //  [0,0,0]
            //  [0,0,0]]
            this.visited[i][j] = 0;
        }
    }
};

Maze.prototype.getNeighborsPos = function(pos) {
    var neighbors = [];

    if (pos[1] !== 0 && !this.visited[pos[0]][pos[1]-1]) {
        neighbors.push([pos[0],pos[1]-1]);
    }

    if (pos[1] !== this.cols-1 && !this.visited[pos[0]][pos[1]+1]) {
        neighbors.push([pos[0],pos[1]+1]);
    }

    if (pos[0] !== 0 && !this.visited[pos[0]-1][pos[1]]) {
        neighbors.push([pos[0]-1,pos[1]]);
    }

    if (pos[0] !== this.rows-1 && !this.visited[pos[0]+1][pos[1]]) {
        neighbors.push([pos[0]+1,pos[1]]);
    }

    return neighbors;
};

Maze.prototype.carvingOutPath = function(cur, next) {
    // go to top
    if (cur[0] > next[0]) {
        this.cells[cur[0]][cur[1]][0] = 0;
        this.cells[next[0]][next[1]][2] = 0;
    }
    // go to bottom
    if (cur[0] < next[0]) {
        this.cells[cur[0]][cur[1]][2] = 0;
        this.cells[next[0]][next[1]][0] = 0;
    }
    // go to left
    if (cur[1] > next[1]) {
        this.cells[cur[0]][cur[1]][3] = 0;
        this.cells[next[0]][next[1]][1] = 0;
    }
    // go to right
    if (cur[1] < next[1]) {
        this.cells[cur[0]][cur[1]][1] = 0;
        this.cells[next[0]][next[1]][3] = 0;
    }
};

Maze.prototype.createGrid = function() {
    var cur = this.entry;
    this.path.push(cur);

    while (this.path.length < this.total) {
        this.visited[cur[0]][cur[1]] = 1;
        var neighbors = this.getNeighborsPos(cur);

        // ups, dead-end
        if (neighbors.length == 0 && this.path.length < this.total) {

            // try to use saved roadJunctions for fast backtrack to closest cell
            // with neighbours, but too much logic in this way:

            // (1) new junction overwrite previous, so it should be saved in array
            // (2) too much checks for saving only suitable junctions instead all cells with several neighbors:
            // (3) junction may become blocked by passage around, when we return to it
            // (4) dead-end can going right next to junction, which are not saved yet
            // (5) cells in the corners mess up some checks

            // so simple loop is used

            var index = this.path.length-2;

            while (neighbors.length == 0) {
                cur = this.path[index];
                neighbors = this.getNeighborsPos(cur);
                index -= 1;
            }
        }

        // choose random neighbor cell
        var next = neighbors[Math.floor(Math.random() * neighbors.length)];

        // remove borders between current and next cells
        this.carvingOutPath(cur, next);
        this.path.push(next);
        cur = next;
    }

    // create an entrance and exit
    this.cells[this.entry[0]][this.entry[1]][3] = 0;
    this.cells[this.rows-1][this.cols-1][1] = 0;
};

Maze.prototype.build = function(width) {
    var wallsWidth = width || 1,
        content = '';

    this.cells.forEach(function(row) {
        content += '<tr>';
        row.forEach(function(cell) {
            createCell(cell);
        });
        content += '</tr>';
    });

    return content;

    function createCell(cell) {
        var params = 'border-width: ' + cell.map(function(el) {
                return el*wallsWidth + 'px';
            }).join(' ');

        content += '<td class="table__cell" style="' + params +'"></td>';
    }
};

(function() {
    var table = document.getElementById('table'),
        content,
        maze;

    maze = new Maze(14,14);
    maze.init();
    maze.createGrid();
    content = maze.build(2);
    table.innerHTML = content;
}());

// todo: write unit tests
// todo: add an ability of changing the size