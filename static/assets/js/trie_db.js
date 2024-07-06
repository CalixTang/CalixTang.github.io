/** This file defines a trie-style database. 
 * Unlike the original trie, if there is an "end of word", then a value that has no relation to original query should be returned.
 * stores as a relation Map (str : TrieDBNode)
 */


export class TrieDBNode {

    //private properties
    #query_token; //technically unecessary, but I'll keep it for easier debug
    #isEndOfQuery;
    #children;
    #value;

    /** Constructs a Trie Database Node. 
     * 
     * Should be called with no params when constructing the root node.
     * 
     * @param {*} query_token   - the token that corresponds to this node.
     * @param {*} isEndOfQuery  - signifies that this token is a valid end of query and has a meaningful value to return.
     * @param {*} value         - the value corresponding to this token and node, assuming that the query is valid.
     */
    constructor(query_token = null, isEndOfQuery = false, value = null) {
        this.#query_token = query_token;
        this.#isEndOfQuery = isEndOfQuery;
        this.#value = value;

        //there is never a case where we want to allow user to pass in a map for children
        this.#children = new Map();
    }

    set_query_token(query_token) {
        this.#query_token = query_token;
    }

    get_children() {
        return this.#children;
    }

    /** Adds a value using a query relative to this node. O(n) where n is length of query
     * If the query is empty, then this node will take on the value. By default, this will make this node a valid end of query.
     * 
     * @param {Array{Object}} query 
     * @param {Object} value
     */
    #add(query, value) {

        //empty query = add value to this node
        if (query.length == 0) {
            this.#value = value;
            this.#isEndOfQuery = true;
            return;
        }

        //get the next node and recurse
        let next_query_token = query.shift();
        if (!this.#children.has(next_query_token)) {
            //create a new node
            let new_node = new TrieDBNode(next_query_token);
            new_node.set_query_token(next_query_token);
            this.#children.set(next_query_token, new_node);
        }
        let next_query_node = this.#children.get(next_query_token);

        next_query_node.add(query, value);
    }

    /** Get operation relative to this trie db node. O(n) where n is length of query
     * 
     * @param {Array{Object}} query the query to search with, relative to this node.
     * @returns either a value that corresponds to the query (relative to this trie db node) or null, if none found.
     */
    #get(query) {

        if (query.length == 0) {
            if (this.#isEndOfQuery) {
                return this.#value;
            } else {
                return null;
            }
        }

        let next_query_token = query.shift();
        if (this.#children.has(next_query_token)) {
            return this.#children.get(next_query_token).get(query);
        } else {
            return null;
        }
    }

    /** Deletes the value at query. 
     * 
     * @param {Array[Object]} query the query to search with, relative to this node
     * @returns true on successful delete, false on failed delete
     */
    #delete(query) {
        if (query.length == 0) {
            if (this.#isEndOfQuery) {
                this.#value = null;
                this.#isEndOfQuery = false;
                return true;
            } else {
                return false;
            }
        }

        let next_query_token = query.shift();
        if (this.#children.has(next_query_token)) {
            return this.#children.get(next_query_token).delete(query);
        } else {
            return false;
        }
    }


    /** Check if the trie has a query relative to this node.
     * 
     * @param {Array[Object]} query the query to search with, relative to this node
     * @returns true if the trie contains the query, false otherwise. Note that if a node exists but is not a valid end of phrase, this method returns false. 
     */
    has(query) {
        return this.get(query) === null ? false : true;
    }

    //public facing add()
    add(query, value) {
        //type check
        if (!Array.isArray(query)) {
            throw new TypeError("TrieDBNode cannot get a value with a query that is not an array.")
        }

        query = query.slice();
        return this.#add(query, value);
    }

    //public facing get()
    get(query) {
        //type check
        if (!Array.isArray(query)) {
            throw new TypeError("TrieDBNode cannot get a value with a query that is not an array.")
        }

        query = query.slice();
        return this.#get(query);
    }

    //public facing delete()
    delete(query) {
        //type check
        if (!Array.isArray(query)) {
            throw new TypeError("TrieDBNode cannot get a value with a query that is not an array.")
        }

        query = query.slice();
        return this.#delete(query);
    }
}