var mocha,
	chai,
	expect,
	assentials;
if(typeof(window)==="undefined") {
	chai = require("chai");
	expect = chai.expect;
	assentials = require("../index.js");
}

describe("leftEqual",function() {
	it("array",async () => {
		const result = await assentials.leftEqual([1,2],[1,2,3]);
		expect(result).equal(true);
	});
	it("array fail",async () => {
		const result = await assentials.leftEqual([1,2],[1,3,2]);
		expect(result).equal(false);
	})
});

describe("every",function() {
	it("array",async () => {
		const result = await assentials.every([1,2,3],item => typeof(item)==="number");
		expect(result).equal(true);
	});
	it("Set",async () => {
		const result = await assentials.every(new Set([1,2,3]),item => typeof(item)==="number");
		expect(result).equal(true);
	});
	it("Map",async () => {
		const result = await assentials.every(new Map([[1,1],[2,2],[3,3]]),item => typeof(item)==="number");
		expect(result).equal(true);
	})
	it("generator", async () => {
		const result = await assentials.every((function *() { for(const item of [1,2,3]) yield item;})(),item => typeof(item)==="number");
		expect(result).equal(true);
	});
	it("async generator", async () => {
		const result = await assentials.every((async function *() { for(const item of [1,2,3]) yield item;})(),item => typeof(item)==="number");
		expect(result).equal(true);
	});
	it("document tree",async () => {
		const result = await assentials.every({1:1,2:{2:2}},item => typeof(item)==="number");
		expect(result).equal(true);
	});
	it("document tree nodes",async () => {
		const result = await assentials.every({1:1,2:{2:2}},item => typeof(item)==="number" || (item && typeof(item)==="object"),true);
		expect(result).equal(true);
	})
});
describe("some",function() {
	it("array",async () => {
		const result = await assentials.some(["1",2,3],item => typeof(item)==="number");
		expect(result).equal(true);
	});
	it("Set",async () => {
		const result = await assentials.some(new Set(["1",2,3]),item => typeof(item)==="number");
		expect(result).equal(true);
	});
	it("Map",async () => {
		const result = await assentials.some(new Map([[1,"1"],[2,2],[3,3]]),item => typeof(item)==="number");
		expect(result).equal(true);
	})
	it("generator", async () => {
		const result = await assentials.some((function *() { for(const item of ["1",2,3]) yield item;})(),item => typeof(item)==="number");
		expect(result).equal(true);
	});
	it("async generator", async () => {
		const result = await assentials.some((async function *() { for(const item of ["1",2,3]) yield item;})(),item => typeof(item)==="number");
		expect(result).equal(true);
	});
	it("document tree",async () => {
		const result = await assentials.some({1:"1",2:{2:2}},item => typeof(item)==="number");
		expect(result).equal(true);
	});
	it("document tree nodes",async () => {
		const result = await assentials.some({1:"1",2:{2:2}},item => typeof(item)==="number",true);
		expect(result).equal(true);
	})
});

describe("forEach",function() {
	it("array",async () => {
		const result = [];
		await assentials.forEach([1,2,3],item => result.push(item));
		expect(result.length).equal(3);
	});
	it("Set",async () => {
		const result = [];
		await assentials.forEach(new Set([1,2,3]),item => result.push(item));
		expect(result.length).equal(3);
	});
	it("Map",async () => {
		const result = [];
		await assentials.forEach(new Map([[1,1],[2,2],[3,3]]),item => result.push(item));
		expect(result.length).equal(3);
	})
	it("generator", async () => {
		const result = [];
		await assentials.forEach((function *() { for(const item of [1,2,3]) yield item;})(),item => result.push(item));
		expect(result.length).equal(3);
	});
	it("async generator", async () => {
		const result = [];
		await assentials.forEach((async function *() { for(const item of [1,2,3]) yield item;})(),item => result.push(item));
		expect(result.length).equal(3);
	});
	it("document tree", async () => {
		const result = [];
		await assentials.forEach({name:"joe",address:{city:"Seattle",zipcode:{base:"98101"}},age:27},item => result.push(item));
		expect(result.length).equal(4);
	});
	it("document tree nodes", async () => {
		const result = [];
		await assentials.forEach({name:"joe",address:{city:"Seattle",zipcode:{base:"98101"}},age:27},item => result.push(item),true);
		expect(result.length).equal(6);
		//console.log(result);
	})
});

describe("map",function() {
	it("array",async () => {
		const result = await assentials.map([1,2,3],item => item);
		expect(result.length).equal(3);
	});
	it("Set",async () => {
		const result = await assentials.map(new Set([1,2,3]),item => item);
		expect(result.size).equal(3);
	});
	it("Map",async () => {
		const result = await assentials.map(new Map([[1,1],[2,2],[3,3]]),item => item);
		expect(result.size).equal(3);
	})
	it("generator", async () => {
		const result = await assentials.map((function *() { for(const item of [1,2,3]) yield item;})(),item => item);
		let i = 0;
		for(const item of result) i++;
		expect(i).equal(3);
	});
	it("async generator", async () => {
		const result = await assentials.map((async function *() { for(const item of [1,2,3]) yield item;})(),item => item);
		let i = 0;
		for await(const item of result) i++;
		expect(i).equal(3);
	});
	it("document tree", async () => {
		const object = {name:"joe",address:{city:"Seattle",zipcode:{base:"98101"}}},
			result = await assentials.map(object,item => item);
		expect(JSON.stringify(result)).equal(JSON.stringify(object));
	})
});

describe("reduce",function() {
	it("array",async () => {
		const result = await assentials.reduce([1,2,3],(accum,item) => accum += item);
		expect(result).equal(6);
	});
	it("Set",async () => {
		const result = await assentials.reduce(new Set([1,2,3]),(accum,item) => accum += item);
		expect(result).equal(6);
	});
	it("Map",async () => {
		const result = await assentials.reduce(new Map([[1,1],[2,2],[3,3]]),(accum,item) => accum += item);
		expect(result).equal(6);
	})
	it("generator", async () => {
		const result = await assentials.reduce((function *() { for(const item of [1,2,3]) yield item;})(),(accum,item) => accum += item);
		expect(result).equal(6);
	});
	it("async generator", async () => {
		const result = await assentials.reduce((async function *() { for(const item of [1,2,3]) yield item;})(),(accum,item) => accum += item);
		expect(result).equal(6);
	});
	it("document tree", async () => {
		const result = await assentials.reduce({1:1,2:{2:2},3:{3:{3:3}}},(accum,item) => accum += item);
		expect(result).equal(6);
	})
});

describe("pipe",function() {
	it("sum",async () => {
		const result = await assentials.pipe(n => n+1,n => n+2,n => n+3)(0);
		expect(result).equal(6);
	});
	it("undefined",async () => {
		const result = await assentials.pipe(n => n+1,n => n+2,n => undefined,n => n+3)(0);
		expect(isNaN(result)).equal(true);
	});
	it("override",async () => {
		const result = await assentials.pipe(n => n+1,2,n => n+3)(0);
		expect(result).equal(5);
	});
})

describe("flow",function() {
	it("sum",async () => {
		const result = await assentials.flow(n => n+1,n => n+2,n => n+3)(0);
		expect(result).equal(6);
	});
	it("undefined",async () => {
		const result = await assentials.flow(n => n+1,n => n+2,n => undefined, n => n+3)(0);
		expect(result).equal(undefined);
	});
	it("override",async () => {
		const result = await assentials.flow(n => n+1,2,n => n+3)(0);
		expect(result).equal(5);
	});
})

describe("when",function() {
	it("literal",async () => {
		const result = await assentials.when(0,assentials.pipe(n => n+1,n => n+2,n => n+3))(0);
		expect(result).equal(6);
	});
	it("literal fail",async () => {
		const result = await assentials.when(1,assentials.pipe(n => n+1,n => n+2,n => n+3))(0);
		expect(result).equal(0);
	});
	it("function",async () => {
		const result = await assentials.when(value => value===0,assentials.pipe(n => n+1,n => n+2,n => n+3))(0);
		expect(result).equal(6);
	});
	it("function fail",async () => {
		const result = await assentials.when(value => value===1,assentials.pipe(n => n+1,n => n+2,n => n+3))(0);
		expect(result).equal(0);
	});
	it("RegExp",async () => {
		const result = await assentials.when(/0/,assentials.pipe(n => n+1,n => n+2,n => n+3))("0");
		expect(result).equal("0123");
	});
	it("RegExp fail",async () => {
		const result = await assentials.when(/1/,assentials.pipe(n => n+1,n => n+2,n => n+3))("0");
		expect(result).equal("0");
	});
})

describe("trigger",function() {
	it("true",async () => {
		let resolver = false;
		const promise = new Promise((resolve) => resolver = resolve);
		const result = await assentials.trigger(async (arg)=>arg,(arg) => resolver(triggered=arg))(true);
		expect(result).equal(true);
		await promise;
		expect(triggered).equal(true);
	});
	it("false",async () => {
		let triggered = false;
		const promise = new Promise((resolve) => resolver = resolve);
		const result = await assentials.trigger(async (arg)=>arg,(arg) => resolver(triggered=arg))(false);
		expect(result).equal(false);
		setTimeout(() => resolver(result));
		await promise;
		expect(triggered).equal(false);
	});
})

describe("route",function() {
	it("all succeed",async () => {
		const result = await assentials.route(({sum}) => typeof(sum)==="number",o => o.sum+=1,o => o.sum+=2,o => o.sum+=3,o => ({value:o,done:true}))({sum:0});
		expect(result.sum).equal(6);
	});
	describe("router",function() {
		let num, object, map, set;
		const router = assentials.router(
				assentials.route(({id})=>id===1,(item) => item.done=true),
				assentials.route(/aPath/,(item) => { 
					return {value:true,done:true}; 
				}),
				assentials.route(1,(item) => { 
					return {done:true,value:item}; 
				}),
				assentials.route({name:"joe",age:27},
						(item) => {
							return object = true;
						}),
				assentials.route(new Map([[1,1],[2,2]]),(item) => map = true),
				assentials.route(new Set([1,2]),(item) => set = true),
				//assentials.route(1,() => { return {done:true}; }),
				//assentials.route(1,() => num = undefined),
				assentials.route(
						{
							[/name/]:"mary"
						},
						(item) => object = true
					),
				assentials.route(
					{
						[(key) => /name/.test(key)]:"bill"
					},
					(item) => object = true
				),
				assentials.route(
						{
							[function (key) {
								/name/.test(key)
							}]:"john"
						},
						(item) => object = true
					)
			);
		it("object", async () => {
			const result = await router({id:1});
			expect(result.done).equal(true);
		});
		it("object fail", async () => {
			const result = await router({id:2});
			expect(result.done).equal(undefined);
		});
		it("regexp", async () => {
			const result = await router("aPath");
			expect(result).equal(true);
		});
		it("regexp fail", async () => {
			regexp = undefined;
			const result = await router("anotherPath");
			expect(regexp).equal(undefined);
		});
		it("literal with done", async () => {
			const result = await router(1);
			expect(result).equal(1);
		});
		it("literal fail", async () => {
			num = undefined;
			const result = await router(2);
			expect(num).equal(undefined);
		});
		it("object", async () => {
			const result = await router({name:"joe",age:27});
			expect(object).equal(true);
		});
		it("object fail", async () => {
			object = undefined;
			const result = await router({name:"joe",age:26});
			expect(object).equal(undefined);
		});
		it("Map", async () => {
			const result = await router(new Map([[1,1],[2,2]]));
			expect(map).equal(true);
		});
		it("Map fail", async () => {
			map = undefined;
			const result = await router(new Map([[1,1],[2,1]]));
			expect(map).equal(undefined);
		});
		it("Set", async () => {
			const result = await router(new Set([1,2]));
			expect(set).equal(true);
		});
		it("Set fail", async () => {
			set = undefined;
			const result = await router(new Set([1,3]));
			expect(set).equal(undefined);
		});
		it("object regexp", async () => {
			const result = await router({age:27,name:"mary"});
			expect(object).equal(true);
		});
		it("object arrow", async () => {
			const result = await router({age:27,name:"bill"});
			expect(object).equal(true);
		});
		it("object function", async () => {
			const result = await router({age:27,name:"john"});
			expect(object).equal(true);
		});
	});
});

describe("parallel",function() {
	it("ordered",async () => {
		const r1 = () => new Promise(resolve => setTimeout(() => resolve(2),500)),
			r2 = () => new Promise(resolve => resolve(0)),
			r3 = () => new Promise(resolve => setTimeout(() => resolve(1))),
			r4 = () => new Promise(resolve => setTimeout(() => resolve(3),1000));
		const results = await assentials.parallel(r1,r2,r3,r4)();
		expect(results.every((item,index) => item===index)).equal(true);
	})
})




