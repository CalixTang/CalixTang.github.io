const input_id = "bld-vis-input";
const player_id = "bld-vis-player";
const vis_alg_id = "bld-vis-full-alg"

const sheets_read_api_key = 'AIzaSyBNbrZ8i83cWf7CJuLlr3wuzCjmffE0E8k';

// TODO: make a 5bld sheet and link here
const bld_sheet_ids = new Map([
    ["3x3x3", "173B6VXROBCyCceSZ7sKPeWW0lZYNo1b5HvtVRlDUW_8"], 
    ["4x4x4", "1vcmUqvBrkvsviOJc2dY16kGU6fSKPM5I2T_L33LUGpM"], 
    ["5x5x5", "11nBD2RWxEorVhvKHgcw9CWHEqvUy0FYWpuNxwefspUM"]
]);

//TODO: add 2e2e, 2c2c, Parities, etc
const bld_sheet_commsheet_names = new Map([
    ["3x3x3", ['UF', 'UB', 'UR', 'UL', 'FR', 'FL', 'DF', 'DB', 'DR', 'DL', 'UFR', 'UFL', 'UBR', 'UBL', 'DFR', 'DFL']], 
    ["4x4x4", ['Ufr (centers)', 'UFr (wings)', 'UFR (corners)']],
    ["5x5x5", []]
]);

let main_db = new Map();

function update_twisty_player() {
    let alg_input = document.getElementById(input_id);
    let twist_player = document.getElementById(player_id);
    let alg_text_elem = document.getElementById(vis_alg_id);
    let alg_input_text = alg_input.value;

    //figure out puzzle
    let puzzle = "3x3x3";
    
    //check if puzzle is explicitly given first - if not, infer (and default to smallest possible)
    const puzzle_regex = /\[([3-5])x\1(?:x\1)?\]/g
    let explicit_puzzle = alg_input_text.match(puzzle_regex);
    if (explicit_puzzle != null) {
        explicit_puzzle = explicit_puzzle[0].replaceAll("[", "").replaceAll("]", "").trim();
        if (explicit_puzzle.length == 3) {
            explicit_puzzle = explicit_puzzle + "x" + explicit_puzzle.at(0); //turn nxn to nxnxn
        }
        puzzle = explicit_puzzle;

        alg_input_text = alg_input_text.replaceAll(puzzle_regex, "").trim();
    } else {
        //try to infer the puzzle type.
        let temp_buf = alg_input_text.trim().split("-")[0]; 
        if (temp_buf.match(/([a-z]+)/) != null) {
            //if there are any lowercase letters in the piece name, it can't be 3x3.
            //the only case where we can safely assume 5x5 is for + centers (Uf, Fu, etc). otherwise, we assume 4x4.
            if (temp_buf.length == 2) {
                puzzle = "5x5x5";
            } else {
                puzzle = "4x4x4";
            }
        } 
    }
    

    //search up algo
    let alg = search_comm(alg_input_text);
    console.log(alg);
    

    //update the twisty-player algo
    if (alg !== null) {
        let full_alg = expand_comm(alg);
        twist_player.setAttribute("experimental-setup-alg", invert_alg(full_alg));
        twist_player.alg = full_alg;
        twist_player.puzzle = puzzle;
        alg_text_elem.textContent = full_alg;
    }
}

function search_comm(comm_input) {
    comm_input = comm_input.trim();

    if (is_singmaster_not(comm_input)) {
        let targets = comm_input.split("-");
        try {
            //TODO - make sure that ambiguous targets map correctly (ex UFR = URF)

            let comm_algo = main_db.get(targets[0]).get(targets[1]).get(targets[2]);

            return expand_comm(comm_algo);
        } catch (e) {
            //TODO: provide user feedback to say invalid algo
            console.log("Error in querying singmaster alg");
            console.log(e);
        }
        
    } else {
        console.log("Alg is not in a valid notation.")
        return null;
    }
}

function is_singmaster_not(comm_input) {
    const re = /^[UDFBRLudfbrl]{2,3}-[UDFBRLudfbrl]{2,3}-[UDFBRLudfbrl]{2,3}$/;
    return comm_input.match(re) != null;
}

function invert_alg(alg) {
    return invert_tokenized_alg(alg.trim().split(" ")).join(" ");
}

function invert_tokenized_alg(alg) {
    return alg.slice().reverse().map(x => {
        if (x.at(-1) == "'") {
            return x.slice(0, -1);
        } else {
            return x + "'";
        }
    });
}

function expand_comm(comm_algo) {
    /** Transform a commutator from comm notation to a fully expanded algo. 
     * 
     * I trust myself to make my comms non-ambiguous, but in the case of something like A, B, C I interpret it as A, (B, C)
     * 
     */

    function apply_operator(A, B, op) {
        // console.log("operators:", A, B, op);
        /** Applies the operator A [op] B in notation. 
         *  A , B = A B A' B'
         *  A / B = A B A2 B' A
         *  A : B = A B A' 
         */
        let res = [];
        if (op == ',') {
            res = A.concat(B, invert_tokenized_alg(A), invert_tokenized_alg(B));
        } else if (op == '/') {
            res = A.concat(B, A, A, invert_tokenized_alg(B), A);
        } else if (op == ':') {
            res =  A.concat(B, invert_tokenized_alg(A));
        } else if (op == null) {
            res = A.concat(B);
        } else {
            throw new InvalidOperationException(`apply_operator (comm): cannot apply operator {op} in comm notation!`);
        }
        // console.log("result:", res);
        return res;
    }

    function on_same_axis(A, B) {
        /** Check if two moves are on the same axis.
         * 
         */

        let A_move = A.match(/([A-Za-z]+)/)[0]
        let B_move = B.match(/([A-Za-z]+)/)[0]

        const move_axes = new Map([
            ["F", "x"],
            ["Fw", "x"],
            ["B", "x"],
            ["Bw", "x"],
            ["f", "x"],
            ["b", "x"],
            ["S", "x"],
            ["x", "x"],
            ["U", "y"],
            ["Uw", "y"],
            ["D", "y"],
            ["Dw", "y"],
            ["u", "y"],
            ["d", "y"],
            ["E", "y"],
            ["y", "y"],
            ["R", "z"],
            ["Rw", "z"],
            ["L", "z"],
            ["Lw", "z"],
            ["r", "z"],
            ["l", "z"],
            ["M", "z"],
            ["z", "z"]
        ])

        return move_axes.get(A_move) == move_axes.get(B_move);
    }

    function is_same_move(A, B) {
        let A_move = A.match(/([A-Za-z]+)/)[0]
        let B_move = B.match(/([A-Za-z]+)/)[0]
        return A_move == B_move;
    }

    function cancel_moves(A, B) {
        /** Cancels two moves (singular tokens). This algo only handles direct cancel cases like U U  = U2, U U' = (). Does not handle Uw D' = y
         * 
         * params
         * 
         * returns - the move resulting from the cancel, or null in the case of a complete cancel
         * 
         *  
         */
        function get_n(move) {

            //parse dir
            let dir = 1;
            if (move.at(-1) == "'") {
                dir = -1;
            }
            
            //if no numbers, multiplicity is 1. otherwise, parse the number
            let mult = (move.match(/([0-9]+)/) == null) ? 1 : parseInt(move.match(/([0-9]+)/)[0]);
            
            //total movement = dir * mult
            return mult * dir;
        }

        let move = A.match(/([A-Za-z]+)/)[0]
        if (is_same_move(A, B)) {
            let a_n = get_n(A);
            let b_n = get_n(B);

            let n = (a_n + b_n) % 4;
            if (n == 0) {
                return null;
            } else if (n == 1) {
                return move;
            } else if (n == 3) {
                return move + "'";
            } else {
                return move + "2";
            }
        }

        throw new InvalidOperationException(`cancel_moves (comm): cannot cancel these moves: ${A}, ${B}`);
    }

    //part 1: expand alg and remove comm notation 

    //regex strings
    const tokenize_regex = /([A-Za-z0-9(),:\/']+)([A-Z(),:\/])/g; //alphanumeric/parentheses/operator followed by parentheses/operator
    const operator_regex = /[,:\/]/g; //operators (comma, colon, forwards slash)

    //remove surrounding whitespace
    comm_algo = comm_algo.trim();

    //put spaces before commas, parentheses, colon, and slash. also tokenize
    while (comm_algo.match(tokenize_regex) != null) {
        comm_algo = comm_algo.replace(tokenize_regex, "$1 $2");
    }
    let tokenized_comm_algo = comm_algo.split(' ');
    let stack = [];
    let op_1 = [];
    let op_2 = [];
    let op = null;

    let i = 0;
    while (i < tokenized_comm_algo.length) {
        let curr_token = tokenized_comm_algo[i];

        // console.log("op_1, op_2, op, stack, curr_token | ", op_1, op_2, op, stack, curr_token )

        if (curr_token.at(0) == ')') {
            //consider (A: (B: C, D), E) -> (A: (B: C D C' D'), E) -> (A: B C D C' D' B', E) -> (A: B C D C' D' B' E B D C D' C' B' E') -> (A B C D C' D' B' E B D C D' C' B' E' A')
            let phrase = apply_operator(op_1, op_2, op);
            op_2 = phrase;
            op_1 = []
            op = null;

            while (stack.length > 0) {
                //first stack layer - pop off stack until we see a ( or bottom of stack.
                let prev_token = stack.pop();

                if (prev_token == '(') {
                    phrase = apply_operator(op_1, op_2, op);
                    op_1 = [];
                    op_2 = [];
                    op = null;

                    //edge case
                    if (stack.length == 0) {
                        if (curr_token.length > 1) {
                            phrase = Array(parseInt(curr_token.slice(1))).fill(phrase).flat();
                        } 
                        op_1 = phrase;
                    }

                    //go back until the next ( or until we get an implicit ( from bottom of stack or the second operator we see
                    while (stack.length > 0) {
                        let stack_token = stack.pop();

                        if (stack_token == '(') {
                            if (curr_token.length > 1) {
                                phrase = Array(parseInt(curr_token.slice(1))).fill(phrase).flat();
                            }           

                            if (op == null) {
                                op_1 = op_1.concat(phrase);
                            } else {
                                op_2 = op_2.concat(phrase);
                            }

                            //this left parentheses does still belong on the stack
                            stack.push(stack_token);
                            break;
                        } else if (stack_token.match(operator_regex) != null) {
                            if (op == null) {
                                op = stack_token;
                            } else {
                                //we know that we should return now

                                //replace the operator on stack
                                stack.push(stack_token);

                                //op 1, op, and op 2 can remain. we know that phrase belongs to op 2.
                                if (curr_token.length > 1) {
                                    phrase = Array(parseInt(curr_token.slice(1))).fill(phrase).flat();
                                }           
                                op_2 = op_2.concat(phrase);

                                break;
                            }
                        } else {
                            if (op == null) {
                                op_2.unshift(stack_token);
                            } else {
                                op_1.unshift(stack_token);
                            }
                        }
                    } 

                    break;
                } else if (prev_token.match(operator_regex) != null) {
                    if (op == null) {
                        op = prev_token;
                    } else {
                        //while we haven't hit the bottom of stack or a (, we can safely assume that we should handle the operation now
                        phrase = apply_operator(op_1, op_2, op);
                        op_2 = phrase;
                        op = prev_token;
                        op_1 = [];
                    }
                } else {
                    if (op == null) {
                        op_2.unshift(prev_token);
                    } else {
                        op_1.unshift(prev_token);
                    }
                }
            }

        } else if (curr_token.match(operator_regex) != null) {
            if (op == null) {
                op = curr_token;
            } else {
                //replace operator and assume an implicit ( that makes op2 now op1.
                //A: B, C would have op1 = A, op2 = B, op = : before the comma, but afterwards we want to process op1 = B, op2 = C, op = ,
                stack = stack.concat(op_1, op);
                op_1 = op_2;
                op_2 = [];
                op = curr_token;
            }
        } else if (curr_token == "(") {
            //new parentheses always pushes everything onto the stack
            stack = stack.concat(op_1, op == null ? [] : op, op_2, curr_token);
            op_1 = [];
            op_2 = [];
            op = null;
        } else {
            //append to the correct operand
            if (op == null) {
                op_1 = op_1.concat(curr_token);
            } else {
                op_2 = op_2.concat(curr_token);
            }
        }
        
        i++;
    }
    

    let phrase = apply_operator(op_1, op_2, op);
    op_2 = phrase;
    op_1 = []
    op = null;

    while (stack.length > 0) {
        //first stack layer - pop off stack until we see a ( or bottom of stack.
        let prev_token = stack.pop();

        if (prev_token == '(') {
            throw new SyntaxError(`Imbalanced parentheses in expression ${comm_algo}`);
        } else if (prev_token.match(operator_regex) != null) {
            if (op == null) {
                op = prev_token;
            } else {
                //while we haven't hit the bottom of stack or a (, we can safely assume that we should handle the operation now
                phrase = apply_operator(op_1, op_2, op);
                op_2 = phrase;
                op = prev_token;
                op_1 = [];
            }
        } else {
            if (op == null) {
                op_2.unshift(prev_token);
            } else {
                op_1.unshift(prev_token);
            }
        }
    }

    let expanded_tokenized_algo = apply_operator(op_1, op_2, op);

    //part 2: apply cancellations
    let alg = expanded_tokenized_algo.slice();
    i = 0;
    let len = alg.length;
    while (i < len - 1) {
        let curr_token = alg[i];
        let next_token = alg[i + 1];

        if (on_same_axis(curr_token, next_token)) {
            if (is_same_move(curr_token, next_token)) {
                //check against next token
                let res = cancel_moves(curr_token, next_token);
                if (res != null) {
                    alg[i] = res;
                    alg.splice(i + 1, 1);
                } else {
                    alg.splice(i, 2);
                }
            } else if (i < len - 2 && is_same_move(curr_token, alg[i + 2])) { 
                //if on the same axis as next token, can check next next token
                let res = cancel_moves(curr_token, alg[i + 2]);
                if (res != null) {
                    alg[i] = res;
                    alg.splice(i + 2, 1);
                } else {
                    alg.splice(i + 2, 1);
                    alg.splice(i, 1);
                }
            } else {
                i++;
            }
        } else {
            i++;
        }
        
        //update len
        len = alg.length;
    }

    return alg.join(' ');
}

async function fetch_url_data(url) {
    const response = await fetch(url);
    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }
    
    const data = await response.json();
    return data;
}

function process_commsheet(algsheet) {
    /** Process a comm sheet!
     * TODO implement
     */

    let comm_map = new Map();

    for (let i = 1; i < algsheet.length - 1; i++) {
        let first_target = algsheet[algsheet.length - 1][i];
        let first_target_map = new Map();

        for (let j = 1; j < algsheet.length - 1; j++) {
            let second_target = algsheet[j][algsheet.length - 1];
            let alg = algsheet[j][i];

            first_target_map.set(second_target, alg);
        }
        comm_map.set(first_target, first_target_map);
    }

    return comm_map;
}

function main() {
    // main_db = new Map();

    for (let [puzzle, spreadsheet_id] of bld_sheet_ids) {
        for (let sheet_name of bld_sheet_commsheet_names.get(puzzle)) {
            
            let api_url_base = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${sheet_name}?key=${sheets_read_api_key}`;
            // let raw_algsheet = fetch_url_data(api_url_base);
            fetch_url_data(api_url_base).then(data => {
                let algsheet_arr = data.values;
                let processed_algsheet = process_commsheet(algsheet_arr);
                // console.log(processed_algsheet);
                let canonical_sheet_name = sheet_name.split(' ')[0];
                main_db.set(canonical_sheet_name, processed_algsheet);
            });
        }
    }

    let alg_input = document.getElementById(input_id);
    alg_input.addEventListener("input", () => {
        update_twisty_player();
      });


    // let test_cases = [
    //     "((R2: R' U' R), E)",
    //     "(R2: R' U' R), E",
    //     "R2: R' U' R, E",
    //     "R2 L2 R2 L2"
    // ]

    // for (let test_case of test_cases) {
    //     console.log(test_case, " | ", expand_comm(test_case))
    // }
    
}
main();
// TODO: implement logic so that only the bld visualizer page gets to use this script