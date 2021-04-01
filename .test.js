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

tape( "can visit a heading", function( t){
	const text= `
# hello
	`
	const walk= walker( text)
	const tracker= walk.next().value

	t.equal( tracker.depth, 1, "header 1")
	t.deepEqual( tracker.texts, [ "hello"], "heading text")
	t.deepEqual( tracker.links, [ undefined], "empty links")
	t.end()
})

tape( "headers advance", function( t){
	const text= `
# hello
# hi
	`
	const walk= walker( text)
	walk.next()
	const tracker= walk.next().value

	t.equal( tracker.depth, 1, "header 1")
	t.deepEqual( tracker.texts, [ "hi"], "heading text")
	t.deepEqual( tracker.links, [ undefined], "empty links")
	t.end()
})
