(function() {
	"use strict";
	
	const Generator = Object.getPrototypeOf((function*() {})()).constructor,
		AsyncGenerator = Object.getPrototypeOf((async function*() {})()).constructor,
		leftEqual = async (a,b) => {
		  if(a===b) return true;
		  if(typeof(a)!==typeof(b)) return false;
		  if((a && !b) || (!a && b)) return false;
		  if(a && typeof(a)==="object") {
		  	if(a instanceof RegExp) {
		  		 return a.test(b);
		  	}
		  	if(Array.isArray(a)) {
			  	if(!Array.isArray(b)) return false;
			  } 
		  	if(a instanceof Date) {
		  		if(!(b instanceof Date)) return false;
		  		return a.getTime()===b.getTime();
		  	} else if(a instanceof Map) {
		  		if(!(b instanceof Map)) return false;
		  		if(a.size!==b.size) return false;
		  		for(const [key,value] of a) {
		  			if(!await leftEqual(value,b.get(key))) return false;
		  		}
		  		return true;
		  	} else if(a instanceof Set) {
		  		if(!(b instanceof Set)) return false;
		  		if(a.size!==b.size) return false;
		  		const results = new Set();
		  		for(const avalue of a) {
		  			if(b.has(avalue)) {
		  				results.add(avalue);
		  			} else {
			  			for(const bvalue of b) {
			  				if(await leftEqual(avalue,bvalue)) {
			  					results.add(avalue);
			  				}
			  			}
		  			}
		  		}
		  		if(results.size!=a.size) return false;
		  		return true;
		  	} else{
			    return await every(Object.keys(a),async (key) => { 
			    	const test = toTest(key,true);
			    	if(typeof(test)==="function") {
			    		let count = 0;
			    		return await every(Object.keys(b),async (rkey) => {
			    			if(await test.call(a,rkey)) {
			    				count++;
			    				return await leftEqual(a[key],b[rkey]);
			    			}
				    		return true;
			    		}) && count > 0;
			    	}
			    	return await leftEqual(a[key],b[key]); 
			    });
		  	}
		  }
		  return false;
		},
	_reduceIterable = async (iterable,f,accum,{continuable,data,tree,nodes}) => {
		let i = 0;
		for await(const item of iterable) {
			let [key,value] = data instanceof Map || tree ? item : [i,item];
			if(accum===undefined && i===0) {
				if(tree && typeof(value)==="object") {
					accum = await reduce(value,f,accum,continuable,nodes,key)
				} else {
					accum = value;
				}
			} else {
				if(tree && typeof(value)==="object") {
					accum = await reduce(value,f,accum,continuable,nodes,key)
				} else {
					accum = await f(accum,value,key,data);
				}
			}
			i++;
			if(accum===undefined && !continuable) break;
		}
		return accum;
	},
	reduce = async (data,f,accum,continuable=true,nodes,recursing) => {
		if(!data || typeof(data)!=="object") {
			return f(accum,data);
		}
		if(nodes && recursing) await f(data,recursing,data);
		let iterable = data, tree;
		if(Symbol.iterator in data) {
			iterable = (async function*(data) {
				for(const item of data) {
					yield item;
				}
			})(data);
		} else if(!Array.isArray(data) && !(Symbol.asyncIterator in data)) {
			iterable = Object.entries(data);
			tree = true;
		}
		return _reduceIterable(iterable,f,accum,{continuable,data,tree,nodes});
	},
	_mapIterable = async (asyncIterable,f,accum,{skipUndefined,tree,data}) => {
		let i = 0;
		for await(const item of asyncIterable) {
			const [key,value] = data instanceof Map || tree ? item : [i,item];
			i++;
			let newvalue;
			if(tree && value && typeof(value)==="object") {
				newvalue = await map(value,f,skipUndefined);
			} else {
				 newvalue = await f(value,key,data);
			}
			if(newvalue===undefined && skipUndefined) {
				continue;
			}
			if(accum instanceof Set) {
				await accum.add(newvalue);
			} else if(accum instanceof Map || exposes(accum,{del:true,get:true,set:true,})) {
				await accum.set(key,newvalue);
			} else if(exposes(accum,{getItem:true,removeItem:true,setItem:true})) {
				await accum.setItem(key,newvalue);
			} else {
				accum[key] = newvalue;
			}
		}
		return accum;
	},
	map = async (data,f,skipUndefined) => {
		if(!data || typeof(data)!=="object") {
			return f(data);
		}
		let tree, iterable = data, accum;
		if(Symbol.iterator in data) {
			iterable = (async function*(data) {
				for(const item of data) {
					yield item;
				}
			})(data);
		} else if(!Array.isArray(data) && !(Symbol.asyncIterator in data)) {
			iterable = Object.entries(data);
			tree = true;
		}
		if(Array.isArray(data)) {
			accum = [];
		} else if(data instanceof Set) {
			accum = new Set();
		} else if(data instanceof Map) {
			accum = new Map();
		} else if(Symbol.iterator in data || Symbol.asyncIterator in data) {
			accum = [];
		} else {
			accum = Object.create(Object.getPrototypeOf(data));
		}
		accum = await _mapIterable(iterable,f,accum,{skipUndefined,tree,data});
		if(data instanceof Generator) {
			if(Symbol.iterator in data) {
				return (function*() { for(const item of accum) yield accum; })();
			}
			return (async function*() { for(const item of accum) yield accum; })();
		}
		return accum;
	},
	_forEachIterable = async (asyncIterable,f,{nodes,tree,data}) => {
		let i = 0;
		for await(const item of asyncIterable) {
			const [key,value] = data instanceof Map || tree ? item : [i,item];
			i++;
			await forEach(value,f,nodes,key);
		}
	},
	forEach = async (data,f,nodes,recursing) => {
		if(!data || typeof(data)!=="object") {
			return f(data);
		}
		if(nodes && recursing) await f(data,recursing,data);
		let tree, iterable = data;
		if(Symbol.iterator in data) {
			iterable = (async function*(data) {
				for(const item of data) {
					yield item;
				}
			})(data);
		} else if(!Array.isArray(data) && !(Symbol.asyncIterator in data)) {
			iterable = Object.entries(data);
			tree = true;
		}
		await _forEachIterable(iterable,f,{nodes,tree,data});
		return true;
	},
	every = async (data,f,nodes) => {
		let iterable = data, tree;
		if(Symbol.iterator in data) {
			iterable = (async function*(data) {
				for(const item of data) {
					yield item;
				}
			})(data);
		} else if(!Array.isArray(data) && !(Symbol.asyncIterator in data)) {
			iterable = Object.entries(data);
			tree = true;
		}
		return await _reduceIterable(iterable,async (accum,value) => await f(value) ? accum : undefined,true,{continuable:false,nodes,tree,data}) ? true : false;
	},
	some = async (data,f,nodes) => {
		let iterable = data, tree, found;
		if(Symbol.iterator in data) {
			iterable = (async function*(data) {
				for(const item of data) {
					yield item;
				}
			})(data);
		} else if(!Array.isArray(data) && !(Symbol.asyncIterator in data)) {
			iterable = Object.entries(data);
			tree = true;
		}
		await _reduceIterable(iterable,async (accum,value) => { 
					if(await f(value)) {
						found = true;
						return undefined;
					}
					return true;
				},
				true,{continuable:false,nodes,tree,data});
		return found;
	},
	exposes = (target,api) => Object.keys(api).every((key) => typeof(target[key])==="function"),
	toTest = (data,property) => {
		const type = typeof(data);
		if(type==="function") {
			return data;
		}
		if(property) {
			if(type==="string") {
				const key = data.replace(/\n/g,"");
				try {
					const i = key.lastIndexOf("/");
					if(key[0]==="/" && i>0) {
							const exp = key.substring(1,i),
								flags = key.substring(i+1),
								regexp = new RegExp(exp,flags);
							return (key) => regexp.test(key);
					} else if(key.startswith("function") || `/\(*\)*=>*`.test(key)) {
							return Function("return " + key)();
					}
				} catch(e) {
					;
				}
			}
		}
		if(data===null || ["boolean","number","string"].includes(type)) {
			return arg => arg===data;
		}
		if(data && type==="object") {
			if(data instanceof RegExp) {
				return arg => data.test(arg);
			}
		}
		return (arg) => leftEqual(data,arg);
	},
	// like pipe, but stops when accum is undefined
	flow = (...values) => async (arg) => {
		return await reduce(values,async (arg,value) => {
			return typeof(value)==="function" 
				? await value(arg) 
			: value
		},arg,false)
	},
	// passes an initial value through a series of funtions, literals may be injecte dand will replace the reduction at the point of injection
	pipe = (...values) => async (arg) => {
		return await reduce(values,async (arg,value) => {
			return typeof(value)==="function" 
				? await value(arg) 
			: value
		},arg)
	},
	// returns condition (a function, a RegExp, a literal to compare to arg) evaluation
	// if true before returning sets a timeout to start processing all callbacks
	trigger = (condition,...results) => async (arg) => {
		let done;
		if(condition!==undefined && await toTest(condition)(arg)) {
			setTimeout(() => results.forEach((result) => result(arg)));
			return true;
		}
		return false;
	},
	//if condition (a function, a RegExp, a literal to compare to arg) is true; 
	// evaluates the results using the arg until one is undefined or all are evaluated, return final evaluation
	// else returns the arg passed in  (which may have been modified)
	when = (condition,...results) => async (arg) => {
		let done;
		if(condition!==undefined && await toTest(condition)(arg)) {
			let result;
			for(let value of results) {
				if(typeof(value)==="function") {
					result = await value(arg);
				}
				if(result && typeof(result)==="object") {
					const keys = Object.keys(result);
					if(keys.length<=2 && result.done && keys.every(key => key==="done" || key==="value")) {
						done = result;
					}
				}
				if(result===undefined || done) break;
			}
			return done && done.value!==undefined ? done.value : result;
		}
		return arg;
	},
	// if condition (a function, a RegExp, a literal to compare to arg) is true; 
	// evaluates the results using the arg until one is undefined, {done: true}, or all are evaluated
	// regardless of results, returns the arg passed in (which may have been modified) unless
	// the evaluation was {value,done:true}, in which case that is returned
	route = (condition,...results) => async (arg) => {
		let done;
		if(condition!==undefined && await toTest(condition)(arg)) {
			for(let value of results) {
				if(typeof(value)==="function") {
					value = await value(arg);
				}
				if(value && typeof(value)==="object") {
					const keys = Object.keys(value);
					if(keys.length<=2 && value.done && keys.every(key => key==="done" || key==="value")) {
						done = value;
					}
				}
				if(value===undefined || done) break;
			}
		}
		return done || arg;
	},
	router = (...routes) => {
		return route(()=>true,...routes);
	},
	parallel = (...values) => async (...args) => {
		const promises = [],
			results = [];
		let i = 0;
		for(const value of values) {
			const promise = (async () => typeof(value)==="function" ? value(...args).then(result => results.push(result)) : value)();
			promises.push(promise);
			i++;
		}
		await Promise.all(promises);
		return results;
	},

	assentials = {every,exposes,flow,forEach,map,parallel,pipe,reduce,route,router,some,when,trigger,leftEqual}
	
	if(typeof(module)!=="undefined") module.exports = assentials;
	if(typeof(window)!=="undefined") window.assentials = assentials;
}).call(this)