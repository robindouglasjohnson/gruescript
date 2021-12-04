/*
 * Gruescript online help
 *
 */

Help = {

	blocks: {
		game: {},
		
		room: {},
		
		thing: {},
		
		verb: {},
		
		setverb: {},
		
		proc: {},
		
		rule: {},
		
		'var': {},
		
		tagdesc: {}
	},
	
	commands: {
		say: {
			arguments: ['string'],
			description: 'Print a string to the scroller.',
			
			example: [
				'say You awake to find yourself in a dark room!'
			],
			
			see_also: ['commands.sayat', 'misc.braced_expressions']
		},
		sayat: {
			arguments: ['room', 'string'],
			description: 'Print a string to the scroller, if the player is in the specified room.',
			example: [
				'at monkey tree_bottom',
				'sayat tree_bottom The climbs up the tree, out of sight.',
				'put monkey treetop',
				'sayat treetop A monkey climbs up here to join you.'
			],
		},
		bring: {
			arguments: ['thing'],
			description: "Put the specified thing into the player\'s current room.",
			example: [
				"say A spaceship descends from above and lands in front of you.",
				"bring spaceship"
			]
		},
		hide: {
			arguments: ['thing'],
			description: "Remove the specified thing from the game.",
			example: [
				"say You notice you've lost your pen again.",
				"hide pen"
			]
		},
		give: {
			arguments: ['thing'],
			description: "Put the specified thing into the player's inventory. The player \
				will now be holding the thing."],
			example: [
				"say The merchant winks at you and hands you a brown paper bag.",
				"give paper_bag"
			]
		},
		carry: {
			arguments: ['thing'],
			description: "Put the specified thing into the player's inventory, without \
				'holding' the thing."],
			example: [
				"say You think someone slipped something into your pocket.",
				"carry coin"
			]
		},
		put: {
			arguments: ['thing', 'room']
		},
		putnear: {},
		swap: {},
		'goto': {},
		tag: {},
		untag: {},
		tagroom: {},
		untagroom: {},
		clear: {},
		assign: {},
		write: {},
		freeze: {},
		add: {},
		random: {},
		count: {},
		pick: {},
		status: {},
		open: {},
		close: {},
		die: {},
		run: {},
		log: {}
	},
	
	assertions: {
		carried: {},
		held: {},
		here: {},
		inscope: {},
		visible: {},
		at: {},
		thingat: {},
		near: {},
		has: {},
		hasany: {},
		hasall: {},
		taghere: {},
		isthing: {},
		isroom: {},
		contains: {},
		cansee: {},
		is: {},
		eq: {},
		gt: {},
		lt: {},
		'continue': {},
		'try': {},
		js: {}
	},
	
	iterators: {
		all: {},
		sequence: {},
		'select': {}
	},
	
	listers: {
		carried: {},
		things: {},
		rooms: {},
		tagged: {},
		here: {},
		inscope: {},
		'in': {},
		dirs: {},
		these: {}
	},
	
	misc: {
		braced_expressions: {},
		variable_references: {},
		property_references: {}
	},
	
	articles: {
		a: {},
		an: {},
		the: {},
		your: {}
	},
	
	pronoun_references: {
		'nom': {},
		'obj': {},
		'pos': {},
		'ind': {},
		'ref': {}
	}

};

