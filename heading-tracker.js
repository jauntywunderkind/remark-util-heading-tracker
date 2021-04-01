
const linkRegex= /(.*?)\s*#\s*\{#(\w+)}$/
export function linkExtract( text){
	const link= linkRegex.exec( text)
	if( !link){
		return { text}
	}
	return {
		text: link[1],
		link: link[2]
	}
}

export class HeadingTracker{
	depth
	texts
	links
	counts
	skipped

	allowedTypes= [ "text"]
	linkExtract= linkExtract

	constructor(){
		this.reset()
	}

	reset(){
		this.depth= 0
		this.texts= []
		this.links= []
		this.counts= [ 0]
		this.warns= 0
	}

	warn( ...msg){
		console.warn( ...msg)
		++this.warns
	}

	visit( node){
		if( node.type!== "heading"){
			return
		}

		let depth= node.depth
		if (node.depth< this.depth){
			// truncate to our new shallow point
			this.texts= this.texts.slice(0, depth)
			this.links= this.links.slice(0, depth)
			this.counts= this.counts.slice(0, depth)
		}
		this.depth= depth

		// update counts
		depth--
		this.counts[ depth]=( this.counts[ depth] || 0)+ 1

		if( node.children.length> 1){
			this.warn("unexpected child count on heading")
			return
		}

		const content= node.children[ 0]
		if( this.allowedTypes.indexOf( content.type)=== -1){
			this.warn("unexpected heading content type")
			return
		}

		const heading= linkExtract( content.value)
		this.texts[ depth]= heading.text
		this.links[ depth]= heading.link
	}

	lastLink(){
		for( let i= this.links.length- 1; i>= 0; --i){
			const link= this.links[ i]
			if( link){
				return link
			}
		}
	}
}
let ht= new HeadingTracker()

export default HeadingTracker
