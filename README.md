# assentials

Essential polymorphic async functions ... every, forEach, map, reduce, some, flow, pipe, when, route and more!

The `assentials` library provides asynchronous polymorphic versions of `forEach`, `every`, `map`, `reduce` and `some`. By "polymorphic" we mean you can pass in an `Array`, `Map`, `Set`, `generator`, `async generator`, or even an `object`.

The `assentials` library also provides asynchronous sequenced processing of functions, Regular Expressions, and literals through versions of `flow`, `pipe`, `when`, `route` and `router`.

`router` deserves special attention. It can handle just about anything as a condition. You can use literal matching, object destructuring, regular expressions, or functions as tests. The literal matching includes support for objects including nested values, Sets, and Maps.

Finally, there is a `parallel` function which will provide the same argument to multiple functions and run them in parallel (to the degree JavaScript supports parallel processing). It returns a `Promise` for an array of the final results in the order they are resolved.

All the above in about 1.6K minimized and gziped, 5K minimized, 10K raw!

# installation

npm install assentials

# usage

In NodeJS use:

`const assentials = require("assentials");`

In the browser, use the browserified version, `assentials.js`, in the browser directory.

There are unit tests for just about every common case in the `test/index.js` file. You can load them in a browser using `test/index.html`.

# API

## Iterating Functions

All iterating functions take the target of iteration as their first argument. When passing an `object`, the leaf nodes are by default considered the members of the item being iterated. This means that `forEach` and other functions can walk the leaves of an entire JavaScript object that might be used to represent a graph. Optionally, the branch nodes of the object can also be included in iteration.

The second argument to all the iterating functions is a function to apply to the current item being processed. This function can optionally be asynchronous itself and will be awaited.


```javascript
async every(Iterable||object object,
	boolean [async] (any value,any key,Iterable||object)=>...,
	boolean nodes)
```

 * Works like the regular JavaScript `every` function, except it supports `Generator`, `AsyncGenerator`, and `object` as `iterable`. If an `object` is passed in `nodes` can be set to `true` to process branches as well as leaves.


```javascript
undefined forEach(Iterable||object iterable,
	undefined [async] (any value,any key,object object)=>...,
	boolean nodes)
```

 * Works like the regular JavaScript `forEach` function, except it supports `Generator`, `AsyncGenerator`, and `object` as `iterable`. If an `object` is passed in `nodes` can be set to `true` to process branches as well as leaves. This is useful if processing a feedback graph like a neural net.


```javascript
async any map(Iterable||object iterable,
	any [async] (any value,any key,object object)=>...,
	boolean skipUndefined = false,
	boolean nodes)
```

 * Works like the regular JavaScript `map` function, except it returns the same class of iterable or object it was passed, e.g. if you map a `Set`, you will get a `Set` back. It also supports `Generator`, `AsyncGenerator`, and `object` as `iterable`.  You can set `skipUndefined` to `true` in order to simply skip over `undefined` values returned from the map function. In the regular JavaScript function there is no way to do this without a subsequent filter, which could be expensive. If an `object` is passed in, `nodes` can be set to `true` to process branches as well as leaves. This is useful if processing a feedback graph like a neural net.

```javascript
async any reduce(Iterable||object iterable,
	any [async] (any value,any key,object object)=>...,
	any accum,
	boolean continuable = true,
	boolean nodes)
```

 * Works like the regular JavaScript `reduce` function, except it supports `Generator`, `AsyncGenerator`, and `object` as `iterable` Setting `continuable` to `false` will abort the reduce operation as soon as the reducing function returns `undefined`. If an `object` is passed in `nodes` can be set to `true` to process branches as well as leaves. This is useful if processing a graph database structure. 


```
async some(Iterable||object object,
	boolean [async] (any value,any key,object object)=>...,
	boolean nodes)
```

 * Works like the regular JavaScript `some` function, except it supports `Generator`, `AsyncGenerator`, and `object` as `iterable`. If an `object` is passed in `nodes` can be set to `true` to process branches as well as leaves.

## Sequential Processing Functions

All sequence processing functions take one or more functions or literal values as their arguments. During processing, literal values are treated like they are functions of the form `(value) => value`.

`async any flow(function||any arg[,...])(any input)`

* Processes each argument by providing as an input the output of the previous argument's evaluation. As a result, any literals will simply replace the value from upstream and become the input for the next argument's evaluation. The flow will abort and return `undefined` if anything evaluates to `undefined`; otherwise, it will return the final evaluation. Think of it like a stream that stops flowing when there is nothing left.


`async any pipe(function||any arg[,...])(any input)`

* Processes each argument by providing as an input the output of the previous argument's evaluation. As a result, any literals will simply replace the value from upstream and become the input for the next argument's evaluation. The flow will continue through the last argument and return its evaluation. Functions within the flow must know how to handle `undefined` if an upstream argument can possibly evaluate to `undefined`. Think of it like a a real peipe that still exists even when there is nothing flowing through it.

`async any route(any condition,function||any arg[,...])(input)`

 * Tests the `condition` against the `input`, and if `true` process each arg until the end or one evaluates to `undefined` or 
 `{value: any value, done:  boolean true}`. Note: if returning a done indicator, it must have at most two keys, `done` and `value` or just `done`. This minimizes the chance of accidental aborts when inputs happen to contain properties by the name `value` or `done`, which would be hard to debug.
 
  * For convenience, there is a `router(route aRoute[,...])` which takes a bunch of routes as its arguments. This function is itself a route whose first condition is always met. This allows nesting of routes.
 
 * When used in the context of a `router`, a `route` that returns `{done: true}` will cause the router to immediatelly return; whereas `undefined` will allow the next route to be processed. 
 
 * A router always returns the `input` or `{value,done:true}`. Think of it like a package routing through many handlers who may look at or modify the contents of the package, but at the end of the day must deliver it to the next recipient in the chain before it utlimately gets delivered to the requestor, unless a valid substituion is provided via  `{value,done:true}`.
 
 * If the `condition` is a function it receives the argument and must return true if the route is to be proceesed.
 
 * Otherwise, a single value is expected that must left equal the `condition`. By "left equal" we mean that the values satisfy `===`, the condition is a regular expression and the value matches it, or the condition and value are objects and all condition property values recursively left equal the value property values. This will even work with `Map` and `Set`.  Additionally, if the condition property names can be converted into regular expressions or functions (even async ones!), they will be used to match which properties to test in the submitted value. At least one property must match. If destructuring is used, then the test must be a function that checks the destructured variables. The only thing that can't be matched is `undefined`. For example,
 
 ```javascript
 const route = assentials.route,
 
	 handler = assentials.router(
	 
	 	route(new Set("a","b"),(item) => ...), // literal left equal test
	 	
	 	route({age:21},(item) => ...), // literal left equal test
	 	
	 	route(({age}) => age>21,(item) => ...) // destructuring function test
	 	
	 	route( // property matching
			{
				// trivial case, something with a name property that has value "bill"
				[(key) => /name/.test(key)]:"bill" 
			},
			(item) => ...
		),
	 )
 ```

 
 * Typically, routes will be used with destructuring assignment or object left equal testing. You can route just about any object, but frequently they will be http request/response pairs or browser events, e.g.
 
 ```javascript
 const route = assentials.route,
 
	 handler = assentials.router(
	 
	 	// normalize urls to industry standard URL object
	 	route(({request:{url}}) => url!=null,({request}) => request.URL = new URL(url)),
	 	
	 	// literal match on "/" to change to "/index.html"
	 	route({request:{URL:{pathname:"/"}},
	 		({request}) => request.url.pathname = "/index.html"),
	 	
	 	// if no request body, abort by using {done: true}
	 	route(({request:{body}}) => !body || body.length=0,
	 		({response}) => { response.end(""); return {done:true}; }),
	 	
	 	// parse the body
	 	route(({request:{body}}) => body.length>0,
	 		({request}) => { request.body = bodyParser(request.body); }),
	 	
	 	...
	 	
	 	route(({response:{sent}}) => !sent,
	 		({response}) => { response.status = 404; response.end("Not Found"); })
	 	);
	 	
	 http.createServer(function (request, response) {
	  handler({request,response});
	}).listen(8080);
 
 ```
 
 You can also use a router for generalized destructive object transformation, which is effectively what is happening above. For non-destructive transformation us `map`.
 
 `async boolean trigger(any condition,function callback,[...])(input)`
 
 * Immediately returns the result of evaluating condition. The calls each callback. If you want to to conditionalize how the callbacks operate, then wrap them in a `flow`, `route`, `when`, or even another `trigger`.
 
 * See `route` for how `condition` is tested.
 

`async any when(any condition,function||any arg[,...])(input)`

 * Tests the `condition` against the `input`, and if `true` process each arg until the end or one evaluates to `undefined` or `{value: any value, done:  boolean true}`. Note: if returning a done indicator, it must have at most two keys, `done` and `value` or just `done`. This minimizes the chance of accidental aborts which would be hard to debug. Returns the last evalutation. Otherwise, if the condition fails, returns the `input`.
 


## Parallel Processing Functions

`async Array parallel(function f,[...])(any arg[,...])`

Calls all the functions with the provided arguments. If any are asynchronous will await their resolution and returns a `Promise` for an array of results in the order they were resolved.


# Internals

For the iterating functions, `assentials` first turns the target of iteration into an asynchronous generator. This allows all subsequent logic to, for the most part, avoid conditionalizing on the type of item being iterated and keeps the code base small and easy to test.

Converting keys into regular expression tests or functions. For keys that start with "/" and using a try block an attempt is made to convert the key into a regular expression using `const regxp = new RegExp(key)`. If it works, the function `(value) => regexp.test(value)` is returned. For keys that start with the word "function" or matches `/\(*\)*=>*` and sucessfully compiles to function using a try block. To ensure that your keys are always compilable, create them using structured assignment, e.g.:

```
{
	[/myregexp/]: value,
	// or a functionally identical key to the preceding key in the context of left equal
	[(key) => /myregexp/.test(key)]: value
}

```

# Updates (reverse chronological order)

2019-03-08 v1.0.10 added `trigger`

2019-03-04 v1.0.9 added regular expression and functional keys in left equal

2019-03-03 v1.0.8 documentation updates

2019-02-20 v1.0.7b `router` redefined to use a `when` as its top level to allow it to return the `value` in `{value,done:true}` if it is not `undefined`.

2019-02-19 v1.0.6b In one case leftEqual switched order or left and right. Fixed.

2019-02-19 v1.0.5b Correct object matching for routes to be leftEqual.

2019-02-18 v1.0.4b Added support for the `Iterable` continuation object `{value,done}` with `when` and `route`.

2019-02-18 v1.0.3b Minor deep equal enhancement.

2019-02-16 v1.0.2b Added object literal routing.

2019-02-16 v1.0.0b Initial public release.
