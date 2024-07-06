import { TrieDBNode } from './trie_db.js';

const input_id = "bld-vis-input";
const player_id = "bld-vis-player";
const vis_alg_id = "bld-vis-alg";
const vis_full_alg_id = "bld-vis-full-alg";
const error_text_id = "bld-vis-error";

const SHEETS_READ_API_KEY = 'AIzaSyBNbrZ8i83cWf7CJuLlr3wuzCjmffE0E8k';

// TODO: make a 5bld sheet and link here
const BLD_SHEET_IDS = new Map([
    ["3x3x3", "173B6VXROBCyCceSZ7sKPeWW0lZYNo1b5HvtVRlDUW_8"], 
    ["4x4x4", "1vcmUqvBrkvsviOJc2dY16kGU6fSKPM5I2T_L33LUGpM"], 
    ["5x5x5", "11nBD2RWxEorVhvKHgcw9CWHEqvUy0FYWpuNxwefspUM"]
]);

//TODO: add 2e2e, 2c2c, Parities, etc
const BLD_COMM_SHEET_NAMES = new Map([
    ["3x3x3", ['UF', 'UB', 'UR', 'UL', 'FR', 'FL', 'DF', 'DB', 'DR', 'DL', 'UFR', 'UFL', 'UBR', 'UBL', 'DFR', 'DFL']], 
    ["4x4x4", ['Ufr (centers)', 'UFr (wings)', 'UFR (corners)']],
    ["5x5x5", ['Uf (%2B centers)', 'Ufr (x centers)', 'UFr (wings)', 'UF (midges)', 'UFR (corners)']]
]);

const BLD_PARITY_SHEET_NAMES = new Map([
    ["3x3x3", ["Parity"]],
    ["4x4x4", []],
    ["5x5x5", []],
    // ["4x4x4", ["4BLD Wing Parity"]]
])

const BLD_2_TARGET_SHEET_NAMES = new Map([
    ["3x3x3", ["2Flips"]],
    ["4x4x4", ["4BLD Wing Parity"]],
    ["5x5x5", []],
])

const SYNONYM_TO_STICKER = new Map([
    //corners
    ["ULB", "UBL"],
    ["URB", "UBR"],
    ["URF", "UFR"],
    ["ULF", "UFL"],
    ["LBU", "LUB"],
    ["LFU", "LUF"],
    ["LFD", "LDF"],
    ["LBD", "LDB"],
    ["FLU", "FUL"],
    ["FRU", "FUR"],
    ["FRD", "FDR"],
    ["FLD", "FDL"],
    ["RFU", "RUF"],
    ["RBU", "RUB"],
    ["RBD", "RDB"],
    ["RFD", "RDF"],
    ["BRU", "BUR"],
    ["BLU", "BUL"],
    ["BLD", "BDL"],
    ["BRD", "BDR"],
    ["DLF", "DFL"],
    ["DRF", "DFR"],
    ["DRB", "DBR"],
    ["DLB", "DBL"],
    //4 centers or x centers
    ["Ulb", "Ubl"],
    ["Urb", "Ubr"],
    ["Urf", "Ufr"],
    ["Ulf", "Ufl"],
    ["Lbu", "Lub"],
    ["Lfu", "Luf"],
    ["Lfd", "Ldf"],
    ["Lbd", "Ldb"],
    ["Flu", "Ful"],
    ["Fru", "Fur"],
    ["Frd", "Fdr"],
    ["Fld", "Fdl"],
    ["Rfr", "Ruf"],
    ["Rbu", "Rub"],
    ["Rbd", "Rdb"],
    ["Rfd", "Rdf"],
    ["Bru", "Bur"],
    ["Blu", "Bul"],
    ["Bld", "Bdl"],
    ["Brd", "Bdr"],
    ["Dlf", "Dfl"],
    ["Drf", "Dfr"],
    ["Drb", "Dbr"],
    ["Dlb", "Dbl"],
    //wings
    ["UlB", "UBl"],
    ["UbR", "URb"],
    ["UrF", "UFr"],
    ["UfL", "ULf"],
    ["LbU", "LUb"],
    ["LuF", "LFu"],
    ["LfD", "LDf"],
    ["LdB", "LBd"],
    ["FlU", "FUl"],
    ["FuR", "FRu"],
    ["FrD", "FDr"],
    ["FdL", "FLd"],
    ["RfU", "RUf"],
    ["RuB", "RBu"],
    ["RbD", "RDb"],
    ["RdF", "RFd"],
    ["BrU", "BUr"],
    ["BuR", "BRu"],
    ["BlD", "BDl"],
    ["BdL", "BLd"],
    ["DlF", "DFl"],
    ["DfR", "DRf"],
    ["DrB", "DBr"],
    ["DbL", "DLb"]
]);

const CANONICAL_EDGE_BUFFER_ORDER = ['UF', 'UB', 'UR', 'UL', 'FR', 'FL', 'DF', 'DB', 'DR', 'DL'];

const CANONICAL_CORNER_BUFFER_ORDER = ['UFR', 'UFL', 'UBR', 'UBL', 'DFR', 'DFL'];

const bld_to_cubing_notation = new Map([
    //inner layer turns
    ["u", "2U"],
    ["d", "2D"],
    ["f", "2F"],
    ["b", "2B"],
    ["r", "2R"],
    ["l", "2L"],
    ["m", "3L"],
    ["e", "3D"],
    ["s", "3F"],
])
let main_db = new TrieDBNode();

function update_twisty_player() {
    let alg_input = document.getElementById(input_id);
    let twist_player = document.getElementById(player_id);
    let alg_text_elem = document.getElementById(vis_alg_id);
    let full_alg_text_elem = document.getElementById(vis_full_alg_id);
    let error_text_elem = document.getElementById(error_text_id);
    let alg_input_text = alg_input.value;

    if (alg_input_text == "") {
        alg_input.classList.remove("error");
        
        alg_text_elem.textContent = "";
        full_alg_text_elem.textContent = "";
        error_text_elem.textContent = "";
        alg_text_elem.style = "display: none;";
        full_alg_text_elem.style = "display: none;";
        error_text_elem.style = "display: none;";

        twist_player.puzzle = "3x3x3";
        twist_player.setAttribute("experimental-setup-alg", "");
        twist_player.alg = "";

        return;
    }

    //get the puzzle type
    let {puzzle, alg_query} = extract_puzzle(alg_input_text)
    console.log("Input alg:", alg_query);
    
    //figure out algorithm type (comm, parity, twist, flip, etc.)
    let alg_type = extract_alg_type(alg_query);
    console.log("Alg type:", alg_type);
    
    //search up algo (query main db)
    let alg = search_alg(alg_query, puzzle, alg_type);
    console.log(alg);

    
    if (alg && alg.stack && alg.message) {
        //process error and update UI
        alg_input.classList.add("error");
        alg_text_elem.textContent = "";
        full_alg_text_elem.textContent = "";
        error_text_elem.textContent = alg.message;

        alg_text_elem.style = "display: none;";
        full_alg_text_elem.style = "display: none;";
        error_text_elem.style = "";
    } else if (alg !== null) {
        //update the twisty-player algo
        alg_input.classList.remove("error");

        let full_alg = expand_alg(alg);
        
        alg_text_elem.textContent = alg;
        full_alg_text_elem.textContent = full_alg;
        error_text_elem.textContent = "";

        alg_text_elem.style = "";
        full_alg_text_elem.style = "";
        error_text_elem.style = "display: none;";

        let full_alg_translated = translate_from_bld_notation(full_alg);

        twist_player.puzzle = puzzle;
        twist_player.setAttribute("experimental-setup-alg", invert_alg(full_alg_translated));
        twist_player.alg = full_alg_translated;
    } else {
        //???
    }
}

function extract_puzzle(input) {
    let puzzle = "3x3x3";
    input = input.trim();
    //check if puzzle is explicitly given first - if not, infer (and default to smallest possible)
    const puzzle_regex = /\[([3-5])x\1(?:x\1)?\]/g
    let explicit_puzzle = input.match(puzzle_regex);
    if (explicit_puzzle != null) {
        explicit_puzzle = explicit_puzzle[0].replaceAll("[", "").replaceAll("]", "").trim();
        if (explicit_puzzle.length == 3) {
            explicit_puzzle = explicit_puzzle + "x" + explicit_puzzle.at(0); //turn nxn to nxnxn
        }
        puzzle = explicit_puzzle;

        //remove the explicit puzzle spec from the input.
        input = input.replaceAll(puzzle_regex, "").trim();
    } else {
        //try to infer the puzzle type - get the first piece
        let temp_buf = input.match(/([UDFBRLudfbrl]{2,3})/)[0]
        if (temp_buf.match(/([udfbrl]+)/) != null) {
            //if there are any lowercase letters in the piece name, it can't be 3x3.
            //the only case where we can safely assume 5x5 is for + centers (Uf, Fu, etc). otherwise, we assume 4x4.
            if (temp_buf.length == 2) {
                puzzle = "5x5x5";
            } else {
                puzzle = "4x4x4";
            }
        } 
    }

    return {puzzle, alg_query: input};
}

function extract_alg_type(input) {

    const comm_regex = /^[UDFBRLudfbrl]{2,3}-[UDFBRLudfbrl]{2,3}-[UDFBRLudfbrl]{2,3}$/;
    const parity_regex = /^([UDFBRLudfbrl]{2}-[UDFBRLudfbrl]{2} [UDFBRLudfbrl]{3}-[UDFBRLudfbrl]{3}|[UDFBRLudfbrl]{3}-[UDFBRLudfbrl]{3} [UDFBRLudfbrl]{2}-[UDFBRLudfbrl]{2})$/
    const _2e2e_regex = /^[UDFBRLudfbrl]{2}-[UDFBRLudfbrl]{2} UDFBRLudfbrl]{2}-[UDFBRLudfbrl]{2}$/
    const _2c2c_regex = /^[UDFBRLudfbrl]{3}-[UDFBRLudfbrl]{3} UDFBRLudfbrl]{3}-[UDFBRLudfbrl]{3}$/

    if (input.match(comm_regex) != null) {
        return "commutator";
    } else if (input.match(parity_regex) != null) {
        return "parity";
    } else if (input.match(_2e2e_regex) != null) {
        return "2e2e";
    } else if (input.match(_2c2c_regex) != null) {
        return "2c2c";
    } else {
        return "invalid";
    }
}

function search_alg(input, puzzle, alg_type) {

    function canonify(targets){
        canonify_sticker_names(targets);
        canonify_target_orientations(targets);
        canonify_target_orders(targets);
    }

    function canonify_sticker_names(targets) {
        for (let i in targets) {
            let target = targets[i];
            if (SYNONYM_TO_STICKER.has(target)) {
                targets[i] = SYNONYM_TO_STICKER.get(target);
            }
        }
    }

    function canonify_target_orientations(targets) {
        //TOOD implement
        return
    }

    function canonify_target_orders(targets) {
        //TODO implement
        return
    }
    
    function canonify_input_comm(comm_input) {
        comm_input = comm_input.trim();
        let targets = comm_input.split("-");
        canonify(targets);

        return targets;
    }
    function canonify_input_parity(parity_input) {
        parity_input = parity_input.trim();
        let tmp_re = /^([UDFBRLudfbrl]{2}-[UDFBRLudfbrl]{2}) ([UDFBRLudfbrl]{3}-[UDFBRLudfbrl]{3})$/
        parity_input = parity_input.replace(tmp_re, "$2 $1");
        let targets = parity_input.replace(" ", "-").split("-");
        canonify(targets);
        
        return targets;
    }

    let targets = [];

    if (alg_type == "commutator") {
        targets = canonify_input_comm(input, puzzle);
    } else if (alg_type == "parity") {
        targets = canonify_input_parity(input, puzzle);
    } else if (alg_type == "twist") {
        return Error("Twists not implemented yet.")
    } else if (alg_type == "flip") {
        return Error("Flips not implemented yet.")
    } else if (alg_type == "LTCT") {
        return Error("LTCT not implemented yet.")
    } else {
        return Error(`Unrecognized algorithm type.`)
    }

    try {
        let query = [puzzle].concat(targets);

        let alg = main_db.get(query);

        return alg !== undefined ? alg : Error(`No algorithm exists for query ${input}.`);
    } catch (e) {
        return Error(`No algorithm exists for query ${input}.`);
    }
}

function translate_from_bld_notation(bld_not_alg) {
    let translated_alg = bld_not_alg.slice();
    for (const [k, v] of bld_to_cubing_notation) {
        translated_alg = translated_alg.replaceAll(k, v);
    }
    return translated_alg;
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

function expand_alg(input_alg) {
    /** Transform input from comm notation to a fully expanded alg. 
     * 
     * I trust myself to make my comms disambiguous, but in the case of something like A, B, C I interpret it as A, (B, C)
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
            ["s", "x"],
            ["x", "x"],
            ["U", "y"],
            ["Uw", "y"],
            ["D", "y"],
            ["Dw", "y"],
            ["u", "y"],
            ["d", "y"],
            ["E", "y"],
            ["e", "y"],
            ["y", "y"],
            ["R", "z"],
            ["Rw", "z"],
            ["L", "z"],
            ["Lw", "z"],
            ["r", "z"],
            ["l", "z"],
            ["M", "z"],
            ["m", "z"],
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
        /** Cancels two moves (singular tokens). This alg only handles direct cancel cases like U U  = U2, U U' = (). Does not handle Uw D' = y
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
            let mult = (move.match(/([0-9]+)/) == null) ? 1 : parseInt(move.match(/([0-9]+)/)[-1]);
            
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
    const tokenize_regex = /([A-Za-z0-9(),:\/']+)([(),:\/])|([(),:\/']+)([A-Z])/g; //alphanumeric/parentheses/operator followed by parentheses/operator
    const operator_regex = /[,:\/]/g; //operators (comma, colon, forwards slash)

    //remove surrounding whitespace
    input_alg = input_alg.trim();

    //put spaces before commas, parentheses, colon, and slash. also tokenize
    while (input_alg.match(tokenize_regex) != null) {
        input_alg = input_alg.replace(tokenize_regex, "$1 $2");
    }
    let tokenized_input_alg = input_alg.split(' ');
    let stack = [];
    let op_1 = [];
    let op_2 = [];
    let op = null;

    let i = 0;
    while (i < tokenized_input_alg.length) {
        let curr_token = tokenized_input_alg[i];

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
            throw new SyntaxError(`Imbalanced parentheses in expression ${input_alg}`);
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

    let expanded_tokenized_alg = apply_operator(op_1, op_2, op);

    //part 2: apply cancellations
    let alg = expanded_tokenized_alg.slice();
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
        console.log(response);
        throw new Error(message);
    }
    
    const data = await response.json();
    return data;
}

function process_2_target_sheet(sheet, puzzle, use_order_row_col = false) {
    /** Process a sheet that only uses 2 targets. 
     * This method is suitable for 2-swaps (wing parities), 2-twists, or 2-flips.
     * Return:
     *      a Map(target 1 : Map(target 2)), where target 1 along the column and target 2 is along the row.
     */

    let col_cap = use_order_row_col ? sheet[0].length - 1 : sheet[0].length;
    let row_cap = use_order_row_col ? sheet.length - 1 : sheet.length;

    for (let i = 1; i < row_cap; i++) {
        for (let j = 1; j < col_cap; j++) {
            let value = sheet[i][j];

            if (value != "") {
                let query = [puzzle, use_order_row_col ? sheet[i][sheet[0].length - 1] : sheet[i][0], use_order_row_col ? sheet[sheet.length - 1][j] : sheet[0][j]];
                main_db.add(query, value);
            }
            
        }
    }
}

function process_3_target_sheet(sheet, puzzle, use_order_row_col = false) {
    /** Process a sheet that involves 3 targets. 
     * This method is suitable for all 3-cycles
     * 
     * Target order: sheet[0][0], first col, first row
     */

    let col_cap = use_order_row_col ? sheet[0].length - 1 : sheet[0].length;
    let row_cap = use_order_row_col ? sheet.length - 1 : sheet.length;

    for (let i = 1; i < row_cap; i++) {
        for (let j = 1; j < col_cap; j++) {
            let value = sheet[i][j];

            if (value != "") {
                let query = [puzzle, sheet[0][0], use_order_row_col ? sheet[i][sheet[0].length - 1] : sheet[i][0], use_order_row_col ? sheet[sheet.length - 1][j] : sheet[0][j]];
                main_db.add(query, value);
            }
        }
    }
}

//no order row or col is possible for 4 target sheets
function process_4_target_sheet(sheet, puzzle) {
    /** Process a sheet that involves 4 targets. 
     * This method is suitable for all 2x-2x swaps, including parities, 2e2e, 2c2c.
     * 
     * Target order: first col, second col, first row, second row
     */

    //fill in the blanks for first col and row
    let curr_col_target = "";
    let curr_row_target = "";
    for (let i = 2; i < sheet.length - 1; i++) {
        if (sheet[i][0] != "") {
            curr_col_target = sheet[i][0];
        } else {
            sheet[i][0] = curr_col_target;
        }
        
    }
    for (let i = 2; i < sheet[0].length - 1; i++) {
        if (sheet[0][i] != "") {
            curr_row_target = sheet[0][i];
        } else {
            sheet[0][i] = curr_row_target;
        }
    }

    //sweep over everything (3.., 3..) and reference first 2 cols and rows for targets
    for (let i = 2; i < sheet.length - 1; i++) {
        for (let j = 2; j < sheet[0].length - 1; j++) {
            let value = sheet[i][j];
            
            if (value != "") {
                let query = [puzzle, sheet[i][0], sheet[i][1], sheet[0][j], sheet[1][j]];
                main_db.add(query, value);
            }
        }
    }
}


function main() {
    // main_db = new Map();

    for (let [puzzle, spreadsheet_id] of BLD_SHEET_IDS) {

        //fetch all commutator sheets
        for (let sheet_name of BLD_COMM_SHEET_NAMES.get(puzzle)) {
            
            let api_url_base = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${sheet_name}?key=${SHEETS_READ_API_KEY}`;
            // let raw_algsheet = fetch_url_data(api_url_base);
            fetch_url_data(api_url_base).then(data => {
                let algsheet_arr = data.values;
                process_3_target_sheet(algsheet_arr, puzzle, true);
            });
        }

        //fetch all parity sheets
        for (let sheet_name of BLD_PARITY_SHEET_NAMES.get(puzzle)) {
            
            let api_url_base = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${sheet_name}?key=${SHEETS_READ_API_KEY}`;
            // let raw_algsheet = fetch_url_data(api_url_base);
            fetch_url_data(api_url_base).then(data => {
                let algsheet_arr = data.values;
                process_4_target_sheet(algsheet_arr, puzzle);
            });
        }

        //fetch flip/twist sheets
        for (let sheet_name of BLD_2_TARGET_SHEET_NAMES.get(puzzle)) {
            
            let api_url_base = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${sheet_name}?key=${SHEETS_READ_API_KEY}`;
            // let raw_algsheet = fetch_url_data(api_url_base);
            fetch_url_data(api_url_base).then(data => {
                let algsheet_arr = data.values;
                process_2_target_sheet(algsheet_arr, puzzle);
            });
        }
    }

    let alg_input_timeout;

    //set up the event listener for alg input. will only process the query if no changes have been made for 250 ms
    let alg_input = document.getElementById(input_id);
    alg_input.addEventListener("input", () => {
        clearTimeout(alg_input_timeout);

        // Set a new timeout
        alg_input_timeout = setTimeout(update_twisty_player, 500);
      });


    // let test_cases = [
    //     "((R2: R' U' R), E)",
    //     "(R2: R' U' R), E",
    //     "R2: R' U' R, E",
    //     "R2 L2 R2 L2"
    // ]

    // for (let test_case of test_cases) {
    //     console.log(test_case, " | ", expand_alg(test_case))
    // }

    
    
}
main();
// TODO: implement logic so that only the bld visualizer page gets to use this script