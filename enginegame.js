function engineGame(options) {
    options = options || {}
    var startpos = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    var game = null;
    var board;
    
    var playerColor = 'white';

    var fens = [];
    var fenALL = null;
    var fenCounter = 0;
    var puzzleCounter = 0;
    var successCounter = 0;
    var fenLoaded = false;

    var rush = false;
    var turn;

    function nextFEN() {
        if (fenLoaded) {
            fenCounter = 0;
            game = null;
            game = new Chess();
            game.load(fenALL[++puzzleCounter].fens[fenCounter]);
            turn = game.turn();
            playerColor = turn == 'w' ? 'white' : 'black';
            // game.orientation;
            
            //$('#debug3').text(turn == 'w' ? 'white' : 'black');
            console.log(turn == 'w' ? 'white' : 'black');
            // board.position(fenALL[puzzleCounter].fens[fenCounter]);
            board.orientation(turn == 'w' ? 'white' : 'black');
            $('#debug3').text(fenALL[puzzleCounter].fens[fenCounter]);
            console.log(fenALL[puzzleCounter].fens[fenCounter]);
            fenLoaded = true;
            
        } else {
            fenLoaded = false;
        }
    }
    
    var onDragStart = function(source, piece, position, orientation) {
        var re = playerColor == 'white' ? /^b/ : /^w/
            if (game.game_over() ||
                piece.search(re) !== -1) {
                return false;
            }
    };
 
    var onDrop = function(source, target) {
        // see if the move is legal
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a pawn for example simplicity
        });
        // illegal move
        if (move === null) return 'snapback'        
        fenCounter++
        if (game.fen() == fenALL[puzzleCounter].fens[fenCounter]) {
            console.log('correct: '+game.fen())
            $('#correct').text('correct: '+game.fen());
            $('#incorrect').text('');
            //game = null;
            fenCounter++
            if (fenCounter <= fenALL[puzzleCounter].fens.length-2) {
                // $('#debug3').text(fenALL[puzzleCounter].fens[fenCounter]+' fenCounter: '+fenCounter+' length: '+fenALL[puzzleCounter].fens.length);
                console.log(fenALL[puzzleCounter].fens[fenCounter]+' fenCounter: '+fenCounter+' length: '+fenALL[puzzleCounter].fens.length);
                //game = new Chess(fenALL[puzzleCounter].fens[fenCounter]);
                game.load(fenALL[puzzleCounter].fens[fenCounter]);
            } else {
                successCounter++
                $('#successCounter').text(successCounter);
                //board.clear()
                nextFEN();
                
                $('#correct').text('');
                $('#incorrect').text('');
            }
        } else {
            if (rush) {
                // errou! ir para o proximo
                //board.clear()
                nextFEN();
                
            } else {
                fenCounter--;
                $('#correct').text('');
                $('#incorrect').text('target: '+fenALL[puzzleCounter].fens[fenCounter+1]);
                console.log('target: '+fenALL[puzzleCounter].fens[fenCounter+1]);
                game.undo();
            }
        }
         
        if (game.game_over()) {
            $('#correct').text('');
            $('#incorrect').text('');
            // nextFEN();
        }
        
    };

    // update the board position after the piece snap
    // for castling, en passant, pawn promotion
    var onSnapEnd = function() {
        board.position(game.fen());
    };

    var cfg = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    };

    board = new ChessBoard('board', cfg);

    return {
        reset: function() {
            board.position(startpos);
            // uciCmd('setoption name Contempt Factor value 0');
            // uciCmd('setoption name Skill Level value 20');
            // uciCmd('setoption name Aggressiveness value 100');
        },
        undo: function() {
            game.undo();
            game.undo();
            return true;
        },
        getPuzzles: function(value) {
            // $('#debug3').text('value: '+value);
            console.log('value: '+value);
            moves = null;
            fenCounter = 0;
            fetch('http://localhost:3000/puzzle/list')
            .then(res => res.json())
            .then((out) => {
                fenALL = out;
                
                for (let x=0;x < fenALL.length;x++) {
                    fenALL[x].fens.length < value ? fens.push(fenALL[x]) : null
                }
                
                fenALL = fens;
                console.log(fenALL)

                game = new Chess(fenALL[puzzleCounter].fens[fenCounter]);
                if (!game.game_over()) {
                    board.position(fenALL[puzzleCounter].fens[fenCounter]);
                    fenLoaded = true;
                } else {
                    fenLoaded = false;
                }
            }).catch(err => console.log(err));
        },
        getBack() {
            game = new Chess(fenALL[--puzzleCounter].fens[fenCounter]);
            board.position(fenALL[puzzleCounter].fens[fenCounter]);
            successCounter--;
        },
        prevMove() {            
            game.undo();
            game.undo();
        }

    }    
}
