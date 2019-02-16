(function() {
	"use strict";
	
	const Generator = Object.getPrototypeOf((function*() {})()).constructor,
		AsyncGenerator = Object.getPrototypeOf((async function*() {})()).constructor,
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
		return await _reduceIterable(iterable,(accum,value) => f(value) ? accum : undefined,true,{continuable:false,nodes,tree,data}) ? true : false;
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
		await _reduceIterable(iterable,(accum,value) => { 
					if(f(value)) {
						found = true;
						return undefined;
					}
					return true;
				},
				true,{continuable:false,nodes,tree,data});
		return found;
	},
	exposes = (target,api) => Object.keys(api).every((key) => typeof(target[key])==="function"),
	toTest = (data) => {
		const type = typeof(data);
		if(type==="function") {
			return data;
		}
		if(["boolean","number","string"].includes(type)) {
			return arg => arg===data;
		}
		if(data && type==="object") {
			if(data instanceof RegExp) {
				return arg => data.test(arg);
			}
		}
		return arg => arg==data;
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
	// if condition (a function, a RegExp, a literal to compare to arg) is true; 
	// evaluates the results using the arg until one is undefined or all are evaluated, return final evaluation
	// else returns the arg passed in  (which may have been modified)
	when = (condition,...results) => async (arg) => {
		if(await toTest(condition)(arg)) {
			let result;
			for(const value of results) {
				if(typeof(value)==="function") {
					result = await value(arg);
				}
				if(result===undefined) break;
			}
			return result;
		}
		return arg;
	},
	// if condition (a function, a RegExp, a literal to compare to arg) is true; 
	// evaluates the results using the arg until one is undefined or all are evaluated
	// regardless of results, returns the arg passed in (which may have been modified)
	route = (condition,...results) => async (arg) => {
		if(await toTest(condition)(arg)) {
			for(let value of results) {
				if(typeof(value)==="function") {
					value = await value(arg);
				}
				if(value===undefined) break;
			}
		}
		return arg;
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

	assentials = {every,exposes,flow,forEach,map,parallel,pipe,reduce,route,router,some,when}
	
	if(typeof(module)!=="undefined") module.exports = assentials;
	if(typeof(window)!=="undefined") window.assentials = assentials;
}).call(this)