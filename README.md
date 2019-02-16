# assentials

Essential polymorphic async functions ... every, forEach, map, reduce, some, flow, pipe, when, route and more!

The `assentials` library provides asynchronous polymorphic versions of `forEach`, `every`, `map`, `reduce` and `some`. By "polymorphic" we mean you can pass in an `Array`, `Map`, `Set`, `generator`, `async generator`, or even an `object`.

The `assentials` library also provides asynchronous sequenced processing of functions, Regular Expressions, and literals through versions of `flow`, `pipe`, `when` and `route`.

Finally, there is a `parallel` function which will provide the same argument to multiple functions and run them in parallel (to the degree JavaScript supports parallel processing). It returns a `Promise` for an array of the final results in the order they are resolved.

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

All sequence processing functions take one of more functions or literal values as their arguments. During processing, literals values are treated like they are functions of the form `(value) => value`.

`async any flow(function||any arg[,...])(any input)`

* Processes each argument by providing as an input the output of the previous argument's evaluation. As a result, any literals will simply replace the value from upstream and become the input for the next argument's evaluation. The flow will abort and return `undefined` if anything evaluates to `undefined`; otherwise, it will return the final evaluation.


`async any pipe(function||any arg[,...])(any input)`

* Processes each argument by providing as an input the output of the previous argument's evaluation. As a result, any literals will simply replace the value from upstream and become the input for the next argument's evaluation. The flow will continue through the last argument and return its evaluation. Functions within the flow must know how to handle `undefined` if an upstream argument can possible evaluate to `undefined`.

`async any route(function||RegExp||boolean||number||string condition,function||any arg[,...])(input)`

 * Tests the `condition` against the `input`, and if `true` process each arg until the end or one evaluates to `undefined`. Always returns the `input`. Think of it like a package routing through many handlers who may look at or modify the contents of the package, but at the end of the day must deliver it to the next recipient in the chain before it utlimately gets delivered to the requestor.
 
 * For convenience, there is a `router(route aRoute[,...])` which takes a bunch or routes as its arguments. This function is itself a route whose first condition is always met. This allows nesting of routes. Typically, routes will be used with destructuring assignment. You can route just about any object, but frequently they will be http request/response pairs or browser events, e.g.
 
 ```
 const handler = assentials.router(
 	route(({request:{url}}) => url!=null,({request}) => request.location = new Location(url)),
 	route(({request:{body}}) => body.length>0, ({request}) => request.body = bodyParser(request.body)),
 	...
 	route(({response:{sent}}) => !sent,({response}) => { response.status = 404; response.end("Not Found"); })
 	);
 	
 http.createServer(function (request, response) {
  handler({request,response});
}).listen(8080);
 
 ```
 
 You can also use a router for generalized destructive object transformation, which is effectively what is happening above. For non-destructive transformation us `map`.
 

`async any when(function||RegExp||boolean||number||string condition,function||any arg[,...])(input)`

 * Tests the `condition` against the `input`, and if `true` process each arg until the end or one evaluates to `undefined`. Returns the last evalutation. Otherwise, if the condition fails, returns the `input`.


## Parallel Processing Functions

`async Array parallel(function f,[...])(any arg[,...])`

Calls all the functions with the provided arguments. If any are asynchronous will await their resolution and returns a `Promise` for an array of results in the order they were resolved.


# Internals

For the iterating functions, `assentials` first turns the target of iteration into an asynchronous generator. This allows all subsequent logic to, for the most part, avoid conditionalizing on the type of item being iterated and keeps the code base small and easy to test.

# Updates (reverse chronological order)

2019-02-16 v1.0.0b Initial public release.
