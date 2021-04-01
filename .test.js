#!/usr/bin/env node
import tape from "tape"
import { linkExtract, HeadingTracker} from "./heading-tracker.js"
import parse from "mdast-util-from-markdown"


tape( "can parse link from headering text", function( t){
	t.deepEqual( linkExtract( "ok # {#place}"),{ text: "ok", link: "place"})
	t.end()
})

tape( "can parse heading with no link", function( t){
	t.deepEqual( linkExtract( "no link here"),{ text: "no link here"})
	t.end()
})

function *walker( text){
	const
		ast= parse( text),
		tracker= new HeadingTracker()
	for( let child of ast.children){
		tracker.visit( child)
		yield tracker
	}
}

tape( "visit a heading", function( t){
	const text= `
# hello
	`
	const walk= walker( text)
	const tracker= walk.next().value

	t.equal( tracker.depth, 1, "header 1")
	t.deepEqual( tracker.texts, [ "hello"], "heading text")
	t.deepEqual( tracker.counts, [ 1], "heading count")
	t.deepEqual( tracker.links, [ undefined], "empty links")
	t.end()
})

tape( "headers advance to next", function( t){
	const text= `
# hello # {#one}
# hi#{#two}
	`
	const walk= walker( text)
	walk.next()
	const tracker= walk.next().value

	t.equal( tracker.depth, 1, "depth 1")
	t.deepEqual( tracker.texts, [ "hi"], "next header text")
	t.deepEqual( tracker.links, [ "two"], "next header link")
	t.deepEqual( tracker.counts, [ 2], "next header count")
	t.end()
})

tape( "heading 2", function( t){
	const text= `
# h1!
## ho!
	`
	const walk= walker( text)
	walk.next()
	const tracker= walk.next().value

	t.equal( tracker.depth, 2, "depth 2")
	t.deepEqual( tracker.texts, [ "h1!", "ho!"], "heading texts")
	t.deepEqual( tracker.counts, [ 1, 1], "heading texts")
	t.end()
})

tape( "parentless heading 2", function( t){
	const text= `
## ohno
	`
	const walk= walker( text)
	const tracker= walk.next().value

	t.equal( tracker.depth, 2, "depth 2")
	t.deepEqual( tracker.texts, [ , "ohno"], "heading 2 only text")
	t.deepEqual( tracker.counts, [ 0, 1], "heading 2 only count")
	t.end()
})

tape( "pops", function( t){
	const text= `
# begin
## ok
### gone
# pop
## okok
	`
	const walk= walker( text)
	walk.next()
	walk.next()
	walk.next()
	walk.next()
	const tracker= walk.next().value

	t.equal( tracker.depth, 2, "depth 2")
	t.deepEqual( tracker.texts, [ "pop", "okok"], "popped texts")
	t.deepEqual( tracker.counts, [ 2, 1], "popped counts")
	t.end()
})
