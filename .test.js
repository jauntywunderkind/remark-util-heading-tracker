#!/usr/bin/env node
import tape from "tape"
import { linkExtract, HeadingTracker} from "./heading-tracker.js"

tape( "can parse link from headering text", function( t){
	t.deepEqual( linkExtract( "ok # {#place}"),{ text: "ok", link: "place"})
	t.end()
})

tape( "can parse heading with no link", function( t){
	t.deepEqual( linkExtract( "no link here"),{ text: "no link here"})
	t.end()
})
